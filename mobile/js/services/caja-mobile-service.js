// =====================================================
// DIGITAL CENTER M&A
// MOBILE CAJA SERVICE
// FASE M7.3.2
// REALTIME CAJA ENGINE
// =====================================================

import {

    mobileDB,

    doc,

    collection,

    onSnapshot,

    runTransaction,

    serverTimestamp

} from "../firebase-mobile.js";


import {

    obtenerTiendaVentaMobile,

    obtenerSesionMobile

} from "../state-mobile.js";


// =====================================================
// ESTADO
// =====================================================

let tiendaCajaMobile =
    "principal";


let operacionCajaMobileEnProceso =
    false;


let cajaActualMobile =
    crearEstadoCajaVacioMobile({
        sucursalId:
            tiendaCajaMobile
    });


let gastosCajaMobile =
    [];


let detenerListenerCajaMobile =
    null;


let detenerListenerGastosMobile =
    null;


let suscriptoresCajaMobile =
    new Set();

// =====================================================
// ESTADO BASE
// =====================================================

function crearEstadoCajaVacioMobile(
    opciones = {}
){

    const sucursalId =
        normalizarTiendaCajaMobile(
            opciones.sucursalId ||
            tiendaCajaMobile ||
            "principal"
        );


    return {

        id:
            "",

        existe:
            false,

        abierta:
            false,

        anulada:
            false,

        montoInicial:
            0,

        sucursalId,

        sucursalNombre:
            obtenerNombreTiendaCajaMobile(
                sucursalId
            ),

        abiertaPor:
            "",

        cerradaPor:
            "",

        anuladaPor:
            "",

        fecha:
            obtenerFechaISOCajaMobile(),

        horaApertura:
            "",

        horaCierre:
            "",

        horaAnulacion:
            "",

        ventasDia:
            0,

        efectivoDia:
            0,

        yapeDia:
            0,

        plinDia:
            0,

        tarjetaDia:
            0,

        transferenciaDia:
            0,

        gastosDia:
            0,

        cajaEsperada:
            0,

        dineroReal:
            0,

        diferencia:
            0,

        resultadoCuadre:
            ""

    };

}


// =====================================================
// FECHA
// =====================================================

