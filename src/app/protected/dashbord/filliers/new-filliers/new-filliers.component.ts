import { Component } from '@angular/core';
import { CategorieMatiere } from '../../../../core/model/enums';
import { DepartementDto, MatiereDto } from '../../../../core/model/models';
import { Router } from '@angular/router';
import { MatiereServiceService } from '../../../../core/services/matiere-service.service';
import { DepartementServiceService } from '../../../../core/services/departement-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-filliers',
   imports: [CommonModule, FormsModule],
  templateUrl: './new-filliers.component.html',
  styleUrl: './new-filliers.component.css'
})
export class NewFilliersComponent {

  touchedFields: { [key: string]: boolean } = {};

  // Modèle de la matière
  matiere: Partial<MatiereDto> = {
    nom: '',
    code: '',
    coefficient: undefined,
    categorie: undefined,
    idDepartement: undefined
  };

  // États
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showConfirmModal = false;
  lastCreatedMatiere: MatiereDto | null = null;
  loadingDepartements = false;

  // Données
  departements: DepartementDto[] = [];
  
  // Données de configuration
  categories = [
    { value: CategorieMatiere.GENERAL, label: 'Générale' },
    { value: CategorieMatiere.TECHNIQUE, label: 'Technique' },
    { value: CategorieMatiere.PROFESSIONNEL, label: 'Professionnelle' },
    { value: CategorieMatiere.AUTRE, label: 'autre' }
  ];

  formSubmitted = false;

  constructor(
    private router: Router,
    private matiereService: MatiereServiceService,
    private departementService: DepartementServiceService
  ) {}

  ngOnInit(): void {
    this.loadDepartements();
  }

  /**
   * Charge la liste des départements
   */
  private loadDepartements(): void {
    this.loadingDepartements = true;
    
    // Données de démonstration - à remplacer par l'appel au service
    // setTimeout(() => {
    //   this.departements = [
    //     {
    //       id: 1,
    //       codeDepar: 'MATH',
    //       nom: 'Mathématiques',
    //       etablissement: { id: 1, nom: 'Lycée Central' }
    //     },
    //     {
    //       id: 2,
    //       codeDepar: 'PHYS',
    //       nom: 'Sciences Physiques',
    //       etablissement: { id: 1, nom: 'Lycée Central' }
    //     },
    //     {
    //       id: 3,
    //       codeDepar: 'LETT',
    //       nom: 'Lettres Modernes',
    //       etablissement: { id: 1, nom: 'Lycée Central' }
    //     },
    //     {
    //       id: 4,
    //       codeDepar: 'HIST',
    //       nom: 'Histoire-Géographie',
    //       etablissement: { id: 1, nom: 'Lycée Central' }
    //     },
    //     {
    //       id: 5,
    //       codeDepar: 'LANG',
    //       nom: 'Langues Vivantes',
    //       etablissement: { id: 1, nom: 'Lycée Central' }
    //     }
    //   ];
    //   this.loadingDepartements = false;
    // }, 500);

    // Version avec service réel (à décommenter quand le service sera disponible)
 
    this.departementService.getAllDepartements().subscribe({
      next: (departements) => {
        this.departements = departements;
        this.loadingDepartements = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.errorMessage = 'Erreur lors du chargement des départements';
        this.loadingDepartements = false;
      }
    });
   
  }

  /**
   * Vérifie si un champ est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const value = this.matiere[fieldName as keyof MatiereDto];
    return (
      (!value || (typeof value === 'string' && value.trim() === '')) &&
      (this.touchedFields[fieldName] || this.formSubmitted)
    );
  }

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    return !!(
      this.matiere.nom?.trim() &&
      this.matiere.code?.trim() &&
      this.matiere.categorie &&
      this.matiere.idDepartement
    );
  }

  /**
   * Valide les données
   */
  private validateMatiere(): string | null {
    if (!this.matiere.nom?.trim()) {
      return 'Le nom de la matière est requis';
    }

    if (!this.matiere.code?.trim()) {
      return 'Le code matière est requis';
    }

    if (!this.matiere.categorie) {
      return 'La catégorie est requise';
    }

    if (!this.matiere.idDepartement) {
      return 'Le département est requis';
    }

    if (this.matiere.nom.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }

    if (this.matiere.code.trim().length < 2) {
      return 'Le code matière doit contenir au moins 2 caractères';
    }
    
    if (this.matiere.coefficient && (this.matiere.coefficient < 1 || this.matiere.coefficient > 10)) {
      return 'Le coefficient doit être entre 1 et 10';
    }

    return null;
  }

