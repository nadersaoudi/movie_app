import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, RouterLink],
})
export class LoginPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  ngOnInit(): void {
    if (this.authService.getCurrentFirebaseUser()) {
      this.router.navigate(['/home']);
    }
  }
  async login(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email.trim(), this.password);

      await this.router.navigate(['/home']);
    } catch (error: unknown) {
      console.error('Login error:', error);

      this.errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
