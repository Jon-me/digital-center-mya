// =====================================================
// DIGITAL CENTER M&A
// MOBILE GARANTÍAS VIEW
// FASE M8.1.2
// WARRANTY CENTER BASE VIEW
// =====================================================

import {

    suscribirGarantiasMobile,

    cancelarRealtimeGarantiasMobile,

    actualizarGarantiaMobile,

    estaOperacionGarantiaMobileEnProceso

} from "../services/garantias-mobile-service.js";

import {

    solicitarAutorizacionAdminMobile,

    cerrarAutorizacionAdminMobile

} from "../components/admin-authorization-mobile.js";

// =====================================================
// ESTADO DE LA VISTA
// =====================================================

let garantiasEncontradasMobile =
    [];

let textoBusquedaGarantiaMobile =
    "";

let vistaGarantiasMobileInicializada =
    false;

let garantiaSeleccionadaMobile =
    null;

let estadoGarantiaSeleccionadoMobile =
    "Pendiente";

let modalGarantiaMobileAbierto =
    false;

let guardadoGarantiaMobileEnProceso =
    false;

let cancelarSuscripcionVistaGarantiasMobile =
    null;    

// =====================================================
// CONSTRUCCIÓN DE LA VISTA
// =====================================================

function construirVistaGarantiasMobile(){

    return `

        <section
            id="mobile-garantias-view"
            class="mobile-garantias-view"
        >

            <header
                class="mobile-garantias-header"
            >

                <div>

                    <small>
                        DIGITAL CENTER M&A
                    </small>

                    <h1>
                        Garantías
                    </h1>

                    <p>
                        Consulta y seguimiento de productos vendidos.
                    </p>

                </div>

            </header>

            <section
                class="mobile-garantias-search"
                aria-label="Buscar garantía"
            >

                <label
                    for="mobile-garantias-search-input"
                >
                    DNI o número de boleta
                </label>

                <div
                    class="mobile-garantias-search-controls"
                >

                    <input
                        id="mobile-garantias-search-input"
                        type="search"
                        inputmode="text"
                        autocomplete="off"
                        placeholder="Ejemplo: 12345678 o B001-000123"
                    >

                    <button
                        id="mobile-garantias-search-button"
                        type="button"
                    >
                        Buscar
                    </button>

                    <button
                        id="mobile-garantias-clear-button"
                        type="button"
                        aria-label="Limpiar búsqueda"
                        title="Limpiar búsqueda"
                    >
                        ×
                    </button>

                </div>

                <p
                    id="mobile-garantias-status"
                    class="mobile-garantias-search-status"
                    data-tipo="neutral"
                    aria-live="polite"
                >
                    Esperando una búsqueda.
                </p>

            </section>

            <section
                id="mobile-garantias-results"
                class="mobile-garantias-results"
            ></section>

            <div
                id="mobile-garantias-modal-root"
            ></div>

        </section>

    `;

}

// =====================================================
// UTILIDADES HTML
// =====================================================

function escaparHTMLGarantiasMobile(
    valor
){

    return String(
        valor ??
        ""
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


function formatearMontoGarantiaMobile(
    valor
){

    const monto =
        Number(
            valor || 0
        );


    if(
        !Number.isFinite(
            monto
        )
    ){

        return "0.00";

    }


    return monto.toFixed(
        2
    );

}


// =====================================================
// CONTENEDORES
// =====================================================

function obtenerVistaGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-view"
    );

}


function obtenerInputGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-search-input"
    );

}


function obtenerBotonBuscarGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-search-button"
    );

}


function obtenerBotonLimpiarGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-clear-button"
    );

}


function obtenerResultadosGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-results"
    );

}


function obtenerEstadoGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-status"
    );

}

function obtenerModalRootGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-modal-root"
    );

}


function obtenerModalGarantiasMobile(){

    return document.getElementById(
        "mobile-garantias-modal"
    );

}


function obtenerObservacionGarantiaMobile(){

    return document.getElementById(
        "mobile-garantias-modal-observacion"
    );

}


function obtenerBotonGuardarGarantiaMobile(){

    return document.getElementById(
        "mobile-garantias-modal-save"
    );

}


// =====================================================
// INFORMACIÓN DE ESTADO
// =====================================================

function establecerEstadoGarantiasMobile(
    mensaje = "",
    tipo = "neutral"
){

    const estado =
        obtenerEstadoGarantiasMobile();


    if(!estado){

        return;

    }


    estado.textContent =
        mensaje;


    estado.dataset.tipo =
        tipo;

}


function establecerBusquedaEnProcesoMobile(
    enProceso
){

    const input =
        obtenerInputGarantiasMobile();

    const botonBuscar =
        obtenerBotonBuscarGarantiasMobile();

    const botonLimpiar =
        obtenerBotonLimpiarGarantiasMobile();


    if(input){

        input.disabled =
            enProceso;

        input.setAttribute(
            "aria-busy",
            String(enProceso)
        );

    }


    if(botonBuscar){

        botonBuscar.disabled =
            enProceso;

        botonBuscar.classList.toggle(
            "is-loading",
            enProceso
        );

        botonBuscar.textContent =
            enProceso
                ? "Buscando..."
                : "Buscar";

    }


    if(botonLimpiar){

        botonLimpiar.disabled =
            enProceso;

    }

}

