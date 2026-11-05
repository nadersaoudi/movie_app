import { Component } from "@angular/core";
import { IonContent, IonInput, IonButton } from "@ionic/angular";
import { RouterLink } from "@angular/router";
@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  imports: [IonContent, IonInput, IonButton, RouterLink],
})
export class LoginPage {
  email = "";
  password = "";

  login(): void {
    console.log("Email:", this.email);
    console.log("Password:", this.password);
  }
}
