// =====================================================
// DIGITAL CENTER M&A
// MOBILE VENTAS VIEW
// FASE M6.4.2 - FLUJO DE COBRO MÓVIL
// =====================================================

import {

    obtenerResumenCarritoMobile,

    suscribirCarritoMobile,

    actualizarCantidadCarritoMobile,

    eliminarProductoCarritoMobile,

    vaciarCarritoMobile,

    obtenerStockSucursalProductoMobile

} from "../services/carrito-mobile-service.js";

import {

    OverlayMobile,
    
    abrirBottomSheet,

    mostrarDialogo,

    mostrarToast

} from "../components/overlay/overlay-mobile.js";

import {

    registrarVentaMobile

} from "../services/checkout-mobile-service.js";

import {

    obtenerTiendaVentaMobile,

    cambiarTiendaVentaMobile,

    obtenerNombreTiendaVentaMobile

} from "../state-mobile.js";

let renderizada =
    false;

let cancelarSuscripcionVentasMobile =
    null;

let contenedorVentasMobile =
    null;

let navegarVentasMobile =
    null;
let accionCarritoEnProceso =
    false;

let checkoutVentasEnProceso =
    false;

let observadorResumenVentasMobile =
    null;

let manejadorResizeVentasMobile =
    null;

// =====================================================
// RENDER PRINCIPAL
// =====================================================

export async function renderVentasMobile(
    contexto
){

    const {

        contenedor,

        navegar

    } = contexto;


    contenedorVentasMobile =
        contenedor;

    navegarVentasMobile =
        navegar;


    if(!renderizada){

    construirEstructuraVentasMobile(
        contenedor
    );

    inicializarEventosVentasMobile(
        contenedor
    );

    inicializarFooterInteligenteVentasMobile(
        contenedor
    );

    inicializarSuscripcionVentasMobile();

    renderizada =
        true;

}


    renderizarCarritoVentasMobile(
        obtenerResumenCarritoMobile()
    );

}


// =====================================================
// ESTRUCTURA
// =====================================================

function construirEstructuraVentasMobile(
    contenedor
){

    contenedor.innerHTML = `
        <div class="mobile-sales">

  <header class="mobile-sales-header mobile-sales-header-premium">

    <div class="mobile-sales-header-copy">

        <span class="mobile-sales-eyebrow">
            VENTA ACTUAL
        </span>

        <div class="mobile-sales-title-row">

            <h1 class="mobile-sales-title">
                Carrito
            </h1>

            <span class="mobile-sales-title-icon">
                🛒
            </span>

        </div>

        <p class="mobile-sales-header-description">
            Revisa productos, cantidades y tienda antes de cobrar.
        </p>

    </div>

    <span
        id="mobileSalesItemsCount"
        class="mobile-sales-count-badge"
    >
        0 productos
    </span>

</header>

             <section class="mobile-sales-store mobile-sales-store-premium">

    <div class="mobile-sales-store-info">

        <div class="mobile-sales-store-copy">

            <span class="mobile-sales-store-eyebrow">
                STOCK DE ORIGEN
            </span>

            <strong id="mobileSalesStoreName">
                Mercado
            </strong>

        </div>

        <span class="mobile-sales-store-icon">
            🏪
        </span>

    </div>

    <div
        class="mobile-sales-store-selector"
        role="group"
        aria-label="Seleccionar tienda de venta"
    >

        <button
            type="button"
            class="mobile-sales-store-button"
            data-mobile-sales-store="principal"
            aria-pressed="false"
        >

            <span class="mobile-sales-store-button-icon">
                🏬
            </span>

            <span class="mobile-sales-store-button-copy">

                <strong>
                    Mercado
                </strong>

                <small>
                    Tienda principal
                </small>

            </span>

        </button>

        <button
            type="button"
            class="mobile-sales-store-button"
            data-mobile-sales-store="sucursal"
            aria-pressed="false"
        >

            <span class="mobile-sales-store-button-icon">
                ✂️
            </span>

            <span class="mobile-sales-store-button-copy">

                <strong>
                    Peluquería
                </strong>

                <small>
                    Tienda secundaria
                </small>

            </span>

        </button>

    </div>

</section>

            <section
                id="mobileSalesContent"
                class="mobile-sales-content"
            ></section>

            <aside
    id="mobileSalesSummary"
    class="mobile-sales-summary mobile-sales-summary-premium"
    hidden
>

    <div class="mobile-sales-summary-top">

        <div class="mobile-sales-summary-stat">

            <span>
                Unidades
            </span>

            <strong id="mobileSalesQuantity">
                0
            </strong>

        </div>

        <div class="mobile-sales-summary-divider"></div>

        <div class="mobile-sales-summary-total">

            <span>
                Total a cobrar
            </span>

            <strong id="mobileSalesTotal">
                S/ 0.00
            </strong>

        </div>

    </div>

    <div class="mobile-sales-actions">

        <button
            type="button"
            class="
                mobile-button
                mobile-sales-clear-button
            "
            data-mobile-clear-cart
        >

            <span aria-hidden="true">
                🧹
            </span>

            <span>
                Vaciar
            </span>

        </button>

        <button
            type="button"
            class="
                mobile-button
                mobile-button-primary
                mobile-sales-checkout
            "
            data-mobile-checkout
        >

            <span>
                Cobrar venta
            </span>

            <span aria-hidden="true">
                →
            </span>

        </button>

    </div>

</aside>

        </div>
    `;

}


// =====================================================
// SUSCRIPCIÓN
// =====================================================

function inicializarSuscripcionVentasMobile(){

    destruirSuscripcionVentasMobile();


    cancelarSuscripcionVentasMobile =
        suscribirCarritoMobile(
            function(resumen){

                renderizarCarritoVentasMobile(
                    resumen
                );

            }
        );

}


function destruirSuscripcionVentasMobile(){

    if(
        typeof cancelarSuscripcionVentasMobile ===
        "function"
    ){

        cancelarSuscripcionVentasMobile();

    }


    cancelarSuscripcionVentasMobile =
        null;

}

// =====================================================
// FOOTER INTELIGENTE
// =====================================================