function establecerGuardadoGarantiaEnProcesoMobile(
    enProceso
){

    guardadoGarantiaMobileEnProceso =
        enProceso;


    const modal =
        obtenerModalGarantiasMobile();


    if(!modal){

        return;

    }


    const botonGuardar =
        obtenerBotonGuardarGarantiaMobile();


    const textarea =
        obtenerObservacionGarantiaMobile();


    const controles =
        modal.querySelectorAll(
            `
                input[name="mobile-garantias-estado"],
                [data-action="cerrar-modal-garantia"]
            `
        );


    controles.forEach(
        function(control){

            control.disabled =
                enProceso;

        }
    );


    if(textarea){

        textarea.disabled =
            enProceso;

        textarea.setAttribute(
            "aria-busy",
            String(enProceso)
        );

    }


    if(botonGuardar){

        botonGuardar.disabled =
            enProceso;

        botonGuardar.classList.toggle(
            "is-loading",
            enProceso
        );

        botonGuardar.textContent =
            enProceso
                ? "Guardando..."
                : "Guardar cambios";

        botonGuardar.setAttribute(
            "aria-busy",
            String(enProceso)
        );

    }

}

function establecerEstadoModalGarantiaMobile(
    mensaje = "",
    tipo = "neutral"
){

    const estado =
        document.getElementById(
            "mobile-garantias-modal-status"
        );


    if(!estado){

        return;

    }


    estado.textContent =
        mensaje;


    estado.dataset.tipo =
        tipo;

}

function actualizarGarantiaEncontradaMobile(
    garantiaActualizada
){

    if(
        !garantiaActualizada ||
        !garantiaActualizada.id
    ){

        return;

    }


    garantiasEncontradasMobile =
        garantiasEncontradasMobile.map(
            function(garantia){

                if(
                    garantia.id ===
                    garantiaActualizada.id
                ){

                    return garantiaActualizada;

                }


                return garantia;

            }
        );


    garantiaSeleccionadaMobile =
        garantiaActualizada;


    renderizarResultadosGarantiasMobile(
        garantiasEncontradasMobile
    );

}


// =====================================================
// ESTADO INICIAL
// =====================================================

function renderizarEstadoInicialGarantiasMobile(){

    const contenedor =
        obtenerResultadosGarantiasMobile();


    if(!contenedor){

        return;

    }


    contenedor.innerHTML = `
        <section
            class="mobile-garantias-empty"
            aria-live="polite"
        >

            <div
                class="mobile-garantias-empty-icon"
                aria-hidden="true"
            >
                🛡️
            </div>

            <h2>
                Centro de Garantías
            </h2>

            <p>
                Ingresa el DNI del cliente o el
                número de boleta para consultar
                sus productos y el estado de atención.
            </p>

        </section>
    `;


    establecerEstadoGarantiasMobile(
        "Esperando una búsqueda.",
        "neutral"
    );

}


// =====================================================
// LOADING
// =====================================================

function renderizarCargandoGarantiasMobile(){

    const contenedor =
        obtenerResultadosGarantiasMobile();


    if(!contenedor){

        return;

    }


    contenedor.innerHTML = `
        <section
            class="mobile-garantias-loading"
            aria-live="polite"
        >

            <div
                class="mobile-garantias-spinner"
                aria-hidden="true"
            ></div>

            <h2>
                Buscando garantía
            </h2>

            <p>
                Consultando las boletas registradas...
            </p>

        </section>
    `;


    establecerEstadoGarantiasMobile(
        "Búsqueda en proceso.",
        "loading"
    );

}


// =====================================================
// SIN RESULTADOS
// =====================================================

function renderizarSinResultadosGarantiasMobile(
    texto
){

    const contenedor =
        obtenerResultadosGarantiasMobile();


    if(!contenedor){

        return;

    }


    contenedor.innerHTML = `
        <section
            class="mobile-garantias-empty"
            aria-live="polite"
        >

            <div
                class="mobile-garantias-empty-icon"
                aria-hidden="true"
            >
                🔎
            </div>

            <h2>
                Sin resultados
            </h2>

            <p>
                No encontramos una boleta asociada a:
            </p>

            <strong>
                ${escaparHTMLGarantiasMobile(texto)}
            </strong>

        </section>
    `;


    establecerEstadoGarantiasMobile(
        "No se encontraron coincidencias.",
        "empty"
    );

}


// =====================================================
// ERROR
// =====================================================

function renderizarErrorGarantiasMobile(
    mensaje
){

    const contenedor =
        obtenerResultadosGarantiasMobile();


    if(!contenedor){

        return;

    }


    contenedor.innerHTML = `
        <section
            class="mobile-garantias-error"
            aria-live="assertive"
        >

            <div
                class="mobile-garantias-error-icon"
                aria-hidden="true"
            >
                ⚠️
            </div>

            <h2>
                No se pudo buscar
            </h2>

            <p>
                ${escaparHTMLGarantiasMobile(
                    mensaje ||
                    "Ocurrió un error consultando las garantías."
                )}
            </p>

        </section>
    `;


    establecerEstadoGarantiasMobile(
        "Error durante la búsqueda.",
        "error"
    );

}


// =====================================================
// PRODUCTOS
// =====================================================

