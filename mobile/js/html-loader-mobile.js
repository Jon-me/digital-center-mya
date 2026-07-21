// =====================================================
// DIGITAL CENTER M&A
// MOBILE HTML LOADER
// FASE M1
// =====================================================

export async function cargarFragmentoMobile(
    ruta,
    selectorDestino
){

    const destino =
        document.querySelector(
            selectorDestino
        );

    if(!destino){

        throw new Error(
            `No existe el destino móvil: ${selectorDestino}`
        );

    }

    const respuesta =
        await fetch(
            ruta,
            {
                cache: "no-store"
            }
        );

    if(!respuesta.ok){

        throw new Error(
            `No se pudo cargar ${ruta}. Código: ${respuesta.status}`
        );

    }

    const html =
        await respuesta.text();

    destino.innerHTML =
        html;

}