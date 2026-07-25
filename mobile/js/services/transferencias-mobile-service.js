// =====================================================
// DIGITAL CENTER M&A
// TRANSFERENCIAS MOBILE SERVICE
// FASE M10.1 - MOTOR ENTERPRISE
// =====================================================

import {

    mobileDB,

    collection,

    doc,

    runTransaction,

    serverTimestamp

} from "../firebase-mobile.js";


let transferenciaEnProcesoMobile =
    false;


// =====================================================
// NORMALIZAR STOCK POR TIENDAS
// Compatible con productos antiguos
// =====================================================

function obtenerStockTiendasTransferenciaMobile(
    producto
){

    const stockTiendasOriginal =
        producto?.stockTiendas &&
        typeof producto.stockTiendas === "object"
            ? producto.stockTiendas
            : {};


    const stockTiendas = {};


    Object
        .entries(
            stockTiendasOriginal
        )
        .forEach(function([
            sucursalId,
            cantidad
        ]){

            stockTiendas[sucursalId] =
                Number(
                    cantidad || 0
                );

        });


    /*
     * Compatibilidad con productos antiguos
     * que únicamente tienen el campo stock.
     */
    if(
        Object.keys(
            stockTiendas
        ).length === 0 &&
        Number(
            producto?.stock || 0
        ) > 0
    ){

        stockTiendas.principal =
            Number(
                producto.stock || 0
            );

    }


    /*
     * Garantizamos las dos tiendas actuales.
     */
    if(
        !Object.prototype.hasOwnProperty.call(
            stockTiendas,
            "principal"
        )
    ){

        stockTiendas.principal =
            0;

    }


    if(
        !Object.prototype.hasOwnProperty.call(
            stockTiendas,
            "sucursal"
        )
    ){

        stockTiendas.sucursal =
            0;

    }


    return stockTiendas;

}


// =====================================================
// NOMBRE VISIBLE DE TIENDA
// =====================================================

function obtenerNombreTiendaTransferenciaMobile(
    sucursalId
){

    const nombres = {

        principal:
            "Mercado",

        sucursal:
            "Peluquería"

    };


    return (
        nombres[
            sucursalId
        ] ||
        sucursalId ||
        "Sin tienda"
    );

}


// =====================================================
// VALIDACIÓN PREVIA
// =====================================================

function validarTransferenciaMobile(
    datos = {}
){

    const {

        producto,

        origen,

        destino,

        cantidad

    } = datos;


    if(
        !producto ||
        !producto.id
    ){

        return {

            valida:
                false,

            mensaje:
                "No se encontró el producto seleccionado."

        };

    }


    if(
        !origen ||
        !destino
    ){

        return {

            valida:
                false,

            mensaje:
                "Selecciona la tienda de origen y destino."

        };

    }


    if(
        origen === destino
    ){

        return {

            valida:
                false,

            mensaje:
                "La tienda de origen y destino no pueden ser iguales."

        };

    }


    const cantidadNormalizada =
        Number(
            cantidad
        );


    if(
        !Number.isInteger(
            cantidadNormalizada
        ) ||
        cantidadNormalizada <= 0
    ){

        return {

            valida:
                false,

            mensaje:
                "Ingresa una cantidad válida."

        };

    }


    const stockTiendas =
        obtenerStockTiendasTransferenciaMobile(
            producto
        );


    const stockOrigen =
        Number(
            stockTiendas[
                origen
            ] || 0
        );


    if(
        stockOrigen < cantidadNormalizada
    ){

        return {

            valida:
                false,

            mensaje:
                `Solo existen ${stockOrigen} unidad(es) en ${
                    obtenerNombreTiendaTransferenciaMobile(
                        origen
                    )
                }.`,

            stockDisponible:
                stockOrigen

        };

    }


    return {

        valida:
            true,

        cantidad:
            cantidadNormalizada,

        stockDisponible:
            stockOrigen

    };

}


// =====================================================
// EJECUTAR TRANSFERENCIA FIRESTORE
// Operación atómica mediante runTransaction()
// =====================================================

