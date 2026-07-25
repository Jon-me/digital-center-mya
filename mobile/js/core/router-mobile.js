// =====================================================
// DIGITAL CENTER M&A
// MOBILE ROUTER
// FASE M4.1
// =====================================================

import {
    puedeNavegarMobile
} from "../permissions-mobile.js";


const RUTAS_MOBILE = {

    inicio: {
        titulo: "Inicio",
        contenedorId: "mobileViewInicio"
    },

    ventas: {
        titulo: "Ventas",
        contenedorId: "mobileViewVentas"
    },

    inventario: {
        titulo: "Inventario",
        contenedorId: "mobileViewInventario"
    },

    caja: {
        titulo: "Caja",
        contenedorId: "mobileViewCaja"
    },

    mas: {
        titulo: "Más",
        contenedorId: "mobileViewMas"
    },

    garantias: {
        titulo: "Garantías",
        contenedorId: "mobileViewGarantias"
    }

};


export function crearRouterMobile(
    configuracion = {}
){

    const {

        obtenerUsuario,

        renderizadores = {}

    } = configuracion;


    let rutaActual =
        null;

    let inicializado =
        false;

    let manejadorClick =
        null;

    let manejadorHash =
        null;


    function obtenerRutaDesdeHash(){

        return String(
            window.location.hash || ""
        )
            .replace(/^#/, "")
            .trim()
            .toLowerCase();

    }


    function normalizarRuta(
        ruta
    ){

        const rutaLimpia =
            String(ruta || "")
                .replace(/^#/, "")
                .trim()
                .toLowerCase();

        return Object.prototype.hasOwnProperty.call(
            RUTAS_MOBILE,
            rutaLimpia
        )
            ? rutaLimpia
            : "inicio";

    }


    function actualizarVistas(
        ruta
    ){

        document
            .querySelectorAll(
                "[data-mobile-view]"
            )
            .forEach(function(vista){

                vista.classList.toggle(
                    "is-active",
                    vista.dataset.mobileView === ruta
                );

            });

    }


    function actualizarNavegacion(
        ruta
    ){

        document
            .querySelectorAll(
                "[data-mobile-route]"
            )
            .forEach(function(boton){

                const activo =
                    boton.dataset.mobileRoute === ruta;

                boton.classList.toggle(
                    "is-active",
                    activo
                );

                if(activo){

                    boton.setAttribute(
                        "aria-current",
                        "page"
                    );

                }else{

                    boton.removeAttribute(
                        "aria-current"
                    );

                }

            });

    }


    function actualizarTitulo(
        ruta
    ){

        const titulo =
            document.getElementById(
                "mobileHeaderTitle"
            );

        if(!titulo){

            return;

        }

        titulo.textContent =
            RUTAS_MOBILE[ruta].titulo;

    }


    function subirViewport(){

        const viewport =
            document.getElementById(
                "mobileViewport"
            );

        if(!viewport){

            return;

        }

        viewport.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    async function renderizarRuta(
        ruta
    ){

        const renderizador =
            renderizadores[ruta];

        if(
            typeof renderizador !==
            "function"
        ){

            return;

        }

        const configuracionRuta =
            RUTAS_MOBILE[ruta];

        const contenedor =
            document.getElementById(
                configuracionRuta.contenedorId
            );

        if(!contenedor){

            console.warn(
                "No existe el contenedor de la ruta:",
                ruta
            );

            return;

        }

        await renderizador({
            contenedor,
            usuario:
                obtenerUsuario?.() || null,
            navegar
        });

    }


    async function navegar(
        ruta,
        opciones = {}
    ){

        const {

            reemplazar = false,

            actualizarURL = true,

            forzarRender = false

        } = opciones;


        const rutaNormalizada =
            normalizarRuta(
                ruta
            );

        const usuario =
            obtenerUsuario?.() || null;

        const rol =
            usuario?.rol || "vendedor";


        if(
            !puedeNavegarMobile(
                rol,
                rutaNormalizada
            )
        ){

            console.warn(
                "Ruta móvil no permitida:",
                rutaNormalizada
            );

            return navegar(
                "inicio",
                {
                    reemplazar: true
                }
            );

        }


        actualizarVistas(
            rutaNormalizada
        );

        actualizarNavegacion(
            rutaNormalizada
        );

        actualizarTitulo(
            rutaNormalizada
        );


        if(
            rutaActual !== rutaNormalizada ||
            forzarRender
        ){

            await renderizarRuta(
                rutaNormalizada
            );

        }


        rutaActual =
            rutaNormalizada;

        subirViewport();


        if(!actualizarURL){

            return;

        }


        const nuevoHash =
            "#" + rutaNormalizada;

        if(
            window.location.hash ===
            nuevoHash
        ){

            return;

        }


        if(reemplazar){

            window.history.replaceState(
                {
                    rutaMobile:
                        rutaNormalizada
                },
                "",
                nuevoHash
            );

            return;

        }


        window.history.pushState(
            {
                rutaMobile:
                    rutaNormalizada
            },
            "",
            nuevoHash
        );

    }


    function inicializar(){

        if(inicializado){

            return;

        }

        inicializado =
            true;


        manejadorClick =
            function(evento){

                const disparador =
                    evento.target.closest(
                        "[data-mobile-route], [data-mobile-go]"
                    );

                if(!disparador){

                    return;

                }

                const ruta =
                    disparador.dataset.mobileRoute ||
                    disparador.dataset.mobileGo;

                if(!ruta){

                    return;

                }

                evento.preventDefault();

                navegar(
                    ruta
                );

            };


        manejadorHash =
            function(){

                navegar(
                    obtenerRutaDesdeHash(),
                    {
                        actualizarURL: false
                    }
                );

            };


        document.addEventListener(
            "click",
            manejadorClick
        );

        window.addEventListener(
            "hashchange",
            manejadorHash
        );


        const rutaInicial =
            normalizarRuta(
                obtenerRutaDesdeHash()
            );

        navegar(
            rutaInicial,
            {
                reemplazar: true
            }
        );

    }


    function destruir(){

        if(manejadorClick){

            document.removeEventListener(
                "click",
                manejadorClick
            );

        }

        if(manejadorHash){

            window.removeEventListener(
                "hashchange",
                manejadorHash
            );

        }

        manejadorClick =
            null;

        manejadorHash =
            null;

        rutaActual =
            null;

        inicializado =
            false;

    }


    function obtenerRutaActual(){

        return rutaActual;

    }


    return {

        inicializar,

        destruir,

        navegar,

        obtenerRutaActual

    };

}