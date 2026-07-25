// =====================================================
// DIGITAL CENTER M&A
// MOBILE GARANTÍAS SERVICE
// FASE M8.1.1
// WARRANTY SEARCH ENGINE
// =====================================================

import {

    mobileDB,

    doc,

    collection,

    query,

    where,

    getDocs,

    onSnapshot,

    runTransaction,

    serverTimestamp

} from "../firebase-mobile.js";


import {

    obtenerSesionMobile

} from "../state-mobile.js";


// =====================================================
// ESTADO
// =====================================================

let operacionGarantiaMobileEnProceso =
    false;

let cancelarSuscripcionGarantiasMobile =
    null;    

// =====================================================
// UTILIDADES
// =====================================================

function normalizarTextoGarantiaMobile(
    valor
){

    return String(
        valor ??
        ""
    )
        .trim();

}


function normalizarTextoBusquedaGarantiaMobile(
    valor
){

    return normalizarTextoGarantiaMobile(
        valor
    )
        .replace(/\s+/g, " ");

}


function normalizarMontoGarantiaMobile(
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


function normalizarEstadoGarantiaMobile(
    estado
){

    const valor =
        normalizarTextoGarantiaMobile(
            estado ||
            "Pendiente"
        )
            .toLowerCase();


    if(
        valor === "aprobada"
    ){

        return "Aprobada";

    }


    if(
        valor === "rechazada"
    ){

        return "Rechazada";

    }


    if(
        valor === "observación" ||
        valor === "observacion"
    ){

        return "Observación";

    }


    return "Pendiente";

}


function obtenerNombreUsuarioGarantiaMobile(){

    const sesion =
        obtenerSesionMobile();


    return normalizarTextoGarantiaMobile(

        sesion?.nombreCompleto ||

        sesion?.nombre ||

        sesion?.usuario ||

        "Sin usuario"

    );

}


function obtenerUsuarioGarantiaMobile(){

    const sesion =
        obtenerSesionMobile();


    return normalizarTextoGarantiaMobile(
        sesion?.usuario ||
        ""
    );

}


// =====================================================
// PRODUCTOS
// =====================================================

function normalizarProductoGarantiaMobile(
    producto = {}
){

    return {

        id:
            normalizarTextoGarantiaMobile(
                producto.id ||
                producto.productoId ||
                ""
            ),

        codigo:
            normalizarTextoGarantiaMobile(
                producto.codigo ||
                ""
            ),

        producto:
            normalizarTextoGarantiaMobile(
                producto.producto ||
                producto.nombre ||
                producto.nombreBoleta ||
                "Producto sin nombre"
            ),

        nombreBoleta:
            normalizarTextoGarantiaMobile(
                producto.nombreBoleta ||
                producto.producto ||
                producto.nombre ||
                "Producto sin nombre"
            ),

        categoria:
            normalizarTextoGarantiaMobile(
                producto.categoria ||
                ""
            ),

        cantidad:
            Math.max(
                0,
                Number(
                    producto.cantidad ||
                    0
                )
            ),

        precio:
            normalizarMontoGarantiaMobile(
                producto.precio
            ),

        subtotal:
            normalizarMontoGarantiaMobile(
                producto.subtotal
            ),

        imagen:
            normalizarTextoGarantiaMobile(
                producto.imagen ||
                producto.imagenURL ||
                ""
            )

    };

}


// =====================================================
// NORMALIZACIÓN DE BOLETA / GARANTÍA
// =====================================================

function normalizarGarantiaMobile(
    datos = {},
    id = ""
){

    const productos =
        Array.isArray(
            datos.productos
        )
            ? datos.productos.map(
                normalizarProductoGarantiaMobile
            )
            : [];


    return {

        id:
            normalizarTextoGarantiaMobile(
                id
            ),

        numeroBoleta:
            normalizarTextoGarantiaMobile(
                datos.numeroBoleta ||
                "Sin número"
            ),

        clienteNombre:
            normalizarTextoGarantiaMobile(
                datos.clienteNombre ||
                "Cliente no registrado"
            ),

        clienteDni:
            normalizarTextoGarantiaMobile(
                datos.clienteDni ||
                ""
            ),

        fecha:
            normalizarTextoGarantiaMobile(
                datos.fecha ||
                ""
            ),

        fechaISO:
            normalizarTextoGarantiaMobile(
                datos.fechaISO ||
                ""
            ),

        hora:
            normalizarTextoGarantiaMobile(
                datos.hora ||
                ""
            ),

        vendedor:
            normalizarTextoGarantiaMobile(
                datos.vendedor ||
                "Sin vendedor"
            ),

        usuario:
            normalizarTextoGarantiaMobile(
                datos.usuario ||
                ""
            ),

        tiendaVenta:
            normalizarTextoGarantiaMobile(
                datos.tiendaVenta ||
                "principal"
            ),

        tiendaVentaNombre:
            normalizarTextoGarantiaMobile(
                datos.tiendaVentaNombre ||
                (
                    datos.tiendaVenta ===
                    "sucursal"
                        ? "Peluquería"
                        : "Mercado"
                )
            ),

        productos,

        total:
            normalizarMontoGarantiaMobile(
                datos.total
            ),

        descuento:
            normalizarMontoGarantiaMobile(
                datos.descuento
            ),

        estadoBoleta:
            normalizarTextoGarantiaMobile(
                datos.estado ||
                "activa"
            ),

        estadoGarantia:
            normalizarEstadoGarantiaMobile(
                datos.estadoGarantia
            ),

        observacionGarantia:
            normalizarTextoGarantiaMobile(
                datos.observacionGarantia ||
                ""
            ),

        fechaGarantia:
            normalizarTextoGarantiaMobile(
                datos.fechaGarantia ||
                ""
            ),

        fechaGarantiaISO:
            normalizarTextoGarantiaMobile(
                datos.fechaGarantiaISO ||
                ""
            ),

        horaGarantia:
            normalizarTextoGarantiaMobile(
                datos.horaGarantia ||
                ""
            ),

        atendidoGarantia:
            normalizarTextoGarantiaMobile(
                datos.atendidoGarantia ||
                ""
            ),

        atendidoGarantiaUsuario:
            normalizarTextoGarantiaMobile(
                datos.atendidoGarantiaUsuario ||
                ""
            ),

        autorizadoGarantia:
            datos.autorizadoGarantia ===
            true,

        autorizadoGarantiaPor:
            normalizarTextoGarantiaMobile(
                datos.autorizadoGarantiaPor ||
                ""
            ),

        autorizadoGarantiaPorUsuario:
            normalizarTextoGarantiaMobile(
                datos.autorizadoGarantiaPorUsuario ||
                ""
            ),

        origenGarantia:
            normalizarTextoGarantiaMobile(
                datos.origenGarantia ||
                ""
            )

    };

}


// =====================================================
// ORDENAMIENTO
// =====================================================

function ordenarGarantiasMobile(
    garantias = []
){

    return [
        ...garantias
    ].sort(
        function(a, b){

            const fechaA =
                String(
                    a.fechaISO ||
                    ""
                );


            const fechaB =
                String(
                    b.fechaISO ||
                    ""
                );


            if(
                fechaA !==
                fechaB
            ){

                return fechaB.localeCompare(
                    fechaA
                );

            }


            return String(
                b.hora ||
                ""
            ).localeCompare(
                String(
                    a.hora ||
                    ""
                )
            );

        }
    );

}


// =====================================================
// BÚSQUEDA DE GARANTÍAS
// =====================================================

async function buscarGarantiasMobile(
    textoBusqueda
){

    if(
        operacionGarantiaMobileEnProceso
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya se está procesando una búsqueda de garantía.",

            garantias:
                []

        };

    }


    const texto =
        normalizarTextoBusquedaGarantiaMobile(
            textoBusqueda
        );


    if(!texto){

        return {

            completada:
                false,

            motivo:
                "busqueda-vacia",

            mensaje:
                "Ingresa un DNI o número de boleta.",

            garantias:
                []

        };

    }


    operacionGarantiaMobileEnProceso =
        true;


    try{

        const boletasRef =
            collection(
                mobileDB,
                "boletas"
            );


        const consultaDni =
            query(

                boletasRef,

                where(
                    "clienteDni",
                    "==",
                    texto
                )

            );


        const consultaNumeroBoleta =
            query(

                boletasRef,

                where(
                    "numeroBoleta",
                    "==",
                    texto
                )

            );


        const [

            resultadoDni,

            resultadoNumeroBoleta

        ] = await Promise.all([

            getDocs(
                consultaDni
            ),

            getDocs(
                consultaNumeroBoleta
            )

        ]);


        const documentos =
            new Map();


        resultadoDni.forEach(
            function(documento){

                documentos.set(

                    documento.id,

                    normalizarGarantiaMobile(

                        documento.data(),

                        documento.id

                    )

                );

            }
        );


        resultadoNumeroBoleta.forEach(
            function(documento){

                documentos.set(

                    documento.id,

                    normalizarGarantiaMobile(

                        documento.data(),

                        documento.id

                    )

                );

            }
        );


        const garantias =
            ordenarGarantiasMobile(

                Array.from(
                    documentos.values()
                )

            );


        if(
            garantias.length ===
            0
        ){

            return {

                completada:
                    true,

                motivo:
                    "sin-resultados",

                mensaje:
                    "No se encontraron boletas con ese DNI o número de boleta.",

                textoBusqueda:
                    texto,

                garantias:
                    []

            };

        }


        return {

            completada:
                true,

            motivo:
                "garantias-encontradas",

            mensaje:
                garantias.length === 1
                    ? "Se encontró una boleta."
                    : `Se encontraron ${garantias.length} boletas.`,

            textoBusqueda:
                texto,

            totalResultados:
                garantias.length,

            garantias

        };

    }catch(error){

        console.error(
            "Error buscando garantías Mobile:",
            error
        );


        return {

            completada:
                false,

            motivo:
                "error-busqueda-garantia",

            mensaje:
                error?.message ||
                "No se pudo realizar la búsqueda de garantías.",

            garantias:
                [],

            error

        };

    }finally{

        operacionGarantiaMobileEnProceso =
            false;

    }

}

