import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { IonContent, IonInput, IonButton, IonIcon } from "@ionic/angular";

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { addIcons } from "ionicons";
import { cameraOutline } from "ionicons/icons";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class RegisterPage {
  firstName = "";
  lastName = "";
  age: number | null = null;
  email = "";
  password = "";
  photo: string | undefined;

  constructor() {
    addIcons({ cameraOutline });
  }

  async takePicture(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      this.photo = image.dataUrl;
    } catch (error) {
      console.error("Camera error:", error);
    }
  }

  register(): void {
    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.age ||
      this.age < 1 ||
      !this.email.trim() ||
      !this.password ||
      !this.photo
    ) {
      alert("Please complete all fields and take a profile photo.");
      return;
    }

    console.log({
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      email: this.email,
      password: this.password,
      photo: this.photo,
    });

    alert("Registration form completed successfully!");
  }
}
