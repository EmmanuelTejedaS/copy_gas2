import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirebaseauthService } from '../../servicios/firebaseauth.service';
import { Subscription } from 'rxjs';
import { Pedido } from '../../models';
import { FirestoreService } from '../../servicios/firestore.service';

@Component({
  selector: 'app-mispedidos',
  templateUrl: './mispedidos.component.html',
  styleUrls: ['./mispedidos.component.scss'],
})
export class MispedidosComponent implements OnInit,OnDestroy {

  nuevosSuscriber: Subscription;
  culmidadosSuscriber: Subscription;
  pedidos: Pedido[] = [];
  pedidosEntregados: Pedido[] = [];

  nuevos = true;

  constructor(public menu: MenuController,
              public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService) {

               }

  ngOnInit() {
    this.getPedidosNuevos();
  }

  ngOnDestroy() {
    if (this.nuevosSuscriber) {
       this.nuevosSuscriber.unsubscribe();
    }
    if (this.culmidadosSuscriber) {
       this.culmidadosSuscriber.unsubscribe();
    }
 }


  openMenu(){
    console.log('open menu');
    this.menu.toggle('principal');
    }

    // changeSegment(ev: any) {
    //    console.log('changeSegment()', ev.detail.value);
    //    const opc = ev.detail.value;
    //    if (opc === 'entregados') {
    //     this.getPedidosCulminados();
    //     this.nuevosSuscriber.unsubscribe();
    //    }
    //    if (opc === 'nuevos') {
    //         this.getPedidosNuevos();
    //            this.culmidadosSuscriber.unsubscribe();
    //   }
    // }

    changeSegment(ev: any) {
      //  console.log('changeSegment()', ev.detail.value);
       const opc = ev.detail.value;
       if (opc === 'entregados') {
         this.nuevos = false;
         this.getPedidosCulminados();
         this.nuevosSuscriber.unsubscribe();

       }
       if (opc === 'nuevos') {
            this.nuevos = true;
            this.getPedidosNuevos();
            this.culmidadosSuscriber.unsubscribe();
      }
    }

  //  async getPedidosNuevos(){
  //   console.log('getPedidosNuevos()');
  //   const uid = await this.firebaseauthService.getUid();
  //   const path = 'Clientes/' + uid + '/pedidos/';
  //   this.nuevosSuscriber = this.firestoreService.getCollectionQuery<Pedido>(path, 'estado', '==', 'enviado').subscribe( res =>  {
  //     if (res.length) {
  //       console.log('getPedidosNuevos() -> res ', res);
  //       this.pedidos = res;
  // }
  //   });
  //  }

  async getPedidosNuevos() {
    console.log('getPedidosNuevos()');
    const uid = await this.firebaseauthService.getUid();
    const path = 'Clientes/' + uid + '/pedidos/';
    let startAt = null;
    if (this.pedidos.length) {
        startAt = this.pedidos[this.pedidos.length - 1].fecha;
    }
    this.nuevosSuscriber = this.firestoreService.getCollectionQuery2<Pedido>(path, 'estado', '==', 'enviado', startAt).subscribe( res => {
          if (res.length) {
                console.log('getPedidosNuevos() -> res ', res);
                res.forEach( pedido => {

                  const exist = this.pedidos.find( comentExist => {
                    console.log('esto imprime',comentExist);
                   });
                   if(exist === undefined){
                     this.pedidos.push(pedido);
                   }


                      //this.pedidos.push(pedido);
                });

              //   console.log(res);
              //   if (this.culmidadosSuscriber) {
              //     this.culmidadosSuscriber.unsubscribe();
              //  }


          }
    });

  }

//    async getPedidosCulminados(){
//      // eslint-disable-next-line prefer-const
//      let startAt = null;
//      if(this.pedidos.length) {
//        startAt = this.pedidos[ this.pedidos.length - 1].fecha;
//    }
//    console.log('getPedidosEntregados()');
//    const uid = await this.firebaseauthService.getUid();
//    const path = 'Clientes/' + uid + '/pedidos/';
//    this. culmidadosSuscriber = this.firestoreService.getCollectionPaginada<Pedido>(path,2, startAt).subscribe( res =>  {
//  //     if (res.length) {
//  //       console.log('getPedidosEntregados() -> res ', res);
//  //       this.pedidos = res;
//  // }

//  if(res.length){
//    res.forEach(comentario => {
//      console.log('a',comentario);
//      const exist = this.pedidos.find( comentExist => {
//       console.log('esto imprime',comentExist);
//      });
//      if(exist === undefined){
//        this.pedidos.push(comentario);
//      }
//    });
//   // this.comentarios = res;
//    console.log(res);
//    if (this.culmidadosSuscriber) {
//      this.culmidadosSuscriber.unsubscribe();
//   }
//  }


//    });
//    }

async getPedidosCulminados() {
  console.log('getPedidosCulminados()');
  const uid = await this.firebaseauthService.getUid();
  const path = 'Clientes/' + uid + '/pedidos/';
  let startAt = null;
  if (this.pedidosEntregados.length) {
      startAt = this.pedidosEntregados[this.pedidosEntregados.length - 1].fecha;
  }
  // eslint-disable-next-line max-len
  this.culmidadosSuscriber = this.firestoreService.getCollectionQuery2<Pedido>(path, 'estado', '==', 'entregado', startAt).subscribe( res => {
        if (res.length) {
              console.log('getPedidosCulminados() -> res ', res);
              res.forEach( pedido => {


                const exist = this.pedidosEntregados.find( comentExist => {
                  console.log('esto imprime',comentExist);
                 });
                 if(exist === undefined){
                   this.pedidosEntregados.push(pedido);
                 }

                    //this.pedidosEntregados.push(pedido);
              });

            //   console.log(res);
            //   if (this.nuevosSuscriber) {
            //     this.nuevosSuscriber.unsubscribe();
            //  }

        }
  });

}

cargarMas() {
  console.log('mas1');
  if (this.nuevos) {
    this.getPedidosCulminados();
  } else {
    this.getPedidosNuevos();
  }
}


cargarMas2() {
  console.log('mas2');
  if (this.nuevos) {
    this.getPedidosNuevos();
  } else {
    this.getPedidosCulminados();
  }
}


}