// =====================================================
// BÚSQUEDA REALTIME DE GARANTÍAS
// =====================================================

function suscribirGarantiasMobile(
    textoBusqueda,
    alActualizar,
    alError
){

    const texto =
        normalizarTextoBusquedaGarantiaMobile(
            textoBusqueda
        );


    cancelarRealtimeGarantiasMobile();


    if(!texto){

        const resultado = {

            completada:
                false,

            motivo:
                "busqueda-vacia",

            mensaje:
                "Ingresa un DNI o número de boleta.",

            textoBusqueda:
                "",

            totalResultados:
                0,

            garantias:
                []

        };


        if(
            typeof alActualizar ===
            "function"
        ){

            alActualizar(
                resultado
            );

        }


        return function(){};

    }


    const boletasRef =
        collection(
            mobileDB,
            "boletas"
        );


    const consultaDni =
        query(

            boletasRef,

            where(
                "clienteDni",
                "==",
                texto
            )

        );


    const consultaNumeroBoleta =
        query(

            boletasRef,

            where(
                "numeroBoleta",
                "==",
                texto
            )

        );


    const documentosDni =
        new Map();


    const documentosNumeroBoleta =
        new Map();


    let consultaDniInicializada =
        false;


    let consultaNumeroInicializada =
        false;


    let suscripcionCancelada =
        false;


    function emitirResultados(){

        if(suscripcionCancelada){

            return;

        }


        if(
            !consultaDniInicializada ||
            !consultaNumeroInicializada
        ){

            return;

        }


        const documentosCombinados =
            new Map();


        documentosDni.forEach(
            function(
                garantia,
                id
            ){

                documentosCombinados.set(
                    id,
                    garantia
                );

            }
        );


        documentosNumeroBoleta.forEach(
            function(
                garantia,
                id
            ){

                documentosCombinados.set(
                    id,
                    garantia
                );

            }
        );


        const garantias =
            ordenarGarantiasMobile(

                Array.from(
                    documentosCombinados.values()
                )

            );


        const resultado = {

            completada:
                true,

            motivo:
                garantias.length > 0
                    ? "garantias-encontradas"
                    : "sin-resultados",

            mensaje:
                garantias.length === 0
                    ? "No se encontraron boletas con ese DNI o número de boleta."
                    : garantias.length === 1
                        ? "Se encontró una boleta."
                        : `Se encontraron ${garantias.length} boletas.`,

            textoBusqueda:
                texto,

            totalResultados:
                garantias.length,

            garantias

        };


        if(
            typeof alActualizar ===
            "function"
        ){

            alActualizar(
                resultado
            );

        }

    }


    function manejarError(
        error
    ){

        if(suscripcionCancelada){

            return;

        }


        console.error(
            "Error escuchando garantías Mobile:",
            error
        );


        if(
            typeof alError ===
            "function"
        ){

            alError(
                error
            );

        }

    }


    const cancelarConsultaDni =
        onSnapshot(

            consultaDni,

            function(snapshot){

                documentosDni.clear();


                snapshot.forEach(
                    function(documento){

                        documentosDni.set(

                            documento.id,

                            normalizarGarantiaMobile(

                                documento.data(),

                                documento.id

                            )

                        );

                    }
                );


                consultaDniInicializada =
                    true;


                emitirResultados();

            },

            manejarError

        );


    const cancelarConsultaNumeroBoleta =
        onSnapshot(

            consultaNumeroBoleta,

            function(snapshot){

                documentosNumeroBoleta.clear();


                snapshot.forEach(
                    function(documento){

                        documentosNumeroBoleta.set(

                            documento.id,

                            normalizarGarantiaMobile(

                                documento.data(),

                                documento.id

                            )

                        );

                    }
                );


                consultaNumeroInicializada =
                    true;


                emitirResultados();

            },

            manejarError

        );


    cancelarSuscripcionGarantiasMobile =
        function(){

            if(suscripcionCancelada){

                return;

            }


            suscripcionCancelada =
                true;


            cancelarConsultaDni();

            cancelarConsultaNumeroBoleta();


            documentosDni.clear();

            documentosNumeroBoleta.clear();

        };


    return cancelarSuscripcionGarantiasMobile;

}


