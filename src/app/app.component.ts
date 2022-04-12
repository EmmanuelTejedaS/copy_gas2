import { Component } from '@angular/core';
import { FirebaseauthService } from './servicios/firebaseauth.service';
import { NotificationsService } from './servicios/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  admin = false;

  constructor(
    private firebaseauthService: FirebaseauthService,
    private notificationsService: NotificationsService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    console.log('hola');
    this.getUid();
  }


  getUid() {
    this.firebaseauthService.stateAuth().subscribe( res => {
          if (res !== null) {
              if (res.uid === 'UwDgg5grfeWxvKVfqpuImy7UPTF3')  {
                  this.admin = true;
              } else {
                 this.admin = false;
              }
          } else {
            this.admin = false;
          }
    });
}


}
