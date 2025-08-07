import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

 
@Component({
  selector: 'app-sisbar',
  imports: [CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './sisbar.component.html',
  styleUrl: './sisbar.component.css'
})
export class SisbarComponent {
   

}