import { Component, OnInit } from '@angular/core';
import { EmploiDuTempsClasseDto, EmploiDuTempsIndividuelDto, EnseignantDto, FicheEnseignantDto } from '../../../../core/model/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmploiDuTempsServiceService } from '../../../../core/services/emploi-du-temps-service.service';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-liste-emplois',
  imports: [CommonModule,FormsModule],
  templateUrl: './liste-emplois.component.html',
  styleUrl: './liste-emplois.component.css'
})
export class ListeEmploisComponent  implements OnInit{

constructor(private router :Router, private authService: AuthService,private emploisTempsService :EmploiDuTempsServiceService) {}

viewEmploitemps(emploi: EmploiDuTempsClasseDto | EnseignantDto) {
  
    if ('classe' in emploi) {
      // C'est un emploi du temps de classe
      localStorage.setItem("idClasse", String(emploi.classe.id));
      localStorage.removeItem("idEnseignant"); // Nettoie si besoin
      this.router.navigate(
      ['dashboard/emplois-du-temps/viewEmploisTempSalle'],
      { queryParams: { id_emploisTemps: emploi.id } }
    );
    } else {
      // C'est un emploi du temps d'enseignant
      localStorage.setItem("idEnseignant", String(emploi.id));
      localStorage.removeItem("idClasse"); // Nettoie si besoin
      this.router.navigate(['dashboard/emplois-du-temps/viewEmploisTempEnseignant']);
    }
  
}

  loading: boolean = false;
  error!: any;
 



  ngOnInit(): void {
    this.loadEmploisTempsClasse();
    this.getAllEmploiEnseignant()

     
  }

  activeTab: 'classes' | 'enseignants' = 'classes';
    
    filtres = {
      annee: '',
      recherche: '',
      filiere: '',
      matiere: ''
    };
  
    annees = ['2023-2024', '2022-2023', '2021-2022'];
    filieres = ['Scientifique', 'Littéraire', 'Technique', 'Professionnelle'];
    matieres = ['Mathématiques', 'Français', 'Physique', 'Histoire'];
  

     emploisClasses!: EmploiDuTempsClasseDto[] ;
    // Données mockées basées sur les DTO
    // emploisClasses: EmploiDuTempsClasseDto[] = [
    //   {
    //     id: 1,
    //     classe: {
    //       id: 1,
    //       nom: 'Terminale A',
    //       filiere: 'Scientifique',
    //       niveau: 'Terminale',
    //       message: '',
    //       code: 200
    //     },
    //     creneaux: [],
    //     message: '',
    //     code: 200
    //   },
    //   {
    //     id: 2,
    //     classe: {
    //       id: 2,
    //       nom: 'Première B',
    //       filiere: 'Littéraire',
    //       niveau: 'Première',
    //       message: '',
    //       code: 200
    //     },
    //     creneaux: [],
    //     message: '',
    //     code: 200
    //   }
    // ];
  
    emploisEnseignants: EnseignantDto[] = [
      // {
      //   id: 1,
      //   enseignant: {
      //     id: 1,
      //     nomComplet: 'M. Diallo',
      //     email: 'diallo@ecole.com',
      //     message: '',
      //     code: 200
      //   },
      //   creneaux: [],
      //   message: '',
      //   code: 200
      // },
      // {
      //   id: 2,
      //   enseignant: {
      //     id: 2,
      //     nomComplet: 'Mme. Traoré',
      //     email: 'traore@ecole.com',
      //     message: '',
      //     code: 200
      //   },
      //   creneaux: [],
      //   message: '',
      //   code: 200
      // }
    ];

   private  isEmploiDuTempsClasseDto(obj: any): obj is EmploiDuTempsClasseDto {
  return obj && typeof obj === 'object' && 'classe' in obj;
}

private isEnseignantDto(obj: any): obj is EnseignantDto {
  return obj && typeof obj === 'object' && 'nomComplet' in obj && !('classe' in obj);
}
  
    // getEmploisActifs(): (EmploiDuTempsClasseDto | EnseignantDto)[] {
    //   const emplois = this.activeTab === 'classes' ? this.emploisClasses : this.emploisEnseignants;
      
    //   return emplois.filter(emploi => {
    //     const annee = 'classe' in emploi ? emploi.classe.nom : emploi.nomComplet;
    //     const filiere = 'classe' in emploi ? emploi.classe.filiere : '';
    //     const matiere = 'enseignant' in emploi ? emploi.nomComplet: '';
  
    //     const matchAnnee = this.filtres.annee ? annee.includes(this.filtres.annee) : true;
    //     const matchFiliere = this.filtres.filiere ? filiere.includes(this.filtres.filiere) : true;
    //     const matchMatiere = this.filtres.matiere ? matiere.includes(this.filtres.matiere) : true;
    //     const matchRecherche = this.filtres.recherche ? 
    //       annee.toLowerCase().includes(this.filtres.recherche.toLowerCase()) : true;
        
    //     return matchAnnee && matchFiliere && matchMatiere && matchRecherche;
    //   });
    // }

