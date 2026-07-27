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

    abrirProductEditorMobile

} from "../components/product/product-editor-mobile.js";

import {

    prepararProductosBusquedaMobile,

    obtenerCategoriasMobile,

    filtrarProductosMobile

} from "../services/catalog-search-mobile.js";

import {

    agregarProductoCarritoMobile

} from "../services/carrito-mobile-service.js";

import {

    transferirStockMobile,

    obtenerStockTiendasTransferenciaMobile,

    obtenerNombreTiendaTransferenciaMobile

} from "../services/transferencias-mobile-service.js";

import {

    cargarProductosMobile,

    suscribirProductosMobile,

    limpiarCacheProductosMobile,

    actualizarProductoMobile

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

let cancelarSuscripcionProductosVistaMobile =
    null;

let inventarioDesactualizadoMobile =
    false;    

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


    inicializarSuscripcionProductosInventarioMobile();


    renderizada =
        true;

}


const debeActualizar =
    inventarioDesactualizadoMobile ||
    productosMobile.length === 0;


await cargarCatalogoRealMobile({

    contenedor,

    usuario,

    forzar:
        debeActualizar,

    notificar:
        false

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
        false,

    notificar =
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

        inventarioDesactualizadoMobile =
            false;    


        validarCategoriaActualMobile();


        renderizarChipsMobile(
            contenedor
        );


        actualizarCatalogoMobile(
            contenedor,
            usuario
        );


if(notificar){

    OverlayMobile.toast({

        tipo:
            "success",

        mensaje:
            `${productosMobile.length} productos actualizados.`

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

function inicializarSuscripcionProductosInventarioMobile(){

    destruirSuscripcionProductosInventarioMobile();


    cancelarSuscripcionProductosVistaMobile =
        suscribirProductosMobile(

            function(productos){

                productosMobile =
                    prepararProductosBusquedaMobile(
                        productos
                    );


                validarCategoriaActualMobile();


                if(
                    !contenedorActualMobile
                ){

                    return;

                }


                renderizarChipsMobile(
                    contenedorActualMobile
                );


                actualizarCatalogoMobile(
                    contenedorActualMobile,
                    usuarioActualMobile
                );

            },

            function(error){

                console.error(
                    "Error Realtime en Inventario Mobile:",
                    error
                );


                if(
                    contenedorActualMobile
                ){

                    mostrarErrorCatalogoMobile(
                        contenedorActualMobile
                    );

                }

            }

        );

}

function destruirSuscripcionProductosInventarioMobile(){

    if(
        typeof cancelarSuscripcionProductosVistaMobile ===
        "function"
    ){

        cancelarSuscripcionProductosVistaMobile();

    }


    cancelarSuscripcionProductosVistaMobile =
        null;

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
                        resultado
                            .operacion
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

        },


alEditar:
    function(detalle){

        abrirProductEditorMobile({

            producto:
                detalle.producto,

            usuario:
                detalle.usuario,

alGuardar:
    async function(detalle){

        console.log(
    "ARCHIVO QUE LLEGA AL GUARDADO:",
    detalle.imagen
);

console.log(
    "¿ES FILE?:",
    detalle.imagen instanceof File
);

        const loading =
            OverlayMobile.loading({

                titulo:
                    "Actualizando producto",

                mensaje:
                    detalle.imagen
                        ? "Subiendo imagen y guardando cambios..."
                        : "Guardando cambios..."

            });


        const resultado =
            await actualizarProductoMobile({

                producto:
                    detalle.producto,

                cambios:
                    detalle.cambios,

                imagen:
                    detalle.imagen,

                usuario:
                    detalle.usuario

            });


        loading.cerrar();


        if(!resultado.completada){

            OverlayMobile.toast({

                tipo:
                    "danger",

                mensaje:
                    resultado.mensaje

            });

            return false;

        }


        OverlayMobile.toast({

            tipo:
                "success",

            mensaje:
                resultado.imagenActualizada
                    ? "Producto e imagen actualizados."
                    : "Producto actualizado."

        });


        return true;

    },

            alEliminar:
                function(){

                    OverlayMobile.toast({

                        tipo:
                            "warning",

                        mensaje:
                            "La eliminación se conectará próximamente."

                    });

                }

        });

    },


alEliminar:
    function(detalle){

        OverlayMobile.toast({

            tipo:
                "warning",

            mensaje:
                `Eliminar producto: ${
                    detalle.producto?.producto ||
                    "Producto"
                }`

        });

        return false;

    },


alTransferir:
    function(detalle){

        abrirTransferenciaProductoMobile({

            producto:
                detalle.producto,

            usuario:
                detalle.usuario

        });

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
        true,

    notificar:
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

function abrirTransferenciaProductoMobile(
    datos = {}
){

    const {

        producto,

        usuario

    } = datos;


    if(
        !producto ||
        !producto.id
    ){

        OverlayMobile.toast({

            tipo:
                "danger",

            mensaje:
                "No se encontró el producto."

        });

        return;

    }


    const stockTiendas =
        obtenerStockTiendasTransferenciaMobile(
            producto
        );


    const stockPrincipal =
        Number(
            stockTiendas.principal || 0
        );


    const stockSucursal =
        Number(
            stockTiendas.sucursal || 0
        );


    /*
     * Elegimos inicialmente como origen
     * la tienda que tenga existencias.
     */
    let origen =
        stockPrincipal > 0
            ? "principal"
            : stockSucursal > 0
                ? "sucursal"
                : "principal";


    let destino =
        origen === "principal"
            ? "sucursal"
            : "principal";


    let cantidad =
        1;


    function obtenerStockOrigen(){

        return Number(
            stockTiendas[
                origen
            ] || 0
        );

    }


    function construirContenidoTransferencia(){

        const stockOrigen =
            obtenerStockOrigen();


        return `
            <div class="mobile-transfer-sheet">

                <section class="mobile-transfer-product">

                    <div class="mobile-transfer-product-copy">

                        <span>
                            Producto
                        </span>

                        <strong>
                            ${escaparHTMLMobile(
                                producto.producto ||
                                "Producto sin nombre"
                            )}
                        </strong>

                        <small>
                            Código:
                            ${escaparHTMLMobile(
                                producto.codigo ||
                                "S/C"
                            )}
                        </small>

                    </div>

                    <div class="mobile-transfer-total-stock">

                        <span>
                            Stock total
                        </span>

                        <strong>
                            ${
                                stockPrincipal +
                                stockSucursal
                            }
                        </strong>

                    </div>

                </section>


                <section class="mobile-transfer-section">

                    <header class="mobile-transfer-section-header">

                        <span>
                            Tienda de origen
                        </span>

                        <strong data-transfer-origin-stock>
                            ${stockOrigen} disponibles
                        </strong>

                    </header>


                    <div
                        class="mobile-transfer-store-selector"
                        role="group"
                        aria-label="Seleccionar tienda de origen"
                    >

                        <button
                            type="button"
                            class="
                                mobile-transfer-store-option

                                ${
                                    origen === "principal"
                                        ? "is-active"
                                        : ""
                                }
                            "
                            data-transfer-origin="principal"
                            aria-pressed="${
                                origen === "principal"
                                    ? "true"
                                    : "false"
                            }"
                        >

                            <span>
                                Mercado
                            </span>

                            <strong>
                                ${stockPrincipal}
                            </strong>

                        </button>


                        <button
                            type="button"
                            class="
                                mobile-transfer-store-option

                                ${
                                    origen === "sucursal"
                                        ? "is-active"
                                        : ""
                                }
                            "
                            data-transfer-origin="sucursal"
                            aria-pressed="${
                                origen === "sucursal"
                                    ? "true"
                                    : "false"
                            }"
                        >

                            <span>
                                Peluquería
                            </span>

                            <strong>
                                ${stockSucursal}
                            </strong>

                        </button>

                    </div>

                </section>


                <div class="mobile-transfer-route">

                    <span class="mobile-transfer-route-store">

                        <small>
                            Desde
                        </small>

                        <strong data-transfer-origin-name>
                            ${escaparHTMLMobile(
                                obtenerNombreTiendaTransferenciaMobile(
                                    origen
                                )
                            )}
                        </strong>

                    </span>


                    <span
                        class="mobile-transfer-route-arrow"
                        aria-hidden="true"
                    >
                        →
                    </span>


                    <span class="mobile-transfer-route-store">

                        <small>
                            Hacia
                        </small>

                        <strong data-transfer-destination-name>
                            ${escaparHTMLMobile(
                                obtenerNombreTiendaTransferenciaMobile(
                                    destino
                                )
                            )}
                        </strong>

                    </span>

                </div>


                <section class="mobile-transfer-section">

                    <header class="mobile-transfer-section-header">

                        <span>
                            Cantidad a transferir
                        </span>

                        <strong data-transfer-quantity-max>
                            Máximo ${stockOrigen}
                        </strong>

                    </header>


                    <div class="mobile-transfer-quantity">

                        <button
                            type="button"
                            data-transfer-quantity-action="minus"
                            aria-label="Reducir cantidad"
                            disabled
                        >
                            −
                        </button>


                        <div class="mobile-transfer-quantity-value">

                            <small>
                                Unidades
                            </small>

                            <strong data-transfer-quantity>
                                ${
                                    stockOrigen > 0
                                        ? cantidad
                                        : 0
                                }
                            </strong>

                        </div>


                        <button
                            type="button"
                            data-transfer-quantity-action="plus"
                            aria-label="Aumentar cantidad"
                            ${
                                stockOrigen <= 1
                                    ? "disabled"
                                    : ""
                            }
                        >
                            +
                        </button>

                    </div>


                    <p
                        class="mobile-transfer-help"
                        data-transfer-help
                    >

                        ${
                            stockOrigen > 0
                                ? `${stockOrigen} unidad(es) disponibles en ${
                                    escaparHTMLMobile(
                                        obtenerNombreTiendaTransferenciaMobile(
                                            origen
                                        )
                                    )
                                }.`
                                : `No existe stock en ${
                                    escaparHTMLMobile(
                                        obtenerNombreTiendaTransferenciaMobile(
                                            origen
                                        )
                                    )
                                }.`
                        }

                    </p>

                </section>

            </div>
        `;

    }


    const sheet =
        OverlayMobile.bottomSheet({

            clase:
                "mobile-transfer-overlay",

            eyebrow:
                "TRANSFERENCIA DE STOCK",

            titulo:
                producto.producto ||
                "Producto",

            descripcion:
                "Mueve unidades entre tus tiendas.",

            contenido:
                construirContenidoTransferencia(),

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Confirmar transferencia",

            cerrarAlTocarFondo:
                false,

            alConfirmar:
                async function(){

                    const stockOrigen =
                        obtenerStockOrigen();


                    if(stockOrigen <= 0){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                `No existe stock en ${
                                    obtenerNombreTiendaTransferenciaMobile(
                                        origen
                                    )
                                }.`

                        });

                        return false;

                    }


                    if(
                        cantidad <= 0 ||
                        cantidad > stockOrigen
                    ){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                `Solo puedes transferir hasta ${stockOrigen} unidad(es).`

                        });

                        return false;

                    }


                    const nombreOrigen =
                        obtenerNombreTiendaTransferenciaMobile(
                            origen
                        );


                    const nombreDestino =
                        obtenerNombreTiendaTransferenciaMobile(
                            destino
                        );


                    const confirmado =
                        await OverlayMobile.confirm({

                            icono:
                                "⇄",

                            titulo:
                                "Confirmar transferencia",

                            mensaje:
                                `Transferir ${cantidad} unidad(es) de ${nombreOrigen} hacia ${nombreDestino}.`,

                            textoCancelar:
                                "Volver",

                            textoConfirmar:
                                "Transferir"

                        });


                    if(!confirmado){

                        return false;

                    }


                    const loading =
                        OverlayMobile.loading({

                            titulo:
                                "Transfiriendo stock",

                            mensaje:
                                "Actualizando inventario en Firebase..."

                        });


                    const resultado =
                        await transferirStockMobile({

                            producto,

                            origen,

                            destino,

                            cantidad,

                            usuario

                        });


                    loading.cerrar();


                    if(!resultado.completada){

                        OverlayMobile.toast({

                            tipo:
                                "danger",

                            mensaje:
                                resultado.mensaje ||
                                "No se pudo realizar la transferencia."

                        });

                        return false;

                    }


                    OverlayMobile.toast({

                        tipo:
                            "success",

                        mensaje:
                            resultado.mensaje

                    });


                    return true;

                }

        });


    function actualizarTransferenciaMobile(){

        const stockOrigen =
            obtenerStockOrigen();


        if(stockOrigen <= 0){

            cantidad =
                0;

        }else{

            cantidad =
                Math.max(
                    1,
                    Math.min(
                        cantidad,
                        stockOrigen
                    )
                );

        }


        const salidaCantidad =
            sheet.body?.querySelector(
                "[data-transfer-quantity]"
            );


        const botonMenos =
            sheet.body?.querySelector(
                '[data-transfer-quantity-action="minus"]'
            );


        const botonMas =
            sheet.body?.querySelector(
                '[data-transfer-quantity-action="plus"]'
            );


        const salidaMaximo =
            sheet.body?.querySelector(
                "[data-transfer-quantity-max]"
            );


        const salidaStock =
            sheet.body?.querySelector(
                "[data-transfer-origin-stock]"
            );


        const salidaOrigen =
            sheet.body?.querySelector(
                "[data-transfer-origin-name]"
            );


        const salidaDestino =
            sheet.body?.querySelector(
                "[data-transfer-destination-name]"
            );


        const ayuda =
            sheet.body?.querySelector(
                "[data-transfer-help]"
            );


        if(salidaCantidad){

            salidaCantidad.textContent =
                cantidad;

        }


        if(botonMenos){

            botonMenos.disabled =
                cantidad <= 1;

        }


        if(botonMas){

            botonMas.disabled =
                stockOrigen <= 0 ||
                cantidad >= stockOrigen;

        }


        if(salidaMaximo){

            salidaMaximo.textContent =
                `Máximo ${stockOrigen}`;

        }


        if(salidaStock){

            salidaStock.textContent =
                `${stockOrigen} disponibles`;

        }


        if(salidaOrigen){

            salidaOrigen.textContent =
                obtenerNombreTiendaTransferenciaMobile(
                    origen
                );

        }


        if(salidaDestino){

            salidaDestino.textContent =
                obtenerNombreTiendaTransferenciaMobile(
                    destino
                );

        }


        if(ayuda){

            ayuda.textContent =
                stockOrigen > 0
                    ? `${stockOrigen} unidad(es) disponibles en ${
                        obtenerNombreTiendaTransferenciaMobile(
                            origen
                        )
                    }.`
                    : `No existe stock en ${
                        obtenerNombreTiendaTransferenciaMobile(
                            origen
                        )
                    }.`;

        }


        sheet.confirmButton?.toggleAttribute(
            "disabled",
            stockOrigen <= 0
        );


        sheet.body
            ?.querySelectorAll(
                "[data-transfer-origin]"
            )
            .forEach(function(boton){

                const activo =
                    boton.dataset
                        .transferOrigin ===
                    origen;


                boton.classList.toggle(
                    "is-active",
                    activo
                );


                boton.setAttribute(
                    "aria-pressed",
                    activo
                        ? "true"
                        : "false"
                );

            });

    }


    sheet.body
        ?.addEventListener(
            "click",
            function(evento){

                const botonOrigen =
                    evento.target.closest(
                        "[data-transfer-origin]"
                    );


                if(botonOrigen){

                    origen =
                        botonOrigen.dataset
                            .transferOrigin;


                    destino =
                        origen === "principal"
                            ? "sucursal"
                            : "principal";


                    cantidad =
                        1;


                    actualizarTransferenciaMobile();

                    return;

                }


                const botonCantidad =
                    evento.target.closest(
                        "[data-transfer-quantity-action]"
                    );


                if(
                    !botonCantidad ||
                    botonCantidad.disabled
                ){

                    return;

                }


                const accion =
                    botonCantidad.dataset
                        .transferQuantityAction;


                const stockOrigen =
                    obtenerStockOrigen();


                if(accion === "plus"){

                    cantidad =
                        Math.min(
                            cantidad + 1,
                            stockOrigen
                        );

                }


                if(accion === "minus"){

                    cantidad =
                        Math.max(
                            1,
                            cantidad - 1
                        );

                }


                actualizarTransferenciaMobile();

            }
        );


    actualizarTransferenciaMobile();

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

    destruirSuscripcionProductosInventarioMobile();

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

    inventarioDesactualizadoMobile =
        false;    

    estadoCatalogo = {

        busqueda:
            "",

        categoria:
            "Todos"

    };

}