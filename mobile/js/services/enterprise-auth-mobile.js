// =====================================================
// DIGITAL CENTER M&A
// ENTERPRISE AUTH MOBILE
// CUSTOM CLAIMS SECURITY ENGINE
// FASE S1.3
// =====================================================

import {
    mobileAuth
} from "../firebase-mobile.js";


// =====================================================
// CONSTANTES
// =====================================================

const ROL_ADMIN =
    "admin";

const ROL_VENDEDOR =
    "vendedor";

const VERSION_CLAIMS_DEFAULT =
    0;


// =====================================================
// USUARIO FIREBASE ACTUAL
// =====================================================

function obtenerUsuarioFirebaseActual(){

    return (
        mobileAuth.currentUser ||
        null
    );

}


// =====================================================
// OBTENER TOKEN Y CUSTOM CLAIMS
// =====================================================

async function obtenerTokenEnterpriseMobile(
    forzarActualizacion = false
){

    const usuarioFirebase =
        obtenerUsuarioFirebaseActual();


    if(!usuarioFirebase){

        return null;

    }


    const resultadoToken =
        await usuarioFirebase
            .getIdTokenResult(
                Boolean(
                    forzarActualizacion
                )
            );


    return resultadoToken;

}


async function obtenerClaimsEnterpriseMobile(
    forzarActualizacion = false
){

    const resultadoToken =
        await obtenerTokenEnterpriseMobile(
            forzarActualizacion
        );


    if(!resultadoToken){

        return null;

    }


    return (
        resultadoToken.claims ||
        {}
    );

}


// =====================================================
// NORMALIZACIÓN SEGURA DEL ROL
// =====================================================

function normalizarRolEnterpriseMobile(
    claims = {}
){

    const esAdminValido =
        claims.admin === true &&
        claims.rol === ROL_ADMIN;


    if(esAdminValido){

        return ROL_ADMIN;

    }


    /*
     * PRINCIPIO DE MENOR PRIVILEGIO:
     *
     * Todo usuario autenticado que no posea claims
     * administrativos válidos se considera vendedor.
     *
     * Nunca se concede rol admin por datos locales,
     * Firestore, localStorage o parámetros del frontend.
     */

    return ROL_VENDEDOR;

}


// =====================================================
// CONSTRUIR IDENTIDAD ENTERPRISE
// =====================================================

async function obtenerIdentidadEnterpriseMobile(
    forzarActualizacion = false
){

    const usuarioFirebase =
        obtenerUsuarioFirebaseActual();


    if(!usuarioFirebase){

        return null;

    }


    const claims =
        await obtenerClaimsEnterpriseMobile(
            forzarActualizacion
        );


    if(!claims){

        return null;

    }


    const rol =
        normalizarRolEnterpriseMobile(
            claims
        );


    const admin =
        rol === ROL_ADMIN;


    return {

        uid:
            usuarioFirebase.uid,

        email:
            usuarioFirebase.email ||
            null,

        correo:
            usuarioFirebase.email ||
            null,

        admin,

        rol,

        version:
            Number(
                claims.version ??
                VERSION_CLAIMS_DEFAULT
            ),

        claims

    };

}


// =====================================================
// VALIDACIONES DE IDENTIDAD
// =====================================================

async function esAdministradorEnterpriseMobile(
    forzarActualizacion = false
){

    const identidad =
        await obtenerIdentidadEnterpriseMobile(
            forzarActualizacion
        );


    return (
        identidad?.admin === true &&
        identidad?.rol === ROL_ADMIN
    );

}


async function esVendedorEnterpriseMobile(
    forzarActualizacion = false
){

    const identidad =
        await obtenerIdentidadEnterpriseMobile(
            forzarActualizacion
        );


    return (
        identidad?.rol === ROL_VENDEDOR
    );

}


async function obtenerRolEnterpriseMobile(
    forzarActualizacion = false
){

    const identidad =
        await obtenerIdentidadEnterpriseMobile(
            forzarActualizacion
        );


    return (
        identidad?.rol ||
        null
    );

}


// =====================================================
// REFRESCAR TOKEN
// =====================================================

async function refrescarIdentidadEnterpriseMobile(){

    const usuarioFirebase =
        obtenerUsuarioFirebaseActual();


    if(!usuarioFirebase){

        return null;

    }


    await usuarioFirebase
        .getIdToken(
            true
        );


    return obtenerIdentidadEnterpriseMobile(
        true
    );

}


// =====================================================
// EXPORTACIÓN
// =====================================================

export {

    ROL_ADMIN,

    ROL_VENDEDOR,

    obtenerUsuarioFirebaseActual,

    obtenerTokenEnterpriseMobile,

    obtenerClaimsEnterpriseMobile,

    obtenerIdentidadEnterpriseMobile,

    obtenerRolEnterpriseMobile,

    esAdministradorEnterpriseMobile,

    esVendedorEnterpriseMobile,

    refrescarIdentidadEnterpriseMobile

};