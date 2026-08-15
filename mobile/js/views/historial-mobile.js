// =====================================================
// DIGITAL CENTER M&A
// HISTORIAL MOBILE ENTERPRISE
// M12.4.5
// PREMIUM SALES HISTORY EXPERIENCE
// =====================================================

import {

    obtenerHistorialMobile,

    suscribirHistorialMobile

} from "../services/historial-mobile-service.js";

import {

    construirHTMLReimpresionBoletaMobile,
    imprimirHTMLBoletaMobile

} from "../services/boleta-mobile-service.js?v=M14-3-2";


// =====================================================
// ESTADO GENERAL
// =====================================================

let contenedorHistorialMobile = null;

let cancelarSuscripcionHistorialMobile = null;

let controladorEventosHistorialMobile = null;

let historialVentasOriginalMobile = [];

let historialBusquedaMobile = "";

let historialFiltroMobile = "todas";

let ventaDetalleHistorialMobile = null;

let disparadorDetalleHistorialMobile = null;

// =====================================================
// RENDER PRINCIPAL
// =====================================================

export async function renderHistorialMobile({

    contenedor

} = {}){

    if(!contenedor){

        return;

    }

    reiniciarSuscripcionHistorialMobile();

    contenedorHistorialMobile =
        contenedor;

    renderizarEstructuraHistorialMobile();

    registrarEventosHistorialMobile();

    mostrarSkeletonHistorialMobile();

    actualizarHistorialMobile(
        obtenerHistorialMobile()
    );

    cancelarSuscripcionHistorialMobile =
        suscribirHistorialMobile(
            actualizarHistorialMobile
        );

}


// =====================================================
// ESTRUCTURA ENTERPRISE
// =====================================================

function renderizarEstructuraHistorialMobile(){

    contenedorHistorialMobile.innerHTML = `

        <section
            class="mobile-history"
        >

            <!-- =========================================
                 HEADER PREMIUM
            ========================================== -->

            <header
                class="mobile-history-header"
            >

                <div
                    class="mobile-history-header-copy"
                >

                    <span
                        class="mobile-history-eyebrow"
                    >
                        CENTRO DE VENTAS
                    </span>

                    <h1>
                        Historial
                    </h1>

                    <p>
                        Consulta las ventas registradas en
                        Desktop y Mobile.
                    </p>

                </div>

                <div
                    class="mobile-history-header-icon"
                    aria-hidden="true"
                >
                    🧾
                </div>

                <div
                    class="mobile-history-realtime"
                >

                    <span
                        class="mobile-history-realtime-dot"
                    ></span>

                    Realtime

                </div>

            </header>


            <!-- =========================================
                 BUSCADOR
            ========================================== -->

            <section
                class="mobile-history-search-panel"
            >

                <label
                    class="mobile-history-search-label"
                    for="mobileHistorySearch"
                >
                    Buscar venta
                </label>

                <div
                    class="mobile-history-search-control"
                >

                    <span
                        class="mobile-history-search-icon"
                        aria-hidden="true"
                    >
                        🔎
                    </span>

                    <input
                        id="mobileHistorySearch"
                        type="search"
                        inputmode="search"
                        autocomplete="off"
                        placeholder="Boleta, cliente, DNI, vendedor o producto"
                    >

                    <button
                        id="mobileHistorySearchClear"
                        type="button"
                        class="mobile-history-search-clear"
                        aria-label="Limpiar búsqueda"
                        hidden
                    >
                        ×
                    </button>

                </div>

                <div
                    id="mobileHistorySearchStatus"
                    class="mobile-history-search-status"
                >
                    Mostrando las últimas ventas
                </div>

            </section>


            <!-- =========================================
                 FILTROS RÁPIDOS
            ========================================== -->

            <section
                class="mobile-history-filters"
                aria-label="Filtros del historial"
            >

                <div
                    class="mobile-history-filter-scroll"
                >

                    ${crearBotonFiltroHistorialMobile(
                        "todas",
                        "Todas"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "hoy",
                        "Hoy"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "principal",
                        "Mercado"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "sucursal",
                        "Peluquería"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "efectivo",
                        "Efectivo"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "digital",
                        "Digital"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "mixto",
                        "Mixto"
                    )}

                    ${crearBotonFiltroHistorialMobile(
                        "anuladas",
                        "Anuladas"
                    )}

                </div>

            </section>


            <!-- =========================================
                 MÉTRICAS
            ========================================== -->

            <section
                id="mobileHistoryMetrics"
                class="mobile-history-metrics"
                aria-label="Resumen del historial"
            >

                ${crearSkeletonMetricaHistorialMobile()}

                ${crearSkeletonMetricaHistorialMobile()}

                ${crearSkeletonMetricaHistorialMobile()}

                ${crearSkeletonMetricaHistorialMobile()}

            </section>


            <!-- =========================================
                 TIMELINE DE VENTAS
            ========================================== -->

            <section
                class="mobile-history-content"
            >

                <div
                    class="mobile-history-section-heading"
                >

                    <div>

                        <span>
                            ACTIVIDAD
                        </span>

                        <strong>
                            Ventas registradas
                        </strong>

                    </div>

                    <span
                        id="mobileHistoryResultCount"
                        class="mobile-history-result-count"
                    >
                        0
                    </span>

                </div>

                <div
                    id="mobileHistoryList"
                    class="mobile-history-list"
                    aria-live="polite"
                >
                </div>

            </section>

        </section>


        <!-- =========================================
             BOTTOM SHEET DETALLE DE VENTA
        ========================================== -->

        <section
            id="mobileHistorySheet"
            class="mobile-history-sheet"
            aria-hidden="true"
        >

            <button
                type="button"
                class="mobile-history-sheet-backdrop"
                data-history-sheet-close
                aria-label="Cerrar detalle de venta"
            ></button>

            <article
                class="mobile-history-sheet-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileHistorySheetTitle"
            >

                <div
                    class="mobile-history-sheet-handle"
                    aria-hidden="true"
                ></div>

                <header
                    class="mobile-history-sheet-header"
                >

                    <div
                        class="mobile-history-sheet-heading"
                    >

                        <small>
                            DETALLE DE VENTA
                        </small>

                        <strong
                            id="mobileHistorySheetTitle"
                        >
                            Boleta
                        </strong>

                    </div>

                    <button
                        type="button"
                        class="mobile-history-sheet-close"
                        data-history-sheet-close
                        aria-label="Cerrar detalle"
                    >
                        ×
                    </button>

                </header>

                <div
                    id="mobileHistorySheetBody"
                    class="mobile-history-sheet-body"
                >
                </div>

                <footer
                    class="mobile-history-sheet-footer"
                >

                    <button
                        id="mobileHistorySheetReprint"
                        type="button"
                        class="mobile-history-sheet-primary"
                    >
                        🖨️ Imprimir / PDF
                    </button>

                    <button
                        type="button"
                        class="mobile-history-sheet-secondary"
                        data-history-sheet-close
                        aria-label="Cerrar"
                    >
                        ×
                    </button>

                </footer>

            </article>

        </section>

    `;

}


