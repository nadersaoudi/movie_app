import { Injectable } from '@angular/core';
import { deleteApp, initializeApp } from '@angular/fire/app';
import type { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';

import { environment } from '../../environments/environment';

const SEED_FLAG = 'movieapp.admin.seeded';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private seedPromise: Promise<void> | null = null;

  seedAdminAccount(): Promise<void> {
    this.seedPromise ??= this.seed();
    return this.seedPromise;
  }

  private async seed(): Promise<void> {
    if (this.alreadySeeded()) {
      return;
    }

    try {
      // A secondary app keeps the seeding separate from the user's own session.
      const secondaryApp = initializeApp(environment.firebase, 'admin-seed');
      const secondaryAuth = getAuth(secondaryApp);

      try {
        await this.signInOrCreate(secondaryAuth);
      } finally {
        await signOut(secondaryAuth).catch(() => undefined);
        await deleteApp(secondaryApp).catch(() => undefined);
      }

      this.markSeeded();
    } catch (error) {
      if ((error as { code?: string })?.code === 'auth/email-already-in-use') {
        this.markSeeded();
      }
      console.debug('Admin account seed skipped:', error);
    }
  }

  private async signInOrCreate(auth: Auth): Promise<void> {
    const admin = environment.admin;

    try {
      // The account already exists with the expected credentials.
      await signInWithEmailAndPassword(auth, admin.email, admin.password);
    } catch {
      const credential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
      await updateProfile(credential.user, {
        displayName: `${admin.firstName} ${admin.lastName}`,
        photoURL: admin.photoUrl,
      });
    }
  }

  private alreadySeeded(): boolean {
    try {
      return localStorage.getItem(SEED_FLAG) === 'true';
    } catch {
      return false;
    }
  }

  private markSeeded(): void {
    try {
      localStorage.setItem(SEED_FLAG, 'true');
    } catch {
      // Ignore storage errors (e.g. privacy mode).
    }
  }
}
