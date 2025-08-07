import { Injectable } from '@angular/core';
import { EtablissementDto } from '../model/models';
import { Observable } from 'rxjs';
import { EtablissementUserDTO } from './etablissement-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environement/environment';

@Injectable({
  providedIn: 'root'
})
export class EtablissementServiceUserService {

 private apiUrl = `${environment.apiUrl}/etablissements`;
 private apiUrlLogo = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un établissement avec son utilisateur associé
   */
  createEtablissementAvecUser(dto: EtablissementUserDTO): Observable<EtablissementUserDTO> {
    return this.http.post<EtablissementUserDTO>(`${this.apiUrl}/avec-admin`, dto);
  }

  /**
   * Mettre à jour un établissement et son utilisateur
   */
  updateEtablissementAvecUser(id: number, dto: EtablissementUserDTO): Observable<EtablissementUserDTO> {
    return this.http.patch<EtablissementUserDTO>(`${this.apiUrl}/modifier/${id}`, dto);
  }

  /**
   * Récupérer un établissement avec son utilisateur
   */
  getEtablissementAvecUser(id: number): Observable<EtablissementUserDTO> {
    return this.http.get<EtablissementUserDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer tous les établissements avec l'utilisateur ADMIN associé
   */
  getAllEtablissementsAvecAdmin(): Observable<EtablissementUserDTO[]> {
    return this.http.get<EtablissementUserDTO[]>(`${this.apiUrl}/avec-admin`);
  }

  /**
   * Supprimer un établissement par ID
   */
  deleteEtablissement(id: number): Observable<EtablissementDto> {
    return this.http.delete<EtablissementDto>(`${this.apiUrl}/supprimer/${id}`);
  }

  /**
   * Récupérer la liste de tous les établissements
   */
  getAllEtablissements(): Observable<EtablissementDto[]> {
    return this.http.get<EtablissementDto[]>(`${this.apiUrl}/tous`);
  }

  /**
   * Récupérer le dernier établissement
   */
  getDernierEtablissement(): Observable<EtablissementDto> {
    return this.http.get<EtablissementDto>(`${this.apiUrl}/dernier`);
  }

 // 🔍 Lire un établissement par ID
  getEtablissementParId(id: number): Observable<EtablissementDto> {
    return this.http.get<EtablissementDto>(`${this.apiUrl}/etablissements/${id}`);
  }

  uploadLogo(file: File, idEtablissement: number): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('idEtablissement', idEtablissement.toString());

  return this.http.post(`${this.apiUrlLogo}/logo/upload`, formData);
}

 updateEtablissement(id: number, data: Partial<EtablissementDto>): Observable<EtablissementDto> {
    return this.http.patch<EtablissementDto>(`${this.apiUrl}/modifierEtablissement/${id}`, data);
  }

}