// =====================================================
// BOTÓN DE FILTRO
// =====================================================

function crearBotonFiltroHistorialMobile(
    filtro,
    etiqueta
){

    const activo =
        filtro === historialFiltroMobile;

    return `

        <button
            type="button"
            class="
                mobile-history-filter
                ${activo ? "is-active" : ""}
            "
            data-history-filter="${escaparHTMLHistorialMobile(
                filtro
            )}"
            aria-pressed="${activo}"
        >
            ${escaparHTMLHistorialMobile(
                etiqueta
            )}
        </button>

    `;

}


// =====================================================
// EVENTOS
// =====================================================

function registrarEventosHistorialMobile(){

    if(!contenedorHistorialMobile){

        return;

    }

    controladorEventosHistorialMobile =
        new AbortController();

    const signal =
        controladorEventosHistorialMobile.signal;

    const buscador =
        obtenerElementoHistorialMobile(
            "#mobileHistorySearch"
        );

    const limpiarBusqueda =
        obtenerElementoHistorialMobile(
            "#mobileHistorySearchClear"
        );

    document.addEventListener(

        "keydown",

        function(event){

            if(
                event.key === "Escape" &&
                ventaDetalleHistorialMobile
            ){

                cerrarDetalleHistorialMobile();

            }

        },

        {
            signal
        }

    );

    buscador?.addEventListener(

        "input",

        function(event){

            historialBusquedaMobile =
                String(
                    event.target.value || ""
                )
                .trim()
                .toLocaleLowerCase("es-PE");

            actualizarVisibilidadBotonLimpiarMobile();

            aplicarEstadoHistorialMobile();

        },

        {
            signal
        }

    );

    limpiarBusqueda?.addEventListener(

        "click",

        function(){

            historialBusquedaMobile =
                "";

            if(buscador){

                buscador.value = "";

                buscador.focus();

            }

            actualizarVisibilidadBotonLimpiarMobile();

            aplicarEstadoHistorialMobile();

        },

        {
            signal
        }

    );

    contenedorHistorialMobile.addEventListener(

        "click",

        gestionarClickHistorialMobile,

        {
            signal
        }

    );

}


// =====================================================
// CLICK DELEGADO
// =====================================================

function gestionarClickHistorialMobile(
    event
){

    const botonFiltro =
        event.target.closest(
            "[data-history-filter]"
        );

    if(botonFiltro){

        seleccionarFiltroHistorialMobile(
            botonFiltro.dataset.historyFilter
        );

        return;

    }

    const botonDetalle =
        event.target.closest(
            "[data-history-detail]"
        );

if(botonDetalle){

    const venta =
        buscarVentaHistorialMobile(
            botonDetalle.dataset.historyDetail
        );

    disparadorDetalleHistorialMobile =
        botonDetalle;

    abrirDetalleHistorialMobile(
        venta
    );

    return;

}

        const botonCerrarSheet =
        event.target.closest(
            "[data-history-sheet-close]"
        );

    if(botonCerrarSheet){

        cerrarDetalleHistorialMobile();

        return;

    }

    const botonReimpresion =
        event.target.closest(
            "[data-history-reprint]"
        );

    if(botonReimpresion){

        const venta =
            buscarVentaHistorialMobile(
                botonReimpresion.dataset.historyReprint
            );

        prepararReimpresionHistorialMobile(
            venta
        );

    }

}


// =====================================================
// CAMBIAR FILTRO
// =====================================================

function seleccionarFiltroHistorialMobile(
    filtro
){

    historialFiltroMobile =
        filtro || "todas";

    const botones =
        contenedorHistorialMobile
        ?.querySelectorAll(
            "[data-history-filter]"
        ) || [];

    botones.forEach(function(boton){

        const activo =
            boton.dataset.historyFilter ===
            historialFiltroMobile;

        boton.classList.toggle(
            "is-active",
            activo
        );

        boton.setAttribute(
            "aria-pressed",
            String(activo)
        );

    });

    aplicarEstadoHistorialMobile();

}


// =====================================================
// ACTUALIZACIÓN DESDE FIRESTORE
// =====================================================

function actualizarHistorialMobile(
    ventas = []
){

    historialVentasOriginalMobile =
        Array.isArray(ventas)
            ? ventas.map(
                normalizarVentaHistorialMobile
            )
            : [];

    aplicarEstadoHistorialMobile();

}


// =====================================================
// NORMALIZACIÓN DESKTOP / MOBILE
// =====================================================

function normalizarVentaHistorialMobile(
    venta = {}
){

    const productos =
        Array.isArray(venta.productos)
            ? venta.productos.map(function(producto){

                return {

                    ...producto,

                    cantidad:
                        numeroSeguroHistorialMobile(
                            producto.cantidad
                        ),

                    precio:
                        numeroSeguroHistorialMobile(
                            producto.precio
                        ),

                    subtotal:
                        numeroSeguroHistorialMobile(
                            producto.subtotal
                        )

                };

            })
            : [];

    const fechaISO =
        obtenerFechaISOHistorialMobile(
            venta
        );

    return {

        ...venta,

        id:
            String(
                venta.id || ""
            ),

        numeroBoleta:
            String(
                venta.numeroBoleta ||
                "Boleta pendiente"
            ),

        clienteNombre:
            String(
                venta.clienteNombre ||
                "Cliente general"
            ),

        clienteDni:
            String(
                venta.clienteDni ||
                ""
            ),

        vendedor:
            String(
                venta.vendedor ||
                venta.usuario ||
                "Sin vendedor"
            ),

        tiendaVenta:
            String(
                venta.tiendaVenta ||
                venta.sucursalUsuario ||
                ""
            ),

        tiendaVentaNombre:
            String(
                venta.tiendaVentaNombre ||
                obtenerNombreTiendaHistorialMobile(
                    venta.tiendaVenta ||
                    venta.sucursalUsuario
                )
            ),

        estado:
            String(
                venta.estado ||
                (
                    venta.estadoAnulado
                        ? "anulada"
                        : "activa"
                )
            )
            .toLocaleLowerCase("es-PE"),

        fechaISO,

        fecha:
            String(
                venta.fecha ||
                formatearFechaCortaHistorialMobile(
                    fechaISO
                )
            ),

        hora:
            String(
                venta.hora ||
                formatearHoraHistorialMobile(
                    venta.creadaEn
                )
            ),

        creadaEn:
            venta.creadaEn || "",

        productos,

        total:
            numeroSeguroHistorialMobile(
                venta.total
            ),

        descuento:
            numeroSeguroHistorialMobile(
                venta.descuento
            ),

        ganancia:
            numeroSeguroHistorialMobile(
                venta.ganancia
            ),

        pagos:
            normalizarPagosHistorialMobile(
                venta.pagos
            ),

        metodoPagoVisual:
            obtenerMetodoPagoVisualHistorialMobile(
                venta
            )

    };

}


