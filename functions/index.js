const { setGlobalOptions } = require("firebase-functions");

const {
    onDocumentCreated
} = require("firebase-functions/v2/firestore");

const {
    onCall,
    HttpsError
} = require("firebase-functions/v2/https");

const admin = require("firebase-admin");

setGlobalOptions({
    maxInstances: 10
});

admin.initializeApp();

const db = admin.firestore();

const FRASE_RESTABLECIMIENTO = "RESTABLECER DIGITAL CENTER";

/**
 * Verifica que la llamada provenga de un administrador autenticado.
 *
 * Acepta cualquiera de estos claims administrativos:
 * - admin: true
 * - rol: "admin"
 */
function verificarAdministrador(request) {
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Debes iniciar sesión para utilizar esta función."
        );
    }

    const token = request.auth.token || {};

    const esAdministrador =
        token.admin === true ||
        token.rol === "admin";

    if (!esAdministrador) {
        throw new HttpsError(
            "permission-denied",
            "Esta operación está disponible únicamente para administradores."
        );
    }

    return {
        uid: request.auth.uid,
        email: token.email || null,
        nombre: token.name || null,
        rol: token.rol || null
    };
}

/**
 * Cuenta los documentos de una colección sin descargarlos.
 */
async function contarColeccion(nombreColeccion) {
    const resultado = await db
        .collection(nombreColeccion)
        .count()
        .get();

    return resultado.data().count || 0;
}

/**
 * Cuenta los gastos guardados dentro de:
 * cajas/{cajaId}/gastos/{gastoId}
 */
async function contarGastosDeCajas() {
    const cajasSnapshot = await db
        .collection("cajas")
        .select()
        .get();

    let totalGastos = 0;

    for (const cajaDoc of cajasSnapshot.docs) {
        const resultado = await cajaDoc.ref
            .collection("gastos")
            .count()
            .get();

        totalGastos += resultado.data().count || 0;
    }

    return totalGastos;
}

/**
 * Lee el correlativo actual de las boletas.
 */
async function obtenerUltimoNumeroBoleta() {
    const configuracionRef = db
        .collection("configuracion")
        .doc("boletas");

    const configuracionSnapshot = await configuracionRef.get();

    if (!configuracionSnapshot.exists) {
        return 0;
    }

    return Number(
        configuracionSnapshot.data()?.ultimoNumero || 0
    );
}

/**
 * Elimina recursivamente una colección.
 *
 * Esto también elimina subcolecciones internas.
 */
async function eliminarColeccionRecursivamente(nombreColeccion) {
    const coleccionRef = db.collection(nombreColeccion);

    await db.recursiveDelete(coleccionRef);
}

/**
 * Ejecuta una limpieza operativa configurable.
 *
 * Este motor centraliza:
 * - conteo previo;
 * - eliminación de colecciones;
 * - reinicio opcional del correlativo;
 * - auditoría;
 * - resumen final.
 *
 * Nunca modifica:
 * - productos;
 * - stock;
 * - stockTiendas;
 * - precios;
 * - imágenes;
 * - usuarios;
 * - roles;
 * - tokens de notificaciones.
 */