function construirProductosGarantiaMobile(
    productos = []
){

    if(
        !Array.isArray(productos) ||
        productos.length === 0
    ){

        return `
            <div
                class="mobile-garantias-product-empty"
            >
                No hay productos registrados
                en esta boleta.
            </div>
        `;

    }


    return productos
        .map(
            function(producto){

                const nombre =
                    producto.nombreBoleta ||
                    producto.producto ||
                    "Producto sin nombre";


                const cantidad =
                    Number(
                        producto.cantidad || 0
                    );


                const precio =
                    Number(
                        producto.precio || 0
                    );


                const subtotalRegistrado =
                    Number(
                        producto.subtotal || 0
                    );


                const subtotal =
                    subtotalRegistrado > 0
                        ? subtotalRegistrado
                        : precio * cantidad;


                return `
                    <article
                        class="mobile-garantias-product"
                    >

                        <div
                            class="mobile-garantias-product-main"
                        >

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    nombre
                                )}
                            </strong>

                            ${
                                producto.codigo
                                    ? `
                                        <small>
                                            Código:
                                            ${escaparHTMLGarantiasMobile(
                                                producto.codigo
                                            )}
                                        </small>
                                    `
                                    : ""
                            }

                        </div>

                        <div
                            class="mobile-garantias-product-summary"
                        >

                            <span>
                                x${cantidad}
                            </span>

                            <strong>
                                S/ ${formatearMontoGarantiaMobile(
                                    subtotal
                                )}
                            </strong>

                        </div>

                    </article>
                `;

            }
        )
        .join("");

}


// =====================================================
// ESTADO DE GARANTÍA
// =====================================================

function obtenerPresentacionEstadoGarantiaMobile(
    estado
){

    switch(estado){

        case "Aprobada":

            return {

                texto:
                    "Aprobada",

                clase:
                    "is-approved",

                icono:
                    "✓"

            };


        case "Rechazada":

            return {

                texto:
                    "Rechazada",

                clase:
                    "is-rejected",

                icono:
                    "×"

            };


        case "Observación":

            return {

                texto:
                    "Observación",

                clase:
                    "is-observation",

                icono:
                    "!"

            };


        default:

            return {

                texto:
                    "Pendiente",

                clase:
                    "is-pending",

                icono:
                    "•"

            };

    }

}


// =====================================================
// CARD DE BOLETA
// =====================================================

function construirCardGarantiaMobile(
    garantia
){

    const estado =
        obtenerPresentacionEstadoGarantiaMobile(
            garantia.estadoGarantia
        );


    const productosHTML =
        construirProductosGarantiaMobile(
            garantia.productos
        );


    return `
        <article
            class="mobile-garantias-card"
            data-boleta-id="${escaparHTMLGarantiasMobile(
                garantia.id
            )}"
        >

            <header
                class="mobile-garantias-card-header"
            >

                <div>

                    <small>
                        COMPROBANTE
                    </small>

                    <h2>
                        ${escaparHTMLGarantiasMobile(
                            garantia.numeroBoleta
                        )}
                    </h2>

                </div>

                <span
                    class="
                        mobile-garantias-status-badge
                        ${estado.clase}
                    "
                >
                    <span aria-hidden="true">
                        ${estado.icono}
                    </span>

                    ${estado.texto}
                </span>

            </header>

            <section
                class="mobile-garantias-info-grid"
            >

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        Cliente
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.clienteNombre
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        DNI
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.clienteDni ||
                            "Sin DNI"
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        Fecha
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.fecha ||
                            "Sin fecha"
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        Tienda
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.tiendaVentaNombre
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        Vendedor
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.vendedor
                        )}
                    </strong>

                </div>

                <div
                    class="mobile-garantias-info-item"
                >

                    <small>
                        Total
                    </small>

                    <strong>
                        S/ ${formatearMontoGarantiaMobile(
                            garantia.total
                        )}
                    </strong>

                </div>

            </section>

            <section
                class="mobile-garantias-products"
            >

                <header>

                    <small>
                        Productos de la venta
                    </small>

                </header>

                ${productosHTML}

            </section>

            ${
                garantia.observacionGarantia
                    ? `
                        <section
                            class="mobile-garantias-observation"
                        >

                            <small>
                                Última observación
                            </small>

                            <p>
                                ${escaparHTMLGarantiasMobile(
                                    garantia.observacionGarantia
                                )}
                            </p>

                        </section>
                    `
                    : ""
            }

            <footer
                class="mobile-garantias-card-footer"
            >

                <div>

                    <small>
                        Última atención
                    </small>

                    <strong>
                        ${escaparHTMLGarantiasMobile(
                            garantia.atendidoGarantia ||
                            "Sin atención registrada"
                        )}
                    </strong>

                </div>

                <button
                    type="button"
                    class="mobile-garantias-open-button"
                    data-action="abrir-garantia"
                    data-boleta-id="${escaparHTMLGarantiasMobile(
                        garantia.id
                    )}"
                >
                    Revisar garantía
                </button>

            </footer>

        </article>
    `;

}


// =====================================================
// RENDERIZADO DE RESULTADOS
// =====================================================