// =====================================================
// APLICAR BÚSQUEDA Y FILTRO
// =====================================================

function aplicarEstadoHistorialMobile(){

    const ventasFiltradas =
        historialVentasOriginalMobile
        .filter(
            coincideFiltroHistorialMobile
        )
        .filter(
            coincideBusquedaHistorialMobile
        );

    actualizarMetricasHistorialMobile(
        ventasFiltradas
    );

    actualizarContadorHistorialMobile(
        ventasFiltradas.length
    );

    actualizarEstadoBusquedaHistorialMobile(
        ventasFiltradas.length
    );

    renderizarTimelineHistorialMobile(
        ventasFiltradas
    );

}


// =====================================================
// FILTRADO
// =====================================================

function coincideFiltroHistorialMobile(
    venta
){

    switch(historialFiltroMobile){

        case "hoy":

            return esVentaDeHoyHistorialMobile(
                venta
            );

        case "principal":

            return (
                venta.tiendaVenta ===
                "principal"
            );

        case "sucursal":

            return (
                venta.tiendaVenta ===
                "sucursal"
            );

        case "efectivo":

            return (
                venta.metodoPagoVisual.clave ===
                "efectivo"
            );

        case "digital":

            return [
                "yape",
                "plin",
                "tarjeta",
                "transferencia"
            ].includes(
                venta.metodoPagoVisual.clave
            );

        case "mixto":

            return (
                venta.metodoPagoVisual.clave ===
                "mixto"
            );

        case "anuladas":

            return esVentaAnuladaHistorialMobile(
                venta
            );

        case "todas":
        default:

            return true;

    }

}


// =====================================================
// BÚSQUEDA GENERAL
// =====================================================

