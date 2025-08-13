import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CreneauDto, EtablissementDto, FicheEnseignantDto, HoraireDTO, JourDto } from '../../../../core/model/models';
import { EmploiDuTempsServiceService } from '../../../../core/services/emploi-du-temps-service.service';
import { Jour } from '../../../../core/model/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { CaptureService } from '../../../../core/services/capture.service';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
 import domtoimage from 'dom-to-image-more';
import { catchError, finalize, of } from 'rxjs';
import { EtablissementServiceService } from '../../../../core/services/etablissement-service.service';
import { EtablissementServiceUserService } from '../../../../core/services/etablissement-service-user.service';
import { TraductionPipe } from "../../../../core/pipes/traduction.pipe";
import { AuthService } from '../../../../core/services/auth.service';
import { PlanningServiceService } from '../../../../core/services/planning-service.service';

interface HoraireFixe {
  heureDebut: string;
  heureFin: string;
  label: string;
}

interface CelluleEmploi {
  classe?: string;
  matiere?: string;
  creneau?: any;
}

 

@Component({
  selector: 'app-view-emplois-temps-ensignant',
  imports: [CommonModule],
  templateUrl: './view-emplois-temps-ensignant.component.html',
  styleUrl: './view-emplois-temps-ensignant.component.css'
})
export class ViewEmploisTempsEnsignantComponent  implements OnInit {
   @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;
  @ViewChild('bloc') blocRef!: ElementRef;
   
  selectedEnseignant: any = null;
  emploiData: FicheEnseignantDto | null = null;
  loading = false;
  error: string | null = null;
  isGeneratingPdf = false;
  etablissementId = 0;
  etablissement!: EtablissementDto; 
  ipserveur: string = '';
  nombrejoursfaist : number= 0;
  heureDue : string= '0h';

    apiUrl= "http://localhost:8080";
  
// Nom de l'établissement, peut être dynamique plus tard
  
  // Horaires fixes comme dans l'image
  horairesFixes: HoraireDTO[] = [
    // { heureDebut: '07:30', heureFin: '08:20', label: '07:30-08:20' },
    // { heureDebut: '08:20', heureFin: '09:10', label: '08:20-09:10' },
    // { heureDebut: '09:10', heureFin: '10:00', label: '09:10-10:00' },
    // { heureDebut: '10:00', heureFin: '10:50', label: '10:00-10:50' },
    // { heureDebut: '10:50', heureFin: '11:40', label: '10:50-11:40' },
    // { heureDebut: '11:40', heureFin: '12:30', label: '11:40-12:30' },
    // { heureDebut: '12:30', heureFin: '13:20', label: '12:30-13:20' },
    // { heureDebut: '13:20', heureFin: '14:10', label: '13:20-14:10' },
    // { heureDebut: '14:10', heureFin: '15:00', label: '14:10-15:00' },
    // { heureDebut: '15:00', heureFin: '15:50', label: '15:00-15:50' }
  ];

  // Jours de la semaine
  // jours = [Jour.LUNDI, Jour.MARDI, Jour.MERCREDI, Jour.JEUDI, Jour.VENDREDI];
   jours:JourDto[] = [ ];
  
  // Labels pour l'affichage
  private joursLabels: Record<string, string> = {
    'LUNDI': 'lundi / Monday',
    'MARDI': 'Mardi/Tuesday',
    'MERCREDI': 'Mercredi/Wednesday',
    'JEUDI': 'Jeudi/Thursday',
    'VENDREDI': 'Vendredi/Friday'
  };

  

  // Données statiques - utilisez exactement vos données JSON
 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
   
