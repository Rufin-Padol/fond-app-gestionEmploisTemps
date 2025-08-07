import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatiereDto } from '../../../../core/model/models';
import { Router } from '@angular/router';
import { MatiereServiceService } from '../../../../core/services/matiere-service.service';
import { catchError, finalize, of } from 'rxjs';



type SortField = 'nom' | 'codeMat' | 'categorie';
type SortDirection = 'asc' | 'desc';

interface MatiereFilters {
  recherche: string;
  categorie: string;
  codeMat: string;
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
  selector: 'app-liste-filliers',
    imports: [CommonModule, FormsModule],
  templateUrl: './liste-filliers.component.html',
  styleUrl: './liste-filliers.component.css'
})
export class ListeFilliersComponent {
loading: boolean = false;
  error!: any;

  // Propriétés pour les modals
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  selectedMatiere: MatiereDto | null = null;
  editingMatiere: MatiereDto | null = null;
  isSaving: boolean = false;

  constructor(private matiereService: MatiereServiceService ) {}

  private router = inject(Router);

  ngOnInit(): void {
    // Initialisation du composant
    this.loadMatieres();
  }

  filtres: MatiereFilters = {
    recherche: '',
    categorie: '',
    codeMat: ''
  };

  categories = ['GENERALE', 'TECHNIQUE', 'PROFESSIONNELLE', 'COMPLEMENTAIRE'];

matieres!: MatiereDto[];

  // matieres: MatiereDto[] = [
  //   {
  //     id: 1,
  //     nom: 'Mathématiques',
  //     codeMat: 'MATH',
  //     coefficient: 4,
  //     categorie: CategorieMatiere.GENERALE,
  //     IdDepartement: 1
  //   },
  //   {
  //     id: 2,
  //     nom: 'Physique',
  //     codeMat: 'PHYS',
  //     coefficient: 3,
  //     categorie: CategorieMatiere.GENERALE,
  //     IdDepartement: 2
  //   },
  //   {
  //     id: 3,
  //     nom: 'Français',
  //     codeMat: 'FRAN',
  //     coefficient: 4,
  //     categorie: CategorieMatiere.GENERALE,
  //     IdDepartement: 3
  //   },
  //   {
  //     id: 4,
  //     nom: 'Informatique',
  //     codeMat: 'INFO',
  //     coefficient: 2,
  //     categorie: CategorieMatiere.TECHNIQUE,
  //     IdDepartement: 4
  //   },
  //   {
  //     id: 5,
  //     nom: 'Anglais',
  //     codeMat: 'ANGL',
  //     coefficient: 2,
  //     categorie: CategorieMatiere.GENERALE,
  //     IdDepartement: 3
  //   },
  //   {
  //     id: 6,
  //     nom: 'Chimie',
  //     codeMat: 'CHIM',
  //     coefficient: 3,
  //     categorie: CategorieMatiere.GENERALE,
  //     IdDepartement: 2
  //   }
  // ];

  /**
   * Récupère les matières filtrées selon les critères
   */
  getMatieresActives(): MatiereDto[] {
    return this.matieres.filter(matiere => {
      const matchCategorie = this.filtres.categorie ? 
        matiere.categorie === this.filtres.categorie : true;
      const matchCodeMat = this.filtres.codeMat ? 
        matiere.code.toLowerCase().includes(this.filtres.codeMat.toLowerCase()) : true;
      const matchRecherche = this.filtres.recherche ? 
        matiere.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        matiere.code.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        (matiere.categorie && matiere.categorie.toLowerCase().includes(this.filtres.recherche.toLowerCase())) : true;
      
      return matchCategorie && matchCodeMat && matchRecherche;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      categorie: '',
      codeMat: ''
    };
  }

  /**
   * Navigue vers la création d'une nouvelle matière
   */
  creerNouvelleMatiere(): void {
    this.router.navigate(['/dashboard/filliers/new-filliers']);
  }

  /**
   * Affiche les détails d'une matière dans un modal
   */
  voirDetails(matiere: MatiereDto): void {
    this.selectedMatiere = matiere;
    this.showDetailsModal = true;
  }

  /**
   * Ouvre le modal de modification d'une matière
   */
  modifierMatiere(matiere: MatiereDto): void {
    this.editingMatiere = { ...matiere }; // Créer une copie pour éviter les modifications directes
    this.showEditModal = true;
  }

  /**
   * Ferme le modal de détails
   */
  fermerDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedMatiere = null;
  }

  /**
   * Ferme le modal d'édition
   */
  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingMatiere = null;
  }

  /**
   * Sauvegarde les modifications de la matière
   */
  sauvegarderMatiere(): void {
    if (!this.editingMatiere) return;

    this.isSaving = true;
    
    // Simuler un appel API
    setTimeout(() => {
      // Mettre à jour la liste des matières
      const index = this.matieres.findIndex(m => m.id === this.editingMatiere!.id);
      if (index !== -1) {
        this.matieres[index] = { ...this.editingMatiere! };
      }
      this.fermerEditModal();
      this.isSaving = false;
      console.log('Matière sauvegardée avec succès');
    }, 1000);

    // Version avec service réel (à décommenter quand le service sera disponible)

    this.matiereService.updateMatiere(this.editingMatiere.id, this.editingMatiere)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.error = 'Erreur lors de la sauvegarde de la matière';
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe(result => {
        if (result) {
          // Mettre à jour la liste des matières
          const index = this.matieres.findIndex(m => m.id === this.editingMatiere!.id);
          if (index !== -1) {
            this.matieres[index] = { ...this.editingMatiere! };
          }
          this.fermerEditModal();
          console.log('Matière sauvegardée avec succès');
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
   * Charge les matières depuis le service
   */
  private loadMatieres(): void {
    this.loading = true;
    this.error = null;

    // Simuler un chargement
    setTimeout(() => {
      this.loading = false;
      console.log('Matières chargées:', this.matieres);
    }, 500);

    // Version avec service réel (à décommenter quand le service sera disponible)
 
    this.matiereService.getAllMatieres()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des matières:', error);
          this.error = 'Erreur lors du chargement des matières';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(matieres => {
        if (matieres) {
          this.matieres = matieres;
          console.log('Matières chargées:', this.matieres);
        }
      });
 
  }
}