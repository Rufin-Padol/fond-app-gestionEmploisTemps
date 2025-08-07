import { Component, OnInit } from '@angular/core';
import { EtablissementDto } from '../../../core/model/models';
import { TypeRole, User } from '../../../core/model/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { EtablissementServiceService, EtablissementUserDTO } from '../../../core/services/etablissement-service.service';
import { GestionEtablisementComponent } from "./gestion-etablisement/gestion-etablisement.component";
import { GestionUserComponent } from "./gestion-user/gestion-user.component";

interface AdminFilters {
  recherche: string;
  role: string;
  statut: string;
}

interface EtablissementWithUser extends EtablissementDto {
  user: User;
}
interface AdminFilters {
  recherche: string;
  role: string;
  statut: string;
}

interface EtablissementWithUser extends EtablissementDto {
  user: User;
}

interface Notification {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-admingestion',
    standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GestionEtablisementComponent, GestionUserComponent],
  templateUrl: './admingestion.component.html',
  styleUrl: './admingestion.component.css'
})
export class AdmingestionComponent implements OnInit {
  ngOnInit(): void {
      this.activeTab = 'etablissements';
  }
    // État de l'interface
  activeTab: 'etablissements' | 'users' | 'stats' = 'etablissements';
  
  // Système de notifications
  notification: Notification = {
    show: false,
    type: 'success',
    message: ''
  };

  constructor() {}

 

  // ====== GESTION DES ONGLETS ======
  setActiveTab(tab: 'etablissements' | 'users' | 'stats'): void {
    this.activeTab = tab;
    this.hideNotification();
  }

  // ====== GESTION DES NOTIFICATIONS ======
  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = {
      show: true,
      type,
      message
    };

    // Auto-hide après 5 secondes pour les succès
    if (type === 'success') {
      setTimeout(() => {
        this.hideNotification();
      }, 5000);
    }
  }

  hideNotification(): void {
    this.notification.show = false;
  }

  private showWelcomeMessage(): void {
    this.showNotification('success', 'Interface d\'administration chargée avec succès');
  }

  // ====== MÉTHODES UTILITAIRES ======
  onTabChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.activeTab = target.value as 'etablissements' | 'users' | 'stats';
  }

  // Méthode pour recevoir les notifications des composants enfants
  onChildNotification(notification: { type: 'success' | 'error', message: string }): void {
    this.showNotification(notification.type, notification.message);
  }

}