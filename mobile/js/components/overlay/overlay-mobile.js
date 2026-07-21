// =====================================================
// DIGITAL CENTER M&A
// MOBILE OVERLAY SYSTEM
// FASE M5.0
// =====================================================

const DURACION_SALIDA_OVERLAY =
    260;


let portalOverlay =
    null;

let toastRegion =
    null;

let elementoFocoAnterior =
    null;

let callbackCerrar =
    null;

let overlayActivo =
    false;

let bloqueado =
    false;


function escaparHTMLOverlay(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function asegurarToastRegion(){

    if(
        toastRegion &&
        document.body.contains(
            toastRegion
        )
    ){

        return toastRegion;

    }

    toastRegion =
        document.createElement(
            "div"
        );

    toastRegion.className =
        "mobile-toast-region";

    toastRegion.setAttribute(
        "aria-live",
        "polite"
    );

    toastRegion.setAttribute(
        "aria-atomic",
        "true"
    );

    document.body.appendChild(
        toastRegion
    );

    return toastRegion;

}


function crearPortalOverlay(){

    cerrarOverlayInmediato();

    elementoFocoAnterior =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

    portalOverlay =
        document.createElement(
            "div"
        );

    portalOverlay.className =
        "mobile-overlay-portal";

    portalOverlay.innerHTML = `
        <div
            class="mobile-overlay-backdrop"
            data-overlay-close
        ></div>
    `;

    document.body.appendChild(
        portalOverlay
    );

    document.body.classList.add(
        "mobile-overlay-open"
    );

    portalOverlay.classList.add(
        "is-active"
    );

    portalOverlay.addEventListener(
        "click",
        manejarClickOverlay
    );

    document.addEventListener(
        "keydown",
        manejarTecladoOverlay
    );

    requestAnimationFrame(
        function(){

            portalOverlay
                ?.classList
                .add(
                    "is-visible"
                );

        }
    );

    overlayActivo =
        true;

    return portalOverlay;

}


function manejarClickOverlay(
    evento
){

    const cerrar =
        evento.target.closest(
            "[data-overlay-close]"
        );

    if(!cerrar){

        return;

    }

    cerrarOverlay();

}


function manejarTecladoOverlay(
    evento
){

    if(
        evento.key === "Escape" &&
        overlayActivo &&
        !bloqueado
    ){

        cerrarOverlay();

    }

}


function enfocarPrimerElemento(){

    if(!portalOverlay){

        return;

    }

    const enfocable =
        portalOverlay.querySelector(
            [
                "button:not([disabled])",
                "input:not([disabled])",
                "select:not([disabled])",
                "textarea:not([disabled])",
                "[tabindex]:not([tabindex='-1'])"
            ].join(",")
        );

    enfocable?.focus();

}


function limpiarEventosOverlay(){

    portalOverlay?.removeEventListener(
        "click",
        manejarClickOverlay
    );

    document.removeEventListener(
        "keydown",
        manejarTecladoOverlay
    );

}


function cerrarOverlayInmediato(){

    limpiarEventosOverlay();

    portalOverlay?.remove();

    portalOverlay =
        null;

    callbackCerrar =
        null;

    overlayActivo =
        false;

    bloqueado =
        false;

    document.body.classList.remove(
        "mobile-overlay-open"
    );

}


function cerrarOverlay(
    resultado = null
){

    if(
        !portalOverlay ||
        bloqueado
    ){

        return;

    }

    const callback =
        callbackCerrar;

    portalOverlay.classList.remove(
        "is-visible"
    );

    bloqueado =
        true;

    window.setTimeout(
        function(){

            cerrarOverlayInmediato();

            if(
                elementoFocoAnterior &&
                document.body.contains(
                    elementoFocoAnterior
                )
            ){

                elementoFocoAnterior.focus();

            }

            elementoFocoAnterior =
                null;

            if(
                typeof callback ===
                "function"
            ){

                callback(
                    resultado
                );

            }

        },
        DURACION_SALIDA_OVERLAY
    );

}


function abrirBottomSheet(
    opciones = {}
){

    const {

        eyebrow =
            "DIGITAL CENTER M&A",

        titulo =
            "Opciones",

        descripcion =
            "",

        contenido =
            "",

        textoCancelar =
            "Cancelar",

        textoConfirmar =
            "",

        cerrarAlTocarFondo =
            true,

        alConfirmar =
            null,

        alCerrar =
            null

    } = opciones;


    const portal =
        crearPortalOverlay();


    callbackCerrar =
        alCerrar;


    const fondo =
        portal.querySelector(
            ".mobile-overlay-backdrop"
        );

    if(
        fondo &&
        !cerrarAlTocarFondo
    ){

        fondo.removeAttribute(
            "data-overlay-close"
        );

    }


    const footerVisible =
        Boolean(
            textoCancelar ||
            textoConfirmar
        );


    portal.insertAdjacentHTML(
        "beforeend",
        `
            <section
                class="mobile-bottom-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileBottomSheetTitle"
            >

                <div class="mobile-bottom-sheet-handle-zone">

                    <span class="mobile-bottom-sheet-handle"></span>

                </div>

                <header class="mobile-bottom-sheet-header">

                    <div class="mobile-bottom-sheet-heading">

                        <span class="mobile-bottom-sheet-eyebrow">
                            ${escaparHTMLOverlay(eyebrow)}
                        </span>

                        <h2
                            id="mobileBottomSheetTitle"
                            class="mobile-bottom-sheet-title"
                        >
                            ${escaparHTMLOverlay(titulo)}
                        </h2>

                        ${
                            descripcion
                                ? `
                                    <p class="mobile-bottom-sheet-description">
                                        ${escaparHTMLOverlay(descripcion)}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <button
                        type="button"
                        class="mobile-bottom-sheet-close"
                        data-overlay-close
                        aria-label="Cerrar"
                    >
                        ×
                    </button>

                </header>

                <div
                    class="mobile-bottom-sheet-body"
                    data-overlay-body
                >
                    ${contenido}
                </div>

                ${
                    footerVisible
                        ? `
                            <footer class="mobile-bottom-sheet-footer">

                                ${
                                    textoCancelar
                                        ? `
                                            <button
                                                type="button"
                                                class="mobile-button"
                                                data-overlay-close
                                            >
                                                ${escaparHTMLOverlay(textoCancelar)}
                                            </button>
                                        `
                                        : ""
                                }

                                ${
                                    textoConfirmar
                                        ? `
                                            <button
                                                type="button"
                                                class="mobile-button mobile-button-primary"
                                                data-overlay-confirm
                                            >
                                                ${escaparHTMLOverlay(textoConfirmar)}
                                            </button>
                                        `
                                        : ""
                                }

                            </footer>
                        `
                        : ""
                }

            </section>
        `
    );


    const botonConfirmar =
        portal.querySelector(
            "[data-overlay-confirm]"
        );


    botonConfirmar?.addEventListener(
        "click",
        async function(){

            if(
                typeof alConfirmar !==
                "function"
            ){

                cerrarOverlay(
                    true
                );

                return;

            }

            botonConfirmar.disabled =
                true;

            try{

                const resultado =
                    await alConfirmar({

                        cerrar:
                            cerrarOverlay,

                        body:
                            portal.querySelector(
                                "[data-overlay-body]"
                            ),

                        portal

                    });

                if(
                    resultado !== false
                ){

                    cerrarOverlay(
                        resultado ?? true
                    );

                }

            }catch(error){

                console.error(
                    "Error confirmando Bottom Sheet:",
                    error
                );

                mostrarToast({
                    tipo:
                        "danger",

                    mensaje:
                        "No se pudo completar la acción."
                });

            }finally{

                if(
                    document.body.contains(
                        botonConfirmar
                    )
                ){

                    botonConfirmar.disabled =
                        false;

                }

            }

        }
    );


    window.setTimeout(
        enfocarPrimerElemento,
        50
    );


    return {

        cerrar:
            cerrarOverlay,

        portal,

        body:
            portal.querySelector(
                "[data-overlay-body]"
            )

    };

}


function mostrarDialogo(
    opciones = {}
){

    const {

        icono =
            "⚠️",

        titulo =
            "Confirmar acción",

        mensaje =
            "",

        textoCancelar =
            "Cancelar",

        textoConfirmar =
            "Confirmar",

        peligro =
            false

    } = opciones;


    return new Promise(
        function(resolve){

            const portal =
                crearPortalOverlay();


            callbackCerrar =
                function(resultado){

                    resolve(
                        resultado === true
                    );

                };


            portal.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="mobile-dialog-wrap">

                        <section
                            class="mobile-dialog"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="mobileDialogTitle"
                        >

                            <div class="mobile-dialog-icon">
                                ${escaparHTMLOverlay(icono)}
                            </div>

                            <h2 id="mobileDialogTitle">
                                ${escaparHTMLOverlay(titulo)}
                            </h2>

                            <p>
                                ${escaparHTMLOverlay(mensaje)}
                            </p>

                            <div class="mobile-dialog-actions">

                                <button
                                    type="button"
                                    class="mobile-button"
                                    data-overlay-close
                                >
                                    ${escaparHTMLOverlay(textoCancelar)}
                                </button>

                                <button
                                    type="button"
                                    class="mobile-button ${
                                        peligro
                                            ? "mobile-overlay-danger-button"
                                            : "mobile-button-primary"
                                    }"
                                    data-dialog-confirm
                                >
                                    ${escaparHTMLOverlay(textoConfirmar)}
                                </button>

                            </div>

                        </section>

                    </div>
                `
            );


            portal
                .querySelector(
                    "[data-dialog-confirm]"
                )
                ?.addEventListener(
                    "click",
                    function(){

                        cerrarOverlay(
                            true
                        );

                    }
                );


            window.setTimeout(
                enfocarPrimerElemento,
                50
            );

        }
    );

}


