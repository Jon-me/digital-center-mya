// =====================================================
// DIGITAL CENTER M&A
// MOBILE DASHBOARD SERVICE
// FASE M7.1 - REALTIME DASHBOARD ENGINE
// =====================================================

import {

    obtenerResumenCarritoMobile,

    suscribirCarritoMobile

} from "./carrito-mobile-service.js";


import {

    obtenerProductosCacheMobile,

    suscribirProductosMobile

} from "./productos-mobile-service.js";


import {

    obtenerVentasSucursalHoyMobile,

    suscribirVentasHoyMobile

} from "./ventas-mobile-service.js";


// =====================================================
// ESTADO
// =====================================================

let cancelarDashboardRealtimeMobile =
    null;

const suscriptoresDashboardMobile =
    new Set();


// =====================================================
// UTILIDADES
// =====================================================

function redondearDashboardMobile(
    valor
){

    const numero =
        Number(
            valor || 0
        );


    if(
        !Number.isFinite(
            numero
        )
    ){

        return 0;

    }


    return Math.round(
        numero * 100
    ) / 100;

}


function obtenerStockTotalDashboardMobile(
    producto
){

    const stockTiendas =
        producto?.stockTiendas &&
        typeof producto.stockTiendas ===
        "object"
            ? producto.stockTiendas
            : {};


    const valoresStock =
        Object.values(
            stockTiendas
        );


    if(
        valoresStock.length > 0
    ){

        return valoresStock.reduce(
            function(total, cantidad){

                return (
                    total +
                    Math.max(
                        0,
                        Number(
                            cantidad || 0
                        )
                    )
                );

            },
            0
        );

    }


    return Math.max(
        0,
        Number(
            producto?.stock || 0
        )
    );

}


// =====================================================
// CÁLCULO DEL DASHBOARD
// =====================================================

function calcularDashboardMobile(){

    const carrito =
        obtenerResumenCarritoMobile();


    const productos =
        obtenerProductosCacheMobile();


    const ventasHoy =
        obtenerVentasSucursalHoyMobile();


    const totalVentasHoy =
        ventasHoy.reduce(
            function(total, venta){

                return (
                    total +
                    Number(
                        venta.total || 0
                    )
                );

            },
            0
        );


    const gananciaHoy =
        ventasHoy.reduce(
            function(total, venta){

                return (
                    total +
                    Number(
                        venta.ganancia || 0
                    )
                );

            },
            0
        );


    const cantidadVentasHoy =
        ventasHoy.length;


    const ticketPromedio =
        cantidadVentasHoy > 0
            ? (
                totalVentasHoy /
                cantidadVentasHoy
            )
            : 0;


    const stockCritico =
        productos.filter(
            function(producto){

                const stock =
                    obtenerStockTotalDashboardMobile(
                        producto
                    );


                return (
                    stock > 0 &&
                    stock <= 5
                );

            }
        ).length;


    const productosSinStock =
        productos.filter(
            function(producto){

                return (
                    obtenerStockTotalDashboardMobile(
                        producto
                    ) <= 0
                );

            }
        ).length;


    const ultimaVenta =
        ventasHoy.length > 0
            ? ventasHoy.reduce(
                function(ultima, venta){

                    if(!ultima){

                        return venta;

                    }


                    const horaVenta =
                        String(
                            venta.hora || ""
                        );

                    const horaUltima =
                        String(
                            ultima.hora || ""
                        );


                    return horaVenta >
                        horaUltima
                            ? venta
                            : ultima;

                },
                null
            )
            : null;


    return {

        ventasHoy:
            redondearDashboardMobile(
                totalVentasHoy
            ),

        gananciaHoy:
            redondearDashboardMobile(
                gananciaHoy
            ),

        cantidadVentasHoy,

        ticketPromedio:
            redondearDashboardMobile(
                ticketPromedio
            ),

        productos:
            productos.length,

        stockCritico,

        productosSinStock,

        ventaActual:
            redondearDashboardMobile(
                carrito.total
            ),

        unidadesCarrito:
            Number(
                carrito.cantidad || 0
            ),

        ultimaVenta

    };

}


// =====================================================
// EMISIÓN
// =====================================================

function emitirDashboardMobile(){

    const dashboard =
        calcularDashboardMobile();


    suscriptoresDashboardMobile
        .forEach(
            function(suscriptor){

                if(
                    typeof suscriptor.alActualizar ===
                    "function"
                ){

                    suscriptor.alActualizar(
                        dashboard
                    );

                }

            }
        );

}


function emitirErrorDashboardMobile(
    error
){

    suscriptoresDashboardMobile
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
// MOTOR REALTIME
// =====================================================

function iniciarDashboardRealtimeMobile(){

    if(
        typeof cancelarDashboardRealtimeMobile ===
        "function"
    ){

        return;

    }


    const cancelaciones =
        [];


    const cancelarCarrito =
        suscribirCarritoMobile(
            emitirDashboardMobile
        );


    if(
        typeof cancelarCarrito ===
        "function"
    ){

        cancelaciones.push(
            cancelarCarrito
        );

    }


    const cancelarProductos =
        suscribirProductosMobile(

            emitirDashboardMobile,

            function(error){

                console.error(
                    "Error de productos en Dashboard Mobile:",
                    error
                );


                emitirErrorDashboardMobile(
                    error
                );

            }

        );


    if(
        typeof cancelarProductos ===
        "function"
    ){

        cancelaciones.push(
            cancelarProductos
        );

    }


    const cancelarVentas =
        suscribirVentasHoyMobile(

            emitirDashboardMobile,

            function(error){

                console.error(
                    "Error de ventas en Dashboard Mobile:",
                    error
                );


                emitirErrorDashboardMobile(
                    error
                );

            }

        );


    if(
        typeof cancelarVentas ===
        "function"
    ){

        cancelaciones.push(
            cancelarVentas
        );

    }


    cancelarDashboardRealtimeMobile =
        function cancelarTodo(){

            cancelaciones.forEach(
                function(cancelar){

                    try{

                        cancelar();

                    }catch(error){

                        console.warn(
                            "No se pudo cancelar una suscripción del Dashboard Mobile:",
                            error
                        );

                    }

                }
            );

        };


    emitirDashboardMobile();

}


// =====================================================
// SUSCRIPCIÓN PÚBLICA
// =====================================================

function suscribirDashboardMobile(
    alActualizar,
    alError
){

    const suscriptor = {

        alActualizar,

        alError

    };


    suscriptoresDashboardMobile.add(
        suscriptor
    );


    iniciarDashboardRealtimeMobile();


    if(
        typeof alActualizar ===
        "function"
    ){

        alActualizar(
            calcularDashboardMobile()
        );

    }


    return function cancelar(){

        suscriptoresDashboardMobile.delete(
            suscriptor
        );


        if(
            suscriptoresDashboardMobile.size ===
            0
        ){

            destruirDashboardRealtimeMobile();

        }

    };

}


// =====================================================
// DESTRUCCIÓN
// =====================================================

function destruirDashboardRealtimeMobile(){

    if(
        typeof cancelarDashboardRealtimeMobile ===
        "function"
    ){

        cancelarDashboardRealtimeMobile();

    }


    cancelarDashboardRealtimeMobile =
        null;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    calcularDashboardMobile,

    suscribirDashboardMobile,

    destruirDashboardRealtimeMobile

};