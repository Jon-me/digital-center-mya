const CONFIG_BOLETA_RETAIL = Object.freeze({

    negocio: {

        nombre:
            "DIGITAL CENTER M&A",

        slogan:
            "Tecnología que conecta, soluciones que impulsan.",

        ruc:
            "10027914077",

        direccion:
            "Calle Chepa Santos 601, frente al Banco de la Nación",

        whatsapp:
            "+51 913 267 246"

    },

    recursos: {

        logo:
            "/logo-boleta.png",

        qr:
            "/qr-boleta.png"

    },

    css:
        "/mobile/css/boleta-retail-mobile.css?v=M14-3-1"

});

const METODOS_PAGO_RETAIL = Object.freeze({

    efectivo:
        "Efectivo",

    yape:
        "Yape",

    plin:
        "Plin",

    tarjeta:
        "Tarjeta",

    transferencia:
        "Transferencia"

});

function textoSeguro(
    valor,
    fallback = ""
){

    if(
        valor === null ||
        valor === undefined
    ){

        return fallback;

    }


    const texto =
        String(
            valor
        ).trim();


    if(
        !texto ||
        /^(undefined|null)$/i.test(
            texto
        )
    ){

        return fallback;

    }


    return texto;

}


function primerValor(
    ...valores
){

    for(
        const valor of valores
    ){

        const texto =
            textoSeguro(
                valor
            );


        if(texto){

            return texto;

        }

    }


    return "";

}


