import { Component, inject } from '@angular/core';
import { DepartementDto } from '../../../../core/model/models';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartementServiceService } from '../../../../core/services/departement-service.service';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';


type SortField = 'nom' | 'codeDepar' | 'etablissement';
type SortDirection = 'asc' | 'desc';

interface DepartementFilters {
  recherche: string;
  etablissement: string;
  code : string;
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
  selector: 'app-liste-departement',
  imports: [CommonModule,FormsModule],
  templateUrl: './liste-departement.component.html',
  styleUrl: './liste-departement.component.css'
})
export class ListeDepartementComponent {
 loading: boolean = false;
  error!: any;

  // Propriétés pour les modals
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  selectedDepartement: DepartementDto | null = null;
  editingDepartement: DepartementDto | null = null;
  isSaving: boolean = false;
successMessage: string|null =null;
errorMessage:string|null =null;

  constructor( private departementService: DepartementServiceService, private authservice:AuthService ) {}

  private router = inject(Router);

  ngOnInit(): void {
    // Initialisation du composant
    this.loadDepartements();
  }

  filtres: DepartementFilters = {
    recherche: '',
    etablissement: '',
    code : ''
  };

  etablissements = ['Lycée Central', 'Collège Nord', 'École Technique Sud', 'Université Est'];


  departements!: DepartementDto[] ;
  // departements: DepartementDto[] = [
  //   {
  //     id: 1,
  //     nom: 'Mathématiques',
  //     codeDepar: 'MATH',
  //     matieres: [
  //       { id: 1, nom: 'Algèbre', codeMat: 'ALG', coefficient: 3 },
  //       { id: 2, nom: 'Géométrie', codeMat: 'GEO', coefficient: 2 }
  //     ],
  //     enseignants: [
  //       { id: 1, nomComplet: 'Jean Dupont', matricule: 'MAT001', grade: 'Professeur' },
  //       { id: 2, nomComplet: 'Marie Martin', matricule: 'MAT002', grade: 'Maître Assistant' }
  //     ],
  //     etablissement: {
  //       id: 1,
  //       nom: 'Lycée Central',
  //       anneeScolaire: '2024-2025'
  //     }
  //   },
  //   {
  //     id: 2,
  //     nom: 'Sciences Physiques',
  //     codeDepar: 'PHYS',
  //     matieres: [
  //       { id: 3, nom: 'Physique', codeMat: 'PHY', coefficient: 4 },
  //       { id: 4, nom: 'Chimie', codeMat: 'CHI', coefficient: 3 }
  //     ],
  //     enseignants: [
  //       { id: 3, nomComplet: 'Pierre Durand', matricule: 'PHY001', grade: 'Professeur' }
  //     ],
  //     etablissement: {
  //       id: 1,
  //       nom: 'Lycée Central',
  //       anneeScolaire: '2024-2025'
  //     }
  //   },
  //   {
  //     id: 3,
  //     nom: 'Lettres Modernes',
  //     codeDepar: 'LETT',
  //     matieres: [
  //       { id: 5, nom: 'Français', codeMat: 'FRA', coefficient: 4 },
  //       { id: 6, nom: 'Littérature', codeMat: 'LIT', coefficient: 3 }
  //     ],
  //     enseignants: [
  //       { id: 4, nomComplet: 'Sophie Bernard', matricule: 'LET001', grade: 'Professeur' },
  //       { id: 5, nomComplet: 'Paul Moreau', matricule: 'LET002', grade: 'Maître Assistant' }
  //     ],
  //     etablissement: {
  //       id: 2,
  //       nom: 'Collège Nord',
  //       anneeScolaire: '2024-2025'
  //     }
  //   }
  // ];

  /**
   * Récupère les départements filtrés selon les critères
   */
  getDepartementsActifs(): DepartementDto[] {
    return this.departements.filter(departement => {
      const matchEtablissement = this.filtres.etablissement ? 
        departement.etablissement?.nom === this.filtres.etablissement : true;
      const matchCodeDepar = this.filtres.code  ? 
        departement.codeDepar.toLowerCase().includes(this.filtres.code .toLowerCase()) : true;
      const matchRecherche = this.filtres.recherche ? 
        departement.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        departement.codeDepar.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        (departement.etablissement?.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase()) || false) : true;
      
      return matchEtablissement && matchCodeDepar && matchRecherche;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      etablissement: '',
      code : ''
    };
  }

  /**
   * Navigue vers la création d'un nouveau département
   */
  creerNouveauDepartement(): void {
    this.router.navigate(['/dashboard/departements/new-departement']);
  }

  /**
   * Affiche les détails d'un département dans un modal
   */
  voirDetails(departement: DepartementDto): void {
    this.selectedDepartement = departement;
    this.showDetailsModal = true;
  }

  /**
   * Ouvre le modal de modification d'un département
   */
  modifierDepartement(departement: DepartementDto): void {
    this.editingDepartement = { ...departement }; // Créer une copie pour éviter les modifications directes
    this.showEditModal = true;
  }

  /**
   * Ferme le modal de détails
   */
  fermerDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDepartement = null;
  }

  /**
   * Ferme le modal d'édition
   */
  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingDepartement = null;
  }

  /**
   * Sauvegarde les modifications du département
   */
  sauvegarderDepartement(): void {
    if (!this.editingDepartement) return;

    this.isSaving = true;
    
    // Simuler un appel API
    setTimeout(() => {
      // Mettre à jour la liste des départements
      const index = this.departements.findIndex(d => d.id === this.editingDepartement!.id);
      if (index !== -1) {
        this.departements[index] = { ...this.editingDepartement! };
      }
      this.fermerEditModal();
      this.isSaving = false;
      console.log('Département sauvegardé avec succès');
    }, 1000);

    // Version avec service réel (à décommenter quand le service sera disponible)
   if (!this.editingDepartement.id) {
      console.error('ID du département manquant');
      return;
    }

    const updates: Partial<DepartementDto> = {
    nom: this.editingDepartement.nom,
    codeDepar: this.editingDepartement.codeDepar
    // Tu peux ajouter d'autres champs si nécessaire
  };

    console.log( "donne envoyer ",this.editingDepartement.id,  updates )
    this.departementService.updateDepartement(this.editingDepartement.id,  updates)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.errorMessage = error.message || 'Erreur lors de la sauvegarde du département';
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe(result => {
        if (result) {
          // Mettre à jour la liste des départements
          const index = this.departements.findIndex(d => d.id === this.editingDepartement!.id);
          if (index !== -1) {
            this.departements[index] = { ...this.editingDepartement! };
          }
          this.fermerEditModal();
           this.successMessage = result.message || ' reussi avec success...'
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
   * Charge les départements depuis le service
   */
  private loadDepartements(): void {
    this.loading = true;
    this.error = null;

    // Simuler un chargement
    setTimeout(() => {
      this.loading = false;
      console.log('Départements chargés:', this.departements);
    }, 500);

    // Version avec service réel (à décommenter quand le service sera disponible)
    
    this.departementService.getDepartementsByEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des départements:', error);
          this.error = 'Erreur lors du chargement des départements';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(departements => {
        if (departements) {
          this.departements = departements;
          console.log('Départements chargés:', this.departements);
        }
      });
    
  }
}