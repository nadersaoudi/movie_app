import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonContent, IonInput, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonInput, IonButton, IonIcon],
})
export class RegisterPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly firestoreService = inject(FirestoreService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  age: number | null = null;
  email = '';
  password = '';
  readonly photo = signal<string | undefined>(undefined);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    addIcons({ cameraOutline, imageOutline });
  }

  ngOnInit(): void {
    if (this.authService.getCurrentFirebaseUser()) {
      this.router.navigate(['/home']);
    }
  }

  async pickImage(source: CameraSource): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source,
      });

      this.photo.set(image.dataUrl);
      this.errorMessage.set('');
    } catch (error) {
      console.error('Image picker error:', error);
      this.errorMessage.set(
        source === CameraSource.Camera
          ? 'Unable to take photo. You can still register without one.'
          : 'Unable to select photo from gallery.',
      );
    }
  }

  async takePicture(): Promise<void> {
    await this.pickImage(CameraSource.Camera);
  }

  async pickFromGallery(): Promise<void> {
    await this.pickImage(CameraSource.Photos);
  }

  async register(): Promise<void> {
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.age ||
      this.age < 1 ||
      !this.email.trim() ||
      !this.password
    ) {
      this.errorMessage.set('Please complete all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const firebaseUser = await this.authService.createAccount(this.email.trim(), this.password);

      const photo = this.photo();
      const photoUrl = photo ? await this.storageService.uploadProfilePhoto(firebaseUser.uid, photo) : '';

      const displayName = `${this.firstName.trim()} ${this.lastName.trim()}`;
      await this.authService.setProfile(displayName, photoUrl || null);

      await this.firestoreService.createUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        age: this.age,
        photoUrl,
      });

      await this.router.navigate(['/home']);
    } catch (error: unknown) {
      console.error('Registration error:', error);

      this.errorMessage.set(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
