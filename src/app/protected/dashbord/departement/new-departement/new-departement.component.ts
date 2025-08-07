import { Component } from '@angular/core';
import { DepartementDto, EtablissementDto } from '../../../../core/model/models';
import { Router } from '@angular/router';
import { DepartementServiceService } from '../../../../core/services/departement-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-departement',
  imports: [CommonModule,FormsModule],
  templateUrl: './new-departement.component.html',
  styleUrl: './new-departement.component.css'
})
export class NewDepartementComponent {
 touchedFields: { [key: string]: boolean } = {};

  // Modèle du département
  departement: Partial<DepartementDto> = {
    nom: '',
    codeDepar: '',
  
  };

  // États
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showConfirmModal = false;
  lastCreatedDepartement: (DepartementDto) | null = null;
  loadingEtablissements = false;

  // Données
  etablissements: EtablissementDto[] = [];

  formSubmitted = false;

  constructor(
    private router: Router,
     private departementService: DepartementServiceService,
     private authservice :AuthService 
   
  ) {}

  ngOnInit(): void {
    
  }

  /**
   * Charge la liste des établissements
   */
 

  /**
   * Vérifie si un champ est invalide
   */
  isFieldInvalid(fieldName: string): boolean {
    const value = this.departement[fieldName as keyof (DepartementDto   )];
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
      this.departement.nom?.trim() &&
      this.departement.codeDepar?.trim() 
  
    );
  }

  /**
   * Valide les données
   */
  private validateDepartement(): string | null {
    if (!this.departement.nom?.trim()) {
      return 'Le nom du département est requis';
    }

    if (!this.departement.codeDepar?.trim()) {
      return 'Le code département est requis';
    }

   

    if (this.departement.nom.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }

    if (this.departement.codeDepar.trim().length < 2) {
      return 'Le code doit contenir au moins 2 caractères';
    }

    return null;
  }

  /**
   * Crée le département via le service
   */
  private createDepartement(): void {
    console.log('Début création du département');

    const validationError = this.validateDepartement();
    if (validationError) {
      this.errorMessage = validationError;
      console.log('Erreur validation:', validationError);
      return;
    }

    const departementToCreate: DepartementDto = {
      nom: this.departement.nom!.trim(),
      codeDepar: this.departement.codeDepar!.trim().toUpperCase(),
      idEtablissement: this.authservice.getIdEtablessement(),
    
    };

    // Simulation d'appel API - à remplacer par l'appel au service réel
    // setTimeout(() => {
    //   // Simulation de succès
    //   const createdDepartement: DepartementDto & { etablissementId?: number } = {
    //     id: Date.now(),
    //     ...departementToCreate as DepartementDto,
    //     etablissementId: this.departement.etablissementId,
    //     message: 'Département créé avec succès',
    //     code: 201
    //   };

    //   this.lastCreatedDepartement = createdDepartement;
    //   this.successMessage = 'Département créé avec succès';
    //   this.errorMessage = '';
    //   console.log('Département créé:', createdDepartement);

    //   setTimeout(() => {
    //     this.showConfirmModal = true;
    //     this.successMessage = '';
    //   }, 2000);
    // }, 1000);

    // Version avec service réel (à décommenter quand le service sera disponible)
 
    this.departementService.createDepartement(departementToCreate).subscribe({
      next: (response) => {
        this.lastCreatedDepartement = { ...response };
        this.successMessage = 'Département créé avec succès';
        this.errorMessage = '';
        console.log('Département créé:', response);

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
          this.errorMessage = 'Un département avec ce code existe déjà dans cet établissement.';
        }
        this.successMessage = '';
        console.error('Erreur lors de la création du département:', error);

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
    this.departement = {
      nom: '',
      codeDepar: ''
    
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
      await this.createDepartement();
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
        this.router.navigate(['/dashboard/departements']);
      }
    } else {
      this.router.navigate(['/dashboard/departements']);
    }
  }

  /**
   * Vérifie les modifications non sauvegardées
   */
  private hasUnsavedChanges(): boolean {
    return !!(
      this.departement.nom?.trim() || 
      this.departement.codeDepar?.trim() 
     
    );
  }

  /**
   * Ferme la modal de confirmation
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.router.navigate(['/dashboard/departements']);
  }

  /**
   * Crée un autre département
   */
  createAnother(): void {
    this.showConfirmModal = false;
    this.resetForm();
    this.successMessage = 'Vous pouvez créer un nouveau département';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  /**
   * Obtient le nom d'un établissement
   */
  getEtablissementNom(etablissementId: number | undefined): string {
    if (!etablissementId) return '';
    const etablissement = this.etablissements.find(e => e.id === etablissementId);
    return etablissement ? etablissement.nom : '';
  }
}