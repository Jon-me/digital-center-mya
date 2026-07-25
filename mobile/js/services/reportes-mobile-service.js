// =====================================================
// DIGITAL CENTER M&A
// MOBILE REPORTES SERVICE
// FASE M9.1.1
// ENTERPRISE REPORT ENGINE BASE
// =====================================================

import {

    obtenerVentasHoyCacheMobile,

    suscribirVentasHoyMobile

} from "./ventas-mobile-service.js";


// =====================================================
// ESTADO
// =====================================================

let reporteGeneralMobile =
    crearReporteGeneralVacioMobile();


const suscriptoresReportesMobile =
    new Set();


let cancelarSuscripcionVentasReportesMobile =
    null;


// =====================================================
// UTILIDADES
// =====================================================

function normalizarMontoReporteMobile(
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


    return Number(
        numero.toFixed(
            2
        )
    );

}


function normalizarTextoReporteMobile(
    valor,
    respaldo =
        ""
){

    const texto =
        String(
            valor ||
            respaldo ||
            ""
        )
            .trim();


    return texto || respaldo;

}


function normalizarTiendaReporteMobile(
    tienda
){

    const valor =
        String(
            tienda ||
            "principal"
        )
            .trim()
            .toLowerCase();


    if(
        valor === "sucursal" ||
        valor === "peluqueria" ||
        valor === "peluquería"
    ){

        return "sucursal";

    }


    return "principal";

}


function obtenerNombreTiendaReporteMobile(
    tienda
){

    return (
        normalizarTiendaReporteMobile(
            tienda
        ) === "sucursal"
            ? "Peluquería"
            : "Mercado"
    );

}


// =====================================================
// ESTADO VACÍO
// =====================================================

function crearReporteGeneralVacioMobile(){

    return {

        fechaISO:
            "",

        cantidadVentas:
            0,

        totalVentas:
            0,

        totalIngresos:
            0,

        totalGanancia:
            0,

        ticketPromedio:
            0,

        productosVendidos:
            0,

        ventas:
            [],

        vendedores:
            [],

        tiendas:
            [],

        categorias:
            [],

        metodosPago:
            {

                efectivo:
                    0,

                yape:
                    0,

                plin:
                    0,

                tarjeta:
                    0,

                transferencia:
                    0

            }

    };

}


// =====================================================
// NORMALIZACIÓN DE VENTA
// =====================================================

function normalizarVentaReporteMobile(
    venta = {}
){

    const productos =
        Array.isArray(
            venta.productos
        )
            ? venta.productos.map(
                function(producto){

                    return {

                        id:
                            normalizarTextoReporteMobile(
                                producto?.id
                            ),

                        codigo:
                            normalizarTextoReporteMobile(
                                producto?.codigo
                            ),

                        producto:
                            normalizarTextoReporteMobile(
                                producto?.producto,
                                "Producto"
                            ),

                        categoria:
                            normalizarTextoReporteMobile(
                                producto?.categoria,
                                "Sin categoría"
                            ),

                        cantidad:
                            Math.max(
                                0,
                                Math.trunc(
                                    Number(
                                        producto?.cantidad ||
                                        0
                                    )
                                )
                            ),

                        precio:
                            normalizarMontoReporteMobile(
                                producto?.precio
                            ),

                        precioCompra:
                            normalizarMontoReporteMobile(
                                producto?.precioCompra
                            ),

                        subtotal:
                            normalizarMontoReporteMobile(
                                producto?.subtotal
                            )

                    };

                }
            )
            : [];


    const pagosOriginales =
        venta?.pagos &&
        typeof venta.pagos ===
        "object"
            ? venta.pagos
            : {};


    return {

        ...venta,

        id:
            normalizarTextoReporteMobile(
                venta.id
            ),

        fecha:
            normalizarTextoReporteMobile(
                venta.fecha
            ),

        fechaISO:
            normalizarTextoReporteMobile(
                venta.fechaISO
            ),

        hora:
            normalizarTextoReporteMobile(
                venta.hora
            ),

        vendedor:
            normalizarTextoReporteMobile(
                venta.vendedor,
                "Sin vendedor"
            ),

        usuario:
            normalizarTextoReporteMobile(
                venta.usuario,
                "Sin usuario"
            ),

        tiendaVenta:
            normalizarTiendaReporteMobile(
                venta.tiendaVenta
            ),

        tiendaVentaNombre:
            normalizarTextoReporteMobile(
                venta.tiendaVentaNombre,
                obtenerNombreTiendaReporteMobile(
                    venta.tiendaVenta
                )
            ),

        total:
            normalizarMontoReporteMobile(
                venta.total
            ),

        ganancia:
            normalizarMontoReporteMobile(
                venta.ganancia
            ),

        descuento:
            normalizarMontoReporteMobile(
                venta.descuento
            ),

        productos,

        pagos:
            {

                efectivo:
                    normalizarMontoReporteMobile(
                        pagosOriginales.efectivo
                    ),

                yape:
                    normalizarMontoReporteMobile(
                        pagosOriginales.yape
                    ),

                plin:
                    normalizarMontoReporteMobile(
                        pagosOriginales.plin
                    ),

                tarjeta:
                    normalizarMontoReporteMobile(
                        pagosOriginales.tarjeta
                    ),

                transferencia:
                    normalizarMontoReporteMobile(
                        pagosOriginales.transferencia
                    )

            }

    };

}


