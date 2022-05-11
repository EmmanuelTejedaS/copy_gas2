/* eslint-disable max-len */
/* eslint-disable quotes */
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
// import * as stripe from 'stripe';

admin.initializeApp();
const firestore = admin.firestore();

const uidAdmin = 'UwDgg5grfeWxvKVfqpuImy7UPTF3';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors')({
  origin: true,
});

// stripe
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require('stripe')('sk_test_');
// stripe final

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


exports.eventPedido = functions.firestore
    .document('/Clientes/{userId}/pedidos/{pedidoId}')
    .onUpdate( async (event, eventContext) => {
      const userUid = eventContext.params.userId;
      const pedido = event.after.data();
      const dataFcm = {
        enlace: '/mis-pedidos',
      };

      const path = '/Clientes/' + userUid;
      const docInfo = await firestore.doc(path).get();
      const dataUser = docInfo.data() as any;
      const token = dataUser.token;
      const registrationTokens = [token];

      const notification: INotification = {
        data: dataFcm,
        tokens: registrationTokens,
        notification: {
          title: 'Seguimiento de tu pedido',
          body: 'Pedido ' + pedido.estado,
        },
      };

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


// eslint-disable-next-line max-len
export const newNotification = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    if (request.body.data) {
      const notification = request.body.data as INotification;
      await sendNotification(notification);
      const res: Res = {
        respuesta: 'success',
      };
      response.status(200).send(res);
    } else {
      const res = {
        respuesta: 'error',
      };
      response.status(200).send(res);
    }
  });
});
// nueva funcion stripe

// eslint-disable-next-line max-len
// exports.stripeCheckout = functions.https.onCall
export const stripeCheckout4 = functions.https.onCall(async (data, context) =>{
  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://mygasdomicilio.web.app/',
    cancel_url: 'https://mygasdomicilio.web.app/',
  });
  return session.url;
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let event;
});
// nueva funcion stripe final
// web hook

// web hook final
// eslint-disable-next-line max-len
exports.cincominutos = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  console.log('5 minutos!');
  return null;
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
interface Res {
  respuesta: string;
}

interface INotification {
    data: any;
    tokens: string[];
    notification: admin.messaging.Notification;
  }
