// =====================================================
// DIGITAL CENTER M&A
// MOBILE VENTAS VIEW
// FASE M6.4.2 - FLUJO DE COBRO MÓVIL
// =====================================================

import {

    obtenerResumenCarritoMobile,

    suscribirCarritoMobile,

    actualizarCantidadCarritoMobile,

    actualizarNombreBoletaCarritoMobile,

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

    construirHTMLBoletaMobile,
    construirHTMLReimpresionBoletaMobile,
    imprimirHTMLBoletaMobile

} from "../services/boleta-mobile-service.js?v=M12-5-3";

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

let seleccionMetodoPagoEnProceso =
    false;

let observadorResumenVentasMobile =
    null;

let manejadorResizeVentasMobile =
    null;

let descuentoCheckoutVentasMobile =
    0;

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

<div class="mobile-sales-receipt-name">

    <label
        class="mobile-sales-receipt-name-label"
        for="mobileReceiptName-${escaparHTMLVentasMobile(
            item.id
        )}"
    >
        Nombre para boleta
    </label>

    <div class="mobile-sales-receipt-name-control">

        <span
            class="mobile-sales-receipt-name-icon"
            aria-hidden="true"
        >
            ✎
        </span>

        <input
            type="text"
            id="mobileReceiptName-${escaparHTMLVentasMobile(
                item.id
            )}"
            class="mobile-sales-receipt-name-input"
            data-cart-receipt-name
            value="${escaparHTMLVentasMobile(
                item.nombreBoleta || ""
            )}"
            placeholder="${escaparHTMLVentasMobile(
                item.producto
            )}"
            maxlength="120"
            autocomplete="off"
            spellcheck="false"
            aria-label="Nombre personalizado para la boleta"
        >

    </div>

    <small class="mobile-sales-receipt-name-help">
        Solo cambia el nombre de esta venta.
    </small>

</div>

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

contenedor.addEventListener(
    "change",
    function(evento){

        const inputNombreBoleta =
            evento.target.closest(
                "[data-cart-receipt-name]"
            );


        if(!inputNombreBoleta){

            return;

        }


        const tarjeta =
            inputNombreBoleta.closest(
                "[data-cart-product-id]"
            );


        const productoId =
            tarjeta?.dataset
                ?.cartProductId;


        if(!productoId){

            return;

        }


        const resultado =
            actualizarNombreBoletaCarritoMobile(
                productoId,
                inputNombreBoleta.value
            );


        if(
            resultado?.operacion?.completada !==
            true
        ){

            mostrarToast({

                tipo:
                    "warning",

                mensaje:
                    "No se pudo actualizar el nombre para la boleta."

            });

            return;

        }


        vibrarVentasMobile(
            "tap"
        );


        mostrarToast({

            tipo:
                "success",

            mensaje:
                resultado.operacion.nombreBoleta
                    ? "Nombre para boleta actualizado."
                    : "Se usará el nombre original del producto."

        });

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


inicializarDescuentoCheckoutMobile(
    sheet.portal,
    resumen
);


    sheet.portal.addEventListener(
    "click",
    async function(evento){

        const botonMetodo =
            evento.target.closest(
                "[data-mobile-payment-method]"
            );


        if(
            !botonMetodo ||
            botonMetodo.disabled
        ){

            return;

        }


        if(
            seleccionMetodoPagoEnProceso ||
            checkoutVentasEnProceso
        ){

            return;

        }


        const metodo =
            botonMetodo.dataset
                .mobilePaymentMethod;


        seleccionMetodoPagoEnProceso =
            true;


        marcarMetodoPagoSeleccionadoVentasMobile({

            portal:
                sheet.portal,

            botonSeleccionado:
                botonMetodo,

            bloqueado:
                true

        });


        vibrarVentasMobile(
            "tap"
        );


        try{

            await manejarMetodoPagoVentasMobile(
                metodo
            );

        }finally{

            seleccionMetodoPagoEnProceso =
                false;


            if(
                document.body.contains(
                    sheet.portal
                )
            ){

                marcarMetodoPagoSeleccionadoVentasMobile({

                    portal:
                        sheet.portal,

                    botonSeleccionado:
                        null,

                    bloqueado:
                        false

                });

            }

        }

    }
);

}

function inicializarDescuentoCheckoutMobile(
    portal,
    resumen
){

    const input =
        portal.querySelector(
            "#mobileCheckoutDiscount"
        );

    const salidaTotal =
        portal.querySelector(
            "#mobileCheckoutTotal"
        );

    if(
        !input ||
        !salidaTotal
    ){
        return;
    }

    const subtotal =
        redondearMontoVentasMobile(
            resumen.total
        );

    descuentoCheckoutVentasMobile = 0;

    input.addEventListener(
        "input",
        function(){

            let descuento =
                Number(
                    input.value || 0
                );

            if(
                !Number.isFinite(
                    descuento
                )
            ){
                descuento = 0;
            }

            descuento =
                Math.max(
                    0,
                    Math.min(
                        subtotal,
                        descuento
                    )
                );

            descuentoCheckoutVentasMobile =
                redondearMontoVentasMobile(
                    descuento
                );

            const total =
                redondearMontoVentasMobile(
                    subtotal -
                    descuentoCheckoutVentasMobile
                );

            salidaTotal.textContent =
                formatearMonedaVentasMobile(
                    total
                );

        }

    );

}

function obtenerDescuentoCheckoutMobile(){

    return redondearMontoVentasMobile(
        descuentoCheckoutVentasMobile
    );

}

function marcarMetodoPagoSeleccionadoVentasMobile(
    opciones
){

    const {

        portal,

        botonSeleccionado,

        bloqueado

    } = opciones;


    if(!portal){

        return;

    }


    portal
        .querySelectorAll(
            "[data-mobile-payment-method]"
        )
        .forEach(function(boton){

            const seleccionado =
                boton ===
                botonSeleccionado;


            boton.classList.toggle(
                "is-selected",
                seleccionado
            );


            boton.classList.toggle(
                "is-muted",
                bloqueado &&
                !seleccionado
            );


            boton.setAttribute(
                "aria-pressed",
                seleccionado
                    ? "true"
                    : "false"
            );


            /*
             * No deshabilitamos Pago Mixto de forma
             * permanente porque conserva su toast.
             */
            boton.disabled =
                Boolean(
                    bloqueado &&
                    !seleccionado
                );

        });

}

async function manejarMetodoPagoVentasMobile(
    metodo
){

    if(metodo === "efectivo"){

        abrirCobroEfectivoVentasMobile();

        return true;

    }


if(metodo === "mixto"){

    abrirPagoMixtoVentasMobile();

    return true;

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

        return await confirmarPagoDigitalVentasMobile(
            metodo
        );

    }


    vibrarVentasMobile(
        "warning"
    );


    mostrarToast({

        tipo:
            "warning",

        mensaje:
            "Método de pago no reconocido."

    });


    return false;

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

        vibrarVentasMobile(
            "warning"
        );


        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "La venta ya no tiene productos."

        });


        return false;

    }


    const subtotal =
        redondearMontoVentasMobile(
            Number(
                resumen.total || 0
            )
        );


    const descuento =
        Math.min(
            subtotal,
            Math.max(
                0,
                obtenerDescuentoCheckoutMobile()
            )
        );


    const totalFinal =
        redondearMontoVentasMobile(
            subtotal -
            descuento
        );


    if(totalFinal <= 0){

        vibrarVentasMobile(
            "warning"
        );


        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El descuento no puede cubrir el total completo de la venta."

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
                    totalFinal
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

                descuento,

                recibido:
                    totalFinal,

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


        const venta =
            resultado.venta;


        vaciarCarritoMobile();

        descuentoCheckoutVentasMobile =
            0;

        OverlayMobile.close();


        await mostrarVentaFinalizadaMobile(
            venta
        );


        vibrarVentasMobile(
            "success"
        );


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

}

