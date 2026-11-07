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
  IonRow,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import type { Movie, MovieResponse } from '../models/movie.model';
import { TmdbService } from '../services/tmdb.service';
import { NO_IMAGE } from '../utils/image.util';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
    IonRow,
    IonSearchbar,
    IonSpinner,
  ],
})
export class HomePage implements OnInit {
  readonly imageUrl = environment.tmdbImageSmallUrl;
  readonly noImage = NO_IMAGE;
  readonly movies = signal<Movie[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  searchQuery = '';

  private readonly tmdbService = inject(TmdbService);

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  async loadPopularMovies(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.searchQuery = '';

    try {
      const response = await firstValueFrom(this.tmdbService.getPopularMovies() as Observable<MovieResponse>);
      this.movies.set(response.results ?? []);
    } catch {
      this.errorMessage.set('Unable to load movies.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSearch(event: CustomEvent): Promise<void> {
    const query = (event.detail.value ?? '').trim();
    this.searchQuery = query;

    if (!query) {
      await this.loadPopularMovies();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response = await firstValueFrom(this.tmdbService.searchMovies(query) as Observable<MovieResponse>);
      this.movies.set(response.results ?? []);
    } catch {
      this.errorMessage.set('Unable to search movies.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
