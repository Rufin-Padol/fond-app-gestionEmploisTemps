import { Component } from '@angular/core';
import { ClasseDto } from '../../../../core/model/models';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasseServiceService } from '../../../../core/services/classe-service.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-classe',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './new-classe.component.html',
  styleUrl: './new-classe.component.css'
})
export class NewClasseComponent {

 touchedFields: { [key: string]: boolean } = {};

  // Modèle de la classe
  classe: Partial<ClasseDto> = {
    nom: '',
    niveau: '',
    filiere: ''
  };

  // États
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showConfirmModal = false;
  lastCreatedClasse: ClasseDto | null = null;

  // Données de configuration
  // niveaux = [
  //   'Sixième',
  //   'Cinquième', 
  //   'Quatrième',
  //   'Troisième',
  //   'Seconde',
  //   'Première',
  //   'Terminale'
  // ];
  cycle=['cycle 1','cycle 2'];
  
filieres = [
  'Commerciale',
  'Industrielle'
];


  constructor(private router: Router,private classeService: ClasseServiceService, private authservice: AuthService) {}

  /**
   * Vérifie si un champ est invalide
   */
  // isFieldInvalid(fieldName: string): boolean {
  //   const value = this.classe[fieldName as keyof ClasseDto];
  //   return !value || value.toString().trim() === '';
  // }
formSubmitted = false;


  isFieldInvalid(fieldName: string): boolean {
  const value = this.classe[fieldName as keyof ClasseDto];
  return (
    (!value || value.toString().trim() === '') &&
    (this.touchedFields[fieldName] || this.formSubmitted)
  );
}

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    return !!(
      this.classe.nom?.trim() &&
      this.classe.niveau?.trim() &&
      this.classe.filiere?.trim()
    );
  }

  // /**
  //  * Génère un ID unique
  //  */
  // private generateId(): number {
  //   return Date.now() + Math.floor(Math.random() * 1000);
  // }

  // /**
  //  * Vérifie si une classe existe déjà
  //  */
  // private checkClasseExists(nom: string): boolean {
  //   try {
  //     const existingClasses = this.getStoredClasses();
  //     return existingClasses.some(classe => 
  //       classe.nom.toLowerCase().trim() === nom.toLowerCase().trim()
  //     );
  //   } catch (error) {
  //     return false;
  //   }
  // }

   

  /**
   * Sauvegarde une classe
   */
  // private saveClasse(classe: ClasseDto): void {
  //   try {
  //     const existingClasses = this.getStoredClasses();
  //     existingClasses.push(classe);
  //     localStorage.setItem('classes', JSON.stringify(existingClasses));
  //   } catch (error) {
  //     throw new Error('Impossible de sauvegarder la classe');
  //   }
  // }

  /**
   * Valide les données
   */
  private validateClasse(): string | null {
    if (!this.classe.nom?.trim()) {
      return 'Le nom de la classe est requis';
    }

    if (!this.classe.niveau?.trim()) {
      return 'Le niveau est requis';
    }

    if (!this.classe.filiere?.trim()) {
      return 'La filière est requise';
    }

    if (this.classe.nom.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }

  

    return null;
  }

  /**
   * Crée la classe
   */
  // private async createClasse(): Promise<ClasseDto> {
  //   const validationError = this.validateClasse();
  //   if (validationError) {
  //     throw new Error(validationError);
  //   }

  //   const nouvelleClasse: ClasseDto = {
  //     id: this.generateId(),
  //     nom: this.classe.nom!.trim(),
  //     niveau: this.classe.niveau!,
  //     filiere: this.classe.filiere!,
  //     message: 'Classe créée avec succès',
  //     code: 201
  //   };

  //   // Simulation délai
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   this.saveClasse(nouvelleClasse);
  //   return nouvelleClasse;
  // }

  /**
 * Crée la classe via le service
 */
/**
 * Crée la classe via le service
 */
// private async createClasse(): Promise<void> {
//    console.log(' debut Classe créée:' );
//   const validationError = this.validateClasse();
//   if (validationError) {
//     this.errorMessage = validationError;
//      console.log(' error validation' );
//     return;
//   }

  

//   const classeToCreate: Partial<ClasseDto> = {
//     nom: this.classe.nom!.trim(),
//     niveau: this.classe.niveau!,
//     filiere: this.classe.filiere!,
//     // a mofiier lie a letablessement de ulisateur
//     idEtablissement: 1
//   };

//   try {
//     await this.classeService.createClasse(classeToCreate).toPromise();
//     this.successMessage = 'Classe créée avec succès';
//     console.log('Classe créée:', classeToCreate);
//     setTimeout(() => {
//        this.errorMessage = '';
//          this.showConfirmModal = true;
//     }, 3000);
   
  
//   } catch (error:any) {
//     if (error?.error?.message) {
//     this.errorMessage = error.error.message;
//   } else if (error?.error?.detail) {
//     this.errorMessage = error.error.detail;
//   } else {
//     this.errorMessage = 'Erreur lors de la création de la classe';
//   }
//   this.successMessage = '';
//     console.error('Erreur lors de la création de la classe:', error);
//      setTimeout(() => {
//        this.successMessage = '';
//     }, 2000);
 
//   }
// }

private createClasse(): void {
  console.log('Début création de la classe');

  const validationError = this.validateClasse();
  if (validationError) {
    this.errorMessage = validationError;
    console.log('Erreur validation:', validationError);
    return;
  }

  const classeToCreate: Partial<ClasseDto> = {
    nom: this.classe.nom!.trim(),
    niveau: this.classe.niveau!,
    filiere: this.classe.filiere!,
    idEtablissement: this.authservice.getIdEtablessement()
  };

  this.classeService.createClasse(classeToCreate).subscribe({
    next: (repos) => {
      this.successMessage = 'Classe créée avec succès';
      this.errorMessage = '';
      console.log('Classe créée:', repos);

      setTimeout(() => {
        this.showConfirmModal = true;
        this.successMessage = '';
      }, 3000);
    },
    error: (error: any) => {
      
        this.errorMessage = 'Une classe portant ce nom existe déjà dans cet établissement.';
      
      this.successMessage = '';
      console.error('Erreur lors de la création de la classe:', error);

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
    this.classe = {
      nom: '',
      niveau: '',
      filiere: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Soumission du formulaire
   */
  async onSubmit(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
    await this.createClasse();
    

    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Sauver et créer une nouvelle
   */
  async onSaveAndNew(): Promise<void> {
    this.formSubmitted = true;

    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.createClasse();
      this.successMessage = 'Classe créée ! Vous pouvez en créer une autre.';
      this.resetForm();
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
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
        this.router.navigate(['/dashboard/classes']);
      }
    } else {
      this.router.navigate(['/dashboard/classes']);
    }
  }

  /**
   * Vérifie les modifications non sauvegardées
   */
  private hasUnsavedChanges(): boolean {
    return !!(this.classe.nom?.trim() || this.classe.niveau || this.classe.filiere);
  }

  /**
   * Ferme la modal de confirmation
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.router.navigate(['/dashboard/classes']);
  }

  /**
   * Crée une autre classe
   */
  createAnother(): void {
    this.showConfirmModal = false;
    this.resetForm();
    this.successMessage = 'Vous pouvez créer une nouvelle classe';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }
}