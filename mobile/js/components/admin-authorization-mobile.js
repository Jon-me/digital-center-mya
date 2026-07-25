// =====================================================
// DIGITAL CENTER M&A
// ADMIN AUTHORIZATION MODAL
// MOBILE
// M7.3.8.2
// =====================================================

import {

    validarCredencialesAdministradorMobile,

    autorizacionAdminEnProcesoMobile,

    establecerAutorizacionEnProcesoMobile

}
from "../services/admin-authorization-mobile.js";


// =====================================================
// ESTADO INTERNO
// =====================================================

let portalAutorizacionAdminMobile =
    null;

let resolverAutorizacionAdminMobile =
    null;

let configuracionAutorizacionAdminMobile =
    null;

let validacionAutorizacionAdminMobileEnProceso =
    false;


// =====================================================
// ESCAPAR TEXTO HTML
// =====================================================

function escaparTextoAutorizacionAdminMobile(
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
// CONFIGURACIÓN
// =====================================================

function normalizarConfiguracionAutorizacionAdminMobile(
    opciones = {}
){

    return {

        titulo:
            String(
                opciones.titulo ||
                "Autorización administrativa"
            ),

        descripcion:
            String(
                opciones.descripcion ||
                "Ingrese las credenciales de un administrador para continuar."
            ),

        accion:
            String(
                opciones.accion ||
                "Acción protegida"
            ),

        solicitarMotivo:
            opciones.solicitarMotivo ===
            true,

        motivoObligatorio:
            opciones.motivoObligatorio !==
            false,

        etiquetaMotivo:
            String(
                opciones.etiquetaMotivo ||
                "Motivo"
            ),

        placeholderMotivo:
            String(
                opciones.placeholderMotivo ||
                "Explique el motivo de esta acción"
            ),

        textoConfirmar:
            String(
                opciones.textoConfirmar ||
                "Autorizar acción"
            )

    };

}


// =====================================================
// CONSTRUIR MODAL
// =====================================================

function construirModalAutorizacionAdminMobile(
    configuracion
){

    const titulo =
        escaparTextoAutorizacionAdminMobile(
            configuracion.titulo
        );

    const descripcion =
        escaparTextoAutorizacionAdminMobile(
            configuracion.descripcion
        );

    const accion =
        escaparTextoAutorizacionAdminMobile(
            configuracion.accion
        );

    const etiquetaMotivo =
        escaparTextoAutorizacionAdminMobile(
            configuracion.etiquetaMotivo
        );

    const placeholderMotivo =
        escaparTextoAutorizacionAdminMobile(
            configuracion.placeholderMotivo
        );

    const textoConfirmar =
        escaparTextoAutorizacionAdminMobile(
            configuracion.textoConfirmar
        );

    const campoMotivo =
        configuracion.solicitarMotivo
            ? `
                <label
                    class="mobile-admin-auth-field"
                >
                    <span>
                        ${etiquetaMotivo}
                    </span>

                    <textarea
                        data-mobile-admin-auth-reason
                        rows="3"
                        maxlength="240"
                        placeholder="${placeholderMotivo}"
                        autocomplete="off"
                    ></textarea>
                </label>
            `
            : "";

    return `
        <div
            class="mobile-admin-auth-backdrop"
            data-mobile-admin-auth-backdrop
            role="presentation"
        >
            <section
                class="mobile-admin-auth-sheet"
                data-mobile-admin-auth-sheet
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobileAdminAuthTitle"
                aria-describedby="mobileAdminAuthDescription"
                aria-busy="false"
            >
                <div
                    class="mobile-admin-auth-handle"
                    aria-hidden="true"
                ></div>

                <header
                    class="mobile-admin-auth-header"
                >
                    <div>
                        <span>
                            ACCESO PROTEGIDO
                        </span>

                        <h2
                            id="mobileAdminAuthTitle"
                        >
                            ${titulo}
                        </h2>

                        <p
                            id="mobileAdminAuthDescription"
                        >
                            ${descripcion}
                        </p>
                    </div>

                    <button
                        type="button"
                        class="mobile-admin-auth-close"
                        data-mobile-admin-auth-close
                        aria-label="Cerrar autorización"
                    >
                        ×
                    </button>
                </header>

                <div
                    class="mobile-admin-auth-action"
                >
                    <span
                        aria-hidden="true"
                    >
                        🔐
                    </span>

                    <div>
                        <small>
                            ACCIÓN SOLICITADA
                        </small>

                        <strong>
                            ${accion}
                        </strong>
                    </div>
                </div>

                <form
                    class="mobile-admin-auth-form"
                    data-mobile-admin-auth-form
                    novalidate
                >
                    <label
                        class="mobile-admin-auth-field"
                    >
                        <span>
                            Usuario administrador
                        </span>

                        <input
                            type="text"
                            data-mobile-admin-auth-user
                            maxlength="80"
                            autocomplete="username"
                            autocapitalize="none"
                            spellcheck="false"
                            placeholder="Usuario"
                        >
                    </label>

                    <label
                        class="mobile-admin-auth-field"
                    >
                        <span>
                            Contraseña
                        </span>

                        <div
                            class="mobile-admin-auth-password"
                        >
                            <input
                                type="password"
                                data-mobile-admin-auth-password
                                maxlength="120"
                                autocomplete="current-password"
                                placeholder="Contraseña"
                            >

                            <button
                                type="button"
                                data-mobile-admin-auth-toggle
                                aria-label="Mostrar contraseña"
                            >
                                👁
                            </button>
                        </div>
                    </label>

                    ${campoMotivo}

                    <p
                        class="mobile-admin-auth-message"
                        data-mobile-admin-auth-message
                        role="status"
                        aria-live="polite"
                    ></p>

                    <div
                        class="mobile-admin-auth-actions"
                    >
                        <button
                            type="button"
                            class="mobile-admin-auth-cancel"
                            data-mobile-admin-auth-cancel
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="mobile-admin-auth-confirm"
                            data-mobile-admin-auth-confirm
                        >
                            <span
                                data-mobile-admin-auth-confirm-text
                            >
                                ${textoConfirmar}
                            </span>
                        </button>
                    </div>
                </form>
            </section>
        </div>
    `;

}


// =====================================================
// ELEMENTOS
// =====================================================

function obtenerElementosAutorizacionAdminMobile(){

    return {

        backdrop:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-backdrop]"
                ),

        sheet:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-sheet]"
                ),

        form:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-form]"
                ),

        usuario:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-user]"
                ),

        password:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-password]"
                ),

        motivo:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-reason]"
                ),

        mensaje:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-message]"
                ),

        confirmar:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-confirm]"
                ),

        confirmarTexto:
            portalAutorizacionAdminMobile
                ?.querySelector(
                    "[data-mobile-admin-auth-confirm-text]"
                )

    };

}


