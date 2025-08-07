import { Component } from '@angular/core';
import { EtablissementDto } from '../../../../core/model/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { EtablissementUserDTO } from '../../../../core/services/etablissement-service.service';
import { EtablissementServiceUserService } from '../../../../core/services/etablissement-service-user.service';
interface FiltresEtablissement {
  recherche: string;
  anneeScolaire: string;
}

@Component({
  selector: 'app-gestion-etablissement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-etablisement.component.html',
  styleUrl: './gestion-etablisement.component.css'
})
export class GestionEtablisementComponent {

 // États des modales
  showDetailsModal = false;
  showEditModal = false;
  isCreating = false;
  isSaving = false;

    apiUrl= "http://localhost:8080";

  // Données - CORRIGÉ: utilisation d'EtablissementUserDTO[]
  etablissements: EtablissementUserDTO[] = [];
  selectedDto: EtablissementUserDTO | null = null;
  editingDto: EtablissementUserDTO | null = null;



  selectedLogoFile: File | null = null;
logoPreview: string | ArrayBuffer | null = null;
errorMessage: string | null = null;
successMessage: string | null = null;
isUploadingLogo: boolean = false;

  // Filtres
  filtres: FiltresEtablissement = {
    recherche: '',
    anneeScolaire: ''
  };

  // Options pour les filtres
  anneesScolaires: string[] = [
    '2023-2024',
    '2024-2025',
    '2025-2026',
    '2027-2028',
    '2029-2030',
  
  ];
messageError: any;
messageSucess: any;
isloading: boolean= false;

  constructor(private etablissementService: EtablissementServiceUserService) {}

  ngOnInit(): void {
    
    this.chargerEtablissements();
  }

  // ====== GESTION DES DONNÉES ======
  chargerEtablissements(): void {
    this.etablissementService.getAllEtablissementsAvecAdmin().subscribe({
      next: (data) => {
        this.etablissements = data;
        console.log('Établissements chargés:', data);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des établissements:', error);
        this.etablissements = [];
      }
    });
  }

  getEtablissementsActifs(): EtablissementUserDTO[] {
    return this.etablissements.filter(dto => {
      const etablissement = dto.etablissement;
      if (!etablissement) return false;

      const matchRecherche = !this.filtres.recherche || 
        etablissement.nom.toLowerCase().includes(this.filtres.recherche.toLowerCase());
      
      const matchAnnee = !this.filtres.anneeScolaire || 
        etablissement.anneeScolaire === this.filtres.anneeScolaire;

      return matchRecherche && matchAnnee;
    });
  }

