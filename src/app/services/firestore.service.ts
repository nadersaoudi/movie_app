import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';

import type { CustomMovie, FavoriteMovie } from '../models/movie.model';
import type { User } from '../models/user.model';

@Injectable()
export class FirestoreService {
  private readonly firestore = inject(Firestore);

  async createUserProfile(user: Omit<User, 'role' | 'status' | 'createdAt'>): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);

    await setDoc(userRef, {
      ...user,
      role: 'user',
      status: 'active',
      createdAt: Date.now(),
    });
  }

  async setUserProfile(user: User): Promise<void> {
    await setDoc(doc(this.firestore, 'users', user.uid), user);
  }

  async getUserProfile(uid: string): Promise<User | null> {
    const snapshot = await getDoc(doc(this.firestore, 'users', uid));

    return snapshot.exists() ? (snapshot.data() as User) : null;
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(this.firestore, 'users'));

    return snapshot.docs.map((d) => d.data() as User);
  }

  async updateUserStatus(uid: string, status: 'active' | 'disabled'): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', uid), { status });
  }

  async addFavorite(uid: string, favorite: FavoriteMovie): Promise<void> {
    await setDoc(doc(this.firestore, 'users', uid, 'favorites', favorite.movieId), favorite);
  }

  async removeFavorite(uid: string, movieId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'users', uid, 'favorites', movieId));
  }

  async getFavorites(uid: string): Promise<FavoriteMovie[]> {
    const snapshot = await getDocs(collection(this.firestore, 'users', uid, 'favorites'));

    return snapshot.docs.map((d) => d.data() as FavoriteMovie);
  }

  async getFavoritesByUser(): Promise<Record<string, FavoriteMovie[]>> {
    const snapshot = await getDocs(collectionGroup(this.firestore, 'favorites'));
    const result: Record<string, FavoriteMovie[]> = {};

    for (const favDoc of snapshot.docs) {
      const uid = favDoc.ref.parent.parent?.id;
      if (!uid) continue;
      (result[uid] ??= []).push(favDoc.data() as FavoriteMovie);
    }

    return result;
  }

  async addCustomMovie(movie: Omit<CustomMovie, 'id' | 'createdAt'>): Promise<CustomMovie> {
    const movieRef = doc(collection(this.firestore, 'movies'));
    const created: CustomMovie = { ...movie, id: movieRef.id, createdAt: Date.now() };

    await setDoc(movieRef, created);

    return created;
  }

  async getCustomMovies(): Promise<CustomMovie[]> {
    const snapshot = await getDocs(collection(this.firestore, 'movies'));

    return snapshot.docs.map((d) => d.data() as CustomMovie).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getCustomMovie(id: string): Promise<CustomMovie | null> {
    const snapshot = await getDoc(doc(this.firestore, 'movies', id));

    return snapshot.exists() ? (snapshot.data() as CustomMovie) : null;
  }

  async deleteCustomMovie(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'movies', id));
  }
}