// =====================================================
// MENSAJES
// =====================================================

function mostrarMensajeAutorizacionAdminMobile(
    mensaje = "",
    tipo = ""
){

    const {
        mensaje:
            elementoMensaje
    } =
        obtenerElementosAutorizacionAdminMobile();

    if(!elementoMensaje){

        return;

    }

    elementoMensaje.textContent =
        mensaje;

    elementoMensaje.classList.remove(
        "is-error",
        "is-success"
    );

    if(tipo){

        elementoMensaje.classList.add(
            "is-" + tipo
        );

    }

}


// =====================================================
// LOADING
// =====================================================

function establecerLoadingAutorizacionAdminMobile(
    cargando
){

    const {

        sheet,

        usuario,

        password,

        motivo,

        confirmar,

        confirmarTexto

    } =
        obtenerElementosAutorizacionAdminMobile();

    validacionAutorizacionAdminMobileEnProceso =
        Boolean(
            cargando
        );

    establecerAutorizacionEnProcesoMobile(
        cargando
    );

    if(sheet){

        sheet.setAttribute(
            "aria-busy",
            cargando
                ? "true"
                : "false"
        );

    }

    if(usuario){

        usuario.disabled =
            cargando;

    }

    if(password){

        password.disabled =
            cargando;

    }

    if(motivo){

        motivo.disabled =
            cargando;

    }

    if(confirmar){

        confirmar.disabled =
            cargando;

    }

    if(confirmarTexto){

        confirmarTexto.textContent =
            cargando
                ? "Validando..."
                : configuracionAutorizacionAdminMobile
                    ?.textoConfirmar ||
                    "Autorizar acción";

    }

}