function obtenerFechaISOCajaMobile(
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

function obtenerFechaLocalCajaMobile(
    fecha =
        new Date()
){

    return fecha.toLocaleDateString(
        "es-PE"
    );

}


function obtenerHoraLocalCajaMobile(
    fecha =
        new Date()
){

    return fecha.toLocaleTimeString(
        "es-PE"
    );

}


// =====================================================
// TIENDA
// =====================================================

function normalizarTiendaCajaMobile(
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


function obtenerNombreTiendaCajaMobile(
    tienda
){

    return (
        normalizarTiendaCajaMobile(
            tienda
        ) === "sucursal"
            ? "Peluquería"
            : "Mercado"
    );

}


function obtenerTiendaCajaMobile(){

    return tiendaCajaMobile;

}


function establecerTiendaCajaMobile(
    tienda
){

    const tiendaNormalizada =
        normalizarTiendaCajaMobile(
            tienda
        );


    if(
        tiendaCajaMobile ===
        tiendaNormalizada
    ){

        return false;

    }


    tiendaCajaMobile =
        tiendaNormalizada;


    iniciarRealtimeCajaMobile(
        tiendaCajaMobile
    );


    return true;

}

function obtenerNombreUsuarioCajaMobile(){

    const sesion =
        obtenerSesionMobile();


    return String(
        sesion?.nombreCompleto ||
        sesion?.nombre ||
        sesion?.usuario ||
        "Sin usuario"
    );

}

function obtenerRolUsuarioCajaMobile(){

    const sesion =
        obtenerSesionMobile();


    return String(
        sesion?.rol ||
        sesion?.tipo ||
        "vendedor"
    )
        .trim()
        .toLowerCase();

}


// =====================================================
// IDENTIFICADOR COMPATIBLE CON DESKTOP
// =====================================================

function obtenerIdCajaMobile(
    opciones = {}
){

    const sucursalId =
        normalizarTiendaCajaMobile(
            opciones.sucursalId ||
            tiendaCajaMobile
        );


    const fecha =
        String(
            opciones.fecha ||
            obtenerFechaISOCajaMobile()
        );


    return (
        sucursalId +
        "__" +
        fecha
    );

}


// =====================================================
// NORMALIZACIÓN
// =====================================================

function normalizarMontoCajaMobile(
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


function normalizarCajaMobile(
    datos = {},
    id = ""
){

    const sucursalId =
        normalizarTiendaCajaMobile(
            datos.sucursalId ||
            tiendaCajaMobile
        );


    return {

        ...crearEstadoCajaVacioMobile({
            sucursalId
        }),

        ...datos,

        id:
            String(
                id || ""
            ),

        existe:
            true,

        abierta:
            datos.abierta === true,

        anulada:
            datos.anulada === true,

        montoInicial:
            normalizarMontoCajaMobile(
                datos.montoInicial
            ),

        sucursalId,

        sucursalNombre:
            String(
                datos.sucursalNombre ||
                obtenerNombreTiendaCajaMobile(
                    sucursalId
                )
            ),

        ventasDia:
            normalizarMontoCajaMobile(
                datos.ventasDia
            ),

        efectivoDia:
            normalizarMontoCajaMobile(
                datos.efectivoDia
            ),

        yapeDia:
            normalizarMontoCajaMobile(
                datos.yapeDia
            ),

        plinDia:
            normalizarMontoCajaMobile(
                datos.plinDia
            ),

        tarjetaDia:
            normalizarMontoCajaMobile(
                datos.tarjetaDia
            ),

        transferenciaDia:
            normalizarMontoCajaMobile(
                datos.transferenciaDia
            ),

        gastosDia:
            normalizarMontoCajaMobile(
                datos.gastosDia
            ),

        cajaEsperada:
            normalizarMontoCajaMobile(
                datos.cajaEsperada
            ),

        dineroReal:
            normalizarMontoCajaMobile(
                datos.dineroReal
            ),

        diferencia:
            normalizarMontoCajaMobile(
                datos.diferencia
            )

    };

}


function normalizarGastoCajaMobile(
    datos = {},
    id = ""
){

    const estado =
        String(
            datos.estado ||
            "activo"
        )
            .trim()
            .toLowerCase();


    const anulado =
        datos.anulado === true ||
        estado === "anulado";


    return {

        id:
            String(
                id || ""
            ),

        descripcion:
            String(
                datos.descripcion ||
                "Gasto"
            ),

        monto:
            normalizarMontoCajaMobile(
                datos.monto
            ),

        fecha:
            String(
                datos.fecha ||
                ""
            ),

        fechaISO:
            String(
                datos.fechaISO ||
                ""
            ),

        hora:
            String(
                datos.hora ||
                ""
            ),

        sucursalId:
            normalizarTiendaCajaMobile(
                datos.sucursalId ||
                tiendaCajaMobile
            ),

        sucursalNombre:
            String(
                datos.sucursalNombre ||
                obtenerNombreTiendaCajaMobile(
                    datos.sucursalId ||
                    tiendaCajaMobile
                )
            ),

        registradoPor:
            String(
                datos.registradoPor ||
                "Sin usuario"
            ),

        registradoPorUsuario:
            String(
                datos.registradoPorUsuario ||
                ""
            ),

        origen:
            String(
                datos.origen ||
                ""
            ),

        estado:
            anulado
                ? "anulado"
                : "activo",

        anulado,

        motivoAnulacion:
            String(
                datos.motivoAnulacion ||
                ""
            ),

        anuladoPor:
            String(
                datos.anuladoPor ||
                ""
            ),

        anuladoPorUsuario:
            String(
                datos.anuladoPorUsuario ||
                ""
            ),

        autorizadoPor:
            String(
                datos.autorizadoPor ||
                ""
            ),

        autorizadoPorUsuario:
            String(
                datos.autorizadoPorUsuario ||
                ""
            ),

        fechaAnulacion:
            String(
                datos.fechaAnulacion ||
                ""
            ),

        horaAnulacion:
            String(
                datos.horaAnulacion ||
                ""
            ),

        origenAnulacion:
            String(
                datos.origenAnulacion ||
                ""
            ),

        autorizado:
            datos.autorizado === true

    };

}

// =====================================================
// APERTURA DE CAJA
// =====================================================

async function abrirCajaMobile(
    opciones = {}
){

    if(
        operacionCajaMobileEnProceso
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya se está procesando una operación de caja."

        };

    }


    const montoInicial =
        normalizarMontoCajaMobile(
            opciones.montoInicial
        );


    if(
        !Number.isFinite(
            montoInicial
        ) ||
        montoInicial <= 0
    ){

        return {

            completada:
                false,

            motivo:
                "monto-invalido",

            mensaje:
                "Ingresa un monto inicial válido."

        };

    }


    const sucursalId =
        normalizarTiendaCajaMobile(

            opciones.sucursalId ||

            tiendaCajaMobile ||

            obtenerTiendaVentaMobile() ||

            "principal"

        );


    const fecha =
        obtenerFechaISOCajaMobile();


    const cajaId =
        obtenerIdCajaMobile({

            sucursalId,

            fecha

        });


    const cajaRef =
        doc(

            mobileDB,

            "cajas",

            cajaId

        );


    const nombreUsuario =
        obtenerNombreUsuarioCajaMobile();


    const ahora =
        new Date();


    operacionCajaMobileEnProceso =
        true;


    try{

        await runTransaction(

            mobileDB,

            async function(
                transaccion
            ){

                const snapshot =
                    await transaccion.get(
                        cajaRef
                    );


                if(
                    snapshot.exists()
                ){

                    const cajaExistente =
                        snapshot.data() ||
                        {};


                    if(
                        cajaExistente.abierta ===
                        true
                    ){

                        throw new Error(
                            "CAJA_YA_ABIERTA"
                        );

                    }


                    if(
                        cajaExistente.anulada ===
                        true
                    ){

                        throw new Error(
                            "CAJA_ANULADA"
                        );

                    }


                    throw new Error(
                        "CAJA_YA_REGISTRADA"
                    );

                }


                transaccion.set(

                    cajaRef,

                    {

                        fecha,

                        sucursalId,

                        sucursalNombre:
                            obtenerNombreTiendaCajaMobile(
                                sucursalId
                            ),

                        montoInicial,

                        abierta:
                            true,

                        anulada:
                            false,

                        abiertaPor:
                            nombreUsuario,

                        horaApertura:
                            ahora.toLocaleTimeString(
                                "es-PE"
                            ),

                        creadaEn:
                            serverTimestamp(),

                        origenApertura:
                            "mobile",

                        ventasDia:
                            0,

                        efectivoDia:
                            0,

                        yapeDia:
                            0,

                        plinDia:
                            0,

                        tarjetaDia:
                            0,

                        transferenciaDia:
                            0,

                        gastosDia:
                            0,

                        cajaEsperada:
                            montoInicial,

                        dineroReal:
                            0,

                        diferencia:
                            0,

                        resultadoCuadre:
                            ""

                    }

                );

            }

        );


        return {

            completada:
                true,

            motivo:
                "caja-abierta",

            mensaje:
                `Caja de ${
                    obtenerNombreTiendaCajaMobile(
                        sucursalId
                    )
                } abierta correctamente.`,

            cajaId,

            sucursalId,

            montoInicial

        };

    }catch(error){

        console.error(
            "Error abriendo Caja Mobile:",
            error
        );


        if(
            error?.message ===
            "CAJA_YA_ABIERTA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-ya-abierta",

                mensaje:
                    "La caja seleccionada ya está abierta."

            };

        }


        if(
            error?.message ===
            "CAJA_ANULADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-anulada",

                mensaje:
                    "La caja de hoy fue anulada y no puede abrirse nuevamente."

            };

        }


        if(
            error?.message ===
            "CAJA_YA_REGISTRADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-ya-registrada",

                mensaje:
                    "La caja del día ya fue registrada o cerrada."

            };

        }


        return {

            completada:
                false,

            motivo:
                "error-apertura",

            mensaje:
                error?.message ||
                "No se pudo abrir la caja.",

            error

        };

    }finally{

        operacionCajaMobileEnProceso =
            false;

    }

}

