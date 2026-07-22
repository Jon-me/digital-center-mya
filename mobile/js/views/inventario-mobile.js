// =====================================================
// DIGITAL CENTER M&A
// MOBILE INVENTARIO VIEW
// FASE M5.3 - FIREBASE REAL
// =====================================================

import {

    construirProductCardMobile,

    abrirProductSheetMobile,

    activarSmartImagesMobile,

    establecerMapaSucursalesMobile

} from "../components/product/product-card-mobile.js";

import {

    prepararProductosBusquedaMobile,

    obtenerCategoriasMobile,

    filtrarProductosMobile

} from "../services/catalog-search-mobile.js";

import {

    agregarProductoCarritoMobile

} from "../services/carrito-mobile-service.js";

import {

    cargarProductosMobile,

    limpiarCacheProductosMobile

} from "../services/productos-mobile-service.js";


import {

    cargarSucursalesMobile,

    construirMapaSucursalesMobile,

    limpiarCacheSucursalesMobile

} from "../services/sucursales-mobile-service.js";


import {
    OverlayMobile
} from "../components/overlay/overlay-mobile.js";


let renderizada =
    false;

let cargandoCatalogo =
    false;

let productosMobile =
    [];

let usuarioActualMobile =
    null;

let contenedorActualMobile =
    null;


let estadoCatalogo = {

    busqueda:
        "",

    categoria:
        "Todos"

};


export async function renderInventarioMobile(
    contexto
){

    const {
        contenedor,
        usuario
    } = contexto;


    usuarioActualMobile =
        usuario;

    contenedorActualMobile =
        contenedor;


    if(!renderizada){

        construirEstructuraInventarioMobile(
            contenedor
        );


        inicializarEventosCatalogoMobile(
            contenedor
        );


        renderizada =
            true;

    }


    await cargarCatalogoRealMobile({

        contenedor,

        usuario,

        forzar:
            productosMobile.length === 0

    });

}


function construirEstructuraInventarioMobile(
    contenedor
){

    contenedor.innerHTML = `
        <div class="mobile-catalog">

            <section class="mobile-catalog-tools">

                <label class="mobile-catalog-search">

                    <span class="mobile-catalog-search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        id="mobileCatalogSearch"
                        placeholder="Producto, código o categoría..."
                        autocomplete="off"
                        autocapitalize="none"
                        spellcheck="false"
                    >

                    <button
                        type="button"
                        id="mobileCatalogSearchClear"
                        class="mobile-catalog-search-clear"
                        aria-label="Limpiar búsqueda"
                        hidden
                    >
                        ×
                    </button>

                </label>

                <div
                    id="mobileCategoryChips"
                    class="mobile-category-chips"
                    aria-label="Categorías de productos"
                ></div>

            </section>

            <section class="mobile-section">

                <header class="mobile-catalog-results-header">

                    <h2>
                        Productos
                    </h2>

                    <div class="mobile-catalog-results-actions">

                        <span
                            id="mobileCatalogResultsCount"
                            class="mobile-catalog-results-count"
                        ></span>

                        <button
                            type="button"
                            class="mobile-catalog-refresh"
                            data-mobile-refresh-catalog
                            aria-label="Actualizar catálogo"
                            title="Actualizar catálogo"
                        >
                            ↻
                        </button>

                    </div>

                </header>

                <div
                    id="mobileCatalogGrid"
                    class="mobile-catalog-grid"
                ></div>

            </section>

        </div>
    `;

}


async function cargarCatalogoRealMobile(
    opciones = {}
){

    const {

        contenedor =
            contenedorActualMobile,

        usuario =
            usuarioActualMobile,

        forzar =
            false

    } = opciones;


    if(
        !contenedor ||
        cargandoCatalogo
    ){

        return;

    }


    cargandoCatalogo =
        true;


    mostrarSkeletonCatalogoMobile(
        contenedor
    );


    try{

        const [
            productos,
            sucursales
        ] = await Promise.all([

            cargarProductosMobile({
                forzar
            }),

            cargarSucursalesMobile({
                forzar
            })

        ]);


        const mapaSucursales =
            construirMapaSucursalesMobile(
                sucursales
            );


        establecerMapaSucursalesMobile(
            mapaSucursales
        );


        productosMobile =
            prepararProductosBusquedaMobile(
                productos
            );


        validarCategoriaActualMobile();


        renderizarChipsMobile(
            contenedor
        );


        actualizarCatalogoMobile(
            contenedor,
            usuario
        );


        if(forzar){

            OverlayMobile.toast({

                tipo:
                    "success",

                mensaje:
                    `${productosMobile.length} productos cargados.`
            });

        }

    }catch(error){

        console.error(
            "Error cargando catálogo móvil:",
            error
        );


        mostrarErrorCatalogoMobile(
            contenedor
        );

    }finally{

        cargandoCatalogo =
            false;

    }

}