function coincideBusquedaHistorialMobile(
    venta
){

    if(!historialBusquedaMobile){

        return true;

    }

    const productosTexto =
        venta.productos
        .map(function(producto){

            return [

                producto.nombreBoleta,

                producto.producto,

                producto.codigo,

                producto.categoria

            ]
            .filter(Boolean)
            .join(" ");

        })
        .join(" ");

    const contenido =
        [

            venta.numeroBoleta,

            venta.clienteNombre,

            venta.clienteDni,

            venta.vendedor,

            venta.tiendaVentaNombre,

            venta.metodoPagoVisual.etiqueta,

            productosTexto

        ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es-PE");

    return contenido.includes(
        historialBusquedaMobile
    );

}


// =====================================================
// MÉTRICAS
// =====================================================

function actualizarMetricasHistorialMobile(
    ventas
){

    const contenedor =
        obtenerElementoHistorialMobile(
            "#mobileHistoryMetrics"
        );

    if(!contenedor){

        return;

    }

    const ventasActivas =
        ventas.filter(function(venta){

            return !esVentaAnuladaHistorialMobile(
                venta
            );

        });

    const totalVendido =
        ventasActivas.reduce(
            function(acumulado, venta){

                return acumulado + venta.total;

            },
            0
        );

    const ticketPromedio =
        ventasActivas.length > 0
            ? totalVendido /
              ventasActivas.length
            : 0;

    const ventasAnuladas =
        ventas.filter(
            esVentaAnuladaHistorialMobile
        ).length;

    contenedor.innerHTML = `

        ${crearMetricaHistorialMobile({

            clase: "is-sales",

            icono: "💰",

            etiqueta: "Vendido",

            valor:
                formatearMonedaHistorialMobile(
                    totalVendido
                )

        })}

        ${crearMetricaHistorialMobile({

            clase: "is-tickets",

            icono: "🧾",

            etiqueta: "Boletas",

            valor:
                String(
                    ventasActivas.length
                )

        })}

        ${crearMetricaHistorialMobile({

            clase: "is-average",

            icono: "📊",

            etiqueta: "Ticket prom.",

            valor:
                formatearMonedaHistorialMobile(
                    ticketPromedio
                )

        })}

        ${crearMetricaHistorialMobile({

            clase: "is-cancelled",

            icono: "↩️",

            etiqueta: "Anuladas",

            valor:
                String(
                    ventasAnuladas
                )

        })}

    `;

}


// =====================================================
// TARJETA DE MÉTRICA
// =====================================================

function crearMetricaHistorialMobile({

    clase,

    icono,

    etiqueta,

    valor

}){

    return `

        <article
            class="
                mobile-history-metric
                ${clase}
            "
        >

            <span
                class="mobile-history-metric-icon"
                aria-hidden="true"
            >
                ${icono}
            </span>

            <div>

                <small>
                    ${escaparHTMLHistorialMobile(
                        etiqueta
                    )}
                </small>

                <strong>
                    ${escaparHTMLHistorialMobile(
                        valor
                    )}
                </strong>

            </div>

        </article>

    `;

}


// =====================================================
// TIMELINE
// =====================================================

function renderizarTimelineHistorialMobile(
    ventas
){

    const lista =
        obtenerElementoHistorialMobile(
            "#mobileHistoryList"
        );

    if(!lista){

        return;

    }

    if(ventas.length === 0){

        lista.innerHTML =
            crearEstadoVacioHistorialMobile();

        return;

    }

    const grupos =
        agruparVentasPorFechaHistorialMobile(
            ventas
        );

    lista.innerHTML =
        Array.from(
            grupos.entries()
        )
        .map(function([fechaISO, ventasFecha]){

            return `

                <section
                    class="mobile-history-day"
                >

                    <header
                        class="mobile-history-day-header"
                    >

                        <div>

                            <span>
                                ${escaparHTMLHistorialMobile(
                                    obtenerEtiquetaFechaHistorialMobile(
                                        fechaISO
                                    )
                                )}
                            </span>

                            <small>
                                ${escaparHTMLHistorialMobile(
                                    formatearFechaLargaHistorialMobile(
                                        fechaISO
                                    )
                                )}
                            </small>

                        </div>

                        <strong>
                            ${ventasFecha.length}
                        </strong>

                    </header>

                    <div
                        class="mobile-history-day-list"
                    >

                        ${ventasFecha
                            .map(
                                crearTarjetaVentaMobile
                            )
                            .join("")
                        }

                    </div>

                </section>

            `;

        })
        .join("");

}


// =====================================================
// AGRUPAR POR FECHA
// =====================================================

function agruparVentasPorFechaHistorialMobile(
    ventas
){

    const grupos =
        new Map();

    ventas.forEach(function(venta){

        const clave =
            venta.fechaISO ||
            "sin-fecha";

        if(!grupos.has(clave)){

            grupos.set(
                clave,
                []
            );

        }

        grupos.get(clave).push(
            venta
        );

    });

    return grupos;

}


// =====================================================
// TARJETA DE VENTA
// =====================================================

function crearTarjetaVentaMobile(
    venta,
    indice
){

    const anulada =
        esVentaAnuladaHistorialMobile(
            venta
        );

    const cantidadProductos =
        obtenerCantidadProductosHistorialMobile(
            venta.productos
        );

    const productoPrincipal =
        obtenerProductoPrincipalHistorialMobile(
            venta.productos
        );

    const cliente =
        venta.clienteDni
            ? `${venta.clienteNombre} · DNI ${venta.clienteDni}`
            : venta.clienteNombre;

    return `

        <article
            class="
                mobile-history-card
                ${anulada ? "is-cancelled" : ""}
            "
            style="
                --mobile-history-card-index:
                ${Math.min(
                    Number(indice || 0),
                    8
                )}
            "
        >

            <div
                class="mobile-history-card-accent"
                aria-hidden="true"
            ></div>

            <header
                class="mobile-history-card-header"
            >

                <div
                    class="mobile-history-card-document"
                >

                    <span
                        class="mobile-history-card-document-icon"
                        aria-hidden="true"
                    >
                        🧾
                    </span>

                    <div>

                        <small>
                            BOLETA DE VENTA
                        </small>

                        <strong>
                            ${escaparHTMLHistorialMobile(
                                venta.numeroBoleta
                            )}
                        </strong>

                    </div>

                </div>

                ${crearBadgeEstadoHistorialMobile(
                    venta
                )}

            </header>

            <div
                class="mobile-history-card-time"
            >

                <span>
                    ${escaparHTMLHistorialMobile(
                        venta.hora
                    )}
                </span>

                <span>
                    ${escaparHTMLHistorialMobile(
                        obtenerTiempoRelativoHistorialMobile(
                            venta.creadaEn
                        )
                    )}
                </span>

            </div>

            <div
                class="mobile-history-card-info-grid"
            >

                ${crearDatoTarjetaHistorialMobile({

                    icono: "👤",

                    etiqueta: "Vendedor",

                    valor: venta.vendedor

                })}

                ${crearDatoTarjetaHistorialMobile({

                    icono: "🏪",

                    etiqueta: "Tienda",

                    valor: venta.tiendaVentaNombre

                })}

                ${crearDatoTarjetaHistorialMobile({

                    icono: "🧍",

                    etiqueta: "Cliente",

                    valor: cliente

                })}

                ${crearDatoTarjetaHistorialMobile({

                    icono: "📦",

                    etiqueta:
                        cantidadProductos === 1
                            ? "1 producto"
                            : `${cantidadProductos} productos`,

                    valor: productoPrincipal

                })}

            </div>

            <div
                class="mobile-history-card-payment"
            >

                <div
                    class="
                        mobile-history-payment-badge
                        is-${escaparHTMLHistorialMobile(
                            venta.metodoPagoVisual.clave
                        )}
                    "
                >

                    <span
                        aria-hidden="true"
                    >
                        ${venta.metodoPagoVisual.icono}
                    </span>

                    <div>

                        <small>
                            MÉTODO DE PAGO
                        </small>

                        <strong>
                            ${escaparHTMLHistorialMobile(
                                venta.metodoPagoVisual.etiqueta
                            )}
                        </strong>

                    </div>

                </div>

                ${
                    venta.descuento > 0
                        ? `

                            <div
                                class="mobile-history-discount"
                            >

                                <small>
                                    DESCUENTO
                                </small>

                                <strong>
                                    ${formatearMonedaHistorialMobile(
                                        venta.descuento
                                    )}
                                </strong>

                            </div>

                        `
                        : ""
                }

            </div>

            <footer
                class="mobile-history-card-footer"
            >

                <div
                    class="mobile-history-card-total"
                >

                    <small>
                        TOTAL
                    </small>

                    <strong>
                        ${formatearMonedaHistorialMobile(
                            venta.total
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-history-card-actions"
                >

                    <button
                        type="button"
                        class="mobile-history-detail-button"
                        data-history-detail="${escaparHTMLHistorialMobile(
                            venta.id
                        )}"
                    >

                        <span>
                            Detalle
                        </span>

                        <span
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </button>

                    <button
                        type="button"
                        class="mobile-history-reprint-button"
                        data-history-reprint="${escaparHTMLHistorialMobile(
                            venta.id
                        )}"
                        aria-label="Preparar reimpresión"
                        title="Reimpresión disponible en M12.5"
                    >
                        🖨️
                    </button>

                </div>

            </footer>

        </article>

    `;

}


// =====================================================
// DATO INTERNO DE TARJETA
// =====================================================

function crearDatoTarjetaHistorialMobile({

    icono,

    etiqueta,

    valor

}){

    return `

        <div
            class="mobile-history-card-info"
        >

            <span
                class="mobile-history-card-info-icon"
                aria-hidden="true"
            >
                ${icono}
            </span>

            <div>

                <small>
                    ${escaparHTMLHistorialMobile(
                        etiqueta
                    )}
                </small>

                <strong>
                    ${escaparHTMLHistorialMobile(
                        valor || "Sin información"
                    )}
                </strong>

            </div>

        </div>

    `;

}


// =====================================================
// BADGE DE ESTADO
// =====================================================

function crearBadgeEstadoHistorialMobile(
    venta
){

    const anulada =
        esVentaAnuladaHistorialMobile(
            venta
        );

    return `

        <span
            class="
                mobile-history-status-badge
                ${anulada ? "is-cancelled" : "is-active"}
            "
        >

            <span
                class="mobile-history-status-dot"
            ></span>

            ${anulada ? "Anulada" : "Activa"}

        </span>

    `;

}


// =====================================================
// MÉTODO DE PAGO VISUAL
// =====================================================

function obtenerMetodoPagoVisualHistorialMobile(
    venta
){

    const pagos =
        normalizarPagosHistorialMobile(
            venta.pagos
        );

    const metodosActivos =
        Object.entries(pagos)
        .filter(function([, monto]){

            return monto > 0;

        });

    if(metodosActivos.length > 1){

        return {

            clave: "mixto",

            etiqueta: "Pago mixto",

            icono: "◉"

        };

    }

    if(metodosActivos.length === 1){

        return obtenerConfiguracionMetodoHistorialMobile(
            metodosActivos[0][0]
        );

    }

    const metodoTexto =
        String(
            venta.metodoPago || ""
        )
        .trim()
        .toLocaleLowerCase("es-PE");

    if(
        metodoTexto.includes("mixt")
    ){

        return {

            clave: "mixto",

            etiqueta: "Pago mixto",

            icono: "◉"

        };

    }

    if(
        metodoTexto.includes("yape")
    ){

        return obtenerConfiguracionMetodoHistorialMobile(
            "yape"
        );

    }

    if(
        metodoTexto.includes("plin")
    ){

        return obtenerConfiguracionMetodoHistorialMobile(
            "plin"
        );

    }

    if(
        metodoTexto.includes("tarjeta")
    ){

        return obtenerConfiguracionMetodoHistorialMobile(
            "tarjeta"
        );

    }

    if(
        metodoTexto.includes("transfer")
    ){

        return obtenerConfiguracionMetodoHistorialMobile(
            "transferencia"
        );

    }

    return obtenerConfiguracionMetodoHistorialMobile(
        "efectivo"
    );

}


// =====================================================
// CONFIGURACIÓN DE MÉTODOS
// =====================================================

function obtenerConfiguracionMetodoHistorialMobile(
    metodo
){

    const metodos = {

        efectivo: {

            clave: "efectivo",

            etiqueta: "Efectivo",

            icono: "💵"

        },

        yape: {

            clave: "yape",

            etiqueta: "Yape",

            icono: "🟣"

        },

        plin: {

            clave: "plin",

            etiqueta: "Plin",

            icono: "🔵"

        },

        tarjeta: {

            clave: "tarjeta",

            etiqueta: "Tarjeta",

            icono: "💳"

        },

        transferencia: {

            clave: "transferencia",

            etiqueta: "Transferencia",

            icono: "🏦"

        }

    };

    return (
        metodos[metodo] ||
        {

            clave: "otro",

            etiqueta: "Otro método",

            icono: "💰"

        }
    );

}


// =====================================================
// NORMALIZAR PAGOS
// =====================================================

function normalizarPagosHistorialMobile(
    pagos = {}
){

    return {

        efectivo:
            numeroSeguroHistorialMobile(
                pagos?.efectivo
            ),

        yape:
            numeroSeguroHistorialMobile(
                pagos?.yape
            ),

        plin:
            numeroSeguroHistorialMobile(
                pagos?.plin
            ),

        tarjeta:
            numeroSeguroHistorialMobile(
                pagos?.tarjeta
            ),

        transferencia:
            numeroSeguroHistorialMobile(
                pagos?.transferencia
            )

    };

}


// =====================================================
// ESTADO VACÍO
// =====================================================

function crearEstadoVacioHistorialMobile(){

    const existeBusqueda =
        Boolean(
            historialBusquedaMobile
        );

    const existeFiltro =
        historialFiltroMobile !==
        "todas";

    return `

        <div
            class="mobile-history-empty"
        >

            <div
                class="mobile-history-empty-visual"
            >

                <div
                    class="mobile-history-empty-glow"
                ></div>

                <div
                    class="mobile-history-empty-icon"
                >
                    ${
                        existeBusqueda ||
                        existeFiltro
                            ? "🔎"
                            : "🧾"
                    }
                </div>

            </div>

            <span
                class="mobile-history-empty-eyebrow"
            >
                ${
                    existeBusqueda ||
                    existeFiltro
                        ? "SIN RESULTADOS"
                        : "HISTORIAL VACÍO"
                }
            </span>

            <h2>
                ${
                    existeBusqueda ||
                    existeFiltro
                        ? "No encontramos ventas"
                        : "Todavía no existen ventas"
                }
            </h2>

            <p>
                ${
                    existeBusqueda ||
                    existeFiltro
                        ? "Prueba otra búsqueda o cambia el filtro seleccionado."
                        : "Las ventas realizadas desde Desktop y Mobile aparecerán aquí automáticamente."
                }
            </p>

            ${
                existeBusqueda ||
                existeFiltro
                    ? `

                        <button
                            type="button"
                            class="mobile-history-empty-action"
                            data-history-filter="todas"
                        >
                            Mostrar todas
                        </button>

                    `
                    : ""
            }

        </div>

    `;

}


// =====================================================
// SKELETON
// =====================================================

function mostrarSkeletonHistorialMobile(){

    const lista =
        obtenerElementoHistorialMobile(
            "#mobileHistoryList"
        );

    if(!lista){

        return;

    }

    lista.innerHTML = `

        <div
            class="mobile-history-skeleton-list"
        >

            ${crearSkeletonVentaHistorialMobile()}

            ${crearSkeletonVentaHistorialMobile()}

            ${crearSkeletonVentaHistorialMobile()}

        </div>

    `;

}

function crearSkeletonVentaHistorialMobile(){

    return `

        <article
            class="mobile-history-skeleton-card"
        >

            <div
                class="mobile-history-skeleton-line is-small"
            ></div>

            <div
                class="mobile-history-skeleton-line is-title"
            ></div>

            <div
                class="mobile-history-skeleton-grid"
            >

                <div
                    class="mobile-history-skeleton-block"
                ></div>

                <div
                    class="mobile-history-skeleton-block"
                ></div>

                <div
                    class="mobile-history-skeleton-block"
                ></div>

                <div
                    class="mobile-history-skeleton-block"
                ></div>

            </div>

            <div
                class="mobile-history-skeleton-line is-total"
            ></div>

        </article>

    `;

}

function crearSkeletonMetricaHistorialMobile(){

    return `

        <article
            class="
                mobile-history-metric
                is-skeleton
            "
        >
        </article>

    `;

}


// =====================================================
// ESTADO DE BÚSQUEDA
// =====================================================

function actualizarEstadoBusquedaHistorialMobile(
    cantidad
){

    const estado =
        obtenerElementoHistorialMobile(
            "#mobileHistorySearchStatus"
        );

    if(!estado){

        return;

    }

    if(historialBusquedaMobile){

        estado.textContent =
            cantidad === 1
                ? "1 venta encontrada"
                : `${cantidad} ventas encontradas`;

        estado.dataset.tipo =
            cantidad > 0
                ? "success"
                : "empty";

        return;

    }

    if(
        historialFiltroMobile !==
        "todas"
    ){

        estado.textContent =
            cantidad === 1
                ? "1 venta en este filtro"
                : `${cantidad} ventas en este filtro`;

        estado.dataset.tipo =
            cantidad > 0
                ? "success"
                : "empty";

        return;

    }

    estado.textContent =
        "Mostrando las últimas ventas";

    estado.dataset.tipo =
        "realtime";

}


// =====================================================
// CONTADOR
// =====================================================

function actualizarContadorHistorialMobile(
    cantidad
){

    const contador =
        obtenerElementoHistorialMobile(
            "#mobileHistoryResultCount"
        );

    if(contador){

        contador.textContent =
            String(cantidad);

    }

}


// =====================================================
// BOTÓN LIMPIAR
// =====================================================

function actualizarVisibilidadBotonLimpiarMobile(){

    const boton =
        obtenerElementoHistorialMobile(
            "#mobileHistorySearchClear"
        );

    if(boton){

        boton.hidden =
            !historialBusquedaMobile;

    }

}


// =====================================================
// DETALLE PREPARADO PARA M12.5
// =====================================================

// =====================================================
// ABRIR DETALLE DE VENTA
// =====================================================

function abrirDetalleHistorialMobile(
    venta
){

    if(!venta){

        return;

    }

    const sheet =
        obtenerElementoHistorialMobile(
            "#mobileHistorySheet"
        );

    const titulo =
        obtenerElementoHistorialMobile(
            "#mobileHistorySheetTitle"
        );

    const cuerpo =
        obtenerElementoHistorialMobile(
            "#mobileHistorySheetBody"
        );

    const botonReimpresion =
        obtenerElementoHistorialMobile(
            "#mobileHistorySheetReprint"
        );

    if(
        !sheet ||
        !titulo ||
        !cuerpo
    ){

        return;

    }

    ventaDetalleHistorialMobile =
        venta;

    titulo.textContent =
        venta.numeroBoleta;

    cuerpo.innerHTML =
        crearContenidoDetalleHistorialMobile(
            venta
        );

    if(botonReimpresion){

        botonReimpresion.dataset.historyReprint =
            venta.id;

        botonReimpresion.disabled =
            !venta.id;

    }

    sheet.classList.add(
        "is-open"
    );

    sheet.setAttribute(
        "aria-hidden",
        "false"
    );

    document.documentElement.classList.add(
        "mobile-history-sheet-open"
    );

    document.body.classList.add(
        "mobile-history-sheet-open"
    );

    window.requestAnimationFrame(
        function(){

            const botonCerrar =
                sheet.querySelector(
                    ".mobile-history-sheet-close"
                );

            botonCerrar?.focus();

        }
    );

}


// =====================================================
// CERRAR DETALLE DE VENTA
// =====================================================

function cerrarDetalleHistorialMobile(){

    const sheet =
        obtenerElementoHistorialMobile(
            "#mobileHistorySheet"
        );

    if(!sheet){

        return;

    }

    const elementoActivo =
        document.activeElement;

    if(
        elementoActivo &&
        sheet.contains(
            elementoActivo
        )
    ){

        elementoActivo.blur();

    }

    if(
        disparadorDetalleHistorialMobile &&
        document.contains(
            disparadorDetalleHistorialMobile
        )
    ){

        disparadorDetalleHistorialMobile.focus({
            preventScroll: true
        });

    }

    sheet.classList.remove(
        "is-open"
    );

    sheet.setAttribute(
        "aria-hidden",
        "true"
    );

    document.documentElement.classList.remove(
        "mobile-history-sheet-open"
    );

    document.body.classList.remove(
        "mobile-history-sheet-open"
    );

    ventaDetalleHistorialMobile =
        null;

    disparadorDetalleHistorialMobile =
        null;

}

// =====================================================
// CONTENIDO DEL DETALLE
// =====================================================

function crearContenidoDetalleHistorialMobile(
    venta
){

    const anulada =
        esVentaAnuladaHistorialMobile(
            venta
        );

    return `

        ${crearSeccionDocumentoHistorialMobile(
            venta,
            anulada
        )}

        ${crearSeccionClienteHistorialMobile(
            venta
        )}

        ${crearSeccionProductosHistorialMobile(
            venta.productos
        )}

        ${crearSeccionPagosHistorialMobile(
            venta
        )}

        ${crearSeccionResumenHistorialMobile(
            venta
        )}

    `;

}


// =====================================================
// DOCUMENTO
// =====================================================

function crearSeccionDocumentoHistorialMobile(
    venta,
    anulada
){

    return `

        <section
            class="mobile-history-sheet-section"
        >

            <span
                class="mobile-history-sheet-section-title"
            >
                DOCUMENTO
            </span>

            ${crearFilaDetalleHistorialMobile(
                "Boleta",
                venta.numeroBoleta
            )}

            ${crearFilaDetalleHistorialMobile(
                "Estado",
                anulada
                    ? "Anulada"
                    : "Activa"
            )}

            ${crearFilaDetalleHistorialMobile(
                "Fecha",
                venta.fecha ||
                formatearFechaCortaHistorialMobile(
                    venta.fechaISO
                )
            )}

            ${crearFilaDetalleHistorialMobile(
                "Hora",
                venta.hora
            )}

            ${crearFilaDetalleHistorialMobile(
                "Vendedor",
                venta.vendedor
            )}

            ${crearFilaDetalleHistorialMobile(
                "Tienda",
                venta.tiendaVentaNombre
            )}

        </section>

    `;

}


// =====================================================
// CLIENTE
// =====================================================

function crearSeccionClienteHistorialMobile(
    venta
){

    return `

        <section
            class="mobile-history-sheet-section"
        >

            <span
                class="mobile-history-sheet-section-title"
            >
                CLIENTE
            </span>

            ${crearFilaDetalleHistorialMobile(
                "Nombre",
                venta.clienteNombre ||
                "Cliente general"
            )}

            ${crearFilaDetalleHistorialMobile(
                "DNI",
                venta.clienteDni ||
                "No registrado"
            )}

        </section>

    `;

}


// =====================================================
// PRODUCTOS
// =====================================================

function crearSeccionProductosHistorialMobile(
    productos = []
){

    const lista =
        Array.isArray(productos)
            ? productos
            : [];

    return `

        <section
            class="mobile-history-sheet-section"
        >

            <span
                class="mobile-history-sheet-section-title"
            >
                PRODUCTOS
            </span>

            ${
                lista.length > 0
                    ? lista
                        .map(
                            crearProductoDetalleHistorialMobile
                        )
                        .join("")
                    : crearFilaDetalleHistorialMobile(
                        "Productos",
                        "Sin productos registrados"
                    )
            }

        </section>

    `;

}


// =====================================================
// PRODUCTO INDIVIDUAL
// =====================================================

function crearProductoDetalleHistorialMobile(
    producto
){

    const nombre =
        producto.nombreBoleta ||
        producto.producto ||
        producto.codigo ||
        "Producto";

    const cantidad =
        numeroSeguroHistorialMobile(
            producto.cantidad
        );

    const precio =
        numeroSeguroHistorialMobile(
            producto.precio
        );

    const subtotalGuardado =
        numeroSeguroHistorialMobile(
            producto.subtotal
        );

    const subtotal =
        subtotalGuardado > 0
            ? subtotalGuardado
            : cantidad * precio;

    return `

        <div
            class="mobile-history-sheet-product"
        >

            <div
                class="mobile-history-sheet-product-main"
            >

                <strong>
                    ${escaparHTMLHistorialMobile(
                        nombre
                    )}
                </strong>

                <small>
                    ${escaparHTMLHistorialMobile(
                        producto.codigo ||
                        producto.categoria ||
                        "Producto"
                    )}
                </small>

            </div>

            <div
                class="mobile-history-sheet-product-calculation"
            >

                <span>
                    ${cantidad}
                    ×
                    ${formatearMonedaHistorialMobile(
                        precio
                    )}
                </span>

                <strong>
                    ${formatearMonedaHistorialMobile(
                        subtotal
                    )}
                </strong>

            </div>

        </div>

    `;

}


// =====================================================
// PAGOS
// =====================================================

function crearSeccionPagosHistorialMobile(
    venta
){

    const pagosActivos =
        Object.entries(
            venta.pagos || {}
        )
        .filter(function([, monto]){

            return (
                numeroSeguroHistorialMobile(
                    monto
                ) > 0
            );

        });

    return `

        <section
            class="mobile-history-sheet-section"
        >

            <span
                class="mobile-history-sheet-section-title"
            >
                PAGOS
            </span>

            ${
                pagosActivos.length > 0
                    ? pagosActivos
                        .map(function([
                            metodo,
                            monto
                        ]){

                            const configuracion =
                                obtenerConfiguracionMetodoHistorialMobile(
                                    metodo
                                );

                            return crearFilaDetalleHistorialMobile(
                                `${configuracion.icono} ${configuracion.etiqueta}`,
                                formatearMonedaHistorialMobile(
                                    monto
                                )
                            );

                        })
                        .join("")
                    : crearFilaDetalleHistorialMobile(
                        "Método",
                        venta.metodoPagoVisual.etiqueta
                    )
            }

        </section>

    `;

}


// =====================================================
// RESUMEN
// =====================================================

function crearSeccionResumenHistorialMobile(
    venta
){

    const subtotal =
        venta.total +
        venta.descuento;

    return `

        <section
            class="mobile-history-sheet-section"
        >

            <span
                class="mobile-history-sheet-section-title"
            >
                RESUMEN
            </span>

            ${crearFilaDetalleHistorialMobile(
                "Subtotal",
                formatearMonedaHistorialMobile(
                    subtotal
                )
            )}

            ${crearFilaDetalleHistorialMobile(
                "Descuento",
                venta.descuento > 0
                    ? `- ${formatearMonedaHistorialMobile(
                        venta.descuento
                    )}`
                    : formatearMonedaHistorialMobile(
                        0
                    )
            )}

            <div
                class="mobile-history-sheet-total"
            >

                <span>
                    TOTAL
                </span>

                <strong>
                    ${formatearMonedaHistorialMobile(
                        venta.total
                    )}
                </strong>

            </div>

        </section>

    `;

}


// =====================================================
// FILA DEL DETALLE
// =====================================================

function crearFilaDetalleHistorialMobile(
    etiqueta,
    valor
){

    return `

        <div
            class="mobile-history-sheet-row"
        >

            <span>
                ${escaparHTMLHistorialMobile(
                    etiqueta
                )}
            </span>

            <strong>
                ${escaparHTMLHistorialMobile(
                    valor || "Sin información"
                )}
            </strong>

        </div>

    `;

}


// =====================================================
// REIMPRESIÓN
// =====================================================

async function prepararReimpresionHistorialMobile(
    venta
){

    if(!venta){

        return;

    }


    const numeroBoleta =
        String(
            venta.numeroBoleta || ""
        ).trim();


    if(
        !numeroBoleta ||
        numeroBoleta === "SIN IMPRESION" ||
        numeroBoleta === "Boleta pendiente"
    ){

        window.alert(
            "Esta venta no tiene una boleta disponible para reimprimir."
        );

        return;

    }


    try{

        const html =
            construirHTMLReimpresionBoletaMobile(
                venta
            );


        await imprimirHTMLBoletaMobile(
            html
        );

    }catch(error){

        console.error(
            "[Historial Mobile] Error al reimprimir boleta:",
            error
        );


        window.alert(
            error?.message ||
            "No se pudo preparar la reimpresión."
        );

    }

}

// =====================================================
// BUSCAR VENTA EN MEMORIA
// =====================================================

function buscarVentaHistorialMobile(
    ventaId
){

    return (
        historialVentasOriginalMobile.find(
            function(venta){

                return venta.id ===
                    String(ventaId || "");

            }
        ) ||
        null
    );

}


// =====================================================
// HELPERS DE PRODUCTOS
// =====================================================

function obtenerCantidadProductosHistorialMobile(
    productos
){

    return productos.reduce(
        function(total, producto){

            return (
                total +
                Math.max(
                    0,
                    Number(
                        producto.cantidad || 0
                    )
                )
            );

        },
        0
    );

}

function obtenerProductoPrincipalHistorialMobile(
    productos
){

    if(productos.length === 0){

        return "Sin productos";

    }

    const principal =
        productos[0];

    const nombre =
        principal.nombreBoleta ||
        principal.producto ||
        principal.codigo ||
        "Producto";

    if(productos.length === 1){

        return String(nombre);

    }

    return (
        `${nombre} +${productos.length - 1}`
    );

}


// =====================================================
// HELPERS DE ESTADO
// =====================================================

function esVentaAnuladaHistorialMobile(
    venta
){

    return (
        venta.estado === "anulada" ||
        venta.estado === "anulado" ||
        venta.estadoAnulado === true
    );

}

function esVentaDeHoyHistorialMobile(
    venta
){

    return (
        venta.fechaISO ===
        obtenerFechaLocalISOHistorialMobile()
    );

}


// =====================================================
// FECHAS
// =====================================================

function obtenerFechaISOHistorialMobile(
    venta
){

    if(
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(
                venta.fechaISO || ""
            )
        )
    ){

        return venta.fechaISO;

    }

    const fecha =
        crearFechaSeguraHistorialMobile(
            venta.creadaEn
        );

    if(fecha){

        return formatearFechaLocalISOHistorialMobile(
            fecha
        );

    }

    return "";

}