function mostrarToast(
    opciones = {}
){

    const {

        mensaje =
            "Acción completada.",

        tipo =
            "info",

        duracion =
            2600,

        icono =
            tipo === "success"
                ? "✓"
                : tipo === "warning"
                    ? "!"
                    : tipo === "danger"
                        ? "×"
                        : "i"

    } = opciones;


    const region =
        asegurarToastRegion();


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "mobile-toast mobile-toast-" +
        tipo;


    toast.innerHTML = `
        <span class="mobile-toast-icon">
            ${escaparHTMLOverlay(icono)}
        </span>

        <span class="mobile-toast-copy">
            ${escaparHTMLOverlay(mensaje)}
        </span>
    `;


    region.appendChild(
        toast
    );


    const retirar =
        function(){

            if(
                !document.body.contains(
                    toast
                )
            ){

                return;

            }

            toast.classList.add(
                "is-leaving"
            );

            window.setTimeout(
                function(){

                    toast.remove();

                },
                DURACION_SALIDA_OVERLAY
            );

        };


    window.setTimeout(
        retirar,
        Math.max(
            1000,
            Number(duracion || 0)
        )
    );


    return {
        cerrar:
            retirar
    };

}


function mostrarLoading(
    opciones = {}
){

    const {

        titulo =
            "Procesando",

        mensaje =
            "Espera un momento..."

    } = opciones;


    const portal =
        crearPortalOverlay();


    bloqueado =
        true;


    portal
        .querySelector(
            ".mobile-overlay-backdrop"
        )
        ?.removeAttribute(
            "data-overlay-close"
        );


    portal.insertAdjacentHTML(
        "beforeend",
        `
            <div
                class="mobile-loading-wrap"
                role="status"
                aria-live="polite"
            >

                <div class="mobile-loading-card">

                    <span class="mobile-loading-spinner"></span>

                    <strong>
                        ${escaparHTMLOverlay(titulo)}
                    </strong>

                    <small>
                        ${escaparHTMLOverlay(mensaje)}
                    </small>

                </div>

            </div>
        `
    );


    return {

        cerrar:
            function(){

                bloqueado =
                    false;

                cerrarOverlay();

            }

    };

}


function actualizarContenidoBottomSheet(
    contenido
){

    const body =
        portalOverlay?.querySelector(
            "[data-overlay-body]"
        );

    if(!body){

        return false;

    }

    body.innerHTML =
        contenido;

    return true;

}


const OverlayMobile = {

    bottomSheet:
        abrirBottomSheet,

    dialog:
        mostrarDialogo,

    confirm:
        mostrarDialogo,

    toast:
        mostrarToast,

    loading:
        mostrarLoading,

    close:
        cerrarOverlay,

    update:
        actualizarContenidoBottomSheet,

    isOpen:
        function(){

            return overlayActivo;

        }

};


export {

    OverlayMobile,

    abrirBottomSheet,

    mostrarDialogo,

    mostrarToast,

    mostrarLoading,

    cerrarOverlay

};