function inicializarEventosCatalogoMobile(
    contenedor
){

    const input =
        contenedor.querySelector(
            "#mobileCatalogSearch"
        );

    const botonLimpiar =
        contenedor.querySelector(
            "#mobileCatalogSearchClear"
        );


    input?.addEventListener(
        "input",
        function(){

            estadoCatalogo.busqueda =
                input.value;


            actualizarCatalogoMobile(
                contenedor,
                usuarioActualMobile
            );

        }
    );


    botonLimpiar?.addEventListener(
        "click",
        function(){

            estadoCatalogo.busqueda =
                "";


            if(input){

                input.value =
                    "";

                input.focus();

            }


            actualizarCatalogoMobile(
                contenedor,
                usuarioActualMobile
            );

        }
    );


    contenedor.addEventListener(
        "click",
        function(evento){

            const refrescar =
                evento.target.closest(
                    "[data-mobile-refresh-catalog]"
                );


            if(refrescar){

                actualizarCatalogoDesdeFirebaseMobile();

                return;

            }


            const reintentar =
                evento.target.closest(
                    "[data-mobile-retry-catalog]"
                );


            if(reintentar){

                cargarCatalogoRealMobile({
                    contenedor,
                    usuario:
                        usuarioActualMobile,
                    forzar:
                        true
                });

                return;

            }


            const limpiarFiltros =
                evento.target.closest(
                    "[data-mobile-reset-search]"
                );


            if(limpiarFiltros){

                reiniciarFiltrosCatalogoMobile(
                    contenedor
                );

                return;

            }


            const chip =
                evento.target.closest(
                    "[data-mobile-category]"
                );


            if(chip){

                estadoCatalogo.categoria =
                    chip.dataset.mobileCategory ||
                    "Todos";


                actualizarChipsMobile(
                    contenedor
                );


                actualizarCatalogoMobile(
                    contenedor,
                    usuarioActualMobile
                );

                return;

            }


            const tarjeta =
                evento.target.closest(
                    "[data-product-id]"
                );


            if(!tarjeta){

                return;

            }


            const producto =
                productosMobile.find(
                    function(item){

                        return (
                            item.id ===
                            tarjeta.dataset.productId
                        );

                    }
                );


            if(!producto){

                return;

            }


            abrirProductSheetMobile(
                producto,
                usuarioActualMobile,
                {

alAgregar:
    function(detalle){

        const resultado =
            agregarProductoCarritoMobile(

                detalle.producto,

                detalle.cantidad

            );


        if(
            resultado?.operacion?.completada ===
            false
        ){

            const stockDisponible =
                Number(
                    resultado.operacion
                        .stockDisponible || 0
                );


            OverlayMobile.toast({

                tipo:
                    "warning",

                mensaje:
                    stockDisponible > 0
                        ? `Solo tienes ${stockDisponible} unidades disponibles en esta tienda.`
                        : "Este producto no tiene stock en tu tienda."

            });


            return false;

        }


        OverlayMobile.toast({

            tipo:
                "success",

            mensaje:
                detalle.cantidad === 1
                    ? "Producto agregado a la venta."
                    : `${detalle.cantidad} productos agregados a la venta.`

        });


        return true;

    }

                }
            );

        }
    );

}


async function actualizarCatalogoDesdeFirebaseMobile(){

    limpiarCacheProductosMobile();

    limpiarCacheSucursalesMobile();


    await cargarCatalogoRealMobile({

        contenedor:
            contenedorActualMobile,

        usuario:
            usuarioActualMobile,

        forzar:
            true

    });

}


function renderizarChipsMobile(
    contenedor
){

    const salida =
        contenedor.querySelector(
            "#mobileCategoryChips"
        );


    if(!salida){

        return;

    }


    const categorias =
        obtenerCategoriasMobile(
            productosMobile
        );


    salida.innerHTML =
        categorias
            .map(function(categoria){

                const activa =
                    categoria ===
                    estadoCatalogo.categoria;


                return `
                    <button
                        type="button"
                        class="
                            mobile-category-chip
                            ${activa
                                ? "is-active"
                                : ""}
                        "
                        data-mobile-category="${escaparHTMLMobile(
                            categoria
                        )}"
                        aria-pressed="${activa}"
                    >
                        ${escaparHTMLMobile(
                            categoria
                        )}
                    </button>
                `;

            })
            .join("");

}