function inicializarFooterInteligenteVentasMobile(
    contenedor
){

    destruirFooterInteligenteVentasMobile();


    const resumen =
        contenedor.querySelector(
            "#mobileSalesSummary"
        );


    if(
        resumen &&
        typeof ResizeObserver !==
        "undefined"
    ){

        observadorResumenVentasMobile =
            new ResizeObserver(
                function(){

                    actualizarEspacioResumenVentasMobile();

                }
            );


        observadorResumenVentasMobile.observe(
            resumen
        );

    }


    manejadorResizeVentasMobile =
        function(){

            actualizarEspacioResumenVentasMobile();

        };


    window.addEventListener(
        "resize",
        manejadorResizeVentasMobile,
        {
            passive:
                true
        }
    );


    window.visualViewport
        ?.addEventListener(
            "resize",
            manejadorResizeVentasMobile,
            {
                passive:
                    true
            }
        );


    actualizarEspacioResumenVentasMobile();

}


function actualizarEspacioResumenVentasMobile(){

    const raizVentas =
        contenedorVentasMobile
            ?.querySelector(
                ".mobile-sales"
            );


    const resumen =
        contenedorVentasMobile
            ?.querySelector(
                "#mobileSalesSummary"
            );


    if(!raizVentas){

        return;

    }


    const resumenVisible =
        resumen &&
        !resumen.hidden;


    const alturaResumen =
        resumenVisible
            ? Math.ceil(
                resumen.getBoundingClientRect()
                    .height
            )
            : 0;


    raizVentas.style.setProperty(
        "--mobile-sales-summary-height",
        `${alturaResumen}px`
    );


    raizVentas.classList.toggle(
        "has-active-summary",
        alturaResumen > 0
    );

}


function destruirFooterInteligenteVentasMobile(){

    if(observadorResumenVentasMobile){

        observadorResumenVentasMobile.disconnect();

    }


    observadorResumenVentasMobile =
        null;


    if(manejadorResizeVentasMobile){

        window.removeEventListener(
            "resize",
            manejadorResizeVentasMobile
        );


        window.visualViewport
            ?.removeEventListener(
                "resize",
                manejadorResizeVentasMobile
            );

    }


    manejadorResizeVentasMobile =
        null;

}


// =====================================================
// RENDER DEL CARRITO
// =====================================================

function renderizarCarritoVentasMobile(
    resumen
){

    if(!contenedorVentasMobile){

        return;

    }


    const contenido =
        contenedorVentasMobile.querySelector(
            "#mobileSalesContent"
        );

    const contador =
        contenedorVentasMobile.querySelector(
            "#mobileSalesItemsCount"
        );

    const resumenVisual =
        contenedorVentasMobile.querySelector(
            "#mobileSalesSummary"
        );

    const cantidadSalida =
        contenedorVentasMobile.querySelector(
            "#mobileSalesQuantity"
        );

    const totalSalida =
        contenedorVentasMobile.querySelector(
            "#mobileSalesTotal"
        );

    const tiendaNombreSalida =
        contenedorVentasMobile.querySelector(
            "#mobileSalesStoreName"
        );

    const botonesTienda =
        contenedorVentasMobile.querySelectorAll(
            "[data-mobile-sales-store]"
        );    


    const items =
        Array.isArray(
            resumen?.items
        )
            ? resumen.items
            : [];


    const cantidad =
        Number(
            resumen?.cantidad || 0
        );

    const total =
        Number(
            resumen?.total || 0
        );

    const tiendaVenta =
        resumen?.tiendaVenta ||
        obtenerTiendaVentaMobile();

    const nombreTienda =
        resumen?.nombreTienda ||
        obtenerNombreTiendaVentaMobile();    

    if(tiendaNombreSalida){

        tiendaNombreSalida.textContent =
            nombreTienda;

    }


    botonesTienda.forEach(
        function(boton){

            const activa =
                boton.dataset
                    .mobileSalesStore ===
                tiendaVenta;

            boton.classList.toggle(
                "is-active",
                activa
            );

            boton.setAttribute(
                "aria-pressed",
                activa
                    ? "true"
                    : "false"
            );

        }
    );

    if(contador){

        const cantidadProductos =
    items.length;


contador.textContent =
    cantidadProductos === 1
        ? "1 producto"
        : `${cantidadProductos} productos`;

    }


    if(cantidadSalida){

        cantidadSalida.textContent =
            String(cantidad);

    }


    if(totalSalida){

        totalSalida.textContent =
            formatearMonedaVentasMobile(
                total
            );

    }


if(resumenVisual){

    const carritoVacio =
        items.length === 0;


    resumenVisual.hidden =
        carritoVacio;


    resumenVisual.setAttribute(
        "aria-hidden",
        carritoVacio
            ? "true"
            : "false"
    );

}


window.requestAnimationFrame(
    function(){

        actualizarEspacioResumenVentasMobile();

    }
);


    if(!contenido){

        return;

    }


    if(items.length === 0){

        contenido.innerHTML =
            construirEstadoVacioVentasMobile();

        return;

    }


    contenido.innerHTML = `
        <div class="mobile-sales-list">

            ${
                items
                    .map(
                        construirItemVentasMobile
                    )
                    .join("")
            }

        </div>
    `;

}


// =====================================================
// ITEM
// =====================================================

