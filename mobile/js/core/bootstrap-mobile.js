// =====================================================
// DIGITAL CENTER M&A
// MOBILE BOOTSTRAP
// FASE M4.1
// =====================================================

import {
    cargarFragmentoMobile
} from "../html-loader-mobile.js";

import {
    crearAuthMobile
} from "../auth-mobile.js";

import {
    aplicarPermisosMobile
} from "../permissions-mobile.js";

import {
    MobileState
} from "../state-mobile.js";

import {

    suscribirCarritoMobile

} from "../services/carrito-mobile-service.js";

import {
    crearRouterMobile
} from "./router-mobile.js";

import {
    renderHomeMobile,
    reiniciarHomeMobile
} from "../views/home-mobile.js";

import {
    renderVentasMobile,
    reiniciarVentasMobile
} from "../views/ventas-mobile.js?v=M12-7-2";

import {
    renderInventarioMobile,
    reiniciarInventarioMobile
} from "../views/inventario-mobile.js";

import {
    renderProductStudioMobile,
    reiniciarProductStudioMobile
} from "../views/product-studio-mobile.js?v=M13-3-1";

import {
    renderProductNewMobile,
    reiniciarProductNewMobile
} from "../views/product-new-mobile.js?v=M13-3-2";

import {
    renderCajaMobile,
    reiniciarCajaMobile
} from "../views/caja-mobile.js";

import {
    renderMasMobile,
    reiniciarMasMobile
} from "../views/mas-mobile.js";

import {
    renderGarantiasMobile,
    destruirGarantiasMobile
} from "../views/garantias-mobile.js";

import {
    renderConfiguracionMobile,
    reiniciarConfiguracionMobile
} from "../views/configuracion-mobile.js";

import {
    renderReportesMobile,
    reiniciarReportesMobile
} from "../views/reportes-mobile.js";

import {
    renderHistorialMobile,
    reiniciarHistorialMobile
} from "../views/historial-mobile.js";

let RouterMobile =
    null;

let cancelarSuscripcionCarritoMobile =
    null;

const AuthMobile =
    crearAuthMobile({

        alIniciarSesion:
            mostrarAplicacionMobile,

        alCerrarSesion:
            mostrarLoginMobile

    });


export default async function iniciarMobile(){

    try{

        const sesion =
            await AuthMobile
                .restaurarSesionMobile();


        if(sesion){

            await mostrarAplicacionMobile(
                sesion
            );

        }else{

            await mostrarLoginMobile();

        }


        document.documentElement
            .classList.add(
                "mobile-app-ready"
            );


        console.info(
            "Digital Center Mobile — Enterprise Authentication iniciado correctamente."
        );

    }catch(error){

        console.error(
            "Error iniciando Digital Center Mobile:",
            error
        );

        mostrarErrorMobile(
            error
        );

    }

}


async function mostrarLoginMobile(){

    destruirRouterMobile();

    destruirBadgeCarritoMobile();

    reiniciarVistasMobile();


    const root =
        document.getElementById(
            "mobileRoot"
        );


    if(!root){

        return;

    }


    root.innerHTML =
        "";


    window.history.replaceState(
        {},
        "",
        window.location.pathname
    );


    await cargarFragmentoMobile(
        "./html/login-mobile.html?v=M4-1",
        "#mobileRoot"
    );


    AuthMobile
        .inicializarFormularioLoginMobile();

}


async function mostrarAplicacionMobile(
    usuario
){

    const root =
        document.getElementById(
            "mobileRoot"
        );


    if(!root){

        return;

    }


    destruirRouterMobile();


    root.innerHTML =
        "";


    await cargarFragmentoMobile(
        "./html/app-shell-mobile.html?v=M4-1",
        "#mobileRoot"
    );


    aplicarPermisosMobile(
    usuario
);


inicializarBadgeCarritoMobile();


RouterMobile =
    crearRouterMobile({

obtenerUsuario:
    function(){

        const usuarioEstado =
            MobileState.usuarioActual ||
            null;


        if(
            usuarioEstado?.uid
        ){

            return usuarioEstado;

        }


        return usuario || null;

    },

renderizadores: {

inicio:
    renderHomeMobile,

ventas:
    renderVentasMobile,

inventario:
    renderInventarioMobile,

productstudio:
    renderProductStudioMobile,

productnew:
    renderProductNewMobile,

caja:
    renderCajaMobile,

reportes:
    renderReportesMobile,

historial:
    renderHistorialMobile,

mas:
    renderMasMobile,

garantias:
    renderGarantiasMobile,

configuracion:
    renderConfiguracionMobile,

}

        });


    RouterMobile
        .inicializar();

}

function inicializarBadgeCarritoMobile(){

    destruirBadgeCarritoMobile();


    cancelarSuscripcionCarritoMobile =
        suscribirCarritoMobile(
            function(resumen){

                actualizarBadgeCarritoMobile(
                    resumen?.cantidad || 0
                );

            }
        );

}


function actualizarBadgeCarritoMobile(
    cantidad
){

    const badge =
        document.getElementById(
            "mobileCartBadge"
        );


    if(!badge){

        return;

    }


    const total =
        Math.max(
            0,
            Number(cantidad || 0)
        );


    if(total <= 0){

        badge.hidden =
            true;

        badge.textContent =
            "0";

        return;

    }


    badge.hidden =
        false;

    badge.textContent =
        total > 99
            ? "99+"
            : String(total);


    badge.classList.remove(
        "is-updating"
    );


    void badge.offsetWidth;


    badge.classList.add(
        "is-updating"
    );

}


function destruirBadgeCarritoMobile(){

    if(
        typeof cancelarSuscripcionCarritoMobile ===
        "function"
    ){

        cancelarSuscripcionCarritoMobile();

    }


    cancelarSuscripcionCarritoMobile =
        null;

}

function destruirRouterMobile(){

    if(!RouterMobile){

        return;

    }


    RouterMobile
        .destruir();


    RouterMobile =
        null;

}


function reiniciarVistasMobile(){

    reiniciarHomeMobile();

    reiniciarVentasMobile();

    reiniciarInventarioMobile();

    reiniciarProductStudioMobile();

    reiniciarProductNewMobile();

    reiniciarCajaMobile();

    reiniciarReportesMobile();

    reiniciarHistorialMobile();

    reiniciarMasMobile();

    destruirGarantiasMobile();

    reiniciarConfiguracionMobile();

}


function cerrarSesionDesdeVentana(){

    AuthMobile
        .cerrarSesionMobile();

}


function mostrarErrorMobile(
    error
){

    const root =
        document.getElementById(
            "mobileRoot"
        );


    if(!root){

        return;

    }


    const mensaje =
        error instanceof Error
            ? error.message
            : "Error desconocido";


    root.innerHTML = `
        <section class="mobile-splash">

            <div class="mobile-splash-content">

                <div class="mobile-splash-logo">
                    !
                </div>

                <span class="mobile-splash-eyebrow">
                    ERROR DE INICIALIZACIÓN
                </span>

                <h1>
                    No se pudo iniciar
                </h1>

                <p>
                    ${escaparHTMLMobile(mensaje)}
                </p>

                <button
                    type="button"
                    class="mobile-button mobile-button-primary"
                    onclick="window.location.reload()"
                >
                    Reintentar
                </button>

            </div>

        </section>
    `;

}


function escaparHTMLMobile(
    valor
){

    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


window.cerrarSesionMobile =
    cerrarSesionDesdeVentana;