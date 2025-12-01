import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Login Component
 * 
 * Simple login form that:
 * 1. Takes username and password
 * 2. Calls AuthService.login()
 * 3. Redirects to /game on success
 * 4. Shows error message on failure
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>🎮 Welcome Back!</h1>
        <p class="subtitle">Sign in to play</p>

        <!-- Error Message -->
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              minlength="3"
              placeholder="Enter your username"
              #usernameInput="ngModel"
            >
            <div *ngIf="usernameInput.invalid && usernameInput.touched" class="field-error">
              Username is required (min 3 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="4"
                placeholder="Enter your password"
                #passwordInput="ngModel"
              >
              <button 
                type="button" 
                class="toggle-password"
                (click)="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="field-error">
              Password is required
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading">Signing in...</span>
          </button>
        </form>

        <p class="register-link">
          Don't have an account? 
          <a routerLink="/register">Create one</a>
        </p>

        <!-- Debug Info (remove in production!!) -->
        <div class="debug-info">
          <p><strong>🧪 Test Mode:</strong> Use password "test" to login</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .login-card {
      background: #0f0f23;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    h1 {
      text-align: center;
      color: #fff;
      margin: 0 0 8px 0;
      font-size: 28px;
    }

    .subtitle {
      text-align: center;
      color: #888;
      margin: 0 0 30px 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #ccc;
      margin-bottom: 8px;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #333;
      border-radius: 8px;
      background: #1a1a2e;
      color: #fff;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #9034db;
    }

    input::placeholder {
      color: #666;
    }

    .password-input {
      position: relative;
    }

    .password-input input {
      padding-right: 50px;
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
    }

    .field-error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 6px;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #9034db 0%, #6d28d9 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(144, 52, 219, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      color: #888;
      margin-top: 20px;
    }

    .register-link a {
      color: #9034db;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .debug-info {
      margin-top: 30px;
      padding: 15px;
      background: rgba(144, 52, 219, 0.1);
      border-radius: 8px;
      text-align: center;
    }

    .debug-info p {
      color: #9034db;
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  // Form fields
  username = '';
  password = '';
  
  // UI state
  showPassword = false;
  isLoading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Clear previous error
    this.error = '';
    this.isLoading = true;

    console.log('Login form submitted');
    console.log('Username:', this.username);
    console.log('Password:', this.password);

    // Call the auth service
    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login successful!', response);
        this.isLoading = false;
        // Navigate to game page
        this.router.navigate(['/game']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.isLoading = false;
        this.error = err.message || 'Login failed. Please try again.';
      }
    });
  }
}