import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import type { Routes } from '@angular/router';

import { FirestoreService } from '../services/firestore.service';
import { StorageService } from '../services/storage.service';

export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    providers: [
      FirestoreService,
      StorageService,
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
    ],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'movies',
        loadComponent: () => import('./movies/movies.page').then((m) => m.MoviesPage),
      },
      {
        path: 'movie/:id',
        loadComponent: () => import('./movie-detail/movie-detail.page').then((m) => m.MovieDetailPage),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'matches',
        loadComponent: () => import('./matches/matches.page').then((m) => m.MatchesPage),
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
      },
    ],
  },
];