    getEmploisActifs(): (EmploiDuTempsClasseDto | EnseignantDto)[] {
  const emplois = this.activeTab === 'classes' ? this.emploisClasses : this.emploisEnseignants;
  
  return emplois.filter(emploi => {
    let annee = '';
    let filiere = '';
    let matiere = '';

    if (this.isEmploiDuTempsClasseDto(emploi)) {
      annee = emploi.classe.nom;
      filiere = emploi.classe.filiere;
    } else if (this.isEnseignantDto(emploi)) {
      annee = emploi.nomComplet; // Ou autre champ pertinent
      matiere = emploi.nomComplet;
    }

    const matchAnnee = this.filtres.annee ? annee.includes(this.filtres.annee) : true;
    const matchFiliere = this.filtres.filiere ? filiere.includes(this.filtres.filiere) : true;
    const matchMatiere = this.filtres.matiere ? matiere.includes(this.filtres.matiere) : true;
    const matchRecherche = this.filtres.recherche ? 
      annee.toLowerCase().includes(this.filtres.recherche.toLowerCase()) : true;
    
    return matchAnnee && matchFiliere && matchMatiere && matchRecherche;
  });
}

  
    getCardTitle(emploi: EmploiDuTempsClasseDto | EnseignantDto): string {
      return 'classe' in emploi 
        ? `Emploi du temps ${emploi.classe.nom}` 
        : `EDT - ${emploi.nomComplet}`;
    }
  
    getCardSubtitle(emploi: EmploiDuTempsClasseDto | EnseignantDto): string {
      return 'classe' in emploi 
        ? `${emploi.classe.filiere} (${emploi.classe.niveau})` 
        : this.getEnseignantMatiere(emploi);
    }

   getEnseignantMatiere(emploi: EnseignantDto): string {
  if (emploi.matieres && emploi.matieres.length > 0) {
    // On récupère le nom de chaque matière et on les joint avec une virgule
    return emploi.matieres.map(m => m.nom).join(', ');
  }
  return '';
}
  
//  public getEnseignantMatiere(emploi: EnseignantDto): string {
//   // Vérifie si la propriété matieres existe et contient au moins un élément
//   if (emploi.matieres && emploi.matieres.length > 0) {
//     return emploi.matieres[0].nom; // Retourne la première matière
//   }
//   return ''; // Retourne une chaîne vide si pas de matière
// }
    telechargerPdf(emploi: EmploiDuTempsClasseDto | EmploiDuTempsIndividuelDto): void {
      const id = emploi.id;
      const type = 'classe' in emploi ? 'classe' : 'enseignant';
      const url = `/api/emplois-du-temps/${type}/${id}/pdf`;
      
      console.log('Téléchargement:', url);
      // window.open(url, '_blank');
    }
  
    resetFiltres(): void {
      this.filtres = {
        annee: '',
        recherche: '',
        filiere: '',
        matiere: ''
      };
    }
  
    isClasseEmploi(emploi: any): emploi is EmploiDuTempsClasseDto {
      return 'classe' in emploi;
    }
 
  
    // Ajoutez cette méthode
  updateFiltre(value: string): void {
    if (this.activeTab === 'classes') {
      this.filtres.filiere = value;
    } else {
      this.filtres.matiere = value;
    }
  }
  
  // Et cette propriété getter
  get currentFiltreValue(): string {
    return this.activeTab === 'classes' ? this.filtres.filiere : this.filtres.matiere;
  }
  
  creerNouvelEmploiDuTemps(): void {
    // Implémentez la logique de création ici
    if (this.activeTab === 'classes') {
     this.router.navigate(['dashboard/emplois-du-temps/new-emploi-classe']);
      // this.router.navigate(['/emplois-du-temps/nouveau-classe']);
    } else {
     this.router.navigate(['dashboard/emplois-du-temps/viewEmploisTempEnseignant']);
      // this.router.navigate(['/emplois-du-temps/nouveau-enseignant']);
    }
  }

    private loadEmploisTempsClasse(): void {
      
        // console.error('Erreur lors du chargement de la classe:');
      this.loading = true;
      this.error = null;
  console.log("donnee" ,this.authService.getIdEtablessement())
      this.emploisTempsService.getEmploisSalles(this.authService.getIdEtablessement() )
        .pipe(
          catchError(error => {
            console.error('Erreur lors du chargement des emplois du temps des classes:', error);
            this.error = 'Erreur lors du chargement  des emplois du temps des classes';
            return of(null);
          }),
          finalize(() => this.loading = false)
        )
        .subscribe(emplois => {
          if (emplois) {
            this.emploisClasses = emplois;
            console.log(' emplois de temps des Classes chargée:', this.emploisClasses);
            // // Sauvegarder l'ID dans le localStorage pour les prochaines visites
            // localStorage.setItem('lastSelectedClasseId', classeId.toString());
            // this.loadCreneauxForClasse();
          }
        });
    }

getAllEmploiEnseignant() {
    
  this.emploisTempsService.genererToutesFichesEnseignants(this.authService.getIdEtablessement()).subscribe({
    next: (response: FicheEnseignantDto[]) => {
      this.emploisEnseignants = response
        .map(fiche => fiche.enseignant)
        .filter((enseignant): enseignant is EnseignantDto => enseignant !== undefined);
      console.log("emplois de temps ", this.emploisEnseignants);
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des fiches', err);
    }
  });
}
}


