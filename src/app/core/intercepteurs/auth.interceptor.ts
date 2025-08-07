
 
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AuthResponse } from '../model/user.model';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
// 
const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Bypass pour les endpoints d'authentification
  if (req.url.includes('/auth')) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();

  const authReq = accessToken
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${accessToken}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExpired =
        error.status === 401 &&
        (error.error?.error?.includes('Token invalide') || error.error?.error?.includes('JWT expired'));

      // Cas 1: Token expiré → tenter le refresh
      if (isExpired && refreshToken && !req.url.includes('/auth/refresh-token')) {
        return authService.refreshToken(refreshToken).pipe(
          switchMap((authResponse: AuthResponse) => {
            tokenService.saveTokens(authResponse);
            const newRequest = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${authResponse.bearer}`)
            });
            return next(newRequest); // rejouer la requête originale
          }),
          catchError((refreshError) => {
            console.error('Échec du rafraîchissement du token', refreshError);

            // Cas 1.1: Refresh token expiré ou invalide → déconnexion
            if (
              refreshError.status === 401 ||
              refreshError.status === 403 ||
              refreshError.error?.code === 'TOKEN_EXPIRED'
            ) {
              tokenService.clearTokens();
              router.navigate(['/login'], { queryParams: { sessionExpired: true } });
            }

            return throwError(() => refreshError);
          })
        );
      }

      // Cas 2: Toute autre erreur 401/403 sans possibilité de refresh
      if ((error.status === 401 || error.status === 403) && !isExpired) {
        console.warn('Erreur d’autorisation (non liée au token)');
        // NE PAS rediriger automatiquement ici, sauf si nécessaire
        // router.navigate(['/unauthorized']);
      }

      return throwError(() => error);
    })
  );
};