function actualizarCatalogoMobile(
    contenedor,
    usuario
){

    const resultados =
        filtrarProductosMobile(
            productosMobile,
            estadoCatalogo
        );


    const grid =
        contenedor.querySelector(
            "#mobileCatalogGrid"
        );

    const contador =
        contenedor.querySelector(
            "#mobileCatalogResultsCount"
        );

    const botonLimpiar =
        contenedor.querySelector(
            "#mobileCatalogSearchClear"
        );


    if(contador){

        contador.textContent =
            resultados.length === 1
                ? "1 resultado"
                : `${resultados.length} resultados`;

    }


    if(botonLimpiar){

        botonLimpiar.hidden =
            !estadoCatalogo.busqueda.trim();

    }


    if(!grid){

        return;

    }


    if(
        productosMobile.length === 0
    ){

        grid.innerHTML = `
            <section class="mobile-catalog-empty">

                <div class="mobile-catalog-empty-icon">
                    📦
                </div>

                <h3>
                    Inventario vacío
                </h3>

                <p>
                    Todavía no existen productos
                    registrados en Firebase.
                </p>

            </section>
        `;

        return;

    }


    if(resultados.length === 0){

        grid.innerHTML = `
            <section class="mobile-catalog-empty">

                <div class="mobile-catalog-empty-icon">
                    🔎
                </div>

                <h3>
                    Sin productos
                </h3>

                <p>
                    No encontramos coincidencias.
                    Prueba con otro nombre, código
                    o categoría.
                </p>

                <button
                    type="button"
                    class="mobile-button"
                    data-mobile-reset-search
                >
                    Limpiar filtros
                </button>

            </section>
        `;

        return;

    }


    grid.innerHTML =
        resultados
            .map(function(producto){

                return construirProductCardMobile(
                    producto,
                    usuario
                );

            })
            .join("");

            activarSmartImagesMobile(
                grid
            );

}


function mostrarSkeletonCatalogoMobile(
    contenedor
){

    const grid =
        contenedor.querySelector(
            "#mobileCatalogGrid"
        );

    const contador =
        contenedor.querySelector(
            "#mobileCatalogResultsCount"
        );


    if(contador){

        contador.textContent =
            "Cargando...";

    }


    if(!grid){

        return;

    }


    grid.innerHTML =
        Array
            .from({
                length:
                    5
            })
            .map(function(){

                return `
                    <article class="mobile-product-skeleton">

                        <div class="mobile-skeleton-image"></div>

                        <div class="mobile-skeleton-content">

                            <span class="mobile-skeleton-line short"></span>

                            <span class="mobile-skeleton-line large"></span>

                            <span class="mobile-skeleton-line medium"></span>

                            <span class="mobile-skeleton-line stock"></span>

                        </div>

                    </article>
                `;

            })
            .join("");

}


function mostrarErrorCatalogoMobile(
    contenedor
){

    const grid =
        contenedor.querySelector(
            "#mobileCatalogGrid"
        );

    const contador =
        contenedor.querySelector(
            "#mobileCatalogResultsCount"
        );


    if(contador){

        contador.textContent =
            "Sin conexión";

    }


    if(!grid){

        return;

    }


    grid.innerHTML = `
        <section class="mobile-catalog-empty">

            <div class="mobile-catalog-empty-icon">
                📡
            </div>

            <h3>
                No pudimos cargar el inventario
            </h3>

            <p>
                Revisa tu conexión e intenta
                consultar Firebase nuevamente.
            </p>

            <button
                type="button"
                class="mobile-button mobile-button-primary"
                data-mobile-retry-catalog
            >
                Reintentar
            </button>

        </section>
    `;

}


function actualizarChipsMobile(
    contenedor
){

    contenedor
        .querySelectorAll(
            "[data-mobile-category]"
        )
        .forEach(function(chip){

            const activo =
                chip.dataset.mobileCategory ===
                estadoCatalogo.categoria;


            chip.classList.toggle(
                "is-active",
                activo
            );


            chip.setAttribute(
                "aria-pressed",
                activo
                    ? "true"
                    : "false"
            );

        });

}


function validarCategoriaActualMobile(){

    const categorias =
        obtenerCategoriasMobile(
            productosMobile
        );


    if(
        !categorias.includes(
            estadoCatalogo.categoria
        )
    ){

        estadoCatalogo.categoria =
            "Todos";

    }

}


function reiniciarFiltrosCatalogoMobile(
    contenedor
){

    estadoCatalogo = {

        busqueda:
            "",

        categoria:
            "Todos"

    };


    const input =
        contenedor.querySelector(
            "#mobileCatalogSearch"
        );


    if(input){

        input.value =
            "";

        input.focus();

    }


    actualizarChipsMobile(
        contenedor
    );


    actualizarCatalogoMobile(
        contenedor,
        usuarioActualMobile
    );

}


function escaparHTMLMobile(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


export function reiniciarInventarioMobile(){

    renderizada =
        false;

    cargandoCatalogo =
        false;

    productosMobile =
        [];

    usuarioActualMobile =
        null;

    contenedorActualMobile =
        null;

    estadoCatalogo = {

        busqueda:
            "",

        categoria:
            "Todos"

    };

}