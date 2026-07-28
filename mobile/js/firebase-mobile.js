// =====================================================
// DIGITAL CENTER M&A
// FIREBASE MOBILE
// FIRESTORE + STORAGE + AUTHENTICATION
// =====================================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    onSnapshot,
    query,
    where,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";


const firebaseConfig = {

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


const mobileFirebaseApp =
    getApps().length
        ? getApp()
        : initializeApp(
            firebaseConfig
        );


const mobileDB =
    getFirestore(
        mobileFirebaseApp
    );


const mobileStorage =
    getStorage(
        mobileFirebaseApp
    );


const mobileAuth =
    getAuth(
        mobileFirebaseApp
    );


export {

    mobileFirebaseApp,

    mobileDB,

    mobileStorage,

    mobileAuth,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    collection,

    doc,

    getDoc,

    getDocs,

    addDoc,

    updateDoc,

    onSnapshot,

    query,

    where,

    runTransaction,

    serverTimestamp,

    ref,

    uploadBytes,

    getDownloadURL,

    deleteObject

};