import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseauthService } from './firebaseauth.service';
import { FirestoreService } from './firestore.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';


import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(public platform: Platform,
    public firebaseauthService: FirebaseauthService,
    public firestoreService: FirestoreService,
    private router: Router,
    private http: HttpClient,
    public toastController: ToastController) {
      this.stateUser();
      //this.inicializar();
    }




  stateUser() {
    this.firebaseauthService.stateAuth().subscribe( res => {
      console.log(res);
      if (res !== null) {
         this.inicializar();
         this.presentToast();
      }
    });

  }

  inicializar() {

    console.log('esta el codigo 111');

    if (this.platform.is('capacitor')) {


      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      });

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration',
        (token: Token) => {
          alert('Push registration success, token: ' + token.value);
        }
      );

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError',
        (error: any) => {
          alert('Error on registration: ' + JSON.stringify(error));
        }
      );

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          alert('Push received ffffff: ' + JSON.stringify(notification));
          this.presentToast();
        }
      );

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          alert('Push action performed hhhhh: ' + JSON.stringify(notification));
        }
      );



 } else {
   console.log('PushNotifications.requestPermission() -> no es movil');
 }

  }



  addListeners(){
  }

  guadarToken(token: any){
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'has ingresado con exito',
      duration: 2000
    });
    toast.present();
  }

}