function construirItemVentasMobile(
    item
){

    const cantidad =
        Math.max(
            1,
            Number(
                item.cantidad || 1
            )
        );

    const subtotal =
        Number(item.precio || 0) *
        cantidad;

    const tiendaVenta =
        obtenerTiendaVentaMobile();

    const stockDisponible =
        obtenerStockSucursalProductoMobile(
            item,
            tiendaVenta
        );

    const llegoAlStockMaximo =
        cantidad >= stockDisponible;

    const nombreTienda =
        tiendaVenta === "sucursal"
            ? "Peluquería"
            : "Mercado";


    return `
    <article
        class="mobile-sales-item mobile-sales-item-premium"
        data-cart-product-id="${escaparHTMLVentasMobile(
            item.id
        )}"
    >

        <div class="mobile-sales-item-image">

            ${
                item.imagen
                    ? `
                        <img
                            src="${escaparHTMLVentasMobile(
                                item.imagen
                            )}"
                            alt="${escaparHTMLVentasMobile(
                                item.producto
                            )}"
                            loading="lazy"
                        >
                    `
                    : `
                        <span
                            class="mobile-sales-item-placeholder"
                            aria-hidden="true"
                        >
                            📦
                        </span>
                    `
            }

        </div>

        <div class="mobile-sales-item-info">

            <div class="mobile-sales-item-topline">

                <span class="mobile-sales-item-code">
                    ${escaparHTMLVentasMobile(
                        item.codigo ||
                        "S/C"
                    )}
                </span>

                <span class="mobile-sales-item-category">
                    ${escaparHTMLVentasMobile(
                        item.categoria ||
                        "Sin categoría"
                    )}
                </span>

            </div>

            <h2 class="mobile-sales-item-name">
                ${escaparHTMLVentasMobile(
                    item.producto
                )}
            </h2>

            <div class="mobile-sales-item-pricing">

                <span class="mobile-sales-item-price">
                    ${formatearMonedaVentasMobile(
                        item.precio
                    )}
                </span>

                <small>
                    por unidad
                </small>

            </div>

            <div
                class="
                    mobile-sales-item-stock
                    ${
                        llegoAlStockMaximo
                            ? "is-limit"
                            : ""
                    }
                "
            >

                <span
                    class="mobile-sales-item-stock-dot"
                    aria-hidden="true"
                ></span>

                <span>

                    ${
                        llegoAlStockMaximo
                            ? `Stock máximo alcanzado en ${escaparHTMLVentasMobile(
                                nombreTienda
                            )}`
                            : `${stockDisponible} disponibles en ${escaparHTMLVentasMobile(
                                nombreTienda
                            )}`
                    }

                </span>

            </div>

            <div class="mobile-sales-item-bottom">

                <div
                    class="mobile-sales-quantity"
                    aria-label="Cantidad del producto"
                >

                    <button
                        type="button"
                        class="mobile-sales-quantity-button"
                        data-cart-decrease
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>

                    <div class="mobile-sales-quantity-display">

                        <small>
                            Cantidad
                        </small>

                        <strong
                            class="mobile-sales-quantity-value"
                        >
                            ${cantidad}
                        </strong>

                    </div>

                    <button
                        type="button"
                        class="mobile-sales-quantity-button"
                        data-cart-increase
                        aria-label="Aumentar cantidad"
                        ${
                            llegoAlStockMaximo
                                ? "disabled"
                                : ""
                        }
                    >
                        +
                    </button>

                </div>

                <button
                    type="button"
                    class="mobile-sales-remove-button"
                    data-cart-remove
                    aria-label="Eliminar producto"
                >
                    <span aria-hidden="true">
                        🗑
                    </span>
                </button>

            </div>

        </div>

        <div class="mobile-sales-item-total">

            <small>
                Subtotal
            </small>

            <strong>
                ${formatearMonedaVentasMobile(
                    subtotal
                )}
            </strong>

        </div>

    </article>
`;

}


// =====================================================
// CARRITO VACÍO
// =====================================================

function construirEstadoVacioVentasMobile(){

    const nombreTienda =
        obtenerNombreTiendaVentaMobile();


    return `
        <section class="mobile-sales-empty mobile-sales-empty-premium">

            <div class="mobile-sales-empty-visual">

                <span class="mobile-sales-empty-glow"></span>

                <div class="mobile-sales-empty-icon">
                    🛒
                </div>

            </div>

            <span class="mobile-sales-empty-eyebrow">
                VENTA EN ${escaparHTMLVentasMobile(
                    nombreTienda.toUpperCase()
                )}
            </span>

            <h2>
                Tu carrito está vacío
            </h2>

            <p>
                Agrega productos desde el inventario para comenzar una nueva venta.
            </p>

            <button
                type="button"
                class="
                    mobile-button
                    mobile-button-primary
                    mobile-sales-empty-action
                "
                data-mobile-go-inventory
            >

                <span>
                    Ir al inventario
                </span>

                <span aria-hidden="true">
                    →
                </span>

            </button>

        </section>
    `;

}


// =====================================================
// EVENTOS
// =====================================================

