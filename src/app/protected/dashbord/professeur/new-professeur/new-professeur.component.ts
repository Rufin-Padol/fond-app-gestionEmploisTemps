import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnseignantServiceService } from '../../../../core/services/enseignant-service.service';
import { MatiereServiceService } from '../../../../core/services/matiere-service.service';
import { DepartementDto, DisponibiliteDto, EnseignantDto, MatiereDto } from '../../../../core/model/models';
import { DepartementServiceService } from '../../../../core/services/departement-service.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Jour } from '../../../../core/model/enums';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-new-professeur',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-professeur.component.html',
  styleUrl: './new-professeur.component.css'
})
export class NewProfesseurComponent {
  enseignantForm!: FormGroup;
  loading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showConfirmModal = false;
  lastCreatedEnseignant: EnseignantDto | null = null;

  // Données de référence
  departements: DepartementDto[] = [];
  matieres: MatiereDto[] = [];
  
 
 
  filteredDiplomes: string[] = [];
showDiplomeDropdown = false;
showAddDiplomeButton = false;
 

  diplomes = [
      'PCEG', 'PLEG',
  'Doctorat en Mathématiques', 
  'Doctorat en Physique', 
  'Doctorat en Chimie',
  'Doctorat en Biologie', 
  'Doctorat en Histoire', 
  'Doctorat en Géographie',
  'Doctorat en Français', 
  'Doctorat en Anglais', 
  'Master en Mathématiques',
  'Master en Physique', 
  'Master en Chimie', 
  'Master en Biologie',
  'Master en Histoire', 
  'Master en Géographie', 
  'Master en Français',
  'Master en Anglais', 
  'Licence', 
  'DEUG', 
  'BTS', 
  'DUT', 
  'Autre'
];
  readonly jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private enseignantService: EnseignantServiceService,
    private departementService: DepartementServiceService,
    private matiereService: MatiereServiceService,
    private authservice: AuthService
  ) {
    this.initForm();
  }




// Liste statique des grades
grades: string[] = [
  'Instituteur Adjoint',
  'Instituteur Certifié',
  'Maître d\'application',
  'Chargé de cours',
  'Professeur des Lycées d\'Enseignement Général',
  'Professeur des Lycées d\'Enseignement Technique',
  'Professeur certifié',
  'Professeur agrégé',
  'Inspecteur Pédagogique Régional',
  'Inspecteur Coordonnateur',
  'Censeur',
  'Proviseur',
  'Principal'
];

  filteredGrades: string[] = [];
  showAddButton = false;
  showDropdown = false;
  
 // Nouvelle méthode pour gérer le focus
onGradeFocus() {
  this.showDropdown = true;
  this.filterGrades(); // Filtre immédiatement quand on focus
}

// Modifiez filterGrades pour garder le dropdown ouvert
filterGrades() {
  const gradeControl = this.enseignantForm.get('grade');
  if (!gradeControl) return;

  const value = gradeControl.value?.toLowerCase() || '';
  this.filteredGrades = this.grades.filter(grade => 
    grade.toLowerCase().includes(value)
  );
  
  // Toujours montrer le dropdown si on est en train de taper
  this.showDropdown = true;
  this.showAddButton = !!value && !this.grades.some(g => g.toLowerCase() === value.toLowerCase());
}

// Modifiez addNewGrade pour empêcher la fermeture immédiate
addNewGrade(event: MouseEvent) {
  event.preventDefault(); // Empêche le blur immédiat
  
  const gradeControl = this.enseignantForm.get('grade');
  if (!gradeControl) return;

  const newGrade = gradeControl.value?.trim();
  if (newGrade && !this.grades.includes(newGrade)) {
    this.grades.push(newGrade);
    this.grades.sort();
    gradeControl.setValue(newGrade);
    this.filteredGrades = [newGrade]; // Affiche le nouveau grade
    this.showAddButton = false;
  }
  // Ne pas fermer le dropdown ici
}

