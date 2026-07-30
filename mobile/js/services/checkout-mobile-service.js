// =====================================================
// DIGITAL CENTER M&A
// CHECKOUT MOBILE SERVICE
// FASE M7.2.2
// CHECKOUT SEGÚN TIENDA DE VENTA
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
    obtenerSucursalMobile,
    obtenerTiendaVentaMobile,
    obtenerNombreTiendaVentaMobile
} from "../state-mobile.js";

import {
    cargarSucursalesMobile
} from "./sucursales-mobile-service.js";


// =====================================================
// ESTADO
// =====================================================

let checkoutMobileEnProceso = false;


// =====================================================
// UTILIDADES
// =====================================================

function normalizarMontoCheckoutMobile(valor) {

    const numero = Number(valor || 0);

    if (
        !Number.isFinite(numero) ||
        numero < 0
    ) {
        return 0;
    }

    return Number(numero.toFixed(2));

}


function redondearMontoCheckoutMobile(valor) {

    return Math.round(
        normalizarMontoCheckoutMobile(valor) * 100
    ) / 100;

}


function obtenerFechaISOCheckoutMobile(fecha = new Date()) {

    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}


function obtenerFechaLocalCheckoutMobile(fecha = new Date()) {

    return fecha.toLocaleDateString(
        "es-PE"
    );

}


function obtenerHoraLocalCheckoutMobile(fecha = new Date()) {

    return fecha.toLocaleTimeString(
        "es-PE"
    );

}


function construirPagosCheckoutMobile(
    metodoPago,
    total,
    pagosPersonalizados = null
) {

    const pagosBase = {
        efectivo: 0,
        yape: 0,
        plin: 0,
        tarjeta: 0,
        transferencia: 0
    };


    /*
     * PAGO MIXTO
     * Recibe los montos definidos desde la interfaz.
     */
    if(
        pagosPersonalizados &&
        typeof pagosPersonalizados ===
        "object"
    ){

        Object
            .keys(
                pagosBase
            )
            .forEach(function(metodo){

                pagosBase[metodo] =
                    redondearMontoCheckoutMobile(
                        pagosPersonalizados[
                            metodo
                        ]
                    );

            });


        return pagosBase;

    }


    /*
     * PAGO SIMPLE
     * Conserva el comportamiento actual.
     */
    if(
        Object.hasOwn(
            pagosBase,
            metodoPago
        )
    ){

        pagosBase[metodoPago] =
            redondearMontoCheckoutMobile(
                total
            );

    }


    return pagosBase;

}

function validarPagosCheckoutMobile(
    pagos,
    total
){

    if(
        !pagos ||
        typeof pagos !==
        "object"
    ){

        throw new Error(
            "La distribución de pagos no es válida."
        );

    }


    const metodosPermitidos = [
        "efectivo",
        "yape",
        "plin",
        "tarjeta",
        "transferencia"
    ];


    const pagosNormalizados = {};


    metodosPermitidos.forEach(
        function(metodo){

            pagosNormalizados[metodo] =
                redondearMontoCheckoutMobile(
                    pagos[metodo]
                );

        }
    );


    const totalPagado =
        redondearMontoCheckoutMobile(
            metodosPermitidos.reduce(
                function(acumulado, metodo){

                    return (
                        acumulado +
                        pagosNormalizados[
                            metodo
                        ]
                    );

                },
                0
            )
        );


    const totalVenta =
        redondearMontoCheckoutMobile(
            total
        );


    if(
        Math.abs(
            totalPagado -
            totalVenta
        ) > 0.009
    ){

        throw new Error(
            `La suma de los pagos debe ser ${totalVenta.toFixed(2)}. Actualmente suma ${totalPagado.toFixed(2)}.`
        );

    }


    const metodosUtilizados =
        metodosPermitidos.filter(
            function(metodo){

                return (
                    pagosNormalizados[
                        metodo
                    ] > 0
                );

            }
        );


    if(
        metodosUtilizados.length <
        2
    ){

        throw new Error(
            "El pago mixto debe utilizar al menos dos métodos de pago."
        );

    }


    return pagosNormalizados;

}