function renderizarResultadosGarantiasMobile(
    garantias
){

    const contenedor =
        obtenerResultadosGarantiasMobile();


    if(!contenedor){

        return;

    }


    const html =
        garantias
            .map(
                construirCardGarantiaMobile
            )
            .join("");


    contenedor.innerHTML =
        html;


    establecerEstadoGarantiasMobile(

        garantias.length === 1
            ? "1 boleta encontrada."
            : `${garantias.length} boletas encontradas.`,

        "success"

    );

}

function detenerRealtimeVistaGarantiasMobile(){

    if(
        typeof cancelarSuscripcionVistaGarantiasMobile ===
        "function"
    ){

        cancelarSuscripcionVistaGarantiasMobile();

    }


    cancelarSuscripcionVistaGarantiasMobile =
        null;


    cancelarRealtimeGarantiasMobile();

}


// =====================================================
// BÚSQUEDA
// =====================================================

function ejecutarBusquedaGarantiasMobile(){

    if(
        estaOperacionGarantiaMobileEnProceso()
    ){

        return;

    }


    const input =
        obtenerInputGarantiasMobile();


    const texto =
        String(
            input?.value ||
            ""
        )
            .trim();


    if(!texto){

        establecerEstadoGarantiasMobile(
            "Ingresa un DNI o número de boleta.",
            "warning"
        );


        input?.focus();

        return;

    }


    detenerRealtimeVistaGarantiasMobile();


    textoBusquedaGarantiaMobile =
        texto;


    garantiasEncontradasMobile =
        [];


    establecerBusquedaEnProcesoMobile(
        true
    );


    renderizarCargandoGarantiasMobile();


    cancelarSuscripcionVistaGarantiasMobile =
        suscribirGarantiasMobile(

            texto,

            function(resultado){

                establecerBusquedaEnProcesoMobile(
                    false
                );


                if(
                    textoBusquedaGarantiaMobile !==
                    texto
                ){

                    return;

                }


                if(
                    !resultado.completada
                ){

                    renderizarErrorGarantiasMobile(
                        resultado.mensaje
                    );

                    return;

                }


                garantiasEncontradasMobile =
                    resultado.garantias ||
                    [];


                if(
                    garantiasEncontradasMobile.length ===
                    0
                ){

                    garantiaSeleccionadaMobile =
                        null;


                    if(
                        modalGarantiaMobileAbierto
                    ){

                        cerrarModalGarantiaMobile();

                    }


                    renderizarSinResultadosGarantiasMobile(
                        texto
                    );

                    return;

                }


                if(
                    garantiaSeleccionadaMobile
                ){

                    const garantiaActualizada =
                        garantiasEncontradasMobile.find(
                            function(garantia){

                                return (
                                    garantia.id ===
                                    garantiaSeleccionadaMobile.id
                                );

                            }
                        );


                    if(garantiaActualizada){

                        garantiaSeleccionadaMobile =
                            garantiaActualizada;

                    }else{

                        garantiaSeleccionadaMobile =
                            null;


                        if(
                            modalGarantiaMobileAbierto
                        ){

                            cerrarModalGarantiaMobile();

                        }

                    }

                }


                renderizarResultadosGarantiasMobile(
                    garantiasEncontradasMobile
                );

            },

            function(error){

                establecerBusquedaEnProcesoMobile(
                    false
                );


                if(
                    textoBusquedaGarantiaMobile !==
                    texto
                ){

                    return;

                }


                renderizarErrorGarantiasMobile(
                    error?.message ||
                    "No se pudo mantener sincronizada la búsqueda."
                );

            }

        );

}


// =====================================================
// LIMPIAR BÚSQUEDA
// =====================================================

function limpiarBusquedaGarantiasMobile(){

    detenerRealtimeVistaGarantiasMobile();


    const input =
        obtenerInputGarantiasMobile();


    textoBusquedaGarantiaMobile =
        "";


    garantiasEncontradasMobile =
        [];


    garantiaSeleccionadaMobile =
        null;


    if(
        modalGarantiaMobileAbierto
    ){

        cerrarModalGarantiaMobile();

    }


    if(input){

        input.value =
            "";

        input.focus();

    }


    establecerBusquedaEnProcesoMobile(
        false
    );


    renderizarEstadoInicialGarantiasMobile();

}

// =====================================================
// PRODUCTOS DEL MODAL
// =====================================================

function construirProductosModalGarantiaMobile(
    productos = []
){

    if(
        !Array.isArray(productos) ||
        productos.length === 0
    ){

        return `
            <div class="mobile-garantias-modal-empty">
                No hay productos registrados.
            </div>
        `;

    }


    return productos
        .map(
            function(producto){

                const nombre =
                    producto.nombreBoleta ||
                    producto.producto ||
                    "Producto sin nombre";


                const cantidad =
                    Number(
                        producto.cantidad || 0
                    );


                return `
                    <article
                        class="mobile-garantias-modal-product"
                    >

                        <div>

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    nombre
                                )}
                            </strong>

                            ${
                                producto.codigo
                                    ? `
                                        <small>
                                            Código:
                                            ${escaparHTMLGarantiasMobile(
                                                producto.codigo
                                            )}
                                        </small>
                                    `
                                    : ""
                            }

                        </div>

                        <span>
                            x${cantidad}
                        </span>

                    </article>
                `;

            }
        )
        .join("");

}

// =====================================================
// CONSTRUCCIÓN DEL MODAL
// =====================================================