    private emploitempservice:EmploiDuTempsServiceService ,
    private etablissementserives: EtablissementServiceUserService ,
    private authService: AuthService,
     private planningService :PlanningServiceService
  ) {}

  ngOnInit(): void {

    this.loadingIdEtablisesment();

    this.chargerConfiguration();

     
    // Pour le moment, utiliser les données statiques
    // this.loadStaticData();
this.getEtablissementId();
    // TODO: Décommenter pour utiliser l'API
    // const enseignantId = localStorage.getItem();
   

       
    
  }

  loadingIdEtablisesment(){

  
    this.etablissementId =  this.authService.getIdEtablessement();

         const enseignantIdStr = localStorage.getItem('idEnseignant');
    if (enseignantIdStr) {
    const enseignantId = parseInt(enseignantIdStr, 10);

     this.loadEnseignantById(enseignantId, this.etablissementId);
 
   // Si non défini par getEtablissementId()
 
  } else {
    console.warn("Aucun ID d'enseignant trouvé dans le localStorage.");
    // tu peux rediriger ou afficher un message ici
  }

      
  }

  // private loadStaticData(): void {
  //   // this.emploiData = this.staticData;
  //   this.selectedEnseignant = this.staticData.enseignant;
  //   console.log('Données enseignant chargées:', this.emploiData);
  // }

  // TODO: Méthode pour charger depuis l'API (à décommenter plus tard)
  private loadEnseignantById(enseignantId: number, idEtablissementId: number): void {
    this.loading = true;
    this.error = null;

    // Appel API pour récupérer l'emploi du temps de l'enseignant
    this.emploitempservice.genererFicheEnseignant(enseignantId,idEtablissementId)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement de l\'enseignant:', error);
          this.error = 'Erreur lors du chargement des données enseignant';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(data => {
        if (data) {
          this.emploiData = data;
     this.nombrejoursfaist = data.emploiDuTemps
  ? data.emploiDuTemps
      .map(jour => jour.creneaux?.length ?? 0)
      .reduce((acc, val) => acc + val, 0)
  : 0;
          this.selectedEnseignant = data.enseignant;
          if(data.enseignant?.idEtablissement == 5 && (data.enseignant?.grade === "PLET" || data.enseignant?.grade === "PLETP" || data.enseignant?.grade === "PLEG" ) ){
              this.heureDue = '18h';
          }else if(data.enseignant?.idEtablissement == 5 && (data.enseignant?.grade == 'PCET'|| data.enseignant?.grade == 'PCETP' || data.enseignant?.grade == 'PCEG' )){
            this.heureDue = '20h';

            }else if(data.enseignant?.idEtablissement == 5 && (data.enseignant?.grade == 'IETP'|| data.enseignant?.grade == 'IET')){
            this.heureDue = '22h';
          }else{
             this.heureDue = data.statistiques?.heuresDue || '0h' ;
          }
          
          this.getEtablissementId();
          console.log('Données enseignant chargées:', this.emploiData);
         console.log('lastSelectedEnseignantId',   this.selectedEnseignant);
          localStorage.setItem('lastSelectedEnseignantId', enseignantId.toString());
        }
      });
  }

  // Obtenir le contenu d'une cellule pour un horaire et un jour donnés
  getCelluleContent(horaire: HoraireDTO, jour: JourDto): CelluleEmploi {
    if (!this.emploiData) return {};

    // Chercher dans l'emploi du temps
    if( !this.emploiData.emploiDuTemps || !this.emploiData.emploiDuTemps.length) return {};
    const jourData = this.emploiData.emploiDuTemps.find(j => j.jour === jour.jour);
    if (!jourData) return {};

    const creneau = jourData.creneaux.find((c: any) => 
      c.heureDebut.startsWith(horaire.heureDebut) && 
      c.heureFin.startsWith(horaire.heureFin)
    );

    if (creneau) {
       
      return {
        
        classe:  creneau.nomClasse ||  'T. D 1', // Utiliser classe du creneau ou valeur par défaut
        matiere: creneau.matiere?.code || 'Maths',
        creneau: creneau
      };
    }

    return {}; // Cellule vide
  }

  // Obtenir le label d'un jour
  getJourLabel(jour: JourDto): string {
    return this.joursLabels[jour.jour] || jour.jour;
  }

  // Obtenir les classes enseignées formatées
  // getClassesEnseignees(): string {
  //   if (!this.emploiData) return '';
  //   if (!this.emploiData.classesTaught || this.emploiData.classesTaught.length === 0) return 'Aucune classe';
  //   return this.emploiData.classesTaught.map(c => c.nom).join(', ');
  // }