function calcularGananciaCheckoutMobile(
    items,
    descuento = 0
) {

    const gananciaBruta =
        items.reduce(
            function(total, item) {

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


// =====================================================
// NOMBRE DE TIENDA
// =====================================================

async function obtenerNombreSucursalCheckoutMobile(
    sucursalId
) {

    /*
     * Para las dos tiendas oficiales usamos
     * directamente sus nombres comerciales.
     */

    if (sucursalId === "principal") {
        return "Mercado";
    }

    if (sucursalId === "sucursal") {
        return "Peluquería";
    }

    /*
     * Dejamos este respaldo por si en el futuro
     * se agregan nuevas sucursales en Firebase.
     */

    try {

        const sucursales =
            await cargarSucursalesMobile();

        const sucursal =
            sucursales.find(
                function(item) {

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

    } catch (error) {

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


// =====================================================
// STOCK SEGÚN TIENDA
// =====================================================

function obtenerStockProductoCheckoutMobile(
    datosProducto,
    tiendaVenta
){

    const stockTiendas =
        datosProducto?.stockTiendas &&
        typeof datosProducto.stockTiendas ===
        "object"
            ? datosProducto.stockTiendas
            : {};


    const tiendaNormalizada =
        String(
            tiendaVenta ||
            "principal"
        )
            .trim()
            .toLowerCase();


    let posiblesClaves;


    if(
        tiendaNormalizada === "sucursal" ||
        tiendaNormalizada === "peluqueria" ||
        tiendaNormalizada === "peluquería"
    ){

        posiblesClaves = [

            "sucursal",

            "peluqueria",

            "peluquería"

        ];

    }else{

        posiblesClaves = [

            "principal",

            "mercado"

        ];

    }


    for(
        const clave of
        posiblesClaves
    ){

        const valor =
            Number(
                stockTiendas[clave]
            );


        if(Number.isFinite(valor)){

            return Math.max(
                0,
                Math.trunc(
                    valor
                )
            );

        }

    }


    return 0;

}

function construirStockTiendasCheckoutMobile(
    datosProducto
){

    const stockOriginal =
        datosProducto?.stockTiendas &&
        typeof datosProducto.stockTiendas ===
        "object"
            ? datosProducto.stockTiendas
            : {};


    return {

        ...stockOriginal,

        principal:
            obtenerStockProductoCheckoutMobile(
                datosProducto,
                "principal"
            ),

        sucursal:
            obtenerStockProductoCheckoutMobile(
                datosProducto,
                "sucursal"
            )

    };

}


// =====================================================
// VALIDACIÓN DEL CARRITO
// =====================================================

function validarCarritoCheckoutMobile(resumen) {

    if (
        !resumen ||
        !Array.isArray(resumen.items) ||
        resumen.items.length === 0
    ) {

        throw new Error(
            "La venta no tiene productos."
        );

    }

    if (
        !Number.isFinite(
            Number(resumen.total)
        ) ||
        Number(resumen.total) <= 0
    ) {

        throw new Error(
            "El total de la venta no es válido."
        );

    }

    resumen.items.forEach(
        function(item) {

            if (!item?.id) {

                throw new Error(
                    "Uno de los productos no tiene un ID válido."
                );

            }

            if (
                !Number.isFinite(
                    Number(item.cantidad)
                ) ||
                Number(item.cantidad) <= 0
            ) {

                throw new Error(
                    `La cantidad de "${item.producto}" no es válida.`
                );

            }

            if (
                !Number.isFinite(
                    Number(item.precio)
                ) ||
                Number(item.precio) < 0
            ) {

                throw new Error(
                    `El precio de "${item.producto}" no es válido.`
                );

            }

        }
    );

    return true;

}


// =====================================================
// DETALLE DE PRODUCTO PARA LA VENTA
// =====================================================

function construirDetalleVentaCheckoutMobile(item) {

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

        nombreBoleta:
            String(
                item.nombreBoleta ||
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


// =====================================================
// CONSTRUCCIÓN DE LA VENTA
// =====================================================

function obtenerNombreMetodoPagoCheckoutMobile(
    metodoPago
){

    const nombres = {

        efectivo:
            "Efectivo",

        yape:
            "Yape",

        plin:
            "Plin",

        tarjeta:
            "Tarjeta",

        transferencia:
            "Transferencia"

    };


    return (
        nombres[
            metodoPago
        ] ||
        "Sin método"
    );

}

function construirVentaCheckoutMobile(opciones) {

const {
    resumen,
    metodoPago,
    pagosPersonalizados = null,
    numeroBoleta,
    tiendaVenta,
    tiendaVentaNombre,
    recibido = resumen.total,
    vuelto = 0,
    clienteNombre = "CLIENTE GENERAL",
    clienteDni = "-",
    descuento = 0
} = opciones;

    const usuario =
        obtenerSesionMobile();

    /*
     * Esta es la sucursal asignada al usuario.
     * Se conserva únicamente como información.
     */
    const sucursalUsuario =
        obtenerSucursalMobile();

    /*
     * Esta es la tienda seleccionada para la venta.
     * De aquí se descontará el stock.
     */
    const tiendaSeleccionada =
        String(
            tiendaVenta ||
            obtenerTiendaVentaMobile() ||
            "principal"
        );

    const nombreTiendaSeleccionada =
        String(
            tiendaVentaNombre ||
            obtenerNombreTiendaVentaMobile() ||
            (
                tiendaSeleccionada === "sucursal"
                    ? "Peluquería"
                    : "Mercado"
            )
        );

    const ahora =
        new Date();

    const productos =
        resumen.items.map(
            construirDetalleVentaCheckoutMobile
        );

const subtotal =
    redondearMontoCheckoutMobile(
        resumen.total
    );

const descuentoNormalizado =
    Math.min(
        subtotal,
        redondearMontoCheckoutMobile(
            descuento
        )
    );

const totalFinal =
    redondearMontoCheckoutMobile(
        subtotal -
        descuentoNormalizado
    );

    const pagos =
    construirPagosCheckoutMobile(
        metodoPago,
        totalFinal,
        pagosPersonalizados
    );

    return {

        numeroBoleta:
             String(
                 numeroBoleta ||
                 "SIN IMPRESION"
             ),
 
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

        /*
         * Sucursal asignada al usuario.
         */
        sucursalUsuario:
            String(
                sucursalUsuario ||
                "principal"
            ),

        productos,

        descuento:
            descuentoNormalizado,

        /*
         * Conservamos el formato que ya usa
         * tu sistema Desktop.
         */
metodoPago:
    pagosPersonalizados
        ? "Pagos mixtos"
        : obtenerNombreMetodoPagoCheckoutMobile(
            metodoPago
        ),

        /*
         * Tienda real desde donde se realizó
         * y descontó la venta.
         */
        tiendaVenta:
            tiendaSeleccionada,

        tiendaVentaNombre:
            nombreTiendaSeleccionada,

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
) {

    if (checkoutMobileEnProceso) {

        return {

            completada:
                false,

            motivo:
                "checkout-en-proceso",

            mensaje:
                "Ya se está procesando una venta."

        };

    }

    checkoutMobileEnProceso = true;

    try {

        const resumen =
            obtenerResumenCarritoMobile();

        validarCarritoCheckoutMobile(
            resumen
        );

const subtotal =
    redondearMontoCheckoutMobile(
        resumen.total
    );

const descuento =
    Math.min(
        subtotal,
        redondearMontoCheckoutMobile(
            opciones.descuento
        )
    );

const totalFinal =
    redondearMontoCheckoutMobile(
        subtotal -
        descuento
    );

if (totalFinal <= 0) {

    throw new Error(
        "El total de la venta debe ser mayor que cero."
    );

}

        const metodoPago =
            String(
                opciones.metodoPago ||
                "efectivo"
            );

let pagosPersonalizados =
    null;


if(
    metodoPago === "mixto"
){

pagosPersonalizados =
    validarPagosCheckoutMobile(
        opciones.pagos,
        totalFinal
    );

}

const recibido =
    normalizarMontoCheckoutMobile(
        opciones.recibido ??
        totalFinal
    );

        const vuelto =
            normalizarMontoCheckoutMobile(
                opciones.vuelto || 0
            );

if (
    metodoPago === "efectivo" &&
    recibido < totalFinal
) {

            throw new Error(
                "El monto recibido no cubre el total."
            );

        }

        /*
         * IMPORTANTE:
         * Ya no usamos obtenerSucursalMobile()
         * para descontar el stock.
         *
         * Usamos la tienda que Admin o vendedor
         * seleccionó antes de vender.
         */
        const tiendaVenta =
            obtenerTiendaVentaMobile();

        const tiendaVentaNombre =
            await obtenerNombreSucursalCheckoutMobile(
                tiendaVenta
            );

        const ventaRef =
            doc(
                collection(
                    mobileDB,
                    "ventas"
                )
            );

        const correlativoBoletaRef =
            doc(
                mobileDB,
                "configuracion",
                "boletas"
            );


        const boletaRef =
            doc(
                mobileDB,
                "boletas",
                ventaRef.id
            );

        const resultado =
            await runTransaction(
                mobileDB,
                async function(transaccion) {

                    /*
                     * Firestore exige realizar primero
                     * todas las lecturas antes de actualizar.
                     */
                    const lecturas =
                        await Promise.all(
                            resumen.items.map(
                                async function(item) {

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

const correlativoBoletaSnapshot =
    await transaccion.get(
        correlativoBoletaRef
    );


const ultimoNumeroGuardado =
    correlativoBoletaSnapshot.exists()
        ? Number(
            correlativoBoletaSnapshot
                .data()
                ?.ultimoNumero
        )
        : 0;


const ultimoNumeroBoleta =
    Number.isFinite(
        ultimoNumeroGuardado
    )
        ? Math.max(
            0,
            Math.trunc(
                ultimoNumeroGuardado
            )
        )
        : 0;


const nuevoNumeroBoleta =
    ultimoNumeroBoleta + 1;


const numeroBoleta =
    `B001-${
        String(
            nuevoNumeroBoleta
        ).padStart(
            6,
            "0"
        )
    }`;

                    /*
                     * Primera pasada:
                     * comprobar existencia y stock.
                     */
                    lecturas.forEach(
                        function(registro) {

                            if (
                                !registro.snapshot.exists()
                            ) {

                                throw new Error(
                                    `El producto "${registro.item.producto}" ya no existe.`
                                );

                            }

                            const datosProducto =
                                registro.snapshot.data();

                            const stockActual =
                                obtenerStockProductoCheckoutMobile(
                                    datosProducto,
                                    tiendaVenta
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

                            if (stockActual < cantidad) {

                                throw new Error(
                                    `Stock insuficiente para "${registro.item.producto}" en ${tiendaVentaNombre}. Disponible: ${stockActual}.`
                                );

                            }

                        }
                    );

                    /*
                     * Segunda pasada:
                     * descontar el stock de la tienda elegida.
                     */
                    lecturas.forEach(
                        function(registro) {

                            const datosProducto =
                                registro.snapshot.data();

                            const stockTiendas =
                                construirStockTiendasCheckoutMobile(
                                   datosProducto
                                );

                            const stockActual =
                                obtenerStockProductoCheckoutMobile(
                                    datosProducto,
                                    tiendaVenta
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

                            /*
                             * Solo descontamos de la tienda
                             * seleccionada para esta venta.
                             */
const tiendaVentaNormalizada =
    String(
        tiendaVenta || "principal"
    )
        .trim()
        .toLowerCase();


const claveTiendaStock =
    (
        tiendaVentaNormalizada === "sucursal" ||
        tiendaVentaNormalizada === "peluqueria" ||
        tiendaVentaNormalizada === "peluquería"
    )
        ? "sucursal"
        : "principal";

stockTiendas[claveTiendaStock] =
    stockActual -
    cantidad;

delete stockTiendas.mercado;

delete stockTiendas.peluqueria;

delete stockTiendas["peluquería"];

                            /*
                             * Recalculamos el stock total
                             * sumando todas las tiendas.
                             */
                            const stockTotal =
    Math.max(
        0,
        Number(
            stockTiendas.principal ||
            0
        )
    ) +
    Math.max(
        0,
        Number(
            stockTiendas.sucursal ||
            0
        )
    );

                            transaccion.update(
                                registro.productoRef,
                                {
                                    stockTiendas,
                                    stock: stockTotal
                                }
                            );

                        }
                    );

                    const venta =
                        construirVentaCheckoutMobile({

                            resumen,

                            metodoPago,

                            pagosPersonalizados,

                            numeroBoleta,

                            recibido,

                            vuelto,

                            tiendaVenta,

                            tiendaVentaNombre,

                            clienteNombre:
                                opciones.clienteNombre,

                            clienteDni:
                                opciones.clienteDni,

                            descuento

                        });

transaccion.set(
    correlativoBoletaRef,
    {
        ultimoNumero:
            nuevoNumeroBoleta,

        actualizadoEn:
            serverTimestamp()
    },
    {
        merge:
            true
    }
);


transaccion.set(
    ventaRef,
    venta
);


transaccion.set(
    boletaRef,
    {
        ventaId:
            ventaRef.id,

        numeroBoleta:
            venta.numeroBoleta,

        fecha:
            venta.fecha,

        fechaISO:
            venta.fechaISO,

        hora:
            venta.hora,

        productos:
            venta.productos,

        productosResumen:
            venta.productos
                .map(
                    function(item){

                        return {

                            id:
                                item.id,

                            producto:
                                item.producto,

                            nombreBoleta:
                                item.nombreBoleta ||
                                item.producto,

                            cantidad:
                                item.cantidad,

                            precio:
                                item.precio,

                            subtotal:
                                item.subtotal

                        };

                    }
                ),

        total:
            venta.total,

        descuento:
            venta.descuento,

        pagos:
            venta.pagos,

        metodoPago:
            venta.metodoPago,

        vendedor:
            venta.vendedor,

        usuario:
            venta.usuario,

        tiendaVenta:
            venta.tiendaVenta,

        tiendaVentaNombre:
            venta.tiendaVentaNombre,

        clienteNombre:
            venta.clienteNombre,

        clienteDni:
            venta.clienteDni,

        origen:
            "mobile",

        creadaEn:
            serverTimestamp()
    }
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

    } catch (error) {

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

    } finally {

        checkoutMobileEnProceso =
            false;

    }

}


// =====================================================
// CONSULTAS
// =====================================================

function estaCheckoutMobileEnProceso() {

    return checkoutMobileEnProceso;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    registrarVentaMobile,

    estaCheckoutMobileEnProceso

};