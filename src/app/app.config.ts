import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpHandler, provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { AuthService } from './services/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          const handler: HttpHandler = {
            handle: (request) => next(request)
          };
          return new AuthInterceptor(inject(AuthService)).intercept(req, handler);
        }
      ])
    )
  ]
};
