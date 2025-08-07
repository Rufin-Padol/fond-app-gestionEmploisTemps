import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfilComponent } from './profil/profil.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { CollaborateurComponent } from './collaborateur/collaborateur.component';

@Component({
  selector: 'app-paramettre',
  imports: [CommonModule, ProfilComponent, ConfigurationComponent, CollaborateurComponent],
  templateUrl: './paramettre.component.html',
  styleUrl: './paramettre.component.css'
})
export class ParamettreComponent {
 activeTab: string = 'profil';

  tabs = [
    { id: 'profil', label: 'Profil', icon: 'user' },
    { id: 'configuration', label: 'Configuration', icon: 'cog' },
    { id: 'collaborateur', label: 'Collaborateur', icon: 'users' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getIconPath(iconType: string): string {
    const icons = {
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z'
    };
    return icons[iconType as keyof typeof icons] || icons.user;
  }
}