// =====================================================
// AGRUPACIÓN POR VENDEDOR
// =====================================================

function calcularReporteVendedoresMobile(
    ventas
){

    const vendedoresMap =
        new Map();


    ventas.forEach(
        function(venta){

            const clave =
                normalizarTextoReporteMobile(
                    venta.usuario,
                    venta.vendedor
                );


            if(
                !vendedoresMap.has(
                    clave
                )
            ){

                vendedoresMap.set(
                    clave,
                    {

                        usuario:
                            venta.usuario,

                        vendedor:
                            venta.vendedor,

                        cantidadVentas:
                            0,

                        totalVendido:
                            0,

                        ganancia:
                            0,

                        productosVendidos:
                            0

                    }
                );

            }


            const registro =
                vendedoresMap.get(
                    clave
                );


            registro.cantidadVentas +=
                1;


            registro.totalVendido =
                normalizarMontoReporteMobile(
                    registro.totalVendido +
                    venta.total
                );


            registro.ganancia =
                normalizarMontoReporteMobile(
                    registro.ganancia +
                    venta.ganancia
                );


            registro.productosVendidos +=
                venta.productos.reduce(
                    function(total, producto){

                        return (
                            total +
                            Number(
                                producto.cantidad ||
                                0
                            )
                        );

                    },
                    0
                );

        }
    );


    return Array.from(
        vendedoresMap.values()
    ).sort(
        function(a, b){

            return (
                b.totalVendido -
                a.totalVendido
            );

        }
    );

}


// =====================================================
// AGRUPACIÓN POR TIENDA
// =====================================================

function calcularReporteTiendasMobile(
    ventas
){

    const tiendasMap =
        new Map();


    ventas.forEach(
        function(venta){

            const tienda =
                normalizarTiendaReporteMobile(
                    venta.tiendaVenta
                );


            if(
                !tiendasMap.has(
                    tienda
                )
            ){

                tiendasMap.set(
                    tienda,
                    {

                        tiendaId:
                            tienda,

                        tiendaNombre:
                            obtenerNombreTiendaReporteMobile(
                                tienda
                            ),

                        cantidadVentas:
                            0,

                        totalVendido:
                            0,

                        ganancia:
                            0,

                        productosVendidos:
                            0

                    }
                );

            }


            const registro =
                tiendasMap.get(
                    tienda
                );


            registro.cantidadVentas +=
                1;


            registro.totalVendido =
                normalizarMontoReporteMobile(
                    registro.totalVendido +
                    venta.total
                );


            registro.ganancia =
                normalizarMontoReporteMobile(
                    registro.ganancia +
                    venta.ganancia
                );


            registro.productosVendidos +=
                venta.productos.reduce(
                    function(total, producto){

                        return (
                            total +
                            Number(
                                producto.cantidad ||
                                0
                            )
                        );

                    },
                    0
                );

        }
    );


    return Array.from(
        tiendasMap.values()
    ).sort(
        function(a, b){

            return (
                b.totalVendido -
                a.totalVendido
            );

        }
    );

}


// =====================================================
// AGRUPACIÓN POR CATEGORÍA
// =====================================================

