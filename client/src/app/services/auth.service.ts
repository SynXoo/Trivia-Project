import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, LoginUser, RegisterData, AuthResponse, ProfileUpdate } from '../shared/models';
import { environment } from '../../environments/environment';

/**
 * Authentication service for the application
 * 
 * The service will handle:
 *  - User login/logout
 *  - User registration
 *  - Storing/retrieving user data from local storage
 *  - Tracking who is currently logged in
 * 
 * Will use fake data for now, will be replaced with actual backend API later
 */

const USE_FAKE_DATA = true; // Will be replaced with actual backend API later

const TOKEN_KEY = 'trivia_token';
const USER_KEY = 'trivia_user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // STATE - Will use angular signals

    /**
     * The currently logged in user (or null if not logged in)
     * Using a signal so components automatically update when this changes
     */
    currentUser = signal<User | null>(null);

    isLoading = signal<boolean>(false); // Loading state for requests

    isAuthenticated = computed(() => this.currentUser() !== null);

    constructor(private http: HttpClient, private router: Router) {
        this.restoreSession();
    }

    // ===============================
    // PUBLIC METHODS
    // ===============================

    /**
     * Login a user
     * @param credentials - The user's credentials
     * @returns Observable that completes on success or errors on failure
     */
    login(credentials:LoginUser): Observable<AuthResponse> {
        console.log('AuthService called with credentials:', credentials);
        this.isLoading.set(true);

        if(USE_FAKE_DATA) {
            return this.fakeLogin(credentials);
        }

        // This is the real API call
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
            .pipe(
                tap((response) => this.handleAuthResponse(response)),
                catchError(error => this.handleAuthError(error))
            );
    }

    /**
     * Register a new user
     * @param data - The user's data
     * @returns Observable that completes on success or errors on failure
     */
    register(data:RegisterData): Observable<AuthResponse> {
        console.log('AuthService.register called with data:', data);
        this.isLoading.set(true);

        if(USE_FAKE_DATA) {
            return this.fakeRegister(data);
        }

        // API call
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
            .pipe(
                tap((response) => this.handleAuthResponse(response)),
                catchError(error => this.handleAuthError(error))
            );
    }

    /**
     * Logout the current user
    */
    logout(): void {
        console.log('AuthService.logout called');

        // Clear stored data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        // Clear the state
        this.currentUser.set(null);

        // Navigate to home
        this.router.navigate(['/']);
    }

    /**
     * Get the stored JWT token
     * Used by HTTP interceptor to add token to requests
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Get fresh user data from the backend
     */
    getProfile(): Observable<User> {
        if (USE_FAKE_DATA) {
            const user = this.currentUser();
            if (user) {
                return of(user);
            }
            return throwError(() => new Error('Not logged in'));
        }

        return this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`)
            .pipe(
                map((response) => response.user),
                tap(user => {
                    this.currentUser.set(user);
                    localStorage.setItem(USER_KEY, JSON.stringify(user));
                })
            );
    }

    /**
     * Update the user's profile
     */
    updateProfile(data:ProfileUpdate): Observable<User> {
        console.log('AuthService.updateProfile called with data:', data);

        if(USE_FAKE_DATA) {
            return this.fakeUpdateProfile(data);
        }

        return this.http.put<{ user: User }>(`${environment.apiUrl}/auth/profile`, data)
            .pipe(
                map((response) => response.user),
                tap(user => {
                    this.currentUser.set(user);
                    localStorage.setItem(USER_KEY, JSON.stringify(user));
                })
            );
    }

    // ===============================
    // PRIVATE METHODS
    // ===============================

    /**
     * Check local storage for existing session
     */
    private restoreSession(): void {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);

        if (token && user) {
            try {
                const userData = JSON.parse(user) as User;
                this.currentUser.set(userData);
                console.log('Restored session for user:', userData.username);
            } catch (e) {
                console.error('Error parsing user from local storage:', e);
                this.logout();
            }
        }
    }

    /**
     * Successfully authenticated, update state and store data
     */
    private handleAuthResponse(response:AuthResponse): void {
        console.log('Auth successfully completed with response:', response);

        // Store token and user data
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        this.currentUser.set(response.user);
        this.isLoading.set(false);
    }

    /**
     * Handle authentication error
     */
    private handleAuthError(error:any): Observable<never> {
        console.error('Auth error:', error);
        this.isLoading.set(false);

        // Extract error message
        const errorMessage = error.error?.message || error.message || 'Authentication failed';

        return throwError(() => new Error(errorMessage));
    }

    // ===============================
    // FAKE DATA METHODS
    // ===============================
    
    private fakeLogin(credentials:LoginUser): Observable<AuthResponse> {
        console.log('Using FAKE data for login');

        // Simulate a delay
        return new Observable(observer => {
            setTimeout(() => {
                // Accept any login with password 'test' or 'password'
                if (credentials.password === 'test' || credentials.password === 'password') {
                    const response:AuthResponse = {
                        message: 'Login successful',
                        token: 'fake-jwt-token',
                        user: this.createFakeUser(credentials.username)
                    };
                    this.handleAuthResponse(response);
                    observer.next(response);
                    observer.complete();
                } else {
                    this.isLoading.set(false);
                    observer.error(new Error('Invalid username or password'));
                }
            }, 800);
        });
    }

    private fakeRegister(data:RegisterData): Observable<AuthResponse> {
        console.log('Using FAKE data for register');

        return new Observable(observer => {
            setTimeout(() => {
                // Always succeed for fake data
                const response:AuthResponse = {
                    message: 'Account created successfully',
                    token: 'fake-jwt-token-' + Date.now(),
                    user: {
                        id: Math.floor(Math.random() * 1000),
                        username: data.username,
                        email: data.email,
                        displayName: data.displayName || data.username,
                        color: data.color || '4CAF50',
                        gamesPlayed: 0,
                        gamesWon: 0,
                        totalScore: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                };
                this.handleAuthResponse(response);
                observer.next(response);
                observer.complete();
            }, 800);
        });
    }

    private fakeUpdateProfile(data: ProfileUpdate): Observable<User> {
        console.log('Using FAKE updateProfile');
        
        return new Observable(observer => {
          setTimeout(() => {
            const current = this.currentUser();
            if (!current) {
              observer.error(new Error('Not logged in'));
              return;
            }
            
            const updated: User = {
              ...current,
              displayName: data.displayName ?? current.displayName,
              color: data.color ?? current.color,
              email: data.email ?? current.email,
              updatedAt: new Date().toISOString()
            };
            
            this.currentUser.set(updated);
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            
            observer.next(updated);
            observer.complete();
          }, 500);
        });
    }

    private createFakeUser(username: string): User {
        return {
          id: Math.floor(Math.random() * 1000),
          username: username,
          email: `${username}@example.com`,
          displayName: username,
          color: '#4CAF50',
          gamesPlayed: Math.floor(Math.random() * 50),
          gamesWon: Math.floor(Math.random() * 20),
          totalScore: Math.floor(Math.random() * 100),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
}