function inicializarEventosVentasMobile(
    contenedor
){

    contenedor.addEventListener(
        "click",
        async function(evento){

            // =====================================================
            // CAMBIAR TIENDA
            // =====================================================

            const botonTienda =
                evento.target.closest(
                    "[data-mobile-sales-store]"
                );


            if(botonTienda){

                if(accionCarritoEnProceso){

                    return;

                }


                accionCarritoEnProceso =
                    true;


                botonTienda.disabled =
                    true;


                vibrarVentasMobile(
                    "tap"
                );


                try{

                    const nuevaTienda =
                        botonTienda.dataset
                            .mobileSalesStore;


                    await cambiarTiendaVentaDesdeVentasMobile(
                        nuevaTienda
                    );

                }finally{

                    accionCarritoEnProceso =
                        false;


                    if(
                        document.body.contains(
                            botonTienda
                        )
                    ){

                        botonTienda.disabled =
                            false;

                    }

                }


                return;

            }


            // =====================================================
            // IR AL INVENTARIO
            // =====================================================

            const irInventario =
                evento.target.closest(
                    "[data-mobile-go-inventory]"
                );


            if(irInventario){

                vibrarVentasMobile(
                    "tap"
                );


                navegarVentasMobile?.(
                    "inventario"
                );


                return;

            }


            // =====================================================
            // PRODUCTO DEL CARRITO
            // =====================================================

            const tarjeta =
                evento.target.closest(
                    "[data-cart-product-id]"
                );


            const productoId =
                tarjeta?.dataset
                    ?.cartProductId;


            // =====================================================
            // DISMINUIR CANTIDAD
            // =====================================================

            const disminuir =
                evento.target.closest(
                    "[data-cart-decrease]"
                );


            if(
                disminuir &&
                productoId
            ){

                const resumen =
                    obtenerResumenCarritoMobile();


                const item =
                    resumen.items.find(
                        function(producto){

                            return (
                                producto.id ===
                                productoId
                            );

                        }
                    );


                if(!item){

                    return;

                }


                /*
                 * Si la cantidad es 1, la acción equivale
                 * a eliminar el producto.
                 */
                if(
                    Number(item.cantidad) <=
                    1
                ){

                    if(accionCarritoEnProceso){

                        return;

                    }


                    accionCarritoEnProceso =
                        true;


                    disminuir.disabled =
                        true;


                    vibrarVentasMobile(
                        "delete"
                    );


                    try{

                        await confirmarEliminarProductoVentasMobile(
                            item
                        );

                    }finally{

                        accionCarritoEnProceso =
                            false;


                        if(
                            document.body.contains(
                                disminuir
                            )
                        ){

                            disminuir.disabled =
                                false;

                        }

                    }


                    return;

                }


                vibrarVentasMobile(
                    "tap"
                );


                const resultado =
                    actualizarCantidadCarritoMobile(
                        productoId,
                        Number(item.cantidad) - 1
                    );


                if(
                    resultado?.operacion?.completada ===
                    true
                ){

                    animarItemCarritoVentasMobile(
                        productoId,
                        "decrease"
                    );

                }


                return;

            }


            // =====================================================
            // AUMENTAR CANTIDAD
            // =====================================================

            const aumentar =
                evento.target.closest(
                    "[data-cart-increase]"
                );


            if(
                aumentar &&
                productoId
            ){

                if(aumentar.disabled){

                    return;

                }


                const resumen =
                    obtenerResumenCarritoMobile();


                const item =
                    resumen.items.find(
                        function(producto){

                            return (
                                producto.id ===
                                productoId
                            );

                        }
                    );


                if(!item){

                    return;

                }


                vibrarVentasMobile(
                    "tap"
                );


                const resultado =
                    actualizarCantidadCarritoMobile(
                        productoId,
                        Number(item.cantidad) + 1
                    );


                if(
                    resultado?.operacion?.completada ===
                    true
                ){

                    animarItemCarritoVentasMobile(
                        productoId,
                        "increase"
                    );

                }


                if(
                    resultado?.operacion?.completada ===
                    false
                ){

                    const stockDisponible =
                        Number(
                            resultado.operacion
                                .stockDisponible || 0
                        );


                    vibrarVentasMobile(
                        "warning"
                    );


                    mostrarToast({

                        tipo:
                            "warning",

                        mensaje:
                            stockDisponible > 0
                                ? `Stock máximo en ${
                                    resultado.operacion.nombreTienda ||
                                    obtenerNombreTiendaVentaMobile()
                                }: ${stockDisponible}.`
                                : `Este producto no tiene stock en ${
                                    resultado.operacion.nombreTienda ||
                                    obtenerNombreTiendaVentaMobile()
                                }.`

                    });

                }


                return;

            }


            // =====================================================
            // ELIMINAR PRODUCTO
            // =====================================================

            const eliminar =
                evento.target.closest(
                    "[data-cart-remove]"
                );


            if(
                eliminar &&
                productoId
            ){

                if(accionCarritoEnProceso){

                    return;

                }


                accionCarritoEnProceso =
                    true;


                eliminar.disabled =
                    true;


                vibrarVentasMobile(
                    "delete"
                );


                try{

                    const resumen =
                        obtenerResumenCarritoMobile();


                    const item =
                        resumen.items.find(
                            function(producto){

                                return (
                                    producto.id ===
                                    productoId
                                );

                            }
                        );


                    if(item){

                        await confirmarEliminarProductoVentasMobile(
                            item
                        );

                    }

                }finally{

                    accionCarritoEnProceso =
                        false;


                    if(
                        document.body.contains(
                            eliminar
                        )
                    ){

                        eliminar.disabled =
                            false;

                    }

                }


                return;

            }


            // =====================================================
            // VACIAR CARRITO
            // =====================================================

            const vaciarVenta =
                evento.target.closest(
                    "[data-mobile-clear-cart]"
                );


            if(vaciarVenta){

                if(accionCarritoEnProceso){

                    return;

                }


                accionCarritoEnProceso =
                    true;


                bloquearBotonVentasMobile(
                    vaciarVenta,
                    true,
                    "Vaciando..."
                );


                vibrarVentasMobile(
                    "warning"
                );


                try{

                    const resumen =
                        obtenerResumenCarritoMobile();


                    if(resumen.items.length === 0){

                        mostrarToast({

                            tipo:
                                "info",

                            mensaje:
                                "El carrito ya está vacío."

                        });


                        return;

                    }


                    const confirmado =
                        await mostrarDialogo({

                            icono:
                                "🧹",

                            titulo:
                                "Vaciar venta",

                            mensaje:
                                "Se eliminarán todos los productos del carrito.",

                            textoCancelar:
                                "Cancelar",

                            textoConfirmar:
                                "Vaciar",

                            peligro:
                                true

                        });


                    if(!confirmado){

                        return;

                    }


                    vaciarCarritoMobile();


                    vibrarVentasMobile(
                        "success"
                    );


                    mostrarToast({

                        tipo:
                            "success",

                        mensaje:
                            "Venta vaciada correctamente."

                    });

                }finally{

                    accionCarritoEnProceso =
                        false;


                    if(
                        document.body.contains(
                            vaciarVenta
                        )
                    ){

                        bloquearBotonVentasMobile(
                            vaciarVenta,
                            false
                        );

                    }

                }


                return;

            }


            // =====================================================
            // ABRIR CHECKOUT
            // =====================================================

            const cobrar =
                evento.target.closest(
                    "[data-mobile-checkout]"
                );


            if(cobrar){

                if(checkoutVentasEnProceso){

                    return;

                }


                vibrarVentasMobile(
                    "tap"
                );


                abrirFlujoCobroVentasMobile();


                return;

            }

        }
    );

}

