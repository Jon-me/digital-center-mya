// =====================================================
// DIGITAL CENTER M&A
// CONFIGURACIÓN MOBILE
// CENTRO DE CONTROL ENTERPRISE
// =====================================================

import {
    diagnosticarDatosOperativosMobile,
    restablecerDatosOperativosMobile,
    eliminarSoloVentasMobile
} from "../services/mantenimiento-mobile-service.js";

let renderizada =
    false;


/**
 * Renderiza la pantalla principal de Configuración.
 *
 * Esta ruta es exclusiva para administradores.
 * Las herramientas todavía no ejecutan acciones destructivas.
 */

async function ejecutarDiagnosticoOperativo(
    contenedor
){

    const boton =
        contenedor.querySelector(
            '[data-configuracion-action="diagnostico"]'
        );


    if(!boton){

        return;

    }


    if(
        boton.classList.contains(
            "is-loading"
        )
    ){

        return;

    }


    const contenidoOriginal =
        boton.innerHTML;


    boton.classList.add(
        "is-loading"
    );


    boton.disabled =
        true;


    boton.innerHTML = `
        <span
            class="
                ds-settings-item__icon
                configuracion-mobile-option-icon
            "
        >
            ⏳
        </span>

        <span
            class="
                ds-settings-item__content
                configuracion-mobile-option-content
            "
        >

            <strong class="ds-settings-item__title">
                Analizando datos operativos
            </strong>

            <small class="ds-settings-item__description">
                Consultando ventas, boletas, cajas y correlativo...
            </small>

        </span>
    `;


    try{

        const resultado =
            await diagnosticarDatosOperativosMobile();


        const datos =
            resultado.datos;


        mostrarResultadoDiagnostico(
            contenedor,
            datos,
            resultado.inventarioProtegido
        );

    }catch(error){

        console.error(
            "[Configuración Mobile] Error de diagnóstico:",
            error
        );


        mostrarErrorDiagnostico(
            contenedor,
            error?.message ||
            "No se pudo completar el diagnóstico."
        );

    }finally{

        boton.classList.remove(
            "is-loading"
        );


        boton.disabled =
            false;


        boton.innerHTML =
            contenidoOriginal;

    }

}

