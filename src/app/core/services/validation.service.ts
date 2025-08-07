import { Injectable } from '@angular/core';
import { Jour } from '../model/enums';
import { CreneauDto, EnseignantDto } from '../model/models';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

   constructor() { }

  /**
   * 🕐 Vérifier si deux créneaux horaires se chevauchent
   */
  hasTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  }

  /**
   * 🕐 Vérifier si un horaire est dans une plage de disponibilité
   */
  isTimeInRange(start: string, end: string, rangeStart: string, rangeEnd: string): boolean {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    const rangeStartMinutes = this.timeToMinutes(rangeStart);
    const rangeEndMinutes = this.timeToMinutes(rangeEnd);

    return startMinutes >= rangeStartMinutes && endMinutes <= rangeEndMinutes;
  }

  /**
   * ⏱️ Calculer la durée en heures entre deux horaires
   */
  calculateDuration(start: string, end: string): number {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    return (endMinutes - startMinutes) / 60;
  }

  /**
   * 📊 Calculer le total d'heures d'une liste de créneaux
   */
  calculateTotalHours(creneaux: CreneauDto[]): number {
    return creneaux.reduce((total, creneau) => {
      return total + this.calculateDuration(creneau.heureDebut, creneau.heureFin);
    }, 0);
  }

  /**
   * 👨‍🏫 Vérifier la disponibilité d'un enseignant pour un créneau
   */
  checkEnseignantDisponibilite(
    enseignant: EnseignantDto,
    jour: Jour,
    heureDebut: string,
    heureFin: string
  ): { isAvailable: boolean; reason?: string } {
    
    // Vérifier les disponibilités déclarées
    if (enseignant.disponibilites && enseignant.disponibilites.length > 0) {
      const disponibiliteJour = enseignant.disponibilites.find(d => d.jourSemaine === jour);
      
      if (!disponibiliteJour) {
        return {
          isAvailable: false,
          reason: `Non disponible le ${this.getJourLabel(jour)}`
        };
      }

      if (!this.isTimeInRange(heureDebut, heureFin, disponibiliteJour.heureDebut, disponibiliteJour.heureFin)) {
        return {
          isAvailable: false,
          reason: `Disponible seulement de ${disponibiliteJour.heureDebut} à ${disponibiliteJour.heureFin}`
        };
      }
    }

    return { isAvailable: true };
  }

  /**
   * 📈 Vérifier le quota journalier d'un enseignant
   */
  checkQuotaJournalier(
    creneauxExistants: CreneauDto[],
    jour: Jour,
    nouvelleHeureDebut: string,
    nouvelleHeureFin: string,
    quotaMax: number = 6
  ): { isValid: boolean; currentHours: number; newTotal: number; reason?: string } {
    
    const creneauxDuJour = creneauxExistants.filter(c => c.jour === jour);
    const heuresUtilisees = this.calculateTotalHours(creneauxDuJour);
    const dureeNouveau = this.calculateDuration(nouvelleHeureDebut, nouvelleHeureFin);
    const nouveauTotal = heuresUtilisees + dureeNouveau;

    if (nouveauTotal > quotaMax) {
      return {
        isValid: false,
        currentHours: heuresUtilisees,
        newTotal: nouveauTotal,
        reason: `Quota dépassé: ${nouveauTotal}h/${quotaMax}h`
      };
    }

    return {
      isValid: true,
      currentHours: heuresUtilisees,
      newTotal: nouveauTotal
    };
  }

  /**
   * 🏫 Vérifier les conflits de salle
   */
  checkSalleConflicts(
    creneauxSalle: CreneauDto[],
    jour: Jour,
    heureDebut: string,
    heureFin: string
  ): { hasConflict: boolean; conflictingClasses: string[]; conflictingCreneaux: CreneauDto[] } {
    
    const conflictingCreneaux = creneauxSalle.filter(creneau =>
      creneau.jour === jour &&
      this.hasTimeOverlap(heureDebut, heureFin, creneau.heureDebut, creneau.heureFin)
    );

    const conflictingClasses = conflictingCreneaux.map(c => 
      `${c.matiere.nom} (${c.enseignant.nomComplet})`
    );

    return {
      hasConflict: conflictingCreneaux.length > 0,
      conflictingClasses,
      conflictingCreneaux
    };
  }

  /**
   * 🎯 Validation complète d'un nouveau créneau
   */
  validateNouveauCreneau(params: {
    classeId: number;
    jour: Jour;
    heureDebut: string;
    heureFin: string;
    enseignant: EnseignantDto;
    creneauxExistantsClasse: CreneauDto[];
    creneauxExistantsEnseignant: CreneauDto[];
    creneauxExistantsSalle: CreneauDto[];
    quotaMax?: number;
  }): {
    isValid: boolean;
    conflicts: Array<{
      type: 'classe' | 'enseignant' | 'salle' | 'quota' | 'disponibilite';
      message: string;
      severity: 'error' | 'warning';
    }>;
  } {
    
    const conflicts: Array<{
      type: 'classe' | 'enseignant' | 'salle' | 'quota' | 'disponibilite';
      message: string;
      severity: 'error' | 'warning';
    }> = [];

    // 1. Vérifier les conflits de classe
    const conflitClasse = params.creneauxExistantsClasse.find(creneau =>
      creneau.jour === params.jour &&
      this.hasTimeOverlap(params.heureDebut, params.heureFin, creneau.heureDebut, creneau.heureFin)
    );

    if (conflitClasse) {
      conflicts.push({
        type: 'classe',
        message: `La classe a déjà un cours de ${conflitClasse.heureDebut} à ${conflitClasse.heureFin}`,
        severity: 'error'
      });
    }

    // 2. Vérifier les conflits d'enseignant
    const conflitEnseignant = params.creneauxExistantsEnseignant.find(creneau =>
      creneau.jour === params.jour &&
      this.hasTimeOverlap(params.heureDebut, params.heureFin, creneau.heureDebut, creneau.heureFin)
    );

    if (conflitEnseignant) {
      conflicts.push({
        type: 'enseignant',
        message: `L'enseignant est déjà occupé de ${conflitEnseignant.heureDebut} à ${conflitEnseignant.heureFin}`,
        severity: 'error'
      });
    }

    // 3. Vérifier la disponibilité de l'enseignant
    const disponibilite = this.checkEnseignantDisponibilite(
      params.enseignant,
      params.jour,
      params.heureDebut,
      params.heureFin
    );

    if (!disponibilite.isAvailable) {
      conflicts.push({
        type: 'disponibilite',
        message: disponibilite.reason!,
        severity: 'error'
      });
    }

    // 4. Vérifier le quota journalier
    const quota = this.checkQuotaJournalier(
      params.creneauxExistantsEnseignant,
      params.jour,
      params.heureDebut,
      params.heureFin,
      params.quotaMax
    );

    if (!quota.isValid) {
      conflicts.push({
        type: 'quota',
        message: quota.reason!,
        severity: 'error'
      });
    }

    // 5. Vérifier les conflits de salle
    const conflitSalle = this.checkSalleConflicts(
      params.creneauxExistantsSalle,
      params.jour,
      params.heureDebut,
      params.heureFin
    );

    if (conflitSalle.hasConflict) {
      conflicts.push({
        type: 'salle',
        message: `Salle occupée par: ${conflitSalle.conflictingClasses.join(', ')}`,
        severity: 'warning' // Warning car regroupement possible
      });
    }

    const hasBlockingErrors = conflicts.some(c => c.severity === 'error');

    return {
      isValid: !hasBlockingErrors,
      conflicts
    };
  }

  /**
   * 🔧 Utilitaires privés
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getJourLabel(jour: Jour): string {
    const labels: Record<Jour, string> = {
      [Jour.LUNDI]: 'Lundi',
      [Jour.MARDI]: 'Mardi',
      [Jour.MERCREDI]: 'Mercredi',
      [Jour.JEUDI]: 'Jeudi',
      [Jour.VENDREDI]: 'Vendredi',
      [Jour.SAMEDI]: 'Samedi',
      [Jour.DIMANCHE]: 'Dimanche'
    };
    return labels[jour] || jour;
  }

  /**
   * 📋 Générer un rapport de validation détaillé
   */
  generateValidationReport(params: {
    classeNom: string;
    jour: Jour;
    heureDebut: string;
    heureFin: string;
    matiereNom: string;
    enseignantNom: string;
    salleNumero: string;
    conflicts: Array<{
      type: string;
      message: string;
      severity: string;
    }>;
  }): string {
    
    const duration = this.calculateDuration(params.heureDebut, params.heureFin);
    
    let report = `📋 RAPPORT DE VALIDATION\n`;
    report += `================================\n\n`;
    report += `🎯 Créneau demandé:\n`;
    report += `   Classe: ${params.classeNom}\n`;
    report += `   Jour: ${this.getJourLabel(params.jour)}\n`;
    report += `   Horaire: ${params.heureDebut} - ${params.heureFin} (${duration}h)\n`;
    report += `   Matière: ${params.matiereNom}\n`;
    report += `   Enseignant: ${params.enseignantNom}\n`;
    report += `   Salle: ${params.salleNumero}\n\n`;

    if (params.conflicts.length === 0) {
      report += `✅ VALIDATION RÉUSSIE\n`;
      report += `   Aucun conflit détecté. Le créneau peut être créé.\n`;
    } else {
      report += `⚠️ CONFLITS DÉTECTÉS (${params.conflicts.length}):\n`;
      params.conflicts.forEach((conflict, index) => {
        const icon = conflict.severity === 'error' ? '❌' : '⚠️';
        report += `   ${index + 1}. ${icon} ${conflict.type.toUpperCase()}: ${conflict.message}\n`;
      });
    }

    return report;
  }
}