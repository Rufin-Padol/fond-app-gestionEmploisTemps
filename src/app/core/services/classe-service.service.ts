import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { ClasseDto } from '../model/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClasseServiceService {

   private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les classes
   */
  getAllClasses(): Observable<ClasseDto[]> {
    return this.http.get<ClasseDto[]>(this.apiUrl+'/tous');
  }

  /**
   * Récupérer une classe par son ID
   */
  getClasseById(id: number): Observable<ClasseDto> {
    return this.http.get<ClasseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les classes par filière
   */
  getClassesByFiliere(filiere: string): Observable<ClasseDto[]> {
    return this.http.get<ClasseDto[]>(`${this.apiUrl}/filiere/${filiere}`);
  }

  /**
   * Récupérer les classes par niveau
   */
  getClassesByNiveau(niveau: string): Observable<ClasseDto[]> {
    return this.http.get<ClasseDto[]>(`${this.apiUrl}/niveau/${niveau}`);
  }

  /**
   * Créer une nouvelle classe
   */
  createClasse(classe: Partial<ClasseDto>): Observable<ClasseDto> {
    return this.http.post<ClasseDto>(this.apiUrl + '/enregistrer', classe);
  }

  /**
   * Mettre à jour une classe
   */
  updateClasse(id: number, classe: Partial<ClasseDto>): Observable<ClasseDto> {
    return this.http.put<ClasseDto>(`${this.apiUrl}/${id}`, classe);
  }

  /**
   * Supprimer une classe
   */
  deleteClasse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  /**
 * Récupérer les classes par établissement
 */
getClassesByEtablissement(etablissementId: number): Observable<ClasseDto[]> {
  return this.http.get<ClasseDto[]>(`${this.apiUrl}/etablissement/${etablissementId}`);
}

}
