import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Producto } from '../../models';
import { CarritoService } from '../../servicios/carrito.service';
import { ComentariosComponent } from '../comentarios/comentarios.component';

import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {

  @Input() producto: Producto;

  constructor(public carritoService: CarritoService,
              public modalController: ModalController,
              public alertController: AlertController,
              public toastController: ToastController) { }

  ngOnInit() {
    //console.log('el producto es', this.producto);
  }

  addCarrito(){
    //this.carritoService.addProducto(this.producto);
    this.presentAlert();
  }

  async openModal() {
    console.log('this.producto', this.producto);
    const modal = await this.modalController.create({
      component: ComentariosComponent,
      componentProps: {producto: this.producto}
    });
    return await modal.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Agregar al carrito',
      subHeader: 'Subtitle',
      message: 'quieres agregar este producto al carrito?',
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
          this.carritoService.addProducto(this.producto);
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

}