// =====================================================
// REGISTRO DE GASTOS
// =====================================================

async function registrarGastoCajaMobile(
    opciones = {}
){

    if(
        operacionCajaMobileEnProceso
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya se está procesando una operación de caja."

        };

    }


    const descripcion =
        String(
            opciones.descripcion ||
            ""
        )
            .trim();


    const monto =
        normalizarMontoCajaMobile(
            opciones.monto
        );


    if(
        descripcion.length < 3
    ){

        return {

            completada:
                false,

            motivo:
                "descripcion-invalida",

            mensaje:
                "Ingresa una descripción válida para el gasto."

        };

    }


    if(
        !Number.isFinite(
            monto
        ) ||
        monto <= 0
    ){

        return {

            completada:
                false,

            motivo:
                "monto-invalido",

            mensaje:
                "Ingresa un monto de gasto mayor que cero."

        };

    }


    const sucursalId =
        normalizarTiendaCajaMobile(

            opciones.sucursalId ||

            tiendaCajaMobile ||

            obtenerTiendaVentaMobile() ||

            "principal"

        );


    const fechaISO =
        obtenerFechaISOCajaMobile();


    const cajaId =
        obtenerIdCajaMobile({

            sucursalId,

            fecha:
                fechaISO

        });


    const cajaRef =
        doc(

            mobileDB,

            "cajas",

            cajaId

        );


    const gastosRef =
        collection(

            mobileDB,

            "cajas",

            cajaId,

            "gastos"

        );


    const nombreUsuario =
        obtenerNombreUsuarioCajaMobile();

    const sesion =
        obtenerSesionMobile();


    const usuarioRegistro =
        String(
            sesion?.usuario ||
            ""
        );    


    const ahora =
        new Date();


    operacionCajaMobileEnProceso =
        true;


    try{

        const resultado =
            await runTransaction(

                mobileDB,

                async function(
                    transaccion
                ){

                    const snapshotCaja =
                        await transaccion.get(
                            cajaRef
                        );


                    if(
                        !snapshotCaja.exists()
                    ){

                        throw new Error(
                            "CAJA_NO_EXISTE"
                        );

                    }


                    const datosCaja =
                        snapshotCaja.data() ||
                        {};


                    if(
                        datosCaja.anulada ===
                        true
                    ){

                        throw new Error(
                            "CAJA_ANULADA"
                        );

                    }


                    if(
                        datosCaja.abierta !==
                        true
                    ){

                        throw new Error(
                            "CAJA_CERRADA"
                        );

                    }


                    const gastoRef =
                        doc(
                            gastosRef
                        );


                    transaccion.set(

                        gastoRef,

                        {

                            descripcion,

                            monto,

                            fecha:
                                obtenerFechaLocalCajaMobile(
                                    ahora
                                ),

                            fechaISO,

                            hora:
                                obtenerHoraLocalCajaMobile(
                                    ahora
                                ),

                            sucursalId,

                            sucursalNombre:
                                obtenerNombreTiendaCajaMobile(
                                    sucursalId
                                ),

                            registradoPor:
                                nombreUsuario,

                            registradoPorUsuario:
                                usuarioRegistro,

                            creadoEn:
                                serverTimestamp(),

                            origen:
                                "mobile",

                            estado:
                                "activo"

                        }

                    );

                    const gastosActuales =
    normalizarMontoCajaMobile(
        datosCaja.gastosDia
    );


const cajaEsperadaActual =
    normalizarMontoCajaMobile(
        datosCaja.cajaEsperada
    );


const nuevosGastos =
    normalizarMontoCajaMobile(
        gastosActuales +
        monto
    );


const nuevaCajaEsperada =
    normalizarMontoCajaMobile(
        cajaEsperadaActual -
        monto
    );


transaccion.update(

    cajaRef,

    {

        gastosDia:
            nuevosGastos,

        cajaEsperada:
            nuevaCajaEsperada,

        actualizadaEn:
            serverTimestamp(),

        ultimaOperacion:
            "registro-gasto",

        ultimaOperacionOrigen:
            "mobile",

        ultimaOperacionPor:
            nombreUsuario

    }

);


                    return {

                        gastoId:
                            gastoRef.id

                    };

                }

            );


        return {

            completada:
                true,

            motivo:
                "gasto-registrado",

            mensaje:
                "Gasto registrado correctamente.",

            gastoId:
                resultado.gastoId,

            descripcion,

            monto,

            sucursalId

        };

    }catch(error){

        console.error(
            "Error registrando gasto Mobile:",
            error
        );


        if(
            error?.message ===
            "CAJA_NO_EXISTE"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-no-existe",

                mensaje:
                    "Primero debes abrir la caja seleccionada."

            };

        }


        if(
            error?.message ===
            "CAJA_CERRADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-cerrada",

                mensaje:
                    "No puedes registrar gastos porque la caja está cerrada."

            };

        }


        if(
            error?.message ===
            "CAJA_ANULADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-anulada",

                mensaje:
                    "No puedes registrar gastos en una caja anulada."

            };

        }


        return {

            completada:
                false,

            motivo:
                "error-registro-gasto",

            mensaje:
                error?.message ||
                "No se pudo registrar el gasto.",

            error

        };

    }finally{

        operacionCajaMobileEnProceso =
            false;

    }

}

