import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClasseDto, CreneauDto, EtablissementDto, HoraireDTO, JourDto } from '../../../../core/model/models';
import { Jour } from '../../../../core/model/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClasseServiceService } from '../../../../core/services/classe-service.service';
import { CreneauServiceService } from '../../../../core/services/creneau-service.service';
import { EmploiDuTempsServiceService } from '../../../../core/services/emploi-du-temps-service.service';
import { catchError, finalize, of } from 'rxjs';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
 import domtoimage from 'dom-to-image-more';
import { CaptureService } from '../../../../core/services/capture.service';
import { PlanningServiceService } from '../../../../core/services/planning-service.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EtablissementServiceUserService } from '../../../../core/services/etablissement-service-user.service';

interface HoraireFixe {
  heureDebut: string;
  heureFin: string;
  label: string;
}

interface CelluleEmploi {
  discipline?: string;
  enseignant?: string;
  creneau?: CreneauDto;
}

 

@Component({
  selector: 'app-view-emplois-temps-salle',
  imports: [CommonModule],
  templateUrl: './view-emplois-temps-salle.component.html',
  styleUrl: './view-emplois-temps-salle.component.css'
})
export class ViewEmploisTempsSalleComponent implements OnInit {

  //  @ViewChild('contentToExport') contentToExport!: ElementRef;
   @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;
   
  selectedClasse: ClasseDto | null = null;
  creneaux: CreneauDto[] = [];
  loading = false;
  error: string | null = null;
   isGeneratingPdf = false;
  logoParDefaut='/img/logoEcole.png';
   apiUrl= "http://localhost:8080";
 
  
  // Horaires fixes comme dans l'image
  horairesFixes: HoraireDTO[] = [];


  //   horairesFixes: HoraireFixe[] = [
  //   { heureDebut: '07:30', heureFin: '08:20', label: '07:30-08:20' },
  //   { heureDebut: '08:20', heureFin: '09:10', label: '08:20-09:10' },
  //   { heureDebut: '09:10', heureFin: '10:00', label: '09:10-10:00' },
  //   { heureDebut: '10:00', heureFin: '10:50', label: '10:00-10:50' },
  //   { heureDebut: '10:50', heureFin: '11:40', label: '10:50-11:40' },
  //   { heureDebut: '12:30', heureFin: '13:20', label: '12:30-13:20' },
  //   { heureDebut: '13:20', heureFin: '14:10', label: '13:20-14:10' },
  //   { heureDebut: '14:10', heureFin: '15:00', label: '14:10-15:00' },
  //   { heureDebut: '15:00', heureFin: '15:50', label: '15:00-15:50' }
  // ];

  // Jours de la semaine
  // jours = [Jour.LUNDI, Jour.MARDI, Jour.MERCREDI, Jour.JEUDI, Jour.VENDREDI];
    jours: JourDto[] = [];

    etablissement:EtablissementDto|null = null;
  
  // Labels pour l'affichage
  private joursLabels: Record<string, string> = {
     [Jour.LUNDI]: 'Lundi',
  [Jour.MARDI]: 'Mardi',
  [Jour.MERCREDI]: 'Mercredi',
  [Jour.JEUDI]: 'Jeudi',
  [Jour.VENDREDI]: 'Vendredi',
  [Jour.SAMEDI]: 'Samedi',
  [Jour.DIMANCHE]: 'Dimanche'
};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classeService: ClasseServiceService,
    private creneauService: CreneauServiceService,
    private emploiDuTempsService: EmploiDuTempsServiceService,
    private captureService: CaptureService,
    private planningService :PlanningServiceService,
    private authservice :AuthService ,
    private etablissementService:EtablissementServiceUserService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la classe depuis les paramètres
    const classeId = localStorage.getItem("idClasse");
    this.chargerConfiguration();
    if (classeId) {
      this.loadClasseById(parseInt(classeId));
      
    } else {
      // Fallback: récupérer depuis le localStorage la dernière classe sélectionnée
      const lastSelectedClasseId = localStorage.getItem('lastSelectedClasseId');
      if (lastSelectedClasseId) {
        this.loadClasseById(parseInt(lastSelectedClasseId));
      } else {
        this.error = 'Aucune classe sélectionnée';
      }
    }


this.loadEtablissement();

