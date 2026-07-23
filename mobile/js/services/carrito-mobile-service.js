// =====================================================
// DIGITAL CENTER M&A
// CARRITO MOBILE SERVICE
// FASE M7.2.2
// STOCK SEGÚN TIENDA DE VENTA
// =====================================================

import {

    obtenerTiendaVentaMobile,
    obtenerNombreTiendaVentaMobile

} from "../state-mobile.js";


const CLAVE_CARRITO_MOBILE =
    "mobileCarrito";


let carritoMobile =
    [];


const listenersCarritoMobile =
    new Set();


// =====================================================
// UTILIDADES
// =====================================================

function normalizarNumeroCarritoMobile(
    valor
){

    const numero =
        Number(valor || 0);

    return Number.isFinite(numero)
        ? numero
        : 0;

}


function normalizarCantidadCarritoMobile(
    valor
){

    return Math.max(
        1,
        Math.trunc(
            normalizarNumeroCarritoMobile(
                valor
            )
        )
    );

}


// =====================================================
// STOCK SEGÚN TIENDA DE VENTA
// =====================================================

function obtenerStockSucursalProductoMobile(
    producto,
    sucursalId =
        obtenerTiendaVentaMobile()
){

    const tiendaVenta =
        String(
            sucursalId ||
            obtenerTiendaVentaMobile() ||
            "principal"
        );


    const stockTiendas =
        producto?.stockTiendas &&
        typeof producto.stockTiendas ===
        "object"
            ? producto.stockTiendas
            : {};


    return Math.max(
        0,
        Math.trunc(
            normalizarNumeroCarritoMobile(
                stockTiendas[
                    tiendaVenta
                ]
            )
        )
    );

}


function obtenerStockDisponibleCarritoMobile(
    producto,
    opciones = {}
){

    const {

        sucursalId =
            obtenerTiendaVentaMobile(),

        descontarCantidadActual =
            false

    } = opciones;


    const tiendaVenta =
        String(
            sucursalId ||
            obtenerTiendaVentaMobile() ||
            "principal"
        );


    const stockSucursal =
        obtenerStockSucursalProductoMobile(
            producto,
            tiendaVenta
        );


    if(!descontarCantidadActual){

        return stockSucursal;

    }


    const productoId =
        String(
            producto?.id || ""
        );


    const itemExistente =
        carritoMobile.find(
            function(item){

                return item.id === productoId;

            }
        );


    const cantidadActual =
        itemExistente
            ? normalizarCantidadCarritoMobile(
                itemExistente.cantidad
            )
            : 0;


    return Math.max(
        0,
        stockSucursal -
        cantidadActual
    );

}


function validarCantidadContraStockCarritoMobile(
    producto,
    cantidadDeseada,
    opciones = {}
){

    const {

        sucursalId =
            obtenerTiendaVentaMobile()

    } = opciones;


    const tiendaVenta =
        String(
            sucursalId ||
            obtenerTiendaVentaMobile() ||
            "principal"
        );


    const cantidad =
        normalizarCantidadCarritoMobile(
            cantidadDeseada
        );


    const stockDisponible =
        obtenerStockSucursalProductoMobile(
            producto,
            tiendaVenta
        );


    return {

        valida:
            stockDisponible > 0 &&
            cantidad <= stockDisponible,

        cantidad,

        stockDisponible,

        sucursalId:
            tiendaVenta,

        tiendaVenta,

        nombreTienda:
            tiendaVenta === "sucursal"
                ? "Peluquería"
                : "Mercado"

    };

}


// =====================================================
// CONSTRUIR ITEM
// =====================================================

function construirItemCarritoMobile(
    producto,
    cantidad
){

    return {

        id:
            String(
                producto?.id || ""
            ),

        codigo:
            String(
                producto?.codigo || ""
            ),

        producto:
            String(
                producto?.producto ||
                "Producto"
            ),

        categoria:
            String(
                producto?.categoria ||
                "Sin categoría"
            ),

        imagen:
            String(
                producto?.imagen || ""
            ),

        precio:
            normalizarNumeroCarritoMobile(
                producto?.precio
            ),

        precioCompra:
            normalizarNumeroCarritoMobile(
                producto?.precioCompra
            ),

        stockTiendas: {
            ...(
                producto?.stockTiendas ||
                {}
            )
        },

        cantidad:
            normalizarCantidadCarritoMobile(
                cantidad
            )

    };

}


// =====================================================
// PERSISTENCIA
// =====================================================