// Modifiez onGradeBlur pour ne pas cacher trop vite
onGradeBlur() {
  setTimeout(() => {
    const gradeControl = this.enseignantForm.get('grade');
    const currentValue = gradeControl?.value?.trim();
    
    // Ne fermer que si vide ou valeur existante
    if (!currentValue || this.grades.includes(currentValue)) {
      this.showDropdown = false;
      this.showAddButton = false;
    }
  }, 200);
}

selectGrade(grade: string) {
  const gradeControl = this.enseignantForm.get('grade');
  if (gradeControl) {
    gradeControl.setValue(grade);
  }
  this.showDropdown = false;
  this.showAddButton = false;
}

 

  // Méthodes à ajouter dans la classe
onDiplomeFocus() {
  this.showDiplomeDropdown = true;
  this.filterDiplomes();
}

filterDiplomes() {
  const diplomeControl = this.enseignantForm.get('diplome');
  if (!diplomeControl) return;

  const value = diplomeControl.value?.toLowerCase() || '';
  this.filteredDiplomes = this.diplomes.filter(diplome => 
    diplome.toLowerCase().includes(value)
  );
  
  this.showDiplomeDropdown = true;
  this.showAddDiplomeButton = !!value && !this.diplomes.some(d => d.toLowerCase() === value.toLowerCase());
}

selectDiplome(diplome: string) {
  const diplomeControl = this.enseignantForm.get('diplome');
  if (diplomeControl) {
    diplomeControl.setValue(diplome);
  }
  this.showDiplomeDropdown = false;
  this.showAddDiplomeButton = false;
}

addNewDiplome(event: MouseEvent) {
  event.preventDefault();
  
  const diplomeControl = this.enseignantForm.get('diplome');
  if (!diplomeControl) return;

  const newDiplome = diplomeControl.value?.trim();
  if (newDiplome && !this.diplomes.includes(newDiplome)) {
    this.diplomes.push(newDiplome);
    this.diplomes.sort();
    diplomeControl.setValue(newDiplome);
    this.filteredDiplomes = [newDiplome];
    this.showAddDiplomeButton = false;
  }
}