function construirOpcionEstadoGarantiaMobile(
    valor,
    titulo,
    descripcion,
    estadoActual
){

    const seleccionado =
        valor === estadoActual;


    const presentacion =
        obtenerPresentacionEstadoGarantiaMobile(
            valor
        );


    return `
        <label
            class="
                mobile-garantias-state-option
                ${presentacion.clase}
                ${seleccionado
                    ? "is-selected"
                    : ""}
            "
        >

            <input
                type="radio"
                name="mobile-garantias-estado"
                value="${escaparHTMLGarantiasMobile(
                    valor
                )}"
                ${seleccionado
                    ? "checked"
                    : ""}
            >

            <span
                class="mobile-garantias-state-option-icon"
                aria-hidden="true"
            >
                ${presentacion.icono}
            </span>

            <span
                class="mobile-garantias-state-option-content"
            >

                <strong>
                    ${escaparHTMLGarantiasMobile(
                        titulo
                    )}
                </strong>

                <small>
                    ${escaparHTMLGarantiasMobile(
                        descripcion
                    )}
                </small>

            </span>

        </label>
    `;

}

function construirModalGarantiaMobile(
    garantia
){

    const productosHTML =
        construirProductosModalGarantiaMobile(
            garantia.productos
        );


    const estadoActual =
        garantia.estadoGarantia ||
        "Pendiente";


    const observacionActual =
        garantia.observacionGarantia ||
        "";


    return `
        <div
            id="mobile-garantias-modal"
            class="mobile-garantias-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-garantias-modal-title"
        >

            <button
                type="button"
                class="mobile-garantias-modal-backdrop"
                data-action="cerrar-modal-garantia"
                aria-label="Cerrar garantía"
            ></button>

            <section
                class="mobile-garantias-modal-sheet"
            >

                <header
                    class="mobile-garantias-modal-header"
                >

                    <div>

                        <small>
                            GESTIÓN DE GARANTÍA
                        </small>

                        <h2
                            id="mobile-garantias-modal-title"
                        >
                            ${escaparHTMLGarantiasMobile(
                                garantia.numeroBoleta
                            )}
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="mobile-garantias-modal-close"
                        data-action="cerrar-modal-garantia"
                        aria-label="Cerrar"
                    >
                        ×
                    </button>

                </header>

                <div
                    class="mobile-garantias-modal-body"
                >

                    <section
                        class="mobile-garantias-modal-client"
                    >

                        <div>

                            <small>
                                Cliente
                            </small>

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    garantia.clienteNombre
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                DNI
                            </small>

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    garantia.clienteDni ||
                                    "Sin DNI"
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Fecha de venta
                            </small>

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    garantia.fecha ||
                                    "Sin fecha"
                                )}
                            </strong>

                        </div>

                        <div>

                            <small>
                                Tienda
                            </small>

                            <strong>
                                ${escaparHTMLGarantiasMobile(
                                    garantia.tiendaVentaNombre
                                )}
                            </strong>

                        </div>

                    </section>

                    <section
                        class="mobile-garantias-modal-section"
                    >

                        <header>

                            <small>
                                PRODUCTOS DE LA VENTA
                            </small>

                        </header>

                        <div
                            class="mobile-garantias-modal-products"
                        >
                            ${productosHTML}
                        </div>

                    </section>

                    <section
                        class="mobile-garantias-modal-section"
                    >

                        <header>

                            <small>
                                ESTADO DE LA GARANTÍA
                            </small>

                        </header>

                        <div
                            class="mobile-garantias-state-options"
                            role="radiogroup"
                            aria-label="Estado de la garantía"
                        >

                            ${construirOpcionEstadoGarantiaMobile(
                                "Pendiente",
                                "Pendiente",
                                "La garantía continúa en revisión.",
                                estadoActual
                            )}

                            ${construirOpcionEstadoGarantiaMobile(
                                "Observación",
                                "Observación",
                                "Registrar diagnóstico o seguimiento.",
                                estadoActual
                            )}

                            ${construirOpcionEstadoGarantiaMobile(
                                "Aprobada",
                                "Aprobada",
                                "Aceptar formalmente la garantía.",
                                estadoActual
                            )}

                            ${construirOpcionEstadoGarantiaMobile(
                                "Rechazada",
                                "Rechazada",
                                "Rechazar indicando el motivo.",
                                estadoActual
                            )}

                        </div>

                    </section>

                    <section
                        class="mobile-garantias-modal-section"
                    >

                        <label
                            for="mobile-garantias-modal-observacion"
                        >
                            Diagnóstico u observación
                        </label>

                        <textarea
                            id="mobile-garantias-modal-observacion"
                            rows="5"
                            maxlength="500"
                            placeholder="Describe la revisión realizada, diagnóstico o motivo de la decisión..."
                        >${escaparHTMLGarantiasMobile(
                            observacionActual
                        )}</textarea>

                        <div
                            class="mobile-garantias-modal-helper"
                        >

                            <small>
                                La observación quedará registrada
                                en la boleta.
                            </small>

                            <small
                                id="mobile-garantias-modal-counter"
                            >
                                ${observacionActual.length}/500
                            </small>

                        </div>

                    </section>

                    <p
                        id="mobile-garantias-modal-status"
                        class="mobile-garantias-modal-status"
                        data-tipo="neutral"
                        aria-live="polite"
                    ></p>

                </div>

                <footer
                    class="mobile-garantias-modal-footer"
                >

                    <button
                        type="button"
                        class="mobile-garantias-modal-cancel"
                        data-action="cerrar-modal-garantia"
                    >
                        Cancelar
                    </button>

                    <button
                        id="mobile-garantias-modal-save"
                        type="button"
                        class="mobile-garantias-modal-save"
                        data-action="guardar-garantia"
                    >
                        Guardar cambios
                    </button>

                </footer>

            </section>

        </div>
    `;

}

