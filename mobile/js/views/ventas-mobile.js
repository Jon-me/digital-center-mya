// =====================================================
// DIGITAL CENTER M&A
// MOBILE VENTAS VIEW
// FASE M6.1 - CARRITO REACTIVO
// =====================================================

import {

    obtenerResumenCarritoMobile,

    suscribirCarritoMobile,

    actualizarCantidadCarritoMobile,

    eliminarProductoCarritoMobile

} from "../services/carrito-mobile-service.js";

import {

    mostrarDialogo,

    mostrarToast

} from "../components/overlay/overlay-mobile.js";

let renderizada =
    false;

let cancelarSuscripcionVentasMobile =
    null;

let contenedorVentasMobile =
    null;

let navegarVentasMobile =
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

            <header class="mobile-sales-header">

                <div>

                    <span class="mobile-sales-eyebrow">
                        VENTA ACTUAL
                    </span>

                    <h1 class="mobile-sales-title">
                        Carrito
                    </h1>

                </div>

                <span
                    id="mobileSalesItemsCount"
                    class="mobile-badge"
                >
                    0 productos
                </span>

            </header>

            <section
                id="mobileSalesContent"
                class="mobile-sales-content"
            ></section>

            <aside
                id="mobileSalesSummary"
                class="mobile-sales-summary"
                hidden
            >

                <div class="mobile-sales-summary-row">

                    <span>
                        Unidades
                    </span>

                    <strong id="mobileSalesQuantity">
                        0
                    </strong>

                </div>

                <div class="mobile-sales-summary-total">

                    <span>
                        Total
                    </span>

                    <strong id="mobileSalesTotal">
                        S/ 0.00
                    </strong>

                </div>

                <button
                    type="button"
                    class="mobile-button mobile-button-primary mobile-sales-checkout"
                    data-mobile-checkout
                >
                    Cobrar venta
                </button>

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


    if(contador){

        contador.textContent =
            cantidad === 1
                ? "1 producto"
                : `${cantidad} productos`;

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

        resumenVisual.hidden =
            items.length === 0;

    }


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


    return `
        <article
            class="mobile-sales-item"
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
                            <span>
                                📦
                            </span>
                        `
                }

            </div>

            <div class="mobile-sales-item-info">

                <span class="mobile-sales-item-code">
                    ${escaparHTMLVentasMobile(
                        item.codigo ||
                        "S/C"
                    )}
                </span>

                <h2>
                    ${escaparHTMLVentasMobile(
                        item.producto
                    )}
                </h2>

                <span class="mobile-sales-item-price">
                    ${formatearMonedaVentasMobile(
                        item.precio
                    )}
                    c/u
                </span>

                <div class="mobile-sales-item-actions">

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

                        <strong
                            class="mobile-sales-quantity-value"
                        >
                            ${cantidad}
                        </strong>

                        <button
                            type="button"
                            class="mobile-sales-quantity-button"
                            data-cart-increase
                            aria-label="Aumentar cantidad"
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
                        🗑
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

    return `
        <section class="mobile-sales-empty">

            <div class="mobile-sales-empty-icon">
                🛒
            </div>

            <h2>
                Tu carrito está vacío
            </h2>

            <p>
                Explora el inventario y agrega
                los productos de la venta.
            </p>

            <button
                type="button"
                class="mobile-button mobile-button-primary"
                data-mobile-go-inventory
            >
                Ir al inventario
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

            const irInventario =
                evento.target.closest(
                    "[data-mobile-go-inventory]"
                );


            if(irInventario){

                navegarVentasMobile?.(
                    "inventario"
                );

                return;

            }


            const tarjeta =
                evento.target.closest(
                    "[data-cart-product-id]"
                );


            const productoId =
                tarjeta?.dataset
                    ?.cartProductId;


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


                if(
                    Number(item.cantidad) <=
                    1
                ){

                    await confirmarEliminarProductoVentasMobile(
                        item
                    );

                    return;

                }


                actualizarCantidadCarritoMobile(
                    productoId,
                    Number(item.cantidad) - 1
                );

                return;

            }


            const aumentar =
                evento.target.closest(
                    "[data-cart-increase]"
                );


            if(
                aumentar &&
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


                const resultado =
    actualizarCantidadCarritoMobile(
        productoId,
        Number(item.cantidad) + 1
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


    mostrarToast({

        tipo:
            "warning",

        mensaje:
            stockDisponible > 0
                ? `Stock máximo disponible: ${stockDisponible}.`
                : "Este producto no tiene stock en tu tienda."

    });

}


return;

            }


            const eliminar =
                evento.target.closest(
                    "[data-cart-remove]"
                );


            if(
                eliminar &&
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


                if(item){

                    await confirmarEliminarProductoVentasMobile(
                        item
                    );

                }

                return;

            }


            const cobrar =
                evento.target.closest(
                    "[data-mobile-checkout]"
                );


            if(cobrar){

                mostrarToast({

                    tipo:
                        "info",

                    mensaje:
                        "El proceso de cobro se implementará en el siguiente paso."

                });

            }

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


    renderizada =
        false;

    contenedorVentasMobile =
        null;

    navegarVentasMobile =
        null;

}