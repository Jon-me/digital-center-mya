// =====================================================
// DIGITAL CENTER M&A
// MOBILE CAJA VIEW
// FASE M7.3.3
// CAJA DASHBOARD REALTIME
// =====================================================

import {

    iniciarRealtimeCajaMobile,

    detenerRealtimeCajaMobile,

    suscribirseCajaMobile,

    establecerTiendaCajaMobile,

    obtenerNombreTiendaCajaMobile,

    obtenerTiendaCajaMobile,

    abrirCajaMobile,

    registrarGastoCajaMobile,

    anularGastoCajaMobile,

    obtenerGastosCajaMobile,

    estaOperacionCajaMobileEnProceso

} from "../services/caja-mobile-service.js";


import {

    obtenerTiendaVentaMobile

} from "../state-mobile.js";


// =====================================================
// ESTADO DE VISTA
// =====================================================

let renderizada =
    false;


let cancelarSuscripcionCajaMobile =
    null;


let contenedorCajaMobile =
    null;

let portalAperturaCajaMobile =
    null;


let aperturaCajaVistaEnProceso =
    false;

let portalGastoCajaMobile =
    null;

let gastoCajaVistaEnProceso =
    false;

let portalAnulacionGastoCajaMobile =
    null;


let gastoSeleccionadoAnulacionMobile =
    null;


let anulacionGastoVistaEnProceso =
    false;

// =====================================================
// UTILIDADES
// =====================================================

function formatearMonedaCajaMobile(
    valor
){

    const numero =
        Number(
            valor || 0
        );


    return new Intl.NumberFormat(
        "es-PE",
        {
            style:
                "currency",

            currency:
                "PEN",

            minimumFractionDigits:
                2
        }
    ).format(
        Number.isFinite(numero)
            ? numero
            : 0
    );

}


