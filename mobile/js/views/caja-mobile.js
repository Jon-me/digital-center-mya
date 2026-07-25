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

    cerrarCajaMobile,

    obtenerGastosCajaMobile,

    estaOperacionCajaMobileEnProceso

} from "../services/caja-mobile-service.js";


import {

    obtenerTiendaVentaMobile,

    obtenerSesionMobile,

    obtenerRolMobile

} from "../state-mobile.js";

import {

    solicitarAutorizacionAdminMobile,

    cerrarAutorizacionAdminMobile

} from "../components/admin-authorization-mobile.js";

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

let portalCierreCajaMobile =
    null;


let cierreCajaVistaEnProceso =
    false;


let estadoCajaVistaMobile =
    null;

let portalResultadoCierreCajaMobile =
    null;


let ultimoResultadoCierreCajaMobile =
    null;

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

function normalizarResultadoCierreCajaMobile(
    resultado = {}
){

    const ahora =
        new Date();


    const diferencia =
        Number(
            resultado.diferencia ||
            0
        );


    let estadoCuadre =
        String(
            resultado.estadoCuadre ||
            ""
        )
            .trim()
            .toLowerCase();


    if(
        ![
            "exacta",
            "sobrante",
            "faltante"
        ].includes(
            estadoCuadre
        )
    ){

        if(
            diferencia > 0.009
        ){

            estadoCuadre =
                "sobrante";

        }else if(
            diferencia < -0.009
        ){

            estadoCuadre =
                "faltante";

        }else{

            estadoCuadre =
                "exacta";

        }

    }


    return {

        cajaId:
            String(
                resultado.cajaId ||
                ""
            ),

        sucursalId:
            String(
                resultado.sucursalId ||
                obtenerTiendaCajaMobile()
            ),

        sucursalNombre:
            String(
                resultado.sucursalNombre ||
                obtenerNombreTiendaCajaMobile(
                    resultado.sucursalId ||
                    obtenerTiendaCajaMobile()
                )
            ),

        cajaEsperada:
            Number(
                resultado.cajaEsperada ||
                0
            ),

        dineroReal:
            Number(
                resultado.dineroReal ||
                0
            ),

        diferencia,

        estadoCuadre,

        resultadoCuadre:
            String(
                resultado.resultadoCuadre ||
                (
                    estadoCuadre === "exacta"
                        ? "Caja exacta"
                        : estadoCuadre === "sobrante"
                            ? `Sobrante S/ ${
                                Math.abs(
                                    diferencia
                                ).toFixed(
                                    2
                                )
                            }`
                            : `Faltante S/ ${
                                Math.abs(
                                    diferencia
                                ).toFixed(
                                    2
                                )
                            }`
                )
            ),

        cerradoPor:
            String(
                resultado.cerradoPor ||
                "Sin usuario"
            ),

        cerradoPorUsuario:
            String(
                resultado.cerradoPorUsuario ||
                ""
            ),

        autorizadoPor:
            String(
                resultado.autorizadoPor ||
                "Sin administrador"
            ),

        autorizadoPorUsuario:
            String(
                resultado.autorizadoPorUsuario ||
                ""
            ),

        fecha:
            String(
                resultado.fecha ||
                ahora.toLocaleDateString(
                    "es-PE"
                )
            ),

        hora:
            String(
                resultado.horaCierre ||
                resultado.hora ||
                ahora.toLocaleTimeString(
                    "es-PE"
                )
            )

    };

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


    const gastoSeleccionado = {

        ...gastoSeleccionadoAnulacionMobile

    };


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


    const sesion =
        obtenerSesionMobile();


    const rol =
        String(
            obtenerRolMobile() ||
            sesion?.rol ||
            ""
        )
            .trim()
            .toLowerCase();


    let autorizado =
        rol === "admin";


    let autorizadoPor = {

        usuario:
            String(
                sesion?.usuario ||
                ""
            ),

        nombre:
            String(
                sesion?.nombreCompleto ||
                sesion?.usuario ||
                "Administrador"
            )

    };


    /*
     * El administrador activo puede ejecutar
     * directamente la operación.
     *
     * El vendedor necesita elevar temporalmente
     * sus permisos mediante credenciales admin.
     */
    if(
        rol !== "admin"
    ){

        const autorizacion =
            await solicitarAutorizacionAdminMobile({

                titulo:
                    "Autorizar anulación",

                descripcion:
                    "Esta operación modificará los gastos y el efectivo esperado de la caja.",

                accion:
                    `Anular gasto: ${
                        gastoSeleccionado.descripcion ||
                        "Gasto"
                    }`,

                solicitarMotivo:
                    false,

                motivoObligatorio:
                    false,

                textoConfirmar:
                    "Autorizar anulación"

            });


        if(
            !autorizacion?.autorizado
        ){

            if(
                !autorizacion?.cancelado
            ){

                mostrarMensajeAnulacionGastoCajaMobile(
                    autorizacion?.mensaje ||
                    "No se concedió la autorización administrativa."
                );

            }

            return;

        }


        autorizado =
            true;


        autorizadoPor = {

            usuario:
                String(
                    autorizacion
                        ?.administrador
                        ?.usuario ||
                    ""
                ),

            nombre:
                String(
                    autorizacion
                        ?.administrador
                        ?.nombre ||
                    autorizacion
                        ?.administrador
                        ?.usuario ||
                    "Administrador"
                )

        };

    }


    establecerLoadingAnulacionGastoCajaMobile(
        true
    );


    try{

        const resultado =
            await anularGastoCajaMobile({

                gastoId:
                    gastoSeleccionado.id,

                motivo,

                sucursalId:
                    obtenerTiendaCajaMobile(),

                autorizado,

                autorizadoPor:
                    autorizadoPor.nombre,

                autorizadoPorUsuario:
                    autorizadoPor.usuario

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
            resultado.mensaje ||
            "Gasto anulado correctamente.",
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

            const anulado =
                gasto.anulado === true ||
                gasto.estado === "anulado";


            if(anulado){

                return total;

            }


            return (
                total +
                Number(
                    gasto.monto ||
                    0
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
// CIERRE Y CUADRE DE CAJA
// M7.3.9.2
// =====================================================

function construirFormularioCierreCajaMobile(
    estado
){

    const caja =
        estado?.caja ||
        {};


    const sucursalId =
        caja.sucursalId ||
        obtenerTiendaCajaMobile();


    const sucursalNombre =
        caja.sucursalNombre ||
        obtenerNombreTiendaCajaMobile(
            sucursalId
        );


    const cajaEsperada =
        Number(
            caja.cajaEsperada ||
            0
        );


    const montoInicial =
        Number(
            caja.montoInicial ||
            0
        );


    const efectivoDia =
        Number(
            caja.efectivoDia ||
            0
        );


    const gastosDia =
        Number(
            caja.gastosDia ||
            0
        );


    return `
        <div
            class="mobile-caja-close-backdrop"
            data-caja-close-backdrop
        >

            <section
                class="mobile-caja-close-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileCajaCloseTitle"
                aria-describedby="mobileCajaCloseDescription"
                aria-busy="false"
            >

                <div
                    class="mobile-caja-open-handle"
                    aria-hidden="true"
                ></div>


                <header
                    class="mobile-caja-close-header"
                >

                    <div>

                        <span>
                            CIERRE DE JORNADA
                        </span>

                        <h2
                            id="mobileCajaCloseTitle"
                        >
                            Cuadre de caja
                        </h2>

                        <p
                            id="mobileCajaCloseDescription"
                        >
                            Cuenta el efectivo físico y
                            compáralo con el monto esperado.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="mobile-caja-close-x"
                        data-caja-close-modal-x
                        aria-label="Cerrar cuadre de caja"
                    >
                        ×
                    </button>

                </header>


                <div
                    class="mobile-caja-close-store"
                >

                    <span
                        class="mobile-caja-close-store-icon"
                        aria-hidden="true"
                    >
                        ${
                            sucursalId === "sucursal"
                                ? "✂️"
                                : "🏪"
                        }
                    </span>

                    <div>

                        <small>
                            CAJA SELECCIONADA
                        </small>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                sucursalNombre
                            )}
                        </strong>

                    </div>

                </div>


                <section
                    class="mobile-caja-close-summary"
                    aria-label="Resumen de caja"
                >

                    <article>

                        <span>
                            Monto inicial
                        </span>

                        <strong>
                            ${formatearMonedaCajaMobile(
                                montoInicial
                            )}
                        </strong>

                    </article>


                    <article>

                        <span>
                            Efectivo vendido
                        </span>

                        <strong>
                            ${formatearMonedaCajaMobile(
                                efectivoDia
                            )}
                        </strong>

                    </article>


                    <article>

                        <span>
                            Gastos activos
                        </span>

                        <strong>
                            − ${formatearMonedaCajaMobile(
                                gastosDia
                            )}
                        </strong>

                    </article>


                    <article
                        class="is-expected"
                    >

                        <span>
                            Efectivo esperado
                        </span>

                        <strong>
                            ${formatearMonedaCajaMobile(
                                cajaEsperada
                            )}
                        </strong>

                    </article>

                </section>


                <label
                    class="mobile-caja-close-field"
                >

                    <span>
                        Dinero físico contado
                    </span>

                    <div
                        class="mobile-caja-close-input-wrap"
                    >

                        <span
                            aria-hidden="true"
                        >
                            S/
                        </span>

                        <input
                            type="number"
                            inputmode="decimal"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            autocomplete="off"
                            data-caja-close-real
                        >

                    </div>

                    <small>
                        Ingresa el total de efectivo que
                        encontraste físicamente en caja.
                    </small>

                </label>


                <div
                    class="mobile-caja-close-quick"
                    aria-label="Montos rápidos"
                >

                    <button
                        type="button"
                        data-caja-close-quick="${cajaEsperada}"
                    >
                        Usar esperado
                    </button>


                    <button
                        type="button"
                        data-caja-close-clear
                    >
                        Limpiar
                    </button>

                </div>


                <section
                    class="
                        mobile-caja-close-result
                        is-pending
                    "
                    data-caja-close-result
                    aria-live="polite"
                >

                    <span
                        class="mobile-caja-close-result-icon"
                        data-caja-close-result-icon
                        aria-hidden="true"
                    >
                        ⚖️
                    </span>

                    <div>

                        <small>
                            RESULTADO DEL CUADRE
                        </small>

                        <strong
                            data-caja-close-result-title
                        >
                            Ingresa el dinero contado
                        </strong>

                        <p
                            data-caja-close-result-copy
                        >
                            La diferencia aparecerá aquí.
                        </p>

                    </div>

                    <strong
                        class="mobile-caja-close-result-amount"
                        data-caja-close-result-amount
                    >
                        —
                    </strong>

                </section>


                <div
                    class="mobile-caja-close-warning"
                >

                    <span
                        aria-hidden="true"
                    >
                        ⚠️
                    </span>

                    <p>
                        Al continuar, el sistema solicitará
                        autorización administrativa antes
                        de cerrar definitivamente la caja.
                    </p>

                </div>


                <div
                    class="mobile-caja-close-message"
                    data-caja-close-message
                    role="status"
                    aria-live="polite"
                ></div>


                <div
                    class="mobile-caja-close-actions"
                >

                    <button
                        type="button"
                        class="mobile-caja-close-cancel"
                        data-caja-close-modal-cancel
                    >
                        Volver
                    </button>


                    <button
                        type="button"
                        class="mobile-caja-close-confirm"
                        data-caja-close-modal-confirm
                        disabled
                    >

                        <span
                            data-caja-close-confirm-text
                        >
                            Continuar cierre
                        </span>

                        <span
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </button>

                </div>

            </section>

        </div>
    `;

}

function abrirFormularioCierreCajaMobile(){

    if(
        portalCierreCajaMobile ||
        cierreCajaVistaEnProceso
    ){

        return;

    }


    const caja =
        estadoCajaVistaMobile?.caja;


    if(
        !caja?.existe ||
        caja.abierta !== true ||
        caja.anulada === true
    ){

        return;

    }


    const contenedorPortal =
        document.createElement(
            "div"
        );


    contenedorPortal.innerHTML =
        construirFormularioCierreCajaMobile(
            estadoCajaVistaMobile
        );


    portalCierreCajaMobile =
        contenedorPortal.firstElementChild;


    if(!portalCierreCajaMobile){

        return;

    }


    document.body.appendChild(
        portalCierreCajaMobile
    );


    document.body.classList.add(
        "mobile-caja-modal-open"
    );


    inicializarEventosCierreCajaMobile();


    window.requestAnimationFrame(
        function(){

            portalCierreCajaMobile
                ?.classList
                .add(
                    "is-visible"
                );


            portalCierreCajaMobile
                ?.querySelector(
                    "[data-caja-close-real]"
                )
                ?.focus();

        }
    );

}


function cerrarFormularioCierreCajaMobile(){

    if(
        !portalCierreCajaMobile ||
        cierreCajaVistaEnProceso
    ){

        return;

    }


    const portal =
        portalCierreCajaMobile;


    portal.classList.remove(
        "is-visible"
    );


    portalCierreCajaMobile =
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

function mostrarMensajeCierreCajaMobile(
    mensaje = "",
    tipo = "error"
){

    const elemento =
        portalCierreCajaMobile
            ?.querySelector(
                "[data-caja-close-message]"
            );


    if(!elemento){

        return;

    }


    elemento.textContent =
        String(
            mensaje ||
            ""
        );


    elemento.className =
        "mobile-caja-close-message";


    if(mensaje){

        elemento.classList.add(
            `is-${tipo}`
        );

    }

}

function establecerLoadingCierreCajaMobile(
    activo
){

    cierreCajaVistaEnProceso =
        Boolean(
            activo
        );


    if(!portalCierreCajaMobile){

        return;

    }


    const sheet =
        portalCierreCajaMobile
            .querySelector(
                ".mobile-caja-close-sheet"
            );


    const botonConfirmar =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-modal-confirm]"
            );


    const textoConfirmar =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-confirm-text]"
            );


    const controles =
        portalCierreCajaMobile
            .querySelectorAll(
                `
                    button,
                    input
                `
            );


    controles.forEach(
        function(control){

            control.disabled =
                cierreCajaVistaEnProceso;

        }
    );


    sheet?.setAttribute(
        "aria-busy",
        cierreCajaVistaEnProceso
            ? "true"
            : "false"
    );


    botonConfirmar?.classList.toggle(
        "is-loading",
        cierreCajaVistaEnProceso
    );


    if(textoConfirmar){

        textoConfirmar.textContent =
            cierreCajaVistaEnProceso
                ? "Cerrando caja..."
                : "Continuar cierre";

    }


    if(!cierreCajaVistaEnProceso){

        calcularCuadreVistaCajaMobile();

    }

}

function calcularCuadreVistaCajaMobile(){

    if(!portalCierreCajaMobile){

        return null;

    }


    const input =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-real]"
            );


    const resultado =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-result]"
            );


    const icono =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-result-icon]"
            );


    const titulo =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-result-title]"
            );


    const descripcion =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-result-copy]"
            );


    const montoResultado =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-result-amount]"
            );


    const botonConfirmar =
        portalCierreCajaMobile
            .querySelector(
                "[data-caja-close-modal-confirm]"
            );


    const valorIngresado =
        String(
            input?.value ||
            ""
        )
            .trim();


    resultado?.classList.remove(
        "is-pending",
        "is-exact",
        "is-surplus",
        "is-shortage"
    );


    if(
        valorIngresado === ""
    ){

        resultado?.classList.add(
            "is-pending"
        );


        if(icono){

            icono.textContent =
                "⚖️";

        }


        if(titulo){

            titulo.textContent =
                "Ingresa el dinero contado";

        }


        if(descripcion){

            descripcion.textContent =
                "La diferencia aparecerá aquí.";

        }


        if(montoResultado){

            montoResultado.textContent =
                "—";

        }


        if(botonConfirmar){

            botonConfirmar.disabled =
                true;

        }


        return null;

    }


    const dineroReal =
        Number(
            valorIngresado
        );


    if(
        !Number.isFinite(
            dineroReal
        ) ||
        dineroReal < 0
    ){

        resultado?.classList.add(
            "is-pending"
        );


        if(icono){

            icono.textContent =
                "⚠️";

        }


        if(titulo){

            titulo.textContent =
                "Monto no válido";

        }


        if(descripcion){

            descripcion.textContent =
                "Ingresa un valor igual o mayor que cero.";

        }


        if(montoResultado){

            montoResultado.textContent =
                "—";

        }


        if(botonConfirmar){

            botonConfirmar.disabled =
                true;

        }


        return null;

    }


    const cajaEsperada =
        Number(
            estadoCajaVistaMobile
                ?.caja
                ?.cajaEsperada ||
            0
        );


    const diferencia =
        Number(
            (
                dineroReal -
                cajaEsperada
            )
                .toFixed(
                    2
                )
        );


    let estadoCuadre =
        "exacta";


    let resultadoCuadre =
        "Caja exacta";


    if(
        diferencia > 0.009
    ){

        estadoCuadre =
            "sobrante";


        resultadoCuadre =
            `Sobrante de ${
                formatearMonedaCajaMobile(
                    diferencia
                )
            }`;


        resultado?.classList.add(
            "is-surplus"
        );


        if(icono){

            icono.textContent =
                "📈";

        }


        if(titulo){

            titulo.textContent =
                "Hay dinero sobrante";

        }


        if(descripcion){

            descripcion.textContent =
                resultadoCuadre;

        }

    }else if(
        diferencia < -0.009
    ){

        estadoCuadre =
            "faltante";


        resultadoCuadre =
            `Faltante de ${
                formatearMonedaCajaMobile(
                    Math.abs(
                        diferencia
                    )
                )
            }`;


        resultado?.classList.add(
            "is-shortage"
        );


        if(icono){

            icono.textContent =
                "📉";

        }


        if(titulo){

            titulo.textContent =
                "Existe un faltante";

        }


        if(descripcion){

            descripcion.textContent =
                resultadoCuadre;

        }

    }else{

        resultado?.classList.add(
            "is-exact"
        );


        if(icono){

            icono.textContent =
                "✅";

        }


        if(titulo){

            titulo.textContent =
                "Caja cuadrada";

        }


        if(descripcion){

            descripcion.textContent =
                "El efectivo contado coincide con el esperado.";

        }

    }


    if(montoResultado){

        montoResultado.textContent =
            diferencia === 0
                ? formatearMonedaCajaMobile(
                    0
                )
                : diferencia > 0
                    ? `+ ${
                        formatearMonedaCajaMobile(
                            diferencia
                        )
                    }`
                    : `− ${
                        formatearMonedaCajaMobile(
                            Math.abs(
                                diferencia
                            )
                        )
                    }`;

    }


    if(botonConfirmar){

        botonConfirmar.disabled =
            false;

    }


    mostrarMensajeCierreCajaMobile(
        ""
    );


    return {

        dineroReal,

        cajaEsperada,

        diferencia,

        estadoCuadre,

        resultadoCuadre

    };

}

