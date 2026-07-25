// =====================================================
// DIGITAL CENTER M&A
// ADMIN AUTHORIZATION ENGINE
// MOBILE
// M7.3.8.1
// =====================================================

import {

    mobileDB,

    collection,

    getDocs

}
from "../firebase-mobile.js";


// =====================================================
// ESTADO
// =====================================================

let autorizacionEnProceso =
    false;


// =====================================================
// CONSULTA DE ADMINISTRADORES
// =====================================================

async function validarCredencialesAdministradorMobile({

    usuario = "",

    password = ""

} = {}){

    const usuarioNormalizado =
        String(usuario)
            .trim()
            .toLowerCase();

    const passwordNormalizada =
        String(password)
            .trim();

    if(
        !usuarioNormalizado ||
        !passwordNormalizada
    ){

        return {

            autorizado:
                false,

            mensaje:
                "Complete usuario y contraseña."

        };

    }

    const snapshot =
        await getDocs(

            collection(

                mobileDB,

                "usuarios"

            )

        );

    let administrador =
        null;

    snapshot.forEach(function(documento){

        const datos =
            documento.data() || {};

        const usuarioDocumento =
            String(
                datos.usuario ||
                documento.id ||
                ""
            )
            .trim()
            .toLowerCase();

        const passwordDocumento =
            String(
                datos.password ||
                ""
            );

        const rol =
            String(
                datos.rol ||
                ""
            )
            .trim()
            .toLowerCase();

        if(

            usuarioDocumento ===
            usuarioNormalizado &&

            passwordDocumento ===
            passwordNormalizada &&

            rol ===
            "admin"

        ){

            administrador = {

                usuario:
                    datos.usuario,

                nombre:
                    datos.nombreCompleto ||
                    datos.usuario

            };

        }

    });

    if(!administrador){

        return {

            autorizado:
                false,

            mensaje:
                "Credenciales administrativas inválidas."

        };

    }

    return {

        autorizado:
            true,

        administrador

    };

}


// =====================================================
// ESTADO
// =====================================================

function autorizacionAdminEnProcesoMobile(){

    return autorizacionEnProceso;

}


function establecerAutorizacionEnProcesoMobile(

    estado

){

    autorizacionEnProceso =
        Boolean(
            estado
        );

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    validarCredencialesAdministradorMobile,

    autorizacionAdminEnProcesoMobile,

    establecerAutorizacionEnProcesoMobile

};