function escaparHTMLCajaMobile(
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
// APERTURA DE CAJA
// =====================================================

function construirFormularioAperturaCajaMobile(){

    const tienda =
        obtenerTiendaCajaMobile();


    const nombreTienda =
        obtenerNombreTiendaCajaMobile(
            tienda
        );


    return `
        <div
            class="mobile-caja-modal-backdrop"
            data-caja-open-backdrop
        >

            <section
                class="mobile-caja-open-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileCajaOpenTitle"
            >

                <div class="mobile-caja-open-handle"></div>


                <header class="mobile-caja-open-header">

                    <div>

                        <span>
                            APERTURA DE CAJA
                        </span>

                        <h2 id="mobileCajaOpenTitle">
                            Iniciar jornada
                        </h2>

                        <p>
                            Registra el efectivo disponible
                            al comenzar las operaciones.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="mobile-caja-open-close"
                        data-caja-open-close
                        aria-label="Cerrar apertura de caja"
                    >
                        ×
                    </button>

                </header>


                <div class="mobile-caja-open-store">

                    <span
                        class="mobile-caja-open-store-icon"
                        aria-hidden="true"
                    >
                        ${
                            tienda === "sucursal"
                                ? "✂️"
                                : "🏪"
                        }
                    </span>

                    <div>

                        <span>
                            TIENDA SELECCIONADA
                        </span>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                nombreTienda
                            )}
                        </strong>

                    </div>

                </div>


                <label class="mobile-caja-open-field">

                    <span>
                        Monto inicial
                    </span>

                    <div class="mobile-caja-open-input-wrap">

                        <span aria-hidden="true">
                            S/
                        </span>

                        <input
                            type="number"
                            inputmode="decimal"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            autocomplete="off"
                            data-caja-open-amount
                        >

                    </div>

                    <small>
                        Ingresa el dinero físico disponible
                        dentro de la caja.
                    </small>

                </label>


                <div class="mobile-caja-open-quick">

                    <button
                        type="button"
                        data-caja-open-quick="50"
                    >
                        S/ 50
                    </button>

                    <button
                        type="button"
                        data-caja-open-quick="100"
                    >
                        S/ 100
                    </button>

                    <button
                        type="button"
                        data-caja-open-quick="150"
                    >
                        S/ 150
                    </button>

                    <button
                        type="button"
                        data-caja-open-quick="200"
                    >
                        S/ 200
                    </button>

                </div>


                <div
                    class="mobile-caja-open-message"
                    data-caja-open-message
                    aria-live="polite"
                ></div>


                <div class="mobile-caja-open-actions">

                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-secondary
                        "
                        data-caja-open-cancel
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-primary
                            mobile-caja-open-confirm
                        "
                        data-caja-open-confirm
                    >
                        <span data-caja-open-confirm-text>
                            Abrir caja
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                </div>

            </section>

        </div>
    `;

}

function abrirFormularioAperturaCajaMobile(){

    if(
        portalAperturaCajaMobile ||
        aperturaCajaVistaEnProceso
    ){

        return;

    }


    const contenedorPortal =
        document.createElement(
            "div"
        );


    contenedorPortal.innerHTML =
        construirFormularioAperturaCajaMobile();


    portalAperturaCajaMobile =
        contenedorPortal.firstElementChild;


    if(
        !portalAperturaCajaMobile
    ){

        return;

    }


    document.body.appendChild(
        portalAperturaCajaMobile
    );


    document.body.classList.add(
        "mobile-caja-modal-open"
    );


    inicializarEventosAperturaCajaMobile();


    requestAnimationFrame(
        function(){

            portalAperturaCajaMobile
                ?.classList
                .add(
                    "is-visible"
                );


            const input =
                portalAperturaCajaMobile
                    ?.querySelector(
                        "[data-caja-open-amount]"
                    );


            input?.focus();

        }
    );

}


function cerrarFormularioAperturaCajaMobile(){

    if(
        !portalAperturaCajaMobile ||
        aperturaCajaVistaEnProceso
    ){

        return;

    }


    const portal =
        portalAperturaCajaMobile;


    portal.classList.remove(
        "is-visible"
    );


    portalAperturaCajaMobile =
        null;


    document.body.classList.remove(
        "mobile-caja-modal-open"
    );


    window.setTimeout(
        function(){

            portal.remove();

        },
        180
    );

}

function mostrarMensajeAperturaCajaMobile(
    mensaje,
    tipo =
        "error"
){

    const elemento =
        portalAperturaCajaMobile
            ?.querySelector(
                "[data-caja-open-message]"
            );


    if(
        !elemento
    ){

        return;

    }


    elemento.textContent =
        String(
            mensaje || ""
        );


    elemento.className =
        "mobile-caja-open-message";


    if(
        mensaje
    ){

        elemento.classList.add(
            `is-${tipo}`
        );

    }

}


function establecerLoadingAperturaCajaMobile(
    activo
){

    aperturaCajaVistaEnProceso =
        Boolean(
            activo
        );


    if(
        !portalAperturaCajaMobile
    ){

        return;

    }


    const boton =
        portalAperturaCajaMobile
            .querySelector(
                "[data-caja-open-confirm]"
            );


    const texto =
        portalAperturaCajaMobile
            .querySelector(
                "[data-caja-open-confirm-text]"
            );


    const controles =
        portalAperturaCajaMobile
            .querySelectorAll(
                "button, input"
            );


    controles.forEach(
        function(control){

            control.disabled =
                aperturaCajaVistaEnProceso;

        }
    );


const sheet =
    portalAperturaCajaMobile
        .querySelector(
            ".mobile-caja-open-sheet"
        );


sheet?.setAttribute(
    "aria-busy",
    aperturaCajaVistaEnProceso
        ? "true"
        : "false"
);


    if(
        boton
    ){

        boton.classList.toggle(
            "is-loading",
            aperturaCajaVistaEnProceso
        );

    }


    if(
        texto
    ){

        texto.textContent =
            aperturaCajaVistaEnProceso
                ? "Abriendo caja..."
                : "Abrir caja";

    }

}

async function confirmarAperturaCajaMobile(){

    if(
        aperturaCajaVistaEnProceso ||
        estaOperacionCajaMobileEnProceso()
    ){

        return;

    }


    let aperturaCompletada =
        false;


    const input =
        portalAperturaCajaMobile
            ?.querySelector(
                "[data-caja-open-amount]"
            );


    const montoInicial =
        Number(
            input?.value || 0
        );


    if(
        !Number.isFinite(
            montoInicial
        ) ||
        montoInicial <= 0
    ){

        mostrarMensajeAperturaCajaMobile(
            "Ingresa un monto inicial mayor que cero."
        );


        input?.focus();

        return;

    }


    mostrarMensajeAperturaCajaMobile(
        ""
    );


    establecerLoadingAperturaCajaMobile(
        true
    );


    try{

        const resultado =
            await abrirCajaMobile({

                montoInicial,

                sucursalId:
                    obtenerTiendaCajaMobile()

            });


        if(
            !resultado?.completada
        ){

            mostrarMensajeAperturaCajaMobile(
                resultado?.mensaje ||
                "No se pudo abrir la caja."
            );


            return;

        }


        aperturaCompletada =
            true;


        mostrarMensajeAperturaCajaMobile(
            resultado.mensaje,
            "success"
        );


        window.setTimeout(
            function(){

                aperturaCajaVistaEnProceso =
                    false;


                cerrarFormularioAperturaCajaMobile();

            },
            650
        );

    }catch(error){

        console.error(
            "Error confirmando apertura de caja:",
            error
        );


        mostrarMensajeAperturaCajaMobile(
            error?.message ||
            "No se pudo abrir la caja."
        );

    }finally{

        if(
            portalAperturaCajaMobile &&
            !aperturaCompletada
        ){

            establecerLoadingAperturaCajaMobile(
                false
            );

        }

    }

}

function inicializarEventosAperturaCajaMobile(){

    if(
        !portalAperturaCajaMobile
    ){

        return;

    }


    portalAperturaCajaMobile.addEventListener(
        "click",
        function(evento){

            const botonRapido =
                evento.target.closest(
                    "[data-caja-open-quick]"
                );


            if(
                botonRapido &&
                !aperturaCajaVistaEnProceso
            ){

                const input =
                    portalAperturaCajaMobile
                        ?.querySelector(
                            "[data-caja-open-amount]"
                        );


                if(
                    input
                ){

                    input.value =
                        botonRapido.dataset
                            .cajaOpenQuick;


                    input.focus();

                }


                return;

            }


            if(
                evento.target.closest(
                    "[data-caja-open-confirm]"
                )
            ){

                confirmarAperturaCajaMobile();

                return;

            }


            if(
                evento.target.closest(
                    "[data-caja-open-close], [data-caja-open-cancel]"
                )
            ){

                cerrarFormularioAperturaCajaMobile();

                return;

            }


            if(
                evento.target.matches(
                    "[data-caja-open-backdrop]"
                )
            ){

                cerrarFormularioAperturaCajaMobile();

            }

        }
    );


    portalAperturaCajaMobile.addEventListener(
        "keydown",
        function(evento){

            if(
                evento.key === "Escape"
            ){

                cerrarFormularioAperturaCajaMobile();

                return;

            }


            if(
                evento.key === "Enter"
            ){

                confirmarAperturaCajaMobile();

            }

        }
    );

}

// =====================================================
// REGISTRO DE GASTO
// =====================================================

function construirFormularioGastoCajaMobile(){

    const tienda =
        obtenerTiendaCajaMobile();


    const nombreTienda =
        obtenerNombreTiendaCajaMobile(
            tienda
        );


    return `
        <div
            class="mobile-caja-modal-backdrop"
            data-caja-expense-backdrop
        >

            <section
                class="mobile-caja-expense-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileCajaExpenseTitle"
            >

                <div class="mobile-caja-open-handle"></div>


                <header class="mobile-caja-expense-header">

                    <div>

                        <span>
                            REGISTRO DE GASTO
                        </span>

                        <h2 id="mobileCajaExpenseTitle">
                            Nuevo movimiento
                        </h2>

                        <p>
                            Registra una salida de efectivo
                            correspondiente a la caja actual.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="mobile-caja-open-close"
                        data-caja-expense-close
                        aria-label="Cerrar registro de gasto"
                    >
                        ×
                    </button>

                </header>


                <div class="mobile-caja-open-store">

                    <span
                        class="mobile-caja-open-store-icon"
                        aria-hidden="true"
                    >
                        ${
                            tienda === "sucursal"
                                ? "✂️"
                                : "🏪"
                        }
                    </span>

                    <div>

                        <span>
                            CAJA SELECCIONADA
                        </span>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                nombreTienda
                            )}
                        </strong>

                    </div>

                </div>


                <label class="mobile-caja-expense-field">

                    <span>
                        Descripción
                    </span>

                    <input
                        type="text"
                        maxlength="80"
                        autocomplete="off"
                        placeholder="Ej. Compra de bolsas"
                        data-caja-expense-description
                    >

                    <small>
                        Describe brevemente el motivo del gasto.
                    </small>

                </label>


                <label class="mobile-caja-expense-field">

                    <span>
                        Monto
                    </span>

                    <div class="mobile-caja-open-input-wrap">

                        <span aria-hidden="true">
                            S/
                        </span>

                        <input
                            type="number"
                            inputmode="decimal"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            autocomplete="off"
                            data-caja-expense-amount
                        >

                    </div>

                </label>


                <div class="mobile-caja-expense-quick">

                    <button
                        type="button"
                        data-caja-expense-quick="5"
                        aria-pressed="false"
                    >
                        S/ 5
                    </button>

                    <button
                        type="button"
                        data-caja-expense-quick="10"
                        aria-pressed="false"
                    >
                        S/ 10
                    </button>

                    <button
                        type="button"
                        data-caja-expense-quick="20"
                        aria-pressed="false"
                    >
                        S/ 20
                    </button>

                    <button
                        type="button"
                        data-caja-expense-quick="50"
                        aria-pressed="false"
                    >
                        S/ 50
                    </button>

                </div>


                <div
                    class="mobile-caja-expense-message"
                    data-caja-expense-message
                    aria-live="polite"
                ></div>


                <div class="mobile-caja-open-actions">

                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-secondary
                        "
                        data-caja-expense-cancel
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-primary
                            mobile-caja-expense-confirm
                        "
                        data-caja-expense-confirm
                    >
                        <span data-caja-expense-confirm-text>
                            Registrar gasto
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                </div>

            </section>

        </div>
    `;

}

function abrirFormularioGastoCajaMobile(){

    if(
        portalGastoCajaMobile ||
        gastoCajaVistaEnProceso
    ){

        return;

    }


    const contenedorPortal =
        document.createElement(
            "div"
        );


    contenedorPortal.innerHTML =
        construirFormularioGastoCajaMobile();


    portalGastoCajaMobile =
        contenedorPortal.firstElementChild;


    if(
        !portalGastoCajaMobile
    ){

        return;

    }


    document.body.appendChild(
        portalGastoCajaMobile
    );


    document.body.classList.add(
        "mobile-caja-modal-open"
    );


    inicializarEventosGastoCajaMobile();


    requestAnimationFrame(
        function(){

            portalGastoCajaMobile
                ?.classList
                .add(
                    "is-visible"
                );


            portalGastoCajaMobile
                ?.querySelector(
                    "[data-caja-expense-description]"
                )
                ?.focus();

        }
    );

}


function cerrarFormularioGastoCajaMobile(){

    if(
        !portalGastoCajaMobile ||
        gastoCajaVistaEnProceso
    ){

        return;

    }


    const portal =
        portalGastoCajaMobile;


    portal.classList.remove(
        "is-visible"
    );


    portalGastoCajaMobile =
        null;


    document.body.classList.remove(
        "mobile-caja-modal-open"
    );


    window.setTimeout(
        function(){

            portal.remove();

        },
        180
    );

}

function mostrarMensajeGastoCajaMobile(
    mensaje,
    tipo =
        "error"
){

    const elemento =
        portalGastoCajaMobile
            ?.querySelector(
                "[data-caja-expense-message]"
            );


    if(
        !elemento
    ){

        return;

    }


    elemento.textContent =
        String(
            mensaje || ""
        );


    elemento.className =
        "mobile-caja-expense-message";


    if(
        mensaje
    ){

        elemento.classList.add(
            `is-${tipo}`
        );

    }

}


function establecerLoadingGastoCajaMobile(
    activo
){

    gastoCajaVistaEnProceso =
        Boolean(
            activo
        );


    if(
        !portalGastoCajaMobile
    ){

        return;

    }


    const sheet =
        portalGastoCajaMobile
            .querySelector(
                ".mobile-caja-expense-sheet"
            );


    const boton =
        portalGastoCajaMobile
            .querySelector(
                "[data-caja-expense-confirm]"
            );


    const texto =
        portalGastoCajaMobile
            .querySelector(
                "[data-caja-expense-confirm-text]"
            );


    portalGastoCajaMobile
        .querySelectorAll(
            "button, input"
        )
        .forEach(
            function(control){

                control.disabled =
                    gastoCajaVistaEnProceso;

            }
        );


    sheet?.setAttribute(
        "aria-busy",
        gastoCajaVistaEnProceso
            ? "true"
            : "false"
    );


    boton?.classList.toggle(
        "is-loading",
        gastoCajaVistaEnProceso
    );


    if(
        texto
    ){

        texto.textContent =
            gastoCajaVistaEnProceso
                ? "Registrando..."
                : "Registrar gasto";

    }

}

async function confirmarGastoCajaMobile(){

    if(
        gastoCajaVistaEnProceso ||
        estaOperacionCajaMobileEnProceso()
    ){

        return;

    }


    let gastoCompletado =
        false;


    const inputDescripcion =
        portalGastoCajaMobile
            ?.querySelector(
                "[data-caja-expense-description]"
            );


    const inputMonto =
        portalGastoCajaMobile
            ?.querySelector(
                "[data-caja-expense-amount]"
            );


    const descripcion =
        String(
            inputDescripcion?.value ||
            ""
        )
            .trim();


    const monto =
        Number(
            inputMonto?.value || 0
        );


    if(
        descripcion.length < 3
    ){

        mostrarMensajeGastoCajaMobile(
            "Ingresa una descripción válida."
        );


        inputDescripcion?.focus();

        return;

    }


    if(
        !Number.isFinite(
            monto
        ) ||
        monto <= 0
    ){

        mostrarMensajeGastoCajaMobile(
            "Ingresa un monto mayor que cero."
        );


        inputMonto?.focus();

        return;

    }


    mostrarMensajeGastoCajaMobile(
        ""
    );


    establecerLoadingGastoCajaMobile(
        true
    );


    try{

        const resultado =
            await registrarGastoCajaMobile({

                descripcion,

                monto,

                sucursalId:
                    obtenerTiendaCajaMobile()

            });


        if(
            !resultado?.completada
        ){

            mostrarMensajeGastoCajaMobile(
                resultado?.mensaje ||
                "No se pudo registrar el gasto."
            );


            return;

        }


        gastoCompletado =
            true;


        mostrarMensajeGastoCajaMobile(
            resultado.mensaje,
            "success"
        );


        window.setTimeout(
            function(){

                gastoCajaVistaEnProceso =
                    false;


                cerrarFormularioGastoCajaMobile();

            },
            650
        );

    }catch(error){

        console.error(
            "Error confirmando gasto Mobile:",
            error
        );


        mostrarMensajeGastoCajaMobile(
            error?.message ||
            "No se pudo registrar el gasto."
        );

    }finally{

        if(
            portalGastoCajaMobile &&
            !gastoCompletado
        ){

            establecerLoadingGastoCajaMobile(
                false
            );

        }

    }

}

function inicializarEventosGastoCajaMobile(){

    if(
        !portalGastoCajaMobile
    ){

        return;

    }


    portalGastoCajaMobile.addEventListener(
        "click",
        function(evento){

            const botonRapido =
                evento.target.closest(
                    "[data-caja-expense-quick]"
                );


           if(
    botonRapido &&
    !gastoCajaVistaEnProceso
){

    const inputMonto =
        portalGastoCajaMobile
            ?.querySelector(
                "[data-caja-expense-amount]"
            );


    portalGastoCajaMobile
        ?.querySelectorAll(
            "[data-caja-expense-quick]"
        )
        .forEach(
            function(boton){

                const seleccionado =
                    boton ===
                    botonRapido;


                boton.classList.toggle(
                    "is-selected",
                    seleccionado
                );


                boton.setAttribute(
                    "aria-pressed",
                    seleccionado
                        ? "true"
                        : "false"
                );

            }
        );


    if(
        inputMonto
    ){

        inputMonto.value =
            botonRapido.dataset
                .cajaExpenseQuick;


        inputMonto.focus();

    }


    return;

}

if(
    evento.target.closest(
        "[data-caja-expense-confirm]"
    )
){

    confirmarGastoCajaMobile();

    return;

}


            if(
                evento.target.closest(
                    "[data-caja-expense-close], [data-caja-expense-cancel]"
                )
            ){

                cerrarFormularioGastoCajaMobile();

                return;

            }


            if(
                evento.target.matches(
                    "[data-caja-expense-backdrop]"
                )
            ){

                cerrarFormularioGastoCajaMobile();

            }

        }
    );


    portalGastoCajaMobile.addEventListener(
        "keydown",
        function(evento){

            if(
                evento.key === "Escape"
            ){

                cerrarFormularioGastoCajaMobile();

                return;

            }


            if(
                evento.key === "Enter"
            ){

                confirmarGastoCajaMobile();

            }

        }
    );

}

// =====================================================
// ANULACIÓN DE GASTO
// =====================================================

function construirFormularioAnulacionGastoCajaMobile(
    gasto
){

    const descripcion =
        escaparHTMLCajaMobile(
            gasto?.descripcion ||
            "Gasto"
        );


    const monto =
        formatearMonedaCajaMobile(
            gasto?.monto
        );


    const nombreTienda =
        obtenerNombreTiendaCajaMobile(
            obtenerTiendaCajaMobile()
        );


    return `
        <div
            class="mobile-caja-modal-backdrop"
            data-caja-cancel-expense-backdrop
        >

            <section
                class="mobile-caja-cancel-expense-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileCajaCancelExpenseTitle"
            >

                <div class="mobile-caja-open-handle"></div>


                <header class="mobile-caja-cancel-expense-header">

                    <div>

                        <span>
                            ANULACIÓN DE GASTO
                        </span>

                        <h2 id="mobileCajaCancelExpenseTitle">
                            Confirmar anulación
                        </h2>

                        <p>
                            El movimiento permanecerá guardado
                            para fines de auditoría.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="mobile-caja-open-close"
                        data-caja-cancel-expense-close
                        aria-label="Cerrar anulación de gasto"
                    >
                        ×
                    </button>

                </header>


                <div class="mobile-caja-cancel-expense-summary">

                    <span
                        class="mobile-caja-cancel-expense-icon"
                        aria-hidden="true"
                    >
                        💸
                    </span>

                    <div>

                        <span>
                            GASTO SELECCIONADO
                        </span>

                        <strong>
                            ${descripcion}
                        </strong>

                        <small>
                            ${escaparHTMLCajaMobile(
                                nombreTienda
                            )}
                        </small>

                    </div>

                    <strong>
                        ${monto}
                    </strong>

                </div>


                <label class="mobile-caja-expense-field">

                    <span>
                        Motivo de anulación
                    </span>

                    <input
                        type="text"
                        maxlength="100"
                        autocomplete="off"
                        placeholder="Ej. Monto registrado incorrectamente"
                        data-caja-cancel-expense-reason
                    >

                    <small>
                        Este motivo quedará registrado en Firestore.
                    </small>

                </label>


                <div
                    class="mobile-caja-cancel-expense-warning"
                >
                    <span aria-hidden="true">
                        ⚠️
                    </span>

                    <p>
                        Esta acción no eliminará el documento.
                        El gasto cambiará al estado
                        <strong>anulado</strong>.
                    </p>
                </div>


                <div
                    class="mobile-caja-cancel-expense-message"
                    data-caja-cancel-expense-message
                    aria-live="polite"
                ></div>


                <div class="mobile-caja-open-actions">

                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-secondary
                        "
                        data-caja-cancel-expense-cancel
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        class="
                            mobile-button
                            mobile-button-danger
                            mobile-caja-cancel-expense-confirm
                        "
                        data-caja-cancel-expense-confirm
                    >
                        <span
                            data-caja-cancel-expense-confirm-text
                        >
                            Anular gasto
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                </div>

            </section>

        </div>
    `;

}

function abrirFormularioAnulacionGastoCajaMobile(
    gasto
){

    if(
        portalAnulacionGastoCajaMobile ||
        anulacionGastoVistaEnProceso ||
        !gasto?.id
    ){

        return;

    }


    gastoSeleccionadoAnulacionMobile = {

        ...gasto

    };


    const contenedorPortal =
        document.createElement(
            "div"
        );


    contenedorPortal.innerHTML =
        construirFormularioAnulacionGastoCajaMobile(
            gastoSeleccionadoAnulacionMobile
        );


    portalAnulacionGastoCajaMobile =
        contenedorPortal.firstElementChild;


    if(
        !portalAnulacionGastoCajaMobile
    ){

        gastoSeleccionadoAnulacionMobile =
            null;

        return;

    }


    document.body.appendChild(
        portalAnulacionGastoCajaMobile
    );


    document.body.classList.add(
        "mobile-caja-modal-open"
    );


    inicializarEventosAnulacionGastoCajaMobile();


    requestAnimationFrame(
        function(){

            portalAnulacionGastoCajaMobile
                ?.classList
                .add(
                    "is-visible"
                );


            portalAnulacionGastoCajaMobile
                ?.querySelector(
                    "[data-caja-cancel-expense-reason]"
                )
                ?.focus();

        }
    );

}


function cerrarFormularioAnulacionGastoCajaMobile(){

    if(
        !portalAnulacionGastoCajaMobile ||
        anulacionGastoVistaEnProceso
    ){

        return;

    }


    const portal =
        portalAnulacionGastoCajaMobile;


    portal.classList.remove(
        "is-visible"
    );


    portalAnulacionGastoCajaMobile =
        null;


    gastoSeleccionadoAnulacionMobile =
        null;


    document.body.classList.remove(
        "mobile-caja-modal-open"
    );


    window.setTimeout(
        function(){

            portal.remove();

        },
        180
    );

}

function mostrarMensajeAnulacionGastoCajaMobile(
    mensaje,
    tipo =
        "error"
){

    const elemento =
        portalAnulacionGastoCajaMobile
            ?.querySelector(
                "[data-caja-cancel-expense-message]"
            );


    if(
        !elemento
    ){

        return;

    }


    elemento.textContent =
        String(
            mensaje || ""
        );


    elemento.className =
        "mobile-caja-cancel-expense-message";


    if(
        mensaje
    ){

        elemento.classList.add(
            `is-${tipo}`
        );

    }

}


function establecerLoadingAnulacionGastoCajaMobile(
    activo
){

    anulacionGastoVistaEnProceso =
        Boolean(
            activo
        );


    if(
        !portalAnulacionGastoCajaMobile
    ){

        return;

    }


    const sheet =
        portalAnulacionGastoCajaMobile
            .querySelector(
                ".mobile-caja-cancel-expense-sheet"
            );


    const boton =
        portalAnulacionGastoCajaMobile
            .querySelector(
                "[data-caja-cancel-expense-confirm]"
            );


    const texto =
        portalAnulacionGastoCajaMobile
            .querySelector(
                "[data-caja-cancel-expense-confirm-text]"
            );


    portalAnulacionGastoCajaMobile
        .querySelectorAll(
            "button, input"
        )
        .forEach(
            function(control){

                control.disabled =
                    anulacionGastoVistaEnProceso;

            }
        );


    sheet?.setAttribute(
        "aria-busy",
        anulacionGastoVistaEnProceso
            ? "true"
            : "false"
    );


    boton?.classList.toggle(
        "is-loading",
        anulacionGastoVistaEnProceso
    );


    if(
        texto
    ){

        texto.textContent =
            anulacionGastoVistaEnProceso
                ? "Anulando..."
                : "Anular gasto";

    }

}

async function confirmarAnulacionGastoCajaMobile(){

    if(
        anulacionGastoVistaEnProceso ||
        estaOperacionCajaMobileEnProceso() ||
        !gastoSeleccionadoAnulacionMobile?.id
    ){

        return;

    }


    let anulacionCompletada =
        false;


    const inputMotivo =
        portalAnulacionGastoCajaMobile
            ?.querySelector(
                "[data-caja-cancel-expense-reason]"
            );


    const motivo =
        String(
            inputMotivo?.value ||
            ""
        )
            .trim();


    if(
        motivo.length < 3
    ){

        mostrarMensajeAnulacionGastoCajaMobile(
            "Ingresa un motivo válido para la anulación."
        );


        inputMotivo?.focus();

        return;

    }


    mostrarMensajeAnulacionGastoCajaMobile(
        ""
    );


    establecerLoadingAnulacionGastoCajaMobile(
        true
    );


    try{

        const resultado =
            await anularGastoCajaMobile({

                gastoId:
                    gastoSeleccionadoAnulacionMobile.id,

                motivo,

                sucursalId:
                    obtenerTiendaCajaMobile(),

                autorizado:
                    false

            });


        if(
            !resultado?.completada
        ){

            mostrarMensajeAnulacionGastoCajaMobile(
                resultado?.mensaje ||
                "No se pudo anular el gasto."
            );


            return;

        }


        anulacionCompletada =
            true;


        mostrarMensajeAnulacionGastoCajaMobile(
            resultado.mensaje,
            "success"
        );


        window.setTimeout(
            function(){

                anulacionGastoVistaEnProceso =
                    false;


                cerrarFormularioAnulacionGastoCajaMobile();

            },
            650
        );

    }catch(error){

        console.error(
            "Error confirmando anulación de gasto:",
            error
        );


        mostrarMensajeAnulacionGastoCajaMobile(
            error?.message ||
            "No se pudo anular el gasto."
        );

    }finally{

        if(
            portalAnulacionGastoCajaMobile &&
            !anulacionCompletada
        ){

            establecerLoadingAnulacionGastoCajaMobile(
                false
            );

        }

    }

}

function inicializarEventosAnulacionGastoCajaMobile(){

    if(
        !portalAnulacionGastoCajaMobile
    ){

        return;

    }


    portalAnulacionGastoCajaMobile.addEventListener(
        "click",
        function(evento){

            if(
                evento.target.closest(
                    "[data-caja-cancel-expense-confirm]"
                )
            ){

                confirmarAnulacionGastoCajaMobile();

                return;

            }


            if(
                evento.target.closest(
                    `
                    [data-caja-cancel-expense-close],
                    [data-caja-cancel-expense-cancel]
                    `
                )
            ){

                cerrarFormularioAnulacionGastoCajaMobile();

                return;

            }


            if(
                evento.target.matches(
                    "[data-caja-cancel-expense-backdrop]"
                )
            ){

                cerrarFormularioAnulacionGastoCajaMobile();

            }

        }
    );


    portalAnulacionGastoCajaMobile.addEventListener(
        "keydown",
        function(evento){

            if(
                evento.key === "Escape"
            ){

                cerrarFormularioAnulacionGastoCajaMobile();

                return;

            }


            if(
                evento.key === "Enter"
            ){

                confirmarAnulacionGastoCajaMobile();

            }

        }
    );

}

// =====================================================
// COMPONENTES
// =====================================================

function construirSelectorTiendaCajaMobile(
    tiendaActiva
){

    return `
        <div class="mobile-caja-store-selector">

            <button
                type="button"
                class="
                    mobile-caja-store-option
                    ${
                        tiendaActiva === "principal"
                            ? "is-active"
                            : ""
                    }
                "
                data-caja-store="principal"
                aria-pressed="${
                    tiendaActiva === "principal"
                        ? "true"
                        : "false"
                }"
            >
                <span aria-hidden="true">
                    🏪
                </span>

                <span>
                    Mercado
                </span>
            </button>


            <button
                type="button"
                class="
                    mobile-caja-store-option
                    ${
                        tiendaActiva === "sucursal"
                            ? "is-active"
                            : ""
                    }
                "
                data-caja-store="sucursal"
                aria-pressed="${
                    tiendaActiva === "sucursal"
                        ? "true"
                        : "false"
                }"
            >
                <span aria-hidden="true">
                    ✂️
                </span>

                <span>
                    Peluquería
                </span>
            </button>

        </div>
    `;

}


function construirEstadoCajaMobile(
    caja
){

    let etiqueta =
        "Caja cerrada";


    let clase =
        "is-closed";


    let icono =
        "🔒";


    if(
        caja.anulada
    ){

        etiqueta =
            "Caja anulada";

        clase =
            "is-cancelled";

        icono =
            "⛔";

    }else if(
        caja.abierta
    ){

        etiqueta =
            "Caja abierta";

        clase =
            "is-open";

        icono =
            "🟢";

    }


    return `
        <div
            class="
                mobile-caja-status
                ${clase}
            "
        >

            <span
                class="mobile-caja-status-icon"
                aria-hidden="true"
            >
                ${icono}
            </span>

            <div>

                <span>
                    ESTADO ACTUAL
                </span>

                <strong>
                    ${etiqueta}
                </strong>

            </div>

        </div>
    `;

}


function construirTarjetaMetricaCajaMobile(
    opciones
){

    const {

        icono,

        etiqueta,

        valor,

        clase = ""

    } = opciones;


    return `
        <article
            class="
                mobile-caja-metric
                ${clase}
            "
        >

            <span
                class="mobile-caja-metric-icon"
                aria-hidden="true"
            >
                ${icono}
            </span>

            <div>

                <span>
                    ${escaparHTMLCajaMobile(
                        etiqueta
                    )}
                </span>

                <strong>
                    ${formatearMonedaCajaMobile(
                        valor
                    )}
                </strong>

            </div>

        </article>
    `;

}


function construirResumenMetodosCajaMobile(
    caja
){

    return `
        <section class="mobile-caja-methods">

            <div class="mobile-caja-section-header">

                <div>

                    <span>
                        MÉTODOS DE PAGO
                    </span>

                    <strong>
                        Resumen del día
                    </strong>

                </div>

                <span aria-hidden="true">
                    📊
                </span>

            </div>

            <div class="mobile-caja-methods-grid">

                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "💵",

                    etiqueta:
                        "Efectivo",

                    valor:
                        caja.efectivoDia,

                    clase:
                        "is-cash"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🟣",

                    etiqueta:
                        "Yape",

                    valor:
                        caja.yapeDia,

                    clase:
                        "is-yape"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🟢",

                    etiqueta:
                        "Plin",

                    valor:
                        caja.plinDia,

                    clase:
                        "is-plin"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "💳",

                    etiqueta:
                        "Tarjeta",

                    valor:
                        caja.tarjetaDia,

                    clase:
                        "is-card"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🏦",

                    etiqueta:
                        "Transferencia",

                    valor:
                        caja.transferenciaDia,

                    clase:
                        "is-transfer"

                })}

            </div>

        </section>
    `;

}

function construirTarjetaGastoCajaMobile(
    gasto,
    caja
){

    const descripcion =
        escaparHTMLCajaMobile(
            gasto.descripcion ||
            "Gasto"
        );


    const registradoPor =
        escaparHTMLCajaMobile(
            gasto.registradoPor ||
            "Sin usuario"
        );


    const hora =
        escaparHTMLCajaMobile(
            gasto.hora ||
            "-"
        );


    const monto =
        formatearMonedaCajaMobile(
            gasto.monto
        );


    const anulado =
        gasto.anulado === true ||
        gasto.estado === "anulado";

    const puedeAnular =
        !anulado &&
        caja?.abierta === true &&
        caja?.anulada !== true;


    return `
        <article
            class="
                mobile-caja-expense-card
                ${
                    anulado
                        ? "is-cancelled"
                        : ""
                }
            ">

            <span
                class="mobile-caja-expense-card-icon"
            >
                ${
                    anulado
                        ? "🚫"
                        : "💸"
                }
            </span>

            <div
                class="
                    mobile-caja-expense-card-copy
                ">

                <strong>
                    ${descripcion}
                </strong>

                <span>

                    ${hora}

                    ·

                    ${registradoPor}

                </span>

                ${
                    anulado
                        ? `
                        <small>

                            ANULADO

                            ${
                                gasto.anuladoPor
                                    ? `
                                    ·
                                    ${escaparHTMLCajaMobile(
                                        gasto.anuladoPor
                                    )}
                                    `
                                    : ""
                            }

                        </small>

                        ${
                            gasto.motivoAnulacion
                                ? `
                                <small>

                                    Motivo:
                                    ${escaparHTMLCajaMobile(
                                        gasto.motivoAnulacion
                                    )}

                                </small>
                                `
                                : ""
                        }
                        `
                        : ""
                }

            </div>

            <div
                class="
                    mobile-caja-expense-actions
                ">

                <strong
                    class="
                        mobile-caja-expense-card-amount
                    "
                >
                    ${monto}
                </strong>

                ${
                    !puedeAnular
    ? ""
    : `
<button
    type="button"
    class="mobile-caja-expense-delete"
    data-caja-expense-delete="${escaparHTMLCajaMobile(
        gasto.id
    )}"
