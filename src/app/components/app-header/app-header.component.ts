import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPopover,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

interface HeaderUser {
  displayName: string;
  photoUrl: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
  ],
})
export class AppHeaderComponent {
  private static counter = 0;

  readonly title = input('MovieApp');
  readonly menuId = `profile-menu-${AppHeaderComponent.counter++}`;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<HeaderUser | null>(null);
  readonly isProfileMenuOpen = signal(false);

  constructor() {
    this.authService.authState$.subscribe((firebaseUser) => {
      this.user.set(
        firebaseUser
          ? {
              displayName: firebaseUser.displayName ?? firebaseUser.email ?? '',
              photoUrl: firebaseUser.photoURL ?? '',
            }
          : null,
      );
    });
  }

  async logout(): Promise<void> {
    this.isProfileMenuOpen.set(false);
    await this.authService.logout();
    await this.router.navigate(['/home']);
  }
}