// =====================================================
// PAGO MIXTO ENTERPRISE
// =====================================================

function abrirPagoMixtoVentasMobile(){

    const resumen =
        obtenerResumenCarritoMobile();


    if(
        !Array.isArray(
            resumen.items
        ) ||
        resumen.items.length === 0 ||
        Number(resumen.total || 0) <= 0
    ){

        vibrarVentasMobile(
            "warning"
        );


        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "La venta ya no tiene productos."

        });


        return;

    }


    const descuento =
        obtenerDescuentoCheckoutMobile();


    const totalFinal =
        redondearMontoVentasMobile(
            Number(resumen.total || 0) -
            descuento
        );


    if(totalFinal <= 0){

        vibrarVentasMobile(
            "warning"
        );


        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El descuento no puede cubrir el total completo de la venta."

        });


        return;

    }


    const resumenPagoMixto = {

        ...resumen,

        total:
            totalFinal,

        descuento

    };


    const sheet =
        abrirBottomSheet({

            eyebrow:
                "COBRO MÓVIL",

            titulo:
                "Pago mixto",

            descripcion:
                `Distribuye ${formatearMonedaVentasMobile(
                    totalFinal
                )} entre dos o más métodos.`,

            textoCancelar:
                "Volver",

            textoConfirmar:
                "",

            contenido:
                construirPagoMixtoVentasMobile(
                    resumenPagoMixto
                )

        });


    inicializarPagoMixtoVentasMobile({

        portal:
            sheet.portal,

        total:
            totalFinal

    });

}

