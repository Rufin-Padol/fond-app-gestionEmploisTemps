import { Component } from '@angular/core';
import {
  ClasseDto,
 
  CreneauDto,
  EmploiDuTempsClasseDto,
  EnseignantDto,
  MatiereDto,
  SalleDto,
  HoraireDTO,
  DisponibiliteDto,
} from '../../../../core/model/models';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategorieMatiere, Jour, TypeCours } from '../../../../core/model/enums';
import { CommonModule } from '@angular/common';
import { PlanningServiceService } from '../../../../core/services/planning-service.service';
import { catchError, finalize, of } from 'rxjs';
import { MatiereServiceService } from '../../../../core/services/matiere-service.service';
import { ClasseServiceService } from '../../../../core/services/classe-service.service';
import { EnseignantServiceService } from '../../../../core/services/enseignant-service.service';
import { CreneauServiceService } from '../../../../core/services/creneau-service.service';
import { EmploiDuTempsServiceService } from '../../../../core/services/emploi-du-temps-service.service';
import { AuthService } from '../../../../core/services/auth.service';

interface HoraireGroupe {
  heureDebut: string;
  heureFin: string;
}

interface SalleOccupationInfo {
  salle: SalleDto;
  classesOccupantes: string[];
  peutPartager: boolean;
}

interface EnseignantDisponibiliteInfo {
  enseignant: EnseignantDto;
  disponible: boolean;
  heuresRestantes: number;
  raisonIndisponibilite?: string;
}

@Component({
  selector: 'app-new-emplois-classe',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './new-emplois-classe.component.html',
  styleUrl: './new-emplois-classe.component.css',
})
export class NewEmploisClasseComponent {
 form!: FormGroup;
  creneaux: CreneauDto[] = [];
  selectedCreneau: CreneauDto | null = null;
  conflictMessage: string = '';

  // Gestion de la classe sélectionnée
  selectedClasseId: number | null = null;
  selectedClasse: ClasseDto | null = null;

  // Données principales
  classes: ClasseDto[] = [];
  matieres: MatiereDto[] = [];
  enseignants: EnseignantDto[] = [];
  salles: SalleDto[] = this.generateSalles();
  
  // Données filtrées selon le contexte
  horairesDisponibles: HoraireDTO[] = [];
  matieresDisponibles: MatiereDto[] = [];
  enseignantsDisponibles: EnseignantDto[] = [];
  sallesDisponibles: SalleDto[] = [];

  // Configuration UI
  jours = Object.values(Jour);
  typesCours = Object.values(TypeCours);
  horaires: HoraireDTO[] = [];

  // État des sélections pour validation intelligente
  selectedJour: Jour | null = null;
  selectedHoraire: HoraireDTO | null = null;
  selectedMatiere: MatiereDto | null = null;
  selectedEnseignant: EnseignantDto | null = null;

  // Labels pour l'affichage
  private joursLabels: Record<string, string> = {
    'LUNDI': 'Lun',
    'MARDI': 'Mar',
    'MERCREDI': 'Mer',
    'JEUDI': 'Jeu',
    'VENDREDI': 'Ven',
    'SAMEDI': 'Sam',
    'DIMANCHE': 'Dim'
  };

  private typesLabels: Record<string, string> = {
    'COURS': 'Cours',
    'TD': 'TD',
    'TP': 'TP',
    'CONTROLE': 'Contrôle',
    'EXAMEN': 'Examen'
  };

  loading: boolean = false;
  showSalleModal: boolean = false;
  salleConflictInfo: SalleOccupationInfo | null = null;

  constructor(
    private fb: FormBuilder,
    private enseignantService: EnseignantServiceService, 
    private router: Router, 
    private planningService: CreneauServiceService, 
   
    private matiereService: MatiereServiceService, 
    private classeService: ClasseServiceService,
    private emploiDuTempsService : EmploiDuTempsServiceService,
    private planningHoraireService : PlanningServiceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.chargeHoraire();
    this.loadMatire();
    this.loadClasse();
    this.loadEnsiegnant();
  }

