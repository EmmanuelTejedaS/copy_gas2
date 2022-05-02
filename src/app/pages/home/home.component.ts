/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirestoreService } from '../../servicios/firestore.service';
import { Producto } from 'src/app/models';
import { FirestorageService } from '../../servicios/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { NotificationsService } from '../../servicios/notifications.service';
import { newNotification } from '../../../../functions/src/index';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private path = 'productos/';

  productos: Producto[] = [];
  idUsuario = '';

  constructor(public menu: MenuController,
              public firestoreService: FirestoreService,
              public notificationsService: NotificationsService,
              private firebaseauthService: FirebaseauthService,
              private router: Router) {

                this.loadProductos();


   }

  ngOnInit() {
    this.getUid();
  }

  openMenu(){
    console.log('open menu');
    this.menu.toggle('principal');
  }

  loadProductos() {
    this.firestoreService.getCollection<Producto>(this.path).subscribe(   res => {
      this.productos = res;
      //console.log('productos', res);
    });
}

sendNotification() {
  this.notificationsService.newNotication();
}

getUid() {
  this.firebaseauthService.stateAuth().subscribe( res => {
        if (res !== null) {
          this.idUsuario = res.uid;
            if ((this.idUsuario === 'vSHbGxnhqtNv7mrKjP06Q1WFt5R2') || (this.idUsuario === 'sBREvbV7nEVurz2hpdukea0leJG3')
            || (this.idUsuario === 'mqsh290Nzce827BYKNu3Nwll3fC2')
            || (this.idUsuario === 'bUqF01m4o8V33BmnXKmaIcunQgY2')
            || (this.idUsuario === 'vM4mmiQtlrUzwhiIHvSPntyftvt1')) {
              this.router.navigate(['/pedidos']);
            }
        } else {
          console.log('usuario y admin');
        }
  });
}

// getUid() {
//   this.firebaseauthService.stateAuth().subscribe( res => {
//         if (res !== null) {
//             if (res.uid === 'vSHbGxnhqtNv7mrKjP06Q1WFt5R2'|| 'sBREvbV7nEVurz2hpdukea0leJG3'
//             ||'mqsh290Nzce827BYKNu3Nwll3fC2'
//             ||'bUqF01m4o8V33BmnXKmaIcunQgY2'
//             ||'vM4mmiQtlrUzwhiIHvSPntyftvt1') {
//               this.router.navigate(['/pedidos']);
//             }
//         } else {
//           console.log('usuario y admin');
//         }
//   });
// }

}