>
    Anular
</button>
                        `
                }

            </div>

        </article>
    `;

}

function construirHistorialGastosCajaMobile(
    gastos,
    caja
){

    const listaGastos =
        Array.isArray(
            gastos
        )
            ? gastos
            : [];


    const ultimosGastos =
        listaGastos.slice(
            0,
            8
        );


    return `
        <section class="mobile-caja-expense-history">

            <div class="mobile-caja-section-header">

                <div>

                    <span>
                        MOVIMIENTOS DE CAJA
                    </span>

                    <strong>
                        Últimos gastos
                    </strong>

                </div>

                <span aria-hidden="true">
                    🧾
                </span>

            </div>


            ${
                ultimosGastos.length > 0
                    ? `
                        <div class="mobile-caja-expense-list">

                            ${ultimosGastos
.map(
    function(gasto){

        return construirTarjetaGastoCajaMobile(
            gasto,
            caja
        );

    }
)
                                .join(
                                    ""
                                )}

                        </div>
                    `
                    : `
                        <div class="mobile-caja-expense-empty">

                            <span aria-hidden="true">
                                🧾
                            </span>

                            <strong>
                                Sin gastos registrados
                            </strong>

                            <small>
                                Los movimientos aparecerán aquí
                                automáticamente.
                            </small>

                        </div>
                    `
            }

        </section>
    `;

}