getClassesEnseigneesByCycle(): { cycle1: string[], cycle2: string[] } {
  let cycle1: string[] = [];
  let cycle2: string[] = [];

  if (!this.emploiData?.classesTaught) return { cycle1, cycle2 };

  for (let classe of this.emploiData.classesTaught) {
    if (classe.niveau === 'cycle 1') {
      cycle1.push(classe.nom);
    } else if (classe.niveau === 'cycle 2') {
      cycle2.push(classe.nom);
    }
  }

  return { cycle1, cycle2 };
}



  // Obtenir les disciplines formatées
  getDisciplines(): string {
    if (!this.emploiData) return '';
    if (!this.emploiData.matiere || this.emploiData.matiere.length === 0) return 'Aucune matière';
    return this.emploiData.matiere.map(m => m.nom).join(', ');
  }


  // getNombrePeriodes(): string {
  //   if (!this.emploiData.statistiques?.heuresDue) return "0";
  //   return this.emploiData.statistiques?.heuresDue ;
  // }

  // Retourner à la page de gestion
  retourGestion(): void {
    this.router.navigate(['/dashboard/emplois-du-temps']);
  }

  // Recharger les données
  recharger(): void {
   
    // TODO: Remplacer par l'appel API quand activé
    this.getEtablissementId();
  
      this.loadEnseignantById(this.selectedEnseignant.id,  this.etablissementId);
    
  }

  // Méthodes d'export et impression (gardées identiques)
  // async capturer() {
  //   const imageDataUrl = await this.captureService.captureElementAsImage(this.blocRef.nativeElement);
  //   const image = new Image();
  //   image.src = imageDataUrl;
  //   const w = window.open('');
  //   w?.document.write(image.outerHTML);
  //   w?.print();
  // }

  // async captureWithTailwind(): Promise<void> {
  //   const element = this.contentToExport.nativeElement;

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 300));

  //     const dataUrl = await domtoimage.toPng(element, {
  //       style: {
  //         "border": 'none',
  //       },
  //       copyDefaultStyles: true
  //     });

  //     const printWindow = window.open('', '_blank');
  //     if (printWindow) {
  //       printWindow.document.write(`
  //         <html>
  //           <head>
  //             <title>Emploi du temps - ${this.selectedEnseignant?.nomComplet}</title>
  //             <style>
  //               body {
  //                 margin: 0;
  //                 border: none;
  //                 text-align: center;
  //                 background: white;
  //               }
  //               img {
  //                 max-width: 100%;
  //                 height: auto;
  //               }
  //               @media print {
  //                 @page {
  //                   size: A4 landscape;
  //                   margin: 10mm;
  //                 }
  //               }
  //             </style>
  //           </head>
  //           <body>
  //             <img src="${dataUrl}" />
  //             <script>
  //               window.onload = function() {
  //                 setTimeout(() => {
  //                   window.print();
  //                   window.close();
  //                 }, 500);
  //               }
  //             </script>
  //           </body>
  //         </html>
  //       `);
  //     }
  //   } catch (err) {
  //     console.error("Erreur de capture :", err);
  //     alert("Échec de la capture. Veuillez réessayer.");
  //   }
  // }

  // async captureToPDF(): Promise<void> {
  //   const element = this.contentToExport.nativeElement;

  //   try {
  //    const dataUrl = await domtoimage.toPng(element);

  //     const pdf = new jsPDF('landscape', 'mm', 'a4');
  //     const imgProps = pdf.getImageProperties(dataUrl);
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //     pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save(`emploi_${this.selectedEnseignant?.nomComplet}.pdf`);
  //   } catch (err) {
  //     console.error("Erreur PDF :", err);
  //     alert("Erreur lors de l'export PDF.");
  //   }
  // }


   async exporterEmploi(): Promise<void> {
    if (!this.selectedEnseignant) {
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

isLigneVide(horaire: HoraireDTO): boolean {
  return this.jours.every(jour => {
    const cellule = this.getCelluleContent(horaire, jour);
    return (!cellule.classe && !cellule.matiere);
  });
}


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
       
        fontSize: '12px', // Taille fixe pour éviter les variations
        lineHeight: '1.5'
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
      title: `Emploi du temps - ${this.selectedEnseignant!.nomComplet}`,
      subject: 'Emploi du temps scolaire',
      author: 'Lycée Bilingue de Bojongo',
      creator: 'Système de gestion scolaire',
      keywords: 'emploi du temps, scolaire, ' + this.selectedEnseignant!.nomComplet
    });
    
    // Télécharger le PDF
    const fileName = `emploi-temps-${this.selectedEnseignant!.nomComplet.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  }


  getEtablissementId(){


    // Récupérer l'ID de l'établissement depuis le service
    this.etablissementserives.getEtablissementParId(this.authService.getIdEtablessement())
      .subscribe(
        (etablissement: EtablissementDto) => {
          this.etablissement = etablissement;
          console.log('Établissement chargé:', this.etablissement);
        },
        (error) => {
          console.error('Erreur lors du chargement de l\'établissement:', error);
        }
      );
  }
    

getLogoUrl(): string {
  if (this.etablissement && this.etablissement.logo) {
    return `http://localhost:8080/${this.etablissement.logo}`;
  } else {
    return 'assets/img/logo-default.png'; // met ton image par défaut ici
  }
}

get nomEtablissement(): string {
  return this.etablissement?.nom ?? 'LYCÉE BILINGUE DE BOJONGO DOUALA IV';
}


get nomANGEtablissement(): string {
  return this.etablissement?.nomEn ?? 'GBHS OF BOJONGO DOUALA IV';
}

get telephoneEtablissement(): string {
  return this.etablissement?.telephone ?? '233 39 26 04';
}

get codePostalEtablissement(): string {
  return this.etablissement?.codePostal ?? 'BP 9184';
}





  private chargerConfiguration(): void {
    this.loading = true;
    this.error = null;

    // Charger les jours et horaires en parallèle
    this.planningService.getJoursParEtablissement(this.authService.getIdEtablessement())
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

    this.planningService.getHorairesParEtablissement(this.authService.getIdEtablessement())
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