// =====================================================
// ANULACIÓN AUDITADA DE GASTOS
// =====================================================

async function anularGastoCajaMobile(
    opciones = {}
){

    if(
        operacionCajaMobileEnProceso
    ){

        return {

            completada:
                false,

            motivo:
                "operacion-en-proceso",

            mensaje:
                "Ya se está procesando una operación de caja."

        };

    }


    const gastoId =
        String(
            opciones.gastoId ||
            ""
        )
            .trim();


    const motivoAnulacion =
        String(
            opciones.motivo ||
            ""
        )
            .trim();


    const autorizado =
        opciones.autorizado === true;


    const autorizadoPor =
        String(
            opciones.autorizadoPor ||
            ""
        )
            .trim();


    const autorizadoPorUsuario =
        String(
            opciones.autorizadoPorUsuario ||
            ""
        )
            .trim();


    if(!gastoId){

        return {

            completada:
                false,

            motivo:
                "gasto-invalido",

            mensaje:
                "No se encontró el gasto que deseas anular."

        };

    }


    if(
        motivoAnulacion.length < 3
    ){

        return {

            completada:
                false,

            motivo:
                "motivo-invalido",

            mensaje:
                "Ingresa un motivo válido para la anulación."

        };

    }


    if(!autorizado){

        return {

            completada:
                false,

            motivo:
                "autorizacion-requerida",

            mensaje:
                "Esta operación requiere autorización administrativa."

        };

    }


    if(
        !autorizadoPor ||
        !autorizadoPorUsuario
    ){

        return {

            completada:
                false,

            motivo:
                "auditoria-incompleta",

            mensaje:
                "No se pudo identificar al administrador que autorizó la operación."

        };

    }


    const sucursalId =
        normalizarTiendaCajaMobile(

            opciones.sucursalId ||

            tiendaCajaMobile ||

            obtenerTiendaVentaMobile() ||

            "principal"

        );


    const fechaISO =
        obtenerFechaISOCajaMobile();


    const cajaId =
        obtenerIdCajaMobile({

            sucursalId,

            fecha:
                fechaISO

        });


    const cajaRef =
        doc(

            mobileDB,

            "cajas",

            cajaId

        );


    const gastoRef =
        doc(

            mobileDB,

            "cajas",

            cajaId,

            "gastos",

            gastoId

        );


    const sesion =
        obtenerSesionMobile();


    const anuladoPor =
        String(
            sesion?.nombreCompleto ||
            sesion?.nombre ||
            sesion?.usuario ||
            "Sin usuario"
        );


    const anuladoPorUsuario =
        String(
            sesion?.usuario ||
            ""
        );


    const ahora =
        new Date();


    operacionCajaMobileEnProceso =
        true;


    try{

        const resultado =
            await runTransaction(

                mobileDB,

                async function(
                    transaccion
                ){

                    const snapshotCaja =
                        await transaccion.get(
                            cajaRef
                        );


                    if(
                        !snapshotCaja.exists()
                    ){

                        throw new Error(
                            "CAJA_NO_EXISTE"
                        );

                    }


                    const datosCaja =
                        snapshotCaja.data() ||
                        {};


                    if(
                        datosCaja.anulada ===
                        true
                    ){

                        throw new Error(
                            "CAJA_ANULADA"
                        );

                    }


                    if(
                        datosCaja.abierta !==
                        true
                    ){

                        throw new Error(
                            "CAJA_CERRADA"
                        );

                    }


                    const snapshotGasto =
                        await transaccion.get(
                            gastoRef
                        );


                    if(
                        !snapshotGasto.exists()
                    ){

                        throw new Error(
                            "GASTO_NO_EXISTE"
                        );

                    }


                    const datosGasto =
                        snapshotGasto.data() ||
                        {};


                    const gastoYaAnulado =
                        datosGasto.anulado === true ||
                        String(
                            datosGasto.estado ||
                            ""
                        )
                            .trim()
                            .toLowerCase() ===
                            "anulado";


                    if(gastoYaAnulado){

                        throw new Error(
                            "GASTO_YA_ANULADO"
                        );

                    }


                    const montoGasto =
                        normalizarMontoCajaMobile(
                            datosGasto.monto
                        );


                    transaccion.update(

                        gastoRef,

                        {

                            estado:
                                "anulado",

                            anulado:
                                true,

                            motivoAnulacion,

                            anuladoPor,

                            anuladoPorUsuario,

                            autorizado:
                                true,

                            autorizadoPor,

                            autorizadoPorUsuario,

                            fechaAnulacion:
                                obtenerFechaLocalCajaMobile(
                                    ahora
                                ),

                            fechaAnulacionISO:
                                fechaISO,

                            horaAnulacion:
                                obtenerHoraLocalCajaMobile(
                                    ahora
                                ),

                            anuladaEn:
                                serverTimestamp(),

                            origenAnulacion:
                                "mobile"

                        }

                    );


                    const gastosActuales =
                        normalizarMontoCajaMobile(
                            datosCaja.gastosDia
                        );


                    const cajaEsperadaActual =
                        normalizarMontoCajaMobile(
                            datosCaja.cajaEsperada
                        );


                    const nuevosGastos =
                        normalizarMontoCajaMobile(
                            Math.max(
                                0,
                                gastosActuales -
                                montoGasto
                            )
                        );


                    const nuevaCajaEsperada =
                        normalizarMontoCajaMobile(
                            cajaEsperadaActual +
                            montoGasto
                        );


                    transaccion.update(

                        cajaRef,

                        {

                            gastosDia:
                                nuevosGastos,

                            cajaEsperada:
                                nuevaCajaEsperada,

                            actualizadaEn:
                                serverTimestamp(),

                            ultimaOperacion:
                                "anulacion-gasto",

                            ultimaOperacionOrigen:
                                "mobile",

                            ultimaOperacionPor:
                                anuladoPor

                        }

                    );


                    return {

                        gastoId,

                        monto:
                            montoGasto,

                        gastosDia:
                            nuevosGastos,

                        cajaEsperada:
                            nuevaCajaEsperada

                    };

                }

            );


        return {

            completada:
                true,

            motivo:
                "gasto-anulado",

            mensaje:
                "Gasto anulado correctamente.",

            gastoId:
                resultado.gastoId,

            monto:
                resultado.monto,

            gastosDia:
                resultado.gastosDia,

            cajaEsperada:
                resultado.cajaEsperada,

            sucursalId,

            anuladoPor,

            anuladoPorUsuario,

            autorizadoPor,

            autorizadoPorUsuario

        };

    }catch(error){

        console.error(
            "Error anulando gasto Mobile:",
            error
        );


        if(
            error?.message ===
            "CAJA_NO_EXISTE"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-no-existe",

                mensaje:
                    "No se encontró la caja seleccionada."

            };

        }


        if(
            error?.message ===
            "CAJA_CERRADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-cerrada",

                mensaje:
                    "No puedes anular gastos porque la caja está cerrada."

            };

        }


        if(
            error?.message ===
            "CAJA_ANULADA"
        ){

            return {

                completada:
                    false,

                motivo:
                    "caja-anulada",

                mensaje:
                    "No puedes modificar una caja anulada."

            };

        }


        if(
            error?.message ===
            "GASTO_NO_EXISTE"
        ){

            return {

                completada:
                    false,

                motivo:
                    "gasto-no-existe",

                mensaje:
                    "El gasto seleccionado ya no existe."

            };

        }


        if(
            error?.message ===
            "GASTO_YA_ANULADO"
        ){

            return {

                completada:
                    false,

                motivo:
                    "gasto-ya-anulado",

                mensaje:
                    "Este gasto ya fue anulado anteriormente."

            };

        }


        return {

            completada:
                false,

            motivo:
                "error-anulacion-gasto",

            mensaje:
                error?.message ||
                "No se pudo anular el gasto.",

            error

        };

    }finally{

        operacionCajaMobileEnProceso =
            false;

    }

}


