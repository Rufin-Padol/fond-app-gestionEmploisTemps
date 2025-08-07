import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-sisbar2',
  imports: [CommonModule],
  templateUrl: './sisbar2.component.html',
  styleUrl: './sisbar2.component.css'
})
export class Sisbar2Component {
  isOpen = false;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    // Bloque/débloque le scroll du body
    document.body.style.overflow = this.isOpen ? 'hidden' : 'auto';
  }

  // Ferme la sidebar si on clique à l'extérieur
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('aside') && this.isOpen) {
      this.toggleSidebar();
    }
  }

  // Ferme la sidebar avec la touche Escape
  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.isOpen) {
      this.toggleSidebar();
    }
  }
}