function animarItemCarritoVentasMobile(
    productoId,
    tipo
){

    window.requestAnimationFrame(
        function(){

            const selectorId =
                CSS.escape(
                    String(
                        productoId || ""
                    )
                );


            const tarjeta =
                contenedorVentasMobile
                    ?.querySelector(
                        `[data-cart-product-id="${selectorId}"]`
                    );


            if(!tarjeta){

                return;

            }

            const rectangulo =
    tarjeta.getBoundingClientRect();


const alturaVentana =
    window.visualViewport
        ?.height ||
    window.innerHeight;


const limiteInferior =
    alturaVentana -
    (
        Number.parseFloat(
            getComputedStyle(
                contenedorVentasMobile
                    .querySelector(
                        ".mobile-sales"
                    )
            )
                .getPropertyValue(
                    "--mobile-sales-summary-height"
                )
        ) || 0
    ) -
    28;


if(rectangulo.bottom > limiteInferior){

    tarjeta.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


            const clase =
                tipo === "decrease"
                    ? "is-decreasing"
                    : "is-increasing";


            tarjeta.classList.remove(
                "is-increasing",
                "is-decreasing"
            );


            void tarjeta.offsetWidth;


            tarjeta.classList.add(
                clase
            );


            window.setTimeout(
                function(){

                    tarjeta.classList.remove(
                        clase
                    );

                },
                260
            );

        }
    );

}

async function cambiarTiendaVentaDesdeVentasMobile(
    nuevaTienda
){

    const tiendaActual =
        obtenerTiendaVentaMobile();


    if(
        nuevaTienda ===
        tiendaActual
    ){

        return;

    }


    const resumen =
        obtenerResumenCarritoMobile();


    if(resumen.items.length > 0){

        const nombreNuevaTienda =
            nuevaTienda === "sucursal"
                ? "Peluquería"
                : "Mercado";


        const confirmado =
            await mostrarDialogo({

                icono:
                    "🏪",

                titulo:
                    "Cambiar tienda de venta",

                mensaje:
                    `Para cambiar a ${nombreNuevaTienda} se vaciará la venta actual. Esto evita descontar productos de dos tiendas en una misma venta.`,

                textoCancelar:
                    "Mantener venta",

                textoConfirmar:
                    "Vaciar y cambiar",

                peligro:
                    true

            });


        if(!confirmado){

            return;

        }


        vaciarCarritoMobile();

    }


    const tiendaSeleccionada =
        cambiarTiendaVentaMobile(
            nuevaTienda
        );


    renderizarCarritoVentasMobile(
        obtenerResumenCarritoMobile()
    );


    mostrarToast({

        tipo:
            "success",

        mensaje:
            tiendaSeleccionada === "sucursal"
                ? "Ahora vendes desde Peluquería."
                : "Ahora vendes desde Mercado."

    });

}

function animarEliminacionItemVentasMobile(
    productoId
){

    return new Promise(
        function(resolve){

            const selectorId =
                CSS.escape(
                    String(
                        productoId || ""
                    )
                );


            const tarjeta =
                contenedorVentasMobile
                    ?.querySelector(
                        `[data-cart-product-id="${selectorId}"]`
                    );


            if(!tarjeta){

                resolve();

                return;

            }


            tarjeta.classList.add(
                "is-removing"
            );


            window.setTimeout(
                resolve,
                240
            );

        }
    );

}

async function confirmarEliminarProductoVentasMobile(
    item
){

    const confirmado =
        await mostrarDialogo({

            icono:
                "🗑️",

            titulo:
                "Eliminar producto",

            mensaje:
                `¿Deseas retirar "${item.producto}" de la venta?`,

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Eliminar",

            peligro:
                true

        });


    if(!confirmado){

        return;

    }

    await animarEliminacionItemVentasMobile(
    item.id
    );

    eliminarProductoCarritoMobile(
        item.id
    );


    mostrarToast({

        tipo:
            "success",

        mensaje:
            "Producto eliminado de la venta."

    });

}

function abrirFlujoCobroVentasMobile(){

    const resumen =
        obtenerResumenCarritoMobile();


    if(
        !Array.isArray(resumen.items) ||
        resumen.items.length === 0
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "Agrega productos antes de cobrar."

        });

        return;

    }


    const sheet =
        abrirBottomSheet({

            eyebrow:
                "DIGITAL CENTER M&A",

            titulo:
                "Cobrar venta",

            descripcion:
    `${resumen.cantidad} unidades · ${formatearMonedaVentasMobile(
        resumen.total
    )} · ${resumen.nombreTienda}`,

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "",

            contenido:
                construirMetodosPagoVentasMobile(
                    resumen
                )

        });


    sheet.portal.addEventListener(
        "click",
        function(evento){

            const botonMetodo =
                evento.target.closest(
                    "[data-mobile-payment-method]"
                );


            if(!botonMetodo){

                return;

            }


            const metodo =
                botonMetodo.dataset
                    .mobilePaymentMethod;


            manejarMetodoPagoVentasMobile(
                metodo
            );

        }
    );

}

function manejarMetodoPagoVentasMobile(
    metodo
){

    if(metodo === "efectivo"){

        abrirCobroEfectivoVentasMobile();

        return;

    }


    if(metodo === "mixto"){

        mostrarToast({

            tipo:
                "info",

            mensaje:
                "El pago mixto se implementará en el siguiente bloque."

        });

        return;

    }


    if(
        [
            "yape",
            "plin",
            "tarjeta",
            "transferencia"
        ].includes(
            metodo
        )
    ){

        confirmarPagoDigitalVentasMobile(
            metodo
        );

        return;

    }


    mostrarToast({

        tipo:
            "warning",

        mensaje:
            "Método de pago no reconocido."

    });

}

async function confirmarPagoDigitalVentasMobile(
    metodo
){

    if(checkoutVentasEnProceso){

    return false;

}

    const resumen =
        obtenerResumenCarritoMobile();


    if(
        !Array.isArray(
            resumen.items
        ) ||
        resumen.items.length === 0
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "La venta ya no tiene productos."

        });

        return false;

    }


    const nombreMetodo =
        obtenerNombreMetodoPagoVentasMobile(
            metodo
        );


    const confirmado =
        await mostrarDialogo({

            icono:
                obtenerIconoMetodoPagoVentasMobile(
                    metodo
                ),

            titulo:
                `Confirmar pago con ${nombreMetodo}`,

            mensaje:
    `Total: ${formatearMonedaVentasMobile(
        resumen.total
    )} · Tienda: ${resumen.nombreTienda}`,

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Confirmar pago",

            peligro:
                false

        });


    if(!confirmado){

        return false;

    }

    checkoutVentasEnProceso =
    true;


