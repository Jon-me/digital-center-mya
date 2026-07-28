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

    productstudio: {
        titulo: "Product Studio",
        contenedorId: "mobileViewProductStudio"
    },

    productnew: {
        titulo: "Nuevo producto",
        contenedorId: "mobileViewProductNew"
    },

    caja: {
        titulo: "Caja",
        contenedorId: "mobileViewCaja"
    },

    reportes: {
        titulo: "Reportes",
        contenedorId: "mobileViewReportes"
    },

    historial: {
        titulo: "Historial",
        contenedorId: "mobileViewHistorial"
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
    obtenerUsuario?.() ||
    null;


if(!usuario){

    console.warn(
        "Navegación móvil bloqueada: no existe una sesión válida."
    );


    window.history.replaceState(
        {},
        "",
        window.location.pathname
    );


    return false;

}


if(
    !puedeNavegarMobile(
        usuario,
        rutaNormalizada
    )
){

    console.warn(
        "Ruta móvil no permitida:",
        {
            ruta:
                rutaNormalizada,

            uid:
                usuario.uid ||
                null,

            rol:
                usuario.rol ||
                null
        }
    );


    if(
        rutaNormalizada ===
        "inicio"
    ){

        return false;

    }


    return navegar(
        "inicio",
        {
            reemplazar:
                true,

            actualizarURL:
                true
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

            return true;

        }


        const nuevoHash =
            "#" + rutaNormalizada;

        if(
            window.location.hash ===
            nuevoHash
        ){

            return true;

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

            return true;

        }


        window.history.pushState(
            {
                rutaMobile:
                    rutaNormalizada
            },
            "",
            nuevoHash
        );

        return true;

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
    async function(){

        const rutaSolicitada =
            obtenerRutaDesdeHash();


        const navegacionCompletada =
            await navegar(
                rutaSolicitada,
                {
                    actualizarURL:
                        false
                }
            );


        if(
            navegacionCompletada ===
            false
        ){

            return;

        }


        const rutaPermitida =
            obtenerRutaActual();


        if(
            rutaPermitida &&
            rutaPermitida !==
            rutaSolicitada
        ){

            window.history.replaceState(
                {
                    rutaMobile:
                        rutaPermitida
                },
                "",
                "#" + rutaPermitida
            );

        }

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