function numeroSeguro(
    valor
){

    const numero =
        Number(
            valor
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : 0;

}


function dineroRetail(
    valor
){

    return `S/ ${
        numeroSeguro(
            valor
        ).toFixed(
            2
        )
    }`;

}


function escaparHTMLRetail(
    valor
){

    return textoSeguro(
        valor
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

function resolverFechaHoraRetail(
    venta
){

    const fechaDirecta =
        primerValor(
            venta.fecha,
            venta.fechaVenta
        );


    const horaDirecta =
        primerValor(
            venta.hora,
            venta.horaVenta
        );


    const origen =
        venta.fechaISO ||
        venta.createdAt ||
        venta.timestamp;


    let fecha =
        fechaDirecta;


    let hora =
        horaDirecta;


    try{

        const valor =
            typeof origen?.toDate ===
            "function"
                ? origen.toDate()
                : new Date(
                    origen
                );


        if(
            !Number.isNaN(
                valor.getTime()
            )
        ){

            fecha ||=
                valor.toLocaleDateString(
                    "es-PE"
                );


            hora ||=
                valor.toLocaleTimeString(
                    "es-PE",
                    {

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"

                    }
                );

        }

    }catch{}


    return {

        fecha:
            fecha || "—",

        hora:
            hora || "—"

    };

}

function resolverTiendaRetail(
    valor
){

    const tienda =
        textoSeguro(
            valor
        ).toLowerCase();


    if(
        tienda === "principal" ||
        tienda === "mercado"
    ){

        return "Mercado";

    }


    if(
        tienda === "sucursal" ||
        tienda === "peluqueria" ||
        tienda === "peluquería"
    ){

        return "Peluquería";

    }


    return textoSeguro(
        valor,
        "No especificada"
    );

}

function normalizarProductosRetail(
    venta
){

    const origen =
        Array.isArray(
            venta.productos
        )
            ? venta.productos
            : Array.isArray(
                venta.items
            )
                ? venta.items
                : [];


    return origen.map(
        function(
            item,
            indice
        ){

            const cantidad =
                Math.max(
                    1,
                    numeroSeguro(
                        item.cantidad ||
                        item.qty ||
                        1
                    )
                );


            const precio =
                numeroSeguro(
                    item.precioVenta ??
                    item.precioUnitario ??
                    item.precio
                );


            const total =
                numeroSeguro(
                    item.subtotal ??
                    item.total ??
                    cantidad *
                    precio
                );


            return {

                indice:
                    indice + 1,

                codigo:
                    primerValor(
                        item.codigo,
                        item.sku
                    ),

                nombre:
                    primerValor(
                        item.nombreBoleta,
                        item.nombreParaBoleta,
                        item.descripcionBoleta,
                        item.producto,
                        item.nombre,
                        "Producto"
                    ),

                detalle:
                    primerValor(
                        item.variante,
                        item.modelo,
                        item.color
                    ),

                cantidad,

                precio,

                total

            };

        }
    );

}

function normalizarPagosRetail(
    venta,
    total
){

    const pagos =
        venta.pagos &&
        typeof venta.pagos ===
        "object"
            ? venta.pagos
            : null;


    if(pagos){

        const lista =
            Object
                .entries(
                    METODOS_PAGO_RETAIL
                )
                .map(
                    function([
                        id,
                        nombre
                    ]){

                        return {

                            id,

                            nombre,

                            monto:
                                numeroSeguro(
                                    pagos[id]
                                )

                        };

                    }
                )
                .filter(
                    function(
                        pago
                    ){

                        return pago.monto > 0;

                    }
                );


        if(lista.length){

            return lista;

        }

    }


    const metodo =
        textoSeguro(
            venta.metodoPago
        ).toLowerCase();


    if(!metodo){

        return [];

    }


    return [
        {

            id:
                metodo,

            nombre:
                METODOS_PAGO_RETAIL[
                    metodo
                ] ||
                textoSeguro(
                    venta.metodoPago
                ),

            monto:
                total

        }
    ];

}

function normalizarVentaRetail(
    venta,
    opciones = {}
){

    if(
        !venta ||
        typeof venta !==
        "object"
    ){

        throw new TypeError(
            "La venta no es válida para imprimir."
        );

    }


    const productos =
        normalizarProductosRetail(
            venta
        );


    const subtotalProductos =
        productos.reduce(
            function(
                acumulado,
                item
            ){

                return (
                    acumulado +
                    item.total
                );

            },
            0
        );


    const descuento =
        Math.max(
            0,
            numeroSeguro(
                venta.descuento ??
                venta.montoDescuento
            )
        );


    const subtotal =
        numeroSeguro(
            venta.subtotal ??
            subtotalProductos
        );


    const total =
        numeroSeguro(
            venta.total ??
            subtotal -
            descuento
        );


    const fechaHora =
        resolverFechaHoraRetail(
            venta
        );


    return {

        numero:
            primerValor(
                venta.numeroBoleta,
                venta.numeroDocumento,
                venta.correlativo,
                "SIN NÚMERO"
            ),

        fecha:
            fechaHora.fecha,

        hora:
            fechaHora.hora,

        vendedor:
            primerValor(
                venta.vendedor,
                venta.vendedorNombre,
                venta.usuarioNombre,
                "No especificado"
            ),

        tienda:
            resolverTiendaRetail(
                venta.tiendaVenta ??
                venta.tienda ??
                venta.sucursal
            ),

        cliente: {

            nombre:
                primerValor(
                    venta.clienteNombre,
                    venta.nombreCliente,
                    venta.cliente?.nombre,
                    "CLIENTE GENERAL"
                ),

            documento:
                primerValor(
                    venta.clienteDni,
                    venta.dniCliente,
                    venta.clienteDocumento,
                    venta.cliente?.dni,
                    "-"
                )

        },

        productos,

        pagos:
            normalizarPagosRetail(
                venta,
                total
            ),

        subtotal,

        descuento,

        total,

        esReimpresion:
            Boolean(
                opciones.esReimpresion
            )

    };

}

function construirFilaProductoRetail(
    item
){

    return `
        <article class="retail-product">

            <div class="retail-product__top">

                <span class="retail-product__index">
                    ${
                        String(
                            item.indice
                        ).padStart(
                            2,
                            "0"
                        )
                    }
                </span>

                <strong class="retail-product__name">
                    ${
                        escaparHTMLRetail(
                            item.nombre
                        )
                    }
                </strong>

                <strong class="retail-product__total">
                    ${
                        dineroRetail(
                            item.total
                        )
                    }
                </strong>

            </div>


            <div class="retail-product__meta">

                ${
                    item.detalle
                        ? `
                            <span>
                                ${
                                    escaparHTMLRetail(
                                        item.detalle
                                    )
                                }
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="retail-product__operation">
                ${
                    item.cantidad
                } × ${
                    dineroRetail(
                        item.precio
                    )
                }
            </div>

        </article>
    `;

}

function construirFilaPagoRetail(
    pago
){

    return `
        <div class="retail-payment-row">

            <span>
                ${
                    escaparHTMLRetail(
                        pago.nombre
                    )
                }
            </span>

            <strong>
                ${
                    dineroRetail(
                        pago.monto
                    )
                }
            </strong>

        </div>
    `;

}

function construirContenidoRetail(
    datos
){

    const clienteReal =
        datos.cliente.nombre !==
        "CLIENTE GENERAL" ||
        datos.cliente.documento !==
        "-";


    return `
        <main class="retail-receipt">


            <header class="retail-header">

                <h1>
                    ${CONFIG_BOLETA_RETAIL.negocio.nombre}
                </h1>

                <p>
                    ${CONFIG_BOLETA_RETAIL.negocio.slogan}
                </p>

            </header>


            <div class="retail-rule"></div>


            <section class="retail-business">

                <div>
                    <span>RUC</span>
                    <strong>
                        ${CONFIG_BOLETA_RETAIL.negocio.ruc}
                    </strong>
                </div>

                <div>
                    <span>Dirección</span>
                    <strong>
                        ${CONFIG_BOLETA_RETAIL.negocio.direccion}
                    </strong>
                </div>

                <div>
                    <span>WhatsApp</span>
                    <strong>
                        ${CONFIG_BOLETA_RETAIL.negocio.whatsapp}
                    </strong>
                </div>

            </section>


            <div class="retail-rule"></div>


            <section class="retail-document">

                <span class="retail-document__eyebrow">
                    ${
                        datos.esReimpresion
                            ? "REIMPRESIÓN"
                            : "COMPROBANTE"
                    }
                </span>

                <h2>
                    BOLETA DE VENTA
                </h2>

                <strong class="retail-document__number">
                    N.º ${
                        escaparHTMLRetail(
                            datos.numero
                        )
                    }
                </strong>

            </section>


            <section class="retail-meta">

                <div>
                    <span>Fecha</span>
                    <strong>
                        ${
                            escaparHTMLRetail(
                                datos.fecha
                            )
                        }
                    </strong>
                </div>

                <div>
                    <span>Hora</span>
                    <strong>
                        ${
                            escaparHTMLRetail(
                                datos.hora
                            )
                        }
                    </strong>
                </div>

                <div>
                    <span>Vendedor</span>
                    <strong>
                        ${
                            escaparHTMLRetail(
                                datos.vendedor
                            )
                        }
                    </strong>
                </div>

                <div>
                    <span>Tienda</span>
                    <strong>
                        ${
                            escaparHTMLRetail(
                                datos.tienda
                            )
                        }
                    </strong>
                </div>

            </section>


            ${
                clienteReal
                    ? `
                        <section class="retail-customer">

                            <div>
                                <span>Cliente</span>
                                <strong>
                                    ${
                                        escaparHTMLRetail(
                                            datos.cliente.nombre
                                        )
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>DNI</span>
                                <strong>
                                    ${
                                        escaparHTMLRetail(
                                            datos.cliente.documento
                                        )
                                    }
                                </strong>
                            </div>

                        </section>
                    `
                    : ""
            }


            <div class="retail-rule retail-rule--strong"></div>


            <section class="retail-products">

                <div class="retail-products__header">

                    <span>
                        DESCRIPCIÓN
                    </span>

                    <span>
                        IMPORTE
                    </span>

                </div>


                ${
                    datos.productos
                        .map(
                            construirFilaProductoRetail
                        )
                        .join(
                            ""
                        ) ||
                    `
                        <p class="retail-empty">
                            Sin productos
                        </p>
                    `
                }

            </section>


            <div class="retail-rule retail-rule--strong"></div>


            <section class="retail-totals">

                <div>
                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${
                            dineroRetail(
                                datos.subtotal
                            )
                        }
                    </strong>
                </div>


                ${
                    datos.descuento > 0
                        ? `
                            <div>
                                <span>
                                    Descuento
                                </span>

                                <strong>
                                    - ${
                                        dineroRetail(
                                            datos.descuento
                                        )
                                    }
                                </strong>
                            </div>
                        `
                        : ""
                }


                <div class="retail-total-final">

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ${
                            dineroRetail(
                                datos.total
                            )
                        }
                    </strong>

                </div>

            </section>


            <section class="retail-payments">

                <div class="retail-payments__title">
                    MÉTODO DE PAGO
                </div>


                ${
                    datos.pagos
                        .map(
                            construirFilaPagoRetail
                        )
                        .join(
                            ""
                        ) ||
                    `
                        <div class="retail-payment-row">

                            <span>
                                Método
                            </span>

                            <strong>
                                No registrado
                            </strong>

                        </div>
                    `
                }

            </section>


            <div class="retail-rule"></div>


            <section class="retail-qr">

                <img
                    src="${CONFIG_BOLETA_RETAIL.recursos.qr}"
                    alt="QR WhatsApp"
                >

                <div class="retail-qr__content">

                    <strong>
                        ¿Necesitas ayuda?
                    </strong>

                    <span>
                       Escanea el QR y escríbenos por WhatsApp.
                    </span>

                </div>

            </section>


            <div class="retail-rule"></div>


            <footer class="retail-footer">

                <strong>
                    Gracias por su compra.
                </strong>

                <p>
                    Conserva este comprobante para cambios,
                    consultas o atención por garantía.
                </p>

                <small>
                    Garantía sujeta a evaluación técnica
                    y condiciones comerciales.
                </small>

                <div class="retail-cut">
                    CORTE
                </div>

            </footer>


        </main>
    `;

}

export function construirHTMLBoletaRetailMobile(
    venta,
    opciones = {}
){

    const datos =
        normalizarVentaRetail(
            venta,
            opciones
        );


    const cssURL =
        textoSeguro(
            opciones.cssURL,
            CONFIG_BOLETA_RETAIL.css
        );


    return `<!doctype html>

<html lang="es">

<head>

    <meta charset="utf-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <title>
        Boleta ${
            escaparHTMLRetail(
                datos.numero
            )
        }
    </title>

    <link
        rel="stylesheet"
        href="${
            escaparHTMLRetail(
                cssURL
            )
        }"
    >

</head>

<body>

    <div class="retail-preview">

        ${
            construirContenidoRetail(
                datos
            )
        }

    </div>

</body>

</html>`;

}