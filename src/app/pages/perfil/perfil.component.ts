import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Cliente } from 'src/app/models';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { FirestorageService } from '../../servicios/firestorage.service';
import { FirestoreService } from '../../servicios/firestore.service';
import { Subscription } from 'rxjs';

import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {

  cliente: Cliente = {
    uid: '',
    email: '',
    celular: '',
    foto: '',
    referencia: '',
    nombre: '',
    ubicacion: null,
  };

  newFile: any;

  uid = '';

  suscriberUserInfo: Subscription;

  ingresarEnable = false;

  constructor(public menu: MenuController,
              public firebaseauthService: FirebaseauthService,
              public firestorageService: FirestorageService,
              public firestoreService: FirestoreService,
              public alertController: AlertController,
              public toastController: ToastController,
              private router: Router) {
                this.firebaseauthService.stateAuth().subscribe( res => {
                  console.log(res);
                  if (res !== null) {
                    this.uid = res.uid;
                    this.getUserInfo(this.uid);
                 }else {
                  this.initCliente();
              }
          });
              }

   async ngOnInit() {

    const uid = await this.firebaseauthService.getUid();
    console.log(uid);

   }

   initCliente() {
    this.uid = '';
    this.cliente = {
      uid: '',
      email: '',
      celular: '',
      foto: '',
      referencia: '',
      nombre: '',
      ubicacion: null,
    };
    console.log(this.cliente);
}

  openMenu(){
    console.log('open menu');
    this.menu.toggle('principal');
  }


  async newImageUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newFile = event.target.files[0];
     const reader = new FileReader();
     reader.onload = ((image) => {
         this.cliente.foto = image.target.result as string;
     });
     reader.readAsDataURL(event.target.files[0]);
   }
 }

 async registrarse(){
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.celular
    };
    if(credenciales.email.length && credenciales.password.length){
      const res = await this.firebaseauthService.registrar(credenciales.email, credenciales.password).catch( err =>{
        console.log('error->', err);
       });
      console.log(res);
      const uid = await this.firebaseauthService.getUid();
      this.cliente.uid = uid;
      this.guardarUser();
      console.log(uid);
    }else{
      this.toastSinDatos();
    }
 }

 async guardarUser() {
  const path = 'Clientes';
  const name = this.cliente.nombre;
  if(this.newFile !== undefined){
  const res = await this.firestorageService.uploadImage(this.newFile, path, name);
  this.cliente.foto = res;
}
  // eslint-disable-next-line @typescript-eslint/no-shadow
  this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then( res => {
    this.router.navigate(['/home']);
      console.log('guardado con exito');
  }).catch(   error => {
  });
}

 async salir(){
  //const uid = await this.firebaseauthService.getUid();
  //console.log(uid);
  this.firebaseauthService.logout();
  this.suscriberUserInfo.unsubscribe();
 }

 getUserInfo(uid: string) {
  console.log('getUserInfo');
  const path = 'Clientes';
  this.suscriberUserInfo = this.firestoreService.getDoc<Cliente>(path, uid).subscribe( res => {
         if (res !== undefined) {
           this.cliente = res;
         }
  });
}

ingresar(){
  const credenciales = {
    email: this.cliente.email,
    password: this.cliente.celular
  };
  if(credenciales.email.length && credenciales.password.length){
    this.firebaseauthService.login(credenciales.email, credenciales.password).then( res => {
      this.router.navigate(['/home']);
      console.log('ingreso con exito');
  }).catch ( error =>{
    this.datoserroneos();
  });
  }else{
    this.toastregistrate();
  }
}

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'cerrar sesion',
    message: 'quieres cerrar la sesion?',
    buttons: [
      {
      text: 'NO',
      handler: ()=>{
        this.toastContinuar();
        console.log('NO');
      }
    },
    {
      text: 'SI',
      handler: ()=>{
        this.salir();
        this.toastCerrarSesion();
        console.log('gracias por comprar :)');
      }
    }
    ]
  });

  await alert.present();

  const { role } = await alert.onDidDismiss();
  console.log('onDidDismiss resolved with role', role);
}

async toastCerrarSesion() {
  const toast = await this.toastController.create({
    message: 'se ha cerrrado la sesion',
    duration: 2000
  });
  toast.present();
}

async toastContinuar() {
  const toast = await this.toastController.create({
    message: 'gracias por seguir comprando',
    duration: 2000
  });
  toast.present();
}

async toastregistrate() {
  const toast = await this.toastController.create({
    message: 'llena los campos para poder iniciar sesion',
    duration: 2000
  });
  toast.present();
}

async toastSinDatos() {
  const toast = await this.toastController.create({
    message: 'llena los campos para continuar con el registro',
    duration: 3000,
    position: 'middle'
  });
  toast.present();
}

async datoserroneos() {
  const toast = await this.toastController.create({
    message: 'Tus datos no coinciden',
    duration: 3000,
    position: 'middle'
  });
  toast.present();
}

}
