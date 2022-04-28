import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirestoreService } from '../../servicios/firestore.service';
import { Pedido } from '../../models';
import { CarritoService } from '../../servicios/carrito.service';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { HttpClientModule } from '@angular/common/http';

import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

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

  constructor(public menu: MenuController,
              public firestoreService: FirestoreService,
              public carritoService: CarritoService,
              public firebaseauthService: FirebaseauthService,
              public httpClientModule: HttpClientModule,
              public alertController: AlertController,
              public toastController: ToastController) {

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
  console.log('tarjeta', amount);
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

}