function calcularReporteCategoriasMobile(
    ventas
){

    const categoriasMap =
        new Map();


    ventas.forEach(
        function(venta){

            venta.productos.forEach(
                function(producto){

                    const categoria =
                        normalizarTextoReporteMobile(
                            producto.categoria,
                            "Sin categoría"
                        );


                    if(
                        !categoriasMap.has(
                            categoria
                        )
                    ){

                        categoriasMap.set(
                            categoria,
                            {

                                categoria,

                                unidadesVendidas:
                                    0,

                                totalVendido:
                                    0,

                                ganancia:
                                    0

                            }
                        );

                    }


                    const registro =
                        categoriasMap.get(
                            categoria
                        );


                    const cantidad =
                        Number(
                            producto.cantidad ||
                            0
                        );


                    const subtotal =
                        normalizarMontoReporteMobile(
                            producto.subtotal ||
                            (
                                producto.precio *
                                cantidad
                            )
                        );


                    const gananciaProducto =
                        normalizarMontoReporteMobile(
                            (
                                producto.precio -
                                producto.precioCompra
                            ) *
                            cantidad
                        );


                    registro.unidadesVendidas +=
                        cantidad;


                    registro.totalVendido =
                        normalizarMontoReporteMobile(
                            registro.totalVendido +
                            subtotal
                        );


                    registro.ganancia =
                        normalizarMontoReporteMobile(
                            registro.ganancia +
                            gananciaProducto
                        );

                }
            );

        }
    );


    return Array.from(
        categoriasMap.values()
    ).sort(
        function(a, b){

            return (
                b.totalVendido -
                a.totalVendido
            );

        }
    );

}


// =====================================================
// MÉTODOS DE PAGO
// =====================================================

function calcularMetodosPagoMobile(
    ventas
){

    const metodosPago = {

        efectivo:
            0,

        yape:
            0,

        plin:
            0,

        tarjeta:
            0,

        transferencia:
            0

    };


    ventas.forEach(
        function(venta){

            Object.keys(
                metodosPago
            ).forEach(
                function(metodo){

                    metodosPago[metodo] =
                        normalizarMontoReporteMobile(
                            metodosPago[metodo] +
                            Number(
                                venta.pagos?.[metodo] ||
                                0
                            )
                        );

                }
            );

        }
    );


    return metodosPago;

}


// =====================================================
// MOTOR PRINCIPAL
// =====================================================

function calcularReporteGeneralMobile(
    ventasOriginales =
        obtenerVentasHoyCacheMobile()
){

    const ventas =
        Array.isArray(
            ventasOriginales
        )
            ? ventasOriginales.map(
                normalizarVentaReporteMobile
            )
            : [];


    const cantidadVentas =
        ventas.length;


    const totalIngresos =
        ventas.reduce(
            function(total, venta){

                return (
                    total +
                    venta.total
                );

            },
            0
        );


    const totalGanancia =
        ventas.reduce(
            function(total, venta){

                return (
                    total +
                    venta.ganancia
                );

            },
            0
        );


    const productosVendidos =
        ventas.reduce(
            function(total, venta){

                return (
                    total +
                    venta.productos.reduce(
                        function(
                            acumulado,
                            producto
                        ){

                            return (
                                acumulado +
                                Number(
                                    producto.cantidad ||
                                    0
                                )
                            );

                        },
                        0
                    )
                );

            },
            0
        );


    const ticketPromedio =
        cantidadVentas > 0
            ? totalIngresos /
              cantidadVentas
            : 0;


    reporteGeneralMobile = {

        fechaISO:
            ventas[0]?.fechaISO ||
            "",

        cantidadVentas,

        totalVentas:
            normalizarMontoReporteMobile(
                totalIngresos
            ),

        totalIngresos:
            normalizarMontoReporteMobile(
                totalIngresos
            ),

        totalGanancia:
            normalizarMontoReporteMobile(
                totalGanancia
            ),

        ticketPromedio:
            normalizarMontoReporteMobile(
                ticketPromedio
            ),

        productosVendidos,

        ventas,

        vendedores:
            calcularReporteVendedoresMobile(
                ventas
            ),

        tiendas:
            calcularReporteTiendasMobile(
                ventas
            ),

        categorias:
            calcularReporteCategoriasMobile(
                ventas
            ),

        metodosPago:
            calcularMetodosPagoMobile(
                ventas
            )

    };


    return obtenerReporteGeneralMobile();

}


// =====================================================
// CONSULTAS PÚBLICAS
// =====================================================

