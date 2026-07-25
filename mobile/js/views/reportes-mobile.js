// =====================================================
// DIGITAL CENTER M&A
// REPORTES MOBILE VIEW
// FASE M9.2.3
// =====================================================

import {

    obtenerReporteGeneralMobile,

    suscribirReporteGeneralMobile

} from "../services/reportes-mobile-service.js";


let contenedorReportesMobile =
    null;

let cancelarSuscripcionReportesMobile =
    null;

let vistaReportesInicializada =
    false;


// =====================================================
// RENDER PRINCIPAL
// =====================================================

export async function renderReportesMobile({
    contenedor,
    usuario
} = {}){

    if(!contenedor){

        console.warn(
            "No existe el contenedor de Reportes Mobile."
        );

        return;

    }


    contenedorReportesMobile =
        contenedor;


    if(
        usuario?.rol !==
        "admin"
    ){

        renderizarAccesoRestringidoMobile();

        return;

    }


    renderizarEstructuraReportesMobile();


    const reporteInicial =
        obtenerReporteGeneralMobile();


    actualizarVistaReportesMobile(
        reporteInicial
    );


    iniciarSuscripcionReportesMobile();


    vistaReportesInicializada =
        true;

}


// =====================================================
// ESTRUCTURA HTML
// =====================================================

function renderizarEstructuraReportesMobile(){

    if(!contenedorReportesMobile){

        return;

    }


    contenedorReportesMobile.innerHTML = `

        <section
            class="mobile-reportes"
            aria-labelledby="mobileReportesTitulo"
        >

            <header class="mobile-reportes-header">

                <div>

                    <span class="mobile-reportes-eyebrow">
                        RESUMEN DEL DÍA
                    </span>

                    <h2 id="mobileReportesTitulo">
                        Reportes
                    </h2>

                </div>

                <div
                    id="mobileReportesEstado"
                    class="mobile-reportes-status"
                    aria-live="polite"
                >
                    Actualizando...
                </div>

            </header>


            <div class="mobile-reportes-grid">

                ${crearTarjetaReporteMobile({
                    id: "mobileReporteTotalIngresos",
                    etiqueta: "Ventas del día",
                    valor: "S/ 0.00"
                })}

                ${crearTarjetaReporteMobile({
                    id: "mobileReporteGanancia",
                    etiqueta: "Ganancia",
                    valor: "S/ 0.00"
                })}

                ${crearTarjetaReporteMobile({
                    id: "mobileReporteCantidadVentas",
                    etiqueta: "Operaciones",
                    valor: "0"
                })}

                ${crearTarjetaReporteMobile({
                    id: "mobileReporteTicketPromedio",
                    etiqueta: "Ticket promedio",
                    valor: "S/ 0.00"
                })}

                ${crearTarjetaReporteMobile({
                    id: "mobileReporteProductosVendidos",
                    etiqueta: "Productos vendidos",
                    valor: "0"
                })}

            </div>


            <section class="mobile-reportes-section">

                <header class="mobile-reportes-section-header">

                    <h3>
                        Ventas por tienda
                    </h3>

                </header>

                <div
                    id="mobileReporteTiendas"
                    class="mobile-reportes-list"
                >
                </div>

            </section>


            <section class="mobile-reportes-section">

                <header class="mobile-reportes-section-header">

                    <h3>
                        Rendimiento por vendedor
                    </h3>

                </header>

                <div
                    id="mobileReporteVendedores"
                    class="mobile-reportes-list"
                >
                </div>

            </section>


            <section class="mobile-reportes-section">

                <header class="mobile-reportes-section-header">

                    <h3>
                        Métodos de pago
                    </h3>

                </header>

                <div
                    id="mobileReporteMetodosPago"
                    class="mobile-reportes-list"
                >
                </div>

            </section>

            <section class="mobile-reportes-section">

    <header class="mobile-reportes-section-header">

        <h3>
            Categorías más vendidas
        </h3>

    </header>

    <div
        id="mobileReporteCategorias"
        class="mobile-reportes-list"
    >
    </div>

</section>

        </section>

    `;

}


// =====================================================
// TARJETAS
// =====================================================

function crearTarjetaReporteMobile({
    id,
    etiqueta,
    valor
}){

    return `

        <article class="mobile-report-card">

            <span class="mobile-report-card-label">
                ${escaparHTMLMobile(etiqueta)}
            </span>

            <strong
                id="${escaparHTMLMobile(id)}"
                class="mobile-report-card-value"
            >
                ${escaparHTMLMobile(valor)}
            </strong>

        </article>

    `;

}


// =====================================================
// REALTIME
// =====================================================

function iniciarSuscripcionReportesMobile(){

    detenerSuscripcionReportesMobile();


    cancelarSuscripcionReportesMobile =
        suscribirReporteGeneralMobile(

            function(reporte){

                actualizarVistaReportesMobile(
                    reporte
                );

            },

            function(error){

                console.error(
                    "Error actualizando Reportes Mobile:",
                    error
                );


                actualizarEstadoReportesMobile(
                    "Error al actualizar"
                );

            }

        );

}