// =====================================================
// ACTUALIZACIÓN DE GARANTÍA
// =====================================================

async function actualizarGarantiaMobile(
    opciones = {}
){

    if(
        operacionGarantiaMobileEnProceso
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya se está procesando una operación de garantía."

        };

    }


    const boletaId =
        normalizarTextoGarantiaMobile(
            opciones.boletaId ||
            opciones.idBoleta ||
            ""
        );


    const estadoGarantia =
        normalizarEstadoGarantiaMobile(
            opciones.estadoGarantia ||
            opciones.estado
        );


    const observacionGarantia =
        normalizarTextoGarantiaMobile(
            opciones.observacionGarantia ||
            opciones.observacion ||
            ""
        );


    const autorizado =
        opciones.autorizado ===
        true;


    const autorizadoPor =
        normalizarTextoGarantiaMobile(
            opciones.autorizadoPor ||
            ""
        );


    const autorizadoPorUsuario =
        normalizarTextoGarantiaMobile(
            opciones.autorizadoPorUsuario ||
            ""
        );


    if(!boletaId){

        return {

            completada:
                false,

            motivo:
                "boleta-invalida",

            mensaje:
                "No se encontró la boleta que deseas actualizar."

        };

    }


    if(
        estadoGarantia ===
        "Observación" &&
        observacionGarantia.length < 3
    ){

        return {

            completada:
                false,

            motivo:
                "observacion-requerida",

            mensaje:
                "Ingresa una observación válida para la garantía."

        };

    }


    if(
        (
            estadoGarantia ===
            "Aprobada" ||

            estadoGarantia ===
            "Rechazada"
        ) &&
        observacionGarantia.length < 3
    ){

        return {

            completada:
                false,

            motivo:
                "observacion-requerida",

            mensaje:
                "Describe el diagnóstico o motivo de la resolución."

        };

    }


    /*
     * En M8.1.1 la autorización se recibe preparada
     * desde la vista. La integración visual completa
     * se realizará en M8.3.
     */
    if(
        (
            estadoGarantia ===
            "Aprobada" ||

            estadoGarantia ===
            "Rechazada"
        ) &&
        !autorizado
    ){

        return {

            completada:
                false,

            motivo:
                "autorizacion-requerida",

            mensaje:
                "Esta resolución requiere autorización administrativa."

        };

    }


    if(
        autorizado &&
        (
            !autorizadoPor ||
            !autorizadoPorUsuario
        )
    ){

        return {

            completada:
                false,

            motivo:
                "auditoria-incompleta",

            mensaje:
                "No se pudo identificar al administrador que autorizó la garantía."

        };

    }


    const boletaRef =
        doc(

            mobileDB,

            "boletas",

            boletaId

        );


    const atendidoPor =
        obtenerNombreUsuarioGarantiaMobile();


    const atendidoPorUsuario =
        obtenerUsuarioGarantiaMobile();


    const ahora =
        new Date();


    const fechaGarantia =
        ahora.toLocaleString(
            "es-PE"
        );


    const fechaGarantiaISO =
        ahora.toISOString();


    const horaGarantia =
        ahora.toLocaleTimeString(
            "es-PE"
        );


    operacionGarantiaMobileEnProceso =
        true;


    try{

        const resultado =
            await runTransaction(

                mobileDB,

                async function(
                    transaccion
                ){

                    const snapshotBoleta =
                        await transaccion.get(
                            boletaRef
                        );


                    if(
                        !snapshotBoleta.exists()
                    ){

                        throw new Error(
                            "BOLETA_NO_EXISTE"
                        );

                    }


                    const datosBoleta =
                        snapshotBoleta.data() ||
                        {};


                    const estadoBoleta =
                        normalizarTextoGarantiaMobile(
                            datosBoleta.estado ||
                            "activa"
                        )
                            .toLowerCase();


                    if(
                        estadoBoleta ===
                        "anulada"
                    ){

                        throw new Error(
                            "BOLETA_ANULADA"
                        );

                    }


                    const actualizacion = {

                        estadoGarantia,

                        observacionGarantia,

                        fechaGarantia,

                        fechaGarantiaISO,

                        horaGarantia,

                        atendidoGarantia:
                            atendidoPor,

                        atendidoGarantiaUsuario:
                            atendidoPorUsuario,

                        origenGarantia:
                            "mobile",

                        garantiaActualizadaEn:
                            serverTimestamp(),

                        ultimaOperacionGarantia:
                            "actualizacion-garantia",

                        ultimaOperacionGarantiaPor:
                            atendidoPor

                    };


                    if(autorizado){

                        actualizacion.autorizadoGarantia =
                            true;

                        actualizacion.autorizadoGarantiaPor =
                            autorizadoPor;

                        actualizacion.autorizadoGarantiaPorUsuario =
                            autorizadoPorUsuario;

                    }else{

                        actualizacion.autorizadoGarantia =
                            false;

                        actualizacion.autorizadoGarantiaPor =
                            "";

                        actualizacion.autorizadoGarantiaPorUsuario =
                            "";

                    }


                    transaccion.update(

                        boletaRef,

                        actualizacion

                    );


                    return normalizarGarantiaMobile(

                        {

                            ...datosBoleta,

                            ...actualizacion

                        },

                        snapshotBoleta.id

                    );

                }

            );


        return {

            completada:
                true,

            motivo:
                "garantia-actualizada",

            mensaje:
                `Garantía actualizada a "${estadoGarantia}".`,

            garantia:
                resultado,

            boletaId,

            estadoGarantia,

            observacionGarantia,

            atendidoPor,

            atendidoPorUsuario,

            autorizado,

            autorizadoPor,

            autorizadoPorUsuario

        };

    }catch(error){

        console.error(
            "Error actualizando garantía Mobile:",
            error
        );


        if(
            error?.message ===
            "BOLETA_NO_EXISTE"
        ){

            return {

                completada:
                    false,

                motivo:
                    "boleta-no-existe",

                mensaje:
                    "La boleta seleccionada ya no existe."

            };

        }


        if(
            error?.message ===
            "BOLETA_ANULADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "boleta-anulada",

                mensaje:
                    "No puedes actualizar la garantía de una boleta anulada."

            };

        }


        return {

            completada:
                false,

            motivo:
                "error-actualizacion-garantia",

            mensaje:
                error?.message ||
                "No se pudo actualizar la garantía.",

            error

        };

    }finally{

        operacionGarantiaMobileEnProceso =
            false;

    }

}

