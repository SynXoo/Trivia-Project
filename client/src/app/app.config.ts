import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

/**
 * Application Configuration
 * 
 * The file sets up the providers for the application
 * Services that angular makes available to the application
 * 
 * - Provide router for URL based navigation
 * - Provide HTTP client for making HTTP requests to the server
 * - Provide zone change detection for the application optimizations
 */

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(appRoutes),
        provideHttpClient()
    ]
};