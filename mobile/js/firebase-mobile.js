// =====================================================
// DIGITAL CENTER M&A
// FIREBASE MOBILE
// FASE M3.1
// =====================================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// =====================================================
// CONFIGURACIÓN FIREBASE
// Backend compartido con Digital Center Desktop
// Interfaz y sesión completamente independientes
// =====================================================

const firebaseConfigMobile = {

    apiKey:
        "AIzaSyD_vUmAunFhTZH24SfCZMST5PVRBcAMMNI",

    authDomain:
        "digital-center-mya.firebaseapp.com",

    projectId:
        "digital-center-mya",

    storageBucket:
        "digital-center-mya.firebasestorage.app",

    messagingSenderId:
        "52765537655",

    appId:
        "1:52765537655:web:c0d0f6f5449e3cdc339d72",

    measurementId:
        "G-NLS4F507HM"

};


// =====================================================
// INICIALIZACIÓN SEGURA
// Evita inicializar Firebase dos veces
// =====================================================

const mobileFirebaseApp =
    getApps().length > 0
        ? getApp()
        : initializeApp(
            firebaseConfigMobile
        );

const mobileDB =
    getFirestore(
        mobileFirebaseApp
    );


// =====================================================
// EXPORTACIONES MÓVILES
// Solo exportamos lo necesario para M3
// =====================================================

export {

    mobileFirebaseApp,

    mobileDB,

    collection,

    doc,

    getDoc,

    getDocs,

    onSnapshot,

    query,

    where,

    orderBy,

    limit,

    runTransaction,

    serverTimestamp

};