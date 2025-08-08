import { Component, OnInit } from '@angular/core';
import {   EtablissementDto } from '../../../../core/model/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/model/user.model';
import { UserServiceService } from '../../../../core/services/user-service.service';
 
import { NotificationService } from '../../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { EtablissementServiceUserService } from '../../../../core/services/etablissement-service-user.service';
 
import { environment } from '../../../../core/environement/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profil',
   imports: [CommonModule, FormsModule],
   standalone :true,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {
  imageSrc: any;
  utilisateur: User | null = null;
  etablissement: EtablissementDto | null = null;
  editingUser: User | null = null;
  editingEtablissement: EtablissementDto | null = null;
  apiUrl= "http://62.169.29.140:8080";
  
  // États des modals
  showEditModal: boolean = false;
  showEtablissementModal: boolean = false;
  showPasswordModal: boolean = false;
  showLogoModal: boolean = false;
  
  // États de chargement
  loading: boolean = false;
  isSaving: boolean = false;
  isUploadingLogo: boolean = false;
  
  // Gestion des erreurs

  passwordError: string | null = null;
  
  // Variables pour l'upload de logo
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;

  // Données pour le changement de mot de passe
  passwordData: any = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private subscriptions = new Subscription();
 error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private userService: UserServiceService,
    private etablissementService: EtablissementServiceUserService,
    private notificationService: NotificationService,
    private authservice: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();

    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // === CHARGEMENT DES DONNÉES ===
  private loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    // Récupérer l'ID utilisateur depuis le localStorage ou un service d'auth
    // const userId = this.getCurrentUserId();
    // if (!userId) {
    //   this.error = 'Utilisateur non identifié';
    //   this.loading = false;
    //   return;
    // }
    console.log("sdsdnnnjhashjshsnbsnb"+this.authservice.getIdUser())

    // Charger les données utilisateur
    const userSub = this.userService.getUserById(this.authservice.getIdUser()).subscribe({
      next: (user: User | null) => {
        this.utilisateur = user;
        this.loadEtablissementData(user?.etablissementId || 0); // Utiliser un ID d'établissement par défaut si non défini
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
            this.error = 'Erreur lors du chargement du profil utilisateur';
    
        this.loading = false;
        this.notificationService.showError('Erreur lors du chargement du profil');
      }
    });

    this.subscriptions.add(userSub);
  }

  private loadEtablissementData(idetablessen:number): void {
    // Récupérer l'établissement (supposons qu'on récupère le dernier)
    const etablissementSub = this.etablissementService.getEtablissementParId(idetablessen).subscribe({
      next: (etablissement:any) => {
        this.etablissement = etablissement;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de l\'établissement:', error);
 
        this.loading = false;
        this.error = 'Erreur lors du chargement de l\'établissement';

      }
    });

    this.subscriptions.add(etablissementSub);
  }

  

  // === GESTION DES MODALS UTILISATEUR ===
  ouvrirModalModification(): void {
    if (this.utilisateur) {
      this.editingUser = { ...this.utilisateur };
      this.showEditModal = true;
    }
  }

  fermerModalModification(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }

  annulerModifications(): void {
    this.fermerModalModification();
  }

  sauvegarderProfil(): void {
    if (!this.editingUser || !this.utilisateur) return;

    // Validation basique
    if (!this.editingUser.nom || !this.editingUser.email) {
      this.notificationService.showError('Le nom et l\'email sont obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editingUser.email)) {
      this.notificationService.showError('Format d\'email invalide');
      return;
    }

    this.isSaving = true;
if (!this.utilisateur.id) return
    const updateSub = this.userService.updateUser(this.utilisateur.id, this.editingUser).subscribe({
      next: (updatedUser: User | null) => {
        this.utilisateur = updatedUser;
        this.fermerModalModification();
         this.loadUserProfile();
         this.successMessage = 'Profil mis à jour avec succès'
 
        this.isSaving = false;
      },
      error: (error) => {
        
          this.successMessage = 'Erreur lors de la mise à jour du profil'
 
        this.notificationService.showError('Erreur lors de la mise à jour du profil');
        this.isSaving = false;
      }
    });

    this.subscriptions.add(updateSub);
  }

  // === GESTION DES MODALS ÉTABLISSEMENT ===
  ouvrirModalEtablissement(): void {
    if (this.etablissement) {
      this.editingEtablissement = { ...this.etablissement };
      this.showEtablissementModal = true;
    }
  }

  fermerModalEtablissement(): void {
    this.showEtablissementModal = false;
    this.editingEtablissement = null;
  }

  annulerModificationsEtablissement(): void {
    this.fermerModalEtablissement();
  }

  sauvegarderEtablissement(): void {
    if (!this.editingEtablissement || !this.etablissement) return;

    // Validation
    if (!this.editingEtablissement.nom || !this.editingEtablissement.anneeScolaire) {
       this.error = 'Le nom et l\'année scolaire sont obligatoires';
 
      return;
    }

    this.isSaving = true;
if (!this.etablissement.id) return;
    const updateSub = this.etablissementService.updateEtablissement(
      this.etablissement.id,
      {
        nom: this.editingEtablissement.nom,
        anneeScolaire: this.editingEtablissement.anneeScolaire
      }
    ).subscribe({
      next: (updatedEtablissement: EtablissementDto | null) => {
        if(updatedEtablissement?.code  == 409){
             this.error =   updatedEtablissement.message || 'error';
              this.isSaving = false;
                 console.error('   la mise à jour de l\'établissement:', updatedEtablissement);
             this.fermerModalEtablissement();
             return
        }
         
 this.isSaving = false;
        this.etablissement = updatedEtablissement;
           
        this.fermerModalEtablissement();

         console.error('   la mise à jour de l\'établissement:', updatedEtablissement);
       this.successMessage = updatedEtablissement?.message || ' succes';
 this.loadUserProfile();
       
      },
      error: (error: any) => {
              this.error = 'Erreur lors de la mise à jour de l\'établissement';
      
        this.notificationService.showError('Erreur lors de la mise à jour de l\'établissement');
        this.isSaving = false;
      }
    });

    this.subscriptions.add(updateSub);
  }

  // === GESTION DU LOGO ===
  ouvrirModalLogo(): void {
    this.showLogoModal = true;
    this.selectedLogoFile = null;
    this.logoPreview = null;
  }

  fermerModalLogo(): void {
    this.showLogoModal = false;
    this.selectedLogoFile = null;
    this.logoPreview = null;
        this.loadUserProfile();
  }

  onLogoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        this.error ="Veuillez sélectionner un fichier image valide";
 
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB max
         this.error ="Le fichier ne doit pas dépasser 5MB";
  
        return;
      }

      this.selectedLogoFile = file;

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploaderLogo(): void {
    if (!this.selectedLogoFile || !this.etablissement) return;

    this.isUploadingLogo = true;

    if( !this.etablissement.id) return;
    const uploadSub = this.etablissementService.uploadLogo(
      this.selectedLogoFile,
      this.authservice.getIdEtablessement()
    ).subscribe({
      next: (response) => {

        // Mettre à jour le logo dans l'établissement
        if (this.etablissement) {
          this.etablissement.logo = response.message ;
        }
     
        // this.loadEtablissementData(this.authservice.getIdEtablessement());
        this.loadUserProfile();
        console.log('Logo mis à jour:', response);
        this.fermerModalLogo();
         
   this.successMessage = 'Logo mis à jour avec succès';
      
        this.isUploadingLogo = false;
      },
      error: (error: any) => {
           this.error = 'Erreur lors de l\'upload du logo';
        
        this.isUploadingLogo = false;
      }
    });
 this.loadUserProfile();
    this.subscriptions.add(uploadSub);
  }

  // === GESTION DU MOT DE PASSE ===
  changerMotDePasse(): void {
    this.showPasswordModal = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = null;
  }

  fermerModalMotDePasse(): void {
    this.showPasswordModal = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = null;
  }

  sauvegarderMotDePasse(): void {
    this.passwordError = null;

    // Validations
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.passwordError = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.passwordError = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (!this.utilisateur) return;

    this.isSaving = true;
if( !this.utilisateur.id) return;
    const passwordSub = this.userService.changerMotDePasse(
      this.utilisateur.id,
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.fermerModalMotDePasse();
         this.successMessage = 'Mot de passe changé avec succès';
        
     
        this.isSaving = false;
      },
      error: (error: any) => {
        this.error = 'Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.';
 
        this.isSaving = false;
      }
    });

    this.subscriptions.add(passwordSub);
  }

  // === UTILITAIRES ===
  getLogoUrl(logo?: string): string {
    return logo && logo !== '' ? logo : '/MbemNova.png';
  }

  // Deprecated: gardé pour compatibilité avec le template existant
  onFileSelected(event: any): void {
    this.onLogoFileSelected(event);
  }



onImageError(event: Event) {
  const imgElement = event.target as HTMLImageElement;
  if (!imgElement.src.includes('lycee.jpg')) {
    imgElement.src = '\img\lycee.jpg';
  }
}



   
}