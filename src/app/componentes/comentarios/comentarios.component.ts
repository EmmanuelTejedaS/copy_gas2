import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Producto } from '../../models';
import { FirestoreService } from '../../servicios/firestore.service';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.scss'],
})
export class ComentariosComponent implements OnInit, OnDestroy {

  @Input() producto: Producto;

  comentario = '';

  comentarios: Comentario[] = [];

  suscriber: Subscription;

  constructor(public modalController: ModalController,
              public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService) { }

  ngOnInit() {
    console.log('producto', this.producto);
    this.loadCommentarios();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy() modal');
    if (this.suscriber) {
       this.suscriber.unsubscribe();
    }
}

  closeModal() {
    this.modalController.dismiss();
     if (this.suscriber) {
       this.suscriber.unsubscribe();
    }
}


loadCommentarios() {
  // eslint-disable-next-line prefer-const
  let startAt = null;
  if(this.comentarios.length) {
    startAt = this.comentarios[ this.comentarios.length - 1].fecha;
}
  const path = 'productos/' +  this.producto.id + '/comentarios';
  this.suscriber = this.firestoreService.getCollectionPaginada<Comentario>(path,2, startAt).subscribe( res => {
    if(res.length){
      res.forEach(comentario => {
        console.log('a',comentario);
        const exist = this.comentarios.find( comentExist => {
         console.log('esto imprime',comentExist);
        });
        if(exist === undefined){
          this.comentarios.push(comentario);
        }
      });
     // this.comentarios = res;
      console.log(res);
      if (this.suscriber) {
        this.suscriber.unsubscribe();
     }
    }
  });
}

comentar() {
   const comentario = this.comentario;
   console.log('comentario ->' , comentario);
   const path = 'productos/' +  this.producto.id + '/comentarios';
   const data: Comentario = {
      autor:  this.firebaseauthService.datosCliente.nombre,
      comentario,
      fecha: new Date(),
      id: this.firestoreService.getId()
   };
   this.firestoreService.createDoc(data, path, data.id).then( () => {
       console.log('comentario enviado');
       this.comentario = '';
   });
}

}


interface Comentario {
autor: string;
comentario: string;
fecha: any;
id: string;
}

