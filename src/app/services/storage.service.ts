import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly storage = inject(Storage);

  async uploadProfilePhoto(uid: string, photoDataUrl: string): Promise<string> {
    const photoRef = ref(this.storage, `users/${uid}/profile.jpg`);

    await uploadString(photoRef, photoDataUrl, 'data_url');

    return getDownloadURL(photoRef);
  }
}
