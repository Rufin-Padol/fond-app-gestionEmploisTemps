import { Component } from '@angular/core';
import { TypeRole, User } from '../../../../core/model/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collaborateur',
  imports: [CommonModule, FormsModule],
  templateUrl: './collaborateur.component.html',
  styleUrl: './collaborateur.component.css'
})
export class CollaborateurComponent {
users: User[] = [];
  editingUser: User | null = null;
  
  showUserModal: boolean = false;
  isSaving: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  userError: string | null = null;

  // ID de l'établissement (sera récupéré du contexte utilisateur)
  etablissementId: number = 1;

  ngOnInit(): void {
    this.chargerUsers();
  }

  private chargerUsers(): void {
    this.loading = true;
    
    // Simuler le chargement des données
    setTimeout(() => {
      // Données simulées des utilisateurs
      this.users = [
        // {
        //   id: 1,
        //   nom: 'Jean Dupont',
        //   email: 'jean.dupont@etablissement.edu',
        //   actif: true,
        //   role: TypeRole.ADMIN,
        //   logo: ''
        // },
        // {
        //   id: 2,
        //   nom: 'Marie Martin',
        //   email: 'marie.martin@etablissement.edu',
        //   actif: true,
        //   role: TypeRole.USER,
        //   logo: ''
        // },
        // {
        //   id: 3,
        //   nom: 'Pierre Durand',
        //   email: 'pierre.durand@etablissement.edu',
        //   actif: false,
        //   role: TypeRole.USER,
        //   logo: ''
        // },
        // {
        //   id: 4,
        //   nom: 'Sophie Leroy',
        //   email: 'sophie.leroy@etablissement.edu',
        //   actif: true,
        //   role: TypeRole.ADMIN,
        //   logo: ''
        // }
      ];

      this.loading = false;
    }, 1000);
  }

  // Gestion des utilisateurs
  ouvrirModalAjout(): void {
    this.editingUser = {
      nom: '',
      email: '',
      mdp: '',
      actif: true,
      role: TypeRole.USER,
      logo: ''
    };
    this.userError = null;
    this.showUserModal = true;
  }

  modifierUser(user: User): void {
    this.editingUser = { 
      ...user,
      mdp: undefined // Ne pas inclure le mot de passe lors de la modification
    };
    this.userError = null;
    this.showUserModal = true;
  }

  fermerModalUser(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.userError = null;
  }

  sauvegarderUser(): void {
    if (!this.editingUser) return;

    // Validation
    this.userError = null;
    
    if (!this.editingUser.nom?.trim()) {
      this.userError = 'Le nom est obligatoire';
      return;
    }

    if (!this.editingUser.email?.trim()) {
      this.userError = 'L\'email est obligatoire';
      return;
    }

    if (!this.editingUser.id && !this.editingUser.mdp?.trim()) {
      this.userError = 'Le mot de passe est obligatoire pour un nouvel utilisateur';
      return;
    }

    // Vérifier si l'email existe déjà
    const emailExists = this.users.some(u => 
      u.email === this.editingUser!.email && u.id !== this.editingUser!.id
    );
    
    if (emailExists) {
      this.userError = 'Cet email est déjà utilisé par un autre utilisateur';
      return;
    }

    this.isSaving = true;

    // Simuler l'appel API
    setTimeout(() => {
      if (this.editingUser) {
        if (this.editingUser.id) {
          // Modification
          const index = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (index !== -1) {
            // Ne pas modifier le mot de passe lors de la modification
            const { mdp, ...userWithoutPassword } = this.editingUser;
            this.users[index] = { ...this.users[index], ...userWithoutPassword };
          }
        } else {
          // Ajout
          this.editingUser.id = Math.max(...this.users.map(u => u.id || 0)) + 1;
          // Retirer le mot de passe de l'objet stocké (sécurité)
          const { mdp, ...userWithoutPassword } = this.editingUser;
          this.users.push({ ...userWithoutPassword } as User);
        }
        
        this.fermerModalUser();
        console.log('Utilisateur sauvegardé avec succès');
      }
      this.isSaving = false;
    }, 1000);
  }

  supprimerUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.nom}" ?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      console.log('Utilisateur supprimé avec succès');
    }
  }

  // Utilitaires
  getInitials(nom?: string): string {
    if (!nom) return 'U';
    
    return nom
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleLabel(role?: TypeRole): string {
    switch (role) {
      case TypeRole.ADMIN:
        return 'Administrateur';
      case TypeRole.SUPER_ADMIN:
        return 'Super Admin';
      case TypeRole.USER:
      default:
        return 'Utilisateur';
    }
  }
}