function construirDashboardCajaMobile(
    estado
){

    const {

        caja,

        gastos,

        tienda

    } = estado;


    const totalGastos =
    gastos.reduce(
        function(total, gasto){

            if(
                gasto.anulado === true ||
                gasto.estado === "anulado"
            ){

                return total;

            }


            return (
                total +
                Number(
                    gasto.monto || 0
                )
            );

        },
        0
    );


    const cajaEsperada =
        Number(
            caja.montoInicial || 0
        ) +
        Number(
            caja.efectivoDia || 0
        ) -
        totalGastos;


    const nombreTienda =
        obtenerNombreTiendaCajaMobile(
            tienda
        );


    return `
        <section class="mobile-caja-dashboard">

            <header class="mobile-caja-header">

                <div>

                    <span class="mobile-caja-eyebrow">
                        M7.3 CAJA ENTERPRISE
                    </span>

                    <h1>
                        Caja diaria
                    </h1>

                    <p>
                        Control operativo de
                        ${escaparHTMLCajaMobile(
                            nombreTienda
                        )}.
                    </p>

                </div>

                <span
                    class="mobile-caja-header-icon"
                    aria-hidden="true"
                >
                    💰
                </span>

            </header>


            ${construirSelectorTiendaCajaMobile(
                tienda
            )}


            ${construirEstadoCajaMobile(
                caja
            )}


            <section class="mobile-caja-summary-grid">

                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🪙",

                    etiqueta:
                        "Monto inicial",

                    valor:
                        caja.montoInicial,

                    clase:
                        "is-initial"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🛒",

                    etiqueta:
                        "Ventas del día",

                    valor:
                        caja.ventasDia,

                    clase:
                        "is-sales"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "🧾",

                    etiqueta:
                        "Gastos",

                    valor:
                        totalGastos,

                    clase:
                        "is-expenses"

                })}


                ${construirTarjetaMetricaCajaMobile({

                    icono:
                        "💼",

                    etiqueta:
                        "Efectivo esperado",

                    valor:
                        cajaEsperada,

                    clase:
                        "is-expected"

                })}

            </section>


            ${construirResumenMetodosCajaMobile(
                caja
            )}

${construirHistorialGastosCajaMobile(
    gastos,
    caja
)}


            <section class="mobile-caja-actions">

                <button
                    type="button"
                    class="
                        mobile-button
                        mobile-button-primary
                    "
                    data-caja-open
                    ${
                        caja.abierta
                            ? "disabled"
                            : ""
                    }
                >
                    Abrir caja
                </button>


                <button
                    type="button"
                    class="
                        mobile-button
                        mobile-button-secondary
                    "
                    data-caja-expense
                    ${
                        !caja.abierta
                            ? "disabled"
                            : ""
                    }
                >
                    Registrar gasto
                </button>


                <button
                    type="button"
                    class="
                        mobile-button
                        mobile-button-danger
                    "
                    data-caja-close
                    ${
                        !caja.abierta
                            ? "disabled"
                            : ""
                    }
                >
                    Cerrar caja
                </button>

            </section>

        </section>
    `;

}


