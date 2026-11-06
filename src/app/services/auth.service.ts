import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import type { User as FirebaseUser } from '@angular/fire/auth';
import type { Observable } from 'rxjs';

import type { User } from '../models/user.model';

import { FirestoreService } from './firestore.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestoreService = inject(FirestoreService);
  private readonly storageService = inject(StorageService);

  readonly authState$: Observable<FirebaseUser | null> = authState(this.auth);

  async register(
    credentials: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      age: number;
    },
    photoDataUrl: string | null,
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(this.auth, credentials.email, credentials.password);

    const firebaseUser = credential.user;

    let photoUrl = '';

    if (photoDataUrl) {
      photoUrl = await this.storageService.uploadProfilePhoto(firebaseUser.uid, photoDataUrl);
    }

    const user: Omit<User, 'role' | 'status' | 'createdAt'> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      age: credentials.age,
      photoUrl,
    };

    await this.firestoreService.createUserProfile(user);

    return {
      ...user,
      role: 'user',
      status: 'active',
      createdAt: new Date(),
    };
  }

  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);

    const user = await this.firestoreService.getUserProfile(credential.user.uid);

    if (!user || user.status === 'disabled') {
      await signOut(this.auth);
      throw new Error('Your account is disabled or unavailable.');
    }

    return user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
  async getUserProfile(uid: string): Promise<User | null> {
    return this.firestoreService.getUserProfile(uid);
  }
}
