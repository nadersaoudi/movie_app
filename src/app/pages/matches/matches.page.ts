import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, personCircleOutline, sparklesOutline } from 'ionicons/icons';

import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import type { MatchResult } from '../../models/match.model';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { MATCH_THRESHOLD, MatchService } from '../../services/match.service';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.page.html',
  styleUrls: ['./matches.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent, IonButton, IonContent, IonIcon, IonSpinner],
})
export class MatchesPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly matchService = inject(MatchService);

  readonly matches = signal<MatchResult[]>([]);
  readonly isLoading = signal(true);
  readonly isLoggedIn = signal(false);
  readonly hasFavorites = signal(true);
  readonly thresholdPercent = Math.round(MATCH_THRESHOLD * 100);

  private currentUid: string | null = null;

  constructor() {
    addIcons({ peopleOutline, personCircleOutline, sparklesOutline });
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe((firebaseUser) => {
      this.currentUid = firebaseUser?.uid ?? null;
      this.isLoggedIn.set(!!firebaseUser);
      void this.loadMatches();
    });
  }

  async loadMatches(): Promise<void> {
    const uid = this.currentUid;

    if (!uid) {
      this.matches.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);

    try {
      const [users, favoritesByUser] = await Promise.all([
        this.firestoreService.getAllUsers(),
        this.firestoreService.getFavoritesByUser(),
      ]);

      this.matches.set(this.matchService.computeMatches(uid, users, favoritesByUser));
      this.hasFavorites.set((favoritesByUser[uid] ?? []).length > 0);
    } catch {
      this.matches.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  percent(score: number): number {
    return Math.round(score * 100);
  }

  avatar(user: MatchResult['user']): string {
    if (user.photoUrl) {
      return user.photoUrl;
    }
    const name = encodeURIComponent(`${user.firstName} ${user.lastName}`.trim() || user.email);
    return `https://ui-avatars.com/api/?name=${name}&background=0054e9&color=ffffff&size=128`;
  }
}
