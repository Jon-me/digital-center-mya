// =====================================================
// DIGITAL CENTER M&A
// MOBILE HOME VIEW
// FASE M4.1
// =====================================================

import {

    suscribirDashboardMobile

} from "../services/dashboard-mobile-service.js";

let cancelarDashboardHomeMobile =
    null;

function construirDashboardHomeMobile(){

    return `

        <section
            class="mobile-home"
        >

            <div
                id="mobileHomeHero"
            ></div>

            <div
                id="mobileHomeMetrics"
            ></div>

            <div
                id="mobileHomeQuickActions"
            ></div>

            <div
                id="mobileHomeActivity"
            ></div>

        </section>

    `;

}

function construirHeroHomeMobile(
    opciones
){

    const {

        primerNombre,

        usuario

    } = opciones;


    const fecha =
        formatearFechaHomeMobile(
            new Date()
        );


    const rol =
        usuario?.rol === "admin"
            ? "Administrador"
            : "Vendedor";


    const sucursal =
        obtenerNombreSucursalHomeMobile(
            usuario
        );


    return `
        <section class="mobile-home-hero">

            <div class="mobile-home-hero-glow"></div>

            <div class="mobile-home-hero-content">

                <div class="mobile-home-hero-top">

                    <div>

                        <span class="mobile-home-eyebrow">
                            DIGITAL CENTER M&A
                        </span>

                        <h1 class="mobile-home-greeting">
                            Hola, ${escaparHTMLHomeMobile(
                                primerNombre
                            )}
                        </h1>

                        <p class="mobile-home-date">
                            ${escaparHTMLHomeMobile(
                                fecha
                            )}
                        </p>

                    </div>

                    <div
                        class="mobile-home-avatar"
                        aria-hidden="true"
                    >
                        ${obtenerInicialHomeMobile(
                            primerNombre
                        )}
                    </div>

                </div>

                <div class="mobile-home-session">

                    <span class="mobile-home-session-pill">

                        <span class="mobile-home-session-dot"></span>

                        ${escaparHTMLHomeMobile(
                            rol
                        )}

                    </span>

                    <span class="mobile-home-session-branch">

                        <span aria-hidden="true">
                            🏪
                        </span>

                        ${escaparHTMLHomeMobile(
                            sucursal
                        )}

                    </span>

                </div>

                <button
                    type="button"
                    class="mobile-home-primary-action"
                    data-mobile-go="ventas"
                >

                    <span class="mobile-home-primary-action-icon">
                        ＋
                    </span>

                    <span>

                        <strong>
                            Nueva venta
                        </strong>

                        <small>
                            Abrir carrito de ventas
                        </small>

                    </span>

                    <span
                        class="mobile-home-primary-action-arrow"
                        aria-hidden="true"
                    >
                        ›
                    </span>

                </button>

            </div>

        </section>
    `;

}

function construirMetricasHomeMobile(){

    return `
        <section class="mobile-home-dashboard-section">

            <header class="mobile-home-section-header">

                <div>

                    <span class="mobile-home-section-eyebrow">
                        RESUMEN EN TIEMPO REAL
                    </span>

                    <h2>
                        Rendimiento de hoy
                    </h2>

                </div>

                <span class="mobile-home-live-badge">

                    <span></span>

                    En vivo

                </span>

            </header>

            <div class="mobile-home-metrics">

                ${construirCardMetricaHomeMobile({

                    id:
                        "ventasHoy",

                    icono:
                        "💰",

                    titulo:
                        "Ventas hoy",

                    valor:
                        "S/ 0.00",

                    clase:
                        "is-primary"

                })}

                ${construirCardMetricaHomeMobile({

                    id:
                        "gananciaHoy",

                    icono:
                        "📈",

                    titulo:
                        "Ganancia hoy",

                    valor:
                        "S/ 0.00",

                    clase:
                        "is-success"

                })}

                ${construirCardMetricaHomeMobile({

                    id:
                        "cantidadVentas",

                    icono:
                        "🧾",

                    titulo:
                        "Ventas realizadas",

                    valor:
                        "0"

                })}

                ${construirCardMetricaHomeMobile({

                    id:
                        "ticketPromedio",

                    icono:
                        "🎯",

                    titulo:
                        "Ticket promedio",

                    valor:
                        "S/ 0.00"

                })}

                ${construirCardMetricaHomeMobile({

                    id:
                        "productos",

                    icono:
                        "📦",

                    titulo:
                        "Productos",

                    valor:
                        "0"

                })}

                ${construirCardMetricaHomeMobile({

                    id:
                        "stockCritico",

                    icono:
                        "⚠️",

                    titulo:
                        "Stock crítico",

                    valor:
                        "0",

                    clase:
                        "is-warning"

                })}

            </div>

        </section>

        <section class="mobile-home-current-sale">

            <div class="mobile-home-current-sale-copy">

                <span>
                    VENTA ACTUAL
                </span>

                <strong id="homeMetric-ventaActual">
                    S/ 0.00
                </strong>

                <small id="homeCurrentSaleUnits">
                    0 unidades en el carrito
                </small>

            </div>

            <button
                type="button"
                class="mobile-home-current-sale-button"
                data-mobile-go="ventas"
                aria-label="Abrir venta actual"
            >
                ›
            </button>

        </section>
    `;

}

