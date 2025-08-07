import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { HttpClient } from '@angular/common/http';
import { HoraireDTO, JourDto } from '../model/models';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanningServiceService {

   private apiUrlJour = `${environment.apiUrl}/jours`;
  private apiUrlHoraire = `${environment.apiUrl}/Horaires`;

  constructor(private http: HttpClient) {}

  // --- JOURS ---

  getAllJours(): Observable<JourDto[]> {
    return this.http.get<JourDto[]>(`${this.apiUrlJour}/list`);
  }

  getJourById(id: number): Observable<JourDto> {
    return this.http.get<JourDto>(`${this.apiUrlJour}/${id}`);
  }

  createJour(jour: Partial<JourDto>): Observable<JourDto> {
    return this.http.post<JourDto>(`${this.apiUrlJour}/enregistrer`, jour);
  }

  updateJour(id: number, jour: Partial<JourDto>): Observable<JourDto> {
    return this.http.put<JourDto>(`${this.apiUrlJour}/modifier/${id}`, jour);
  }

  deleteJour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlJour}/${id}`);
  }

  // --- HORAIRES ---

  getAllHoraires(): Observable<HoraireDTO[]> {
    return this.http.get<HoraireDTO[]>(`${this.apiUrlHoraire}/list`);
  }

  getHoraireById(id: number): Observable<HoraireDTO> {
    return this.http.get<HoraireDTO>(`${this.apiUrlHoraire}/${id}`);
  }

  createHoraire(horaire: Partial<HoraireDTO>): Observable<HoraireDTO> {
    return this.http.post<HoraireDTO>(`${this.apiUrlHoraire}/enregistrer`, horaire);
  }

  updateHoraire(id: number, horaire: Partial<HoraireDTO>): Observable<HoraireDTO> {
    return this.http.put<HoraireDTO>(`${this.apiUrlHoraire}/modifier/${id}`, horaire);
  }

  deleteHoraire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlHoraire}/${id}`);
  }

  // --- MÉTHODE COMBINÉE ---

  /**
   * Enregistre un jour et un horaire simultanément
   * Renvoie un Observable avec un tableau contenant [JourDto, HoraireDto]
   */
  enregistrerJourEtHoraire(
    jour: Partial<JourDto>,
    horaire: Partial<HoraireDTO>
  ): Observable<[JourDto, HoraireDTO]> {
    return forkJoin([
      this.createJour(jour),
      this.createHoraire(horaire)
    ]);
  }


  getHorairesParEtablissement(etablissementId: number): Observable<HoraireDTO[]> {
  return this.http.get<HoraireDTO[]>(`${this.apiUrlHoraire}/etablissement/${etablissementId}`);
}


getJoursParEtablissement(etablissementId: number): Observable<JourDto[]> {
  return this.http.get<JourDto[]>(`${this.apiUrlJour}/etablissement/${etablissementId}`);
}


}