function obtenerFechaLocalISOHistorialMobile(){

    return formatearFechaLocalISOHistorialMobile(
        new Date()
    );

}

function formatearFechaLocalISOHistorialMobile(
    fecha
){

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );

    const dia =
        String(
            fecha.getDate()
        )
        .padStart(
            2,
            "0"
        );

    return `${anio}-${mes}-${dia}`;

}

function obtenerEtiquetaFechaHistorialMobile(
    fechaISO
){

    const hoy =
        obtenerFechaLocalISOHistorialMobile();

    const fechaHoy =
        crearFechaDesdeISOHistorialMobile(
            hoy
        );

    const fechaVenta =
        crearFechaDesdeISOHistorialMobile(
            fechaISO
        );

    if(!fechaVenta){

        return "Sin fecha";

    }

    if(fechaISO === hoy){

        return "Hoy";

    }

    const ayer =
        new Date(fechaHoy);

    ayer.setDate(
        ayer.getDate() - 1
    );

    if(
        fechaISO ===
        formatearFechaLocalISOHistorialMobile(
            ayer
        )
    ){

        return "Ayer";

    }

    return fechaVenta.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "short"
        }
    );

}

function formatearFechaLargaHistorialMobile(
    fechaISO
){

    const fecha =
        crearFechaDesdeISOHistorialMobile(
            fechaISO
        );

    if(!fecha){

        return "Fecha no disponible";

    }

    return fecha.toLocaleDateString(
        "es-PE",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}

function formatearFechaCortaHistorialMobile(
    fechaISO
){

    const fecha =
        crearFechaDesdeISOHistorialMobile(
            fechaISO
        );

    if(!fecha){

        return "";

    }

    return fecha.toLocaleDateString(
        "es-PE"
    );

}

function formatearHoraHistorialMobile(
    valor
){

    const fecha =
        crearFechaSeguraHistorialMobile(
            valor
        );

    if(!fecha){

        return "Hora no disponible";

    }

    return fecha.toLocaleTimeString(
        "es-PE",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}

function obtenerTiempoRelativoHistorialMobile(
    valor
){

    const fecha =
        crearFechaSeguraHistorialMobile(
            valor
        );

    if(!fecha){

        return "Sincronizada";

    }

    const diferencia =
        Date.now() -
        fecha.getTime();

    const minutos =
        Math.floor(
            diferencia / 60000
        );

    if(minutos < 1){

        return "Ahora";

    }

    if(minutos < 60){

        return `Hace ${minutos} min`;

    }

    const horas =
        Math.floor(
            minutos / 60
        );

    if(horas < 24){

        return (
            horas === 1
                ? "Hace 1 hora"
                : `Hace ${horas} horas`
        );

    }

    const dias =
        Math.floor(
            horas / 24
        );

    return (
        dias === 1
            ? "Hace 1 día"
            : `Hace ${dias} días`
    );

}

function crearFechaDesdeISOHistorialMobile(
    fechaISO
){

    if(
        !/^\d{4}-\d{2}-\d{2}$/.test(
            String(
                fechaISO || ""
            )
        )
    ){

        return null;

    }

    const [
        anio,
        mes,
        dia
    ] =
        fechaISO
        .split("-")
        .map(Number);

    const fecha =
        new Date(
            anio,
            mes - 1,
            dia
        );

    return Number.isNaN(
        fecha.getTime()
    )
        ? null
        : fecha;

}

function crearFechaSeguraHistorialMobile(
    valor
){

    if(!valor){

        return null;

    }

    if(
        valor instanceof Date
    ){

        return Number.isNaN(
            valor.getTime()
        )
            ? null
            : valor;

    }

    if(
        typeof valor?.toDate ===
        "function"
    ){

        const fecha =
            valor.toDate();

        return Number.isNaN(
            fecha.getTime()
        )
            ? null
            : fecha;

    }

    const fecha =
        new Date(valor);

    return Number.isNaN(
        fecha.getTime()
    )
        ? null
        : fecha;

}


// =====================================================
// TIENDA
// =====================================================

function obtenerNombreTiendaHistorialMobile(
    tienda
){

    if(tienda === "principal"){

        return "Mercado";

    }

    if(tienda === "sucursal"){

        return "Peluquería";

    }

    return "Tienda no definida";

}


// =====================================================
// FORMATOS
// =====================================================

function numeroSeguroHistorialMobile(
    valor
){

    const numero =
        Number(valor);

    return Number.isFinite(numero)
        ? numero
        : 0;

}

function formatearMonedaHistorialMobile(
    valor
){

    return new Intl.NumberFormat(
        "es-PE",
        {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        numeroSeguroHistorialMobile(
            valor
        )
    );

}

function escaparHTMLHistorialMobile(
    valor
){

    return String(
        valor ?? ""
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


// =====================================================
// HELPERS DOM
// =====================================================

function obtenerElementoHistorialMobile(
    selector
){

    return (
        contenedorHistorialMobile
        ?.querySelector(
            selector
        ) ||
        null
    );

}


// =====================================================
// LIMPIEZA DE SUSCRIPCIÓN
// =====================================================

function reiniciarSuscripcionHistorialMobile(){

    if(
        typeof cancelarSuscripcionHistorialMobile ===
        "function"
    ){

        cancelarSuscripcionHistorialMobile();

    }

    cancelarSuscripcionHistorialMobile =
        null;

    if(controladorEventosHistorialMobile){

        controladorEventosHistorialMobile.abort();

    }

    controladorEventosHistorialMobile =
        null;

    cerrarDetalleHistorialMobile();

}


// =====================================================
// RESET TOTAL
// =====================================================

export function reiniciarHistorialMobile(){

    reiniciarSuscripcionHistorialMobile();

    historialVentasOriginalMobile = [];

    historialBusquedaMobile = "";

    historialFiltroMobile = "todas";

    if(contenedorHistorialMobile){

        contenedorHistorialMobile.innerHTML =
            "";

    }

    contenedorHistorialMobile =
        null;

    ventaDetalleHistorialMobile =
        null;

    disparadorDetalleHistorialMobile =
        null;    

}