function construirCardMetricaHomeMobile(
    datos
){

    const clase =
        String(
            datos.clase || ""
        );


    return `
        <article
            class="
                mobile-home-metric-card
                ${clase}
            "
            id="homeMetric-${escaparHTMLHomeMobile(
                datos.id
            )}"
        >

            <div class="mobile-home-metric-top">

                <span class="mobile-home-metric-icon">
                    ${datos.icono}
                </span>

                <span class="mobile-home-metric-indicator"></span>

            </div>

            <small>
                ${escaparHTMLHomeMobile(
                    datos.titulo
                )}
            </small>

            <strong>
                ${escaparHTMLHomeMobile(
                    datos.valor
                )}
            </strong>

        </article>
    `;

}

function construirActividadHomeMobile(){

    return `
        <section class="mobile-home-activity">

            <header class="mobile-home-section-header">

                <div>

                    <span class="mobile-home-section-eyebrow">
                        ACTIVIDAD
                    </span>

                    <h2>
                        Última venta
                    </h2>

                </div>

            </header>

            <article
                id="mobileHomeLastSale"
                class="mobile-home-last-sale"
            >

                <div class="mobile-home-last-sale-empty">

                    <span>
                        🧾
                    </span>

                    <div>

                        <strong>
                            Sin ventas registradas hoy
                        </strong>

                        <small>
                            La última venta aparecerá aquí.
                        </small>

                    </div>

                </div>

            </article>

        </section>
    `;

}

export async function renderHomeMobile(
    contexto
){

    const {

        contenedor,

        usuario

    } = contexto;


    contenedor.innerHTML =
        construirDashboardHomeMobile();


    const primerNombre =
        String(
            usuario?.nombreCompleto ||
            usuario?.usuario ||
            "Usuario"
        )
            .trim()
            .split(/\s+/)[0];


    const hero =
        contenedor.querySelector(
            "#mobileHomeHero"
        );


    if(hero){

        hero.innerHTML =
            construirHeroHomeMobile({

                primerNombre,

                usuario

            });

    }

    const metricas =
    contenedor.querySelector(
        "#mobileHomeMetrics"
    );


if(metricas){

    metricas.innerHTML =
        construirMetricasHomeMobile();

}

const actividad =
    contenedor.querySelector(
        "#mobileHomeActivity"
    );


if(actividad){

    actividad.innerHTML =
        construirActividadHomeMobile();

}

inicializarDashboardRealtimeHomeMobile(
    contenedor
);

}

function formatearFechaHomeMobile(
    fecha
){

    const texto =
        fecha.toLocaleDateString(
            "es-PE",
            {

                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long"

            }
        );


    return texto.charAt(0)
        .toUpperCase() +
        texto.slice(1);

}


function obtenerNombreSucursalHomeMobile(
    usuario
){

    const sucursal =
        String(
            usuario?.sucursal ||
            usuario?.sucursalId ||
            localStorage.getItem(
                "sucursalActivaMobile"
            ) ||
            localStorage.getItem(
                "sucursalActiva"
            ) ||
            "principal"
        );


    const nombres = {

        principal:
            "Mercado",

        sucursal:
            "Peluquería"

    };


    return nombres[sucursal] ||
        sucursal;

}


function obtenerInicialHomeMobile(
    nombre
){

    return String(
        nombre ||
        "U"
    )
        .trim()
        .charAt(0)
        .toUpperCase();

}