  // ====== GESTION DES FILTRES ======
  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      anneeScolaire: ''
    };
  }

  // ====== ACTIONS ÉTABLISSEMENTS ======
  voirDetails(dto: EtablissementUserDTO): void {
    this.selectedDto = dto;
    this.showDetailsModal = true;
  }

  fermerDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDto = null;
  }

  creerNouvelEtablissement(): void {
    this.isCreating = true;
    this.editingDto = {
      etablissement: {
        id: 0,
        nom: '',
        logo: '',
        anneeScolaire: '',
        departements: [],
        classes: [],
        enseignants: [],
        telephone: '',
      email: '',
      adresse: '',
      ville: '',
      pays: '',
      codePostal: '',
      nomEn: ''
      },
      user: {
        nom: '',
        email: '',
        mdp: '',
        actif: true,
        role: 'ADMIN' as any
      }
    };
    this.showEditModal = true;
  }

  modifierEtablissement(dto: EtablissementUserDTO): void {
    this.isCreating = false;
    this.editingDto = {
      etablissement: dto.etablissement ? { ...dto.etablissement } : undefined,
      user: dto.user ? { ...dto.user } : {
        nom: '',
        email: '',
        mdp: '',
        actif: true,
        role: 'ADMIN' as any
      }
    };
    this.showEditModal = true;
  }

  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingDto = null;
    this.isCreating = false;
  }

  annulerModifications(): void {
    this.fermerEditModal();
  }

  sauvegarderEtablissement(): void {
    if (!this.editingDto || !this.editingDto.etablissement?.nom || !this.editingDto.user?.nom || !this.editingDto.user?.email) {
      return;
    }

    this.isSaving = true;
    this.isloading = true;

    // Préparer les données selon le format attendu
    const dataToSend: EtablissementUserDTO = {
      
      etablissement: {
        id: this.editingDto.etablissement.id ,
        nom: this.editingDto.etablissement.nom,
        logo: this.editingDto.etablissement.logo || '',
        anneeScolaire: this.editingDto.etablissement.anneeScolaire || '',
        telephone: this.editingDto.etablissement.telephone || '',
    email: this.editingDto.etablissement.email || '',
    adresse: this.editingDto.etablissement.adresse || '',
    ville: this.editingDto.etablissement.ville || '',
    pays: this.editingDto.etablissement.pays || '',
    codePostal: this.editingDto.etablissement.codePostal || '',
    nomEn: this.editingDto.etablissement.nomEn || ''
      },
      user: {
         id:this.editingDto.user.id,
        nom: this.editingDto.user.nom,
        email: this.editingDto.user.email,
        mdp: this.editingDto.user.mdp || '123456', // Mot de passe par défaut
        role: 'ADMIN' as any,
        actif: true
      }
    };

         console.log('donner envoyer', dataToSend);

    if (this.isCreating) {
       const dataToSend: EtablissementUserDTO = {
      etablissement: {
   
        nom: this.editingDto.etablissement.nom,
        logo: this.editingDto.etablissement.logo || '',
        anneeScolaire: this.editingDto.etablissement.anneeScolaire || '',
        telephone: this.editingDto.etablissement.telephone || '',
    email: this.editingDto.etablissement.email || '',
    adresse: this.editingDto.etablissement.adresse || '',
    ville: this.editingDto.etablissement.ville || '',
    pays: this.editingDto.etablissement.pays || '',
    codePostal: this.editingDto.etablissement.codePostal || '',
    nomEn: this.editingDto.etablissement.nomEn || ''
      },
      user: {
       
        nom: this.editingDto.user.nom,
        email: this.editingDto.user.email,
        mdp: this.editingDto.user.mdp || '123456', // Mot de passe par défaut
        role: 'ADMIN' as any,
        actif: true
      }
    };
      // Création d'un nouvel établissement avec utilisateur
      this.etablissementService.createEtablissementAvecUser(dataToSend).subscribe({
        next: (response) => {
          console.log('Établissement créé:', response);

        
        
          setTimeout(() => {
              this.messageError = null;
          this.editingDto = null;
              this.messageSucess = 'Établissement créé avec succès';
            this.isloading = false;
              this.isSaving = false;
               this.chargerEtablissements();
          this.fermerEditModal();
          }, 2000);
          setTimeout(() => {
            this.messageSucess = null;
          }, 5000);
         
        
        },
        error: (error) => {

            setTimeout(() => {
         this.messageError = error.error.message || 'Erreur lors de la création de l\'établissement';
          this.fermerEditModal();
          this.messageSucess = null;
          console.error('Erreur lors de la création:', error);
          this.editingDto = null;
          this.chargerEtablissements();
          console.error('Erreur lors de la création:', error);
          this.isSaving = false;
          this.isloading = false;
               this.chargerEtablissements();
          this.fermerEditModal();
          }, 1000);
        
          setTimeout(() => {
            this.messageError = null;
          }, 3000);
           
        }
      });
    } else {
      // Modification d'un établissement existant
      if (this.editingDto.etablissement?.id) {
        console.log(this.editingDto.etablissement.id)
        this.etablissementService.updateEtablissementAvecUser(
          this.editingDto.etablissement.id, 
          dataToSend
        ).subscribe({
          next: (response) => {

              setTimeout(() => {
              this.messageSucess = 'Établissement créé avec succès';
          this.messageError = null;
          this.editingDto = null;
           this.chargerEtablissements();
          this.fermerEditModal();
          this.isSaving = false;
          this.isloading = false;
          }, 2000);
             console.log('Établissement créé:', response);

        
          setTimeout(() => {
            this.messageSucess = null;
          }, 5000);
         
          },
          error: (error) => {

            
              setTimeout(() => {
              this.messageError = error.error.message || 'Erreur lors de la création de l\'établissement';
  this.fermerEditModal();
          this.messageSucess = null;
          console.error('Erreur lors de la création:', error);
          this.editingDto = null;
          this.chargerEtablissements();
          console.error('Erreur lors de la création:', error);
          this.isSaving = false;
          this.isloading = false;
          }, 1000);
        
          setTimeout(() => {
            this.messageError = null;
          }, 3000);
           
          }
        });
      }
    }
  }

  // supprimerEtablissement(dto: EtablissementUserDTO): void {
  //   if (dto.etablissement?.id && confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
  //     this.etablissementService.deleteEtablissement(dto.etablissement.id).subscribe({
  //       next: () => {
  //         console.log('Établissement supprimé');
  //         this.chargerEtablissements();
  //       },
  //       error: (error) => {
  //         console.error('Erreur lors de la suppression:', error);
  //       }
  //     });
  //   }
  // }

  // ====== GESTION DU LOGO ======
  supprimerEtablissement(dto: EtablissementUserDTO): void {
  if (!dto.etablissement?.id) return;
  Swal.fire({
    title: 'Confirmation',
    text: 'Êtes-vous sûr de vouloir supprimer cet établissement ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
    if (!dto.etablissement?.id) return;
     this.etablissementService.deleteEtablissement(dto.etablissement.id).subscribe({
        next: () => {
          Swal.fire('Supprimé !', 'L’établissement a été supprimé.', 'success');
          this.chargerEtablissements();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
        }
      });
    }
  });
}

  
  
  // onLogoSelected(event: any): void {
  //   const file = event.target.files[0];
  //   if (file && this.editingDto?.etablissement) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (this.editingDto?.etablissement) {
  //         this.editingDto.etablissement.logo = e.target?.result as string;
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  supprimerLogo(): void {
    if (this.editingDto?.etablissement) {
      this.editingDto.etablissement.logo = '';
    }
  }

  // ====== MÉTHODES UTILITAIRES ======
  hasUser(dto: EtablissementUserDTO): boolean {
    return dto.user !== null && dto.user !== undefined;
  }

  getUserStatus(dto: EtablissementUserDTO): string {
    if (!this.hasUser(dto)) {
      return 'Aucun administrateur';
    }
    return dto.user?.actif ? 'Actif' : 'Inactif';
  }



  onLogoSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      this.errorMessage = "Veuillez sélectionner un fichier image valide";
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      this.errorMessage = "Le fichier ne doit pas dépasser 2MB";
      return;
    }

    this.selectedLogoFile = file;
    this.errorMessage = null;

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.logoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

uploadLogo(): void {
  if (!this.selectedLogoFile || !this.editingDto?.etablissement?.id) {
    return;
  }

  this.isUploadingLogo = true;
  this.errorMessage = null;
  this.successMessage = null;

  this.etablissementService.uploadLogo(this.selectedLogoFile, this.editingDto.etablissement.id)
    .subscribe({
      next: (response) => {
        if (this.editingDto?.etablissement) {
          this.editingDto.etablissement.logo = response.logoUrl || response.url;
        }
        this.successMessage = 'Logo mis à jour avec succès';
        this.selectedLogoFile = null;
        this.isUploadingLogo = false;
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de l\'upload du logo';
        this.isUploadingLogo = false;
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      }
    });
}
}