async function confirmarCierreCajaMobile(){

    if(
        cierreCajaVistaEnProceso ||
        estaOperacionCajaMobileEnProceso()
    ){

        return;

    }


    const cuadre =
        calcularCuadreVistaCajaMobile();


    if(!cuadre){

        mostrarMensajeCierreCajaMobile(
            "Ingresa el dinero físico contado."
        );

        return;

    }


    const caja =
        estadoCajaVistaMobile?.caja;


    if(
        !caja?.existe ||
        caja.abierta !== true ||
        caja.anulada === true
    ){

        mostrarMensajeCierreCajaMobile(
            "La caja ya no está disponible para cierre."
        );

        return;

    }


    const sesion =
        obtenerSesionMobile() ||
        {};


    const rol =
        String(
            obtenerRolMobile() ||
            sesion.rol ||
            ""
        )
            .trim()
            .toLowerCase();


    const nombreSesion =
        String(
            sesion.nombreCompleto ||
            sesion.nombre ||
            sesion.usuario ||
            "Sin usuario"
        );


    const usuarioSesion =
        String(
            sesion.usuario ||
            ""
        );


    let autorizado =
        false;


    let autorizadoPor =
        "";


    let autorizadoPorUsuario =
        "";


    /*
     * ADMIN CONECTADO:
     * no necesita ingresar nuevamente
     * sus propias credenciales.
     */
    if(rol === "admin"){

        autorizado =
            true;


        autorizadoPor =
            nombreSesion;


        autorizadoPorUsuario =
            usuarioSesion;

    }else{

        /*
         * VENDEDOR:
         * requiere autorización
         * administrativa externa.
         */
        const resultadoAutorizacion =
            await solicitarAutorizacionAdminMobile({

                titulo:
                    "Autorizar cierre de caja",

                descripcion:
                    `Se cerrará la caja de ${
                        caja.sucursalNombre ||
                        obtenerNombreTiendaCajaMobile(
                            caja.sucursalId
                        )
                    } con un resultado de ${
                        cuadre.resultadoCuadre
                    }.`,

                accion:
                    "Cierre definitivo de caja",

                solicitarMotivo:
                    false,

                textoConfirmar:
                    "Autorizar cierre"

            });


        if(
            !resultadoAutorizacion?.autorizado
        ){

            if(
                !resultadoAutorizacion?.cancelado
            ){

                mostrarMensajeCierreCajaMobile(
                    resultadoAutorizacion?.mensaje ||
                    "No se autorizó el cierre de caja."
                );

            }

            return;

        }


        autorizado =
            true;


        autorizadoPor =
            String(
                resultadoAutorizacion
                    ?.administrador
                    ?.nombre ||
                ""
            );


        autorizadoPorUsuario =
            String(
                resultadoAutorizacion
                    ?.administrador
                    ?.usuario ||
                ""
            );

    }


    if(
        !autorizado ||
        !autorizadoPor ||
        !autorizadoPorUsuario
    ){

        mostrarMensajeCierreCajaMobile(
            "No se pudo completar la identificación administrativa."
        );

        return;

    }


    mostrarMensajeCierreCajaMobile(
        ""
    );


    establecerLoadingCierreCajaMobile(
        true
    );


    let cierreCompletado =
        false;


    try{

        const resultado =
            await cerrarCajaMobile({

                dineroReal:
                    cuadre.dineroReal,

                sucursalId:
                    caja.sucursalId ||
                    obtenerTiendaCajaMobile(),

                autorizado:
                    true,

                autorizadoPor,

                autorizadoPorUsuario

            });


        if(!resultado?.completada){

            mostrarMensajeCierreCajaMobile(
                resultado?.mensaje ||
                "No se pudo cerrar la caja."
            );

            return;

        }


        cierreCompletado =
            true;


        mostrarMensajeCierreCajaMobile(
            resultado.resultadoCuadre ||
            "Caja cerrada correctamente.",
            "success"
        );


const resultadoFinal = {

    ...resultado,

    sucursalNombre:
        caja.sucursalNombre ||
        obtenerNombreTiendaCajaMobile(
            caja.sucursalId
        ),

    cerradoPor:
        resultado.cerradoPor ||
        nombreSesion,

    cerradoPorUsuario:
        resultado.cerradoPorUsuario ||
        usuarioSesion,

    autorizadoPor,

    autorizadoPorUsuario,

    fecha:
        new Date()
            .toLocaleDateString(
                "es-PE"
            ),

    horaCierre:
        new Date()
            .toLocaleTimeString(
                "es-PE"
            )

};


window.setTimeout(
    function(){

        cierreCajaVistaEnProceso =
            false;


        cerrarFormularioCierreCajaMobile();


        window.setTimeout(
            function(){

                abrirResultadoCierreCajaMobile(
                    resultadoFinal
                );

            },
            220
        );

    },
    650
);

    }catch(error){

        console.error(
            "Error confirmando cierre de caja:",
            error
        );


        mostrarMensajeCierreCajaMobile(
            error?.message ||
            "No se pudo completar el cierre de caja."
        );

    }finally{

        if(
            portalCierreCajaMobile &&
            !cierreCompletado
        ){

            establecerLoadingCierreCajaMobile(
                false
            );

        }

    }

}

