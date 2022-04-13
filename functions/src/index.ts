/* eslint-disable quotes */
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';

admin.initializeApp();
const firestore = admin.firestore();

const uidAdmin = 'UwDgg5grfeWxvKVfqpuImy7UPTF3';

exports.newPedido = functions.firestore
    .document('/Clientes/{userId}/pedidos/{pedidoId}')
    .onCreate( async (event) => {
      const pedido = event.data();
      console.log('newPedido ejecutado');
      const path = '/Clientes/' + uidAdmin;
      const docInfo = await firestore.doc(path).get();
      const dataUser = docInfo.data() as any;
      const token = dataUser.token;
      const registrationTokens = [token];
      const dataFcm = {
        enlace: '/pedidos',
      };

      const notification: INotification = {
        data: dataFcm,
        tokens: registrationTokens,
        notification: {
          title: pedido.cliente.nombre,
          body: 'Nuevo pedido: ' + pedido.precioTotal + '$',
        },
      // eslint-disable-next-line semi
      }
      return sendNotification(notification);
    });


const sendNotification = (notification: INotification) => {
  return new Promise((resolve) => {
    const message: admin.messaging.MulticastMessage = {
      data: notification.data,
      tokens: notification.tokens,
      notification: notification.notification,
      android: {
        notification: {
          icon: 'ic_stat_name',
          color: '#EB9234',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: {
              critical: true,
              name: 'default',
              volume: 1,
            },
          },
        },
      },
    };
    console.log('List of tokens send', notification.tokens);
    admin.messaging().sendMulticast(message)
        .then((response) => {
          if (response.failureCount > 0) {
            const failedTokens: any[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(notification.tokens[idx]);
              }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
            // elimnar tokens
          } else {
            console.log('Send notification exitoso -> ');
          }
          resolve(true);
          return;
        }).catch( (error) => {
          console.log('Send fcm falló -> ', error);
          resolve(false);
          return;
        });
  });
};


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
interface INotification {
    data: any;
    tokens: string[];
    notification: admin.messaging.Notification;
  }