function mostrarResultadoDiagnostico(
    contenedor,
    datos,
    inventarioProtegido
){

    let panel =
        contenedor.querySelector(
            "[data-configuracion-diagnostico]"
        );


    if(!panel){

        panel =
            document.createElement(
                "section"
            );


        panel.className = `
            ds-card
            ds-card--success
            configuracion-mobile-diagnostico
        `;


        panel.dataset.configuracionDiagnostico =
            "true";


        const mantenimiento =
            contenedor.querySelector(
                ".configuracion-mobile-group--maintenance"
            );


        mantenimiento?.insertAdjacentElement(
            "afterend",
            panel
        );

    }


    panel.innerHTML = `
        <div class="configuracion-mobile-diagnostico-header">

            <span class="configuracion-mobile-diagnostico-icon">
                ✅
            </span>

            <div>

                <span class="ds-card__eyebrow">
                    DIAGNÓSTICO COMPLETADO
                </span>

                <h3 class="ds-card__title">
                    Estado operativo
                </h3>

            </div>

        </div>


        <div class="configuracion-mobile-diagnostico-grid">

            <article>
                <span>Ventas</span>
                <strong>${datos.ventas}</strong>
            </article>

            <article>
                <span>Boletas</span>
                <strong>${datos.boletas}</strong>
            </article>

            <article>
                <span>Cajas</span>
                <strong>${datos.cajas}</strong>
            </article>

            <article>
                <span>Gastos</span>
                <strong>${datos.gastos}</strong>
            </article>

            <article class="is-wide">
                <span>Último número de boleta</span>
                <strong>${datos.ultimoNumeroBoleta}</strong>
            </article>

        </div>


        <div class="configuracion-mobile-diagnostico-footer">

            <span
                class="
                    ds-chip
                    ds-chip--status
                    ${inventarioProtegido
                        ? "ds-chip--success"
                        : "ds-chip--danger"}
                "
            >
                ${inventarioProtegido
                    ? "Inventario protegido"
                    : "Inventario sin confirmar"}
            </span>

        </div>
    `;


    panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


function mostrarErrorDiagnostico(
    contenedor,
    mensaje
){

    let panel =
        contenedor.querySelector(
            "[data-configuracion-diagnostico]"
        );


    if(!panel){

        panel =
            document.createElement(
                "section"
            );


        panel.dataset.configuracionDiagnostico =
            "true";


        const mantenimiento =
            contenedor.querySelector(
                ".configuracion-mobile-group--maintenance"
            );


        mantenimiento?.insertAdjacentElement(
            "afterend",
            panel
        );

    }


    panel.className = `
        ds-card
        ds-card--danger
        configuracion-mobile-diagnostico
    `;


    panel.innerHTML = `
        <div class="configuracion-mobile-diagnostico-header">

            <span class="configuracion-mobile-diagnostico-icon">
                ⚠️
            </span>

            <div>

                <span class="ds-card__eyebrow">
                    NO SE PUDO COMPLETAR
                </span>

                <h3 class="ds-card__title">
                    Error de diagnóstico
                </h3>

                <p class="ds-card__description">
                    ${mensaje}
                </p>

            </div>

        </div>
    `;


    panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}

function mostrarModalRestablecimiento(
    contenedor
){

    const modalAnterior =
        document.querySelector(
            "[data-modal-restablecimiento]"
        );


    modalAnterior?.remove();


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "configuracion-mobile-modal-backdrop";


    modal.dataset.modalRestablecimiento =
        "true";


    modal.innerHTML = `
        <section
            class="
                ds-card
                ds-card--danger
                configuracion-mobile-modal
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloRestablecimiento"
        >

            <button
                type="button"
                class="configuracion-mobile-modal-close"
                data-restablecimiento-cerrar
                aria-label="Cerrar"
            >
                ×
            </button>


            <div class="configuracion-mobile-modal-icon">
                ⚠️
            </div>


            <span class="ds-card__eyebrow">
                ZONA CRÍTICA
            </span>


            <h2
                id="tituloRestablecimiento"
                class="configuracion-mobile-modal-title"
            >
                Restablecer datos operativos
            </h2>


            <p class="configuracion-mobile-modal-copy">
                Esta acción eliminará permanentemente las ventas,
                boletas, cajas, gastos y registros operativos.
            </p>


            <div class="configuracion-mobile-modal-protection">

                <span>
                    🛡️
                </span>

                <div>

                    <strong>
                        El inventario no será modificado
                    </strong>

                    <small>
                        Productos, precios, imágenes, stock y stock
                        por tienda permanecerán intactos.
                    </small>

                </div>

            </div>


            <label class="configuracion-mobile-confirm-check">

                <input
                    type="checkbox"
                    data-restablecimiento-aceptacion
                >

                <span>
                    Entiendo que esta acción es permanente
                    y no se puede deshacer.
                </span>

            </label>


            <div class="configuracion-mobile-confirm-field">

                <label for="fraseRestablecimiento">
                    Escribe exactamente:
                </label>

                <code>
                    RESTABLECER DIGITAL CENTER
                </code>

                <input
                    id="fraseRestablecimiento"
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder="Escribe la frase de seguridad"
                    data-restablecimiento-frase
                >

            </div>


            <div class="configuracion-mobile-modal-actions">

                <button
                    type="button"
                    class="
                        configuracion-mobile-modal-button
                        configuracion-mobile-modal-button--secondary
                    "
                    data-restablecimiento-cerrar
                >
                    Cancelar
                </button>


                <button
                    type="button"
                    class="
                        configuracion-mobile-modal-button
                        configuracion-mobile-modal-button--danger
                    "
                    data-restablecimiento-confirmar
                    disabled
                >
                    Restablecer ahora
                </button>

            </div>

        </section>
    `;


    document.body.appendChild(
        modal
    );


    const checkbox =
        modal.querySelector(
            "[data-restablecimiento-aceptacion]"
        );


    const input =
        modal.querySelector(
            "[data-restablecimiento-frase]"
        );


    const botonConfirmar =
        modal.querySelector(
            "[data-restablecimiento-confirmar]"
        );


    const validar =
        () => {

            const fraseNormalizada =
                input.value
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .toUpperCase();


    const fraseCorrecta =
        fraseNormalizada ===
        "RESTABLECER DIGITAL CENTER";


            botonConfirmar.disabled =
                !checkbox.checked ||
                !fraseCorrecta;

        };


    checkbox.addEventListener(
        "change",
        validar
    );


    input.addEventListener(
        "input",
        validar
    );

botonConfirmar.addEventListener(
    "click",
    async () => {

        if(
            botonConfirmar.disabled
        ){

            return;

        }


        const frase =
            input.value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                )
                .toUpperCase();


        const confirmacionFinal =
            window.confirm(
                "CONFIRMACIÓN FINAL\n\n" +
                "Se eliminarán permanentemente:\n" +
                "• Ventas\n" +
                "• Boletas\n" +
                "• Cajas\n" +
                "• Gastos\n\n" +
                "El inventario y el stock permanecerán intactos.\n\n" +
                "¿Deseas continuar?"
            );


        if(
            !confirmacionFinal
        ){

            return;

        }


        const contenidoOriginal =
            botonConfirmar.innerHTML;


        botonConfirmar.disabled =
            true;


        botonConfirmar.classList.add(
            "is-loading"
        );


        botonConfirmar.innerHTML = `
            Restableciendo...
        `;


        checkbox.disabled =
            true;


        input.disabled =
            true;


        try{

            const resultado =
                await restablecerDatosOperativosMobile(
                    frase
                );


            modal.remove();


            mostrarResultadoRestablecimiento(
                contenedor,
                resultado
            );

        }catch(error){

            console.error(
                "[Configuración Mobile] Error al restablecer:",
                error
            );


            botonConfirmar.disabled =
                false;


            botonConfirmar.classList.remove(
                "is-loading"
            );


            botonConfirmar.innerHTML =
                contenidoOriginal;


            checkbox.disabled =
                false;


            input.disabled =
                false;


            mostrarErrorRestablecimiento(
                modal,
                error?.message ||
                "No se pudo completar el restablecimiento."
            );

        }

    }
);    

    modal.addEventListener(
        "click",
        (event) => {

            const cerrar =
                event.target.closest(
                    "[data-restablecimiento-cerrar]"
                );


            if(cerrar){

                modal.remove();

                return;

            }


            if(
                event.target ===
                modal
            ){

                modal.remove();

            }

        }
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "is-visible"
            );

        }
    );


    input.focus();

}