function guardarCarritoMobile(){

    try{

        localStorage.setItem(
            CLAVE_CARRITO_MOBILE,
            JSON.stringify(
                carritoMobile
            )
        );

    }catch(error){

        console.warn(
            "No se pudo guardar el carrito móvil:",
            error
        );

    }

}


function cargarCarritoMobile(){

    try{

        const contenido =
            localStorage.getItem(
                CLAVE_CARRITO_MOBILE
            );


        if(!contenido){

            carritoMobile =
                [];

            return obtenerCarritoMobile();

        }


        const datos =
            JSON.parse(
                contenido
            );


        carritoMobile =
            Array.isArray(datos)
                ? datos
                    .filter(function(item){

                        return Boolean(
                            item?.id
                        );

                    })
                    .map(function(item){

                        return construirItemCarritoMobile(
                            item,
                            item.cantidad
                        );

                    })
                : [];

    }catch(error){

        console.warn(
            "No se pudo recuperar el carrito móvil:",
            error
        );

        carritoMobile =
            [];

    }


    return obtenerCarritoMobile();

}


// =====================================================
// EVENTOS
// =====================================================

function notificarCambioCarritoMobile(){

    const resumen =
        obtenerResumenCarritoMobile();


    listenersCarritoMobile
        .forEach(function(listener){

            try{

                listener(
                    resumen
                );

            }catch(error){

                console.error(
                    "Error en listener del carrito móvil:",
                    error
                );

            }

        });


    window.dispatchEvent(
        new CustomEvent(
            "mobile:carrito-cambio",
            {
                detail:
                    resumen
            }
        )
    );

}


function suscribirCarritoMobile(
    listener
){

    if(
        typeof listener !==
        "function"
    ){

        return function(){};

    }


    listenersCarritoMobile.add(
        listener
    );


    listener(
        obtenerResumenCarritoMobile()
    );


    return function(){

        listenersCarritoMobile.delete(
            listener
        );

    };

}


// =====================================================
// LECTURA
// =====================================================

function obtenerCarritoMobile(){

    return carritoMobile.map(
        function(item){

            return {

                ...item,

                stockTiendas: {
                    ...(
                        item.stockTiendas ||
                        {}
                    )
                }

            };

        }
    );

}


function obtenerCantidadTotalCarritoMobile(){

    return carritoMobile.reduce(
        function(total, item){

            return (
                total +
                normalizarCantidadCarritoMobile(
                    item.cantidad
                )
            );

        },
        0
    );

}


function obtenerTotalCarritoMobile(){

    return carritoMobile.reduce(
        function(total, item){

            return (
                total +
                (
                    normalizarNumeroCarritoMobile(
                        item.precio
                    ) *
                    normalizarCantidadCarritoMobile(
                        item.cantidad
                    )
                )
            );

        },
        0
    );

}


function obtenerResumenCarritoMobile(){

    const tiendaVenta =
        obtenerTiendaVentaMobile();


    return {

        items:
            obtenerCarritoMobile(),

        lineas:
            carritoMobile.length,

        cantidad:
            obtenerCantidadTotalCarritoMobile(),

        total:
            obtenerTotalCarritoMobile(),

        tiendaVenta,

        nombreTienda:
            obtenerNombreTiendaVentaMobile()

    };

}


// =====================================================
// AGREGAR PRODUCTO
// =====================================================

function agregarProductoCarritoMobile(
    producto,
    cantidad =
        1
){

    const productoId =
        String(
            producto?.id || ""
        );


    if(!productoId){

        throw new Error(
            "El producto no tiene un ID válido."
        );

    }


    const cantidadAgregar =
        normalizarCantidadCarritoMobile(
            cantidad
        );


    const itemExistente =
        carritoMobile.find(
            function(item){

                return (
                    item.id ===
                    productoId
                );

            }
        );


    const cantidadActual =
        itemExistente
            ? normalizarCantidadCarritoMobile(
                itemExistente.cantidad
            )
            : 0;


    const cantidadFinal =
        cantidadActual +
        cantidadAgregar;


    const tiendaVenta =
        obtenerTiendaVentaMobile();


    const validacion =
        validarCantidadContraStockCarritoMobile(
            producto,
            cantidadFinal,
            {
                sucursalId:
                    tiendaVenta
            }
        );


    if(!validacion.valida){

        return {

            ...obtenerResumenCarritoMobile(),

            operacion: {

                completada:
                    false,

                motivo:
                    validacion.stockDisponible <= 0
                        ? "sin-stock"
                        : "stock-insuficiente",

                stockDisponible:
                    validacion.stockDisponible,

                cantidadSolicitada:
                    cantidadFinal,

                productoId,

                tiendaVenta:
                    validacion.tiendaVenta,

                nombreTienda:
                    validacion.nombreTienda

            }

        };

    }


    if(itemExistente){

        itemExistente.cantidad =
            cantidadFinal;

        itemExistente.stockTiendas = {
            ...(
                producto?.stockTiendas ||
                itemExistente.stockTiendas ||
                {}
            )
        };

    }else{

        carritoMobile.push(
            construirItemCarritoMobile(
                producto,
                cantidadAgregar
            )
        );

    }


    guardarCarritoMobile();

    notificarCambioCarritoMobile();


    return {

        ...obtenerResumenCarritoMobile(),

        operacion: {

            completada:
                true,

            motivo:
                "agregado",

            stockDisponible:
                validacion.stockDisponible,

            cantidadSolicitada:
                cantidadFinal,

            productoId,

            tiendaVenta:
                validacion.tiendaVenta,

            nombreTienda:
                validacion.nombreTienda

        }

    };

}


