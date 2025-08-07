import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations  } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/intercepteurs/auth.interceptor';
import { logInterceptor } from './core/intercepteurs/log.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(),withInterceptors([authInterceptor,logInterceptor])),
    provideAnimations(), // ✅ plus fiable
     
    
  ],
};