// =====================================================
// FINALIZAR SOLICITUD
// =====================================================

function finalizarAutorizacionAdminMobile(
    resultado
){

    const resolver =
        resolverAutorizacionAdminMobile;

    resolverAutorizacionAdminMobile =
        null;

    configuracionAutorizacionAdminMobile =
        null;

    validacionAutorizacionAdminMobileEnProceso =
        false;

    establecerAutorizacionEnProcesoMobile(
        false
    );

    document.body.classList.remove(
        "mobile-admin-auth-open"
    );

    if(portalAutorizacionAdminMobile){

        portalAutorizacionAdminMobile.remove();

        portalAutorizacionAdminMobile =
            null;

    }

    if(
        typeof resolver ===
        "function"
    ){

        resolver(
            resultado
        );

    }

}


// =====================================================
// CANCELAR
// =====================================================

function cancelarAutorizacionAdminMobile(){

    if(
        validacionAutorizacionAdminMobileEnProceso
    ){

        return;

    }

    finalizarAutorizacionAdminMobile({

        autorizado:
            false,

        cancelado:
            true,

        administrador:
            null,

        motivo:
            ""

    });

}


// =====================================================
// CONFIRMAR
// =====================================================

async function confirmarAutorizacionAdminMobile(){

    if(
        validacionAutorizacionAdminMobileEnProceso ||
        autorizacionAdminEnProcesoMobile()
    ){

        return;

    }

    const {

        usuario,

        password,

        motivo

    } =
        obtenerElementosAutorizacionAdminMobile();

    const usuarioIngresado =
        usuario?.value.trim() ||
        "";

    const passwordIngresada =
        password?.value.trim() ||
        "";

    const motivoIngresado =
        motivo?.value.trim() ||
        "";

    mostrarMensajeAutorizacionAdminMobile();

    if(!usuarioIngresado){

        mostrarMensajeAutorizacionAdminMobile(
            "Ingrese el usuario administrador.",
            "error"
        );

        usuario?.focus();

        return;

    }

    if(!passwordIngresada){

        mostrarMensajeAutorizacionAdminMobile(
            "Ingrese la contraseña administrativa.",
            "error"
        );

        password?.focus();

        return;

    }

    if(
        configuracionAutorizacionAdminMobile
            ?.solicitarMotivo &&
        configuracionAutorizacionAdminMobile
            ?.motivoObligatorio &&
        !motivoIngresado
    ){

        mostrarMensajeAutorizacionAdminMobile(
            "Ingrese el motivo de la acción.",
            "error"
        );

        motivo?.focus();

        return;

    }

    establecerLoadingAutorizacionAdminMobile(
        true
    );

    try{

        const resultado =
            await validarCredencialesAdministradorMobile({

                usuario:
                    usuarioIngresado,

                password:
                    passwordIngresada

            });

        if(!resultado.autorizado){

            establecerLoadingAutorizacionAdminMobile(
                false
            );

            mostrarMensajeAutorizacionAdminMobile(
                resultado.mensaje ||
                "No se pudo validar la autorización.",
                "error"
            );

            password.value =
                "";

            password.focus();

            return;

        }

        finalizarAutorizacionAdminMobile({

            autorizado:
                true,

            cancelado:
                false,

            administrador:
                resultado.administrador,

            motivo:
                motivoIngresado

        });

    }catch(error){

        console.error(
            "Error validando autorización administrativa:",
            error
        );

        establecerLoadingAutorizacionAdminMobile(
            false
        );

        mostrarMensajeAutorizacionAdminMobile(
            "No se pudo conectar con el sistema.",
            "error"
        );

    }

}


