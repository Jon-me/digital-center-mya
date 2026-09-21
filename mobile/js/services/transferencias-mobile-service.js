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

    const stockOriginal =
        producto?.stockTiendas &&
        typeof producto.stockTiendas === "object"
            ? producto.stockTiendas
            : {};


    const tieneStockPorTiendas =
        Object.keys(
            stockOriginal
        ).length > 0;


    let mercado =
        Number(
            stockOriginal.mercado ??
            stockOriginal.principal ??
            0
        );


    let peluqueria =
        Number(
            stockOriginal.peluqueria ??
            stockOriginal["peluquería"] ??
            stockOriginal.sucursal ??
            0
        );


    /*
     * Compatibilidad con productos históricos
     * que únicamente tienen stock general.
     *
     * En ese caso el stock pertenece a Mercado.
     */
    if(
        !tieneStockPorTiendas &&
        Number(
            producto?.stock || 0
        ) > 0
    ){

        mercado =
            Number(
                producto.stock || 0
            );

    }


    if(
        !Number.isFinite(
            mercado
        ) ||
        mercado < 0
    ){

        mercado = 0;

    }


    if(
        !Number.isFinite(
            peluqueria
        ) ||
        peluqueria < 0
    ){

        peluqueria = 0;

    }


    return {

        mercado,

        peluqueria

    };

}


// =====================================================
// NOMBRE VISIBLE DE TIENDA
// =====================================================

function obtenerNombreTiendaTransferenciaMobile(
    tiendaId
){

    const tiendaNormalizada =
        String(
            tiendaId || ""
        )
            .trim()
            .toLowerCase();


    const nombres = {

        mercado:
            "Mercado",

        peluqueria:
            "Peluquería",

        /*
         * Alias legacy.
         * Solo para compatibilidad de lectura/entrada.
         */
        principal:
            "Mercado",

        sucursal:
            "Peluquería"

    };


    return (
        nombres[
            tiendaNormalizada
        ] ||
        tiendaId ||
        "Sin tienda"
    );

}


// =====================================================
// VALIDACIÓN PREVIA
// =====================================================

function normalizarTiendaTransferenciaMobile(
    tiendaId
){

    const tienda =
        String(
            tiendaId || ""
        )
            .trim()
            .toLowerCase();


    if(
        tienda === "mercado" ||
        tienda === "principal"
    ){

        return "mercado";

    }


    if(
        tienda === "peluqueria" ||
        tienda === "peluquería" ||
        tienda === "sucursal"
    ){

        return "peluqueria";

    }


    return "";

}

function validarTransferenciaMobile(
    datos = {}
){

    const {

        producto,

        origen,

        destino,

        cantidad

    } = datos;

const origenNormalizado =
    normalizarTiendaTransferenciaMobile(
        origen
    );


const destinoNormalizado =
    normalizarTiendaTransferenciaMobile(
        destino
    );


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
        !origenNormalizado ||
        !destinoNormalizado
    ){

        return {

            valida:
                false,

            mensaje:
                "Selecciona la tienda de origen y destino."

        };

    }


    if(
        origenNormalizado === destinoNormalizado
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
                origenNormalizado
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
            stockOrigen,

        origen:
            origenNormalizado,

        destino:
            destinoNormalizado    

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

    const origenCanonico =
    validacion.origen;


    const destinoCanonico =
    validacion.destino;


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
                                origenCanonico
                            ] || 0
                        );


                    const stockDestino =
                        Number(
                            stockTiendas[
                                destinoCanonico
                            ] || 0
                        );


                    if(
                        stockOrigen <
                        validacion.cantidad
                    ){

                        throw new Error(
                            `Stock insuficiente en ${
                                obtenerNombreTiendaTransferenciaMobile(
                                    origenCanonico
                                )
                            }. Disponible: ${stockOrigen}.`
                        );

                    }


                    stockTiendas[
                        origenCanonico
                    ] =
                        stockOrigen -
                        validacion.cantidad;


                    stockTiendas[
                        destinoCanonico
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
                                origenCanonico,

                            origen:
                                obtenerNombreTiendaTransferenciaMobile(
                                    origenCanonico
                                ),

                            destinoId:
                                destinoCanonico,

                            destino:
                                obtenerNombreTiendaTransferenciaMobile(
                                    destinoCanonico
                                ),

                            stockOrigenAnterior:
                                stockOrigen,

                            stockOrigenNuevo:
                                stockTiendas[
                                    origenCanonico
                                ],

                            stockDestinoAnterior:
                                stockDestino,

                            stockDestinoNuevo:
                                stockTiendas[
                                    destinoCanonico
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
                                origenCanonico
                            ],

                        stockDestino:
                            stockTiendas[
                                destinoCanonico
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
                        origenCanonico
                    )
                } a ${
                    obtenerNombreTiendaTransferenciaMobile(
                        destinoCanonico
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