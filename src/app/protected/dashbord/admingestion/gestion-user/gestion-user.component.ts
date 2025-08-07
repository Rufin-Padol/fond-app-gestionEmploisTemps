import { Component } from '@angular/core';
import { TypeRole, User } from '../../../../core/model/user.model';
import { catchError, finalize, of } from 'rxjs';
import Swal from 'sweetalert2';
import { UserServiceService } from '../../../../core/services/user-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface UserFilters {
  recherche: string;
  role: string;
  actif: string;
}


@Component({
  selector: 'app-gestion-user',
  standalone: true,
   imports: [CommonModule, FormsModule],
  templateUrl: './gestion-user.component.html',
  styleUrl: './gestion-user.component.css'
})
export class GestionUserComponent {

 loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  users: User[] = [];
  
  // Propriétés pour les modals
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedUser: User | null = null;
  editingUser: User | null = null;
  isSaving: boolean = false;

  // Nouveau utilisateur pour l'ajout
  newUser: Partial<User> = {
    nom: '',
    email: '',
    mdp: '',
    role: TypeRole.SUPER_ADMIN,
    actif: true
  };

  // Filtres
  filtres: UserFilters = {
    recherche: '',
    role: '',
    actif: ''
  };

  // Énumérations pour les templates
  TypeRole = TypeRole;
  roles = Object.values(TypeRole);

  constructor(private userService: UserServiceService) {}

  ngOnInit(): void {
    this.loadSuperAdmins();
  }

  /**
   * Charge les super administrateurs
   */
  private loadSuperAdmins(): void {
    this.loading = true;
    this.error = null;

    this.userService.getSuperAdmins()
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des super admins:', error);
          this.showErrorMessage('Erreur lors du chargement des utilisateurs');
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((users: User[]) => {
        this.users = users;
        console.log('Super admins chargés:', this.users);
      });
  }

  /**
   * Récupère les utilisateurs filtrés
   */
  getUsersFiltered(): User[] {
    return this.users.filter(user => {
      const matchRecherche = this.filtres.recherche ? 
        (user.nom?.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
         user.email?.toLowerCase().includes(this.filtres.recherche.toLowerCase())) : true;
      
      const matchRole = this.filtres.role ? user.role === this.filtres.role : true;
      const matchActif = this.filtres.actif ? user.actif.toString() === this.filtres.actif : true;
      
      return matchRecherche && matchRole && matchActif;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFiltres(): void {
    this.filtres = {
      recherche: '',
      role: '',
      actif: ''
    };
  }

  /**
   * Ouvre le modal d'ajout d'utilisateur
   */
  ouvrirModalAjout(): void {
    this.newUser = {
      nom: '',
      email: '',
      mdp: '',
      role: TypeRole.SUPER_ADMIN,
      actif: true
    };
    this.showAddModal = true;
  }

  /**
   * Ferme le modal d'ajout
   */
  fermerModalAjout(): void {
    this.showAddModal = false;
    this.newUser = {
      nom: '',
      email: '',
      mdp: '',
      role: TypeRole.SUPER_ADMIN,
      actif: true
    };
  }

  /**
   * Ouvre le modal de modification
   */
  modifierUser(user: User): void {
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  /**
   * Ferme le modal de modification
   */
  fermerEditModal(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }

  /**
   * Ajoute un nouvel utilisateur
   */
  ajouterUser(): void {
    if (!this.validateUserForm(this.newUser)) {
      return;
    }

    this.isSaving = true;
    
    this.userService.createUser(this.newUser)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création:', error);
          this.showErrorMessage('Erreur lors de la création de l\'utilisateur');
              this.fermerModalAjout();
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe((result: any) => {
        if (result) {
          this.users.push(result);
          this.fermerModalAjout();
          this.showSuccessMessage('Utilisateur créé avec succès');
        }
      });
  }

  /**
   * Sauvegarde les modifications de l'utilisateur
   */
  sauvegarderUser(): void {
    if (!this.editingUser || !this.validateUserForm(this.editingUser)) {
      return;
    }

    this.isSaving = true;
    
    this.userService.updateUser(this.editingUser.id!, this.editingUser)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la sauvegarde:', error);
              this.fermerModalAjout();
          this.showErrorMessage('Erreur lors de la sauvegarde de l\'utilisateur');
          return of(null);
        }),
        finalize(() => this.isSaving = false)
      )
      .subscribe((result: any) => {
        if (result) {
          const index = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (index !== -1) {
            this.users[index] = { ...this.editingUser! };
          }
          this.fermerEditModal();
          this.showSuccessMessage('Utilisateur modifié avec succès');
        }
      });
  }

  /**
   * Supprime un utilisateur avec confirmation
   */
  supprimerUser(user: User): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer l'utilisateur ${user.nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.confirmerSuppression(user);
      }
    });
  }

  /**
   * Confirme et exécute la suppression
   */
  private confirmerSuppression(user: User): void {
    this.userService.deleteUser(user.id!)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression:', error);
          this.showErrorMessage('Erreur lors de la suppression de l\'utilisateur');
          return of(null);
        })
      )
      .subscribe((result: any) => {
        if (result !== null) {
          this.users = this.users.filter(u => u.id !== user.id);
          this.showSuccessMessage('Utilisateur supprimé avec succès');
        }
      });
  }

  /**
   * Valide le formulaire utilisateur
   */
  private validateUserForm(user: Partial<User>): boolean {
    if (!user.nom || user.nom.trim() === '') {
      this.showErrorMessage('Le nom est obligatoire');
      return false;
    }

    if (!user.email || user.email.trim() === '') {
      this.showErrorMessage('L\'email est obligatoire');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      this.showErrorMessage('L\'email n\'est pas valide');
      return false;
    }

    if (!user.role) {
      this.showErrorMessage('Le rôle est obligatoire');
      return false;
    }

    return true;
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

  /**
   * Obtient le libellé du rôle
   */
  getRoleLabel(role: TypeRole): string {
    switch (role) {
      case TypeRole.ADMIN:
        return 'Administrateur';
      case TypeRole.USER:
        return 'Utilisateur';
      case TypeRole.SUPER_ADMIN:
        return 'Super Administrateur';
      default:
        return role;
    }
  }

  /**
   * Obtient la classe CSS pour le badge de rôle
   */
  getRoleBadgeClass(role: TypeRole): string {
    switch (role) {
      case TypeRole.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case TypeRole.USER:
        return 'bg-gray-100 text-gray-800';
      case TypeRole.SUPER_ADMIN:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obtient la classe CSS pour le badge de statut
   */
  getStatusBadgeClass(actif: boolean): string {
    return actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}