   // Appel du tri au démarrage
  }

  private loadClasseById(classeId: number): void {
      // console.error('Erreur lors du chargement de la classe:');
    this.loading = true;
    this.error = null;

    this.classeService.getClasseById(classeId)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement de la classe:', error);
          this.error = 'Erreur lors du chargement de la classe';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(classe => {
        if (classe) {
          this.selectedClasse = classe;
          console.log('Classe chargée:', this.selectedClasse);
          // Sauvegarder l'ID dans le localStorage pour les prochaines visites
          localStorage.setItem('lastSelectedClasseId', classeId.toString());
          this.loadCreneauxForClasse();
        }
      });
  }

  private loadCreneauxForClasse(): void {
    if (!this.selectedClasse) return;
    
    this.loading = true;
    this.error = null;
  const idEmpl = this.route.snapshot.queryParamMap.get('id_emploisTemps');
if (!idEmpl) {
  // idEmpl n'existe pas, on arrête ici ou gérer l'erreur
  return;
}
// Si on arrive ici, idEmpl existe et on peut appeler le service
this.emploiDuTempsService.getEmploiDuTempsClasse(parseInt(idEmpl))
      .pipe(
        catchError(error => {
          console.warn('Emploi du temps non trouvé, chargement des créneaux individuels:', error);
          // Fallback: charger les créneaux individuels
          return this.creneauService.getCreneauxByClasse(this.selectedClasse!.id);
        }),
        catchError(error => {
          console.error('Erreur lors du chargement des créneaux:', error);
          this.error = 'Erreur lors du chargement de l\'emploi du temps';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
        console.log('créneaux chargée:',  result);
        if (Array.isArray(result)) {
          // Résultat des créneaux individuels
          this.creneaux = result;
             console.log('créneaux chargée:',  this.creneaux);
        } else {
          // Résultat de l'emploi du temps complet
          this.creneaux = result.creneaux || [];
            console.log('créneaux chargées:',  this.creneaux);
        }
      });
  }

  // Obtenir le contenu d'une cellule pour un horaire et un jour donnés
  getCelluleContent(horaire: HoraireDTO, jour: JourDto): CelluleEmploi {
    const creneau = this.creneaux.find(c => 
     c.jourSemaine === jour.jour && 
     c.heureDebut?.startsWith(horaire.heureDebut ?? '') &&
    c.heureFin?.startsWith(horaire.heureFin ?? '')
    );

    if (creneau) {
      let enseignantNom = creneau.enseignant?.nomComplet || '';
    if (enseignantNom) {
      enseignantNom = enseignantNom.trim().split(/\s+/)[0]; // Prend le premier mot
    }
      return {
        discipline: creneau.matiere?.code || '',
        enseignant: enseignantNom,
        creneau: creneau
      };
    }

    return {}; // Cellule vide
  }

  // Obtenir le label d'un jour
getJourLabel(jourDto: JourDto): string {
  if (!jourDto.jour) return 'Inconnu';
  return this.joursLabels[jourDto.jour] ?? jourDto.jour;
}

  // Retourner à la page de gestion
   retourGestion(): void {
    this.router.navigate(['/dashboard/emplois-du-temps']);
  }
  // // Exporter l'emploi du temps (fonction à implémenter)
  // exporterEmploi(): void {
  //   if (!this.selectedClasse) {
  //     alert('Aucune classe sélectionnée');
  //     return;
  //   }
    
  //   console.log('Export de l\'emploi du temps pour:', this.selectedClasse.nom);
  //   alert('Fonctionnalité d\'export à implémenter');
  // }

  // // Imprimer l'emploi du temps
  // imprimerEmploi(): void {
  //   window.print();
  // }
 @ViewChild('bloc') blocRef!: ElementRef;
  // Recharger les données
  recharger(): void {
    if (this.selectedClasse) {
      this.loadCreneauxForClasse();
    }
  }

//  // Imprimer l'emploi du temps
//   imprimerEmploi(): void {
//     this.printContent();
//   }

//   // Nouvelle méthode pour capturer et imprimer le contenu
//   async printContent(): Promise<void> {
//     try {
//       const element = this.contentToExport.nativeElement;
      
//       // Capturer le contenu avec html2canvas
//    const canvas = await html2canvas(element, {
//   height: element.scrollHeight,
//   width: element.scrollWidth,
//   useCORS: true,
//   allowTaint: true,
//   background: 'white',
//   onclone: (clonedDoc: Document) => {
//     const style = clonedDoc.createElement('style');
//   style.textContent = `
//     * {
//       all: unset !important;
//       color: #000 !important;
//       background-color: #fff !important;
//       border: 1px solid #000 !important;
//       box-shadow: none !important;
//       filter: none !important;
//       backdrop-filter: none !important;
//     }
//   `;
//     clonedDoc.head.appendChild(style);
//   }
// } as any); // 👈 ICI : on force TypeScript à accepter onclone


//       // Créer une nouvelle fenêtre pour l'impression
//       const printWindow = window.open('', '_blank');
//       if (printWindow) {
//         const imgData = canvas.toDataURL('image/png');
        
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Emploi du temps - ${this.selectedClasse?.nom}</title>
//               <style>
//                 body { 
//                   margin: 0; 
//                   padding: 20px; 
//                   display: flex; 
//                   justify-content: center; 
//                   align-items: center;
//                   min-height: 100vh;
//                 }
//                 img { 
//                   max-width: 100%; 
//                   height: auto; 
//                 }
//                 @media print {
//                   body { padding: 0; }
//                   @page { 
//                     size: A4 landscape; 
//                     margin: 0.5cm; 
//                   }
//                 }
//               </style>
//             </head>
//             <body>
//               <img src="${imgData}" alt="Emploi du temps" />
//             </body>
//           </html>
//         `);
        
//         printWindow.document.close();
        
//         // Attendre que l'image soit chargée puis imprimer
//         printWindow.onload = () => {
//           setTimeout(() => {
//             printWindow.print();
//             printWindow.close();
//           }, 500);
//         };
//       }
//     } catch (error) {
//       console.error('Erreur lors de l\'impression:', error);
//       alert('Erreur lors de l\'impression. Veuillez réessayer.');
//     }
//   }

//   // Nouvelle méthode pour exporter en PDF
//   async exporterEmploi(): Promise<void> {
//     try {
//       const element = this.contentToExport.nativeElement;
      
//       // Capturer le contenu avec html2canvas
//    const canvas = await html2canvas(element, {
//   height: element.scrollHeight,
//   width: element.scrollWidth,
//   useCORS: true,
//   allowTaint: true,
//   background: 'white',
//   onclone: (clonedDoc: Document) => {
//     const style = clonedDoc.createElement('style');
  
//     style.textContent = `
//     * {
//       all: unset !important;
//       color: #000 !important;
//       background-color: #fff !important;
//       border: 1px solid #000 !important;
//       box-shadow: none !important;
//       filter: none !important;
//       backdrop-filter: none !important;
//     }
//   `;
//     clonedDoc.head.appendChild(style);
//   }
// } as any); // 👈 ICI AUSSI


//       const imgData = canvas.toDataURL('image/png');
      
//       // Créer le PDF en format paysage A4
//       const pdf = new jsPDF('landscape', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
      
//       // Calculer les dimensions pour ajuster l'image
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
//       const finalWidth = imgWidth * ratio;
//       const finalHeight = imgHeight * ratio;
      
//       // Centrer l'image dans le PDF
//       const x = (pdfWidth - finalWidth) / 2;
//       const y = (pdfHeight - finalHeight) / 2;
      
//       pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
//       // Télécharger le PDF
//       const fileName = `emploi_du_temps_${this.selectedClasse?.nom?.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
//       pdf.save(fileName);
      
//     } catch (error) {
//       console.error('Erreur lors de l\'export PDF:', error);
//       alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
//     }
//   }

//   // Méthode pour exporter en image PNG
//   async exporterImage(): Promise<void> {
//     try {
//       const element = this.contentToExport.nativeElement;
      
//      const canvas = await html2canvas(element, {
//   height: element.scrollHeight,
//   width: element.scrollWidth,
//   useCORS: true,
//   allowTaint: true,
//   background: 'white',
//   onclone: (clonedDoc: Document) => {
//     const style = clonedDoc.createElement('style');
//     style.textContent = `
//       * {
//         color: #000000 !important;
//         background-color: #ffffff !important;
//         border-color: #000000 !important;
//       }
//       .bg-gray-100, .bg-gray-50, .bg-gray-200 {
//         background-color: #f5f5f5 !important;
//       }
//       .bg-black, .text-white {
//         background-color: #000000 !important;
//         color: #ffffff !important;
//       }
//       table, th, td, div {
//         border-color: #000000 !important;
//       }
//       .border, .border-black, .border-2 {
//         border-color: #000000 !important;
//       }
//       * {
//         box-shadow: none !important;
//         filter: none !important;
//         backdrop-filter: none !important;
//       }
//     `;
//     clonedDoc.head.appendChild(style);
//   }
// } as any); // 👉 Ceci force TypeScript à ignorer l'erreur


//       // Créer un lien de téléchargement
//       const link = document.createElement('a');
//       link.download = `emploi_du_temps_${this.selectedClasse?.nom?.replace(/\s+/g, '_')}_${new Date().getFullYear()}.png`;
//       link.href = canvas.toDataURL('image/png');
//       link.click();
      
//     } catch (error) {
//       console.error('Erreur lors de l\'export image:', error);
//       alert('Erreur lors de l\'export image. Veuillez réessayer.');
//     }
//   }

async capturer() {
    const imageDataUrl = await this.captureService.captureElementAsImage(this.blocRef.nativeElement);

    // Afficher ou imprimer
    const image = new Image();
    image.src = imageDataUrl;
    const w = window.open('');
    w?.document.write(image.outerHTML);
    w?.print();
  }


async captureWithTailwind(): Promise<void> {
  const element = this.contentToExport.nativeElement;

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // attendre que tout s'affiche

    const dataUrl = await domtoimage.toPng(element, {
      style: {
        "border": 'none', // ne force aucun style
      }, // ne force aucun style
      copyDefaultStyles: true // 👈 capture les styles appliqués dynamiquement (comme ceux de Tailwind)
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression fidèle</title>
            <style>
              body {
                margin: 0;
                bordrer: none;
                text-align: center;
                background: white;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 10mm;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
    }
  } catch (err) {
    console.error("Erreur de capture avec styles Tailwind :", err);
    alert("Échec de la capture fidèle. Vérifie la visibilité du bloc.");
  }
}


async captureToPDF(): Promise<void> {
  const element = this.contentToExport.nativeElement;

  try {
    const dataUrl = await domtoimage.toPng(element);

    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`emploi_${this.selectedClasse?.nom}.pdf`);
  } catch (err) {
    console.error("Erreur PDF :", err);
    alert("Erreur lors de l'export PDF.");
  }
}



  private chargerConfiguration(): void {
    this.loading = true;
    this.error = null;

    // Charger les jours et horaires en parallèle
    this.planningService.getJoursParEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des jours:', error);
          
          return of([]);
        })
      )
      .subscribe(jours => {
        this.jours = jours;
        this.trierJours()
        console.log('Jours chargés:', this.jours);
      });

    this.planningService.getHorairesParEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des horaires:', error);
          
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(horaires => {
        this.horairesFixes = horaires.sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
       this.trierHoraires()
        console.log('Horaires chargés:', this.horairesFixes);
      });
  }


 /**
   * Exporte l'emploi du temps en PDF haute qualité
   * Utilise html-to-image pour capturer le DOM puis jsPDF pour générer le PDF
   */
  // async exporterEmploi(): Promise<void> {
  //   if (!this.selectedClasse) {
  //     alert('Aucune classe sélectionnée');
  //     return;
  //   }
    
  //   this.isGeneratingPdf = true;
    
  //   try {
  //     await this.generatePdfFromHtml();
  //   } catch (error) {
  //     console.error('Erreur génération PDF:', error);
  //     alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  //   } finally {
  //     this.isGeneratingPdf = false;
  //   }
  // }

  /**
   * Génère le PDF à partir du HTML avec html-to-image + jsPDF
   */
  // private async generatePdfFromHtml(): Promise<void> {
  //   const element = document.getElementById('emploi-temps-printable');
  //   if (!element) {
  //     throw new Error('Élément à capturer non trouvé');
  //   }

  //   // Configuration optimisée pour Tailwind 4 et qualité maximale
  //   const dataUrl = await toPng(element, {
  //     quality: 1.0,
  //     pixelRatio: 2, // Haute résolution sans être trop lourd
  //     backgroundColor: 'white',
  //     width: 1200,   // Largeur fixe pour consistance
  //     height: 850,   // Hauteur calculée pour A4 paysage
  //     skipFonts: true,
  //     useCORS: true,
  //     style: {
  //       transform: 'scale(1)',
  //       transformOrigin: 'top left',
  //       fontFamily: '"Times New Roman", serif' // Force la police
  //     },
  //     filter: (node) => {
  //       // Exclure les boutons d'action de la capture
  //       if (node.classList?.contains('no-print')) {
  //         return false;
  //       }
  //       return true;
  //     }
  //   });

  //   // Création du PDF A4 paysage optimisé
  //   const pdf = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'mm',
  //     format: 'a4',
  //     compress: true // Compression pour réduire la taille
  //   });
    
  //   // Dimensions A4 paysage : 297mm x 210mm
  //   const pdfWidth = 297;
  //   const pdfHeight = 210;
    
  //   // Marges
  //   const margin = 5;
  //   const imgWidth = pdfWidth - (margin * 2);
  //   const imgHeight = pdfHeight - (margin * 2);
    
  //   // Ajouter l'image capturée au PDF
  //   pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight, '', 'FAST');
    
  //   // Métadonnées du PDF
  //   pdf.setProperties({
  //     title: `Emploi du temps - ${this.selectedClasse!.nom || 'Classe'}`,
  //     subject: 'Emploi du temps scolaire',
  //     author: 'Lycée Bilingue de Bojongo',
  //     creator: 'Système de gestion scolaire'
  //   });
    
  //   // Télécharger le PDF
  //   const fileName = `emploi-temps-${this.selectedClasse!.nom.replace(/\s+/g, '-')}.pdf`;
  //   pdf.save(fileName);
  // }

  /**
   * Imprime l'emploi du temps
   * Génère d'abord le PDF puis l'ouvre pour impression
   */
  // async imprimerEmploi(): Promise<void> {
  //   if (!this.selectedClasse) {
  //     alert('Aucune classe sélectionnée');
  //     return;
  //   }
    
  //   this.isGeneratingPdf = true;
    
  //   try {
  //     await this.generatePdfFromHtml();
  //   } catch (error) {
  //     console.error('Erreur impression PDF:', error);
  //     alert('Erreur lors de la préparation de l\'impression');
  //   } finally {
  //     this.isGeneratingPdf = false;
  //   }
  // }
  
  /**
   * Génère le PDF et l'ouvre dans un nouvel onglet pour impression
   */
   /**
   * Génère le PDF à partir du HTML avec html-to-image + jsPDF
   */
  // private async generatePdfFromHtml(): Promise<void> {
  //   const element = document.getElementById('emploi-temps-printable');
  //   if (!element) {
  //     throw new Error('Élément à capturer non trouvé');
  //   }

  //   // Configuration optimisée pour Tailwind 4 et qualité maximale
  //   const dataUrl = await toPng(element, {
  //     quality: 1.0,
  //     pixelRatio: 2, // Haute résolution sans être trop lourd
  //     backgroundColor: 'white',
  //     width: 1200,   // Largeur fixe pour consistance
  //     height: 850,   // Hauteur calculée pour A4 paysage
  //     skipFonts: true, // Ignorer les polices externes pour éviter les erreurs CORS
  //         // Activer CORS pour les images
  //     style: {
  //       transform: 'scale(1)',
  //       transformOrigin: 'top left',
  //       fontFamily: '"Times New Roman", serif', // Force la police système
         
  //     },
  //     filter: (node) => {
  //       // Exclure les boutons d'action de la capture
  //       if (node.classList?.contains('no-print')) {
  //         return false;
  //       }
  //       // Exclure les éléments avec des polices externes problématiques
  //       if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
  //         return false;
  //       }
  //       return true;
  //     }
  //   });

  //   // Création du PDF A4 paysage optimisé
  //   const pdf = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'mm',
  //     format: 'a4',
  //     compress: true // Compression pour réduire la taille
  //   });
    
  //   // Dimensions A4 paysage : 297mm x 210mm
  //   const pdfWidth = 297;
  //   const pdfHeight = 210;
    
  //   // Marges
  //   const margin = 5;
  //   const imgWidth = pdfWidth - (margin * 2);
  //   const imgHeight = pdfHeight - (margin * 2);
    
  //   // Ajouter l'image capturée au PDF
  //   pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidth, imgHeight, '', 'FAST');
    
  //   // Métadonnées du PDF
  //   pdf.setProperties({
  //     title: `Emploi du temps - ${this.selectedClasse!.nom}`,
  //     subject: 'Emploi du temps scolaire',
  //     author: 'Lycée Bilingue de Bojongo',
  //     creator: 'Système de gestion scolaire'
  //   });
    
  //   // Télécharger le PDF
  //   const fileName = `emploi-temps-${this.selectedClasse!.nom.replace(/\s+/g, '-')}.pdf`;
  //   pdf.save(fileName);
  // }

    // Créer le PDF
    //   pdf = new jsPDF({
    //   orientation: 'landscape',
    //   unit: 'mm',
    //   format: 'a4'
    // });
    
    // pdf.addImage(dataUrl, 'PNG', 5, 5, 287, 200, '', 'FAST');
    
    // // Ouvrir le PDF dans un nouvel onglet pour impression
    // const pdfBlob = pdf.output('blob');
    // const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // const printWindow = window.open(pdfUrl, '_blank');
    // if (printWindow) {
    //   printWindow.onload = () => {
    //     printWindow.print();
    //   };
    
  

 










  /**
   * Exporte l'emploi du temps en PDF haute qualité
   * Utilise html-to-image pour capturer le DOM puis jsPDF pour générer le PDF
   */
  async exporterEmploi(): Promise<void> {
    if (!this.selectedClasse) {
      alert('Aucune classe sélectionnée');
      return;
    }
    
    this.isGeneratingPdf = true;
    
    try {
      await this.generatePdfFromHtml();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      this.isGeneratingPdf = false;
    }
  }

  /**
   * Génère le PDF à partir du HTML avec html-to-image + jsPDF
   */
  private async generatePdfFromHtml(): Promise<void> {
    const element = document.getElementById('emploi-temps-printable');
    if (!element) {
      throw new Error('Élément à capturer non trouvé');
    }

    // Configuration optimisée pour compatibilité Word
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 5, // Résolution optimisée pour Word
      backgroundColor: 'white',
      width: 1200,   // Largeur fixe pour consistance
      height: 850,   // Hauteur calculée pour A4 paysage
      skipFonts: true, // Ignorer les polices externes pour éviter les erreurs CORS
       // Activer CORS pour les images
      canvasWidth: 1200,
      canvasHeight: 850,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        fontFamily: '"Times New Roman", serif', // Force la police système
       
        fontSize: '13px', // Taille fixe pour éviter les variations
        lineHeight: '1.1'
      },
      filter: (node) => {
        // Exclure les boutons d'action de la capture
        if (node.classList?.contains('no-print')) {
          return false;
        }
        // Exclure les éléments avec des polices externes problématiques
        if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
          return false;
        }
        return true;
      }
    });

    // Création du PDF A4 paysage optimisé pour Word
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: false, // Pas de compression pour Word
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    // Dimensions A4 paysage optimisées pour Word
    const pdfWidth = 297;
    const pdfHeight = 210;
    
    // Marges plus importantes pour Word
    const margin = 6;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = pdfHeight - (margin * 2);
    
    // Calculer les dimensions pour maintenir le ratio
    const imgRatio = 1200 / 850;
    const pdfRatio = imgWidth / imgHeight;
    
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    if (imgRatio > pdfRatio) {
      finalHeight = imgWidth / imgRatio;
    } else {
      finalWidth = imgHeight * imgRatio;
    }
    
    // Centrer l'image
    const x = margin + (imgWidth - finalWidth) / 2;
    const y = margin + (imgHeight - finalHeight) / 2;
    
    // Ajouter l'image avec qualité maximale pour Word
    pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight, '', 'SLOW');
    
    // Métadonnées complètes pour Word
    pdf.setProperties({
      title: `Emploi du temps - ${this.selectedClasse!.nom}`,
      subject: 'Emploi du temps scolaire',
      author: 'Lycée Bilingue de Bojongo',
      creator: 'Système de gestion scolaire',
      keywords: 'emploi du temps, scolaire, ' + this.selectedClasse!.nom
    });
    
    // Télécharger le PDF
    const fileName = `emploi-temps-${this.selectedClasse!.nom.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Imprime l'emploi du temps
   * Génère d'abord le PDF puis l'ouvre pour impression
   */
  async imprimerEmploi(): Promise<void> {
    if (!this.selectedClasse) {
      alert('Aucune classe sélectionnée');
      return;
    }
    
    this.isGeneratingPdf = true;
    
    try {
      await this.generatePdfForPrint();
    } catch (error) {
      console.error('Erreur impression PDF:', error);
      alert('Erreur lors de la préparation de l\'impression');
    } finally {
      this.isGeneratingPdf = false;
    }
  }
  
  /**
   * Génère le PDF et l'ouvre dans un nouvel onglet pour impression
   */
  private async generatePdfForPrint(): Promise<void> {
    const element = document.getElementById('emploi-temps-printable');
    if (!element) {
      throw new Error('Élément à imprimer non trouvé');
    }

    // Même configuration que pour l'export
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'white',
      width: 1200,
      height: 850,
      skipFonts: true,
      // useCORS: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        fontFamily: '"Times New Roman", serif',
        // fontDisplay: 'swap'
      },
      filter: (node) => {
        if (node.classList?.contains('no-print')) return false;
        if (node.tagName === 'LINK' && node.getAttribute('href')?.includes('fonts.googleapis.com')) {
          return false;
        }
        return true;
      }
    });
  }

    // Créer le PDF
     pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // pdf.addImage(dataUrl, 'PNG', 5, 5, 287, 200, '', 'FAST');
    
    // // Ouvrir le PDF dans un nouvel onglet pour impression
    // const pdfBlob = pdf.output('blob');
    // const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // const printWindow = window.open(pdfUrl, '_blank');
    // if (printWindow) {
    //   printWindow.onload = () => {
    //     printWindow.print();
    //   };
    // }






isLigneVide(horaire: HoraireDTO): boolean {
  return this.jours.every(jour => {
    const cellule = this.getCelluleContent(horaire, jour);
    return (!cellule.discipline && !cellule.enseignant);
  });
}



trierJours() {
  const ordreJours: Jour[] = [
    Jour.LUNDI,
    Jour.MARDI,
    Jour.MERCREDI,
    Jour.JEUDI,
    Jour.VENDREDI,
    Jour.SAMEDI,
    Jour.DIMANCHE
  ];
    console.log('🔍 Avant tri :');
    this.jours.forEach(j => console.log(j.jour));

    this.jours = this.jours
      .filter(j => j.jour !== undefined) // on enlève ceux sans jour
      .sort((a, b) => ordreJours.indexOf(a.jour!) - ordreJours.indexOf(b.jour!));

    console.log('✅ Après tri :');
    this.jours.forEach(j => console.log(j.jour));
}






// async exportAsPDF() {
//     const element = this.contentToExport.nativeElement;
    
  
    
//     // Options configurées correctement (sans le type Html2Canvas.Options)
//     const options = {
//       scale: 3,
//       windowWidth: 1200,
//       scrollX: 0,
//       scrollY: 0,
//       useCORS: true,
//       allowTaint: true,
//       logging: false,
//       backgroundColor: '#FFFFFF'
//     } as const; // 'as const' pour le typage littéral

//     try {
//       const canvas = await html2canvas(element, options);
//       const imgData = canvas.toDataURL('image/png');
      
//       // Format paysage A4
//       const pdf = new jsPDF({
//         orientation: 'landscape',
//         unit: 'mm',
//         format: 'a4'
//       });
      
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();
      
//       // Calcul des dimensions
//       const imgWidth = pageWidth;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
//       // Ajustement si l'image est trop haute
//       if (imgHeight > pageHeight) {
//         const ratio = pageHeight / imgHeight;
//         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, pageHeight);
//       } else {
//         pdf.addImage(imgData, 'PNG', 0, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
//       }
      
//       pdf.save('export_paysage.pdf');
      
//     } catch (error) {
//       console.error('Erreur lors de l\'export PDF:', error);
//     }
//   }

//   async printContent() {
//   const element = this.contentToExport.nativeElement;
//   const originalContents = document.body.innerHTML;
  
//   // Options sans type spécifique (le typage est automatique)
//   const options = {
//     scale: 2,
//     useCORS: true,
//     allowTaint: true,
//     backgroundColor: '#FFFFFF',
//     logging: false, // Ajout recommandé
//     windowWidth: element.scrollWidth // Pour le contenu large
//   };

//   try {
//     // Avant d'appeler html2canvas
// document.querySelectorAll('*').forEach(el => {
//   const styles = window.getComputedStyle(el);
//   if (styles.color.includes('oklch') || styles.backgroundColor.includes('oklch')) {
//     (el as HTMLElement).style.color = '#000000'; // Couleur de remplacement
//     (el as HTMLElement).style.backgroundColor = '#FFFFFF';
//   }
// });
//     const canvas = await html2canvas(element, options);
//       const printWindow = window.open('', '_blank');
      
//       if (printWindow) {
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Impression</title>
//               <style>
//                 body { margin: 0; padding: 0; }
//                 img { 
//                   max-width: 100%; 
//                   height: auto;
//                   display: block;
//                   margin: 0 auto;
//                 }
//                 @page {
//                   size: auto;
//                   margin: 0;
//                 }
//               </style>
//             </head>
//             <body>
//               <img src="${canvas.toDataURL('image/png')}">
//             </body>
//           </html>
//         `);
        
