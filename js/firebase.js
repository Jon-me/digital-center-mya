// =====================================================
// DIGITAL CENTER M&A
// FIREBASE MODULE
// FASE 2
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    runTransaction,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyD_vUmAunFhTZH24SfCZMST5PVRBcAMMNI",
    authDomain: "digital-center-mya.firebaseapp.com",
    projectId: "digital-center-mya",
    storageBucket: "digital-center-mya.firebasestorage.app",
    messagingSenderId: "52765537655",
    appId: "1:52765537655:web:c0d0f6f5449e3cdc339d72",
    measurementId: "G-NLS4F507HM"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const messaging = getMessaging(app);

const storage = getStorage(app);

const auth = getAuth(app);

const vapidKey = "BMSTa3aFp4Te9aFTFhFGAxlnKeGnmsry8TtLBfBQNs6BjWEvefmyR3chrKuPzLwb4FqPkz0oFFI3lgD5l21infE";

export {
    app,
    db,
    messaging,
    storage,
    auth,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    vapidKey,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    runTransaction,
    query,
    where,
    getDocs,
    getToken,
    onMessage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};