function construirPagoMixtoVentasMobile(
    resumen
){

    const nombreTienda =
        resumen?.nombreTienda ||
        obtenerNombreTiendaVentaMobile();


    const metodos = [

        {
            id:
                "efectivo",

            nombre:
                "Efectivo",

            icono:
                "/efectivo.png"
        },

        {
            id:
                "yape",

            nombre:
                "Yape",

            icono:
                "/yape.png"
        },

        {
            id:
                "plin",

            nombre:
                "Plin",

            icono:
                "/plin.png"
        },

        {
            id:
                "tarjeta",

            nombre:
                "Tarjeta",

            icono:
                "/tarjeta.png"
        },

        {
            id:
                "transferencia",

            nombre:
                "Transferencia",

            icono:
                "/transferencia.png"
        }

    ];


    return `
        <section
            class="
                mobile-mixed-payment
                mobile-mixed-payment-premium
            "
            data-mixed-payment
        >

            <header class="mobile-mixed-header">

                <span class="mobile-mixed-eyebrow">
                    DISTRIBUCIÓN DEL PAGO
                </span>

                <div class="mobile-mixed-total-card">

                    <div>

                        <span>
                            Total de la venta
                        </span>

                        <strong>
                            ${formatearMonedaVentasMobile(
                                resumen.total
                            )}
                        </strong>

                    </div>

                    <span
                        class="mobile-mixed-total-icon"
                        aria-hidden="true"
                    >
                        🔀
                    </span>

                </div>

                <div class="mobile-mixed-meta">

                    <span>
                        🏪
                        ${escaparHTMLVentasMobile(
                            nombreTienda
                        )}
                    </span>

                    <span>
                        🛒
                        ${Number(
                            resumen.cantidad || 0
                        )} unidades
                    </span>

                </div>

            </header>


            <section class="mobile-mixed-section">

                <div class="mobile-mixed-section-header">

                    <div>

                        <span>
                            MÉTODOS DE PAGO
                        </span>

                        <strong>
                            Ingresa los montos utilizados
                        </strong>

                    </div>

                    <span aria-hidden="true">
                        💳
                    </span>

                </div>


                <div class="mobile-mixed-methods">

                    ${
                        metodos
                            .map(
                                construirMetodoPagoMixtoVentasMobile
                            )
                            .join("")
                    }

                </div>

            </section>


            <section class="mobile-mixed-summary">

                <div class="mobile-mixed-summary-row">

                    <span>
                        Total ingresado
                    </span>

                    <strong
                        data-mixed-paid
                        aria-live="polite"
                    >
                        S/ 0.00
                    </strong>

                </div>


                <div
                    class="
                        mobile-mixed-summary-row
                        is-remaining
                    "
                    data-mixed-remaining-row
                >

                    <span data-mixed-remaining-label>
                        Falta por pagar
                    </span>

                    <strong
                        data-mixed-remaining
                        aria-live="polite"
                    >
                        ${formatearMonedaVentasMobile(
                            resumen.total
                        )}
                    </strong>

                </div>


                <div
                    class="mobile-mixed-status"
                    data-mixed-status
                    aria-live="polite"
                >

                    <span
                        class="mobile-mixed-status-dot"
                        aria-hidden="true"
                    ></span>

                    <span data-mixed-status-text>
                        Usa por lo menos dos métodos de pago.
                    </span>

                </div>

            </section>


            <button
                type="button"
                class="
                    mobile-button
                    mobile-button-primary
                    mobile-mixed-confirm
                "
                data-mixed-confirm
                disabled
            >

                <span>
                    Confirmar pago mixto
                </span>

                <span aria-hidden="true">
                    →
                </span>

            </button>

        </section>
    `;

}

function construirMetodoPagoMixtoVentasMobile(
    metodo
){

    return `
        <label
            class="mobile-mixed-method"
            data-mixed-method-row="${escaparHTMLVentasMobile(
                metodo.id
            )}"
        >

            <span class="mobile-mixed-method-icon">

                <img
                    src="${escaparHTMLVentasMobile(
                        metodo.icono
                    )}"
                    alt="${escaparHTMLVentasMobile(
                        metodo.nombre
                    )}"
                    class="mobile-mixed-method-image"
                >

            </span>


            <span class="mobile-mixed-method-copy">

                <strong>
                    ${escaparHTMLVentasMobile(
                        metodo.nombre
                    )}
                </strong>

                <small>
                    Ingresa el importe
                </small>

            </span>


            <span class="mobile-mixed-method-input-wrap">

                <span>
                    S/
                </span>

                <input
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="0.01"
                    value=""
                    placeholder="0.00"
                    autocomplete="off"
                    data-mixed-payment-input="${escaparHTMLVentasMobile(
                        metodo.id
                    )}"
                    aria-label="Monto pagado con ${escaparHTMLVentasMobile(
                        metodo.nombre
                    )}"
                >

            </span>

        </label>
    `;

}