async function ejecutarLimpiezaOperativa({
    administrador,
    accion,
    eliminarVentas = false,
    eliminarBoletas = false,
    eliminarCajas = false,
    reiniciarCorrelativo = false
}) {
    const [
        ventasAntes,
        boletasAntes,
        cajasAntes,
        gastosAntes,
        ultimoNumeroBoletaAntes
    ] = await Promise.all([
        eliminarVentas
            ? contarColeccion("ventas")
            : Promise.resolve(0),

        eliminarBoletas
            ? contarColeccion("boletas")
            : Promise.resolve(0),

        eliminarCajas
            ? contarColeccion("cajas")
            : Promise.resolve(0),

        eliminarCajas
            ? contarGastosDeCajas()
            : Promise.resolve(0),

        obtenerUltimoNumeroBoleta()
    ]);


    if (eliminarVentas) {
        await eliminarColeccionRecursivamente(
            "ventas"
        );
    }


    if (eliminarBoletas) {
        await eliminarColeccionRecursivamente(
            "boletas"
        );
    }


    if (eliminarCajas) {
        await eliminarColeccionRecursivamente(
            "cajas"
        );
    }


    let correlativoActual =
        ultimoNumeroBoletaAntes;


    if (reiniciarCorrelativo) {
        correlativoActual = 0;

        await db
            .collection("configuracion")
            .doc("boletas")
            .set(
                {
                    ultimoNumero:
                        0,

                    actualizadoEn:
                        admin.firestore.FieldValue.serverTimestamp(),

                    actualizadoPor:
                        administrador.uid
                },
                {
                    merge:
                        true
                }
            );
    }


    const eliminados = {
        ventas:
            ventasAntes,

        boletas:
            boletasAntes,

        cajas:
            cajasAntes,

        gastos:
            gastosAntes
    };


    const auditoriaRef =
        await db
            .collection("mantenimientoAuditoria")
            .add({
                accion,

                ejecutadoPor: {
                    uid:
                        administrador.uid,

                    email:
                        administrador.email,

                    nombre:
                        administrador.nombre,

                    rol:
                        administrador.rol
                },

                configuracion: {
                    eliminarVentas,
                    eliminarBoletas,
                    eliminarCajas,
                    reiniciarCorrelativo
                },

                eliminados,

                correlativoAnterior:
                    ultimoNumeroBoletaAntes,

                correlativoNuevo:
                    correlativoActual,

                inventarioModificado:
                    false,

                fecha:
                    admin.firestore.FieldValue.serverTimestamp()
            });


    return {
        eliminados,

        correlativo: {
            anterior:
                ultimoNumeroBoletaAntes,

            actual:
                correlativoActual
        },

        inventarioProtegido:
            true,

        auditoriaId:
            auditoriaRef.id
    };
}

/**
 * ============================================================
 * NOTIFICACIÓN AUTOMÁTICA AL CREAR UNA VENTA
 * ============================================================
 */
exports.notificarNuevaVenta = onDocumentCreated(
    "ventas/{ventaId}",
    async (event) => {
        const venta = event.data.data();

        const total = Number(venta.total || 0).toFixed(2);
        const vendedor = venta.vendedor || "Sin vendedor";

        const tokensSnapshot = await db
            .collection("tokensNotificaciones")
            .get();

        const tokens = [];

        tokensSnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.token) {
                tokens.push(data.token);
            }
        });

        if (tokens.length === 0) {
            console.log("No hay tokens registrados");
            return;
        }

        const message = {
            notification: {
                title: "💰 Nueva venta realizada",
                body: `Total: S/ ${total} | Atendido por: ${vendedor}`
            },
            tokens
        };

        const response = await admin
            .messaging()
            .sendEachForMulticast(message);

        console.log(
            "Notificaciones enviadas:",
            response.successCount
        );

        console.log(
            "Errores:",
            response.failureCount
        );
    }
);

/**
 * ============================================================
 * DIAGNÓSTICO DE DATOS OPERATIVOS
 * ============================================================
 *
 * Esta función NO borra ni modifica información.
 *
 * Cuenta:
 * - ventas
 * - boletas
 * - cajas
 * - gastos internos de las cajas
 * - correlativo actual de boletas
 */
exports.diagnosticarDatosOperativos = onCall(
    {
        region: "southamerica-west1"
    },
    async (request) => {
        const administrador = verificarAdministrador(request);

        console.log(
            "Diagnóstico solicitado por:",
            administrador.uid,
            administrador.email
        );

        try {
            const [
                ventas,
                boletas,
                cajas,
                gastos,
                ultimoNumeroBoleta
            ] = await Promise.all([
                contarColeccion("ventas"),
                contarColeccion("boletas"),
                contarColeccion("cajas"),
                contarGastosDeCajas(),
                obtenerUltimoNumeroBoleta()
            ]);

            return {
                ok: true,
                modo: "diagnostico",
                mensaje:
                    "Diagnóstico completado. No se eliminó ningún documento.",

                datos: {
                    ventas,
                    boletas,
                    cajas,
                    gastos,
                    ultimoNumeroBoleta
                },

                inventarioProtegido: true
            };
        } catch (error) {
            console.error(
                "Error al diagnosticar datos operativos:",
                error
            );

            throw new HttpsError(
                "internal",
                "No se pudo completar el diagnóstico de datos operativos."
            );
        }
    }
);