function mostrarResultadoRestablecimiento(
    contenedor,
    resultado
){

    const panelAnterior =
        contenedor.querySelector(
            "[data-configuracion-restablecimiento]"
        );


    panelAnterior?.remove();


    const panel =
        document.createElement(
            "section"
        );


    panel.className = `
        ds-card
        ds-card--success
        configuracion-mobile-diagnostico
    `;


    panel.dataset.configuracionRestablecimiento =
        "true";


    panel.innerHTML = `
        <div class="configuracion-mobile-diagnostico-header">

            <span class="configuracion-mobile-diagnostico-icon">
                ✅
            </span>

            <div>

                <span class="ds-card__eyebrow">
                    RESTABLECIMIENTO COMPLETADO
                </span>

                <h3 class="ds-card__title">
                    Datos operativos eliminados
                </h3>

                <p class="ds-card__description">
                    ${resultado.mensaje}
                </p>

            </div>

        </div>


        <div class="configuracion-mobile-diagnostico-grid">

            <article>
                <span>Ventas eliminadas</span>
                <strong>${resultado.eliminados.ventas}</strong>
            </article>

            <article>
                <span>Boletas eliminadas</span>
                <strong>${resultado.eliminados.boletas}</strong>
            </article>

            <article>
                <span>Cajas eliminadas</span>
                <strong>${resultado.eliminados.cajas}</strong>
            </article>

            <article>
                <span>Gastos eliminados</span>
                <strong>${resultado.eliminados.gastos}</strong>
            </article>

            <article class="is-wide">
                <span>Correlativo</span>
                <strong>
                    ${resultado.correlativo.anterior}
                    →
                    ${resultado.correlativo.actual}
                </strong>
            </article>

        </div>


        <div class="configuracion-mobile-diagnostico-footer">

            <span
                class="
                    ds-chip
                    ds-chip--status
                    ds-chip--success
                "
            >
                Inventario protegido
            </span>

        </div>
    `;


    const mantenimiento =
        contenedor.querySelector(
            ".configuracion-mobile-group--maintenance"
        );


    mantenimiento?.insertAdjacentElement(
        "afterend",
        panel
    );


    panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}

function mostrarErrorRestablecimiento(
    modal,
    mensaje
){

    let error =
        modal.querySelector(
            "[data-restablecimiento-error]"
        );


    if(!error){

        error =
            document.createElement(
                "div"
            );


        error.className =
            "configuracion-mobile-restablecimiento-error";


        error.dataset.restablecimientoError =
            "true";


        const acciones =
            modal.querySelector(
                ".configuracion-mobile-modal-actions"
            );


        acciones?.insertAdjacentElement(
            "beforebegin",
            error
        );

    }


    error.innerHTML = `
        <strong>
            No se pudo completar
        </strong>

        <span>
            ${mensaje}
        </span>
    `;

}

