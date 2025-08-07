import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
 console.log('[HTTP REQUEST]', req);

  return next(req).pipe(
    tap((res) => {
      console.log('[HTTP RESPONSE]', res);
    }),
    catchError((err) => {
      console.error('[HTTP ERROR]', err);
      return throwError(() => err);
    })
  );

}