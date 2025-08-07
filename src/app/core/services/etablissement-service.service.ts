import { Injectable } from '@angular/core';
import { EtablissementDto } from '../model/models';
import { User } from '../model/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environement/environment';

export interface EtablissementUserDTO {
  etablissement?: EtablissementDto;
  user?: User;  // tu peux créer une interface UserDTO si tu veux
  code?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtablissementServiceService {

  private apiUrl = `${environment.apiUrl}/public/etablissements`;

 constructor(private http: HttpClient) {}

  /** Enregistrer un établissement */
  enregistrer(dto: EtablissementDto): Observable<EtablissementDto> {
    return this.http.post<EtablissementDto>(`${this.apiUrl}/enregistrer`, dto);
  }

  /** Lister tous les établissements */
  listerTous(): Observable<EtablissementDto[]> {
    return this.http.get<EtablissementDto[]>(`${this.apiUrl}/tous`);
  }

  /** Récupérer le dernier établissement */
  getDernier(): Observable<EtablissementDto> {
    return this.http.get<EtablissementDto>(`${this.apiUrl}/dernier`);
  }

  /** Supprimer un établissement par ID */
  supprimer(id: number): Observable<EtablissementDto> {
    return this.http.delete<EtablissementDto>(`${this.apiUrl}/supprimer/${id}`);
  }

  /** Enregistrer un établissement avec utilisateur */
  enregistrerAvecUser(dto: EtablissementUserDTO): Observable<EtablissementUserDTO> {
    return this.http.post<EtablissementUserDTO>(`${this.apiUrl}/avec-user`, dto);
  }
}
