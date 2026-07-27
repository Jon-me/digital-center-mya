// =====================================================
// DIGITAL CENTER M&A
// HISTORIAL MOBILE SERVICE
// M12.4.1
// =====================================================

import {

    mobileDB,

    collection,

    onSnapshot

} from "../firebase-mobile.js";
// =====================================================
// ESTADO
// =====================================================

let historialVentasMobile = [];

let cancelarListenerHistorialMobile = null;

const suscriptoresHistorialMobile =
    new Set();


// =====================================================
// NORMALIZAR
// =====================================================

function normalizarVentaHistorialMobile(
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
            )

    };

}

// =====================================================
// ORDEN COMPATIBLE DESKTOP / MOBILE
// =====================================================

function ordenarVentasHistorialMobile(
    ventaA,
    ventaB
){

    const tiempoA =
        obtenerTiempoVentaHistorialMobile(
            ventaA
        );

    const tiempoB =
        obtenerTiempoVentaHistorialMobile(
            ventaB
        );

    return tiempoB - tiempoA;

}

// =====================================================
// OBTENER TIEMPO REAL DE LA VENTA
// =====================================================

function obtenerTiempoVentaHistorialMobile(
    venta
){

    if(
        venta?.creadaEn &&
        typeof venta.creadaEn.toDate ===
        "function"
    ){

        return venta.creadaEn
            .toDate()
            .getTime();

    }

    if(
        venta?.creadaEn instanceof Date
    ){

        return venta.creadaEn.getTime();

    }

    if(venta?.creadaEn){

        const fechaCreacion =
            new Date(
                venta.creadaEn
            );

        if(
            !Number.isNaN(
                fechaCreacion.getTime()
            )
        ){

            return fechaCreacion.getTime();

        }

    }

    const fechaISO =
        String(
            venta?.fechaISO || ""
        )
        .trim();

    const hora =
        String(
            venta?.hora || ""
        )
        .trim();

    const fechaCompuesta =
        crearFechaVentaHistorialMobile(
            fechaISO,
            hora
        );

    if(fechaCompuesta){

        return fechaCompuesta.getTime();

    }

    return 0;

}

// =====================================================
// CREAR FECHA DESDE fechaISO + hora
// =====================================================

function crearFechaVentaHistorialMobile(
    fechaISO,
    hora
){

    if(
        !/^\d{4}-\d{2}-\d{2}$/.test(
            fechaISO
        )
    ){

        return null;

    }

    const partesFecha =
        fechaISO
        .split("-")
        .map(Number);

    let horas = 0;
    let minutos = 0;
    let segundos = 0;

    const coincidencia12Horas =
        hora.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/i
        );

    if(coincidencia12Horas){

        horas =
            Number(
                coincidencia12Horas[1]
            );

        minutos =
            Number(
                coincidencia12Horas[2]
            );

        segundos =
            Number(
                coincidencia12Horas[3] || 0
            );

        const periodo =
            coincidencia12Horas[4]
            .toLocaleLowerCase("es-PE");

        if(
            periodo === "p" &&
            horas < 12
        ){

            horas += 12;

        }

        if(
            periodo === "a" &&
            horas === 12
        ){

            horas = 0;

        }

    }else{

        const coincidencia24Horas =
            hora.match(
                /(\d{1,2}):(\d{2})(?::(\d{2}))?/
            );

        if(coincidencia24Horas){

            horas =
                Number(
                    coincidencia24Horas[1]
                );

            minutos =
                Number(
                    coincidencia24Horas[2]
                );

            segundos =
                Number(
                    coincidencia24Horas[3] || 0
                );

        }

    }

    const fecha =
        new Date(
            partesFecha[0],
            partesFecha[1] - 1,
            partesFecha[2],
            horas,
            minutos,
            segundos
        );

    return Number.isNaN(
        fecha.getTime()
    )
        ? null
        : fecha;

}

// =====================================================
// EMITIR
// =====================================================

function emitirHistorialMobile(){

    suscriptoresHistorialMobile
        .forEach(function(callback){

            callback(
                historialVentasMobile
            );

        });

}


// =====================================================
// LISTENER
// =====================================================

// =====================================================
// LISTENER REALTIME COMPATIBLE DESKTOP / MOBILE
// =====================================================

function iniciarHistorialMobile(){

    if(
        cancelarListenerHistorialMobile
    ){

        return;

    }

    const referenciaVentas =
        collection(
            mobileDB,
            "ventas"
        );

    cancelarListenerHistorialMobile =
        onSnapshot(

            referenciaVentas,

            function(snapshot){

                historialVentasMobile =
                    snapshot.docs
                    .map(
                        normalizarVentaHistorialMobile
                    )
                    .sort(
                        ordenarVentasHistorialMobile
                    );

                emitirHistorialMobile();

            },

            function(error){

                console.error(
                    "Error escuchando Historial Mobile:",
                    error
                );

            }

        );

}


// =====================================================
// SUSCRIPCIÓN
// =====================================================

export function suscribirHistorialMobile(
    callback
){

    suscriptoresHistorialMobile.add(
        callback
    );

    callback(
        historialVentasMobile
    );

    iniciarHistorialMobile();

    return function(){

        suscriptoresHistorialMobile.delete(
            callback
        );

    };

}


// =====================================================
// CACHE
// =====================================================

export function obtenerHistorialMobile(){

    return historialVentasMobile;

}