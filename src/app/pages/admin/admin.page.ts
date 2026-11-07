import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTextarea,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  filmOutline,
  lockClosedOutline,
  lockOpenOutline,
  personOutline,
  shieldCheckmarkOutline,
  trashOutline,
} from 'ionicons/icons';

import { environment } from '../../../environments/environment';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import type { CustomMovie } from '../../models/movie.model';
import type { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AppHeaderComponent,
    IonBadge,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonTextarea,
  ],
})
export class AdminPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);

  readonly isAdmin = signal(false);
  readonly checked = signal(false);
  readonly users = signal<User[]>([]);
  readonly movies = signal<CustomMovie[]>([]);
  readonly isSaving = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');

  title = '';
  overview = '';
  posterUrl = '';
  releaseDate = '';
  voteAverage: number | null = null;
  genresText = '';
  actorsText = '';

  constructor() {
    addIcons({
      addOutline,
      filmOutline,
      lockClosedOutline,
      lockOpenOutline,
      personOutline,
      shieldCheckmarkOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe((firebaseUser) => {
      const admin = firebaseUser?.email === environment.admin.email;
      this.isAdmin.set(admin);
      this.checked.set(true);

      if (admin) {
        void this.refresh();
      }
    });
  }

  async refresh(): Promise<void> {
    try {
      const [users, movies] = await Promise.all([
        this.firestoreService.getAllUsers(),
        this.firestoreService.getCustomMovies(),
      ]);
      this.users.set(users);
      this.movies.set(movies);
    } catch {
      this.errorMessage.set('Unable to load admin data.');
    }
  }

  async addMovie(): Promise<void> {
    if (!this.title.trim()) {
      this.errorMessage.set('Movie title is required.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.message.set('');

    try {
      await this.firestoreService.addCustomMovie({
        title: this.title.trim(),
        overview: this.overview.trim(),
        poster_path: this.posterUrl.trim() || null,
        release_date: this.releaseDate.trim(),
        vote_average: this.voteAverage ?? 0,
        genres: this.splitList(this.genresText),
        actors: this.splitList(this.actorsText),
        createdBy: this.authService.getCurrentFirebaseUser()?.uid ?? '',
      });

      this.resetForm();
      this.message.set('Movie added successfully.');
      this.movies.set(await this.firestoreService.getCustomMovies());
    } catch {
      this.errorMessage.set('Unable to add movie. Check your Firestore access rights.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteMovie(movie: CustomMovie): Promise<void> {
    try {
      await this.firestoreService.deleteCustomMovie(movie.id);
      this.movies.update((list) => list.filter((item) => item.id !== movie.id));
    } catch {
      this.errorMessage.set('Unable to delete the movie.');
    }
  }

  async toggleStatus(user: User): Promise<void> {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';

    try {
      await this.firestoreService.updateUserStatus(user.uid, nextStatus);
      this.users.update((list) => list.map((item) => (item.uid === user.uid ? { ...item, status: nextStatus } : item)));
    } catch {
      this.errorMessage.set('Unable to update the user status.');
    }
  }

  private splitList(text: string): string[] {
    return text
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  private resetForm(): void {
    this.title = '';
    this.overview = '';
    this.posterUrl = '';
    this.releaseDate = '';
    this.voteAverage = null;
    this.genresText = '';
    this.actorsText = '';
  }
}
