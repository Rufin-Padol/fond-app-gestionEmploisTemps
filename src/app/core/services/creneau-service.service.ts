import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { CreneauDto } from '../model/models';
import { Observable } from 'rxjs';
import { Jour } from '../model/enums';

@Injectable({
  providedIn: 'root'
})
export class CreneauServiceService {

 private apiUrl = `${environment.apiUrl}/creneaux`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les créneaux
   */
  getAllCreneaux(): Observable<CreneauDto[]> {
    return this.http.get<CreneauDto[]>(this.apiUrl + '/tout');
  }

  /**
   * Récupérer un créneau par son ID
   */
  getCreneauById(id: number): Observable<CreneauDto> {
    return this.http.get<CreneauDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les créneaux d'une classe
   */
  getCreneauxByClasse(classeId: number): Observable<CreneauDto[]> {
    return this.http.get<CreneauDto[]>(`${this.apiUrl}/classe/${classeId}`);
  }

  /**
   * Récupérer les créneaux d'un enseignant
   */
  getCreneauxByEnseignant(enseignantId: number): Observable<CreneauDto[]> {
    return this.http.get<CreneauDto[]>(`${this.apiUrl}/enseignant/${enseignantId}`);
  }

  /**
   * Récupérer les créneaux d'une salle
   */
  getCreneauxBySalle(salleId: number): Observable<CreneauDto[]> {
    return this.http.get<CreneauDto[]>(`${this.apiUrl}/salle/${salleId}`);
  }

  /**
   * Récupérer les créneaux par jour
   */
  getCreneauxByJour(jour: Jour): Observable<CreneauDto[]> {
    return this.http.get<CreneauDto[]>(`${this.apiUrl}/jour/${jour}`);
  }

  /**
   * Créer un nouveau créneau
   */
  createCreneau(creneau: Partial<CreneauDto>): Observable<CreneauDto> {
    return this.http.post<CreneauDto>(this.apiUrl + "/enregistrer", creneau);
  }

  /**
   * Mettre à jour un créneau
   */
  updateCreneau(id: number, creneau: Partial<CreneauDto>): Observable<CreneauDto> {
    return this.http.put<CreneauDto>(`${this.apiUrl}/${id}`, creneau);
  }

  /**
   * Supprimer un créneau
   */
  deleteCreneau(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}