// =====================================================
// DIGITAL CENTER M&A MOBILE
// BOLETA MOBILE SERVICE
// M12.1 - MOTOR DE BOLETA ENTERPRISE
// =====================================================

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
// PRODUCTOS
// =====================================================

function construirProductosBoletaMobile(
    productos
){

    if(
        !Array.isArray(productos) ||
        productos.length === 0
    ){

        return `
            <div class="producto-vacio">
                Sin productos registrados
            </div>
        `;

    }

    return productos
        .map(function(item){

            const nombre =
                escaparHTMLBoletaMobile(
                    item.nombreBoleta ||
                    item.producto ||
                    "Producto"
                );

            const cantidad =
                normalizarMontoBoletaMobile(
                    item.cantidad
                );

            const precio =
                normalizarMontoBoletaMobile(
                    item.precio
                );

            const subtotalGuardado =
                normalizarMontoBoletaMobile(
                    item.subtotal
                );

            const subtotal =
                subtotalGuardado > 0
                    ? subtotalGuardado
                    : cantidad * precio;

            return `
                <div class="producto">

                    <div class="producto-nombre">
                        ${nombre}
                    </div>

                    <div class="producto-detalle">

                        <span>
                            ${cantidad}
                            x S/
                            ${
                                formatearMontoBoletaMobile(
                                    precio
                                )
                            }
                        </span>

                        <span>
                            S/
                            ${
                                formatearMontoBoletaMobile(
                                    subtotal
                                )
                            }
                        </span>

                    </div>

                </div>
            `;

        })
        .join("");

}


// =====================================================
// PLANTILLA PRINCIPAL
// =====================================================

