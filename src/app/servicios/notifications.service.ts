/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseauthService } from './firebaseauth.service';
import { FirestoreService } from './firestore.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';


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
    public toastController: ToastController,
    private iab: InAppBrowser) {
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
         // alert('Push registration success, token: ' + token.value);
          this.guadarToken(token.value);
        }
      );

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError',
        (error: any) => {
         // alert('Error on registration: ' + JSON.stringify(error));
        }
      );

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          //alert('Push received ffffff: ' + JSON.stringify(notification));
          this.presentToast();
        }
      );

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          //alert('Push action performed hhhhh: ' + JSON.stringify(notification));
        }
      );



 } else {
   console.log('PushNotifications.requestPermission() -> no es movil');
 }

  }



  addListeners(){
  }


  async guadarToken(token: any){

    const Uid = await this.firebaseauthService.getUid();

    if (Uid) {
        console.log('guardar Token Firebase ->', Uid);
        const path = '/Clientes/';
        const userUpdate = {
          token,
        };
        this.firestoreService.updateDoc(userUpdate, path, Uid);
        console.log('guardar TokenFirebase()->', userUpdate, path, Uid);
    }
  }

  newNotication() {

    const receptor = '6Ee6ylrqRbeokH6CoQTOoDFfok83';
    const path = 'Clientes/';
    this.firestoreService.getDoc<any>(path, receptor).subscribe( res => {
          if (res) {
              const token = res.token;
              const dataNotification = {
                enlace: '/mis-pedidos',
              };
              const notification = {
                title: 'Mensaje enviado manuelmente',
                body: 'Hola'
              };
              const data: INotification = {
                    data: dataNotification,
                    tokens: [token],
                    notification,
              };
              const url = 'https://us-central1-mygasdomicilio.cloudfunctions.net/newNotification';
              // eslint-disable-next-line @typescript-eslint/no-shadow
              return this.http.post<Res>(url, {data}).subscribe( res => {
                    console.log('respuesta newNotication() -> ', res);
              });
          }

    });


}


stripe() {

  const dataNotification = {
    enlace: '/mis-pedidos',
  };
  const notification = {
    title: 'Mensaje enviado manuelmente',
    body: 'Hola'
  };
  const data: stripe = {
    data: dataNotification,
    notification,
};

  const url = 'https://us-central1-mygasdomicilio.cloudfunctions.net/stripeCheckout4';
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return this.http.post<Res1>(url, {data}).subscribe( res => {
        console.log('respuesta newNotication() --> ', res);
        console.log('link',res.result);

        this.iab.create(res.result);

  });

}

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'has ingresado con exito',
      duration: 2000
    });
    toast.present();
  }

}

interface INotification {
  data: any;
  tokens: string[];
  notification: any;
}


interface Res {
  respuesta: string;
}

interface stripe {
  data: any;
  notification: any;
}

interface Res1 {
  result: string;
}
