import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClasseDto } from '../../../../core/model/models';
import { ClasseServiceService } from '../../../../core/services/classe-service.service';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

type SortField = 'nom' | 'filiere' | 'niveau';
type SortDirection = 'asc' | 'desc';

interface ClasseFilters {
  recherche: string;
  filiere: string;
  niveau: string;
}

interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info';
  action: () => void;
}



@Component({
  selector: 'app-liste-classe',
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-classe.component.html',
  styleUrl: './liste-classe.component.css'
})
export class ListeClasseComponent {
  loading: boolean = false;
  error!: any;


// Propriétés pour les modals
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  selectedClasse: ClasseDto | null = null;
  editingClasse: ClasseDto | null = null;
  isSaving: boolean = false;
  classe: ClasseDto | null = null;
  showDeleteModal: boolean = false;
   
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  constructor( private classeService:ClasseServiceService, private authservice : AuthService) {}
  

  private router = inject(Router);
  ngOnInit(): void {
    // Initialisation du composant
    this.loadClasses();
  }

  filtres: ClasseFilters = {
    recherche: '',
    filiere: '',
    niveau: ''
  };

  // niveaux = ['Sixième', 'Cinquième', 'Quatrième', 'Troisième', 'Seconde', 'Première', 'Terminale'];
  niveaux = ['cycle 1','cycle 2'];
  filieres = ['Scientifique', 'Littéraire', 'Technique', 'Professionnelle'];


    classes!: ClasseDto[] ;
  
  /**
   * Récupère les classes filtrées selon les critères
   */
  getClassesActives(): ClasseDto[] {
    return this.classes.filter(classe => {
      const matchNiveau = this.filtres.niveau ? classe.niveau === this.filtres.niveau : true;
      const matchFiliere = this.filtres.filiere ? classe.filiere === this.filtres.filiere : true;
      const matchRecherche = this.filtres.recherche ? 
        classe.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        classe.filiere.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        classe.niveau.toLowerCase().includes(this.filtres.recherche.toLowerCase()) : true;
      
      return matchNiveau && matchFiliere && matchRecherche;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      filiere: '',
      niveau: ''
    };
  }

  /**
   * Navigue vers la création d'une nouvelle classe
   */
  creerNouvelleClasse(): void {
    this.router.navigate(['/dashboard/classes/new-classe']);
  }

  /**
   * Affiche les détails d'une classe
   */
  // voirDetails(classe: ClasseDto): void {
  //   this.router.navigate(['/dashboard/classes', classe.id]);
  // }

  /**
   * Navigue vers la modification d'une classe
   */
  // modifierClasse(classe: ClasseDto): void {
  //   this.router.navigate(['/dashboard/classes', classe.id, 'modifier']);
  // }

  /**
   * Charge les classes depuis le service (à implémenter)
   */
 

/**
   * Affiche les détails d'une classe dans un modal
   */
  voirDetails(classe: ClasseDto): void {
    this.selectedClasse = classe;
    this.showDetailsModal = true;
  }

  /**
   * Ouvre le modal de modification d'une classe
   */
  modifierClasse(classe: ClasseDto): void {
    this.editingClasse = { ...classe }; // Créer une copie pour éviter les modifications directes
    this.showEditModal = true;
  }

  /**
   * Ferme le modal de détails
   */
  fermerDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedClasse = null;
  }

  /**
   * Ferme le modal d'édition
   */
  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingClasse = null;
  }

  /**
   * Sauvegarde les modifications de la classe
   */
  sauvegarderClasse(): void {
    if (!this.editingClasse) return;

    this.isSaving = true;
    
    this.classeService.updateClasse(this.editingClasse.id, this.editingClasse)
      .pipe(
        catchError(error => {
          // console.error('Erreur lors de la sauvegarde:', error);
          this.error =  error.message || 'Erreur lors de la sauvegarde de la classe';
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe(result => {
        if (result) {
          // Mettre à jour la liste des classes
          const index = this.classes.findIndex(c => c.id === this.editingClasse!.id);
          if (index !== -1) {
            this.classes[index] = { ...this.editingClasse! };
          }
          this.fermerEditModal();
          this.successMessage = result.message || 'Classe sauvegardée avec succès' ;
          // console.log('Classe sauvegardée avec succès');
        }
      });
  }

  /**
   * Annule les modifications
   */
  annulerModifications(): void {
    this.fermerEditModal();
  }

  /**
   * Parse les heures par matière depuis le JSON
   */
  parseHeuresParMatiere(heuresJson: string | undefined): any {
    if (!heuresJson) return {};
    try {
      return JSON.parse(heuresJson);
    } catch (error) {
      console.error('Erreur lors du parsing des heures par matière:', error);
      return {};
    }
  }

    /**
   * Obtient les matières et leurs heures
   */
  getMatieresHeures(heuresJson: string | undefined): Array<{matiere: string, heures: number}> {
    const parsed = this.parseHeuresParMatiere(heuresJson);
    return Object.keys(parsed).map(matiere => ({
      matiere,
      heures: parsed[matiere]
    }));
  }

    private loadClasses(): void {
          // console.error('Erreur lors du chargement de la classe:');
        this.loading = true;
        this.error = null;
    
        this.classeService.getClassesByEtablissement(this.authservice.getIdEtablessement() )
          .pipe(
            catchError(error => {
              console.error('Erreur lors du chargement des emplois du temps des classes:', error);
              this.error = 'Erreur lors du chargement  des emplois du temps des classes';
              return of(null);
            }),
            finalize(() => {
      setTimeout(() => {
        this.loading = false;
      }, 3000);
    })
          )
          .subscribe(classes => {
            if (classes) {
              this.classes = classes;
              console.log('   Classes chargée:', this.classes );
              // // Sauvegarder l'ID dans le localStorage pour les prochaines visites
              // localStorage.setItem('lastSelectedClasseId', classeId.toString());
              // this.loadCreneauxForClasse();
            }
          });
      }


       // Modal de suppression
        confirmerSuppression(enseignant: ClasseDto): void {
          this.classe = enseignant;
          this.showDeleteModal = true;
        }


          fermerDeleteModal(): void {
    this.showDeleteModal = false;
    this.classe = null;
  }



   supprimerclass(): void {
    if (this.isDeleting || !this.classe) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.classeService.deleteClasse(this.classe.id!)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression de la classe:', error);
          this.errorMessage = 'Erreur lors de la suppression de la classe. Veuillez réessayer.';
          return of(null);
        }),
        finalize(() => {
          this.isDeleting = false;
          this.scheduleMessageClear();
        })
      )
      .subscribe(response => {
        if (response !== null) {
          this.successMessage =  `classe ${this.classe!.nom} supprimé avec succès !`;
          
         this.loadClasses();
          
          this.fermerDeleteModal();
        }
      });
  }


   private scheduleMessageClear(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }


}