  /**
   * Initialisation du formulaire avec validation intelligente
   */
  private initForm(): void {
    this.form = this.fb.group({
      jour: ['', Validators.required],
      horaireId: ['', Validators.required],
      type: [TypeCours.COURS, Validators.required],
      matiereId: ['', Validators.required],
      enseignantId: ['', Validators.required],
      
      classeId: [this.selectedClasseId, Validators.required],
    });

    // Écouter les changements pour la validation en temps réel
    this.form.get('jour')?.valueChanges.subscribe(jour => {
      if (jour) {
         console.log('📅 Jour sélectionné:', jour);
        this.onJourChange(jour);
      }
    });

    this.form.get('horaireId')?.valueChanges.subscribe(horaireId => {
      if (horaireId) {
        console.log('🕐 Horaire sélectionné ID:', horaireId);
        this.onHoraireChange(horaireId);
      }
    });

    this.form.get('matiereId')?.valueChanges.subscribe(matiereId => {
      if (matiereId) {
        this.onMatiereChange(matiereId);
      }
    });

    this.form.get('enseignantId')?.valueChanges.subscribe(enseignantId => {
      if (enseignantId) {
        this.onEnseignantChange(enseignantId);
      }
    });
  }

  /**
   * Gestion du changement de classe sélectionnée
   */
  onClasseChange(): void {
    console.log('📚 Classe sélectionnée ID:', this.selectedClasseId);
    
    if (this.selectedClasseId && this.selectedClasseId !== null) {
      this.selectedClasse = this.classes.find(c => c.id === Number(this.selectedClasseId)) || null;
      console.log('📚 Classe trouvée:', this.selectedClasse);
      
      if (this.selectedClasse) {
        this.form.patchValue({ classeId: this.selectedClasseId });
        this.loadEmploiDuTempsForClasse();
      }
    } else {
      this.selectedClasse = null;
      this.creneaux = [];
      this.form.patchValue({ classeId: null });
    }
    
    this.resetForm();
  }