function inicializarPagoMixtoVentasMobile(
    opciones
){

    const {

        portal,

        total

    } = opciones;


    const totalVenta =
        redondearMontoVentasMobile(
            total
        );


    const entradas =
        Array.from(
            portal.querySelectorAll(
                "[data-mixed-payment-input]"
            )
        );


    const salidaPagado =
        portal.querySelector(
            "[data-mixed-paid]"
        );


    const salidaRestante =
        portal.querySelector(
            "[data-mixed-remaining]"
        );


    const etiquetaRestante =
        portal.querySelector(
            "[data-mixed-remaining-label]"
        );


    const filaRestante =
        portal.querySelector(
            "[data-mixed-remaining-row]"
        );


    const estado =
        portal.querySelector(
            "[data-mixed-status]"
        );


    const textoEstado =
        portal.querySelector(
            "[data-mixed-status-text]"
        );


    const botonConfirmar =
        portal.querySelector(
            "[data-mixed-confirm]"
        );


    function obtenerPagosIngresados(){

        const pagos = {

            efectivo:
                0,

            yape:
                0,

            plin:
                0,

            tarjeta:
                0,

            transferencia:
                0

        };


        entradas.forEach(
            function(entrada){

                const metodo =
                    entrada.dataset
                        .mixedPaymentInput;


                pagos[metodo] =
                    normalizarMontoVentasMobile(
                        entrada.value
                    );

            }
        );


        return pagos;

    }


    function calcularEstadoPagoMixto(){

        const pagos =
            obtenerPagosIngresados();


        const totalPagado =
            redondearMontoVentasMobile(
                Object
                    .values(
                        pagos
                    )
                    .reduce(
                        function(acumulado, monto){

                            return (
                                acumulado +
                                Number(monto || 0)
                            );

                        },
                        0
                    )
            );


        const diferencia =
            redondearMontoVentasMobile(
                totalVenta -
                totalPagado
            );


        const metodosUtilizados =
            Object
                .values(
                    pagos
                )
                .filter(
                    function(monto){

                        return (
                            Number(monto || 0) >
                            0
                        );

                    }
                )
                .length;


        const pagoCompleto =
            Math.abs(
                diferencia
            ) <= 0.009;


        const excedido =
            diferencia < -0.009;


        const puedeConfirmar =
            pagoCompleto &&
            metodosUtilizados >= 2 &&
            !checkoutVentasEnProceso;


        return {

            pagos,

            totalPagado,

            diferencia,

            metodosUtilizados,

            pagoCompleto,

            excedido,

            puedeConfirmar

        };

    }


    function actualizarPagoMixto(){

        const resultado =
            calcularEstadoPagoMixto();


        if(salidaPagado){

            salidaPagado.textContent =
                formatearMonedaVentasMobile(
                    resultado.totalPagado
                );

        }


        if(salidaRestante){

            salidaRestante.textContent =
                formatearMonedaVentasMobile(
                    Math.abs(
                        resultado.diferencia
                    )
                );

        }


        if(etiquetaRestante){

            etiquetaRestante.textContent =
                resultado.excedido
                    ? "Monto excedido"
                    : resultado.pagoCompleto
                        ? "Pago completado"
                        : "Falta por pagar";

        }


        if(filaRestante){

            filaRestante.classList.toggle(
                "is-complete",
                resultado.pagoCompleto &&
                resultado.metodosUtilizados >= 2
            );

            filaRestante.classList.toggle(
                "is-exceeded",
                resultado.excedido
            );

        }


        if(estado){

            estado.classList.toggle(
                "is-ready",
                resultado.puedeConfirmar
            );

            estado.classList.toggle(
                "is-warning",
                resultado.excedido
            );

        }


        if(textoEstado){

            if(resultado.excedido){

                textoEstado.textContent =
                    "La distribución supera el total de la venta.";

            }else if(
                resultado.pagoCompleto &&
                resultado.metodosUtilizados < 2
            ){

                textoEstado.textContent =
                    "Selecciona por lo menos dos métodos de pago.";

            }else if(resultado.puedeConfirmar){

                textoEstado.textContent =
                    "Pago completo. Ya puedes confirmar la venta.";

            }else{

                textoEstado.textContent =
                    `Falta ${formatearMonedaVentasMobile(
                        Math.max(
                            0,
                            resultado.diferencia
                        )
                    )} por distribuir.`;

            }

        }


        if(botonConfirmar){

            botonConfirmar.disabled =
                !resultado.puedeConfirmar;

        }


        entradas.forEach(
            function(entrada){

                const metodo =
                    entrada.dataset
                        .mixedPaymentInput;


                const fila =
                    entrada.closest(
                        "[data-mixed-method-row]"
                    );


                fila?.classList.toggle(
                    "is-active",
                    Number(
                        resultado.pagos[
                            metodo
                        ] || 0
                    ) > 0
                );

            }
        );


        return resultado;

    }


    entradas.forEach(
        function(entrada){

            entrada.addEventListener(
                "input",
                function(){

                    if(checkoutVentasEnProceso){

                        return;

                    }


                    if(
                        Number(
                            entrada.value
                        ) < 0
                    ){

                        entrada.value =
                            "0";

                    }


                    actualizarPagoMixto();

                }
            );


            entrada.addEventListener(
                "focus",
                function(){

                    entrada
                        .closest(
                            "[data-mixed-method-row]"
                        )
                        ?.classList.add(
                            "has-focus"
                        );

                }
            );


            entrada.addEventListener(
                "blur",
                function(){

                    entrada
                        .closest(
                            "[data-mixed-method-row]"
                        )
                        ?.classList.remove(
                            "has-focus"
                        );


                    const monto =
                        normalizarMontoVentasMobile(
                            entrada.value
                        );


                    entrada.value =
                        monto > 0
                            ? monto.toFixed(2)
                            : "";


                    actualizarPagoMixto();

                }
            );

        }
    );


    botonConfirmar?.addEventListener(
        "click",
        async function(){

            if(checkoutVentasEnProceso){

                return;

            }


            const resultado =
                actualizarPagoMixto();


            if(!resultado.puedeConfirmar){

                vibrarVentasMobile(
                    "warning"
                );


                mostrarToast({

                    tipo:
                        "warning",

                    mensaje:
                        "Completa correctamente la distribución del pago."

                });


                return;

            }


            await confirmarPagoMixtoVentasMobile({

                total:
                    totalVenta,

                pagos:
                    resultado.pagos,

                botonConfirmar,

                entradas

            });

        }
    );


    actualizarPagoMixto();

}

