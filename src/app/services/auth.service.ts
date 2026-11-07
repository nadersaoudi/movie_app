import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import type { User as FirebaseUser } from '@angular/fire/auth';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  readonly authState$: Observable<FirebaseUser | null> = authState(this.auth);

  async createAccount(email: string, password: string): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  async setProfile(displayName: string, photoUrl: string | null): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user.');
    }
    await updateProfile(user, {
      displayName,
      photoURL: photoUrl ?? undefined,
    });
  }

  async login(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