function construirDocumentoBoletaMobile({
    venta,
    tituloDocumento,
    esReimpresion = false
}){

    const productos =
        venta.productos ||
        venta.carrito ||
        [];

    const productosHTML =
        construirProductosBoletaMobile(
            productos
        );

    const numeroBoleta =
        normalizarNumeroBoletaMobile(
            venta.numeroBoleta ||
            venta.numeroVenta
        );

    const fecha =
        escaparHTMLBoletaMobile(
            venta.fecha ||
            venta.fechaISO ||
            "-"
        );

    const hora =
        escaparHTMLBoletaMobile(
            venta.hora ||
            "-"
        );

    const vendedor =
        escaparHTMLBoletaMobile(
            venta.vendedor ||
            "Vendedor"
        );

    const clienteNombre =
        escaparHTMLBoletaMobile(
            venta.clienteNombre ||
            "CLIENTE GENERAL"
        );

    const clienteDni =
        escaparHTMLBoletaMobile(
            venta.clienteDni ||
            "-"
        );

    const tienda =
        escaparHTMLBoletaMobile(
            venta.tiendaVentaNombre ||
            venta.tiendaVenta ||
            "-"
        );

    const descuento =
        normalizarMontoBoletaMobile(
            venta.descuento
        );

    const subtotal =
        normalizarMontoBoletaMobile(
            venta.subtotal ??
            venta.totalAntesDescuento ??
            venta.total
        );

    const totalFinal =
        normalizarMontoBoletaMobile(
            venta.totalFinal ??
            venta.total
        );

    const detallePagos =
        construirDetallePagosBoletaMobile(
            venta
        );

    const etiquetaDocumento =
        escaparHTMLBoletaMobile(
            tituloDocumento
        );

    return `
<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<base href="${window.location.href}">

<title>
    ${etiquetaDocumento}
    ${numeroBoleta}
</title>

<style>

*{
    box-sizing:border-box;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
}

html,
body{
    margin:0;
    padding:0;
}

body{
    min-height:100vh;
    padding:24px 12px;

    display:flex;
    justify-content:center;
    align-items:flex-start;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    background:#e2e8f0;
    color:#0f172a;
}

.boleta{
    position:relative;
    overflow:hidden;

    width:100%;
    max-width:300px;

    padding:20px;

    background:#ffffff;

    border-radius:18px;

    box-shadow:
        0 18px 45px
        rgba(15, 23, 42, 0.22);
}

.marca-agua{
    position:absolute;

    top:46%;
    left:50%;

    transform:
        translate(-50%, -50%)
        rotate(-25deg);

    white-space:nowrap;

    font-size:42px;
    font-weight:800;

    color:
        rgba(37, 99, 235, 0.065);

    pointer-events:none;
}

.contenido{
    position:relative;
    z-index:1;
}

.logo-container{
    text-align:center;
    margin-bottom:10px;
}

.logo-boleta{
    display:block;

    width:220px;
    max-width:100%;
    height:auto;

    margin:
        0 auto 10px;
}

h1{
    margin:
        5px 0 3px;

    text-align:center;

    font-size:21px;
    line-height:1.15;
}

.tipo-documento{
    margin-bottom:10px;

    text-align:center;

    font-size:16px;
    font-weight:800;

    letter-spacing:1.5px;
}

.reimpresion{
    margin:
        0 auto 10px;

    width:max-content;

    padding:
        5px 10px;

    border:
        1px solid #94a3b8;

    border-radius:999px;

    font-size:10px;
    font-weight:800;

    letter-spacing:0.08em;

    color:#475569;
}

.subtitulo{
    margin-bottom:12px;

    text-align:center;

    font-size:11px;
    line-height:1.55;

    color:#475569;
}

.linea{
    margin:
        12px 0;

    border-top:
        1px dashed #334155;
}

.datos{
    font-size:11.5px;
    line-height:1.65;

    color:#334155;
}

.producto{
    margin-bottom:10px;

    font-size:12px;
}

.producto-nombre{
    font-weight:800;
    line-height:1.35;

    color:#0f172a;
}

.producto-detalle{
    display:flex;
    justify-content:space-between;
    gap:12px;

    margin-top:3px;

    color:#334155;
}

.producto-vacio{
    padding:10px 0;

    text-align:center;

    font-size:12px;

    color:#64748b;
}

.resumen{
    display:grid;
    gap:5px;

    font-size:12px;

    color:#334155;
}

.resumen-fila{
    display:flex;
    justify-content:space-between;
    gap:12px;
}

.total{
    margin-top:15px;
    padding:13px 12px;

    border-radius:12px;

    text-align:center;

    font-size:20px;
    font-weight:800;

    background:#0f172a;
    color:#ffffff;
}

.gracias{
    margin-top:14px;

    text-align:center;

    font-size:13px;
    font-weight:800;
}

.qr-container{
    margin-top:18px;

    text-align:center;
}

.qr-container img{
    display:block;

    width:150px;
    max-width:100%;

    margin:auto;

    border-radius:10px;
}

.qr-container p{
    margin:
        6px 0 0;

    font-size:10.5px;
    font-weight:700;

    color:#475569;
}

.footer{
    margin-top:10px;

    text-align:center;

    font-size:10px;
    line-height:1.55;

    color:#64748b;
}

@page{
    margin:0;
    size:auto;
}

@media print{

    html,
    body{
        width:100%;
        min-height:auto;

        padding:0;

        background:#ffffff;
    }

    .boleta{
        width:280px;
        max-width:280px;

        margin:auto;
        padding:15px;

        border-radius:0;

        box-shadow:none;
    }

}

</style>

</head>

<body>

<div class="boleta">

    <div class="marca-agua">
        DIGITAL CENTER M&A
    </div>

    <div class="contenido">

        <div class="logo-container">

            <img
                src="logo-boleta.png"
                class="logo-boleta"
                alt="Digital Center M&A"
            >

        </div>

        <h1>
            DIGITAL CENTER M&A
        </h1>

        <div class="tipo-documento">
            ${etiquetaDocumento}
        </div>

        ${
            esReimpresion
                ? `
                    <div class="reimpresion">
                        DOCUMENTO REIMPRESO
                    </div>
                `
                : ""
        }

        <div class="subtitulo">

            <strong>RUC:</strong>
            10027914077
            <br>

            <strong>Dirección:</strong>
            <br>

            Calle Chepa Santos 601
            <br>

            Frente al Banco de la Nación
            <br>

            <strong>WhatsApp:</strong>
            +51 913 267 246
            <br>

            Celulares • Accesorios •
            Servicio Técnico

        </div>

        <div class="linea"></div>

        <div class="datos">

            <strong>BOLETA N.°:</strong>
            ${numeroBoleta}
            <br>

            <strong>Fecha:</strong>
            ${fecha}
            <br>

            <strong>Hora:</strong>
            ${hora}
            <br>

            <strong>Atendido por:</strong>
            ${vendedor}
            <br>

            <strong>Tienda:</strong>
            ${tienda}
            <br>

            <strong>Cliente:</strong>
            ${clienteNombre}
            <br>

            <strong>DNI:</strong>
            ${clienteDni}
            <br>

            <strong>Método de pago:</strong>
            <br>

            ${detallePagos}

        </div>

        <div class="linea"></div>

        ${productosHTML}

        <div class="linea"></div>

        <div class="resumen">

            <div class="resumen-fila">

                <span>
                    Subtotal
                </span>

                <strong>
                    S/
                    ${
                        formatearMontoBoletaMobile(
                            subtotal
                        )
                    }
                </strong>

            </div>

            ${
                descuento > 0
                    ? `
                        <div class="resumen-fila">

                            <span>
                                Descuento
                            </span>

                            <strong>
                                - S/
                                ${
                                    formatearMontoBoletaMobile(
                                        descuento
                                    )
                                }
                            </strong>

                        </div>
                    `
                    : ""
            }

        </div>

        <div class="total">

            TOTAL:
            S/
            ${
                formatearMontoBoletaMobile(
                    totalFinal
                )
            }

        </div>

        <div class="gracias">
            ¡Gracias por su compra!
        </div>

        <div class="qr-container">

            <img
                src="qr-whatsapp.png"
                alt="WhatsApp Digital Center M&A"
            >

            <p>
                Soporte, garantías y consultas
            </p>

        </div>

        <div class="footer">

            Gracias por confiar en nosotros.
            <br><br>

            Calle Chepa Santos 601
            <br>

            Frente al Banco de la Nación
            <br>

            WhatsApp:
            +51 913 267 246
            <br><br>

            Conserve esta boleta para
            cualquier garantía.

        </div>

    </div>

</div>

</body>

</html>
    `;

}


// =====================================================
// VENTA NUEVA
// =====================================================

export function construirHTMLBoletaMobile(
    venta
){

    return construirDocumentoBoletaMobile({
        venta,
        tituloDocumento:
            "BOLETA DE VENTA",
        esReimpresion:
            false
    });

}


// =====================================================
// REIMPRESIÓN
// =====================================================

export function construirHTMLReimpresionBoletaMobile(
    venta
){

    return construirDocumentoBoletaMobile({
        venta,
        tituloDocumento:
            "REIMPRESIÓN DE BOLETA",
        esReimpresion:
            true
    });

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
                "noopener,noreferrer"
            );

        if(!ventanaImpresion){

            throw new Error(
                "El navegador bloqueó la ventana de impresión."
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