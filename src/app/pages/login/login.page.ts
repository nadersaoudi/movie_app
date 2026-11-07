import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonInput, IonButton } from '@ionic/angular';

import { environment } from '../../../environments/environment';
import type { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonInput, IonButton, RouterLink],
})
export class LoginPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    if (this.authService.getCurrentFirebaseUser()) {
      this.router.navigate(['/home']);
    }
  }

  async login(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const firebaseUser = await this.authService.login(this.email.trim(), this.password);
      let profile = await this.firestoreService.getUserProfile(firebaseUser.uid);

      // The admin account is seeded in Firebase Auth; create its profile on first login.
      if (!profile && firebaseUser.email === environment.admin.email) {
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: environment.admin.firstName,
          lastName: environment.admin.lastName,
          age: 0,
          photoUrl: environment.admin.photoUrl,
          role: 'admin',
          status: 'active',
          createdAt: Date.now(),
        } satisfies User;
        await this.firestoreService.setUserProfile(profile);
      }

      if (!profile || profile.status === 'disabled') {
        await this.authService.logout();
        throw new Error('Your account is disabled or unavailable.');
      }

      await this.router.navigate(['/home']);
    } catch (error: unknown) {
      console.error('Login error:', error);

      this.errorMessage.set(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