function obtenerReporteGeneralMobile(){

    return {

        ...reporteGeneralMobile,

        ventas:
            reporteGeneralMobile.ventas.map(
                function(venta){

                    return {

                        ...venta,

                        productos:
                            venta.productos.map(
                                function(producto){

                                    return {

                                        ...producto

                                    };

                                }
                            ),

                        pagos:
                            {

                                ...venta.pagos

                            }

                    };

                }
            ),

        vendedores:
            reporteGeneralMobile.vendedores.map(
                function(vendedor){

                    return {

                        ...vendedor

                    };

                }
            ),

        tiendas:
            reporteGeneralMobile.tiendas.map(
                function(tienda){

                    return {

                        ...tienda

                    };

                }
            ),

        categorias:
            reporteGeneralMobile.categorias.map(
                function(categoria){

                    return {

                        ...categoria

                    };

                }
            ),

        metodosPago:
            {

                ...reporteGeneralMobile.metodosPago

            }

    };

}


function obtenerReporteVendedoresMobile(){

    return obtenerReporteGeneralMobile()
        .vendedores;

}


function obtenerReporteTiendasMobile(){

    return obtenerReporteGeneralMobile()
        .tiendas;

}


function obtenerReporteCategoriasMobile(){

    return obtenerReporteGeneralMobile()
        .categorias;

}


// =====================================================
// EMISIÓN REALTIME
// =====================================================

function emitirReporteGeneralMobile(){

    const reporte =
        obtenerReporteGeneralMobile();


    suscriptoresReportesMobile.forEach(
        function(suscriptor){

            try{

                suscriptor.alActualizar?.(
                    reporte
                );

            }catch(error){

                console.error(
                    "Error notificando reporte Mobile:",
                    error
                );

            }

        }
    );

}


function emitirErrorReporteMobile(
    error
){

    suscriptoresReportesMobile.forEach(
        function(suscriptor){

            try{

                suscriptor.alError?.(
                    error
                );

            }catch(errorSuscriptor){

                console.error(
                    "Error notificando fallo de reportes:",
                    errorSuscriptor
                );

            }

        }
    );

}


// =====================================================
// REALTIME ENGINE
// =====================================================

function iniciarReportesRealtimeMobile(){

    if(
        typeof cancelarSuscripcionVentasReportesMobile ===
        "function"
    ){

        return;

    }


    cancelarSuscripcionVentasReportesMobile =
        suscribirVentasHoyMobile(

            function(ventas){

                calcularReporteGeneralMobile(
                    ventas
                );


                emitirReporteGeneralMobile();

            },

            function(error){

                console.error(
                    "Error de ventas en Reportes Mobile:",
                    error
                );


                emitirErrorReporteMobile(
                    error
                );

            }

        );


    calcularReporteGeneralMobile(
        obtenerVentasHoyCacheMobile()
    );

}


// =====================================================
// SUSCRIPCIÓN PÚBLICA
// =====================================================

function suscribirReporteGeneralMobile(
    alActualizar,
    alError
){

    const suscriptor = {

        alActualizar,

        alError

    };


    suscriptoresReportesMobile.add(
        suscriptor
    );


    iniciarReportesRealtimeMobile();


    if(
        typeof alActualizar ===
        "function"
    ){

        alActualizar(
            obtenerReporteGeneralMobile()
        );

    }


    return function cancelar(){

        suscriptoresReportesMobile.delete(
            suscriptor
        );


        if(
            suscriptoresReportesMobile.size ===
            0
        ){

            detenerReportesRealtimeMobile();

        }

    };

}


// =====================================================
// DESTRUCCIÓN
// =====================================================

function detenerReportesRealtimeMobile(){

    if(
        typeof cancelarSuscripcionVentasReportesMobile ===
        "function"
    ){

        cancelarSuscripcionVentasReportesMobile();

    }


    cancelarSuscripcionVentasReportesMobile =
        null;


    reporteGeneralMobile =
        crearReporteGeneralVacioMobile();

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    calcularReporteGeneralMobile,

    obtenerReporteGeneralMobile,

    obtenerReporteVendedoresMobile,

    obtenerReporteTiendasMobile,

    obtenerReporteCategoriasMobile,

    suscribirReporteGeneralMobile,

    iniciarReportesRealtimeMobile,

    detenerReportesRealtimeMobile

};