// =====================================================
// ABRIR GARANTÍA
// =====================================================

function abrirGarantiaMobile(
    boletaId
){

    const garantia =
        garantiasEncontradasMobile.find(
            function(item){

                return (
                    item.id ===
                    boletaId
                );

            }
        );


    if(!garantia){

        renderizarErrorGarantiasMobile(
            "No se encontró la garantía seleccionada."
        );

        return;

    }


    const modalRoot =
        obtenerModalRootGarantiasMobile();


    if(!modalRoot){

        console.error(
            "No existe el contenedor del modal de garantías."
        );

        return;

    }


    garantiaSeleccionadaMobile =
        garantia;


    estadoGarantiaSeleccionadoMobile =
        garantia.estadoGarantia ||
        "Pendiente";


    modalRoot.innerHTML =
        construirModalGarantiaMobile(
            garantia
        );


    modalGarantiaMobileAbierto =
        true;


    document.body.classList.add(
        "mobile-garantias-modal-open"
    );


    const modal =
        obtenerModalGarantiasMobile();


    modal?.addEventListener(
        "click",
        manejarClickModalGarantiasMobile
    );


    modal?.addEventListener(
        "change",
        manejarCambioModalGarantiasMobile
    );


    modal?.addEventListener(
        "input",
        manejarInputModalGarantiasMobile
    );


    setTimeout(
        function(){

            obtenerObservacionGarantiaMobile()
                ?.focus();

        },
        80
    );

}

function cerrarModalGarantiaMobile(){

    if(
        guardadoGarantiaMobileEnProceso
    ){

    return;

    }

    const modal =
        obtenerModalGarantiasMobile();


    modal?.removeEventListener(
        "click",
        manejarClickModalGarantiasMobile
    );


    modal?.removeEventListener(
        "change",
        manejarCambioModalGarantiasMobile
    );


    modal?.removeEventListener(
        "input",
        manejarInputModalGarantiasMobile
    );


    const modalRoot =
        obtenerModalRootGarantiasMobile();


    if(modalRoot){

        modalRoot.innerHTML =
            "";

    }


    document.body.classList.remove(
        "mobile-garantias-modal-open"
    );


    garantiaSeleccionadaMobile =
        null;


    estadoGarantiaSeleccionadoMobile =
        "Pendiente";


    modalGarantiaMobileAbierto =
        false;

}

function manejarClickModalGarantiasMobile(
    evento
){

    if(
       guardadoGarantiaMobileEnProceso
    ){

       return;

    }

    const accion =
        evento.target.closest(
            "[data-action]"
        )?.dataset.action;


    if(
        accion ===
        "cerrar-modal-garantia"
    ){

        cerrarModalGarantiaMobile();

        return;

    }


    if(
        accion ===
        "guardar-garantia"
    ){

        prepararGuardadoGarantiaMobile();

    }

}


function manejarCambioModalGarantiasMobile(
    evento
){

    const inputEstado =
        evento.target.closest(
            'input[name="mobile-garantias-estado"]'
        );


    if(!inputEstado){

        return;

    }


    estadoGarantiaSeleccionadoMobile =
        inputEstado.value;


    const opciones =
        obtenerModalGarantiasMobile()
            ?.querySelectorAll(
                ".mobile-garantias-state-option"
            ) ||
        [];


    opciones.forEach(
        function(opcion){

            const radio =
                opcion.querySelector(
                    'input[name="mobile-garantias-estado"]'
                );


            opcion.classList.toggle(
                "is-selected",
                radio?.checked === true
            );

        }
    );

}


function manejarInputModalGarantiasMobile(
    evento
){

    if(
        evento.target.id !==
        "mobile-garantias-modal-observacion"
    ){

        return;

    }


    const contador =
        document.getElementById(
            "mobile-garantias-modal-counter"
        );


    if(contador){

        contador.textContent =
            `${evento.target.value.length}/500`;

    }

}

function obtenerDatosAdministradorGarantiaMobile(
    administrador = {}
){

    const nombre =
        String(

            administrador.nombreCompleto ||

            administrador.nombre ||

            administrador.usuario ||

            "Administrador"

        )
            .trim();


    const usuario =
        String(

            administrador.usuario ||

            administrador.email ||

            ""

        )
            .trim();


    return {

        nombre,

        usuario

    };

}

