import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRow,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import type { CustomMovie, Movie, MovieResponse } from '../../models/movie.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { TmdbService } from '../../services/tmdb.service';
import { NO_IMAGE } from '../../utils/image.util';

interface CatalogItem {
  routeId: string;
  title: string;
  poster: string;
  subtitle: string;
}

@Component({
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppHeaderComponent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonRow,
    IonSearchbar,
    IonSpinner,
  ],
})
export class MoviesPage implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly authService = inject(AuthService);

  readonly items = signal<CatalogItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly isAdmin = signal(false);
  searchQuery = '';

  ngOnInit(): void {
    this.authService.authState$.subscribe((firebaseUser) => {
      this.isAdmin.set(firebaseUser?.email === environment.admin.email);
    });
    void this.loadCatalog();
  }

  async loadCatalog(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.searchQuery = '';

    const [custom, response] = await Promise.all([
      this.firestoreService.getCustomMovies().catch(() => [] as CustomMovie[]),
      firstValueFrom(this.tmdbService.getPopularMovies() as Observable<MovieResponse>).catch((): MovieResponse => ({
        page: 0,
        results: [],
        total_pages: 0,
        total_results: 0,
      })),
    ]);

    const customItems = custom.map((movie) => this.fromCustom(movie));
    const tmdbItems = (response.results ?? []).map((movie) => this.fromTmdb(movie));

    this.items.set([...customItems, ...tmdbItems]);
    this.isLoading.set(false);
  }

  async onSearch(event: CustomEvent): Promise<void> {
    const query = (event.detail.value ?? '').trim();
    this.searchQuery = query;

    if (!query) {
      await this.loadCatalog();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response = await firstValueFrom(this.tmdbService.searchMovies(query) as Observable<MovieResponse>);
      this.items.set((response.results ?? []).map((movie) => this.fromTmdb(movie)));
    } catch {
      this.errorMessage.set('Unable to search movies.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private fromTmdb(movie: Movie): CatalogItem {
    return {
      routeId: String(movie.id),
      title: movie.title,
      poster: movie.poster_path ? `${environment.tmdbImageSmallUrl}${movie.poster_path}` : NO_IMAGE,
      subtitle: movie.release_date,
    };
  }

  private fromCustom(movie: CustomMovie): CatalogItem {
    return {
      routeId: `custom-${movie.id}`,
      title: movie.title,
      poster: movie.poster_path || NO_IMAGE,
      subtitle: movie.release_date,
    };
  }
}