async function confirmarPagoMixtoVentasMobile(
    datos
){

    const {

        total,

        pagos,

        botonConfirmar,

        entradas

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


const descuento =
    obtenerDescuentoCheckoutMobile();


const totalActual =
    redondearMontoVentasMobile(
        Number(resumenActual.total || 0) -
        descuento
    );


    if(
        Math.abs(
            totalActual -
            total
        ) > 0.009
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El total de la venta cambió. Revisa nuevamente el pago."

        });


        return false;

    }


    const detallePagos =
        Object
            .entries(
                pagos
            )
            .filter(
                function([
                    metodo,
                    monto
                ]){

                    return (
                        Number(monto || 0) >
                        0
                    );

                }
            )
            .map(
                function([
                    metodo,
                    monto
                ]){

                    return (
                        `${obtenerNombreMetodoPagoVentasMobile(
                            metodo
                        )}: ${formatearMonedaVentasMobile(
                            monto
                        )}`
                    );

                }
            )
            .join(" · ");


    const confirmado =
        await mostrarDialogo({

            icono:
                "🔀",

            titulo:
                "Confirmar pago mixto",

            mensaje:
                `Total: ${formatearMonedaVentasMobile(
                    totalActual
                )} · ${detallePagos}`,

            textoCancelar:
                "Volver",

            textoConfirmar:
                "Confirmar venta",

            peligro:
                false

        });


    if(!confirmado){

        return false;

    }


    checkoutVentasEnProceso =
        true;


    bloquearBotonVentasMobile(
        botonConfirmar,
        true,
        "Registrando..."
    );


    entradas.forEach(
        function(entrada){

            entrada.disabled =
                true;

        }
    );


    vibrarVentasMobile(
        "tap"
    );


    try{

        const efectivo =
            Number(
                pagos.efectivo || 0
            );


        const resultado =
            await registrarVentaMobile({

                metodoPago:
                    "mixto",

                pagos,

                descuento,

                recibido:
                    efectivo,

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
                    "No se pudo registrar el pago mixto."

            });

            return false;

        }

const venta =
    resultado.venta;

vaciarCarritoMobile();

OverlayMobile.close();

await mostrarVentaFinalizadaMobile(
    venta
);

vibrarVentasMobile(
    "success"
);

        return true;

    }finally{

        checkoutVentasEnProceso =
            false;


        entradas.forEach(
            function(entrada){

                if(
                    document.body.contains(
                        entrada
                    )
                ){

                    entrada.disabled =
                        false;

                }

            }
        );


        if(
            botonConfirmar &&
            document.body.contains(
                botonConfirmar
            )
        ){

            bloquearBotonVentasMobile(
                botonConfirmar,
                false
            );

        }

    }

}

async function mostrarVentaFinalizadaMobile(
    venta
){

    if(!venta){
        return;
    }

const html = `
    <section class="mobile-sale-finished-premium">

        <div class="mobile-sale-success-visual">

            <span class="mobile-sale-success-glow"></span>

            <div class="mobile-sale-success-icon">
                <span aria-hidden="true">✓</span>
            </div>

        </div>

        <span class="mobile-sale-success-eyebrow">
            OPERACIÓN EXITOSA
        </span>

        <h2 class="mobile-sale-success-title">
            Venta registrada
        </h2>

        <p class="mobile-sale-success-description">
            La operación fue procesada correctamente.
        </p>

        <div class="mobile-sale-ticket-card">

            <span>
                NÚMERO DE BOLETA
            </span>

            <strong>
                ${escaparHTMLVentasMobile(
                    venta.numeroBoleta ||
                    "SIN NÚMERO"
                )}
            </strong>

        </div>

        <div class="mobile-sale-success-actions">

            <button
                type="button"
                class="
                    mobile-button
                    mobile-button-primary
                    mobile-sale-print-button
                "
                data-print-ticket
            >

                <span
                    class="mobile-sale-action-icon"
                    aria-hidden="true"
                >
                    🖨
                </span>

                <span>
                    Imprimir boleta
                </span>

            </button>

            <button
                type="button"
                class="
                    mobile-button
                    mobile-sale-close-button
                "
                data-close-sale
            >

                <span>
                    Finalizar
                </span>

                <span aria-hidden="true">
                    →
                </span>

            </button>

        </div>

        <p class="mobile-sale-success-note">
            La venta ya fue guardada y el stock fue actualizado.
        </p>

    </section>
`;

    const sheet =
        abrirBottomSheet({

            eyebrow:
                "DIGITAL CENTER M&A",

            titulo:
                "Venta completada",

            descripcion:
                "",
        
            clase:
                "mobile-sale-success-sheet",


            textoCancelar:
                "",

            textoConfirmar:
                "",

            contenido:
                html

        });

    sheet.portal.addEventListener(
        "click",
        async function(evento){

            if(
                evento.target.closest(
                    "[data-print-ticket]"
                )
            ){

                const contenido =
                    construirHTMLBoletaMobile(
                        venta
                    );

                await imprimirHTMLBoletaMobile(
                    contenido
                );

            }

            if(
                evento.target.closest(
                    "[data-close-sale]"
                )
            ){

                OverlayMobile.close();

            }

        }
    );

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


    const subtotal =
        redondearMontoVentasMobile(
            Number(
                resumen.total || 0
            )
        );


    const descuento =
        Math.min(
            subtotal,
            Math.max(
                0,
                obtenerDescuentoCheckoutMobile()
            )
        );


    const totalFinal =
        redondearMontoVentasMobile(
            subtotal -
            descuento
        );


    if(totalFinal <= 0){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El descuento no puede cubrir el total completo de la venta."

        });

        return;

    }


    const resumenEfectivo = {

        ...resumen,

        total:
            totalFinal,

        descuento

    };


    const sheet =
        abrirBottomSheet({

            eyebrow:
                "COBRO MÓVIL",

            titulo:
                "Pago en efectivo",

            descripcion:
                `Total: ${formatearMonedaVentasMobile(
                    totalFinal
                )} · Tienda: ${resumen.nombreTienda}`,

            textoCancelar:
                "Volver",

            textoConfirmar:
                "",

            contenido:
                construirCobroEfectivoVentasMobile(
                    resumenEfectivo
                )

        });


    inicializarTecladoEfectivoVentasMobile({

        portal:
            sheet.portal,

        total:
            totalFinal

    });

}

