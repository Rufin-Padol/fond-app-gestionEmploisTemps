import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatiereDto } from '../model/models';
import { CategorieMatiere } from '../model/enums';

@Injectable({
  providedIn: 'root'
})
export class MatiereServiceService {

  private apiUrl = `${environment.apiUrl}/matieres`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les matières
   */
  getAllMatieres(): Observable<MatiereDto[]> {
    return this.http.get<MatiereDto[]>(this.apiUrl);
  }

  /**
   * Récupérer une matière par son ID
   */
  getMatiereById(id: number): Observable<MatiereDto> {
    return this.http.get<MatiereDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les matières par catégorie
   */
  getMatieresByCategorie(categorie: CategorieMatiere): Observable<MatiereDto[]> {
    return this.http.get<MatiereDto[]>(`${this.apiUrl}/categorie/${categorie}`);
  }

  /**
   * Récupérer une matière par son code
   */
  getMatiereByCode(code: string): Observable<MatiereDto> {
    return this.http.get<MatiereDto>(`${this.apiUrl}/code/${code}`);
  }

  /**
   * Créer une nouvelle matière
   */
  createMatiere(matiere: Partial<MatiereDto>): Observable<MatiereDto> {
    return this.http.post<MatiereDto>(this.apiUrl + '/save', matiere);
  }

  /**
   * Mettre à jour une matière
   */
  updateMatiere(id: number, matiere: Partial<MatiereDto>): Observable<MatiereDto> {
    return this.http.put<MatiereDto>(`${this.apiUrl}/${id}`, matiere);
  }

  /**
   * Supprimer une matière
   */
  deleteMatiere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}