// =====================================================
// DIGITAL CENTER M&A MOBILE
// BOLETA MOBILE SERVICE
// M12.1 - MOTOR DE BOLETA ENTERPRISE
// =====================================================

import {

    construirHTMLReimpresionBoleta

} from "../../../js/boleta.js";

let impresionBoletaMobileEnProceso = false;

// =====================================================
// UTILIDADES
// =====================================================

function escaparHTMLBoletaMobile(valor){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function normalizarMontoBoletaMobile(valor){

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;

}


function formatearMontoBoletaMobile(valor){

    return normalizarMontoBoletaMobile(valor)
        .toFixed(2);

}


function normalizarNumeroBoletaMobile(valor){

    const numero = String(
        valor ?? ""
    ).trim();

    if(!numero){
        return "SIN NÚMERO";
    }

    if(
        numero.toUpperCase()
            .startsWith("B001-")
    ){
        return numero;
    }

    return `B001-${numero}`;

}


// =====================================================
// DETALLE DE PAGOS
// =====================================================

export function construirDetallePagosBoletaMobile(
    venta
){

    const pagos = venta?.pagos;

    if(pagos){

        const detalle = [];

        const metodos = [
            ["efectivo", "Efectivo"],
            ["yape", "Yape"],
            ["plin", "Plin"],
            ["tarjeta", "Tarjeta"],
            [
                "transferencia",
                "Transferencia"
            ]
        ];

        metodos.forEach(function([
            clave,
            nombre
        ]){

            const monto =
                normalizarMontoBoletaMobile(
                    pagos[clave]
                );

            if(monto > 0){

                detalle.push(
                    `${nombre}: S/ ${
                        formatearMontoBoletaMobile(
                            monto
                        )
                    }`
                );

            }

        });

        if(detalle.length > 0){

            return detalle.join("<br>");

        }

    }

    return escaparHTMLBoletaMobile(
        venta?.metodoPago ||
        "No registrado"
    );

}

// =====================================================
// VENTA NUEVA
// =====================================================

export function construirHTMLBoletaMobile(
    venta
){

    const detallePagos =
        construirDetallePagosBoletaMobile(
            venta
        );

    return construirHTMLReimpresionBoleta(
        venta,
        detallePagos,
        {
            esReimpresion:
                false
        }
    );

}


// =====================================================
// REIMPRESIÓN
// =====================================================

export function construirHTMLReimpresionBoletaMobile(
    venta
){

    const detallePagos =
        construirDetallePagosBoletaMobile(
            venta
        );

    return construirHTMLReimpresionBoleta(
        venta,
        detallePagos,
        {
            esReimpresion:
                true
        }
    );

}


// =====================================================
// IMPRESIÓN
// =====================================================

export function impresionBoletaEstaEnProcesoMobile(){

    return impresionBoletaMobileEnProceso;

}


export async function imprimirHTMLBoletaMobile(
    contenidoHTML
){

    if(impresionBoletaMobileEnProceso){

        throw new Error(
            "Ya existe una impresión en proceso."
        );

    }

    if(!contenidoHTML){

        throw new Error(
            "No existe contenido para imprimir."
        );

    }

    impresionBoletaMobileEnProceso = true;

    let ventanaImpresion = null;

    try{

ventanaImpresion =
    window.open(
        "",
        "_blank",
        "width=420,height=720"
    );


if(!ventanaImpresion){

    throw new Error(
        "El navegador bloqueó la ventana de impresión."
    );

}


try{

    ventanaImpresion.opener =
        null;

}catch(errorAislamiento){

    console.warn(
        "No se pudo aislar la ventana de impresión:",
        errorAislamiento
    );

}


ventanaImpresion.document.open();

ventanaImpresion.document.write(
    contenidoHTML
);

ventanaImpresion.document.close();

        await esperarRecursosBoletaMobile(
            ventanaImpresion
        );

        ventanaImpresion.focus();

        ventanaImpresion.print();

        return true;

    }finally{

        window.setTimeout(function(){

            impresionBoletaMobileEnProceso =
                false;

        }, 900);

    }

}


// =====================================================
// CARGA DE LOGO Y QR
// =====================================================

function esperarRecursosBoletaMobile(
    ventanaImpresion
){

    return new Promise(function(resolve){

        const documento =
            ventanaImpresion.document;

        const imagenes =
            Array.from(
                documento.images || []
            );

        if(imagenes.length === 0){

            window.setTimeout(
                resolve,
                250
            );

            return;

        }

        let pendientes =
            imagenes.length;

        let finalizado =
            false;

        function terminar(){

            if(finalizado){
                return;
            }

            pendientes -= 1;

            if(pendientes <= 0){

                finalizado = true;

                window.setTimeout(
                    resolve,
                    180
                );

            }

        }

        imagenes.forEach(function(imagen){

            if(imagen.complete){

                terminar();
                return;

            }

            imagen.addEventListener(
                "load",
                terminar,
                {
                    once:true
                }
            );

            imagen.addEventListener(
                "error",
                terminar,
                {
                    once:true
                }
            );

        });

        window.setTimeout(function(){

            if(finalizado){
                return;
            }

            finalizado = true;
            resolve();

        }, 2500);

    });

}