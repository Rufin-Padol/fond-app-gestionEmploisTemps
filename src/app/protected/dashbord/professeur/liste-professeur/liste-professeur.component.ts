import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartementDto, DisponibiliteDto, EnseignantDto, JourDto, MatiereDto } from '../../../../core/model/models';
import { EnseignantServiceService } from '../../../../core/services/enseignant-service.service';
import { catchError, finalize, of } from 'rxjs';
import { Jour } from '../../../../core/model/enums';
import { DepartementServiceService } from '../../../../core/services/departement-service.service';
import { MatiereServiceService } from '../../../../core/services/matiere-service.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PlanningServiceService } from '../../../../core/services/planning-service.service';

const JOURS_SEMAINE = [
  'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'
];

const GRADES = [
  'Professeur Titulaire',
  'Maître de Conférences', 
  'Maître Assistant',
  'Assistant',
  'Chargé de Cours',
  'PCEG',
  'PLEG'
];

interface EnseignantFilters {
  recherche: string;
  departement: string;
  grade: string;
  diplome: string;
}
@Component({
  selector: 'app-liste-professeur',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './liste-professeur.component.html',
  styleUrl: './liste-professeur.component.css'
})
export class ListeProfesseurComponent implements OnInit {
 loading = false;
  isSaving = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  // Données
  enseignants: EnseignantDto[] = [];
  departements: DepartementDto[] = [];
  matieres: MatiereDto[] = [];

  // Modals
  showDetailsModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedEnseignant: EnseignantDto | null = null;
  editingEnseignant: EnseignantDto | null = null;
  enseignantToDelete: EnseignantDto | null = null;

  // Forms
  editForm!: FormGroup;

  // Filtres
  filtres: EnseignantFilters = {
    recherche: '',
    departement: '',
    grade: '',
    diplome: ''
  };

  filteredDiplomes: string[] = [];
showDiplomeDropdown = false;
showAddDiplomeButton = false;

  // Données de référence
  // readonly grades = [
  //   'PCEG', 'PLEG', 'Professeur Titulaire', 'Maître de Conférences',
  //   'Professeur Agrégé', 'Professeur Certifié', 'Professeur Contractuel',
  //   'Assistant', 'Vacataire'
  // ];

 // Remplacez votre tableau diplomes existant par :
diplomes = [
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

  jours:JourDto[] = [];

  private router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private enseignantService: EnseignantServiceService,
    private departementService: DepartementServiceService,
    private matiereService: MatiereServiceService,
    private authservice :AuthService,
    private planingservice : PlanningServiceService
  ) {
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadAllData();
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
  const gradeControl = this.editForm.get('grade');
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
  
  const gradeControl = this.editForm.get('grade');
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
    const gradeControl = this.editForm.get('grade');
    const currentValue = gradeControl?.value?.trim();
    
    // Ne fermer que si vide ou valeur existante
    if (!currentValue || this.grades.includes(currentValue)) {
      this.showDropdown = false;
      this.showAddButton = false;
    }
  }, 200);
}

selectGrade(grade: string) {
  const gradeControl = this.editForm.get('grade');
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
  const diplomeControl = this.editForm.get('diplome');
  if (!diplomeControl) return;

  const value = diplomeControl.value?.toLowerCase() || '';
  this.filteredDiplomes = this.diplomes.filter(diplome => 
    diplome.toLowerCase().includes(value)
  );
  
  this.showDiplomeDropdown = true;
  this.showAddDiplomeButton = !!value && !this.diplomes.some(d => d.toLowerCase() === value.toLowerCase());
}

selectDiplome(diplome: string) {
  const diplomeControl = this.editForm.get('diplome');
  if (diplomeControl) {
    diplomeControl.setValue(diplome);
  }
  this.showDiplomeDropdown = false;
  this.showAddDiplomeButton = false;
}