// =====================================================
// RENDER
// =====================================================

function actualizarVistaCajaMobile(
    estado
){

    if(
        !contenedorCajaMobile
    ){

        return;

    }


    contenedorCajaMobile.innerHTML =
        construirDashboardCajaMobile(
            estado
        );

}


// =====================================================
// EVENTOS
// =====================================================

function inicializarEventosCajaMobile(){

    if(
        !contenedorCajaMobile
    ){

        return;

    }


    contenedorCajaMobile.addEventListener(
        "click",
        function(evento){

            const botonAnularGasto =
    evento.target.closest(
        "[data-caja-expense-delete]"
    );


if(
    botonAnularGasto
){

    const gastoId =
        botonAnularGasto.dataset
            .cajaExpenseDelete;


    const gasto =
        obtenerGastosCajaMobile()
            .find(
                function(item){

                    return (
                        String(item.id) ===
                        String(gastoId)
                    );

                }
            );


    if(
        gasto
    ){

        abrirFormularioAnulacionGastoCajaMobile(
            gasto
        );

    }


    return;

}

            const botonTienda =
                evento.target.closest(
                    "[data-caja-store]"
                );


            if(
                botonTienda
            ){

                const tienda =
                    botonTienda.dataset
                        .cajaStore;


                establecerTiendaCajaMobile(
                    tienda
                );


                return;

            }


            const botonAbrir =
                evento.target.closest(
                    "[data-caja-open]"
                );


            if(
    botonAbrir &&
    !botonAbrir.disabled
){

    abrirFormularioAperturaCajaMobile();

    return;

}


            const botonGasto =
                evento.target.closest(
                    "[data-caja-expense]"
                );


if(
    botonGasto &&
    !botonGasto.disabled
){

    abrirFormularioGastoCajaMobile();

    return;

}


            const botonCerrar =
                evento.target.closest(
                    "[data-caja-close]"
                );


            if(
    botonCerrar &&
    !botonCerrar.disabled
){

                alert(
                    "El cierre de caja se implementará después de gastos."
                );

            }

        }
    );

}


