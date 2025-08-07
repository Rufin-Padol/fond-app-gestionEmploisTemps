import { Injectable } from '@angular/core';
import { ValidationService } from './validation.service';
import { CreneauServiceService } from './creneau-service.service';
import { EnseignantServiceService } from './enseignant-service.service';
import { CreneauDto, EnseignantDto, SalleDto } from '../model/models';
import { Jour, TypeCours } from '../model/enums';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreneauLogicService {

  constructor(
    private creneauService: CreneauServiceService,
    private enseignantService: EnseignantServiceService,
    private validationService: ValidationService
  ) { }

  /**
   * 🔍 Filtrer les enseignants disponibles pour un créneau spécifique
   */
  getEnseignantsDisponibles(params: {
    matiereId: number;
    jour: Jour;
    heureDebut: string;
    heureFin: string;
    classeId: number;
    quotaMax?: number;
  }): Observable<Array<{
    enseignant: EnseignantDto;
    isAvailable: boolean;
    conflicts: string[];
    remainingQuota: number;
    totalQuotaUsed: number;
  }>> {
    
    console.log('🔍 Recherche enseignants disponibles pour:', params);

    return this.enseignantService.getEnseignantsByMatiere(params.matiereId).pipe(
      switchMap(enseignantsMatiere => {
        console.log(`📚 ${enseignantsMatiere.length} enseignants trouvés pour la matière`);

        // Créer les observables pour vérifier chaque enseignant
        const availabilityChecks = enseignantsMatiere.map(enseignant =>
          this.checkEnseignantAvailability(enseignant, params)
        );

        return forkJoin(availabilityChecks);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du filtrage des enseignants:', error);
        return of([]);
      })
    );
  }

  /**
   * 🔍 Vérifier la disponibilité d'un enseignant spécifique
   */
  private checkEnseignantAvailability(
    enseignant: EnseignantDto,
    params: {
      jour: Jour;
      heureDebut: string;
      heureFin: string;
      classeId: number;
      quotaMax?: number;
    }
  ): Observable<{
    enseignant: EnseignantDto;
    isAvailable: boolean;
    conflicts: string[];
    remainingQuota: number;
    totalQuotaUsed: number;
  }> {
    
    return this.creneauService.getCreneauxByEnseignant(enseignant.id!).pipe(
      map(creneauxEnseignant => {
        const conflicts: string[] = [];
        let isAvailable = true;

        // 1. Vérifier les conflits d'horaire
        const conflictingCreneaux = creneauxEnseignant.filter(creneau =>
          creneau.jour === params.jour &&
          this.validationService.hasTimeOverlap(
            params.heureDebut, params.heureFin,
            creneau.heureDebut, creneau.heureFin
          )
        );

        if (conflictingCreneaux.length > 0) {
          isAvailable = false;
          conflicts.push(`Déjà occupé de ${conflictingCreneaux[0].heureDebut} à ${conflictingCreneaux[0].heureFin}`);
        }

        // 2. Vérifier les disponibilités déclarées
        const disponibilite = this.validationService.checkEnseignantDisponibilite(
          enseignant,
          params.jour,
          params.heureDebut,
          params.heureFin
        );

        if (!disponibilite.isAvailable) {
          isAvailable = false;
          conflicts.push(disponibilite.reason!);
        }

        // 3. Vérifier le quota journalier
        const quota = this.validationService.checkQuotaJournalier(
          creneauxEnseignant,
          params.jour,
          params.heureDebut,
          params.heureFin,
          params.quotaMax || 6
        );

        if (!quota.isValid) {
          isAvailable = false;
          conflicts.push(quota.reason!);
        }

        return {
          enseignant,
          isAvailable,
          conflicts,
          remainingQuota: (params.quotaMax || 6) - quota.currentHours,
          totalQuotaUsed: quota.currentHours
        };
      }),
      catchError(error => {
        console.error(`❌ Erreur vérification ${enseignant.nomComplet}:`, error);
        return of({
          enseignant,
          isAvailable: false,
          conflicts: ['Erreur de vérification'],
          remainingQuota: 0,
          totalQuotaUsed: 0
        });
      })
    );
  }

  /**
   * 🏫 Filtrer les salles disponibles pour un créneau
   */
  getSallesDisponibles(params: {
    jour: Jour;
    heureDebut: string;
    heureFin: string;
    salles: SalleDto[];
  }): Observable<{
    sallesLibres: SalleDto[];
    sallesOccupees: Array<{
      salle: SalleDto;
      conflictingClasses: string[];
      conflictingCreneaux: CreneauDto[];
    }>;
  }> {
    
    console.log('🔍 Recherche salles disponibles pour:', params);

    return this.creneauService.getCreneauxByJour(params.jour).pipe(
      map(creneauxDuJour => {
        const sallesLibres: SalleDto[] = [];
        const sallesOccupees: Array<{
          salle: SalleDto;
          conflictingClasses: string[];
          conflictingCreneaux: CreneauDto[];
        }> = [];

        params.salles.forEach(salle => {
          const conflitSalle = this.validationService.checkSalleConflicts(
            creneauxDuJour.filter(c => c.salle.id === salle.id),
            params.jour,
            params.heureDebut,
            params.heureFin
          );

          if (conflitSalle.hasConflict) {
            sallesOccupees.push({
              salle,
              conflictingClasses: conflitSalle.conflictingClasses,
              conflictingCreneaux: conflitSalle.conflictingCreneaux
            });
          } else {
            sallesLibres.push(salle);
          }
        });

        console.log(`✅ ${sallesLibres.length} salles libres, ${sallesOccupees.length} occupées`);

        return {
          sallesLibres,
          sallesOccupees
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors du filtrage des salles:', error);
        return of({
          sallesLibres: [],
          sallesOccupees: []
        });
      })
    );
  }

  /**
   * ✅ Validation complète avant création d'un créneau
   */
  validateCreneauComplet(params: {
    classeId: number;
    jour: Jour;
    heureDebut: string;
    heureFin: string;
    matiereId: number;
    enseignantId: number;
    salleId: number;
    type: TypeCours;
    enseignant: EnseignantDto;
    quotaMax?: number;
  }): Observable<{
    isValid: boolean;
    conflicts: Array<{
      type: 'classe' | 'enseignant' | 'salle' | 'quota' | 'disponibilite';
      message: string;
      severity: 'error' | 'warning';
      canOverride?: boolean;
    }>;
    warnings: string[];
    canSubmit: boolean;
  }> {
    
    console.log('✅ Validation complète du créneau:', params);

    // Récupérer tous les créneaux nécessaires pour la validation
    return forkJoin({
      creneauxClasse: this.creneauService.getCreneauxByClasse(params.classeId),
      creneauxEnseignant: this.creneauService.getCreneauxByEnseignant(params.enseignantId),
      creneauxSalle: this.creneauService.getCreneauxBySalle(params.salleId)
    }).pipe(
      map(({ creneauxClasse, creneauxEnseignant, creneauxSalle }) => {
        
        // Utiliser le service de validation
        const validation = this.validationService.validateNouveauCreneau({
          classeId: params.classeId,
          jour: params.jour,
          heureDebut: params.heureDebut,
          heureFin: params.heureFin,
          enseignant: params.enseignant,
          creneauxExistantsClasse: creneauxClasse,
          creneauxExistantsEnseignant: creneauxEnseignant,
          creneauxExistantsSalle: creneauxSalle,
          quotaMax: params.quotaMax
        });

        const conflicts = validation.conflicts.map(c => ({
          ...c,
          canOverride: c.type === 'salle' // Seuls les conflits de salle peuvent être overridés
        }));

        const warnings: string[] = [];
        const hasBlockingErrors = conflicts.some(c => c.severity === 'error');
        const hasWarnings = conflicts.some(c => c.severity === 'warning');

        if (hasWarnings && !hasBlockingErrors) {
          warnings.push('Des conflits mineurs ont été détectés mais peuvent être résolus');
        }

        return {
          isValid: validation.isValid,
          conflicts,
          warnings,
          canSubmit: validation.isValid || (hasWarnings && !hasBlockingErrors)
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la validation complète:', error);
        return of({
          isValid: false,
          conflicts: [{
            type: 'classe' as const,
            message: 'Erreur lors de la validation',
            severity: 'error' as const
          }],
          warnings: [],
          canSubmit: false
        });
      })
    );
  }

  /**
   * 📊 Obtenir les statistiques d'utilisation pour un jour donné
   */
  getStatistiquesJour(jour: Jour): Observable<{
    totalCreneaux: number;
    heuresOccupees: number;
    sallesUtilisees: number;
    enseignantsActifs: number;
    creneauxParType: Record<TypeCours, number>;
  }> {
    
    return this.creneauService.getCreneauxByJour(jour).pipe(
      map(creneaux => {
        const totalCreneaux = creneaux.length;
        const heuresOccupees = this.validationService.calculateTotalHours(creneaux);
        
        const sallesUniques = new Set(creneaux.map(c => c.salle.id));
        const enseignantsUniques = new Set(creneaux.map(c => c.enseignant.id));
        
        const creneauxParType: Record<TypeCours, number> = {
          [TypeCours.COURS]: 0,
          [TypeCours.TD]: 0,
          [TypeCours.TP]: 0,
         
          [TypeCours.EXAMEN]: 0
        };

        creneaux.forEach(creneau => {
          creneauxParType[creneau.type]++;
        });

        return {
          totalCreneaux,
          heuresOccupees,
          sallesUtilisees: sallesUniques.size,
          enseignantsActifs: enseignantsUniques.size,
          creneauxParType
        };
      }),
      catchError(error => {
        console.error('❌ Erreur calcul statistiques:', error);
        return of({
          totalCreneaux: 0,
          heuresOccupees: 0,
          sallesUtilisees: 0,
          enseignantsActifs: 0,
          creneauxParType: {
            [TypeCours.COURS]: 0,
            [TypeCours.TD]: 0,
            [TypeCours.TP]: 0,
          
            [TypeCours.EXAMEN]: 0
          }
        });
      })
    );
  }

  /**
   * 🔄 Suggérer des créneaux alternatifs en cas de conflit
   */
  suggestAlternativeSlots(params: {
    classeId: number;
    jour: Jour;
    matiereId: number;
    enseignantId: number;
    dureeMinutes: number;
    heureDebutSouhaitee: string;
  }): Observable<Array<{
    heureDebut: string;
    heureFin: string;
    score: number; // Score de pertinence (0-100)
    raison: string;
  }>> {
    
    console.log('🔄 Recherche créneaux alternatifs:', params);

    return forkJoin({
      creneauxClasse: this.creneauService.getCreneauxByClasse(params.classeId),
      creneauxEnseignant: this.creneauService.getCreneauxByEnseignant(params.enseignantId)
    }).pipe(
      map(({ creneauxClasse, creneauxEnseignant }) => {
        const alternatives: Array<{
          heureDebut: string;
          heureFin: string;
          score: number;
          raison: string;
        }> = [];

        // Générer des créneaux possibles (par exemple, toutes les 30 minutes de 8h à 18h)
        const creneauxPossibles = this.generatePossibleSlots(params.dureeMinutes);

        creneauxPossibles.forEach(slot => {
          // Vérifier si ce créneau est libre pour la classe et l'enseignant
          const conflitClasse = creneauxClasse.some(c =>
            c.jour === params.jour &&
            this.validationService.hasTimeOverlap(slot.debut, slot.fin, c.heureDebut, c.heureFin)
          );

          const conflitEnseignant = creneauxEnseignant.some(c =>
            c.jour === params.jour &&
            this.validationService.hasTimeOverlap(slot.debut, slot.fin, c.heureDebut, c.heureFin)
          );

          if (!conflitClasse && !conflitEnseignant) {
            // Calculer un score basé sur la proximité avec l'heure souhaitée
            const score = this.calculateSlotScore(slot.debut, params.heureDebutSouhaitee);
            
            alternatives.push({
              heureDebut: slot.debut,
              heureFin: slot.fin,
              score,
              raison: score > 80 ? 'Très proche de l\'heure souhaitée' :
                     score > 60 ? 'Proche de l\'heure souhaitée' :
                     'Alternative disponible'
            });
          }
        });

        // Trier par score décroissant et limiter à 5 suggestions
        return alternatives
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
      }),
      catchError(error => {
        console.error('❌ Erreur recherche alternatives:', error);
        return of([]);
      })
    );
  }

  /**
   * 🔧 Utilitaires privés
   */
  private generatePossibleSlots(dureeMinutes: number): Array<{ debut: string; fin: string }> {
    const slots: Array<{ debut: string; fin: string }> = [];
    
    // Générer des créneaux de 8h à 18h par pas de 30 minutes
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const debutMinutes = hour * 60 + minute;
        const finMinutes = debutMinutes + dureeMinutes;
        
        // Vérifier que le créneau ne dépasse pas 18h
        if (finMinutes <= 18 * 60) {
          const debut = this.minutesToTime(debutMinutes);
          const fin = this.minutesToTime(finMinutes);
          slots.push({ debut, fin });
        }
      }
    }
    
    return slots;
  }

  private calculateSlotScore(slotTime: string, preferredTime: string): number {
    const slotMinutes = this.timeToMinutes(slotTime);
    const preferredMinutes = this.timeToMinutes(preferredTime);
    const diffMinutes = Math.abs(slotMinutes - preferredMinutes);
    
    // Score inversement proportionnel à la différence (max 100)
    return Math.max(0, 100 - (diffMinutes / 30) * 10);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}