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