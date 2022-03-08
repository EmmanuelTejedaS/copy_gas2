import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseauthService } from './servicios/firebaseauth.service';



@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private firebaseauthService: FirebaseauthService
   ) {
    this.initializeApp();
  }

  initializeApp(){

  }
}