function escaparHTMLHomeMobile(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function inicializarDashboardRealtimeHomeMobile(
    contenedor
){

    destruirDashboardRealtimeHomeMobile();


    cancelarDashboardHomeMobile =
        suscribirDashboardMobile(
            function(datos){

                actualizarMetricasHomeMobile(
                    contenedor,
                    datos
                );

            }
        );

}


function destruirDashboardRealtimeHomeMobile(){

    if(
        typeof cancelarDashboardHomeMobile ===
        "function"
    ){

        cancelarDashboardHomeMobile();

    }


    cancelarDashboardHomeMobile =
        null;

}

function actualizarMetricasHomeMobile(
    contenedor,
    datos
){

    actualizarValorMetricaHomeMobile(
        contenedor,
        "ventasHoy",
        formatearMonedaHomeMobile(
            datos.ventasHoy
        )
    );


    actualizarValorMetricaHomeMobile(
        contenedor,
        "gananciaHoy",
        formatearMonedaHomeMobile(
            datos.gananciaHoy
        )
    );


    actualizarValorMetricaHomeMobile(
        contenedor,
        "cantidadVentas",
        String(
            datos.cantidadVentasHoy || 0
        )
    );


    actualizarValorMetricaHomeMobile(
        contenedor,
        "ticketPromedio",
        formatearMonedaHomeMobile(
            datos.ticketPromedio
        )
    );


    actualizarValorMetricaHomeMobile(
        contenedor,
        "productos",
        String(
            datos.productos || 0
        )
    );


    actualizarValorMetricaHomeMobile(
        contenedor,
        "stockCritico",
        String(
            datos.stockCritico || 0
        )
    );


    actualizarVentaActualHomeMobile(
        contenedor,
        datos
    );


    actualizarUltimaVentaHomeMobile(
        contenedor,
        datos.ultimaVenta
    );

}

function actualizarValorMetricaHomeMobile(
    contenedor,
    id,
    valor
){

    const tarjeta =
        contenedor.querySelector(
            `#homeMetric-${id}`
        );


    if(!tarjeta){

        return;

    }


    const salida =
        tarjeta.matches(
            "strong"
        )
            ? tarjeta
            : tarjeta.querySelector(
                "strong"
            );


    if(!salida){

        return;

    }


    salida.textContent =
        valor;

}

function actualizarVentaActualHomeMobile(
    contenedor,
    datos
){

    actualizarValorMetricaHomeMobile(
        contenedor,
        "ventaActual",
        formatearMonedaHomeMobile(
            datos.ventaActual
        )
    );


    const unidades =
        Number(
            datos.unidadesCarrito || 0
        );


    const salidaUnidades =
        contenedor.querySelector(
            "#homeCurrentSaleUnits"
        );


    if(!salidaUnidades){

        return;

    }


    salidaUnidades.textContent =
        unidades === 1
            ? "1 unidad en el carrito"
            : `${unidades} unidades en el carrito`;

}

function actualizarUltimaVentaHomeMobile(
    contenedor,
    venta
){

    const salida =
        contenedor.querySelector(
            "#mobileHomeLastSale"
        );


    if(!salida){

        return;

    }


    if(!venta){

        salida.innerHTML = `
            <div class="mobile-home-last-sale-empty">

                <span>
                    🧾
                </span>

                <div>

                    <strong>
                        Sin ventas registradas hoy
                    </strong>

                    <small>
                        La última venta aparecerá aquí.
                    </small>

                </div>

            </div>
        `;

        return;

    }


    const productos =
        Array.isArray(
            venta.productos
        )
            ? venta.productos
            : [];


    const primerProducto =
        productos[0]?.nombreBoleta ||
        productos[0]?.producto ||
        "Venta registrada";


    const productosAdicionales =
        Math.max(
            0,
            productos.length - 1
        );


    const descripcionProducto =
        productosAdicionales > 0
            ? `${primerProducto} y ${productosAdicionales} más`
            : primerProducto;


    salida.innerHTML = `
        <div class="mobile-home-last-sale-icon">
            ✓
        </div>

        <div class="mobile-home-last-sale-copy">

            <span>
                ${escaparHTMLHomeMobile(
                    venta.hora ||
                    "Hoy"
                )}
            </span>

            <strong>
                ${escaparHTMLHomeMobile(
                    descripcionProducto
                )}
            </strong>

            <small>
                ${escaparHTMLHomeMobile(
                    venta.vendedor ||
                    "Sin vendedor"
                )}
            </small>

        </div>

        <div class="mobile-home-last-sale-total">

            <small>
                Total
            </small>

            <strong>
                ${formatearMonedaHomeMobile(
                    venta.total
                )}
            </strong>

        </div>
    `;

}

function formatearMonedaHomeMobile(
    valor
){

    return "S/ " +
        Number(valor || 0)
            .toFixed(2);

}

export function reiniciarHomeMobile(){

    destruirDashboardRealtimeHomeMobile();

}