export async function renderConfiguracionMobile(
    contexto
){

    const {
        contenedor,
        usuario
    } = contexto;


    if(renderizada){

        return;

    }


    const esAdministrador =
        usuario?.rol === "admin";


    if(!esAdministrador){

        contenedor.innerHTML = `
            <div class="mobile-section">

                <section class="mobile-card">

                    <div class="configuracion-mobile-empty-icon">
                        🔒
                    </div>

                    <h1 class="mobile-card-title">
                        Acceso restringido
                    </h1>

                    <p class="mobile-card-copy">
                        Esta sección está disponible únicamente
                        para administradores.
                    </p>

                </section>

            </div>
        `;

        renderizada =
            true;

        return;

    }


    contenedor.innerHTML = `
        <div class="mobile-section configuracion-mobile">

            <section
               class="
                   ds-card
                   ds-card--elevated
                   ds-hero
                   ds-hero--blue
                   configuracion-mobile-hero
              "
            >

                <div
                    class="
                        ds-hero__icon
                        configuracion-mobile-hero-icon
                    "
                >
                    ⚙️
                </div>

                <div class="ds-hero__content">

                    <span
                        class="
                            ds-hero__eyebrow
                            configuracion-mobile-eyebrow
                        "
                    >
                        CENTRO DE CONTROL
                    </span>

                    <h1
                        class="
                            ds-hero__title
                            configuracion-mobile-title
                        "
                    >
                        Configuración
                    </h1>

                    <p
                        class="
                            ds-hero__subtitle
                            mobile-card-copy
                        "
                    >
                        Administra las preferencias, notificaciones
                        y herramientas internas de Digital Center M&A.
                    </p>

                </div>

            </section>


            <section
                class="
                    ds-card
                    ds-card--info
                    ds-settings-card
                    ds-settings-card--info
                    configuracion-mobile-group
                "
            >

                <div class="ds-settings-card__header configuracion-mobile-group-header">

                    <div class="ds-settings-card__heading">

                        <span class="ds-settings-card__eyebrow configuracion-mobile-group-eyebrow">
                            COMUNICACIONES
                        </span>

                        <h2 class="ds-settings-card__title">
                            Notificaciones
                        </h2>

                    </div>

                    <span class="ds-settings-card__icon configuracion-mobile-group-icon">
                        🔔
                    </span>

                </div>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "    
                    data-configuracion-action="notificaciones"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🔔
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    > 

                        <strong class="ds-settings-item__title">
                            Notificaciones del sistema
                        </strong>

                        <small class="ds-settings-item__description">
                            Activa o desactiva las alertas de nuevas ventas.
                        </small>

                    <span
                        class="
                            ds-chip
                            ds-chip--status
                            ds-chip--pending
                            ds-chip--animated
                            configuracion-mobile-status
                        "
                        data-configuracion-status="notificaciones"
                    >
                        Pendiente
                    </span>

                    <span
                        class="
                            ds-settings-item__arrow
                            configuracion-mobile-option-arrow
                        "
                    >
                        ›
                    </span>

                </button>

            </section>


            <section
                class="
                    ds-card
                    ds-card--warning
                    ds-settings-card
                    ds-settings-card--warning
                    configuracion-mobile-group
                    configuracion-mobile-group--maintenance
                "
            >

                <div class="ds-settings-card__header configuracion-mobile-group-header">

                    <div class="ds-settings-card__heading">

                        <span class="ds-settings-card__eyebrow configuracion-mobile-group-eyebrow">
                            ADMINISTRACIÓN
                        </span>

                        <h2 class="ds-settings-card__title">
                            Centro de mantenimiento
                        </h2>

                    </div>

                    <span class="ds-settings-card__icon configuracion-mobile-group-icon">
                        🛠️
                    </span>

                </div>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    data-configuracion-action="diagnostico"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🔍
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Diagnóstico operativo
                        </strong>

                        <small class="ds-settings-item__description">
                            Consulta ventas, boletas, cajas,
                            gastos y correlativo actual.
                        </small>

                    </span>

                    <span
                        class="
                            ds-settings-item__arrow
                            configuracion-mobile-option-arrow
                        "
                    >
                        ›
                    </span>

                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        ds-settings-item--danger
                        configuracion-mobile-option
                    "
                    data-configuracion-action="restablecer-operacion"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🧹
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Restablecer datos operativos
                        </strong>

                        <small class="ds-settings-item__description">
                            Elimina ventas, boletas y cajas,
                            conservando productos y stock.
                        </small>

                    </span>

                    <span
                        class="
                            ds-settings-item__arrow
                            configuracion-mobile-option-arrow
                        "
                    >
                        ›
                    </span>

                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    data-configuracion-action="eliminar-ventas"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🗑️
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Eliminar solo ventas
                        </strong>

                        <small class="ds-settings-item__description">
                            Limpia únicamente el historial de ventas.
                        </small>

                    </span>

                    <span
                        class="
                            ds-chip
                            ds-chip--future
                            ds-chip--plain
                            configuracion-mobile-option-badge
                        "
                    >
                        Próximamente
                    </span>
                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    data-configuracion-action="reiniciar-correlativo"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        📄
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Reiniciar correlativo
                        </strong>

                        <small class="ds-settings-item__description">
                            Configura nuevamente la numeración de boletas.
                        </small>

                    </span>

                    <span
                        class="
                            ds-chip
                            ds-chip--future
                            ds-chip--plain
                            configuracion-mobile-option-badge
                        "
                    >
                        Próximamente
                    </span>

                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    data-configuracion-action="limpiar-cache"
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🧽
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Limpiar caché local
                        </strong>

                        <small class="ds-settings-item__description">
                            Elimina información temporal guardada
                            en este dispositivo.
                        </small>

                    </span>

                    <span
                        class="
                            ds-settings-item__arrow
                            configuracion-mobile-option-arrow
                        "
                    >
                        ›
                    </span>

                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    data-configuracion-action="respaldo"
                    disabled
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        💾
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Respaldo operativo
                        </strong>

                        <small class="ds-settings-item__description">
                            Exportación de seguridad antes
                            de una limpieza completa.
                        </small>

                    </span>

                    <span
                        class="
                            ds-chip
                            ds-chip--future
                            ds-chip--plain
                            configuracion-mobile-option-badge
                        "
                    >
                        Futuro
                    </span>

                </button>

            </section>


            <section
                class="
                    ds-card
                    ds-settings-card
                    ds-settings-card--future
                    configuracion-mobile-group
                 "
            >

                <div class="ds-settings-card__header configuracion-mobile-group-header">

                    <div class="ds-settings-card__heading">

                        <span class="ds-settings-card__eyebrow configuracion-mobile-group-eyebrow">
                            NEGOCIO
                        </span>

                        <h2 class="ds-settings-card__title">
                            Empresa e impresión
                        </h2>

                    </div>

                    <span class="ds-settings-card__icon configuracion-mobile-group-icon">
                        🏪
                    </span>

                </div>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    disabled
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🏢
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Datos de la empresa
                        </strong>

                        <small class="ds-settings-item__description">
                            Nombre, dirección, teléfono, logo y QR.
                        </small>

                    </span>

                    <span
                        class="
                            ds-chip
                            ds-chip--future
                            ds-chip--plain
                            configuracion-mobile-option-badge
                        "
                    >
                        Futuro
                    </span>

                </button>


                <button
                    type="button"
                    class="
                        ds-settings-item
                        configuracion-mobile-option
                    "
                    disabled
                >

                    <span
                        class="
                            ds-settings-item__icon
                            configuracion-mobile-option-icon
                        "
                    >
                        🖨️
                    </span>

                    <span
                        class="
                            ds-settings-item__content
                            configuracion-mobile-option-content
                        "
                    >

                        <strong class="ds-settings-item__title">
                            Configuración de impresión
                        </strong>

                        <small class="ds-settings-item__description">
                            Papel, vista previa y preferencias de boleta.
                        </small>

                    </span>

                    <span
                        class="
                            ds-chip
                            ds-chip--future
                            ds-chip--plain
                            configuracion-mobile-option-badge
                        "
                    >
                        Futuro
                    </span>

                </button>

            </section>


            <section
                class="
                    ds-card
                    ds-card--success
                    configuracion-mobile-protection
                "
            >

                <span class="configuracion-mobile-protection-icon">
                    🛡️
                </span>

                <div>

                    <strong>
                        Inventario protegido
                    </strong>

                    <p>
                        Las herramientas de mantenimiento no eliminarán
                        productos, precios, imágenes, stock ni stock por tienda.
                    </p>

                </div>

            </section>

        </div>
    `;

contenedor.addEventListener(
    "click",
    async (event) => {

        const boton =
            event.target.closest(
                "[data-configuracion-action]"
            );


        if(!boton){

            return;

        }


        const accion =
            boton.dataset.configuracionAction;


        if(
            accion ===
            "diagnostico"
        ){

            await ejecutarDiagnosticoOperativo(
                contenedor
            );

        }

        if(
            accion ===
            "restablecer-operacion"
        ){

            mostrarModalRestablecimiento(
                contenedor
            );

        }

    }
);    


    renderizada =
        true;

}


/**
 * Permite volver a renderizar la pantalla
 * después de cerrar sesión.
 */
export function reiniciarConfiguracionMobile(){

    renderizada =
        false;

}