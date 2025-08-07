import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EmploiDuTempsClasseDto, EmploiDuTempsIndividuelDto, FicheEnseignantDto } from '../model/models';
import { Observable } from 'rxjs';
import { Jour } from '../model/enums';

@Injectable({
  providedIn: 'root'
})
export class EmploiDuTempsServiceService {



  private apiUrl1 = `${environment.apiUrl}/emplois-du-temps`;
  private apiUrl2 = `${environment.apiUrl}/emplois-du-temps-individuels`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer l'emploi du temps d'une classe
   */
  getEmploiDuTempsClasse(classeId: number): Observable<EmploiDuTempsClasseDto> {
    return this.http.get<EmploiDuTempsClasseDto>(`${this.apiUrl1}/classe/${classeId}`);
  }

  /**
   * Récupérer l'emploi du temps individuel d'un enseignant
   */
  getEmploiDuTempsEnseignant(enseignantId: number): Observable<EmploiDuTempsIndividuelDto> {
    return this.http.get<EmploiDuTempsIndividuelDto>(`${this.apiUrl2}/${enseignantId}`);
  }

  /**
   * Créer un emploi du temps pour une classe
   */
  createEmploiDuTempsClasse(emploi: Partial<EmploiDuTempsClasseDto>): Observable<EmploiDuTempsClasseDto> {
    return this.http.post<EmploiDuTempsClasseDto>(`${this.apiUrl1}/save`, emploi);
  }

  /**
   * Mettre à jour l'emploi du temps d'une classe
   */
  updateEmploiDuTempsClasse(id: number, emploi: Partial<EmploiDuTempsClasseDto>): Observable<EmploiDuTempsClasseDto> {
    return this.http.put<EmploiDuTempsClasseDto>(`${this.apiUrl1}/classe/update/${id}`, emploi);
  }

  /**
   * Supprimer l'emploi du temps d'une classe
   */
  deleteEmploiDuTempsClasse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl1}/${id}`);
  }

  // /**
  //  * Générer automatiquement l'emploi du temps d'une classe
  //  */
  // genererEmploiDuTempsClasse(classeId: number): Observable<EmploiDuTempsClasseDto> {
  //   return this.http.post<EmploiDuTempsClasseDto>(`${this.apiUrl}/classe/${classeId}/generer`, {});
  // }


    getEmploiDuTempsClasses(): Observable<EmploiDuTempsClasseDto[]> {
      return this.http.get<EmploiDuTempsClasseDto[]>(`${this.apiUrl1}/classe/all`);
    }

    getEmploisDuTempsEtablissement(
  idEtablissement: number,
  jour: string,
  heureDebut: string,
  heureFin: string
): Observable<EmploiDuTempsClasseDto[]> {
  const params = new HttpParams()
    .set('idEtablissement', idEtablissement)
    .set('jour', jour)
    .set('heureDebut', heureDebut)
    .set('heureFin', heureFin);

  return this.http.get<EmploiDuTempsClasseDto[]>(`${this.apiUrl1}/etablissement/creneaux`, { params });
}


/**
   * Générer la fiche enseignant
   * @param enseignantId id de l'enseignant
   * @param etablissementId id de l'établissement
   * @returns Observable<FicheEnseignantDto>
   */
  genererFicheEnseignant(enseignantId: number, etablissementId: number): Observable<FicheEnseignantDto> {
    const url = `${this.apiUrl2}/enseignants/${enseignantId}/fiche`;
    const params = new HttpParams().set('etablissementId', etablissementId.toString());

    return this.http.get<FicheEnseignantDto>(url, { params });
  }


  /**
 * Générer toutes les fiches des enseignants d’un établissement
 * @param etablissementId id de l’établissement
 * @returns Observable<FicheEnseignantDto[]>
 */
genererToutesFichesEnseignants(etablissementId: number): Observable<FicheEnseignantDto[]> {
  const url = `${this.apiUrl2}/enseignants/fiche/all`;
  const params = new HttpParams().set('etablissementId', etablissementId.toString());

  return this.http.get<FicheEnseignantDto[]>(url, { params });
}


getEmploisSalles(idEtablissement: number): Observable<EmploiDuTempsClasseDto[]> {
  return this.http.get<EmploiDuTempsClasseDto[]>(`${this.apiUrl1}/etablissement/${idEtablissement}/salles`);
}

}
