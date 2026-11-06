import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, filmOutline, starOutline, calendarOutline } from 'ionicons/icons';

import type { MovieDetail } from '../../models/movie.model';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonImg,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
})
export class MovieDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tmdbService = inject(TmdbService);

  readonly movie = signal<MovieDetail | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    addIcons({ arrowBackOutline, filmOutline, starOutline, calendarOutline });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage.set('Invalid movie.');
      this.isLoading.set(false);
      return;
    }

    this.tmdbService.getMovieDetails(id).subscribe({
      next: (movie: MovieDetail) => {
        this.movie.set(movie);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load movie details.');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getImageUrl(path: string | null, backdrop = false): string {
    if (!path) {
      return 'https://via.placeholder.com/500x750?text=No+Image';
    }
    const base = backdrop ? 'https://image.tmdb.org/t/p/w1280' : 'https://image.tmdb.org/t/p/w500';
    return base + path;
  }

  formatGenres(): string {
    const movie = this.movie();
    if (!movie?.genres?.length) {
      return '';
    }
    return movie.genres.map((g) => g.name).join(', ');
  }

  formatVoteAverage(): string {
    const movie = this.movie();
    if (!movie) {
      return '';
    }
    return movie.vote_average.toFixed(1);
  }
}
