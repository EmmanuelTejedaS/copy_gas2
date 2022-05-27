/* eslint-disable max-len */
/* eslint-disable quotes */
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
// import * as stripe from 'stripe';
// import express = require('express');
import * as express from 'express';
const app = express();
// webv1
// const endpointSecret = 'we_1L3Q2cJQLZyhguAW4d86iBK6';
// web v2
const endpointSecret = 'we_1L3mYWJQLZyhguAWIwM50ye9';


admin.initializeApp();
const firestore = admin.firestore();

const uidAdmin = 'UwDgg5grfeWxvKVfqpuImy7UPTF3';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors')({
  origin: true,
});


// app.use(cors({origin: true}));
// stripe
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require('stripe')('sk_test_51KqRmCJQLZyhguAWSJm4ksaZVrlhLRgo4oNB0fI05TTKPb6QfwRYS6HRKjZVDbSGKSL0fe54ZDInpqcpTWiW89eR00HzPnxAQ2');
// stripe final

// webhookv1 complemento
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const fulfillOrder = (session: any) => {
//   console.log("Fulfilling order", session);
// };

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


export const test8 = functions.https.onCall(async (data, context) =>{
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
  const d: stripeRes = {
    url: session.url,
    id: session.id,
    status: session.payment_intent,
  };
  return d;
});
// nueva funcion stripe final

// stripe final

// app.get('/hola', function(request, res) {
//   return cors(request, res, async () => {
//     res.send('hola mundo');
//   });
// });
// exports.app =functions.https.onRequest(app);

app.post('/http://localhost:4200/carrito', express.raw({type: 'application/json'}), (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // eslint-disable-next-line no-case-declarations
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      // eslint-disable-next-line no-case-declarations
      const paymentMethod = event.data.object;
      console.log(`PaymentIntent for ${paymentMethod} was successful!`);
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return response;
});
exports.appwebhook = functions.https.onRequest(app);

// web hook final
// stripe v1
export const stripeV1 = functions.https.onRequest(async (req, response) =>{
  return cors(req, response, async () => {
    if (req.body.data) {
      const total = req.body.data.notification.body;
      const totalMultipilcado = total * 100;
      const comis = (totalMultipilcado * .036) + 300;
      const precioReal = comis + totalMultipilcado;
      console.log('precio real', precioReal);
      const nombre = req.body.data.notification.title;
      const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {
          allowed_countries: ["MX"],
        },
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: nombre,
              },
              unit_amount: totalMultipilcado,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://mygasdomicilio.web.app/',
        cancel_url: 'https://mygasdomicilio.web.app/',
      });
      // const idUser = 'idexamplr';
      // const status = 'sinPagar';
      // await admin.firestore().collection("intentoDePaym").doc(session.payment_intent).set({
      //   id: session.id,
      //   idU: idUser,
      //   paymenStatus: status,
      // });
      // datos de la sesion
      // console.log('sesion check', session);
      console.log('dataaaaaaa', req.body.data);
      console.log('enlace', req.body.data.data.enlace);
      console.log('nombre', req.body.data.notification.title);
      console.log('total', req.body.data.notification.body);
      const idUser = req.body.data.data.enlace;
      const status = 'sinPagar';
      await admin.firestore().collection("PagosTarjetaV2").doc(session.payment_intent).set({
        id: session.id,
        idU: idUser,
        paymenStatus: status,
      });

      response.json({id: session.id,
        url: session.url,
        idIntentoPay: session.payment_intent});
      // codigo
    } else {
      const res: Res = {
        respuesta: 'error',
      };
      response.status(400).send(res);
    }
  });
});
// stripe v1
// eslint-disable-next-line max-len
exports.cincominutos = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
  console.log('5 minutos!');
  return null;
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
// webhook v1
// probar esto
// exports.webhookv1
export const webhookv1 = functions.https.onRequest(async (request, response) =>{
  console.log(`requuest aaaaaaaaaaaaaaaaaaaaaaaaaaa`, request);
  // eslint-disable-next-line prefer-const
  let event = request.body;
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // eslint-disable-next-line no-case-declarations
      const session = event.data.object;
      // const paymentIntent = event.data.object;
      // console.log(`sesion`, session);
      console.log(`PaymentIntent for was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // eslint-disable-next-line no-case-declarations
      const a = session.status;
      // eslint-disable-next-line no-case-declarations
      // const h = 'popeye';
      console.log(`a`, a);
      if (session.status === 'succeeded') {
        // fulfillOrder(session);
        console.log(`pagaste`);
        // await admin.firestore().collection("Clientes").doc(idUser).collection("pagosTarjeta").doc(session.payment_intent).set({
        //   paymenStatus: 'pagado',
        // });
        await admin.firestore().collection("PagosTarjetaV2").doc(session.id).set({
          paymenStatus: 'pagado',
        });
        response.sendStatus(200);
      }
      break;
    case 'payment_method.attached':
      console.log(`sin pagar`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }
  // return response.json({received: true});
  // probar este
  // return response.sendStatus(200);
  response.sendStatus(200);
  // response.status(200);
});
// webhook v1
exports.webhookv2 = functions.https.onRequest(async (request, response) =>{
  // eslint-disable-next-line prefer-const
  let event = request.body;
  switch (event.type) {
    case 'payment_intent.succeeded':
      // eslint-disable-next-line no-case-declarations
      const session = event.data.object;
      // const paymentIntent = event.data.object;
      // console.log(`sesion`, session);
      console.log(`PaymentIntent for was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // eslint-disable-next-line no-case-declarations
      const a = session.status;
      // eslint-disable-next-line no-case-declarations
      // const h = 'popeye';
      console.log(`a`, a);
      if (session.status === 'succeeded') {
        // fulfillOrder(session);
        console.log(`pagaste`);
        response.sendStatus(200);
        await admin.firestore().collection("PagosTarjetaV2").doc(session.payment_intent).set({
          paymenStatus: 'pagado',
        });
      }
      break;
    case 'payment_method.attached':
      console.log(`sin pagar`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }
  response.sendStatus(200);
});
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


interface stripeRes {
  url: string;
  id: string;
  status: string;
}

interface Res {
  respuesta: string;
}

interface INotification {
    data: any;
    tokens: string[];
    notification: admin.messaging.Notification;
  }
