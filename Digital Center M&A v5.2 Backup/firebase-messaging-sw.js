importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD_vUmAunFhTZH24SfCZMST5PVRBcAMMNI",
  authDomain: "digital-center-mya.firebaseapp.com",
  projectId: "digital-center-mya",
  storageBucket: "digital-center-mya.firebasestorage.app",
  messagingSenderId: "52765537655",
  appId: "1:52765537655:web:c0d0f6f5449e3cdc339d72"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/logo-boleta.png'
    }
  );

});