function detenerSuscripcionReportesMobile(){

    if(
        typeof cancelarSuscripcionReportesMobile ===
        "function"
    ){

        cancelarSuscripcionReportesMobile();

    }


    cancelarSuscripcionReportesMobile =
        null;

}


// =====================================================
// ACTUALIZAR VISTA
// =====================================================

function actualizarVistaReportesMobile(
    reporte = {}
){

    actualizarTextoMobile(
        "mobileReporteTotalIngresos",
        formatearMonedaMobile(
            reporte.totalIngresos
        )
    );


    actualizarTextoMobile(
        "mobileReporteGanancia",
        formatearMonedaMobile(
            reporte.totalGanancia
        )
    );


    actualizarTextoMobile(
        "mobileReporteCantidadVentas",
        formatearNumeroMobile(
            reporte.cantidadVentas
        )
    );


    actualizarTextoMobile(
        "mobileReporteTicketPromedio",
        formatearMonedaMobile(
            reporte.ticketPromedio
        )
    );


    actualizarTextoMobile(
        "mobileReporteProductosVendidos",
        formatearNumeroMobile(
            reporte.productosVendidos
        )
    );


    renderizarListaTiendasMobile(
        reporte.tiendas
    );


    renderizarListaVendedoresMobile(
        reporte.vendedores
    );


    renderizarListaMetodosPagoMobile(
        reporte.metodosPago
    );

    renderizarListaCategoriasMobile(
    reporte.categorias
    );

    actualizarEstadoReportesMobile(
        "Actualizado"
    );

}


// =====================================================
// TIENDAS
// =====================================================

function renderizarListaTiendasMobile(
    tiendas = []
){

    const contenedor =
        document.getElementById(
            "mobileReporteTiendas"
        );


    if(!contenedor){

        return;

    }


    const lista =
        Array.isArray(tiendas)
            ? tiendas
            : [];


    if(lista.length === 0){

        contenedor.innerHTML =
            crearEstadoVacioMobile(
                "Todavía no hay ventas por tienda."
            );

        return;

    }


    contenedor.innerHTML =
        lista.map(
            function(tienda){

                return crearFilaReporteMobile({

                    titulo:
                        tienda.tiendaNombre ||
                        tienda.nombre ||
                        "Tienda",

                    detalle:
                        `${formatearNumeroMobile(
                            tienda.cantidadVentas
                        )} ventas · ${formatearNumeroMobile(
                            tienda.productosVendidos
                        )} productos`,

                    valor:
                        formatearMonedaMobile(
                            tienda.totalVendido
                        )

                });

            }
        ).join("");

}


// =====================================================
// VENDEDORES
// =====================================================

function renderizarListaVendedoresMobile(
    vendedores = []
){

    const contenedor =
        document.getElementById(
            "mobileReporteVendedores"
        );


    if(!contenedor){

        return;

    }


    const lista =
        Array.isArray(vendedores)
            ? vendedores
            : [];


    if(lista.length === 0){

        contenedor.innerHTML =
            crearEstadoVacioMobile(
                "Todavía no hay ventas por vendedor."
            );

        return;

    }


    contenedor.innerHTML =
        lista.map(
            function(vendedor){

                return crearFilaReporteMobile({

                    titulo:
                        vendedor.vendedor ||
                        vendedor.usuario ||
                        "Vendedor",

                    detalle:
                        `${formatearNumeroMobile(
                            vendedor.cantidadVentas
                        )} ventas · ${formatearNumeroMobile(
                            vendedor.productosVendidos
                        )} productos`,

                    valor:
                        formatearMonedaMobile(
                            vendedor.totalVendido
                        )

                });

            }
        ).join("");

}


// =====================================================
// MÉTODOS DE PAGO
// =====================================================

function renderizarListaMetodosPagoMobile(
    metodosPago = []
){

    const contenedor =
        document.getElementById(
            "mobileReporteMetodosPago"
        );


    if(!contenedor){

        return;

    }


    const lista =
        normalizarMetodosPagoMobile(
            metodosPago
        );


    if(lista.length === 0){

        contenedor.innerHTML =
            crearEstadoVacioMobile(
                "Todavía no hay pagos registrados."
            );

        return;

    }


    contenedor.innerHTML =
        lista.map(function(metodo){

            return crearFilaReporteMobile({

                titulo:
                    metodo.nombre,

                detalle:
                    `${formatearNumeroMobile(
                        metodo.cantidad
                    )} operaciones`,

                valor:
                    formatearMonedaMobile(
                        metodo.total
                    )

            });

        }).join("");

}


