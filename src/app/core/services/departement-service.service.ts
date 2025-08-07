import { Injectable } from '@angular/core';
import { DepartementDto } from '../model/models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environement/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartementServiceService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * 🔍 Récupérer tous les départements
   */
  getAllDepartements(): Observable<DepartementDto[]> {
    return this.http.get<DepartementDto[]>(`${this.apiUrl}/departements`);
  }

  /**
   * 🔍 Récupérer un département par ID
   */
  getDepartementById(id: number): Observable<DepartementDto> {
    return this.http.get<DepartementDto>(`${this.apiUrl}/departement/${id}`);
  }

  /**
   * ➕ Créer un département
   */
  createDepartement(dto: DepartementDto): Observable<DepartementDto> {
    return this.http.post<DepartementDto>(`${this.apiUrl}/departement`, dto);
  }

  /**
   * ✏️ Mettre à jour un département
   */
updateDepartement(id: number, updates: Partial<DepartementDto>): Observable<DepartementDto> {
  return this.http.patch<DepartementDto>(`${this.apiUrl}/departement/${id}`, updates);
}

  /**
   * ❌ Supprimer un département
   */
  deleteDepartement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departement/${id}`);
  }


  getDepartementsByEtablissement(etablissementId: number): Observable<DepartementDto[]> {
  return this.http.get<DepartementDto[]>(`${this.apiUrl}/etablissement/${etablissementId}`);
}

}