// =====================================================
// CONSULTAS
// =====================================================

function obtenerCajaActualMobile(){

    return {

        ...cajaActualMobile

    };

}


function obtenerGastosCajaMobile(){

    return gastosCajaMobile.map(
        function(gasto){

            return {

                ...gasto

            };

        }
    );

}


function estaCajaAbiertaMobile(){

    return (
        cajaActualMobile.existe &&
        cajaActualMobile.abierta &&
        !cajaActualMobile.anulada
    );

}

function estaOperacionCajaMobileEnProceso(){

    return operacionCajaMobileEnProceso;

}


// =====================================================
// SUSCRIPTORES
// =====================================================

function notificarCajaMobile(){

    const estado = {

        caja:
            obtenerCajaActualMobile(),

        gastos:
            obtenerGastosCajaMobile(),

        tienda:
            obtenerTiendaCajaMobile()

    };


    suscriptoresCajaMobile.forEach(
        function(callback){

            try{

                callback(
                    estado
                );

            }catch(error){

                console.error(
                    "Error notificando estado de caja:",
                    error
                );

            }

        }
    );

}


function suscribirseCajaMobile(
    callback
){

    if(
        typeof callback !==
        "function"
    ){

        return function(){};

    }


    suscriptoresCajaMobile.add(
        callback
    );


    callback({

        caja:
            obtenerCajaActualMobile(),

        gastos:
            obtenerGastosCajaMobile(),

        tienda:
            obtenerTiendaCajaMobile()

    });


    return function(){

        suscriptoresCajaMobile.delete(
            callback
        );

    };

}