//         printWindow.document.close();
//         printWindow.focus();
        
//         // Attendre que l'image soit chargée
//         printWindow.onload = () => {
//           setTimeout(() => {
//             printWindow.print();
//             printWindow.close();
//           }, 300);
//         };
//       }
//     } catch (error) {
//       console.error('Erreur lors de l\'impression:', error);
//       document.body.innerHTML = originalContents;
//     }
//   }


//  async exportAsPDF() {
//     const element = this.contentToExport.nativeElement;
    
//     // Options pour html2canvas (ajustez selon vos besoins)
//     const options = {
//       scale: 2, // Augmente la qualité
//       logging: false,
//       useCORS: true,
//       allowTaint: true
//     };

//     try {
//       // 1. Capture du HTML en canvas
//       const canvas = await html2canvas(element, options);
      
//       // 2. Conversion en image
//       const imgData = canvas.toDataURL('image/png');
      
//       // 3. Création du PDF
//       const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, format A4
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save('export.pdf');
      
//     } catch (error) {
//       console.error('Erreur lors de l\'export PDF:', error);
//     }
//   }

 


  //   selectedClasse: ClasseDto | null = null;
  // creneaux: CreneauDto[] = [];
  
  // Horaires fixes comme dans l'image
  // horairesFixes: HoraireFixe[] = [
  //   { heureDebut: '07:30', heureFin: '08:20', label: '07:30-08:20' },
  //   { heureDebut: '08:20', heureFin: '09:10', label: '08:20-09:10' },
  //   { heureDebut: '09:10', heureFin: '10:00', label: '09:10-10:00' },
  //   { heureDebut: '10:00', heureFin: '10:50', label: '10:00-10:50' },
  //   { heureDebut: '10:50', heureFin: '11:40', label: '10:50-11:40' },
  //   { heureDebut: '12:30', heureFin: '13:20', label: '12:30-13:20' },
  //   { heureDebut: '13:20', heureFin: '14:10', label: '13:20-14:10' },
  //   { heureDebut: '14:10', heureFin: '15:00', label: '14:10-15:00' },
  //   { heureDebut: '15:00', heureFin: '15:50', label: '15:00-15:50' }
  // ];

  // Jours de la semaine
  // jours = [Jour.LUNDI, Jour.MARDI, Jour.MERCREDI, Jour.JEUDI, Jour.VENDREDI];
  
  // Labels pour l'affichage
  // private joursLabels: Record<string, string> = {
  //   'LUNDI': 'Lundi',
  //   'MARDI': 'Mardi',
  //   'MERCREDI': 'Mercredi',
  //   'JEUDI': 'Jeudi',
  //   'VENDREDI': 'Vendredi'
  // };

  // Données de test
  // classes: ClasseDto[] = this.generateClasses();

  // constructor(
  //   private route: ActivatedRoute,
  //   private router: Router
  // ) {}

  // ngOnInit(): void {
  //   // Récupérer l'ID de la classe depuis les paramètres ou le localStorage
      
  //   const classeId = this.route.snapshot.queryParamMap.get('id_emploisTemps');
  //   if (classeId) {
  //     this.loadClasseById(parseInt(classeId));
  //   } else {
  //     // Fallback: récupérer depuis le localStorage la dernière classe sélectionnée
  //     const lastSelectedClasseId = localStorage.getItem('lastSelectedClasseId');
  //     if (lastSelectedClasseId) {
  //       this.loadClasseById(parseInt(lastSelectedClasseId));
  //     }
  //   }
  // }

  // private loadClasseById(classeId: number): void {
  //   this.selectedClasse = this.classes.find(c => c.id === classeId) || null;
  //   if (this.selectedClasse) {
  //     this.loadCreneauxForClasse();
  //   }
  // }

  // private loadCreneauxForClasse(): void {
  //   if (!this.selectedClasse) return;
    
  //   // Charger les créneaux depuis le localStorage
  //   const stored = localStorage.getItem(`emploi_classe_${this.selectedClasse.id}`);
  //   this.creneaux = stored ? JSON.parse(stored) : [];
  // }

  // Obtenir le contenu d'une cellule pour un horaire et un jour donnés
  // getCelluleContent(horaire: HoraireFixe, jour: Jour): CelluleEmploi {
  //   const creneau = this.creneaux.find(c => 
  //     c.jour === jour && 
  //     c.heureDebut === horaire.heureDebut && 
  //     c.heureFin === horaire.heureFin
  //   );

  //   if (creneau) {
  //     return {
  //       discipline: creneau.matiere.nom,
  //       enseignant: creneau.enseignant.nomComplet,
  //       creneau: creneau
  //     };
  //   }

  //   return {}; // Cellule vide
  // }

  // Obtenir le label d'un jour
  // getJourLabel(jour: Jour): string {
  //   return this.joursLabels[jour] || jour;
  // }

  // Retourner à la page de gestion
  // retourGestion(): void {
  //   this.router.navigate(['/emplois-classe']);
  // }

  // Exporter l'emploi du temps (fonction à implémenter)
  // exporterEmploi(): void {
  //   // Ici vous pourriez implémenter l'export en PDF, Excel, etc.
  //   console.log('Export de l\'emploi du temps pour:', this.selectedClasse?.nom);
  //   alert('Fonctionnalité d\'export à implémenter');
  // }

  // Imprimer l'emploi du temps
  // imprimerEmploi(): void {
  //   window.print();
  // }

  // Génération de données de test
  // private generateClasses(): ClasseDto[] {
  //   const filieres = ['Scientifique', 'Littéraire', 'Technique', 'Économique'];
  //   const niveaux = ['Terminale', 'Première', 'Seconde'];
    
  //   return Array.from({length: 12}, (_, i) => ({
  //     id: i + 1,
  //     nom: `${niveaux[i % 3]} ${String.fromCharCode(65 + (i % 6))}`,
  //     filiere: filieres[i % 4],
  //     niveau: niveaux[i % 3]
  //   }));
  // }


  loadEtablissement(){
    this.etablissementService.getEtablissementParId(this.authservice.getIdEtablessement()).subscribe({
      next:(rep:EtablissementDto)=>{
            this.etablissement =  rep ;
             console.log(rep);
      },
      error:(er)=>{
        console.error(er);
      }
    })
  }


  private trierHoraires(): void {
  if (!this.horairesFixes || this.horairesFixes.length === 0) {
    console.warn('Aucun horaire à trier');
    return;
  }

  // Filtrer les horaires valides avec heureDebut définie
  const horairesValid = this.horairesFixes.filter(h => h.heureDebut);

  // Trier en ordre croissant sur heureDebut (ex: "08:00:00" => 8*60+0 = 480)
  horairesValid.sort((a, b) => {
    const [h1, m1] = a.heureDebut!.split(':').map(Number);
    const [h2, m2] = b.heureDebut!.split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
  });

  // Debug log
  console.log('🕒 Horaires triés :');
  horairesValid.forEach(h => console.log(`→ ${h.heureDebut} - ${h.heureFin} (${h.label})`));

  // Remplacer la liste d’origine triée
  this.horairesFixes = horairesValid;
}


}


