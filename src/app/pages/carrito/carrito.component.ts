import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirestoreService } from '../../servicios/firestore.service';
import { Pedido } from '../../models';
import { CarritoService } from '../../servicios/carrito.service';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { HttpClientModule, HttpHeaders  } from '@angular/common/http';

import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { NotificationsService } from '../../servicios/notifications.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit, OnDestroy {


  pedido: Pedido;
  carritoSuscriber: Subscription;
  total: number;
  cantidad: number;
  nuevosSuscriber: Subscription;

  constructor(public menu: MenuController,
              public firestoreService: FirestoreService,
              public carritoService: CarritoService,
              public notificationsService: NotificationsService,
              public firebaseauthService: FirebaseauthService,
              public httpClientModule: HttpClientModule,
              public alertController: AlertController,
              public toastController: ToastController,
              private http: HttpClient,
              private iab: InAppBrowser) {

                this.initCarrito();
                this.loadPedido();

}

ngOnInit() {
}

ngOnDestroy() {
  //console.log('se destruyo');
  if (this.carritoSuscriber) {
    this.carritoSuscriber.unsubscribe();
 }
}

openMenu(){
console.log('open menu');
this.menu.toggle('principal');
}

loadPedido(){
  this.carritoSuscriber = this.carritoService.getCarrito().subscribe(  res => {
        this.pedido =  res;
        this.getTotal();
        this.getCantidad();
      });
}

initCarrito(){
  this.pedido ={
    id: '',
    cliente: null,
    productos: [],
    precioTotal: null,
    estado: 'enviado',
    fecha: new Date(),
    valoracion: null,
  };
}

getTotal(){
  this.total = 0;
  this.pedido.productos.forEach( producto => {
    this.total = (producto.producto.precioReducido) * producto.cantidad + this.total;
   });
}

getCantidad(){
  this.cantidad = 0;
  this.pedido.productos.forEach( producto => {
    this.cantidad =  producto.cantidad + this.cantidad;
   });
}

async pedir(){
  if (!this.pedido.productos.length) {
    console.log('añade items al carrito');
    this.toastAñadeAlCarrito();
    return;
  }
  this.pedido.fecha = new Date();
  this.pedido.precioTotal = this.total;
  this.pedido.id = this.firestoreService.getId();
  const uid = await this.firebaseauthService.getUid();
  console.log('pedido es ', this.pedido, uid);
  const path = 'Clientes/' + uid + '/pedidos/';
  console.log(' pedir() -> ', this.pedido, uid, path);
  this.firestoreService.createDoc(this.pedido, path, this.pedido.id).then(  () => {
    console.log('guadado con exito');
         this.carritoService.clearCarrito();
  });
}

tarjeta(amount: any){
  //this.toastAñadeAlCarrito();
  console.log('tarjeta 4', amount);
  this.notificationsService.stripe();
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
}

async post(){
// this.notificationsService.post1(this.total);
// eslint-disable-next-line @typescript-eslint/naming-convention
const Uid = await this.firebaseauthService.getUid();
console.log('id user', Uid);
console.log('codigo nuev');
const nombreProducto = 'aqui iria el nombre del producto';
const precioProducto = this.total;
const idUsuario = {
  enlace: Uid,
};
const notification = {
  title: nombreProducto,
  body: precioProducto
};
const data: s = {
  data: idUsuario,
  notification,
};
const url = 'https://us-central1-mygasdomicilio.cloudfunctions.net/stripeV1';
return this.http.post<result>(url, {data}).subscribe( result => {
  console.log('res', result);
  console.log('idSesion',result.id);
    console.log('url',result.url);
    console.log('idIntentoPay',result.idIntentoPay);

    // obtener datos para observar y lo ue pide el get doc
    const resApiStripe = result.idIntentoPay;
    const path = 'PagosTarjetaV2';
    const id = resApiStripe;
    // suascripcion para ver los datos si pago
    this.nuevosSuscriber = this.firestoreService.getDoc<Pagos>(path,id).subscribe( res =>{
      console.log('respuesta', res);
      console.log('paymenStatus', res.paymenStatus);

        if(res.paymenStatus === 'pagado'){
          console.log('el vato pago');
          console.log('codigo de que ya se compro');
          // this.nuevosSuscriber.unsubscribe();
            // this.carritoComponent.pedir();
            this.pedir();
        }else{
          console.log('aun no pagasd');
        }

    });

    this.iab.create(result.url);
});
}

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'Finalizar compra',
    subHeader: 'quieres terminar el pedido',
    message: 'pagaras en efectivo cuando el repartidor llegue a tu casa',
    buttons: [
      {
      text: 'NO',
      handler: ()=>{
        this.toastNo();
        console.log('NO');
      }
    },
    {
      text: 'SI',
      handler: ()=>{
        this.pedir();
        console.log('se agrego con exito :)');
      }
    }
    ]
  });

  await alert.present();

  const { role } = await alert.onDidDismiss();
  console.log('onDidDismiss resolved with role', role);
}

async toastNo() {
  const toast = await this.toastController.create({
    message: 'hay mas productos por elegir',
    duration: 2000
  });
  toast.present();
}

async toastAñadeAlCarrito() {
  const toast = await this.toastController.create({
    message: 'agrega productos al carrito para continuar',
    duration: 2000
  });
  toast.present();
}

async toastTarjeta() {
  const toast = await this.toastController.create({
    message: 'proximamente',
    duration: 2000
  });
  toast.present();
}

}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface s {
  data: any;
  notification: any;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface result {
  id: string;
  url: string;
  idIntentoPay: string;
}// codigo nuevo

interface Pagos {
  paymenStatus: string;
}