// =====================================================
// EVENTOS
// =====================================================

function inicializarEventosAutorizacionAdminMobile(){

    if(!portalAutorizacionAdminMobile){

        return;

    }

    portalAutorizacionAdminMobile.addEventListener(
        "click",
        function(evento){

            if(
                evento.target.closest(
                    "[data-mobile-admin-auth-close]"
                ) ||
                evento.target.closest(
                    "[data-mobile-admin-auth-cancel]"
                )
            ){

                cancelarAutorizacionAdminMobile();

                return;

            }

            const toggle =
                evento.target.closest(
                    "[data-mobile-admin-auth-toggle]"
                );

            if(toggle){

                const {
                    password
                } =
                    obtenerElementosAutorizacionAdminMobile();

                if(!password){

                    return;

                }

                const visible =
                    password.type ===
                    "text";

                password.type =
                    visible
                        ? "password"
                        : "text";

                toggle.textContent =
                    visible
                        ? "👁"
                        : "🙈";

                toggle.setAttribute(
                    "aria-label",
                    visible
                        ? "Mostrar contraseña"
                        : "Ocultar contraseña"
                );

                return;

            }

            const backdrop =
                evento.target.closest(
                    "[data-mobile-admin-auth-backdrop]"
                );

            if(
                backdrop &&
                evento.target === backdrop
            ){

                cancelarAutorizacionAdminMobile();

            }

        }
    );

    const {
        form
    } =
        obtenerElementosAutorizacionAdminMobile();

    form?.addEventListener(
        "submit",
        function(evento){

            evento.preventDefault();

            confirmarAutorizacionAdminMobile();

        }
    );

}


// =====================================================
// ABRIR SOLICITUD
// =====================================================

function solicitarAutorizacionAdminMobile(
    opciones = {}
){

    if(
        resolverAutorizacionAdminMobile ||
        portalAutorizacionAdminMobile
    ){

        return Promise.resolve({

            autorizado:
                false,

            cancelado:
                false,

            administrador:
                null,

            motivo:
                "",

            mensaje:
                "Ya existe una autorización administrativa en curso."

        });

    }

    configuracionAutorizacionAdminMobile =
        normalizarConfiguracionAutorizacionAdminMobile(
            opciones
        );

    portalAutorizacionAdminMobile =
        document.createElement(
            "div"
        );

    portalAutorizacionAdminMobile.className =
        "mobile-admin-auth-portal";

    portalAutorizacionAdminMobile.innerHTML =
        construirModalAutorizacionAdminMobile(
            configuracionAutorizacionAdminMobile
        );

    document.body.appendChild(
        portalAutorizacionAdminMobile
    );

    document.body.classList.add(
        "mobile-admin-auth-open"
    );

    inicializarEventosAutorizacionAdminMobile();

    window.requestAnimationFrame(
        function(){

            const {
                backdrop,
                usuario
            } =
                obtenerElementosAutorizacionAdminMobile();

            backdrop?.classList.add(
                "is-visible"
            );

            usuario?.focus();

        }
    );

    return new Promise(
        function(resolve){

            resolverAutorizacionAdminMobile =
                resolve;

        }
    );

}


// =====================================================
// LIMPIEZA FORZADA
// =====================================================

function cerrarAutorizacionAdminMobile(){

    if(
        resolverAutorizacionAdminMobile
    ){

        finalizarAutorizacionAdminMobile({

            autorizado:
                false,

            cancelado:
                true,

            administrador:
                null,

            motivo:
                ""

        });

        return;

    }

    document.body.classList.remove(
        "mobile-admin-auth-open"
    );

    portalAutorizacionAdminMobile
        ?.remove();

    portalAutorizacionAdminMobile =
        null;

    configuracionAutorizacionAdminMobile =
        null;

    establecerAutorizacionEnProcesoMobile(
        false
    );

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    solicitarAutorizacionAdminMobile,

    cerrarAutorizacionAdminMobile

};