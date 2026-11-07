import { Injectable } from '@angular/core';

import type { MatchResult } from '../models/match.model';
import type { FavoriteMovie } from '../models/movie.model';
import type { User } from '../models/user.model';

export const MATCH_THRESHOLD = 0.75;

interface Profile {
  movieIds: Set<string>;
  genres: Set<string>;
  actors: Set<string>;
  avgYear: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  computeMatches(currentUid: string, users: User[], favoritesByUser: Record<string, FavoriteMovie[]>): MatchResult[] {
    const mine = favoritesByUser[currentUid] ?? [];
    if (!mine.length) {
      return [];
    }

    const my = this.buildProfile(mine);
    const results: MatchResult[] = [];

    for (const user of users) {
      if (user.uid === currentUid || user.status !== 'active') {
        continue;
      }

      const theirs = favoritesByUser[user.uid] ?? [];
      if (!theirs.length) {
        continue;
      }

      const their = this.buildProfile(theirs);

      const sharedIds = [...my.movieIds].filter((id) => their.movieIds.has(id));
      const sharedGenres = [...my.genres].filter((genre) => their.genres.has(genre));
      const sharedActors = [...my.actors].filter((actor) => their.actors.has(actor));

      const movieScore = this.dice(my.movieIds.size, their.movieIds.size, sharedIds.length);
      const genreScore = this.dice(my.genres.size, their.genres.size, sharedGenres.length);
      const actorScore = this.dice(my.actors.size, their.actors.size, sharedActors.length);
      const yearScore = this.yearProximity(my.avgYear, their.avgYear);

      const score = 0.45 * movieScore + 0.25 * genreScore + 0.2 * actorScore + 0.1 * yearScore;

      if (score >= MATCH_THRESHOLD) {
        results.push({
          user,
          score,
          sharedMovies: sharedIds.map((id) => mine.find((m) => m.movieId === id)?.title ?? id),
          sharedGenres,
          sharedActors,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private buildProfile(favorites: FavoriteMovie[]): Profile {
    const movieIds = new Set<string>();
    const genres = new Set<string>();
    const actors = new Set<string>();
    let yearSum = 0;
    let yearCount = 0;

    for (const favorite of favorites) {
      movieIds.add(favorite.movieId);
      for (const genre of favorite.genres ?? []) {
        genres.add(genre);
      }
      for (const actor of favorite.actors ?? []) {
        actors.add(actor);
      }
      const year = Number((favorite.release_date ?? '').slice(0, 4));
      if (year) {
        yearSum += year;
        yearCount++;
      }
    }

    return { movieIds, genres, actors, avgYear: yearCount ? yearSum / yearCount : 0 };
  }

  private dice(a: number, b: number, common: number): number {
    if (a === 0 && b === 0) {
      return 0;
    }
    return (2 * common) / (a + b);
  }

  private yearProximity(a: number, b: number): number {
    if (!a || !b) {
      return 0;
    }
    return Math.max(0, 1 - Math.abs(a - b) / 20);
  }
}