function inicializarEventosCierreCajaMobile(){

    if(!portalCierreCajaMobile){

        return;

    }


    portalCierreCajaMobile.addEventListener(
        "input",
        function(evento){

              if(cierreCajaVistaEnProceso){

            return;

        }

            if(
                evento.target.matches(
                    "[data-caja-close-real]"
                )
            ){

                calcularCuadreVistaCajaMobile();

            }

        }
    );


    portalCierreCajaMobile.addEventListener(
        "click",
        function(evento){

        if(cierreCajaVistaEnProceso){

    return;

}

            const botonRapido =
                evento.target.closest(
                    "[data-caja-close-quick]"
                );


            if(
                botonRapido &&
                !cierreCajaVistaEnProceso
            ){

                const input =
                    portalCierreCajaMobile
                        ?.querySelector(
                            "[data-caja-close-real]"
                        );


                if(input){

                    input.value =
                        botonRapido.dataset
                            .cajaCloseQuick ||
                        "";


                    calcularCuadreVistaCajaMobile();


                    input.focus();

                }


                return;

            }


            if(
                evento.target.closest(
                    "[data-caja-close-clear]"
                )
            ){

                const input =
                    portalCierreCajaMobile
                        ?.querySelector(
                            "[data-caja-close-real]"
                        );


                if(input){

                    input.value =
                        "";


                    calcularCuadreVistaCajaMobile();


                    input.focus();

                }


                return;

            }


            if(
    evento.target.closest(
        "[data-caja-close-modal-confirm]"
    )
){

    confirmarCierreCajaMobile();

    return;

}


            if(
                evento.target.closest(
                    "[data-caja-close-modal-x], [data-caja-close-modal-cancel]"
                )
            ){

                cerrarFormularioCierreCajaMobile();

                return;

            }


            if(
                evento.target.matches(
                    "[data-caja-close-backdrop]"
                )
            ){

                cerrarFormularioCierreCajaMobile();

            }

        }
    );


    portalCierreCajaMobile.addEventListener(
        "keydown",
        function(evento){

            if(cierreCajaVistaEnProceso){

            return;

        }

            if(
                evento.key === "Escape"
            ){

                cerrarFormularioCierreCajaMobile();

            }

            if(
    evento.key === "Enter"
){

    const objetivo =
        evento.target;


    if(
        objetivo?.matches(
            "[data-caja-close-real]"
        )
    ){

        evento.preventDefault();

        confirmarCierreCajaMobile();

    }

}

        }
    );

}

