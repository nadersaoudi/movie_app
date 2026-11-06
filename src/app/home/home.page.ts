import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { Subscription } from 'rxjs';

import { environment } from '../../environments/environment';
import type { Movie, MovieResponse } from '../models/movie.model';
import type { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { TmdbService } from '../services/tmdb.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class HomePage implements OnInit, OnDestroy {
  readonly imageUrl = environment.tmdbImageUrl;
  readonly movies = signal<Movie[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  searchQuery = '';

  private readonly tmdbService = inject(TmdbService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isProfileMenuOpen = signal(false);
  private authSub = new Subscription();

  ngOnInit(): void {
    this.loadPopularMovies();
    this.authSub = this.authService.authState$.subscribe((firebaseUser) => {
      if (!firebaseUser) {
        this.currentUser.set(null);
        return;
      }
      this.authService.getUserProfile(firebaseUser.uid).then((user) => {
        this.currentUser.set(user ?? null);
      });
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  loadPopularMovies(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.searchQuery = '';

    this.tmdbService.getPopularMovies().subscribe({
      next: (response: MovieResponse) => {
        this.movies.set(response.results ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load movies.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: CustomEvent): void {
    const query = (event.detail.value ?? '').trim();
    this.searchQuery = query;

    if (!query) {
      this.loadPopularMovies();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.tmdbService.searchMovies(query).subscribe({
      next: (response: MovieResponse) => {
        this.movies.set(response.results ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to search movies.');
        this.isLoading.set(false);
      },
    });
  }
  async logout(): Promise<void> {
    await this.authService.logout();
    this.currentUser.set(null);
    this.isProfileMenuOpen.set(false);
    await this.router.navigate(['/home']);
  }
}