function construirCobroEfectivoVentasMobile(
    resumen
){

    const nombreTienda =
        resumen?.nombreTienda ||
        obtenerNombreTiendaVentaMobile();


    const cantidadProductos =
        Array.isArray(
            resumen?.items
        )
            ? resumen.items.length
            : 0;


    const cantidadUnidades =
        Number(
            resumen?.cantidad || 0
        );


    return `
        <section
            class="
                mobile-cash-checkout
                mobile-cash-checkout-premium
            "
            data-cash-checkout
        >

            <header class="mobile-cash-header">

                <span class="mobile-cash-eyebrow">
                    COBRO EN EFECTIVO
                </span>

                <div class="mobile-cash-total-card">

                    <div class="mobile-cash-total-copy">

                        <span>
                            Total a cobrar
                        </span>

                        <strong>
                            ${formatearMonedaVentasMobile(
                                resumen.total
                            )}
                        </strong>

                    </div>

                    <span
                        class="mobile-cash-total-icon"
                        aria-hidden="true"
                    >
                        💵
                    </span>

                </div>

                <div class="mobile-cash-meta">

                    <span>
                        🏪
                        ${escaparHTMLVentasMobile(
                            nombreTienda
                        )}
                    </span>

                    <span>
                        🛒
                        ${
                            cantidadProductos === 1
                                ? "1 producto"
                                : `${cantidadProductos} productos`
                        }
                    </span>

                    <span>
                        📦
                        ${
                            cantidadUnidades === 1
                                ? "1 unidad"
                                : `${cantidadUnidades} unidades`
                        }
                    </span>

                </div>

            </header>


            <section class="mobile-cash-amounts">

                <div class="mobile-cash-display mobile-cash-display-premium">

                    <span>
                        Monto recibido
                    </span>

                    <strong
                        data-cash-received
                        aria-live="polite"
                    >
                        S/ 0.00
                    </strong>

                    <small>
                        Ingresa el dinero entregado por el cliente.
                    </small>

                </div>


                <div class="mobile-cash-change mobile-cash-change-premium">

                    <div>

                        <span>
                            Vuelto
                        </span>

                        <small>
                            Se calculará automáticamente.
                        </small>

                    </div>

                    <strong
                        data-cash-change
                        aria-live="polite"
                    >
                        S/ 0.00
                    </strong>

                </div>

            </section>


            <section class="mobile-cash-section">

                <div class="mobile-cash-section-header">

                    <div>

                        <span>
                            MONTOS RÁPIDOS
                        </span>

                        <strong>
                            Selecciona una opción
                        </strong>

                    </div>

                    <span aria-hidden="true">
                        ⚡
                    </span>

                </div>

                <div class="mobile-cash-quick">

                    <button
                        type="button"
                        class="
                            mobile-cash-quick-button
                            is-exact
                        "
                        data-cash-quick="exacto"
                        aria-pressed="false"
                    >

                        <span aria-hidden="true">
                            ✓
                        </span>

                        <span>
                            Exacto
                        </span>

                    </button>

                    <button
                        type="button"
                        class="mobile-cash-quick-button"
                        data-cash-quick="20"
                        aria-pressed="false"
                    >
                        S/ 20
                    </button>

                    <button
                        type="button"
                        class="mobile-cash-quick-button"
                        data-cash-quick="50"
                        aria-pressed="false"
                    >
                        S/ 50
                    </button>

                    <button
                        type="button"
                        class="mobile-cash-quick-button"
                        data-cash-quick="100"
                        aria-pressed="false"
                    >
                        S/ 100
                    </button>

                </div>

            </section>


            <section class="mobile-cash-section">

                <div class="mobile-cash-section-header">

                    <div>

                        <span>
                            TECLADO NUMÉRICO
                        </span>

                        <strong>
                            Ingresa el monto manualmente
                        </strong>

                    </div>

                    <span aria-hidden="true">
                        🔢
                    </span>

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

            </section>


            <button
                type="button"
                class="
                    mobile-button
                    mobile-button-primary
                    mobile-cash-confirm
                    mobile-cash-confirm-premium
                "
                data-cash-confirm
                disabled
            >

                <span>
                    Confirmar pago
                </span>

                <span aria-hidden="true">
                    →
                </span>

            </button>

        </section>
    `;

}