// =====================================================
// LISTENER DE CAJA
// =====================================================

function escucharDocumentoCajaMobile(){

    const cajaId =
        obtenerIdCajaMobile();


    const cajaRef =
        doc(
            mobileDB,
            "cajas",
            cajaId
        );


    detenerListenerCajaMobile =
        onSnapshot(

            cajaRef,

            function(snapshot){

                if(
                    !snapshot.exists()
                ){

                    cajaActualMobile =
                        crearEstadoCajaVacioMobile({

                            sucursalId:
                                tiendaCajaMobile

                        });


                    cajaActualMobile.id =
                        cajaId;


                    notificarCajaMobile();

                    return;

                }


                cajaActualMobile =
                    normalizarCajaMobile(

                        snapshot.data(),

                        snapshot.id

                    );


                notificarCajaMobile();

            },

            function(error){

                console.error(
                    "Error escuchando caja Mobile:",
                    error
                );

            }

        );

}


// =====================================================
// LISTENER DE GASTOS
// =====================================================

function escucharGastosCajaMobile(){

    const cajaId =
        obtenerIdCajaMobile();


    const gastosRef =
        collection(

            mobileDB,

            "cajas",

            cajaId,

            "gastos"

        );


    detenerListenerGastosMobile =
        onSnapshot(

            gastosRef,

            function(snapshot){

                gastosCajaMobile =
                    [];


                snapshot.forEach(
                    function(documento){

                        gastosCajaMobile.push(

                            normalizarGastoCajaMobile(

                                documento.data(),

                                documento.id

                            )

                        );

                    }
                );


                gastosCajaMobile.sort(
                    function(a, b){

                        return String(
                            b.hora || ""
                        ).localeCompare(
                            String(
                                a.hora || ""
                            )
                        );

                    }
                );


                notificarCajaMobile();

            },

            function(error){

                console.error(
                    "Error escuchando gastos Mobile:",
                    error
                );

            }

        );

}