function normalizarMetodosPagoMobile(
    metodosPago
){

    if(Array.isArray(metodosPago)){

        return metodosPago.map(
            function(metodo){

                return {

                    nombre:
                        metodo.nombre ||
                        metodo.metodo ||
                        "Método",

                    cantidad:
                        Number(
                            metodo.cantidad ??
                            metodo.operaciones ??
                            0
                        ),

                    total:
                        Number(
                            metodo.total ??
                            metodo.monto ??
                            0
                        )

                };

            }
        );

    }


    if(
        metodosPago &&
        typeof metodosPago ===
        "object"
    ){

        return Object.entries(
            metodosPago
        ).map(
            function([
                nombre,
                valor
            ]){

                if(
                    valor &&
                    typeof valor ===
                    "object"
                ){

                    return {

                        nombre:
                            formatearEtiquetaMobile(
                                nombre
                            ),

                        cantidad:
                            Number(
                                valor.cantidad ??
                                valor.operaciones ??
                                0
                            ),

                        total:
                            Number(
                                valor.total ??
                                valor.monto ??
                                0
                            )

                    };

                }


                return {

                    nombre:
                        formatearEtiquetaMobile(
                            nombre
                        ),

                    cantidad:
                        0,

                    total:
                        Number(valor || 0)

                };

            }
        ).filter(
            function(metodo){

                return (
                    metodo.total > 0 ||
                    metodo.cantidad > 0
                );

            }
        );

    }


    return [];

}

// =====================================================
// CATEGORÍAS
// =====================================================

function renderizarListaCategoriasMobile(
    categorias = []
){

    const contenedor =
        document.getElementById(
            "mobileReporteCategorias"
        );


    if(!contenedor){

        return;

    }


    const lista =
        Array.isArray(categorias)
            ? categorias
            : [];


    if(lista.length === 0){

        contenedor.innerHTML =
            crearEstadoVacioMobile(
                "Todavía no hay categorías vendidas."
            );

        return;

    }


    contenedor.innerHTML =
        lista.map(
            function(categoria){

                return crearFilaReporteMobile({

                    titulo:
                        categoria.categoria ||
                        "Sin categoría",

                    detalle:
                        `${formatearNumeroMobile(
                            categoria.unidadesVendidas
                        )} unidades vendidas`,

                    valor:
                        formatearMonedaMobile(
                            categoria.totalVendido
                        )

                });

            }
        ).join("");

}

// =====================================================
// FILAS
// =====================================================

function crearFilaReporteMobile({
    titulo,
    detalle,
    valor
}){

    return `

        <article class="mobile-report-row">

            <div class="mobile-report-row-content">

                <strong>
                    ${escaparHTMLMobile(titulo)}
                </strong>

                <span>
                    ${escaparHTMLMobile(detalle)}
                </span>

            </div>

            <strong class="mobile-report-row-value">
                ${escaparHTMLMobile(valor)}
            </strong>

        </article>

    `;

}


function crearEstadoVacioMobile(
    mensaje
){

    return `

        <div class="mobile-reportes-empty">

            <span>
                ${escaparHTMLMobile(mensaje)}
            </span>

        </div>

    `;

}


// =====================================================
// ACCESO RESTRINGIDO
// =====================================================

function renderizarAccesoRestringidoMobile(){

    if(!contenedorReportesMobile){

        return;

    }


    contenedorReportesMobile.innerHTML = `

        <section class="mobile-empty-state">

            <span class="mobile-empty-state-icon">
                🔒
            </span>

            <h2>
                Acceso restringido
            </h2>

            <p>
                Los reportes están disponibles únicamente
                para administradores.
            </p>

        </section>

    `;

}


// =====================================================
// ESTADO
// =====================================================

function actualizarEstadoReportesMobile(
    mensaje
){

    actualizarTextoMobile(
        "mobileReportesEstado",
        mensaje
    );

}


function actualizarTextoMobile(
    id,
    texto
){

    const elemento =
        document.getElementById(
            id
        );


    if(!elemento){

        return;

    }


    elemento.textContent =
        texto;

}


// =====================================================
// FORMATOS
// =====================================================

function formatearMonedaMobile(
    valor
){

    const numero =
        Number(valor || 0);


    return new Intl.NumberFormat(
        "es-PE",
        {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2
        }
    ).format(
        Number.isFinite(numero)
            ? numero
            : 0
    );

}


function formatearNumeroMobile(
    valor
){

    const numero =
        Number(valor || 0);


    return new Intl.NumberFormat(
        "es-PE",
        {
            maximumFractionDigits: 0
        }
    ).format(
        Number.isFinite(numero)
            ? numero
            : 0
    );

}


function formatearEtiquetaMobile(
    valor
){

    const texto =
        String(valor || "")
            .replaceAll("_", " ")
            .trim();


    if(!texto){

        return "Método";

    }


    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );

}


function escaparHTMLMobile(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// REINICIO
// =====================================================

export function reiniciarReportesMobile(){

    detenerSuscripcionReportesMobile();


    if(contenedorReportesMobile){

        contenedorReportesMobile.innerHTML =
            "";

    }


    contenedorReportesMobile =
        null;

    vistaReportesInicializada =
        false;

}