async function solicitarAutorizacionGarantiaMobile(
    estado,
    observacion
){

    const garantia =
        garantiaSeleccionadaMobile;


    if(!garantia){

        return {

            autorizado:
                false,

            cancelado:
                false,

            administrador:
                null,

            mensaje:
                "No se encontró la garantía seleccionada."

        };

    }


    const esAprobacion =
        estado ===
        "Aprobada";


    const accion =
        esAprobacion
            ? "Aprobar garantía"
            : "Rechazar garantía";


    const resultado =
        await solicitarAutorizacionAdminMobile({

            titulo:
                esAprobacion
                    ? "Autorizar aprobación"
                    : "Autorizar rechazo",

            descripcion:
                esAprobacion
                    ? "Confirma que la garantía cumple las condiciones para ser aprobada."
                    : "Confirma que la garantía debe ser rechazada.",

            accion:
                `${accion} · ${garantia.numeroBoleta}`,

            solicitarMotivo:
                false,

            motivoObligatorio:
                false,

            textoConfirmar:
                esAprobacion
                    ? "Autorizar aprobación"
                    : "Autorizar rechazo"

        });


    if(
        !resultado.autorizado
    ){

        return resultado;

    }


    const administrador =
        obtenerDatosAdministradorGarantiaMobile(
            resultado.administrador
        );


    if(
        !administrador.nombre ||
        !administrador.usuario
    ){

        return {

            autorizado:
                false,

            cancelado:
                false,

            administrador:
                null,

            mensaje:
                "No se pudo identificar correctamente al administrador."

        };

    }


    return {

        autorizado:
            true,

        cancelado:
            false,

        administrador,

        observacion

    };

}

async function prepararGuardadoGarantiaMobile(){

    if(
        guardadoGarantiaMobileEnProceso ||
        estaOperacionGarantiaMobileEnProceso()
    ){

        return;

    }


    if(!garantiaSeleccionadaMobile){

        establecerEstadoModalGarantiaMobile(
            "No se encontró la garantía seleccionada.",
            "error"
        );

        return;

    }


    const textarea =
        obtenerObservacionGarantiaMobile();


    const observacion =
        String(
            textarea?.value ||
            ""
        )
            .trim();


    const estado =
        estadoGarantiaSeleccionadoMobile ||
        "Pendiente";


    if(
        estado === "Observación" &&
        observacion.length < 3
    ){

        establecerEstadoModalGarantiaMobile(
            "Describe la observación o diagnóstico realizado.",
            "warning"
        );


        textarea?.focus();

        return;

    }


    if(
        (
            estado === "Aprobada" ||
            estado === "Rechazada"
        ) &&
        observacion.length < 3
    ){

        establecerEstadoModalGarantiaMobile(
            "Describe el diagnóstico o motivo de la resolución.",
            "warning"
        );


        textarea?.focus();

        return;

    }


    let autorizado =
        false;

    let autorizadoPor =
        "";

    let autorizadoPorUsuario =
        "";


    if(
        estado === "Aprobada" ||
        estado === "Rechazada"
    ){

        establecerEstadoModalGarantiaMobile(
            "Esperando autorización administrativa...",
            "loading"
        );


        const autorizacion =
            await solicitarAutorizacionGarantiaMobile(
                estado,
                observacion
            );


        if(
            !autorizacion.autorizado
        ){

            if(
                autorizacion.cancelado
            ){

                establecerEstadoModalGarantiaMobile(
                    "Autorización cancelada.",
                    "warning"
                );

            }else{

                establecerEstadoModalGarantiaMobile(
                    autorizacion.mensaje ||
                    "No se concedió la autorización administrativa.",
                    "error"
                );

            }


            return;

        }


        autorizado =
            true;


        autorizadoPor =
            autorizacion.administrador.nombre;


        autorizadoPorUsuario =
            autorizacion.administrador.usuario;

    }


    establecerGuardadoGarantiaEnProcesoMobile(
        true
    );


    establecerEstadoModalGarantiaMobile(
        autorizado
            ? "Autorización confirmada. Guardando resolución..."
            : "Guardando cambios en la garantía...",
        "loading"
    );


    try{

        const resultado =
            await actualizarGarantiaMobile({

                boletaId:
                    garantiaSeleccionadaMobile.id,

                estadoGarantia:
                    estado,

                observacionGarantia:
                    observacion,

                autorizado,

                autorizadoPor,

                autorizadoPorUsuario

            });


        if(
            !resultado.completada
        ){

            establecerEstadoModalGarantiaMobile(
                resultado.mensaje ||
                "No se pudo actualizar la garantía.",
                "error"
            );

            return;

        }


        actualizarGarantiaEncontradaMobile(
            resultado.garantia
        );


        establecerEstadoModalGarantiaMobile(
            estado === "Aprobada"
                ? "Garantía aprobada correctamente."
                : estado === "Rechazada"
                    ? "Garantía rechazada correctamente."
                    : resultado.mensaje ||
                      "Garantía actualizada correctamente.",
            "success"
        );


        if(
            navigator.vibrate
        ){

            navigator.vibrate(
                estado === "Rechazada"
                    ? [50, 40, 50]
                    : [40, 35, 80]
            );

        }


        setTimeout(
            function(){

                if(
                    modalGarantiaMobileAbierto
                ){

                    cerrarModalGarantiaMobile();

                }

            },
            850
        );

    }catch(error){

        console.error(
            "Error guardando garantía Mobile:",
            error
        );


        establecerEstadoModalGarantiaMobile(
            error?.message ||
            "Ocurrió un error guardando la garantía.",
            "error"
        );

    }finally{

        establecerGuardadoGarantiaEnProcesoMobile(
            false
        );

    }

}