// =====================================================
// MOTOR REALTIME
// =====================================================

function iniciarRealtimeCajaMobile(
    tienda
){

    detenerRealtimeCajaMobile();


    tiendaCajaMobile =
        normalizarTiendaCajaMobile(
            tienda ||
            obtenerTiendaVentaMobile() ||
            "principal"
        );


    cajaActualMobile =
        crearEstadoCajaVacioMobile({

            sucursalId:
                tiendaCajaMobile

        });


    gastosCajaMobile =
        [];


    escucharDocumentoCajaMobile();

    escucharGastosCajaMobile();

    notificarCajaMobile();

}


function detenerRealtimeCajaMobile(){

    if(
        typeof detenerListenerCajaMobile ===
        "function"
    ){

        detenerListenerCajaMobile();

    }


    if(
        typeof detenerListenerGastosMobile ===
        "function"
    ){

        detenerListenerGastosMobile();

    }


    detenerListenerCajaMobile =
        null;


    detenerListenerGastosMobile =
        null;

}


// =====================================================
// REINICIO
// =====================================================

function reiniciarCajaActualMobile(){

    detenerRealtimeCajaMobile();


    tiendaCajaMobile =
        "principal";


    cajaActualMobile =
        crearEstadoCajaVacioMobile();


    gastosCajaMobile =
        [];


    suscriptoresCajaMobile.clear();


    operacionCajaMobileEnProceso =
        false;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    obtenerFechaISOCajaMobile,

    normalizarTiendaCajaMobile,

    obtenerNombreTiendaCajaMobile,

    obtenerIdCajaMobile,

    obtenerTiendaCajaMobile,

    establecerTiendaCajaMobile,

    obtenerCajaActualMobile,

    obtenerGastosCajaMobile,

    estaCajaAbiertaMobile,

    estaOperacionCajaMobileEnProceso,

    abrirCajaMobile,

    registrarGastoCajaMobile,

    anularGastoCajaMobile,

    suscribirseCajaMobile,

    iniciarRealtimeCajaMobile,

    detenerRealtimeCajaMobile,

    reiniciarCajaActualMobile

};