function construirTeclaEfectivoVentasMobile(
    valor,
    etiqueta =
        valor
){

    const esAccion =
        [
            "limpiar",
            "borrar"
        ].includes(
            valor
        );


    return `
        <button
            type="button"
            class="
                mobile-cash-key
                ${
                    esAccion
                        ? "is-action"
                        : ""
                }
            "
            data-cash-key="${escaparHTMLVentasMobile(
                valor
            )}"
            aria-label="${
                valor === "limpiar"
                    ? "Limpiar monto"
                    : valor === "borrar"
                        ? "Borrar último número"
                        : `Número ${escaparHTMLVentasMobile(
                            valor
                        )}`
            }"
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

        recibido

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


    const subtotalActual =
        redondearMontoVentasMobile(
            resumenActual.total
        );


    const descuento =
        Math.min(
            subtotalActual,
            Math.max(
                0,
                obtenerDescuentoCheckoutMobile()
            )
        );


    const totalActual =
        redondearMontoVentasMobile(
            subtotalActual -
            descuento
        );


    const totalCobrado =
        redondearMontoVentasMobile(
            total
        );


    const recibidoNormalizado =
        redondearMontoVentasMobile(
            recibido
        );


    const vueltoCalculado =
        redondearMontoVentasMobile(
            Math.max(
                0,
                recibidoNormalizado -
                totalActual
            )
        );


    if(
        totalActual <= 0
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El descuento no puede cubrir el total completo de la venta."

        });

        return false;

    }


    if(
        Math.abs(
            totalActual -
            totalCobrado
        ) > 0.009
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El total de la venta cambió. Revisa nuevamente el cobro."

        });

        return false;

    }


    if(
        recibidoNormalizado <
        totalActual
    ){

        mostrarToast({

            tipo:
                "warning",

            mensaje:
                "El monto recibido no cubre el total de la venta."

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

                    recibido:
                        recibidoNormalizado,

                    vuelto:
                        vueltoCalculado

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

            descuento,

            recibido:
                recibidoNormalizado,

            vuelto:
                vueltoCalculado

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


    const venta =
        resultado.venta;


    vaciarCarritoMobile();

    descuentoCheckoutVentasMobile =
        0;

    OverlayMobile.close();


    await mostrarVentaFinalizadaMobile(
        venta
    );


    vibrarVentasMobile(
        "success"
    );


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

        `Tienda: ${
            resumen.nombreTienda ||
            obtenerNombreTiendaVentaMobile()
        }`,

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

    const cantidadProductos =
        Array.isArray(
            resumen?.items
        )
            ? resumen.items.length
            : 0;


    const cantidadUnidades =
        Number(
            resumen?.cantidad || 0
        );


    const nombreTienda =
        resumen?.nombreTienda ||
        obtenerNombreTiendaVentaMobile();


return `
    <section class="mobile-checkout mobile-checkout-premium">

        <header class="mobile-checkout-header">

            <span class="mobile-checkout-eyebrow">
                RESUMEN DE VENTA
            </span>

            <div class="mobile-checkout-total-card">

                <div class="mobile-checkout-total-copy">

                    <span>
                        Total a cobrar
                    </span>

                    <strong id="mobileCheckoutTotal">
                        ${formatearMonedaVentasMobile(
                            resumen.total
                        )}
                    </strong>

                </div>

                <span
                    class="mobile-checkout-total-icon"
                    aria-hidden="true"
                >
                    💳
                </span>

            </div>

            <div class="mobile-checkout-breakdown">

                <div class="mobile-checkout-breakdown-row">

                    <span>
                        Subtotal
                    </span>

                    <strong id="mobileCheckoutSubtotal">
                        ${formatearMonedaVentasMobile(
                            resumen.total
                        )}
                    </strong>

                </div>

                <label
                    class="mobile-checkout-breakdown-row
                           mobile-checkout-discount-row"
                    for="mobileCheckoutDiscount"
                >

                    <span>
                        Descuento
                    </span>

                    <div class="mobile-checkout-discount-box">

                        <span aria-hidden="true">
                            S/
                        </span>

                        <input
                            id="mobileCheckoutDiscount"
                            class="mobile-checkout-discount-input"
                            type="number"
                            min="0"
                            max="${Number(
                                resumen.total || 0
                            ).toFixed(2)}"
                            step="0.10"
                            inputmode="decimal"
                            autocomplete="off"
                            placeholder="0.00"
                            value="${
                                Number(
                                    descuentoCheckoutVentasMobile || 0
                                ).toFixed(2)
                            }"
                            aria-label="Descuento de la venta"
                        >

                    </div>

                </label>

                <div
                    class="mobile-checkout-breakdown-row
                           is-total"
                >

                    <span>
                        Total
                    </span>

                    <strong id="mobileCheckoutTotalResumen">
                        ${formatearMonedaVentasMobile(
                            Math.max(
                                0,
                                Number(resumen.total || 0) -
                                Number(
                                    descuentoCheckoutVentasMobile || 0
                                )
                            )
                        )}
                    </strong>

                </div>

            </div>

            <div class="mobile-checkout-meta">

                <div class="mobile-checkout-meta-item">

                    <span aria-hidden="true">
                        🏪
                    </span>

                    <span>
                        ${escaparHTMLVentasMobile(
                            nombreTienda
                        )}
                    </span>

                </div>

                <div class="mobile-checkout-meta-divider"></div>

                <div class="mobile-checkout-meta-item">

                    <span aria-hidden="true">
                        🛒
                    </span>

                    <span>
                        ${
                            cantidadProductos === 1
                                ? "1 producto"
                                : `${cantidadProductos} productos`
                        }
                    </span>

                </div>

                <div class="mobile-checkout-meta-divider"></div>

                <div class="mobile-checkout-meta-item">

                    <span aria-hidden="true">
                        📦
                    </span>

                    <span>
                        ${
                            cantidadUnidades === 1
                                ? "1 unidad"
                                : `${cantidadUnidades} unidades`
                        }
                    </span>

                </div>

            </div>

        </header>

            <div class="mobile-checkout-section-header">

                <div>

                    <span class="mobile-checkout-section-eyebrow">
                        MÉTODO DE PAGO
                    </span>

                    <h3>
                        ¿Cómo pagará el cliente?
                    </h3>

                </div>

                <span
                    class="mobile-checkout-secure-badge"
                    aria-label="Cobro seguro"
                >
                    🔒
                </span>

            </div>


            <div class="mobile-checkout-methods mobile-checkout-methods-premium">

                ${construirMetodoPagoVentasMobile({

                    id:
                        "efectivo",

                    icono:
                        "/efectivo.png",

                    nombre:
                        "Efectivo",

                    descripcion:
                        "Ingresa el monto recibido y calcula el vuelto.",

                    clase:
                        "is-cash"

                })}


                ${construirMetodoPagoVentasMobile({

                    id:
                        "yape",

                    icono:
                        "/yape.png",

                    nombre:
                        "Yape",

                    descripcion:
                        "Registrar el total como pago mediante Yape.",

                    clase:
                        "is-yape"

                })}


                ${construirMetodoPagoVentasMobile({

                    id:
                        "plin",

                    icono:
                        "/plin.png",

                    nombre:
                        "Plin",

                    descripcion:
                        "Registrar el total como pago mediante Plin.",

                    clase:
                        "is-plin"

                })}


                ${construirMetodoPagoVentasMobile({

                    id:
                        "tarjeta",

                    icono:
                        "/tarjeta.png",

                    nombre:
                        "Tarjeta",

                    descripcion:
                        "Pago con tarjeta de débito o crédito.",

                    clase:
                        "is-card"

                })}


                ${construirMetodoPagoVentasMobile({

                    id:
                        "transferencia",

                    icono:
                        "/transferencia.png",

                    nombre:
                        "Transferencia",

                    descripcion:
                        "Registrar una transferencia bancaria.",

                    clase:
                        "is-transfer"

                })}

            </div>


            <div class="mobile-checkout-secondary">

                <span class="mobile-checkout-secondary-label">
                    COMBINAR MÉTODOS
                </span>


