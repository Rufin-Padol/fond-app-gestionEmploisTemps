import { Injectable } from '@angular/core';
import { AuthResponse } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
   private readonly ACCESS_TOKEN = 'access_token';
  private readonly REFRESH_TOKEN = 'refresh_token';

  saveTokens(tokens: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN, tokens.bearer);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}