// =====================================================
// API DE VISTA
// =====================================================

export async function renderCajaMobile(
    contexto
){

    const {
        contenedor
    } = contexto;


    if(
        renderizada
    ){

        return;

    }


    contenedorCajaMobile =
        contenedor;


    contenedorCajaMobile.innerHTML = `
        <section class="mobile-caja-loading">

            <span aria-hidden="true">
                💰
            </span>

            <strong>
                Cargando caja...
            </strong>

            <small>
                Sincronizando información del día.
            </small>

        </section>
    `;


    inicializarEventosCajaMobile();


    cancelarSuscripcionCajaMobile =
        suscribirseCajaMobile(
            actualizarVistaCajaMobile
        );


    iniciarRealtimeCajaMobile(
        obtenerTiendaVentaMobile() ||
        "principal"
    );


    renderizada =
        true;

}


export function reiniciarCajaMobile(){

    if(
        typeof cancelarSuscripcionCajaMobile ===
        "function"
    ){

        cancelarSuscripcionCajaMobile();

    }


    cancelarSuscripcionCajaMobile =
        null;


    detenerRealtimeCajaMobile();

    if(
    portalAperturaCajaMobile
){

    portalAperturaCajaMobile.remove();

}


portalAperturaCajaMobile =
    null;


aperturaCajaVistaEnProceso =
    false;

if(
    portalGastoCajaMobile
){

    portalGastoCajaMobile.remove();

}


    portalGastoCajaMobile =
        null;


    gastoCajaVistaEnProceso =
        false;

if(
    portalAnulacionGastoCajaMobile
){

    portalAnulacionGastoCajaMobile.remove();

}


portalAnulacionGastoCajaMobile =
    null;


gastoSeleccionadoAnulacionMobile =
    null;


anulacionGastoVistaEnProceso =
    false;

document.body.classList.remove(
    "mobile-caja-modal-open"
);    

    contenedorCajaMobile =
        null;


    renderizada =
        false;

}