const botonMetodo =
    document.querySelector(
        `[data-mobile-payment-method="${CSS.escape(
            metodo
        )}"]`
    );


bloquearBotonVentasMobile(
    botonMetodo,
    true,
    "Procesando..."
);


    try{

    const resultado =
        await registrarVentaMobile({

            metodoPago:
                metodo,

            recibido:
                resumen.total,

            vuelto:
                0

        });


    if(
        resultado?.completada !==
        true
    ){

        vibrarVentasMobile(
            "warning"
        );


        mostrarToast({

            tipo:
                "danger",

            duracion:
                4200,

            mensaje:
                resultado?.mensaje ||
                "No se pudo registrar la venta."

        });

        return false;

    }


    vaciarCarritoMobile();


    OverlayMobile.close();


    vibrarVentasMobile(
        "success"
    );


    mostrarToast({

        tipo:
            "success",

        duracion:
            4200,

        mensaje:
            `Venta registrada con ${nombreMetodo}.`

    });


    return true;

}finally{

    checkoutVentasEnProceso =
        false;


    if(
        botonMetodo &&
        document.body.contains(
            botonMetodo
        )
    ){

        bloquearBotonVentasMobile(
            botonMetodo,
            false
        );

    }

}


    if(
        resultado?.completada !==
        true
    ){

        mostrarToast({

            tipo:
                "danger",

            duracion:
                4200,

            mensaje:
                resultado?.mensaje ||
                "No se pudo registrar la venta."

        });

        return false;

    }


    vaciarCarritoMobile();


    OverlayMobile.close();


    mostrarToast({

        tipo:
            "success",

        duracion:
            4200,

        mensaje:
            `Venta registrada con ${nombreMetodo}.`

    });


    return true;

}

function abrirCobroEfectivoVentasMobile(){

    const resumen =
        obtenerResumenCarritoMobile();


    if(
        !resumen.items.length ||
        resumen.total <= 0
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "La venta ya no tiene productos."

        });

        return;

    }


    const sheet =
        abrirBottomSheet({

            eyebrow:
                "COBRO MÓVIL",

            titulo:
                "Pago en efectivo",

            descripcion:
    `Total: ${formatearMonedaVentasMobile(
        resumen.total
    )} · Tienda: ${resumen.nombreTienda}`,

            textoCancelar:
                "Volver",

            textoConfirmar:
                "",

            contenido:
                construirCobroEfectivoVentasMobile(
                    resumen
                )

        });


    inicializarTecladoEfectivoVentasMobile({

        portal:
            sheet.portal,

        total:
            Number(
                resumen.total || 0
            )

    });

}

function construirCobroEfectivoVentasMobile(
    resumen
){

    return `
        <section
            class="mobile-cash-checkout"
            data-cash-checkout
        >

            <div class="mobile-cash-total">

                <span>
                    Total a cobrar
                </span>

                <strong>
                    ${formatearMonedaVentasMobile(
                        resumen.total
                    )}
                </strong>

            </div>

            <div class="mobile-cash-display">

                <span>
                    Monto recibido
                </span>

                <strong
                    data-cash-received
                    aria-live="polite"
                >
                    S/ 0.00
                </strong>

            </div>

            <div class="mobile-cash-change">

                <span>
                    Vuelto
                </span>

                <strong
                    data-cash-change
                    aria-live="polite"
                >
                    S/ 0.00
                </strong>

            </div>

            <div class="mobile-cash-quick">

    <button
        type="button"
        class="mobile-cash-quick-button is-exact"
        data-cash-quick="exacto"
    >
        Exacto
    </button>

    <button
        type="button"
        class="mobile-cash-quick-button"
        data-cash-quick="20"
    >
        S/ 20
    </button>

    <button
        type="button"
        class="mobile-cash-quick-button"
        data-cash-quick="50"
    >
        S/ 50
    </button>

    <button
        type="button"
        class="mobile-cash-quick-button"
        data-cash-quick="100"
    >
        S/ 100
    </button>

</div>

            <div
                class="mobile-cash-keypad"
                aria-label="Teclado numérico"
            >

                ${construirTeclaEfectivoVentasMobile("7")}
                ${construirTeclaEfectivoVentasMobile("8")}
                ${construirTeclaEfectivoVentasMobile("9")}

                ${construirTeclaEfectivoVentasMobile("4")}
                ${construirTeclaEfectivoVentasMobile("5")}
                ${construirTeclaEfectivoVentasMobile("6")}

                ${construirTeclaEfectivoVentasMobile("1")}
                ${construirTeclaEfectivoVentasMobile("2")}
                ${construirTeclaEfectivoVentasMobile("3")}

                ${construirTeclaEfectivoVentasMobile(
                    "limpiar",
                    "C"
                )}

                ${construirTeclaEfectivoVentasMobile("0")}

                ${construirTeclaEfectivoVentasMobile(
                    "borrar",
                    "⌫"
                )}

            </div>

            <button
                type="button"
                class="
                    mobile-button
                    mobile-button-primary
                    mobile-cash-confirm
                "
                data-cash-confirm
                disabled
            >
                Confirmar pago
            </button>

        </section>
    `;

}

function construirTeclaEfectivoVentasMobile(
    valor,
    etiqueta =
        valor
){

    return `
        <button
            type="button"
            class="mobile-cash-key"
            data-cash-key="${escaparHTMLVentasMobile(
                valor
            )}"
        >
            ${escaparHTMLVentasMobile(
                etiqueta
            )}
        </button>
    `;

}

