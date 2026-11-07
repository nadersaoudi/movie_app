import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonSpinner, IonThumbnail } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heartOutline, trashOutline } from 'ionicons/icons';

import { environment } from '../../../environments/environment';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import type { FavoriteMovie } from '../../models/movie.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { NO_IMAGE } from '../../utils/image.util';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppHeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonThumbnail,
  ],
})
export class FavoritesPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);

  readonly favorites = signal<FavoriteMovie[]>([]);
  readonly isLoading = signal(true);
  readonly isLoggedIn = signal(false);

  private currentUid: string | null = null;

  constructor() {
    addIcons({ heartOutline, trashOutline });
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe((firebaseUser) => {
      this.currentUid = firebaseUser?.uid ?? null;
      this.isLoggedIn.set(!!firebaseUser);
      void this.loadFavorites();
    });
  }

  async loadFavorites(): Promise<void> {
    if (!this.currentUid) {
      this.favorites.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    try {
      const favorites = await this.firestoreService.getFavorites(this.currentUid);
      this.favorites.set(favorites.sort((a, b) => b.createdAt - a.createdAt));
    } catch {
      this.favorites.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async remove(favorite: FavoriteMovie): Promise<void> {
    if (!this.currentUid) {
      return;
    }

    await this.firestoreService.removeFavorite(this.currentUid, favorite.movieId);
    this.favorites.update((list) => list.filter((item) => item.movieId !== favorite.movieId));
  }

  posterUrl(path: string | null): string {
    if (!path) {
      return NO_IMAGE;
    }
    return path.startsWith('http') ? path : `${environment.tmdbImageSmallUrl}${path}`;
  }
}
