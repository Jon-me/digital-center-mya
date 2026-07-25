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
} from "../views/ventas-mobile.js";

import {
    renderInventarioMobile,
    reiniciarInventarioMobile
} from "../views/inventario-mobile.js";

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
    renderReportesMobile,
    reiniciarReportesMobile
} from "../views/reportes-mobile.js";

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
            AuthMobile
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
            "Digital Center Mobile — Core M4.1 iniciado correctamente."
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

                    return (
                        MobileState.usuarioActual ||
                        usuario
                    );

                },

renderizadores: {

inicio:
    renderHomeMobile,

ventas:
    renderVentasMobile,

inventario:
    renderInventarioMobile,

caja:
    renderCajaMobile,

reportes:
    renderReportesMobile,

mas:
    renderMasMobile,

garantias:
    renderGarantiasMobile

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

    reiniciarCajaMobile();

    reiniciarReportesMobile();

    reiniciarMasMobile();

    destruirGarantiasMobile();

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