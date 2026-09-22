// =====================================================
// DIGITAL CENTER M&A
// NOTIFICACIONES MOBILE SERVICE
// FIREBASE CLOUD MESSAGING
// =====================================================

import {

    mobileDB,
    mobileMessaging,
    mobileVapidKey,

    doc,
    setDoc,
    deleteDoc,

    getToken,
    deleteToken

} from "../firebase-mobile.js";


const CLAVE_NOTIFICACIONES_MOBILE =
    "mobileNotificacionesActivas";


const CLAVE_TOKEN_NOTIFICACIONES_MOBILE =
    "mobileTokenNotificaciones";


/**
 * Devuelve el nombre del usuario activo sin modificar
 * ningún dato de sesión.
 */
function obtenerNombreUsuarioMobile(){

    return (
        localStorage.getItem(
            "mobileNombreActivo"
        ) ||
        localStorage.getItem(
            "mobileUsuarioActivo"
        ) ||
        "Sin usuario"
    );

}


/**
 * Indica si este dispositivo tiene las notificaciones
 * marcadas como activas.
 */
export function obtenerEstadoNotificacionesMobile(){

    const activas =
        localStorage.getItem(
            CLAVE_NOTIFICACIONES_MOBILE
        ) === "true";


    const permiso =
        ("Notification" in window)
            ? Notification.permission
            : "unsupported";


    return {

        activas:
            activas &&
            permiso === "granted",

        permiso

    };

}


/**
 * Activa las notificaciones en este dispositivo.
 *
 * - Solicita permiso al navegador.
 * - Registra el service worker oficial de Firebase.
 * - Obtiene el token FCM.
 * - Guarda el token en Firestore.
 */
export async function activarNotificacionesMobile(){

    if(!("Notification" in window)){

        throw new Error(
            "Este navegador no soporta notificaciones."
        );

    }


    if(!("serviceWorker" in navigator)){

        throw new Error(
            "Este navegador no soporta service workers."
        );

    }


    const permiso =
        await Notification.requestPermission();


    if(permiso !== "granted"){

        localStorage.setItem(
            CLAVE_NOTIFICACIONES_MOBILE,
            "false"
        );


        throw new Error(
            "El permiso de notificaciones no fue concedido."
        );

    }


    const registration =
        await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            {
                scope: "/"
            }
        );


    await navigator.serviceWorker.ready;


    const token =
        await getToken(
            mobileMessaging,
            {
                vapidKey:
                    mobileVapidKey,

                serviceWorkerRegistration:
                    registration
            }
        );


    if(!token){

        throw new Error(
            "Firebase no devolvió un token de notificaciones."
        );

    }


    await setDoc(
        doc(
            mobileDB,
            "tokensNotificaciones",
            token
        ),
        {
            token,

            usuario:
                obtenerNombreUsuarioMobile(),

            fecha:
                new Date().toISOString(),

            plataforma:
                "mobile"
        },
        {
            merge: true
        }
    );


    localStorage.setItem(
        CLAVE_TOKEN_NOTIFICACIONES_MOBILE,
        token
    );


    localStorage.setItem(
        CLAVE_NOTIFICACIONES_MOBILE,
        "true"
    );


    return {

        ok: true,

        activas: true,

        permiso,

        token

    };

}


/**
 * Desactiva las notificaciones únicamente
 * para este navegador/dispositivo.
 *
 * No cierra sesión.
 * No borra carrito.
 * No modifica inventario.
 */
export async function desactivarNotificacionesMobile(){

    const tokenGuardado =
        localStorage.getItem(
            CLAVE_TOKEN_NOTIFICACIONES_MOBILE
        );


    if(tokenGuardado){

        await deleteDoc(
            doc(
                mobileDB,
                "tokensNotificaciones",
                tokenGuardado
            )
        );

    }


    try{

        await deleteToken(
            mobileMessaging
        );

    }catch(error){

        console.warn(
            "[Notificaciones Mobile] No se pudo eliminar el token FCM local:",
            error
        );

    }


    localStorage.removeItem(
        CLAVE_TOKEN_NOTIFICACIONES_MOBILE
    );


    localStorage.setItem(
        CLAVE_NOTIFICACIONES_MOBILE,
        "false"
    );


    return {

        ok: true,

        activas: false,

        permiso:
            ("Notification" in window)
                ? Notification.permission
                : "unsupported"

    };

}