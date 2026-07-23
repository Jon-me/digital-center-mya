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

             <section class="mobile-sales-store">

                <div class="mobile-sales-store-info">

                    <span>
                        Tienda de venta
                    </span>

                    <strong id="mobileSalesStoreName">
                        Mercado
                    </strong>

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
                    >
                        Mercado
                    </button>

                    <button
                        type="button"
                        class="mobile-sales-store-button"
                        data-mobile-sales-store="sucursal"
                    >
                        Peluquería
                    </button>

                </div>

            </section>

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

                <div class="mobile-sales-actions">

    <button
        type="button"
        class="mobile-button"
        data-mobile-clear-cart
    >
        Vaciar venta
    </button>

    <button
        type="button"
        class="mobile-button mobile-button-primary mobile-sales-checkout"
        data-mobile-checkout
    >
        Cobrar venta
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

                                <span class="mobile-sales-item-stock">
                    ${stockDisponible} disponibles en
                    ${escaparHTMLVentasMobile(
                        nombreTienda
                    )}
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

                        const botonTienda =
                evento.target.closest(
                    "[data-mobile-sales-store]"
                );


            if(botonTienda){

                const nuevaTienda =
                    botonTienda.dataset
                        .mobileSalesStore;


                await cambiarTiendaVentaDesdeVentasMobile(
                    nuevaTienda
                );

                return;

            }

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

            const vaciarVenta =
    evento.target.closest(
        "[data-mobile-clear-cart]"
    );


if(vaciarVenta){

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


    mostrarToast({

        tipo:
            "success",

        mensaje:
            "Venta vaciada correctamente."

    });

    return;

}

            const cobrar =
    evento.target.closest(
        "[data-mobile-checkout]"
    );


if(cobrar){

    abrirFlujoCobroVentasMobile();

    return;

}

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
                `Total a registrar: ${formatearMonedaVentasMobile(
                    resumen.total
                )}`,

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
                recibido < total;

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
                : Number(valor || 0);


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
            !Number.isFinite(montoRapido) ||
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


            const valor =
                tecla.dataset.cashKey;


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

        const recibido =
            centimosRecibidos /
            100;

        const vuelto =
            Math.max(
                0,
                recibido - total
            );


        if(recibido < total){

            mostrarToast({

                tipo:
                    "warning",

                mensaje:
                    "El monto recibido no cubre el total de la venta."

            });

            return;

        }


        botonConfirmar.disabled =
            true;


        try{

            await confirmarCobroEfectivoVentasMobile({

                total,

                recibido,

                vuelto

            });

        }finally{

            if(
                document.body.contains(
                    botonConfirmar
                )
            ){

                botonConfirmar.disabled =
                    false;

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