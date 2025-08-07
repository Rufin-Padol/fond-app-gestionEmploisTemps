import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalleDto } from '../model/models';

@Injectable({
  providedIn: 'root'
})
export class SalleServiceService {

  private apiUrl = `${environment.apiUrl}/salles`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les salles
   */
  getAllSalles(): Observable<SalleDto[]> {
    return this.http.get<SalleDto[]>(this.apiUrl+"/tous");
  }

  /**
   * Récupérer une salle par son ID
   */
  getSalleById(id: number): Observable<SalleDto> {
    return this.http.get<SalleDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les salles par type
   */
  getSallesByType(type: string): Observable<SalleDto[]> {
    return this.http.get<SalleDto[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Récupérer une salle par son numéro
   */
  getSalleByNumero(numero: string): Observable<SalleDto> {
    return this.http.get<SalleDto>(`${this.apiUrl}/numero/${numero}`);
  }

  /**
   * Créer une nouvelle salle
   */
  createSalle(salle: Partial<SalleDto>): Observable<SalleDto> {
    return this.http.post<SalleDto>(this.apiUrl+'/enregistrer', salle);
  }

  /**
   * Mettre à jour une salle
   */
  updateSalle(id: number, salle: Partial<SalleDto>): Observable<SalleDto> {
    return this.http.put<SalleDto>(`${this.apiUrl}/${id}`, salle);
  }

  /**
   * Supprimer une salle
   */
  deleteSalle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}