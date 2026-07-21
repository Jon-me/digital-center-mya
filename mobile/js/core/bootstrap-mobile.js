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


let RouterMobile =
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

                mas:
                    renderMasMobile

            }

        });


    RouterMobile
        .inicializar();

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

    reiniciarMasMobile();

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