async function transferirStockMobile(
    datos = {}
){

    if(
        transferenciaEnProcesoMobile
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya existe una transferencia en proceso."

        };

    }


    const {

        producto,

        origen,

        destino,

        cantidad,

        usuario

    } = datos;


    const validacion =
        validarTransferenciaMobile({

            producto,

            origen,

            destino,

            cantidad

        });


    if(
        !validacion.valida
    ){

        return {

            completada:
                false,

            motivo:
                "validacion",

            mensaje:
                validacion.mensaje,

            stockDisponible:
                validacion.stockDisponible

        };

    }


    transferenciaEnProcesoMobile =
        true;


    const productoRef =
        doc(
            mobileDB,
            "productos",
            producto.id
        );


    try{

        const resultado =
            await runTransaction(

                mobileDB,

                async function(
                    transaction
                ){

                    /*
                     * Leemos el producto directamente
                     * desde Firestore para evitar usar
                     * stock desactualizado de la interfaz.
                     */
                    const productoSnapshot =
                        await transaction.get(
                            productoRef
                        );


                    if(
                        !productoSnapshot.exists()
                    ){

                        throw new Error(
                            "El producto ya no existe en Firebase."
                        );

                    }


                    const productoFirebase =
                        productoSnapshot.data();


                    const stockTiendas =
                        obtenerStockTiendasTransferenciaMobile(
                            productoFirebase
                        );


                    const stockOrigen =
                        Number(
                            stockTiendas[
                                origen
                            ] || 0
                        );


                    const stockDestino =
                        Number(
                            stockTiendas[
                                destino
                            ] || 0
                        );


                    if(
                        stockOrigen <
                        validacion.cantidad
                    ){

                        throw new Error(
                            `Stock insuficiente en ${
                                obtenerNombreTiendaTransferenciaMobile(
                                    origen
                                )
                            }. Disponible: ${stockOrigen}.`
                        );

                    }


                    stockTiendas[
                        origen
                    ] =
                        stockOrigen -
                        validacion.cantidad;


                    stockTiendas[
                        destino
                    ] =
                        stockDestino +
                        validacion.cantidad;


                    const stockTotal =
                        Object
                            .values(
                                stockTiendas
                            )
                            .reduce(
                                function(
                                    total,
                                    stockSucursal
                                ){

                                    return (
                                        total +
                                        Number(
                                            stockSucursal || 0
                                        )
                                    );

                                },
                                0
                            );


                    transaction.update(
                        productoRef,
                        {

                            stock:
                                stockTotal,

                            stockTiendas

                        }
                    );


                    const historialRef =
                        doc(
                            collection(
                                mobileDB,
                                "transferenciasStock"
                            )
                        );


                    transaction.set(
                        historialRef,
                        {

                            productoId:
                                producto.id,

                            codigo:
                                String(
                                    producto.codigo || ""
                                ),

                            producto:
                                String(
                                    producto.producto ||
                                    "Producto sin nombre"
                                ),

                            cantidad:
                                validacion.cantidad,

                            origenId:
                                origen,

                            origen:
                                obtenerNombreTiendaTransferenciaMobile(
                                    origen
                                ),

                            destinoId:
                                destino,

                            destino:
                                obtenerNombreTiendaTransferenciaMobile(
                                    destino
                                ),

                            stockOrigenAnterior:
                                stockOrigen,

                            stockOrigenNuevo:
                                stockTiendas[
                                    origen
                                ],

                            stockDestinoAnterior:
                                stockDestino,

                            stockDestinoNuevo:
                                stockTiendas[
                                    destino
                                ],

                            stockTotal,

                            usuario:
                                String(
                                    usuario?.nombreCompleto ||
                                    usuario?.nombre ||
                                    usuario?.usuario ||
                                    localStorage.getItem(
                                        "nombreActivo"
                                    ) ||
                                    "Sin usuario"
                                ),

                            usuarioRol:
                                String(
                                    usuario?.rol ||
                                    localStorage.getItem(
                                        "rolActivo"
                                    ) ||
                                    ""
                                ),

                            origenSistema:
                                "mobile",

                            fechaRegistro:
                                serverTimestamp(),

                            fechaISO:
                                obtenerFechaISOMobile(),

                            fecha:
                                new Date()
                                    .toLocaleDateString(
                                        "es-PE"
                                    ),

                            hora:
                                new Date()
                                    .toLocaleTimeString(
                                        "es-PE",
                                        {
                                            hour:
                                                "2-digit",

                                            minute:
                                                "2-digit",

                                            second:
                                                "2-digit"
                                        }
                                    )

                        }
                    );


                    return {

                        cantidad:
                            validacion.cantidad,

                        stockTotal,

                        stockOrigen:
                            stockTiendas[
                                origen
                            ],

                        stockDestino:
                            stockTiendas[
                                destino
                            ]

                    };

                }

            );


        return {

            completada:
                true,

            ...resultado,

            mensaje:
                `${validacion.cantidad} unidad(es) transferidas de ${
                    obtenerNombreTiendaTransferenciaMobile(
                        origen
                    )
                } a ${
                    obtenerNombreTiendaTransferenciaMobile(
                        destino
                    )
                }.`

        };

    }catch(error){

        console.error(
            "Error transfiriendo stock Mobile:",
            error
        );


        return {

            completada:
                false,

            motivo:
                "firebase",

            mensaje:
                error?.message ||
                "No se pudo completar la transferencia."

        };

    }finally{

        transferenciaEnProcesoMobile =
            false;

    }

}


// =====================================================
// FECHA LOCAL YYYY-MM-DD
// =====================================================

function obtenerFechaISOMobile(){

    const fecha =
        new Date();


    const anio =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const dia =
        String(
            fecha.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${anio}-${mes}-${dia}`;

}


// =====================================================
// ESTADO DEL MOTOR
// =====================================================

function transferenciaEstaEnProcesoMobile(){

    return transferenciaEnProcesoMobile;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    transferirStockMobile,

    validarTransferenciaMobile,

    obtenerStockTiendasTransferenciaMobile,

    obtenerNombreTiendaTransferenciaMobile,

    transferenciaEstaEnProcesoMobile

};