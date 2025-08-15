import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, User } from '../model/user.model';
import { Observable } from 'rxjs';
 


export interface AuthRequest {
  username: string;
  password: string;
}
 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

 // private apiUrl = "http://62.169.29.140:8080";
  private apiUrl = "http://localhost:8080";

  constructor(private http: HttpClient) {}


  

   currentUser! : User ;

   getIdEtablessement():number{
    const id = localStorage.getItem("idEtablissement");
    if(!id) return 0 ;
    
      return +id ;
   }
    getIdUser():number{
    const id = localStorage.getItem("currentUser");
    if(!id) return 0 ;
    
      return +id ;
   }

    getRoleUser():string | null{
    const id = localStorage.getItem("RoleUser");
    if(!id) return null;
    
      return id ;
   }




  /**
   * Enregistrer un nouvel utilisateur
   */
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth`, user);
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  /**
   * Rafraîchir le token JWT
   */
  // refreshToken(refreshToken: string): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {
  //     refresh: refreshToken
  //   });
  // }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    `${this.apiUrl}/auth/refresh-token`,
    { refresh: refreshToken },  // Format JSON correct
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }
  );
}

  /**
   * Déconnexion de l'utilisateur
   */
  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {
      refresh: refreshToken
    });
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/public/user/me`);
  }
}
