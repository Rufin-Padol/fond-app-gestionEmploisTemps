import { Component, OnInit } from '@angular/core';
import { HoraireDTO, JourDto } from '../../../../core/model/models';
import { Jour } from '../../../../core/model/enums';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanningServiceService } from '../../../../core/services/planning-service.service';
import { catchError, finalize, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-configuration',
   imports: [CommonModule, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
 
export class ConfigurationComponent implements OnInit {
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Données
  horaires: HoraireDTO[] = [];
  jours: JourDto[] = [];

  // Propriétés pour les modals
  showHoraireModal: boolean = false;
  showJourModal: boolean = false;
  editingHoraire: HoraireDTO | null = null;
  selectedJour: string = '';
  isSaving: boolean = false;

  // Jours disponibles pour la sélection
  joursDisponibles = [
    { value: Jour.LUNDI, label: 'Lundi' },
    { value: Jour.MARDI, label: 'Mardi' },
    { value: Jour.MERCREDI, label: 'Mercredi' },
    { value: Jour.JEUDI, label: 'Jeudi' },
    { value: Jour.VENDREDI, label: 'Vendredi' },
    { value: Jour.SAMEDI, label: 'Samedi' },
    { value: Jour.DIMANCHE, label: 'Dimanche' }
  ];

  constructor(private planningService: PlanningServiceService, private authservice: AuthService) {}

  ngOnInit(): void {
    this.chargerConfiguration();
  }

  /**
   * Charge la configuration (jours et horaires)
   */
  private chargerConfiguration(): void {
    this.loading = true;
    this.error = null;

    // Charger les jours et horaires en parallèle
    this.planningService.getJoursParEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des jours:', error);
          this.showErrorMessage('Erreur lors du chargement des jours');
          return of([]);
        })
      )
      .subscribe(jours => {
        this.jours = jours;
        console.log('Jours chargés:', this.jours);
      });

    this.planningService.getHorairesParEtablissement(this.authservice.getIdEtablessement())
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des horaires:', error);
          this.showErrorMessage('Erreur lors du chargement des horaires');
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(horaires => {
        this.horaires = horaires.sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
        console.log('Horaires chargés:', this.horaires);
      });
  }

  // GESTION DES HORAIRES

  /**
   * Ouvre le modal pour ajouter un horaire
   */
  ouvrirModalHoraire(): void {
    this.editingHoraire = {
      heureDebut: '',
      heureFin: '',
      etablissementId: this.authservice.getIdEtablessement()
    };
    this.showHoraireModal = true;
  }

  /**
   * Ouvre le modal pour modifier un horaire
   */
  modifierHoraire(horaire: HoraireDTO): void {
    this.editingHoraire = { ...horaire };
    this.showHoraireModal = true;
  }

  /**
   * Ferme le modal des horaires
   */
  fermerModalHoraire(): void {
    this.showHoraireModal = false;
    this.editingHoraire = null;
  }

  /**
   * Sauvegarde un horaire (ajout ou modification)
   */
  sauvegarderHoraire(): void {
    if (!this.editingHoraire || !this.editingHoraire.heureDebut || !this.editingHoraire.heureFin) {
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation des heures
    if (this.editingHoraire.heureDebut >= this.editingHoraire.heureFin) {
      this.showErrorMessage('L\'heure de début doit être antérieure à l\'heure de fin');
      return;
    }

    this.isSaving = true;

    // Générer automatiquement le label
    this.editingHoraire.label = `${this.editingHoraire.heureDebut}-${this.editingHoraire.heureFin}`;

    const operation = this.editingHoraire.id 
      ? this.planningService.updateHoraire(this.editingHoraire.id, this.editingHoraire)
      : this.planningService.createHoraire(this.editingHoraire);

    operation
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la sauvegarde de l\'horaire:', error);
          this.showErrorMessage( error.error.message ||'Erreur lors de la sauvegarde de l\'horaire');
           this.fermerModalHoraire();
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe(result => {
        if (result) {
          if (this.editingHoraire!.id) {
            // Modification
            const index = this.horaires.findIndex(h => h.id === this.editingHoraire!.id);
            if (index !== -1) {
              this.horaires[index] = { ...result };
            }
            this.showSuccessMessage( result.message || 'Horaire modifié avec succès');
          } else {
            // Ajout
            this.horaires.push(result);
             this.showSuccessMessage( result.message ||'Horaire ajouté avec succès');
          }
          
          // Trier les horaires par heure de début
          this.horaires.sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || ''));
          this.fermerModalHoraire();
        }
      });
  }

  /**
   * Supprime un horaire avec confirmation
   */
  supprimerHoraire(horaire: HoraireDTO): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer l'horaire ${horaire.label} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.confirmerSuppressionHoraire(horaire);
      }
    });
  }

  /**
   * Confirme et exécute la suppression d'un horaire
   */
  private confirmerSuppressionHoraire(horaire: HoraireDTO): void {
    this.planningService.deleteHoraire(horaire.id!)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression de l\'horaire:', error);
          this.showErrorMessage('Erreur lors de la suppression de l\'horaire');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.horaires = this.horaires.filter(h => h.id !== horaire.id);
          this.showSuccessMessage('Horaire supprimé avec succès');
        }
      });
  }

  // GESTION DES JOURS

  /**
   * Ouvre le modal pour ajouter un jour
   */
  ouvrirModalJour(): void {
    this.selectedJour = '';
    this.showJourModal = true;
  }

  /**
   * Ferme le modal des jours
   */
  fermerModalJour(): void {
    this.showJourModal = false;
    this.selectedJour = '';
  }

  /**
   * Ajoute un jour
   */
  ajouterJour(): void {
    if (!this.selectedJour) {
      this.showErrorMessage('Veuillez sélectionner un jour');
      return;
    }

    // Vérifier si le jour n'est pas déjà ajouté
    const jourExiste = this.jours.some(j => j.jour === this.selectedJour as Jour);
    if (jourExiste) {
      this.showErrorMessage('Ce jour est déjà configuré');
      return;
    }

    this.isSaving = true;

    const nouveauJour: Partial<JourDto> = {
      jour: this.selectedJour as Jour,
      etablissementId: this.authservice.getIdEtablessement()
    };

    this.planningService.createJour(nouveauJour)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'ajout du jour:', error);
          this.showErrorMessage('Erreur lors de l\'ajout du jour');
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe(result => {
        if (result) {
          this.jours.push(result);
          
          // Trier les jours dans l'ordre de la semaine
          this.jours.sort((a, b) => {
            const ordreJours = [Jour.LUNDI, Jour.MARDI, Jour.MERCREDI, Jour.JEUDI, Jour.VENDREDI, Jour.SAMEDI, Jour.DIMANCHE];
            return ordreJours.indexOf(a.jour!) - ordreJours.indexOf(b.jour!);
          });

          this.fermerModalJour();
          this.showSuccessMessage('Jour ajouté avec succès');
        }
      });
  }

  /**
   * Supprime un jour avec confirmation
   */
  supprimerJour(jour: JourDto): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer le ${this.getJourLabel(jour.jour)} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmerSuppressionJour(jour);
      }
    });
  }

  /**
   * Confirme et exécute la suppression d'un jour
   */
  private confirmerSuppressionJour(jour: JourDto): void {
    this.planningService.deleteJour(jour.id!)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression du jour:', error);
          this.showErrorMessage('Erreur lors de la suppression du jour');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          this.jours = this.jours.filter(j => j.id !== jour.id);
          this.showSuccessMessage('Jour supprimé avec succès');
        }
      });
  }

  // UTILITAIRES

  /**
   * Obtient le libellé d'un jour
   */
  getJourLabel(jour?: Jour): string {
    const jourItem = this.joursDisponibles.find(j => j.value === jour);
    return jourItem ? jourItem.label : jour || '';
  }

  /**
   * Obtient les jours disponibles (non encore ajoutés)
   */
  get joursDisponibls() {
    const joursAjoutes = this.jours.map(j => j.jour);
    return this.joursDisponibles.filter(jour => !joursAjoutes.includes(jour.value));
  }

  /**
   * Affiche un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.error = message;
    this.successMessage = null;
    setTimeout(() => {
      this.error = null;
    }, 5000);
  }

  /**
   * Affiche un message de succès
   */
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.error = null;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}