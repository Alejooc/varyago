import { mergeApplicationConfig, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';

// Register Spanish (Colombia) locale for server-side rendering
registerLocaleData(localeEsCO, 'es-CO');

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: LOCALE_ID, useValue: 'es-CO' }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