function inicializarTecladoEfectivoVentasMobile(
    opciones
){

    const {

        portal,

        total

    } = opciones;


    let centimosRecibidos =
        0;


    const salidaRecibido =
        portal.querySelector(
            "[data-cash-received]"
        );

    const salidaVuelto =
        portal.querySelector(
            "[data-cash-change]"
        );

    const botonConfirmar =
        portal.querySelector(
            "[data-cash-confirm]"
        );


    function actualizarPantalla(){

        const recibido =
            centimosRecibidos /
            100;

        const vuelto =
            Math.max(
                0,
                recibido - total
            );


        if(salidaRecibido){

            salidaRecibido.textContent =
                formatearMonedaVentasMobile(
                    recibido
                );

        }


        if(salidaVuelto){

            salidaVuelto.textContent =
                formatearMonedaVentasMobile(
                    vuelto
                );

            salidaVuelto.classList.toggle(
                "is-ready",
                recibido >= total
            );

        }


        if(botonConfirmar){

            botonConfirmar.disabled =
                recibido < total ||
                checkoutVentasEnProceso;

        }


        portal
            .querySelectorAll(
                "[data-cash-quick]"
            )
            .forEach(function(boton){

                const valor =
                    boton.dataset.cashQuick;

                const montoBoton =
                    valor === "exacto"
                        ? total
                        : Number(
                            valor || 0
                        );


                const seleccionado =
                    Math.abs(
                        recibido -
                        montoBoton
                    ) < 0.001;


                boton.classList.toggle(
                    "is-selected",
                    seleccionado
                );

                boton.setAttribute(
                    "aria-pressed",
                    seleccionado
                        ? "true"
                        : "false"
                );

            });

    }


    portal.addEventListener(
        "click",
        function(evento){

            const botonRapido =
                evento.target.closest(
                    "[data-cash-quick]"
                );


            if(botonRapido){

                if(checkoutVentasEnProceso){

                    return;

                }


                vibrarVentasMobile(
                    "tap"
                );


                const valorRapido =
                    botonRapido.dataset
                        .cashQuick;


                if(valorRapido === "exacto"){

                    centimosRecibidos =
                        Math.round(
                            total * 100
                        );

                }else{

                    const montoRapido =
                        Number(
                            valorRapido || 0
                        );


                    if(
                        !Number.isFinite(
                            montoRapido
                        ) ||
                        montoRapido <= 0
                    ){

                        return;

                    }


                    centimosRecibidos =
                        Math.round(
                            montoRapido * 100
                        );

                }


                actualizarPantalla();

                return;

            }


            const tecla =
                evento.target.closest(
                    "[data-cash-key]"
                );


            if(!tecla){

                return;

            }


            if(checkoutVentasEnProceso){

                return;

            }


            const valor =
                tecla.dataset.cashKey;


            vibrarVentasMobile(
                "tap"
            );


            if(valor === "limpiar"){

                centimosRecibidos =
                    0;

                actualizarPantalla();

                return;

            }


            if(valor === "borrar"){

                centimosRecibidos =
                    Math.trunc(
                        centimosRecibidos /
                        10
                    );

                actualizarPantalla();

                return;

            }


            if(!/^\d$/.test(valor)){

                return;

            }


            const siguienteValor =
                Number(
                    String(
                        centimosRecibidos
                    ) + valor
                );


            if(
                siguienteValor >
                99999999
            ){

                vibrarVentasMobile(
                    "warning"
                );


                mostrarToast({

                    tipo:
                        "warning",

                    mensaje:
                        "El monto ingresado es demasiado alto."

                });

                return;

            }


            centimosRecibidos =
                siguienteValor;

            actualizarPantalla();

        }
    );


    botonConfirmar?.addEventListener(
        "click",
        async function(){

            if(checkoutVentasEnProceso){

                return;

            }


            const recibido =
                centimosRecibidos /
                100;

            const vuelto =
                Math.max(
                    0,
                    recibido - total
                );


            if(recibido < total){

                vibrarVentasMobile(
                    "warning"
                );


                mostrarToast({

                    tipo:
                        "warning",

                    mensaje:
                        "El monto recibido no cubre el total de la venta."

                });

                return;

            }


            checkoutVentasEnProceso =
                true;


            bloquearBotonVentasMobile(
                botonConfirmar,
                true,
                "Registrando..."
            );


            vibrarVentasMobile(
                "tap"
            );


            try{

                await confirmarCobroEfectivoVentasMobile({

                    total,

                    recibido,

                    vuelto

                });

            }finally{

                checkoutVentasEnProceso =
                    false;


                if(
                    document.body.contains(
                        botonConfirmar
                    )
                ){

                    bloquearBotonVentasMobile(
                        botonConfirmar,
                        false
                    );


                    const recibidoActual =
                        centimosRecibidos /
                        100;


                    botonConfirmar.disabled =
                        recibidoActual < total;

                }

            }

        }
    );


    actualizarPantalla();

}

async function confirmarCobroEfectivoVentasMobile(
    datos
){

    const {

        total,

        recibido,

        vuelto

    } = datos;


    const resumenActual =
        obtenerResumenCarritoMobile();


    if(
        !Array.isArray(
            resumenActual.items
        ) ||
        resumenActual.items.length === 0
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "La venta ya no tiene productos."

        });

        return false;

    }


    const totalActual =
        Number(
            resumenActual.total || 0
        );


    if(
        Math.abs(
            totalActual -
            Number(total || 0)
        ) > 0.001
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El total de la venta cambió. Revisa nuevamente el cobro."

        });

        return false;

    }


    const confirmado =
        await mostrarDialogo({

            icono:
                "💵",

            titulo:
                "Confirmar pago en efectivo",

            mensaje:
                construirMensajeConfirmacionEfectivoVentasMobile({

                    total:
                        totalActual,

                    recibido,

                    vuelto

                }),

            textoCancelar:
                "Volver",

            textoConfirmar:
                "Confirmar",

            peligro:
                false

        });


    if(!confirmado){

        return false;

    }

  const resultado =
    await registrarVentaMobile({

        metodoPago:
            "efectivo",

        recibido,

        vuelto

    });


if(
    !resultado.completada
){

    vibrarVentasMobile(
    "warning"
);

    mostrarToast({

        tipo:
            "danger",

        duracion:
            4200,

        mensaje:
            resultado.mensaje ||
            "No se pudo registrar la venta."

    });

    return false;

}


vaciarCarritoMobile();


OverlayMobile.close();

vibrarVentasMobile(
    "success"
);

