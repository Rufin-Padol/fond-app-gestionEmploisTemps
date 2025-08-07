import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnseignantDto } from '../model/models';

@Injectable({
  providedIn: 'root'
})
export class EnseignantServiceService {

  private apiUrl = `${environment.apiUrl}/enseignants`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les enseignants
   */
  getAllEnseignants(): Observable<EnseignantDto[]> {
    return this.http.get<EnseignantDto[]>(this.apiUrl+'/tous');
  }

  /**
   * Récupérer un enseignant par son ID
   */
  getEnseignantById(id: number): Observable<EnseignantDto> {
    return this.http.get<EnseignantDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les enseignants par département
   */
  getEnseignantsByDepartement(departementId: number): Observable<EnseignantDto[]> {
    return this.http.get<EnseignantDto[]>(`${this.apiUrl}/departement/${departementId}`);
  }

  /**
   * Récupérer les enseignants par matière
   */
  getEnseignantsByMatiere(matiereId: number): Observable<EnseignantDto[]> {
    return this.http.get<EnseignantDto[]>(`${this.apiUrl}/matiere/${matiereId}`);
  }

  /**
   * Créer un nouvel enseignant
   */
  createEnseignant(enseignant: Partial<EnseignantDto>): Observable<EnseignantDto> {
    return this.http.post<EnseignantDto>(this.apiUrl + '/save', enseignant);
  }

  /**
   * Mettre à jour un enseignant
   */
  // ✅ Méthode pour modifier un enseignant
  updateEnseignant(id: number, enseignant: EnseignantDto): Observable<EnseignantDto> {
    return this.http.put<EnseignantDto>(`${this.apiUrl}/update/${id}`, enseignant);
  }


  /**
   * Supprimer un enseignant
   */
  deleteEnseignant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  /**
 * Récupérer les enseignants par établissement
 */
getEnseignantsByEtablissement(etablissementId: number): Observable<EnseignantDto[]> {
  return this.http.get<EnseignantDto[]>(`${this.apiUrl}/etablissement/${etablissementId}`);
}
}