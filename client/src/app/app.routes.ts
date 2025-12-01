import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';

/**
 * Application Routes
 * 
 * This file defines which component shows for which URL
 * Will add routes for login, register, home, game, and results
 * 
 * 404 and other error routes will be added later
 */
export const appRoutes: Routes = [
    {path: 'login', component: LoginComponent},
];