function cancelarRealtimeGarantiasMobile(){

    if(
        typeof cancelarSuscripcionGarantiasMobile ===
        "function"
    ){

        cancelarSuscripcionGarantiasMobile();

    }

    cancelarSuscripcionGarantiasMobile =
        null;

}


// =====================================================
// CONSULTAS DE ESTADO
// =====================================================

function estaOperacionGarantiaMobileEnProceso(){

    return operacionGarantiaMobileEnProceso;

}


// =====================================================
// REINICIO
// =====================================================

function reiniciarGarantiasMobile(){

    cancelarRealtimeGarantiasMobile();


    operacionGarantiaMobileEnProceso =
        false;

}

// =====================================================
// EXPORTACIONES
// =====================================================

export {

    normalizarTextoGarantiaMobile,

    normalizarTextoBusquedaGarantiaMobile,

    normalizarMontoGarantiaMobile,

    normalizarEstadoGarantiaMobile,

    normalizarProductoGarantiaMobile,

    normalizarGarantiaMobile,

    ordenarGarantiasMobile,

    buscarGarantiasMobile,

    suscribirGarantiasMobile,

    cancelarRealtimeGarantiasMobile,

    actualizarGarantiaMobile,

    estaOperacionGarantiaMobileEnProceso,

    reiniciarGarantiasMobile

};