/**
 * ============================================================
 * RESTABLECIMIENTO DE DATOS OPERATIVOS
 * ============================================================
 *
 * ELIMINA:
 * - ventas
 * - boletas
 * - cajas
 * - gastos internos de las cajas
 *
 * REINICIA:
 * - configuracion/boletas.ultimoNumero
 *
 * NO MODIFICA:
 * - productos
 * - stock
 * - stockTiendas
 * - precios
 * - imágenes
 * - usuarios
 * - roles
 * - tokens de notificaciones
 */
exports.restablecerDatosOperativos = onCall(
    {
        region: "southamerica-west1",
        timeoutSeconds: 540,
        memory: "512MiB"
    },
    async (request) => {
        const administrador = verificarAdministrador(request);

        const confirmacion = String(
            request.data?.confirmacion || ""
        ).trim();

        if (confirmacion !== FRASE_RESTABLECIMIENTO) {
            throw new HttpsError(
                "failed-precondition",
                `Debes escribir exactamente: ${FRASE_RESTABLECIMIENTO}`
            );
        }

        console.warn(
            "RESTABLECIMIENTO solicitado por:",
            administrador.uid,
            administrador.email
        );

try {

    const resultado =
        await ejecutarLimpiezaOperativa({

            administrador,

            accion:
                "restablecerDatosOperativos",

            eliminarVentas:
                true,

            eliminarBoletas:
                true,

            eliminarCajas:
                true,

            reiniciarCorrelativo:
                true

        });


    console.warn(
        "RESTABLECIMIENTO completado:",
        resultado.auditoriaId
    );


    return {

        ok:
            true,

        mensaje:
            "Los datos operativos fueron restablecidos correctamente.",

        eliminados:
            resultado.eliminados,

        correlativo:
            resultado.correlativo,

        inventarioProtegido:
            resultado.inventarioProtegido,

        auditoriaId:
            resultado.auditoriaId

    };
    
        } catch (error) {
            console.error(
                "Error al restablecer los datos operativos:",
                error
            );

            if (error instanceof HttpsError) {
                throw error;
            }

            throw new HttpsError(
                "internal",
                "No se pudo completar el restablecimiento de datos operativos."
            );
        }
    }
);

/**
 * ============================================================
 * ELIMINAR SOLO VENTAS
 * ============================================================
 *
 * ELIMINA:
 * - ventas
 * - boletas
 *
 * NO MODIFICA:
 * - cajas
 * - gastos
 * - correlativo
 * - inventario
 */
exports.eliminarSoloVentas = onCall(
    {
        region: "southamerica-west1",
        timeoutSeconds: 540,
        memory: "512MiB"
    },
    async (request) => {

        const administrador =
            verificarAdministrador(request);

        const confirmacion =
            String(
                request.data?.confirmacion || ""
            ).trim();

        if (
            confirmacion !==
            FRASE_RESTABLECIMIENTO
        ) {
            throw new HttpsError(
                "failed-precondition",
                `Debes escribir exactamente: ${FRASE_RESTABLECIMIENTO}`
            );
        }

        console.warn(
            "ELIMINAR SOLO VENTAS solicitado por:",
            administrador.uid,
            administrador.email
        );

        try {

            const resultado =
                await ejecutarLimpiezaOperativa({

                    administrador,

                    accion:
                        "eliminarSoloVentas",

                    eliminarVentas:
                        true,

                    eliminarBoletas:
                        true,

                    eliminarCajas:
                        false,

                    reiniciarCorrelativo:
                        false

                });

            console.warn(
                "ELIMINAR SOLO VENTAS completado:",
                resultado.auditoriaId
            );

            return {

                ok: true,

                mensaje:
                    "Las ventas y boletas fueron eliminadas correctamente.",

                eliminados:
                    resultado.eliminados,

                correlativo:
                    resultado.correlativo,

                inventarioProtegido:
                    resultado.inventarioProtegido,

                auditoriaId:
                    resultado.auditoriaId

            };

        } catch (error) {

            console.error(
                "Error al eliminar solo ventas:",
                error
            );

            if (error instanceof HttpsError) {
                throw error;
            }

            throw new HttpsError(
                "internal",
                "No se pudo completar la eliminación de ventas."
            );

        }

    }
);