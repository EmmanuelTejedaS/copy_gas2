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
  repartidor = false;
  usuario = false;
  idUsuario = '';

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
    //cambio
    this.firebaseauthService.stateAuth().subscribe( res => {
          if (res !== null) {
            this.idUsuario = res.uid;
              if (this.idUsuario === 'UwDgg5grfeWxvKVfqpuImy7UPTF3')  {
                  this.admin = true;
                  this.usuario = false;
                  this.repartidor = false;
                  console.log('admin');
                  console.log('if');
              }else if ((this.idUsuario === 'vSHbGxnhqtNv7mrKjP06Q1WFt5R2') || (this.idUsuario === 'sBREvbV7nEVurz2hpdukea0leJG3')
              || (this.idUsuario === 'mqsh290Nzce827BYKNu3Nwll3fC2')
              || (this.idUsuario === 'bUqF01m4o8V33BmnXKmaIcunQgY2')
              || (this.idUsuario === 'vM4mmiQtlrUzwhiIHvSPntyftvt1')) {
                 this.admin = false;
                 this.repartidor = true;
                 this.usuario = false;
                 console.log('repartidor');
                 console.log('eslse if');
              }else{
                this.admin = false;
                this.repartidor = false;
                this.usuario = true;
                console.log('usuario');
                console.log('else');
              }

          } else {
            this.admin = false;
            this.repartidor = false;
            this.usuario = true;
            console.log('else3');
          }
    });
}


}
