import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

import type { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);

  async createUserProfile(user: Omit<User, 'role' | 'status' | 'createdAt'>): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);

    await setDoc(userRef, {
      ...user,
      role: 'user',
      status: 'active',
      createdAt: new Date(),
    });
  }

  async getUserProfile(uid: string): Promise<User | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(userRef);

    return snapshot.exists() ? (snapshot.data() as User) : null;
  }

  async updateUserStatus(uid: string, status: 'active' | 'disabled'): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);

    await updateDoc(userRef, { status });
  }
}
