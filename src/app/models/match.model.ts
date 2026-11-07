import type { User } from './user.model';

export interface MatchResult {
  user: User;
  score: number;
  sharedMovies: string[];
  sharedGenres: string[];
  sharedActors: string[];
}