mostrarToast({

    tipo:
        "success",

    duracion:
        4200,

    mensaje:
        "Venta registrada correctamente."

});


return true;

}

function construirMensajeConfirmacionEfectivoVentasMobile(
    datos
){

    const {

        total,

        recibido,

        vuelto

    } = datos;

    const resumen =
    obtenerResumenCarritoMobile();


    return [
        `Total: ${formatearMonedaVentasMobile(
            total
        )}`,

        `Recibido: ${formatearMonedaVentasMobile(
            recibido
        )}`,

        `Vuelto: ${formatearMonedaVentasMobile(
            vuelto
        )}`

    ].join(" · ");

}

function construirMetodosPagoVentasMobile(
    resumen
){

    return `
        <section class="mobile-checkout">

            <div class="mobile-checkout-total">

                <span>
                    Total a cobrar
                </span>

                <strong>
                    ${formatearMonedaVentasMobile(
                        resumen.total
                    )}
                </strong>

            </div>

            <div class="mobile-checkout-methods">

                ${construirMetodoPagoVentasMobile({
                    id:
                        "efectivo",

                    icono:
                        "💵",

                    nombre:
                        "Efectivo",

                    descripcion:
                        "Pago en efectivo"
                })}

                ${construirMetodoPagoVentasMobile({
                    id:
                        "yape",

                    icono:
                        "📱",

                    nombre:
                        "Yape",

                    descripcion:
                        "Pago mediante Yape"
                })}

                ${construirMetodoPagoVentasMobile({
                    id:
                        "plin",

                    icono:
                        "📲",

                    nombre:
                        "Plin",

                    descripcion:
                        "Pago mediante Plin"
                })}

                ${construirMetodoPagoVentasMobile({
                    id:
                        "tarjeta",

                    icono:
                        "💳",

                    nombre:
                        "Tarjeta",

                    descripcion:
                        "Débito o crédito"
                })}

                ${construirMetodoPagoVentasMobile({
                    id:
                        "transferencia",

                    icono:
                        "🏦",

                    nombre:
                        "Transferencia",

                    descripcion:
                        "Transferencia bancaria"
                })}

                ${construirMetodoPagoVentasMobile({
                    id:
                        "mixto",

                    icono:
                        "🔀",

                    nombre:
                        "Pago mixto",

                    descripcion:
                        "Combinar varios métodos"
                })}

            </div>

        </section>
    `;

}

function construirMetodoPagoVentasMobile(
    opciones
){

    const {

        id,

        icono,

        nombre,

        descripcion

    } = opciones;


    return `
        <button
            type="button"
            class="mobile-checkout-method"
            data-mobile-payment-method="${escaparHTMLVentasMobile(
                id
            )}"
            aria-busy="false"
        >

            <span class="mobile-checkout-method-icon">
                ${icono}
            </span>

            <span class="mobile-checkout-method-copy">

                <strong>
                    ${escaparHTMLVentasMobile(
                        nombre
                    )}
                </strong>

                <small>
                    ${escaparHTMLVentasMobile(
                        descripcion
                    )}
                </small>

            </span>

            <span class="mobile-checkout-method-arrow">
                ›
            </span>

        </button>
    `;

}

function obtenerIconoMetodoPagoVentasMobile(
    metodo
){

    const iconos = {

        efectivo:
            "💵",

        yape:
            "📱",

        plin:
            "📲",

        tarjeta:
            "💳",

        transferencia:
            "🏦",

        mixto:
            "🔀"

    };


    return iconos[metodo] ||
        "💰";

}

function obtenerNombreMetodoPagoVentasMobile(
    metodo
){

    const nombres = {

        efectivo:
            "Efectivo",

        yape:
            "Yape",

        plin:
            "Plin",

        tarjeta:
            "Tarjeta",

        transferencia:
            "Transferencia",

        mixto:
            "Pago mixto"

    };


    return nombres[metodo] ||
        "Método de pago";

}

// =====================================================
// FEEDBACK TÁCTIL
// =====================================================

function vibrarVentasMobile(
    tipo =
        "tap"
){

    if(
        typeof navigator.vibrate !==
        "function"
    ){

        return;

    }


    const patrones = {

        tap:
            12,

        success:
            [18, 35, 22],

        warning:
            [28, 45, 28],

        delete:
            [20, 30, 45]

    };


    try{

        navigator.vibrate(
            patrones[tipo] ||
            patrones.tap
        );

    }catch(error){

        console.warn(
            "No se pudo ejecutar vibración:",
            error
        );

    }

}


function bloquearBotonVentasMobile(
    boton,
    bloqueado,
    textoLoading =
        "Procesando..."
){

    if(!boton){

        return;

    }


    if(bloqueado){

        if(
            !boton.dataset
                .textoOriginal
        ){

            boton.dataset.textoOriginal =
                boton.innerHTML;

        }


        boton.disabled =
            true;

        boton.classList.add(
            "is-loading"
        );

        boton.setAttribute(
            "aria-busy",
            "true"
        );


        boton.innerHTML = `
            <span
                class="mobile-sales-button-spinner"
                aria-hidden="true"
            ></span>

            <span>
                ${escaparHTMLVentasMobile(
                    textoLoading
                )}
            </span>
        `;

        return;

    }


    boton.disabled =
        false;

    boton.classList.remove(
        "is-loading"
    );

    boton.removeAttribute(
        "aria-busy"
    );


    if(
        boton.dataset
            .textoOriginal
    ){

        boton.innerHTML =
            boton.dataset
                .textoOriginal;

        delete boton.dataset
            .textoOriginal;

    }

}

// =====================================================
// UTILIDADES
// =====================================================

function formatearMonedaVentasMobile(
    valor
){

    return "S/ " +
        Number(valor || 0)
            .toFixed(2);

}


function escaparHTMLVentasMobile(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// REINICIO
// =====================================================

export function reiniciarVentasMobile(){

    destruirSuscripcionVentasMobile();

    destruirFooterInteligenteVentasMobile();


    renderizada =
        false;

    contenedorVentasMobile =
        null;

    navegarVentasMobile =
        null;

    accionCarritoEnProceso =
        false;

    checkoutVentasEnProceso =
        false;

}