  /**
   * Chargement de l'emploi du temps existant pour la classe
   */
  private loadEmploiDuTempsForClasse(): void {
    if (!this.selectedClasse) {
      this.creneaux = [];
      return;
    }

    console.log('📅 Chargement emploi du temps pour classe:', this.selectedClasse.nom);
    
    this.loading = true;
    this.emploiDuTempsService.getEmploiDuTempsClasse( this.selectedClasse.idEmploiDuTemps || 0)
      .pipe(
        catchError(error => {
          console.error('❌ Erreur lors du chargement de l\'emploi du temps:', error);
          console.error('❌ Erreur lors du chargement de l\'emploi du temps:', error);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((emploi: EmploiDuTempsClasseDto | null) => {
        if (emploi && emploi.creneaux) {
          this.creneaux = emploi.creneaux;
          console.log('✅ Créneaux chargés:', this.creneaux.length);
        } else {
          this.creneaux = [];
        }
      });
  }

  /**
   * Gestion du changement de jour - Filtre les horaires disponibles
   */
  onJourChange(jour: Jour): void {
    console.log('📅 Jour sélectionné:', jour);
    this.selectedJour = jour;
    
    // Réinitialiser les sélections suivantes
    this.form.patchValue({
      horaireId: '',
      matiereId: '',
      enseignantId: '',
      salleId: ''
    });

    this.filterHorairesDisponibles(jour);
  }

  /**
   * Filtre les horaires disponibles pour un jour donné
   */
  private filterHorairesDisponibles(jour: Jour): void {
    if (!this.selectedClasse) return;

    console.log('🕐 Filtrage des horaires pour le', jour);

    // Récupérer les créneaux déjà pris pour ce jour et cette classe
    const creneauxPrisPourJour = this.creneaux.filter(c => c.jourSemaine === jour);
    console.log('⏰ Créneaux déjà pris:', creneauxPrisPourJour.length);

    // Filtrer les horaires disponibles
    this.horairesDisponibles = this.horaires.filter(horaire => {
      // Vérifier si cet horaire est déjà pris
      const estPris = creneauxPrisPourJour.some(creneau => 
        creneau.heureDebut === horaire.heureDebut && 
        creneau.heureFin === horaire.heureFin
      );

      return !estPris;
    });

    console.log('✅ Horaires disponibles:', this.horairesDisponibles.length);
  }

  /**
   * Gestion du changement d'horaire - Filtre les matières
   */
  onHoraireChange(horaireId: number): void {
    console.log('🕐 Horaire sélectionné ID:', horaireId);
    console.log('🕐 Recherche de l\'horaire... parmis', this.horairesDisponibles.length, 'horaires disponibles',  this.horairesDisponibles);
    this.selectedHoraire = this.horairesDisponibles.find(h => h.id === Number(horaireId)) || null;
    console.log('🔍 Type de h.id:', typeof this.horairesDisponibles[0]?.id, 'Type de horaireId:', typeof horaireId);

      console.log('🕐 Horaire nomtrouver:', this.selectedHoraire?.label);
    if (!this.selectedHoraire) return;

    console.log('🕐 Horaire trouvé:', this.selectedHoraire.label);

    // Réinitialiser les sélections suivantes
    this.form.patchValue({
      matiereId: '',
      enseignantId: '',
      salleId: ''
    });

    this.filterMatieresDisponibles();
  }

  /**
   * Filtre les matières disponibles (toutes car une matière peut être répétée)
   */
  private filterMatieresDisponibles(): void {
    // Une matière peut être enseignée plusieurs fois dans la même journée
    // donc on garde toutes les matières disponibles
    this.matieresDisponibles = [...this.matieres];
    console.log('📚 Matières disponibles:', this.matieresDisponibles.length);
  }

  /**
   * Gestion du changement de matière - Filtre les enseignants
   */
  onMatiereChange(matiereId: number): void {
    console.log('📚 Matière sélectionnée ID:', matiereId);
    
    this.selectedMatiere = this.matieres.find(m => m.id === Number(matiereId)) || null;
    if (!this.selectedMatiere) return;

    console.log('📚 Matière trouvée:', this.selectedMatiere.nom);

    // Réinitialiser les sélections suivantes
    this.form.patchValue({
      enseignantId: '',
      salleId: ''
    });

    this.filterEnseignantsDisponibles();
  }

  /**
   * Filtre les enseignants disponibles selon plusieurs critères
   */
  private filterEnseignantsDisponibles(): void {
    if (!this.selectedJour || !this.selectedHoraire || !this.selectedMatiere) return;

    console.log('👨‍🏫 Filtrage des enseignants disponibles...');

    this.loading = true;

    // Vérifier chaque enseignant
    const verificationsEnseignants = this.enseignants.map(enseignant => 
      this.verifierDisponibiliteEnseignant(enseignant, this.selectedJour!, this.selectedHoraire!)
    );

    Promise.all(verificationsEnseignants).then(resultats => {
      this.enseignantsDisponibles = this.enseignants.filter((enseignant, index) => {
        const resultat = resultats[index];
        
        // Vérifier si l'enseignant enseigne cette matière
        const enseigneMatiere = enseignant.matieres?.some(m => m.id === this.selectedMatiere!.id) || false;
        
        console.log(`👨‍🏫 ${enseignant.nomComplet}: enseigne ${this.selectedMatiere!.nom}=${enseigneMatiere}, disponible=${resultat.disponible}`);
        
        return enseigneMatiere && resultat.disponible;
      });

      console.log('✅ Enseignants disponibles:', this.enseignantsDisponibles.length);
      this.loading = false;
    });
  }

  /**
   * Vérifie la disponibilité d'un enseignant pour un jour et horaire donnés
   */
  private async verifierDisponibiliteEnseignant(
    enseignant: EnseignantDto, 
    jour: Jour, 
    horaire: HoraireDTO
  ): Promise<EnseignantDisponibiliteInfo> {
    
    // 1. Vérifier les disponibilités de base de l'enseignant
    const disponibiliteJour = enseignant.disponibilites?.find(d => d.jourSemaine === jour);
    
    if (!disponibiliteJour) {
      return {
        enseignant,
        disponible: false,
        heuresRestantes: 0,
        raisonIndisponibilite: 'Pas de disponibilité ce jour'
      };
    }

    // 2. Vérifier si l'horaire demandé rentre dans la plage de disponibilité
    if (!this.horaireEstDansPlage(horaire, disponibiliteJour)) {
      return {
        enseignant,
        disponible: false,
        heuresRestantes: 0,
        raisonIndisponibilite: 'Horaire hors plage de disponibilité'
      };
    }

    // 3. Calculer les heures déjà utilisées par cet enseignant dans cette plage
    const heuresUtilisees = await this.calculerHeuresUtiliseesEnseignant(enseignant, jour, disponibiliteJour);
    const heuresDisponibiliteTotal = this.calculerDureeEnHeures(disponibiliteJour.heureDebut, disponibiliteJour.heureFin);
    const heuresDemandees = this.calculerDureeEnHeures(horaire.heureDebut!, horaire.heureFin!);
    const heuresRestantes = heuresDisponibiliteTotal - heuresUtilisees;

    const disponible = heuresRestantes >= heuresDemandees;

    return {
      enseignant,
      disponible,
      heuresRestantes,
      raisonIndisponibilite: disponible ? undefined : `Quota dépassé (${heuresRestantes}h restantes)`
    };
  }

  /**
   * Vérifie si un horaire est inclus dans une plage de disponibilité
   */
  private horaireEstDansPlage(horaire: HoraireDTO, disponibilite: DisponibiliteDto): boolean {
    const horaireDebut = this.timeToMinutes(horaire.heureDebut!);
    const horaireFin = this.timeToMinutes(horaire.heureFin!);
    const dispoDebut = this.timeToMinutes(disponibilite.heureDebut);
    const dispoFin = this.timeToMinutes(disponibilite.heureFin);

    return horaireDebut >= dispoDebut && horaireFin <= dispoFin;
  }

  /**
   * Calcule les heures déjà utilisées par un enseignant dans une plage de disponibilité
   */
  private async calculerHeuresUtiliseesEnseignant(
    enseignant: EnseignantDto, 
    jour: Jour, 
    disponibilite: DisponibiliteDto
  ): Promise<number> {
    
    try {
      // Récupérer l'emploi du temps complet de l'enseignant depuis le backend
      const emploiEnseignant = await this.emploiDuTempsService.getEmploiDuTempsEnseignant(enseignant.id!).toPromise();
      
      if (!emploiEnseignant || !emploiEnseignant.creneaux) {
        return 0;
      }

      // Filtrer les créneaux pour ce jour et dans la plage de disponibilité
      const creneauxDansPlage = emploiEnseignant.creneaux.filter(creneau => {
        if (creneau.jour !== jour) return false;
        
        const creneauDebut = this.timeToMinutes(creneau.heureDebut);
        const creneauFin = this.timeToMinutes(creneau.heureFin);
        const dispoDebut = this.timeToMinutes(disponibilite.heureDebut);
        const dispoFin = this.timeToMinutes(disponibilite.heureFin);
        
        // Vérifier si le créneau chevauche avec la plage de disponibilité
        return creneauDebut < dispoFin && creneauFin > dispoDebut;
      });

      // Calculer le total des heures utilisées
      return creneauxDansPlage.reduce((total, creneau) => {
        return total + this.calculerDureeEnHeures(creneau.heureDebut, creneau.heureFin);
      }, 0);

    } catch (error) {
      console.error('❌ Erreur lors du calcul des heures utilisées:', error);
      return 0;
    }
  }

  /**
   * Gestion du changement d'enseignant - Filtre les salles
   */
  onEnseignantChange(enseignantId: number): void {
    console.log('👨‍🏫 Enseignant sélectionné ID:', enseignantId);
    
    this.selectedEnseignant = this.enseignants.find(e => e.id === Number(enseignantId)) || null;
    if (!this.selectedEnseignant) return;

    console.log('👨‍🏫 Enseignant trouvé:', this.selectedEnseignant.nomComplet);

    // Réinitialiser la sélection de salle
    this.form.patchValue({ salleId: '' });

    this.filterSallesDisponibles();
  }

  /**
   * Filtre les salles disponibles (toutes initialement)
   */
  private filterSallesDisponibles(): void {
    // Commencer avec toutes les salles
    this.sallesDisponibles = [...this.salles];
    console.log('🏫 Salles disponibles:', this.sallesDisponibles.length);
  }

  /**
   * Vérification de l'occupation d'une salle avant validation finale
   */
  // private async verifierOccupationSalle(salleId: number): Promise<SalleOccupationInfo> {
  //   const salle = this.salles.find(s => s.id === Number(salleId));
  //   if (!salle) {
  //     throw new Error('Salle non trouvée');
  //   }

  //   if (!this.selectedJour || !this.selectedHoraire) {
  //     throw new Error('Jour ou horaire non sélectionné');
  //   }

  //   try {
  //     // Récupérer tous les emplois du temps de l'établissement pour ce jour et horaire
  //     const emploisEtablissement = await this.emploiDuTempsService.getEmploisDuTempsEtablissement(
  //       this.selectedClasse!.idEtablissement!,
  //       this.selectedJour,
  //       this.selectedHoraire.heureDebut!,
  //       this.selectedHoraire.heureFin!
  //     ).toPromise();

  //     // Rechercher les classes qui occupent déjà cette salle
  //     const classesOccupantes: string[] = [];
      
  //     if (emploisEtablissement) {
  //       for (const emploi of emploisEtablissement) {
  //         const creneauxOccupants = emploi.creneaux.filter((creneau: { salle: { id: number; }; jourSemaine: Jour | null; heureDebut: any; heureFin: any; }) => 
  //           creneau.salle.id === salleId &&
  //           creneau.jourSemaine === this.selectedJour &&
  //           this.horairesChevauchent(
  //             { debut: creneau.heureDebut, fin: creneau.heureFin },
  //             { debut: this.selectedHoraire!.heureDebut!, fin: this.selectedHoraire!.heureFin! }
  //           )
  //         );

  //         if (creneauxOccupants.length > 0) {
  //           classesOccupantes.push(emploi.classe.nom);
  //         }
  //       }
  //     }

  //     return {
  //       salle,
  //       classesOccupantes,
  //       peutPartager: classesOccupantes.length > 0 // Possibilité de partage si déjà occupée
  //     };

  //   } catch (error) {
  //     console.error('❌ Erreur lors de la vérification d\'occupation de salle:', error);
  //     return {
  //       salle,
  //       classesOccupantes: [],
  //       peutPartager: false
  //     };
  //   }
  // }

  /**
   * Vérifie si deux horaires se chevauchent
   */
  // private horairesChevauchent(
  //   horaire1: { debut: string, fin: string }, 
  //   horaire2: { debut: string, fin: string }
  // ): boolean {
  //   return this.compareTime(horaire1.debut, horaire2.fin) < 0 && 
  //          this.compareTime(horaire2.debut, horaire1.fin) < 0;
  // }

  /**
   * Gestion de la soumission du formulaire avec toutes les vérifications
   */
  async handleSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedClasse) {
      console.log('❌ Formulaire invalide ou classe non sélectionnée');
      this.conflictMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    const formValue = this.form.value;
    console.log('📝 Soumission du formulaire:', formValue);

    this.loading = true;
    this.conflictMessage = '';
console.log('🔍 Vérification de l\'occupation de la salle...');
    try {
      // 1. Vérifier l'occupation de la salle
      // const salleInfo = await this.verifierOccupationSalle(formValue.salleId);
      
      // if (salleInfo.classesOccupantes.length > 0) {
      //   // Salle occupée - demander confirmation pour partage
      //   this.salleConflictInfo = salleInfo;
      //   this.showSalleModal = true;
      //   this.loading = false;
      //   return;
      // }

      // 2. Procéder à la création du créneau
      await this.creerCreneau(formValue);

    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      this.conflictMessage = 'Erreur lors de la création du créneau';
      this.loading = false;
    }
  }

  /**
   * Création effective du créneau
   */
  private async creerCreneau(formValue: any): Promise<void> {
    // Récupérer les objets complets
    const horaire = this.horaires.find(h => h.id == formValue.horaireId);
    const matiere = this.matieres.find(m => m.id == formValue.matiereId);
    const enseignant = this.enseignants.find(e => e.id == formValue.enseignantId);
    const salle = {
      id: 11,
      capacite :30,
      type :"Salle de classe",
      numero: "S001"
    };

    if (!horaire || !matiere || !enseignant || !salle) {
      this.conflictMessage = 'Erreur: données manquantes';
      this.loading = false;
      return;
    }

    // Créer le créneau
    // const creneau: CreneauDto = {
    //   id: this.selectedCreneau?.id || this.generateId(),
    //   jour: formValue.jour as Jour,
    //   heureDebut: horaire.heureDebut!,
    //   heureFin: horaire.heureFin!,
    //   type: formValue.type as TypeCours,
    //   matiere: matiere,
    //   enseignant: enseignant,
    //   salle: salle,
    //   periode: 1,
    //   emploiDuTempsId: this.selectedClasseId 
    // };
    const creneau: CreneauDto = {
  id: this.selectedCreneau?.id ||  0,
  jourSemaine: formValue.jour as Jour, // <-- ici, changement
  heureDebut: horaire.heureDebut!,
  heureFin: horaire.heureFin!,
  type: formValue.type as TypeCours,
  matiere: matiere,
  enseignant: enseignant,
  salle: salle,
  periode: 1,
  emploiDuTempsId: this.selectedClasse?.idEmploiDuTemps 
};

console.log("📤 Creneau envoyé :", JSON.stringify(creneau, null, 2));


    try {
      if (this.selectedCreneau) {
        // Modification
        if( !creneau.id) return;
        await this.planningService.updateCreneau(creneau.id,creneau).toPromise();
        const index = this.creneaux.findIndex(c => c.id === creneau.id);
        if (index !== -1) {
          this.creneaux[index] = creneau;
        }
        console.log('✅ Créneau modifié:', creneau);
      } else {
        // Ajout
         const creneau: CreneauDto = {
 
  jourSemaine: formValue.jour as Jour, // <-- ici, changement
  heureDebut: horaire.heureDebut!,
  heureFin: horaire.heureFin!,
  type: formValue.type as TypeCours,
  matiere: matiere,
  enseignant: enseignant,
  salle: salle,
  periode: 1,
  emploiDuTempsId: this.selectedClasse?.idEmploiDuTemps 
};
        const nouveauCreneau = await this.planningService.createCreneau(creneau).toPromise();
        if (nouveauCreneau) {
          this.creneaux.push(nouveauCreneau);
          console.log('✅ Nouveau créneau ajouté:', nouveauCreneau);
        }
      }

      this.resetForm();
      this.loading = false;

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      this.conflictMessage = 'Erreur lors de la sauvegarde du créneau';
      this.loading = false;
    }
  }

  /**
   * Confirmation du partage de salle
   */
  confirmerPartageSalle(partager: boolean): void {
    this.showSalleModal = false;

    if (partager && this.salleConflictInfo) {
      // L'utilisateur accepte le partage
      console.log('✅ Partage de salle accepté');
      this.creerCreneau(this.form.value);
    } else {
      // L'utilisateur refuse - réinitialiser la sélection de salle
      this.form.patchValue({ salleId: '' });
      this.conflictMessage = 'Veuillez choisir une autre salle';
    }

    this.salleConflictInfo = null;
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Convertit une heure en minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calcule la durée en heures entre deux horaires
   */
  private calculerDureeEnHeures(debut: string, fin: string): number {
    const minutesDebut = this.timeToMinutes(debut);
    const minutesFin = this.timeToMinutes(fin);
    return (minutesFin - minutesDebut) / 60;
  }

  /**
   * Compare deux heures
   */
  private compareTime(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    return minutes1 - minutes2;
  }

  // ==================== MÉTHODES HÉRITÉES (CONSERVÉES) ====================

  voirEmploiComplet(): void {
    if (!this.selectedClasse) return;
    
    console.log('📅 Navigation vers emploi du temps complet pour:', this.selectedClasse);
    
    this.router.navigate(['/dashboard/emplois-du-temps/viewEmploisTempSalle'], {
      queryParams: { id_emploisTemps:  this.selectedClasse?.idEmploiDuTemps }
    });
  }

  // editCreneau(creneau: CreneauDto): void {
  //   console.log('✏️ Édition du créneau:', creneau);
  //   this.selectedCreneau = creneau;
    
  //   // Trouver l'horaire correspondant
  //   const horaire = this.horaires.find(h => 
  //     h.heureDebut === creneau.heureDebut && h.heureFin === creneau.heureFin
  //   );

  //   this.form.patchValue({
  //     jour: creneau.jourSemaine,
  //     horaireId: horaire?.id || '',
  //     type: creneau.type,
  //     matiereId: creneau.matiere.id,
  //     enseignantId: creneau.enseignant.id,
  //     salleId: creneau.salle.id,
  //     classeId: this.selectedClasseId
  //   });

  //   this.conflictMessage = '';
  // }


  editCreneau(creneau: CreneauDto): void {
    console.log('✏️ Édition du créneau:', creneau);
    this.selectedCreneau = creneau;
    
    // Désactiver temporairement les observables
    this.form.get('jour')?.disable({ emitEvent: false });
    this.form.get('horaireId')?.disable({ emitEvent: false });
    this.form.get('matiereId')?.disable({ emitEvent: false });
    this.form.get('enseignantId')?.disable({ emitEvent: false });

    // Trouver l'horaire correspondant
    const horaire = this.horaires.find(h => 
        h.heureDebut === creneau.heureDebut && h.heureFin === creneau.heureFin
    );

    // Mettre à jour le formulaire
    this.form.patchValue({
        jour: creneau.jourSemaine,
        horaireId: horaire?.id || '',
        type: creneau.type,
        matiereId: creneau.matiere.id,
        enseignantId: creneau.enseignant.id,
        // salleId: creneau.salle.id,
        classeId: this.selectedClasseId
    }, { emitEvent: false });

    // Réactiver les observables
    this.form.get('jour')?.enable();
    this.form.get('horaireId')?.enable();
    this.form.get('matiereId')?.enable();
    this.form.get('enseignantId')?.enable();

    this.conflictMessage = '';
}

  deleteCreneau(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      console.log('🗑️ Suppression du créneau ID:', id);
      
      this.loading = true;
      this.planningService.deleteCreneau(id)
        .pipe(
          catchError(error => {
            console.error('❌ Erreur lors de la suppression:', error);
            return of(null);
          }),
          finalize(() => this.loading = false)
        )
        .subscribe(result => {
          if (result) {
            this.creneaux = this.creneaux.filter(c => c.id !== id);
            
            if (this.selectedCreneau?.id === id) {
              this.resetForm();
            }
            console.log('✅ Créneau supprimé');
          }
        });
    }
  }

  resetForm(): void {
    const classeId = this.selectedClasseId;
    
    this.form.reset({
      jour: '',
      horaireId: '',
      type: TypeCours.COURS,
      matiereId: '',
      enseignantId: '',
      salleId: '',
      classeId: classeId
    });
    
    this.selectedCreneau = null;
    this.selectedJour = null;
    this.selectedHoraire = null;
    this.selectedMatiere = null;
    this.selectedEnseignant = null;
    this.conflictMessage = '';
    
    // Réinitialiser les listes filtrées
    this.horairesDisponibles = [];
    this.matieresDisponibles = [];
    this.enseignantsDisponibles = [];
    this.sallesDisponibles = [];
  }

  saveEmploiDuTemps(): void {
    if (!this.selectedClasse) {
      alert('Aucune classe sélectionnée');
      return;
    }
    
    console.log('💾 Sauvegarde emploi du temps pour classe:', this.selectedClasse.nom, this.creneaux);
    alert(`Emploi du temps sauvegardé avec succès pour ${this.selectedClasse.nom} !\n${this.creneaux.length} créneaux enregistrés.`);
  }

  ajouterCreneauxPredefinis(): void {
    if (!this.selectedClasse) return;

    const creneauxPredefinis: Partial<CreneauDto>[] = [
      {
        jourSemaine: Jour.LUNDI,
        heureDebut: '08:00',
        heureFin: '09:30',
        type: TypeCours.COURS,
      },
      {
        jourSemaine: Jour.MARDI,
        heureDebut: '10:00',
        heureFin: '11:30',
        type: TypeCours.TD,
      },
      {
        jourSemaine: Jour.MERCREDI,
        heureDebut: '14:00',
        heureFin: '15:30',
        type: TypeCours.TP,
      }
    ];

    if (confirm(`Ajouter ${creneauxPredefinis.length} créneaux prédéfinis pour ${this.selectedClasse.nom} ?`)) {
      creneauxPredefinis.forEach(creneauPartiel => {
        const creneau: CreneauDto = {
          id: this.generateId(),
          jourSemaine: creneauPartiel.jourSemaine!,
          heureDebut: creneauPartiel.heureDebut!,
          heureFin: creneauPartiel.heureFin!,
          type: creneauPartiel.type!,
          matiere: this.matieres[0],
          enseignant: this.enseignants[0],
          salle: this.salles[0],
          periode: 1,
      
        };
        
        this.creneaux.push(creneau);
      });
      
      console.log('✅ Créneaux prédéfinis ajoutés');
    }
  }

  // Méthodes utilitaires pour l'affichage
  getHorairesGroupes(): HoraireGroupe[] {
    if (this.creneaux.length === 0) return [];
    
    const horairesSet = new Set<string>();
    
    this.creneaux.forEach(creneau => {
      horairesSet.add(`${creneau.heureDebut}-${creneau.heureFin}`);
    });

    return Array.from(horairesSet)
      .map(horaire => {
        const [heureDebut, heureFin] = horaire.split('-');
        return { heureDebut, heureFin };
      })
      .sort((a, b) => this.compareTime(a.heureDebut, b.heureDebut));
  }

  getCreneauxForHoraireAndJour(horaire: HoraireGroupe, jour: Jour): CreneauDto[] {
    return this.creneaux.filter(creneau => 
      creneau.heureDebut === horaire.heureDebut && 
      creneau.heureFin === horaire.heureFin && 
      creneau.jourSemaine === jour
    );
  }

  getJourLabel(jour: Jour): string {
    return this.joursLabels[jour] || jour;
  }

  getTypeLabel(type: TypeCours): string {
    return this.typesLabels[type] || type;
  }

  getCreneauColorClass(type: TypeCours): string {
    const classes: Record<string, string> = {
      'COURS': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      'TD': 'bg-green-50 border-green-200 hover:bg-green-100',
      'TP': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      'CONTROLE': 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      'EXAMEN': 'bg-red-50 border-red-200 hover:bg-red-100'
    };
    return classes[type] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  }

  trackByHoraire(index: number, horaire: HoraireGroupe): string {
    return `${horaire.heureDebut}-${horaire.heureFin}`;
  }

  trackByJour(index: number, jour: Jour): string {
    return jour;
  }

  trackByCreneau(index: number, creneau: CreneauDto): number {
    return creneau.id || 0;
  }

  private generateId(): number {
    return Date.now() + Math.random();
  }

  private generateSalles(): SalleDto[] {
    return Array.from({length: 25}, (_, i) => ({
      id: i + 1,
      numero: `${Math.floor(i / 5) + 1}${String.fromCharCode(65 + (i % 5))}`
    }));
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  chargeHoraire() {
    this.planningHoraireService.getHorairesParEtablissement(this.authService.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('❌ Erreur lors du chargement des horaires:', error);
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((horaires: HoraireDTO[]) => {
        this.horaires = horaires.sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
        console.log('✅ Horaires chargés:', this.horaires.length);
      });
  }

  loadMatire() {
    this.matiereService.getAllMatieres()
      .pipe(
        catchError(error => {
          console.error('❌ Erreur lors du chargement des matières:', error);
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((matieres: MatiereDto[]) => {
        if (matieres) {
          this.matieres = matieres;
          console.log('✅ Matières chargées:', this.matieres);
        }
      });
  }

  loadClasse() {
    this.classeService.getClassesByEtablissement(this.authService.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('❌ Erreur lors du chargement des classes:', error);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((classes: any) => {
        if (classes) {
          this.classes = classes;
          console.log('✅ Classes chargées:', this.classes.length);
        }
      });
  }

  loadEnsiegnant() {
    this.enseignantService.getAllEnseignants()
      .pipe(
        catchError(error => {
          console.error('❌ Erreur lors du chargement des enseignants:', error);
          return of([]);
        })
      )
      .subscribe(enseignants => {
        this.enseignants = enseignants;
        console.log('✅ Enseignants chargés:', this.enseignants.length);
      });
  }
}