onDiplomeBlur() {
  setTimeout(() => {
    const diplomeControl = this.enseignantForm.get('diplome');
    const currentValue = diplomeControl?.value?.trim();
    
    if (!currentValue || this.diplomes.includes(currentValue)) {
      this.showDiplomeDropdown = false;
      this.showAddDiplomeButton = false;
    }
  }, 200);
}





  ngOnInit(): void {
    this.loadReferenceData();
  }

  private initForm(): void {
    this.enseignantForm = this.fb.group({
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      diplome: [''],
      grade: [''],
      anciennete: [null, [Validators.min(0), Validators.max(50)]],
      idDepartement: [null, Validators.required],
      matieresIds: this.fb.array([], Validators.required),
      disponibilites: this.fb.array([])
    });
  }

  // Getters pour accéder aux FormArrays
  get matieresIdsArray(): FormArray {
    return this.enseignantForm.get('matieresIds') as FormArray;
  }

  get disponibilitesArray(): FormArray {
    return this.enseignantForm.get('disponibilites') as FormArray;
  }

  private loadReferenceData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Chargement des départements
    this.departementService.getDepartementsByEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des départements:', error);
          this.errorMessage = 'Erreur lors du chargement des départements';
          return of([]);
        })
      )
      .subscribe(departements => {
        this.departements = departements;
      });

    // Chargement des matières
    this.matiereService.getAllMatieres()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des matières:', error);
          this.errorMessage = 'Erreur lors du chargement des matières';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(matieres => {
        this.matieres = matieres;
      });
  }

  // Gestion des matières
  // onMatiereChange(matiereId: number, checked: boolean): void {
  //   const matieresArray = this.matieresIdsArray;
    
  //   if (checked) {
  //     if (!matieresArray.value.includes(matiereId)) {
  //       matieresArray.push(this.fb.control(matiereId));
  //     }
  //   } else {
  //     const index = matieresArray.value.indexOf(matiereId);
  //     if (index >= 0) {
  //       matieresArray.removeAt(index);
  //     }
  //   }
  // }

  onMatiereChange(matiereId: number, event: Event): void {
  const input = event.target as HTMLInputElement;  // cast en HTMLInputElement
  const checked = input.checked;

  const matieresArray = this.matieresIdsArray;

  if (checked) {
    if (!matieresArray.value.includes(matiereId)) {
      matieresArray.push(this.fb.control(matiereId));
    }
  } else {
    const index = matieresArray.value.indexOf(matiereId);
    if (index >= 0) {
      matieresArray.removeAt(index);
    }
  }
}


  isMatiereSelected(matiereId: number): boolean {
    return this.matieresIdsArray.value.includes(matiereId);
  }

  getSelectedMatieres(): MatiereDto[] {
    const selectedIds = this.matieresIdsArray.value;
    return this.matieres.filter(matiere => selectedIds.includes(matiere.id));
  }

  // Gestion des disponibilités
  ajouterDisponibilite(): void {
    const disponibiliteGroup = this.fb.group({
      jourSemaine: ['LUNDI', Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['12:00', Validators.required]
    });

    this.disponibilitesArray.push(disponibiliteGroup);
  }

  supprimerDisponibilite(index: number): void {
    this.disponibilitesArray.removeAt(index);
  }

  // Validation des disponibilités pour éviter les chevauchements
  private validateDisponibilites(): string | null {
    const disponibilites = this.disponibilitesArray.value as DisponibiliteDto[];
    
    // Grouper par jour
    const disponibilitesParJour = disponibilites.reduce((acc, dispo) => {
      if (!acc[dispo.jourSemaine]) {
        acc[dispo.jourSemaine] = [];
      }
      acc[dispo.jourSemaine].push({
        debut: this.timeToMinutes(dispo.heureDebut),
        fin: this.timeToMinutes(dispo.heureFin)
      });
      return acc;
    }, {} as { [jour: string]: { debut: number, fin: number }[] });

    // Vérifier les chevauchements pour chaque jour
    for (const jour in disponibilitesParJour) {
      const creneaux = disponibilitesParJour[jour];
      
      // Trier par heure de début
      creneaux.sort((a, b) => a.debut - b.debut);
      
      // Vérifier les chevauchements
      for (let i = 0; i < creneaux.length - 1; i++) {
        const creneauActuel = creneaux[i];
        const creneauSuivant = creneaux[i + 1];
        
        if (creneauActuel.debut >= creneauActuel.fin) {
          return `Horaire invalide pour ${jour}: l'heure de fin doit être après l'heure de début`;
        }
        
        if (creneauActuel.fin > creneauSuivant.debut) {
          return `Chevauchement d'horaires détecté pour ${jour}: les créneaux ne peuvent pas se chevaucher`;
        }
      }
      
      // Vérifier le dernier créneau
      const dernierCreneau = creneaux[creneaux.length - 1];
      if (dernierCreneau.debut >= dernierCreneau.fin) {
        return `Horaire invalide pour ${jour}: l'heure de fin doit être après l'heure de début`;
      }
    }

    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Validation du formulaire
  private validateForm(): string | null {
    if (this.enseignantForm.invalid) {
      if (this.enseignantForm.get('matricule')?.invalid) {
        return 'Le matricule est requis et doit contenir au moins 3 caractères';
      }
      if (this.enseignantForm.get('nomComplet')?.invalid) {
        return 'Le nom complet est requis et doit contenir au moins 2 caractères';
      }
      if (this.enseignantForm.get('email')?.invalid) {
        return 'L\'email est requis et doit être valide';
      }
      if (this.enseignantForm.get('telephone')?.invalid) {
        return 'Le numéro de téléphone n\'est pas valide';
      }
      if (this.enseignantForm.get('idDepartement')?.invalid) {
        return 'Le département est requis';
      }
      if (this.matieresIdsArray.length === 0) {
        return 'Au moins une matière doit être sélectionnée';
      }
      if (this.enseignantForm.get('anciennete')?.invalid) {
        return 'L\'ancienneté doit être comprise entre 0 et 50 ans';
      }
    }

    return this.validateDisponibilites();
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.isSubmitting = true;

    const formValue = this.enseignantForm.value;
    
    // Formater les disponibilités selon le format attendu par le backend
    const disponibilitesFormatees = formValue.disponibilites.map((dispo: DisponibiliteDto) => ({
      jourSemaine: dispo.jourSemaine,
      heureDebut: dispo.heureDebut + ':00', // Ajouter les secondes
      heureFin: dispo.heureFin + ':00'
    }));

    const enseignantToCreate: EnseignantDto = {
      matricule: formValue.matricule.trim(),
      nomComplet: formValue.nomComplet.trim(),
      email: formValue.email.trim(),
      telephone: formValue.telephone?.trim() || undefined,
      diplome: formValue.diplome || undefined,
      grade: formValue.grade || undefined,
      anciennete: formValue.anciennete || undefined,
      idDepartement: formValue.idDepartement,
      idEtablissement: 1, // Valeur fixe comme dans l'exemple
      matieresIds: formValue.matieresIds, // Utiliser matieresIds au lieu de matieres
      disponibilites: disponibilitesFormatees
    };

    console.log('Données à envoyer au backend:', enseignantToCreate);

    this.enseignantService.createEnseignant(enseignantToCreate)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création de l\'enseignant:', error);
          
          if (error.status === 409 || error.message?.includes('existe déjà')) {
            this.errorMessage = 'Un enseignant avec cet email ou ce matricule existe déjà.';
          } else if (error.status === 400) {
            this.errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
          } else {
            this.errorMessage = 'Erreur lors de la création de l\'enseignant. Veuillez réessayer.';
          }
          
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
          
          // Effacer les messages après un délai
          setTimeout(() => {
            this.errorMessage = '';
            this.successMessage = '';
          }, 5000);
        })
      )
      .subscribe(response => {
            console.log('Données à renvoyer par backend:', response);
        if (response) {

          if(response.codeRetour === 409){
            this.errorMessage =  response.message || 'Un enseignant avec cet email ou matricule existe déjà.';
           this.lastCreatedEnseignant = null;
               console.error('Enseignant error:', response);
          }else
             if(response.codeRetour === 404){
            this.errorMessage =  response.message || 'Enseignant non trouvé.';
                       this.lastCreatedEnseignant = null;
                                      console.error('Enseignant error:', response);
          }
          else{
             console.log('Données à renvoyer par backend:', response);
 this.successMessage = response.message || 'Enseignant créé avec succès !';
   this.lastCreatedEnseignant = response;
      console.log('Enseignant créé:', response);
          
          setTimeout(() => {
            this.showConfirmModal = true;
            this.successMessage = '';
          }, 2000);
          }

          
         
        
       
        }
      });
  }

  // Méthodes utilitaires pour l'affichage
  getDepartementSelectionne(): DepartementDto | undefined {
    const idDepartement = this.enseignantForm.get('idDepartement')?.value;
    return this.departements.find(dept => dept.id === idDepartement);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.enseignantForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.enseignantForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['email']) return 'Email invalide';
      if (field.errors['minlength']) return `${fieldName} trop court`;
      if (field.errors['pattern']) return `${fieldName} invalide`;
      if (field.errors['min']) return 'Valeur trop petite';
      if (field.errors['max']) return 'Valeur trop grande';
    }
    return '';
  }

  // Actions
  onCancel(): void {
    if (this.enseignantForm.dirty) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        this.router.navigate(['/dashboard/professeurs']);
      }
    } else {
      this.router.navigate(['/dashboard/professeurs']);
    }
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.router.navigate(['/dashboard/professeurs']);
  }

  createAnother(): void {
    this.showConfirmModal = false;
    this.resetForm();
    this.successMessage = 'Vous pouvez créer un nouvel enseignant';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private resetForm(): void {
    this.enseignantForm.reset();
    this.matieresIdsArray.clear();
    this.disponibilitesArray.clear();
    this.errorMessage = '';
    this.successMessage = '';
    this.lastCreatedEnseignant = null;
  }
}