// =====================================================
// DIGITAL CENTER M&A
// SERVICIO DE MANTENIMIENTO MOBILE
// =====================================================

import {
    mobileFunctions,
    httpsCallable
} from "../firebase-mobile.js";


/**
 * Ejecuta el diagnóstico seguro de datos operativos.
 *
 * Esta función:
 * - NO elimina documentos
 * - NO modifica inventario
 * - NO reinicia correlativos
 *
 * Solo consulta:
 * - ventas
 * - boletas
 * - cajas
 * - gastos
 * - último número de boleta
 */
export async function diagnosticarDatosOperativosMobile() {

    try {

        const diagnosticarDatosOperativos =
            httpsCallable(
                mobileFunctions,
                "diagnosticarDatosOperativos"
            );

        const respuesta =
            await diagnosticarDatosOperativos();

        const datos =
            respuesta?.data || {};

        if (datos.ok !== true) {

            throw new Error(
                datos.mensaje ||
                "El diagnóstico no pudo completarse."
            );

        }

        return {
            ok: true,

            mensaje:
                datos.mensaje ||
                "Diagnóstico completado correctamente.",

            datos: {
                ventas:
                    Number(
                        datos.datos?.ventas || 0
                    ),

                boletas:
                    Number(
                        datos.datos?.boletas || 0
                    ),

                cajas:
                    Number(
                        datos.datos?.cajas || 0
                    ),

                gastos:
                    Number(
                        datos.datos?.gastos || 0
                    ),

                ultimoNumeroBoleta:
                    Number(
                        datos.datos?.ultimoNumeroBoleta || 0
                    )
            },

            inventarioProtegido:
                datos.inventarioProtegido === true
        };

    } catch (error) {

        console.error(
            "[Mantenimiento Mobile] Error en diagnóstico:",
            error
        );

        const codigo =
            error?.code || "";

        if (
            codigo.includes("unauthenticated")
        ) {

            throw new Error(
                "Debes iniciar sesión nuevamente."
            );

        }

        if (
            codigo.includes("permission-denied")
        ) {

            throw new Error(
                "Esta herramienta está disponible únicamente para administradores."
            );

        }

        throw new Error(
            error?.message ||
            "No se pudo consultar el estado de los datos operativos."
        );

    }

}

/**
 * Restablece los datos operativos del sistema.
 *
 * ELIMINA:
 * - ventas
 * - boletas
 * - cajas
 * - gastos internos de cajas
 *
 * REINICIA:
 * - correlativo de boletas
 *
 * PROTEGE:
 * - productos
 * - stock
 * - stockTiendas
 * - precios
 * - imágenes
 * - usuarios
 * - roles
 * - tokens de notificaciones
 */
export async function restablecerDatosOperativosMobile(
    confirmacion
){

    const frase =
        String(
            confirmacion || ""
        ).trim();


    if(
        frase !==
        "RESTABLECER DIGITAL CENTER"
    ){

        throw new Error(
            "La frase de confirmación no coincide."
        );

    }


    try{

        const restablecerDatosOperativos =
            httpsCallable(
                mobileFunctions,
                "restablecerDatosOperativos"
            );


        const respuesta =
            await restablecerDatosOperativos({
                confirmacion:
                    frase
            });


        const datos =
            respuesta?.data || {};


        if(
            datos.ok !==
            true
        ){

            throw new Error(
                datos.mensaje ||
                "El restablecimiento no pudo completarse."
            );

        }


        return {
            ok: true,

            mensaje:
                datos.mensaje ||
                "Los datos operativos fueron restablecidos correctamente.",

            eliminados: {
                ventas:
                    Number(
                        datos.eliminados?.ventas || 0
                    ),

                boletas:
                    Number(
                        datos.eliminados?.boletas || 0
                    ),

                cajas:
                    Number(
                        datos.eliminados?.cajas || 0
                    ),

                gastos:
                    Number(
                        datos.eliminados?.gastos || 0
                    )
            },

            correlativo: {
                anterior:
                    Number(
                        datos.correlativo?.anterior || 0
                    ),

                actual:
                    Number(
                        datos.correlativo?.actual || 0
                    )
            },

            inventarioProtegido:
                datos.inventarioProtegido === true,

            auditoriaId:
                String(
                    datos.auditoriaId || ""
                )
        };

    }catch(error){

        console.error(
            "[Mantenimiento Mobile] Error al restablecer:",
            error
        );


        const codigo =
            String(
                error?.code || ""
            );


        if(
            codigo.includes(
                "unauthenticated"
            )
        ){

            throw new Error(
                "Debes iniciar sesión nuevamente."
            );

        }


        if(
            codigo.includes(
                "permission-denied"
            )
        ){

            throw new Error(
                "Esta herramienta está disponible únicamente para administradores."
            );

        }


        if(
            codigo.includes(
                "failed-precondition"
            )
        ){

            throw new Error(
                "La frase de confirmación no coincide."
            );

        }


        throw new Error(
            error?.message ||
            "No se pudo completar el restablecimiento de datos operativos."
        );

    }

}