${construirMetodoPagoVentasMobile({

    id:
        "mixto",

    icono:
        "🔀",

    nombre:
        "Pago mixto",

    descripcion:
        "Combinar efectivo, Yape, Plin u otros métodos.",

    clase:
        "is-mixed",

    proximo:
        false

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

        descripcion,

        clase = "",

        proximo = false

    } = opciones;


    return `
        <button
            type="button"
            class="
                mobile-checkout-method
                mobile-checkout-method-premium
                ${escaparHTMLVentasMobile(
                    clase
                )}
                ${
                    proximo
                        ? "is-coming-soon"
                        : ""
                }
            "
            data-mobile-payment-method="${escaparHTMLVentasMobile(
                id
            )}"
            aria-busy="false"
            aria-pressed="false"
            ${
                proximo
                    ? 'aria-describedby="mobileMixedPaymentStatus"'
                    : ""
            }
        >

            <span class="mobile-checkout-method-accent"></span>

<span class="mobile-checkout-method-icon">

    ${
        String(icono).startsWith("/")
            ? `
                <img
                    src="${escaparHTMLVentasMobile(
                        icono
                    )}"
                    alt="${escaparHTMLVentasMobile(
                        nombre
                    )}"
                    class="mobile-checkout-method-image"
                >
            `
            : icono
    }

</span>

            <span class="mobile-checkout-method-copy">

                <span class="mobile-checkout-method-title-row">

                    <strong>
                        ${escaparHTMLVentasMobile(
                            nombre
                        )}
                    </strong>

                    ${
                        proximo
                            ? `
                                <small
                                    id="mobileMixedPaymentStatus"
                                    class="mobile-checkout-coming-soon"
                                >
                                    Próximamente
                                </small>
                            `
                            : ""
                    }

                </span>

                <small class="mobile-checkout-method-description">
                    ${escaparHTMLVentasMobile(
                        descripcion
                    )}
                </small>

            </span>

            <span
                class="mobile-checkout-method-arrow"
                aria-hidden="true"
            >
                ${
                    proximo
                        ? "⌛"
                        : "›"
                }
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

function normalizarMontoVentasMobile(
    valor
){

    const numero =
        Number(valor || 0);


    if(
        !Number.isFinite(numero) ||
        numero < 0
    ){

        return 0;

    }


    return Number(
        numero.toFixed(2)
    );

}


function redondearMontoVentasMobile(
    valor
){

    return Math.round(
        normalizarMontoVentasMobile(
            valor
        ) * 100
    ) / 100;

}

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

    seleccionMetodoPagoEnProceso =
        false;    

}