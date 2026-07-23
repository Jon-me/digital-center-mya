// =====================================================
// DIGITAL CENTER M&A
// MOBILE VENTAS REALTIME SERVICE
// FASE M7.1
// =====================================================

import {

    mobileDB,

    collection,

    onSnapshot,

    query,

    where

} from "../firebase-mobile.js";


import {

    obtenerSucursalMobile

} from "../state-mobile.js";


// =====================================================
// ESTADO
// =====================================================

let ventasHoyCacheMobile =
    [];

let cancelarListenerVentasMobile =
    null;

const suscriptoresVentasMobile =
    new Set();


// =====================================================
// FECHA
// =====================================================

function obtenerFechaISOVentasMobile(
    fecha =
        new Date()
){

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${anio}-${mes}-${dia}`;

}


// =====================================================
// NORMALIZACIÓN
// =====================================================

function normalizarVentaMobile(
    documento
){

    const datos =
        documento.data();


    return {

        id:
            documento.id,

        ...datos,

        total:
            Number(
                datos.total || 0
            ),

        ganancia:
            Number(
                datos.ganancia || 0
            ),

        tiendaVenta:
            String(
                datos.tiendaVenta ||
                "principal"
            )

    };

}


// =====================================================
// EMISIÓN
// =====================================================

function emitirVentasMobile(){

    suscriptoresVentasMobile
        .forEach(
            function(suscriptor){

                if(
                    typeof suscriptor.alActualizar ===
                    "function"
                ){

                    suscriptor.alActualizar(
                        ventasHoyCacheMobile
                    );

                }

            }
        );

}


function emitirErrorVentasMobile(
    error
){

    suscriptoresVentasMobile
        .forEach(
            function(suscriptor){

                if(
                    typeof suscriptor.alError ===
                    "function"
                ){

                    suscriptor.alError(
                        error
                    );

                }

            }
        );

}


// =====================================================
// LISTENER FIRESTORE
// =====================================================

function iniciarListenerVentasMobile(){

    if(
        typeof cancelarListenerVentasMobile ===
        "function"
    ){

        return;

    }


    const fechaHoy =
        obtenerFechaISOVentasMobile();


    const consultaVentas =
        query(

            collection(
                mobileDB,
                "ventas"
            ),

            where(
                "fechaISO",
                "==",
                fechaHoy
            )

        );


    cancelarListenerVentasMobile =
        onSnapshot(

            consultaVentas,

            function(snapshot){

                ventasHoyCacheMobile =
                    snapshot.docs.map(
                        normalizarVentaMobile
                    );


                emitirVentasMobile();

            },

            function(error){

                console.error(
                    "Error escuchando ventas móviles:",
                    error
                );


                emitirErrorVentasMobile(
                    error
                );

            }

        );

}


// =====================================================
// SUSCRIPCIÓN PÚBLICA
// =====================================================

function suscribirVentasHoyMobile(
    alActualizar,
    alError
){

    const suscriptor = {

        alActualizar,

        alError

    };


    suscriptoresVentasMobile.add(
        suscriptor
    );


    if(
        ventasHoyCacheMobile.length > 0 &&
        typeof alActualizar ===
        "function"
    ){

        alActualizar(
            ventasHoyCacheMobile
        );

    }


    iniciarListenerVentasMobile();


    return function cancelar(){

        suscriptoresVentasMobile.delete(
            suscriptor
        );


        if(
            suscriptoresVentasMobile.size ===
            0
        ){

            destruirSuscripcionVentasMobile();

        }

    };

}


// =====================================================
// CONSULTAS
// =====================================================

function obtenerVentasHoyCacheMobile(){

    return ventasHoyCacheMobile;

}


function obtenerVentasSucursalHoyMobile(){

    const sucursalActiva =
        String(
            obtenerSucursalMobile() ||
            "principal"
        );


    return ventasHoyCacheMobile.filter(
        function(venta){

            return (
                String(
                    venta.tiendaVenta ||
                    "principal"
                ) ===
                sucursalActiva
            );

        }
    );

}


// =====================================================
// DESTRUCCIÓN
// =====================================================

function destruirSuscripcionVentasMobile(){

    if(
        typeof cancelarListenerVentasMobile ===
        "function"
    ){

        cancelarListenerVentasMobile();

    }


    cancelarListenerVentasMobile =
        null;

    ventasHoyCacheMobile =
        [];

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    suscribirVentasHoyMobile,

    obtenerVentasHoyCacheMobile,

    obtenerVentasSucursalHoyMobile,

    destruirSuscripcionVentasMobile

};