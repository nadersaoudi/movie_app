import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  cashOutline,
  filmOutline,
  heart,
  heartOutline,
  starOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { FavoriteMovie, MovieDetail } from '../../models/movie.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { TmdbService } from '../../services/tmdb.service';
import { NO_IMAGE } from '../../utils/image.util';

interface DetailView {
  title: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  runtime: number | null;
  voteAverage: number;
  genres: string[];
  actors: string[];
  tagline: string;
  overview: string;
  budget: number | null;
  revenue: number | null;
  popularity: number | null;
}

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
})
export class MovieDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tmdbService = inject(TmdbService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly authService = inject(AuthService);

  readonly movie = signal<DetailView | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly isFavorite = signal(false);
  readonly isLoggedIn = signal(false);

  private currentUid: string | null = null;
  private favorite: FavoriteMovie | null = null;

  constructor() {
    addIcons({
      arrowBackOutline,
      calendarOutline,
      cashOutline,
      filmOutline,
      heart,
      heartOutline,
      starOutline,
      timeOutline,
      trendingUpOutline,
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.authService.authState$.subscribe((firebaseUser) => {
      this.currentUid = firebaseUser?.uid ?? null;
      this.isLoggedIn.set(!!firebaseUser);
      void this.syncFavoriteStatus();
    });

    if (id.startsWith('custom-')) {
      void this.loadCustomMovie(id.slice('custom-'.length));
    } else {
      void this.loadTmdbMovie(Number(id));
    }
  }

  async toggleFavorite(): Promise<void> {
    const uid = this.currentUid;
    const favorite = this.favorite;
    if (!uid || !favorite) {
      return;
    }

    if (this.isFavorite()) {
      await this.firestoreService.removeFavorite(uid, favorite.movieId);
      this.isFavorite.set(false);
    } else {
      await this.firestoreService.addFavorite(uid, favorite);
      this.isFavorite.set(true);
    }
  }

  private async loadTmdbMovie(id: number): Promise<void> {
    if (!id) {
      this.errorMessage.set('Invalid movie.');
      this.isLoading.set(false);
      return;
    }

    try {
      const detail = await firstValueFrom(this.tmdbService.getMovieDetails(id) as Observable<MovieDetail>);
      const genres = (detail.genres ?? []).map((genre) => genre.name);
      const actors = (detail.credits?.cast ?? []).slice(0, 8).map((member) => member.name);
      const poster = detail.poster_path ? `${environment.tmdbImageUrl}${detail.poster_path}` : NO_IMAGE;
      const backdrop = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : poster;

      this.movie.set({
        title: detail.title,
        poster,
        backdrop,
        releaseDate: detail.release_date,
        runtime: detail.runtime ?? null,
        voteAverage: detail.vote_average ?? 0,
        genres,
        actors,
        tagline: detail.tagline ?? '',
        overview: detail.overview ?? '',
        budget: detail.budget ?? null,
        revenue: detail.revenue ?? null,
        popularity: detail.popularity ?? null,
      });

      this.favorite = {
        movieId: String(id),
        title: detail.title,
        poster_path: detail.poster_path,
        release_date: detail.release_date,
        vote_average: detail.vote_average ?? 0,
        genres,
        actors,
        createdAt: Date.now(),
      };

      void this.syncFavoriteStatus();
    } catch {
      this.errorMessage.set('Unable to load movie details.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadCustomMovie(docId: string): Promise<void> {
    try {
      const custom = await this.firestoreService.getCustomMovie(docId);

      if (!custom) {
        this.errorMessage.set('Movie not found.');
        this.isLoading.set(false);
        return;
      }

      const poster = custom.poster_path || NO_IMAGE;

      this.movie.set({
        title: custom.title,
        poster,
        backdrop: poster,
        releaseDate: custom.release_date,
        runtime: null,
        voteAverage: custom.vote_average ?? 0,
        genres: custom.genres ?? [],
        actors: custom.actors ?? [],
        tagline: '',
        overview: custom.overview ?? '',
        budget: null,
        revenue: null,
        popularity: null,
      });

      this.favorite = {
        movieId: `custom-${custom.id}`,
        title: custom.title,
        poster_path: custom.poster_path,
        release_date: custom.release_date,
        vote_average: custom.vote_average ?? 0,
        genres: custom.genres ?? [],
        actors: custom.actors ?? [],
        createdAt: Date.now(),
      };

      void this.syncFavoriteStatus();
    } catch {
      this.errorMessage.set('Unable to load movie details.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async syncFavoriteStatus(): Promise<void> {
    const uid = this.currentUid;
    const favorite = this.favorite;

    if (!uid || !favorite) {
      this.isFavorite.set(false);
      return;
    }

    try {
      const favorites = await this.firestoreService.getFavorites(uid);
      this.isFavorite.set(favorites.some((item) => item.movieId === favorite.movieId));
    } catch {
      this.isFavorite.set(false);
    }
  }
}
