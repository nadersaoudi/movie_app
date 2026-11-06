import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonContent, IonInput, IonButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonIcon],
})
export class RegisterPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  firstName = '';
  lastName = '';
  age: number | null = null;
  email = '';
  password = '';
  photo: string | undefined;

  isLoading = false;
  errorMessage = '';

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

      this.photo = image.dataUrl;
      this.errorMessage = '';
    } catch (error) {
      console.error('Image picker error:', error);
      this.errorMessage =
        source === CameraSource.Camera
          ? 'Unable to take photo. You can still register without one.'
          : 'Unable to select photo from gallery.';
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
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(
        {
          email: this.email.trim(),
          password: this.password,
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          age: this.age,
        },
        this.photo ?? null,
      );

      await this.router.navigate(['/home']);
    } catch (error: unknown) {
      console.error('Registration error:', error);

      this.errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
