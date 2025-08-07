import { Component } from '@angular/core';
import { EnseignantDto } from '../../../core/model/models';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from "@angular/router";
import { NewProfesseurComponent } from "./new-professeur/new-professeur.component";


@Component({
  selector: 'app-professeur',
   imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './professeur.component.html',
  styleUrl: './professeur.component.css'
})
export class ProfesseurComponent {

}