// =====================================================
// EVENTOS
// =====================================================

function manejarClickGarantiasMobile(
    evento
){

    const botonAbrir =
        evento.target.closest(
            '[data-action="abrir-garantia"]'
        );


    if(botonAbrir){

        abrirGarantiaMobile(
            botonAbrir.dataset.boletaId
        );

    }

}


function manejarTecladoGarantiasMobile(
    evento
){

    if(
        evento.key ===
        "Enter"
    ){

        evento.preventDefault();

        ejecutarBusquedaGarantiasMobile();

    }


    if(
    evento.key ===
    "Escape"
){

    evento.preventDefault();


    if(
        modalGarantiaMobileAbierto
    ){

        cerrarModalGarantiaMobile();

        return;

    }


    limpiarBusquedaGarantiasMobile();

    }

}

// =====================================================
// RENDER PRINCIPAL
// =====================================================

async function renderGarantiasMobile(
    contexto
){

    const {

        contenedor

    } = contexto;


    if(!contenedor){

        console.error(
            "No se recibió el contenedor de Garantías Mobile."
        );

        return;

    }


    /*
     * Al regresar a esta ruta, el router vuelve
     * a construir el contenido. Por eso eliminamos
     * primero los eventos anteriores.
     */
    destruirGarantiasMobile();


    contenedor.innerHTML =
        construirVistaGarantiasMobile();


    inicializarGarantiasMobile();

}


// =====================================================
// INICIALIZACIÓN
// =====================================================

function inicializarGarantiasMobile(){

    const vista =
        obtenerVistaGarantiasMobile();


    if(!vista){

        return false;

    }


    if(
        vistaGarantiasMobileInicializada
    ){

        return true;

    }


    const input =
        obtenerInputGarantiasMobile();

    const botonBuscar =
        obtenerBotonBuscarGarantiasMobile();

    const botonLimpiar =
        obtenerBotonLimpiarGarantiasMobile();

    const resultados =
        obtenerResultadosGarantiasMobile();


    if(
        !input ||
        !botonBuscar ||
        !botonLimpiar ||
        !resultados
    ){

        console.error(
            "La vista de Garantías Mobile está incompleta."
        );

        return false;

    }


    botonBuscar.addEventListener(
        "click",
        ejecutarBusquedaGarantiasMobile
    );


    botonLimpiar.addEventListener(
        "click",
        limpiarBusquedaGarantiasMobile
    );


    input.addEventListener(
        "keydown",
        manejarTecladoGarantiasMobile
    );


    resultados.addEventListener(
        "click",
        manejarClickGarantiasMobile
    );


    vistaGarantiasMobileInicializada =
        true;


    renderizarEstadoInicialGarantiasMobile();


    return true;

}


// =====================================================
// DESTRUCCIÓN
// =====================================================

function destruirGarantiasMobile(){

        detenerRealtimeVistaGarantiasMobile();

    const input =
        obtenerInputGarantiasMobile();

    const botonBuscar =
        obtenerBotonBuscarGarantiasMobile();

    const botonLimpiar =
        obtenerBotonLimpiarGarantiasMobile();

    const resultados =
        obtenerResultadosGarantiasMobile();


    botonBuscar?.removeEventListener(
        "click",
        ejecutarBusquedaGarantiasMobile
    );


    botonLimpiar?.removeEventListener(
        "click",
        limpiarBusquedaGarantiasMobile
    );


    input?.removeEventListener(
        "keydown",
        manejarTecladoGarantiasMobile
    );


    resultados?.removeEventListener(
        "click",
        manejarClickGarantiasMobile
    );

    cerrarModalGarantiaMobile();

    cerrarAutorizacionAdminMobile();


    vistaGarantiasMobileInicializada =
        false;


    garantiasEncontradasMobile =
        [];


    textoBusquedaGarantiaMobile =
        "";

    garantiaSeleccionadaMobile =
        null;

    estadoGarantiaSeleccionadoMobile =
        "Pendiente";

    modalGarantiaMobileAbierto =
        false;

    guardadoGarantiaMobileEnProceso =
        false;

    cancelarSuscripcionVistaGarantiasMobile =
        null;

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    construirVistaGarantiasMobile,

    renderGarantiasMobile,

    escaparHTMLGarantiasMobile,

    formatearMontoGarantiaMobile,

    obtenerPresentacionEstadoGarantiaMobile,

    construirProductosGarantiaMobile,

    construirCardGarantiaMobile,

    construirProductosModalGarantiaMobile,

    construirOpcionEstadoGarantiaMobile,

    construirModalGarantiaMobile,

    cerrarModalGarantiaMobile,

    obtenerDatosAdministradorGarantiaMobile,

    solicitarAutorizacionGarantiaMobile,

    prepararGuardadoGarantiaMobile,

    renderizarEstadoInicialGarantiasMobile,

    renderizarCargandoGarantiasMobile,

    renderizarSinResultadosGarantiasMobile,

    renderizarErrorGarantiasMobile,

    renderizarResultadosGarantiasMobile,

    ejecutarBusquedaGarantiasMobile,

    limpiarBusquedaGarantiasMobile,

    abrirGarantiaMobile,

    inicializarGarantiasMobile,

    destruirGarantiasMobile

};