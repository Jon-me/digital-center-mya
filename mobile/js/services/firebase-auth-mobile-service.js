// =====================================================
// DIGITAL CENTER M&A
// FIREBASE AUTH MOBILE SERVICE
// M13.2 ENTERPRISE AUTHENTICATION MOBILE
// =====================================================

import {

    mobileAuth,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged

} from "../firebase-mobile.js";


function normalizarUsuario(
    usuario
){

    return String(
        usuario || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

}


function construirCorreoTecnico(
    usuario
){

    const usuarioNormalizado =
        normalizarUsuario(
            usuario
        );


    if(!usuarioNormalizado){

        throw new Error(
            "El nombre de usuario es obligatorio."
        );

    }


    if(
        usuarioNormalizado.includes("@")
    ){

        return usuarioNormalizado;

    }


    return (
        usuarioNormalizado +
        "@digitalcentermya.app"
    );

}


export async function iniciarSesionFirebase(
    usuario,
    password
){

    const correoTecnico =
        construirCorreoTecnico(
            usuario
        );


    const passwordNormalizado =
        String(
            password || ""
        ).trim();


    const credenciales =
        await signInWithEmailAndPassword(
            mobileAuth,
            correoTecnico,
            passwordNormalizado
        );


    return credenciales.user;

}


export async function cerrarSesionFirebase(){

    await signOut(
        mobileAuth
    );

}


export function observarSesionFirebase(
    callback
){

    return onAuthStateChanged(
        mobileAuth,
        callback
    );

}


export function obtenerUsuarioFirebase(){

    return (
        mobileAuth.currentUser ||
        null
    );

}


export {

    normalizarUsuario,

    construirCorreoTecnico

};