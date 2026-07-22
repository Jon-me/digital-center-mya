// =====================================================
// DIGITAL CENTER M&A
// CHECKOUT MOBILE SERVICE
// FASE M6.5 - CHECKOUT ENGINE
// =====================================================

import {

    mobileDB,

    collection,

    doc,

    runTransaction,

    serverTimestamp

} from "../firebase-mobile.js";


import {

    obtenerResumenCarritoMobile

} from "./carrito-mobile-service.js";


import {

    obtenerSesionMobile,

    obtenerSucursalMobile

} from "../state-mobile.js";

import {

    cargarSucursalesMobile

} from "./sucursales-mobile-service.js";

// =====================================================
// ESTADO
// =====================================================

let checkoutMobileEnProceso =
    false;


// =====================================================
// UTILIDADES
// =====================================================

function normalizarMontoCheckoutMobile(
    valor
){

    const numero =
        Number(valor || 0);


    if(
        !Number.isFinite(numero) ||
        numero < 0
    ){

        return 0;

    }


    return Number(
        numero.toFixed(2)
    );

}


function redondearMontoCheckoutMobile(
    valor
){

    return Math.round(
        normalizarMontoCheckoutMobile(
            valor
        ) *
        100
    ) / 100;

}

function obtenerFechaISOCheckoutMobile(
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


function obtenerFechaLocalCheckoutMobile(
    fecha =
        new Date()
){

    return fecha.toLocaleDateString(
        "es-PE"
    );

}


function obtenerHoraLocalCheckoutMobile(
    fecha =
        new Date()
){

    return fecha.toLocaleTimeString(
        "es-PE"
    );

}

function construirPagosCheckoutMobile(
    metodoPago,
    total
){

    const pagos = {

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


    if(
        Object.hasOwn(
            pagos,
            metodoPago
        )
    ){

        pagos[metodoPago] =
            redondearMontoCheckoutMobile(
                total
            );

    }


    return pagos;

}

function calcularGananciaCheckoutMobile(
    items,
    descuento =
        0
){

    const gananciaBruta =
        items.reduce(
            function(total, item){

                const precioVenta =
                    normalizarMontoCheckoutMobile(
                        item.precio
                    );

                const precioCompra =
                    normalizarMontoCheckoutMobile(
                        item.precioCompra
                    );

                const cantidad =
                    Math.max(
                        1,
                        Math.trunc(
                            Number(
                                item.cantidad || 1
                            )
                        )
                    );


                return (
                    total +
                    (
                        precioVenta -
                        precioCompra
                    ) *
                    cantidad
                );

            },
            0
        );


    return redondearMontoCheckoutMobile(
        gananciaBruta -
        normalizarMontoCheckoutMobile(
            descuento
        )
    );

}

async function obtenerNombreSucursalCheckoutMobile(
    sucursalId
){

    try{

        const sucursales =
            await cargarSucursalesMobile();


        const sucursal =
            sucursales.find(
                function(item){

                    return (
                        String(item.id) ===
                        String(sucursalId)
                    );

                }
            );


        return String(
            sucursal?.nombre ||
            sucursalId ||
            "Sucursal"
        );

    }catch(error){

        console.warn(
            "No se pudo resolver el nombre de la sucursal:",
            error
        );


        return String(
            sucursalId ||
            "Sucursal"
        );

    }

}

function obtenerStockProductoCheckoutMobile(
    datosProducto,
    sucursalId
){

    const stockTiendas =
        datosProducto?.stockTiendas &&
        typeof datosProducto.stockTiendas ===
        "object"
            ? datosProducto.stockTiendas
            : {};


    return Math.max(
        0,
        Math.trunc(
            Number(
                stockTiendas[
                    sucursalId
                ] || 0
            )
        )
    );

}


function validarCarritoCheckoutMobile(
    resumen
){

    if(
        !resumen ||
        !Array.isArray(resumen.items) ||
        resumen.items.length === 0
    ){

        throw new Error(
            "La venta no tiene productos."
        );

    }


    if(
        !Number.isFinite(
            Number(resumen.total)
        ) ||
        Number(resumen.total) <= 0
    ){

        throw new Error(
            "El total de la venta no es válido."
        );

    }


    resumen.items.forEach(
        function(item){

            if(!item?.id){

                throw new Error(
                    "Uno de los productos no tiene un ID válido."
                );

            }


            if(
                !Number.isFinite(
                    Number(item.cantidad)
                ) ||
                Number(item.cantidad) <= 0
            ){

                throw new Error(
                    `La cantidad de "${item.producto}" no es válida.`
                );

            }


            if(
                !Number.isFinite(
                    Number(item.precio)
                ) ||
                Number(item.precio) < 0
            ){

                throw new Error(
                    `El precio de "${item.producto}" no es válido.`
                );

            }

        }
    );


    return true;

}


// =====================================================
// CONSTRUCCIÓN DE VENTA
// =====================================================

function construirDetalleVentaCheckoutMobile(
    item
){

    const cantidad =
        Math.max(
            1,
            Math.trunc(
                Number(
                    item.cantidad || 1
                )
            )
        );


    const precio =
        normalizarMontoCheckoutMobile(
            item.precio
        );


    const precioCompra =
        normalizarMontoCheckoutMobile(
            item.precioCompra
        );


    return {

        id:
            String(item.id),

        codigo:
            String(
                item.codigo || ""
            ),

        producto:
            String(
                item.producto ||
                "Producto"
            ),

        categoria:
            String(
                item.categoria ||
                "Sin categoría"
            ),

        imagen:
            String(
                item.imagen || ""
            ),

        cantidad,

        precio,

        precioCompra,

        subtotal:
            redondearMontoCheckoutMobile(
                precio *
                cantidad
            )

    };

}


function construirVentaCheckoutMobile(
    opciones
){

    const {

        resumen,

        metodoPago,

        recibido =
            resumen.total,

        vuelto =
            0,

        tiendaVentaNombre =
            "Sucursal",

        clienteNombre =
            "CLIENTE GENERAL",

        clienteDni =
            "-",

        descuento =
            0

    } = opciones;


    const usuario =
        obtenerSesionMobile();


    const tiendaVenta =
        obtenerSucursalMobile();


    const ahora =
        new Date();


    const productos =
        resumen.items.map(
            construirDetalleVentaCheckoutMobile
        );


    const totalFinal =
        redondearMontoCheckoutMobile(
            resumen.total
        );


    const pagos =
        construirPagosCheckoutMobile(
            metodoPago,
            totalFinal
        );


    return {

        numeroBoleta:
            "SIN IMPRESION",

        fecha:
            obtenerFechaLocalCheckoutMobile(
                ahora
            ),

        fechaISO:
            obtenerFechaISOCheckoutMobile(
                ahora
            ),

        hora:
            obtenerHoraLocalCheckoutMobile(
                ahora
            ),

        clienteNombre:
            String(
                clienteNombre ||
                "CLIENTE GENERAL"
            ),

        clienteDni:
            String(
                clienteDni ||
                "-"
            ),

        vendedor:
            String(
                usuario?.nombreCompleto ||
                usuario?.usuario ||
                "Sin vendedor"
            ),

        usuario:
            String(
                usuario?.usuario ||
                "Sin usuario"
            ),

        sucursalUsuario:
            String(
                tiendaVenta ||
                "principal"
            ),

        productos,

        descuento:
            normalizarMontoCheckoutMobile(
                descuento
            ),

        metodoPago:
            "Pagos mixtos",

        tiendaVenta:
            String(
                tiendaVenta ||
                "principal"
            ),

        tiendaVentaNombre:
            String(
                tiendaVentaNombre ||
                tiendaVenta ||
                "Sucursal"
            ),

        pagos,

        total:
            totalFinal,

        ganancia:
            calcularGananciaCheckoutMobile(
                productos,
                descuento
            ),

        origen:
            "mobile",

        recibido:
            redondearMontoCheckoutMobile(
                recibido
            ),

        vuelto:
            redondearMontoCheckoutMobile(
                vuelto
            ),

        creadaEn:
            serverTimestamp()

    };

}


// =====================================================
// REGISTRO TRANSACCIONAL
// =====================================================

async function registrarVentaMobile(
    opciones = {}
){

    if(checkoutMobileEnProceso){

        return {

            completada:
                false,

            motivo:
                "checkout-en-proceso",

            mensaje:
                "Ya se está procesando una venta."

        };

    }


    checkoutMobileEnProceso =
        true;


    try{

        const resumen =
            obtenerResumenCarritoMobile();


        validarCarritoCheckoutMobile(
            resumen
        );


        const metodoPago =
            String(
                opciones.metodoPago ||
                "efectivo"
            );


        const recibido =
            normalizarMontoCheckoutMobile(
                opciones.recibido ??
                resumen.total
            );


        const vuelto =
            normalizarMontoCheckoutMobile(
                opciones.vuelto || 0
            );


        if(
            metodoPago === "efectivo" &&
            recibido < resumen.total
        ){

            throw new Error(
                "El monto recibido no cubre el total."
            );

        }


        const sucursalId =
            obtenerSucursalMobile();

        const tiendaVentaNombre =
            await obtenerNombreSucursalCheckoutMobile(
                sucursalId
            );    

        const ventaRef =
            doc(
                collection(
                    mobileDB,
                    "ventas"
                )
            );


        const resultado =
            await runTransaction(
                mobileDB,
                async function(transaccion){

                    const lecturas =
                        await Promise.all(
                            resumen.items.map(
                                async function(item){

                                    const productoRef =
                                        doc(
                                            mobileDB,
                                            "productos",
                                            String(item.id)
                                        );


                                    const snapshot =
                                        await transaccion.get(
                                            productoRef
                                        );


                                    return {

                                        item,

                                        productoRef,

                                        snapshot

                                    };

                                }
                            )
                        );


                    lecturas.forEach(
                        function(registro){

                            if(
                                !registro.snapshot.exists()
                            ){

                                throw new Error(
                                    `El producto "${registro.item.producto}" ya no existe.`
                                );

                            }


                            const datosProducto =
                                registro.snapshot.data();


                            const stockActual =
                                obtenerStockProductoCheckoutMobile(
                                    datosProducto,
                                    sucursalId
                                );


                            const cantidad =
                                Math.max(
                                    1,
                                    Math.trunc(
                                        Number(
                                            registro.item.cantidad ||
                                            1
                                        )
                                    )
                                );


                            if(stockActual < cantidad){

                                throw new Error(
                                    `Stock insuficiente para "${registro.item.producto}". Disponible: ${stockActual}.`
                                );

                            }

                        }
                    );


                    lecturas.forEach(
                        function(registro){

                            const datosProducto =
                                registro.snapshot.data();


                            const stockTiendas = {

                                ...(
                                    datosProducto.stockTiendas ||
                                    {}
                                )

                            };


                            const stockActual =
                                obtenerStockProductoCheckoutMobile(
                                    datosProducto,
                                    sucursalId
                                );


                            const cantidad =
                                Math.max(
                                    1,
                                    Math.trunc(
                                        Number(
                                            registro.item.cantidad ||
                                            1
                                        )
                                    )
                                );


                            stockTiendas[sucursalId] =
                                stockActual -
                                cantidad;


                            const stockTotal =
                                Object
                                    .values(
                                        stockTiendas
                                    )
                                    .reduce(
                                        function(total, stock){

                                            return (
                                                total +
                                                Math.max(
                                                    0,
                                                    Number(stock || 0)
                                                )
                                            );

                                        },
                                        0
                                    );


                            transaccion.update(
                                registro.productoRef,
                                {

                                    stockTiendas,

                                    stock:
                                        stockTotal

                                }
                            );

                        }
                    );


const venta =
    construirVentaCheckoutMobile({

        resumen,

        metodoPago,

        recibido,

        vuelto,

        tiendaVentaNombre,

        clienteNombre:
            opciones.clienteNombre,

        clienteDni:
            opciones.clienteDni,

        descuento:
            opciones.descuento

    });


                    transaccion.set(
                        ventaRef,
                        venta
                    );


                    return {

                        ventaId:
                            ventaRef.id,

                        venta

                    };

                }
            );  

        return {

            completada:
                true,

            motivo:
                "venta-registrada",

            ventaId:
                resultado.ventaId,

            venta:
                resultado.venta

        };

    }catch(error){

console.error(
    "🔥 CHECKOUT MOBILE ERROR 🔥"
);

console.error(error);

console.error(error?.message);

console.error(error?.stack);


        return {

            completada:
                false,

            motivo:
                "error-checkout",

            mensaje:
                error?.message ||
                "No se pudo registrar la venta.",

            error

        };

    }finally{

        checkoutMobileEnProceso =
            false;

    }

}


// =====================================================
// CONSULTAS
// =====================================================

function estaCheckoutMobileEnProceso(){

    return checkoutMobileEnProceso;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    registrarVentaMobile,

    estaCheckoutMobileEnProceso

};