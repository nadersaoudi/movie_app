import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  filmOutline,
  heartOutline,
  homeOutline,
  logInOutline,
  logOutOutline,
  peopleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { environment } from '../environments/environment';

import { AdminService } from './services/admin.service';
import { AuthService } from './services/auth.service';

interface MenuUser {
  displayName: string;
  photoUrl: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterLink,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonButton,
  ],
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly user = signal<MenuUser | null>(null);

  constructor() {
    addIcons({
      homeOutline,
      filmOutline,
      heartOutline,
      peopleOutline,
      shieldCheckmarkOutline,
      logInOutline,
      logOutOutline,
    });

    this.authService.authState$.subscribe((firebaseUser) => {
      this.user.set(
        firebaseUser
          ? {
              displayName: firebaseUser.displayName ?? firebaseUser.email ?? '',
              photoUrl: firebaseUser.photoURL ?? '',
              isAdmin: firebaseUser.email === environment.admin.email,
            }
          : null,
      );
    });
  }

  ngOnInit(): void {
    void this.adminService.seedAdminAccount();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/home']);
  }
}