  /**
   * Crée la matière via le service
   */
  private createMatiere(): void {
    console.log('Début création de la matière');

    const validationError = this.validateMatiere();
    if (validationError) {
      this.errorMessage = validationError;
      console.log('Erreur validation:', validationError);
      return;
    }

    const matiereToCreate: Partial<MatiereDto> = {
      nom: this.matiere.nom!.trim(),
      code: this.matiere.code!.trim().toUpperCase(),
      coefficient: this.matiere.coefficient || undefined,
      categorie: this.matiere.categorie!,
      idDepartement: this.matiere.idDepartement!
    };
console.log('Matière à créer:', matiereToCreate);
    // Simulation d'appel API - à remplacer par l'appel au service réel
    // setTimeout(() => {
    //   // Simulation de succès
    //   // const createdMatiere: MatiereDto = {
    //   //   id: Date.now(),
    //   //   ...matiereToCreate as MatiereDto,
    //   //   message: 'Matière créée avec succès',
    //   //   code: 201
    //   // };

    //   this.lastCreatedMatiere = createdMatiere;
    //   this.successMessage = 'Matière créée avec succès';
    //   this.errorMessage = '';
    //   console.log('Matière créée:', createdMatiere);

    //   setTimeout(() => {
    //     this.showConfirmModal = true;
    //     this.successMessage = '';
    //   }, 2000);
    // }, 1000);

    // Version avec service réel (à décommenter quand le service sera disponible)
   
    this.matiereService.createMatiere(matiereToCreate).subscribe({
      next: (response) => {
        this.lastCreatedMatiere = response;
        this.successMessage = 'Matière créée avec succès';
        this.errorMessage = '';
        console.log('Matière créée:', response);

        setTimeout(() => {
          this.showConfirmModal = true;
          this.successMessage = '';
        }, 2000);
      },
      error: (error: any) => {
        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error?.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Une matière avec ce code existe déjà dans ce département.';
        }
        this.successMessage = '';
        console.error('Erreur lors de la création de la matière:', error);

        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      }
    });
   
  }

  /**
   * Réinitialise le formulaire
   */
  private resetForm(): void {
    this.matiere = {
      nom: '',
      code: '',
      coefficient: undefined,
      categorie: undefined,
      idDepartement: undefined
    };
    this.touchedFields = {};
    this.formSubmitted = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Soumission du formulaire
   */
  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.createMatiere();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Annuler
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        this.router.navigate(['/dashboard/matieres']);
      }
    } else {
      this.router.navigate(['/dashboard/matieres']);
    }
  }

  /**
   * Vérifie les modifications non sauvegardées
   */
  private hasUnsavedChanges(): boolean {
    return !!(
      this.matiere.nom?.trim() || 
      this.matiere.code?.trim() || 
      this.matiere.categorie || 
      this.matiere.idDepartement ||
      this.matiere.coefficient
    );
  }

  /**
   * Ferme la modal de confirmation
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.router.navigate(['/dashboard/matieres']);
  }

  /**
   * Crée une autre matière
   */
  createAnother(): void {
    this.showConfirmModal = false;
    this.resetForm();
    this.successMessage = 'Vous pouvez créer une nouvelle matière';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  /**
   * Obtient le libellé d'une catégorie
   */
  getCategorieLabel(categorie: CategorieMatiere | undefined): string {
    if (!categorie) return '';
    const cat = this.categories.find(c => c.value === categorie);
    return cat ? cat.label : '';
  }

  /**
   * Obtient le nom d'un département
   */
  getDepartementNom(departementId: number | undefined): string {
    if (!departementId) return '';
    const dept = this.departements.find(d => d.id === departementId);
    return dept ? dept.nom : '';
  }
}