// =====================================================
// RESULTADO FINAL DEL CIERRE
// M7.3.9.4
// =====================================================

function construirResultadoCierreCajaMobile(
    resultado
){

    const esExacta =
        resultado.estadoCuadre ===
        "exacta";


    const esSobrante =
        resultado.estadoCuadre ===
        "sobrante";


    const claseEstado =
        esExacta
            ? "is-exact"
            : esSobrante
                ? "is-surplus"
                : "is-shortage";


    const iconoEstado =
        esExacta
            ? "✅"
            : esSobrante
                ? "📈"
                : "📉";


    const tituloEstado =
        esExacta
            ? "Caja cuadrada"
            : esSobrante
                ? "Caja con sobrante"
                : "Caja con faltante";


    const diferenciaFormateada =
        resultado.diferencia === 0
            ? formatearMonedaCajaMobile(
                0
            )
            : resultado.diferencia > 0
                ? `+ ${
                    formatearMonedaCajaMobile(
                        resultado.diferencia
                    )
                }`
                : `− ${
                    formatearMonedaCajaMobile(
                        Math.abs(
                            resultado.diferencia
                        )
                    )
                }`;


    return `
        <div
            class="mobile-caja-result-backdrop is-visible"
            data-caja-result-backdrop
        >

            <section
                class="mobile-caja-result-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileCajaResultTitle"
            >

                <div
                    class="mobile-caja-result-status ${claseEstado}"
                >

                    <span
                        class="mobile-caja-result-status-icon"
                        aria-hidden="true"
                    >
                        ${iconoEstado}
                    </span>

                    <small>
                        CIERRE COMPLETADO
                    </small>

                    <h2
                        id="mobileCajaResultTitle"
                    >
                        ${tituloEstado}
                    </h2>

                    <p>
                        ${escaparHTMLCajaMobile(
                            resultado.resultadoCuadre
                        )}
                    </p>

                    <strong>
                        ${diferenciaFormateada}
                    </strong>

                </div>


                <section
                    class="mobile-caja-result-summary"
                    aria-label="Resumen del cierre"
                >

                    <article>

                        <span>
                            Caja esperada
                        </span>

                        <strong>
                            ${formatearMonedaCajaMobile(
                                resultado.cajaEsperada
                            )}
                        </strong>

                    </article>


                    <article>

                        <span>
                            Dinero contado
                        </span>

                        <strong>
                            ${formatearMonedaCajaMobile(
                                resultado.dineroReal
                            )}
                        </strong>

                    </article>


                    <article>

                        <span>
                            Diferencia
                        </span>

                        <strong>
                            ${diferenciaFormateada}
                        </strong>

                    </article>


                    <article>

                        <span>
                            Tienda
                        </span>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                resultado.sucursalNombre
                            )}
                        </strong>

                    </article>

                </section>


                <section
                    class="mobile-caja-result-audit"
                >

                    <div>

                        <span>
                            CERRADO POR
                        </span>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                resultado.cerradoPor
                            )}
                        </strong>

                        ${
                            resultado.cerradoPorUsuario
                                ? `
                                    <small>
                                        @${escaparHTMLCajaMobile(
                                            resultado.cerradoPorUsuario
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>


                    <div>

                        <span>
                            AUTORIZADO POR
                        </span>

                        <strong>
                            ${escaparHTMLCajaMobile(
                                resultado.autorizadoPor
                            )}
                        </strong>

                        ${
                            resultado.autorizadoPorUsuario
                                ? `
                                    <small>
                                        @${escaparHTMLCajaMobile(
                                            resultado.autorizadoPorUsuario
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                </section>


                <div
                    class="mobile-caja-result-date"
                >

                    <span aria-hidden="true">
                        🕒
                    </span>

                    <p>
                        Cierre registrado el
                        <strong>
                            ${escaparHTMLCajaMobile(
                                resultado.fecha
                            )}
                        </strong>
                        a las
                        <strong>
                            ${escaparHTMLCajaMobile(
                                resultado.hora
                            )}
                        </strong>
                    </p>

                </div>


                <div
                    class="mobile-caja-result-message"
                    data-caja-result-message
                    role="status"
                    aria-live="polite"
                ></div>


                <div
                    class="mobile-caja-result-actions"
                >

                    <button
                        type="button"
                        class="mobile-caja-result-print"
                        data-caja-result-print
                    >

                        <span aria-hidden="true">
                            🖨️
                        </span>

                        Imprimir comprobante

                    </button>


                    <button
                        type="button"
                        class="mobile-caja-result-finish"
                        data-caja-result-finish
                    >

                        Finalizar

                        <span aria-hidden="true">
                            →
                        </span>

                    </button>

                </div>

            </section>

        </div>
    `;

}

function abrirResultadoCierreCajaMobile(
    resultado
){

    if(
        portalResultadoCierreCajaMobile
    ){

        portalResultadoCierreCajaMobile
            .remove();

    }


    ultimoResultadoCierreCajaMobile =
        normalizarResultadoCierreCajaMobile(
            resultado
        );


    const contenedorPortal =
        document.createElement(
            "div"
        );


    contenedorPortal.innerHTML =
        construirResultadoCierreCajaMobile(
            ultimoResultadoCierreCajaMobile
        );


    portalResultadoCierreCajaMobile =
        contenedorPortal.firstElementChild;


    if(
        !portalResultadoCierreCajaMobile
    ){

        return;

    }


    document.body.appendChild(
        portalResultadoCierreCajaMobile
    );


    document.body.classList.add(
        "mobile-caja-modal-open"
    );


    inicializarEventosResultadoCierreCajaMobile();

}


function cerrarResultadoCierreCajaMobile(){

    if(
        !portalResultadoCierreCajaMobile
    ){

        return;

    }


    const portal =
        portalResultadoCierreCajaMobile;


    portalResultadoCierreCajaMobile =
        null;


    ultimoResultadoCierreCajaMobile =
        null;


    document.body.classList.remove(
        "mobile-caja-modal-open"
    );


    portal.classList.remove(
        "is-visible"
    );


    window.setTimeout(
        function(){

            portal.remove();

        },
        180
    );

}

function construirComprobanteCierreCajaMobile(
    resultado
){

    const diferencia =
        resultado.diferencia === 0
            ? formatearMonedaCajaMobile(
                0
            )
            : resultado.diferencia > 0
                ? `+ ${
                    formatearMonedaCajaMobile(
                        resultado.diferencia
                    )
                }`
                : `- ${
                    formatearMonedaCajaMobile(
                        Math.abs(
                            resultado.diferencia
                        )
                    )
                }`;


    return `
        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            >

            <title>
                Comprobante de cierre
            </title>

            <style>

                @page {
                    size: 80mm auto;
                    margin: 4mm;
                }


                * {
                    box-sizing: border-box;
                }


                body {
                    width: 72mm;
                    margin: 0 auto;

                    color: #000000;
                    background: #ffffff;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    font-size: 11px;
                }


                .receipt-header {
                    text-align: center;
                }


                .receipt-header h1 {
                    margin: 0;

                    font-size: 16px;
                    font-weight: 800;
                }


                .receipt-header h2 {
                    margin: 4px 0 0;

                    font-size: 12px;
                }


                .receipt-header p {
                    margin: 4px 0 0;

                    font-size: 9px;
                }


                .separator {
                    margin: 9px 0;

                    border-top:
                        1px dashed
                        #000000;
                }


                .row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 10px;

                    margin: 5px 0;
                }


                .row span {
                    flex: 1;
                }


                .row strong {
                    text-align: right;
                }


                .result {
                    margin: 10px 0;
                    padding: 8px;

                    border:
                        1px solid
                        #000000;

                    text-align: center;
                }


                .result span {
                    display: block;

                    font-size: 9px;
                }


                .result strong {
                    display: block;

                    margin-top: 4px;

                    font-size: 16px;
                }


                .audit {
                    font-size: 9px;
                    line-height: 1.5;
                }


                .footer {
                    margin-top: 10px;

                    text-align: center;
                    font-size: 9px;
                }


                @media print {

                    body {
                        width: 100%;
                    }

                }

            </style>

        </head>

        <body>

            <header class="receipt-header">

                <h1>
                    DIGITAL CENTER M&A
                </h1>

                <h2>
                    COMPROBANTE DE CUADRE
                </h2>

                <p>
                    ${escaparHTMLCajaMobile(
                        resultado.sucursalNombre
                    )}
                </p>

            </header>


            <div class="separator"></div>


            <div class="row">

                <span>
                    Fecha:
                </span>

                <strong>
                    ${escaparHTMLCajaMobile(
                        resultado.fecha
                    )}
                </strong>

            </div>


            <div class="row">

                <span>
                    Hora:
                </span>

                <strong>
                    ${escaparHTMLCajaMobile(
                        resultado.hora
                    )}
                </strong>

            </div>


            <div class="row">

                <span>
                    Caja esperada:
                </span>

                <strong>
                    ${formatearMonedaCajaMobile(
                        resultado.cajaEsperada
                    )}
                </strong>

            </div>


            <div class="row">

                <span>
                    Dinero contado:
                </span>

                <strong>
                    ${formatearMonedaCajaMobile(
                        resultado.dineroReal
                    )}
                </strong>

            </div>


            <div class="result">

                <span>
                    RESULTADO DEL CUADRE
                </span>

                <strong>
                    ${escaparHTMLCajaMobile(
                        resultado.resultadoCuadre
                    )}
                </strong>

                <span>
                    Diferencia: ${diferencia}
                </span>

            </div>


            <div class="separator"></div>


            <section class="audit">

                <div>
                    Cerrado por:
                    <strong>
                        ${escaparHTMLCajaMobile(
                            resultado.cerradoPor
                        )}
                    </strong>
                </div>

                <div>
                    Autorizado por:
                    <strong>
                        ${escaparHTMLCajaMobile(
                            resultado.autorizadoPor
                        )}
                    </strong>
                </div>

                ${
                    resultado.cajaId
                        ? `
                            <div>
                                Caja:
                                <strong>
                                    ${escaparHTMLCajaMobile(
                                        resultado.cajaId
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }

            </section>


            <div class="separator"></div>


            <footer class="footer">

                Documento interno de control de caja.

                <br>

                Digital Center M&A

            </footer>

        </body>

        </html>
    `;

}

function imprimirComprobanteCierreCajaMobile(){

    if(
        !ultimoResultadoCierreCajaMobile
    ){

        return;

    }


    const ventanaImpresion =
        window.open(
            "",
            "_blank",
            "width=420,height=720"
        );


    if(!ventanaImpresion){

        const mensaje =
            portalResultadoCierreCajaMobile
                ?.querySelector(
                    "[data-caja-result-message]"
                );


        if(mensaje){

            mensaje.textContent =
                "El navegador bloqueó la ventana de impresión.";

            mensaje.className =
                "mobile-caja-result-message is-error";

        }


        return;

    }


    ventanaImpresion.document.open();


    ventanaImpresion.document.write(
        construirComprobanteCierreCajaMobile(
            ultimoResultadoCierreCajaMobile
        )
    );


    ventanaImpresion.document.close();


    ventanaImpresion.focus();


    ventanaImpresion.addEventListener(
        "load",
        function(){

            window.setTimeout(
                function(){

                    ventanaImpresion.print();

                },
                180
            );

        }
    );

}

function inicializarEventosResultadoCierreCajaMobile(){

    if(
        !portalResultadoCierreCajaMobile
    ){

        return;

    }


    portalResultadoCierreCajaMobile.addEventListener(
        "click",
        function(evento){

            if(
                evento.target.closest(
                    "[data-caja-result-print]"
                )
            ){

                imprimirComprobanteCierreCajaMobile();

                return;

            }


            if(
                evento.target.closest(
                    "[data-caja-result-finish]"
                )
            ){

                cerrarResultadoCierreCajaMobile();

            }

        }
    );

}

// =====================================================
// RENDER
// =====================================================

function actualizarVistaCajaMobile(
    estado
){

    estadoCajaVistaMobile =
        estado;


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

    abrirFormularioCierreCajaMobile();

    return;

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

    cerrarAutorizacionAdminMobile();

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

if(
    portalCierreCajaMobile
){

    portalCierreCajaMobile.remove();

}


portalCierreCajaMobile =
    null;


cierreCajaVistaEnProceso =
    false;


estadoCajaVistaMobile =
    null;

if(
    portalResultadoCierreCajaMobile
){

    portalResultadoCierreCajaMobile
        .remove();

}


portalResultadoCierreCajaMobile =
    null;


ultimoResultadoCierreCajaMobile =
    null;    
    
document.body.classList.remove(
    "mobile-caja-modal-open"
);    

    contenedorCajaMobile =
        null;


    renderizada =
        false;

}