// =====================================================
// ACTUALIZAR CANTIDAD
// =====================================================

function actualizarCantidadCarritoMobile(
    productoId,
    cantidad
){

    const id =
        String(
            productoId || ""
        );


    const item =
        carritoMobile.find(
            function(producto){

                return producto.id === id;

            }
        );


    if(!item){

        return {

            ...obtenerResumenCarritoMobile(),

            operacion: {

                completada:
                    false,

                motivo:
                    "producto-no-encontrado",

                productoId:
                    id

            }

        };

    }


    const nuevaCantidad =
        Math.trunc(
            normalizarNumeroCarritoMobile(
                cantidad
            )
        );


    if(nuevaCantidad <= 0){

        return eliminarProductoCarritoMobile(
            id
        );

    }


    const tiendaVenta =
        obtenerTiendaVentaMobile();


    const validacion =
        validarCantidadContraStockCarritoMobile(
            item,
            nuevaCantidad,
            {
                sucursalId:
                    tiendaVenta
            }
        );


    if(!validacion.valida){

        return {

            ...obtenerResumenCarritoMobile(),

            operacion: {

                completada:
                    false,

                motivo:
                    validacion.stockDisponible <= 0
                        ? "sin-stock"
                        : "stock-insuficiente",

                stockDisponible:
                    validacion.stockDisponible,

                cantidadSolicitada:
                    nuevaCantidad,

                productoId:
                    id,

                tiendaVenta:
                    validacion.tiendaVenta,

                nombreTienda:
                    validacion.nombreTienda

            }

        };

    }


    item.cantidad =
        nuevaCantidad;


    guardarCarritoMobile();

    notificarCambioCarritoMobile();


    return {

        ...obtenerResumenCarritoMobile(),

        operacion: {

            completada:
                true,

            motivo:
                "cantidad-actualizada",

            stockDisponible:
                validacion.stockDisponible,

            cantidadSolicitada:
                nuevaCantidad,

            productoId:
                id,

            tiendaVenta:
                validacion.tiendaVenta,

            nombreTienda:
                validacion.nombreTienda

        }

    };

}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

function eliminarProductoCarritoMobile(
    productoId
){

    const id =
        String(
            productoId || ""
        );


    carritoMobile =
        carritoMobile.filter(
            function(item){

                return item.id !== id;

            }
        );


    guardarCarritoMobile();

    notificarCambioCarritoMobile();


    return obtenerResumenCarritoMobile();

}


// =====================================================
// VACIAR CARRITO
// =====================================================

function vaciarCarritoMobile(){

    carritoMobile =
        [];


    guardarCarritoMobile();

    notificarCambioCarritoMobile();


    return obtenerResumenCarritoMobile();

}


// =====================================================
// INICIALIZACIÓN
// =====================================================

cargarCarritoMobile();


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    CLAVE_CARRITO_MOBILE,

    cargarCarritoMobile,

    obtenerCarritoMobile,

    obtenerCantidadTotalCarritoMobile,

    obtenerTotalCarritoMobile,

    obtenerResumenCarritoMobile,

    obtenerStockSucursalProductoMobile,

    obtenerStockDisponibleCarritoMobile,

    validarCantidadContraStockCarritoMobile,

    agregarProductoCarritoMobile,

    actualizarCantidadCarritoMobile,

    eliminarProductoCarritoMobile,

    vaciarCarritoMobile,

    suscribirCarritoMobile

};
