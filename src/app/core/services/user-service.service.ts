import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environement/environment';
import { User } from '../model/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  /**
   * Enregistrer un nouvel utilisateur
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Modifier un utilisateur existant
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Obtenir un utilisateur par ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lister tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Supprimer un utilisateur par ID
   */
  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lister uniquement les admins
   */
  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admins`);
  }

  /**
   * Lister uniquement les super-admins
   */
  getSuperAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/super-admins`);
  }


  // changerMotDePasse(id: number, ancienMotDePasse: string, nouveauMotDePasse: string): Observable<any> {
  //   const params = new HttpParams()
  //     .set('ancienMotDePasse', ancienMotDePasse)
  //     .set('nouveauMotDePasse', nouveauMotDePasse);

  //   return this.http.patch(`${this.apiUrl}/changer-mdp/${id}`, null, { params });
  // }

  changerMotDePasse(id: number, ancienMotDePasse: string, nouveauMotDePasse: string): Observable<any> {
  const body = {
    ancienMotDePasse,
    nouveauMotDePasse
  };

  return this.http.patch(`${this.apiUrl}/changer-mdp/${id}`, body);
}

}