addNewDiplome(event: MouseEvent) {
  event.preventDefault();
  
  const diplomeControl = this.editForm.get('diplome');
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
    const diplomeControl = this.editForm.get('diplome');
    const currentValue = diplomeControl?.value?.trim();
    
    if (!currentValue || this.diplomes.includes(currentValue)) {
      this.showDiplomeDropdown = false;
      this.showAddDiplomeButton = false;
    }
  }, 200);
}

  private initEditForm(): void {
    this.editForm = this.fb.group({
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      nomComplet: ['', [Validators.required, Validators.minLength(2)]],
      email: [''],
      telephone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      diplome: [''],
      grade: [''],
      anciennete: [null, [Validators.min(0), Validators.max(50)]],
      idDepartement: [null, Validators.required],
      matieresIds: this.fb.array([], Validators.required),
      disponibilites: this.fb.array([])
    });
  }

  // Getters pour les FormArrays du formulaire d'édition
  get editMatieresIdsArray(): FormArray {
    return this.editForm.get('matieresIds') as FormArray;
  }

  get editDisponibilitesArray(): FormArray {
    return this.editForm.get('disponibilites') as FormArray;
  }

  private loadAllData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Charger les enseignants
    this.enseignantService.getEnseignantsByEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des enseignants:', error);
          this.errorMessage = 'Erreur lors du chargement des enseignants';
          return of([]);
        })
      )
      .subscribe(enseignants => {
        this.enseignants = enseignants;
        this.loadJours();
        console.log('Enseignants chargés:', this.enseignants);
      });

    // Charger les départements
    this.departementService.getDepartementsByEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des départements:', error);
          return of([]);
        })
      )
      .subscribe(departements => {
        this.departements = departements;
        console.log('Départements chargés:', this.departements);
      });

    // Charger les matières
    this.matiereService.getAllMatieres()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des matières:', error);
          return of([]);
        }),
        finalize(() => {
      setTimeout(() => {
        this.loading = false;
      }, 3000);
    })
      )
      .subscribe(matieres => {
        this.matieres = matieres;
      });
  }

  // Méthodes de filtrage
  getEnseignantsFiltered(): EnseignantDto[] {
    return this.enseignants.filter(enseignant => {
      const matchRecherche = this.filtres.recherche ? 
        enseignant.nomComplet.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        enseignant.email.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        enseignant.matricule.toLowerCase().includes(this.filtres.recherche.toLowerCase()) : true;
      
      const matchDepartement = this.filtres.departement ? 
        enseignant.idDepartement?.toString() === this.filtres.departement : true;
      
      const matchGrade = this.filtres.grade ? 
        enseignant.grade === this.filtres.grade : true;
      
      const matchDiplome = this.filtres.diplome ? 
        enseignant.diplome === this.filtres.diplome : true;
      
      return matchRecherche && matchDepartement && matchGrade && matchDiplome;
    });
  }

  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      departement: '',
      grade: '',
      diplome: ''
    };
  }

  // Navigation
  creerNouvelEnseignant(): void {
    this.router.navigate(['dashboard/professeurs/new-professeur']);
  }

  // Méthodes utilitaires
  getDepartementNom(idDepartement: number | undefined): string {
    if (!idDepartement) return 'Non défini';
    const dept = this.departements.find(d => d.id === idDepartement);
    return dept ? dept.nom : 'Département inconnu';
  }

  getMatiereNom(idMatiere: number): string {
    const matiere = this.matieres.find(m => m.id === idMatiere);
    return matiere ? matiere.nom : 'Matière inconnue';
  }

  // Modal de détails
  voirDetails(enseignant: EnseignantDto): void {
    this.selectedEnseignant = enseignant;
    this.showDetailsModal = true;
  }

  fermerDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEnseignant = null;
  }

  // Modal de modification
  modifierEnseignant(enseignant: EnseignantDto): void {
    this.editingEnseignant = { ...enseignant };
    this.populateEditForm(enseignant);
    this.showEditModal = true;
  }

  private populateEditForm(enseignant: EnseignantDto): void {

    console.log('Enseignant à modifier:', enseignant);
    console.log('Matières de l\'enseignant:', enseignant.matieres);
    console.log('Toutes les matières disponibles:', this.matieres);
    // Réinitialiser le formulaire
    this.editForm.reset();
    this.editMatieresIdsArray.clear();
    this.editDisponibilitesArray.clear();

    // Remplir les champs de base
    this.editForm.patchValue({
      matricule: enseignant.matricule,
      nomComplet: enseignant.nomComplet,
      email: enseignant.email,
      telephone: enseignant.telephone || '',
      diplome: enseignant.diplome || '',
      grade: enseignant.grade || '',
      anciennete: enseignant.anciennete,
      idDepartement: enseignant.idDepartement
    });

    // Remplir les matières
    // CORRECTION: Remplir les matières
    if (enseignant.matieres && enseignant.matieres.length > 0) {
      const matieresIds = enseignant.matieres.map(m => m.id);
      this.editForm.patchValue({
        matieresIds: matieresIds
      });
      // Ajouter chaque ID au FormArray
      matieresIds.forEach(id => {
        this.editMatieresIdsArray.push(this.fb.control(id));
      });
    }

    // Remplir les disponibilités
    if (enseignant.disponibilites) {
      enseignant.disponibilites.forEach(dispo => {
        const disponibiliteGroup = this.fb.group({
          jourSemaine: [dispo.jourSemaine, Validators.required],
          heureDebut: [dispo.heureDebut?.substring(0, 5) || '08:00', Validators.required],
          heureFin: [dispo.heureFin?.substring(0, 5) || '12:00', Validators.required]
        });
        this.editDisponibilitesArray.push(disponibiliteGroup);
      });
    }
  }

  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingEnseignant = null;
  }

  annulerModifications(): void {
    this.fermerEditModal();
  }

  // Gestion des matières dans le formulaire d'édition
  onMatiereChangeInEdit(matiereId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    const matieresArray = this.editMatieresIdsArray;

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

  isMatiereSelectedInEdit(matiereId: number): boolean {
    return this.editMatieresIdsArray.value.includes(matiereId);
  }

  // Gestion des disponibilités dans le formulaire d'édition
  ajouterDisponibiliteEdit(): void {
    const disponibiliteGroup = this.fb.group({
      jourSemaine: ['LUNDI', Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['12:00', Validators.required]
    });
    this.editDisponibilitesArray.push(disponibiliteGroup);
  }

  supprimerDisponibiliteEdit(index: number): void {
    this.editDisponibilitesArray.removeAt(index);
  }

  // Validation du formulaire d'édition
  private validateEditForm(): string | null {
    if (this.editForm.invalid) {
      if (this.editForm.get('matricule')?.invalid) {
        return 'Le matricule est requis et doit contenir au moins 3 caractères';
      }
      if (this.editForm.get('nomComplet')?.invalid) {
        return 'Le nom complet est requis et doit contenir au moins 2 caractères';
      }
      if (this.editForm.get('email')?.invalid) {
        return 'L\'email est requis et doit être valide';
      }
      if (this.editForm.get('telephone')?.invalid) {
        return 'Le numéro de téléphone n\'est pas valide';
      }
      if (this.editForm.get('idDepartement')?.invalid) {
        return 'Le département est requis';
      }
      if (this.editMatieresIdsArray.length === 0) {
        return 'Au moins une matière doit être sélectionnée';
      }
      if (this.editForm.get('anciennete')?.invalid) {
        return 'L\'ancienneté doit être comprise entre 0 et 50 ans';
      }
    }

    return this.validateDisponibilites();
  }

  private validateDisponibilites(): string | null {
    const disponibilites = this.editDisponibilitesArray.value as DisponibiliteDto[];
    
    if (disponibilites.length === 0) return null;

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

  // Sauvegarde des modifications
  sauvegarderEnseignant(): void {
    if (this.isSaving || !this.editingEnseignant) return;

    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validateEditForm();
    if (validationError) {
      this.errorMessage = validationError;
      this.scheduleMessageClear();
      return;
    }

    this.isSaving = true;

    const formValue = this.editForm.value;
    
    // Formater les disponibilités
    const disponibilitesFormatees = formValue.disponibilites.map((dispo: DisponibiliteDto) => ({
      jourSemaine: dispo.jourSemaine,
      heureDebut: dispo.heureDebut + ':00',
      heureFin: dispo.heureFin + ':00'
    }));

    const enseignantToUpdate: EnseignantDto = {
      ...this.editingEnseignant,
      matricule: formValue.matricule.trim(),
      nomComplet: formValue.nomComplet.trim(),
      email: formValue.email.trim(),
      telephone: formValue.telephone?.trim() || undefined,
      diplome: formValue.diplome || undefined,
      grade: formValue.grade || undefined,
      anciennete: formValue.anciennete || undefined,
      idDepartement: formValue.idDepartement,
      matieresIds: formValue.matieresIds,
      disponibilites: disponibilitesFormatees
    };

    console.log("donne envoyer",enseignantToUpdate)

    this.enseignantService.updateEnseignant(this.editingEnseignant.id!, enseignantToUpdate)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la modification de l\'enseignant:', error);
          
          if (error.status === 409 || error.message?.includes('existe déjà')) {
            this.errorMessage = 'Un enseignant avec cet email ou ce matricule existe déjà.';
          } else if (error.status === 400) {
            this.errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
          } else {
            this.errorMessage = 'Erreur lors de la modification de l\'enseignant. Veuillez réessayer.';
          }
          
          return of(null);
        }),
        finalize(() => {
          this.isSaving = false;
          this.scheduleMessageClear();
        })
      )
      .subscribe(response => {
        if (response) {
           console.log('Données à renvoyer par backend:', response);
          this.successMessage =  response.message || 'Enseignant modifié avec succès !';
          
          // Mettre à jour la liste locale
          const index = this.enseignants.findIndex(e => e.id === this.editingEnseignant!.id);
          if (index !== -1) {
            this.enseignants[index] = { ...enseignantToUpdate };
          }
          this.loadAllData();
          this.fermerEditModal();
        }
      });
  }

  // Modal de suppression
  confirmerSuppression(enseignant: EnseignantDto): void {
    this.enseignantToDelete = enseignant;
    this.showDeleteModal = true;
  }

  fermerDeleteModal(): void {
    this.showDeleteModal = false;
    this.enseignantToDelete = null;
  }

  supprimerEnseignant(): void {
    if (this.isDeleting || !this.enseignantToDelete) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.enseignantService.deleteEnseignant(this.enseignantToDelete.id!)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression de l\'enseignant:', error);
          this.errorMessage = 'Erreur lors de la suppression de l\'enseignant. Veuillez réessayer.';
          return of(null);
        }),
        finalize(() => {
          this.isDeleting = false;
          this.scheduleMessageClear();
        })
      )
      .subscribe(response => {
        if (response !== null) {
          this.successMessage = `Enseignant ${this.enseignantToDelete!.nomComplet} supprimé avec succès !`;
          
          // Retirer de la liste locale
          this.enseignants = this.enseignants.filter(e => e.id !== this.enseignantToDelete!.id);
          
          this.fermerDeleteModal();
        }
      });
  }

  // Validation des champs
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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

  // Gestion des messages
  private scheduleMessageClear(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }



  loadJours(){
    this.planingservice.getJoursParEtablissement(this.authservice.getIdEtablessement()).subscribe({
      next:(rep:JourDto[])=>{

        this.jours =  rep ;

      },
      error:(erro)=>{
   console.log(erro)
      }
    })
  }


}