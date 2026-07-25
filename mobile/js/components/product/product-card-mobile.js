// =====================================================
// DIGITAL CENTER M&A
// MOBILE PRODUCT CARD
// FASE M7.2.1 - PRODUCT CARD PREMIUM
// =====================================================

import {
    OverlayMobile
} from "../overlay/overlay-mobile.js";

import {
    obtenerTiendaVentaMobile,
    cambiarTiendaVentaMobile,
    obtenerNombreTiendaVentaMobile
} from "../../state-mobile.js";


import {
    obtenerStockDisponibleCarritoMobile,
    obtenerResumenCarritoMobile,
    vaciarCarritoMobile
} from "../../services/carrito-mobile-service.js";

let NOMBRES_SUCURSALES_MOBILE = {

    principal:
        "Mercado",

    sucursal:
        "Peluquería"

};


function establecerMapaSucursalesMobile(
    mapa = {}
){

    NOMBRES_SUCURSALES_MOBILE = {

        principal:
            "Mercado",

        sucursal:
            "Peluquería",

        ...mapa

    };

}


function escaparHTMLProducto(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatearMonedaProducto(
    valor
){

    return "S/ " +
        Number(valor || 0)
            .toFixed(2);

}


function esAdministradorMobile(
    usuario
){

    return (
        String(
            usuario?.rol || ""
        )
            .trim()
            .toLowerCase() ===
        "admin"
    );

}


function construirPreciosProductoMobile(
    producto,
    usuario,
    modo =
        "card"
){

    const precioVenta =
        formatearMonedaProducto(
            producto?.precio
        );


    if(
        !esAdministradorMobile(
            usuario
        )
    ){

        return `
            <strong class="mobile-product-price">
                ${precioVenta}
            </strong>
        `;

    }


    const precioCompra =
        formatearMonedaProducto(
            producto?.precioCompra
        );


    return `
        <span
            class="
                mobile-product-prices
                ${
                    modo === "sheet"
                        ? "is-sheet"
                        : ""
                }
            "
        >

            <span class="mobile-product-price-item is-sale">

                <small>
                    Venta
                </small>

                <strong>
                    ${precioVenta}
                </strong>

            </span>

            <span class="mobile-product-price-item is-cost">

                <small>
                    Compra
                </small>

                <strong>
                    ${precioCompra}
                </strong>

            </span>

        </span>
    `;

}


function obtenerStockTiendasProducto(
    producto
){

    const stockTiendas = {};


    /*
     * Primero incorporamos todas las sucursales
     * conocidas, incluso si tienen stock cero.
     */
    Object
        .keys(
            NOMBRES_SUCURSALES_MOBILE
        )
        .forEach(function(sucursalId){

            stockTiendas[sucursalId] =
                0;

        });


    /*
     * Después incorporamos el stock real
     * registrado dentro del producto.
     */
    Object
        .entries(
            producto?.stockTiendas ||
            {}
        )
        .forEach(function([
            sucursalId,
            cantidad
        ]){

            stockTiendas[sucursalId] =
                Number(
                    cantidad || 0
                );

        });


    /*
     * Compatibilidad con productos antiguos
     * que solo tienen el campo stock general.
     */
    const todosEnCero =
        Object
            .values(
                stockTiendas
            )
            .every(function(cantidad){

                return (
                    Number(
                        cantidad || 0
                    ) === 0
                );

            });


    if(
        todosEnCero &&
        Number(
            producto?.stock || 0
        ) > 0
    ){

        stockTiendas.principal =
            Number(
                producto.stock || 0
            );

    }


    return stockTiendas;

}


function obtenerStockTotalProducto(
    producto
){

    return Object
        .values(
            obtenerStockTiendasProducto(
                producto
            )
        )
        .reduce(
            function(total, cantidad){

                return (
                    total +
                    Number(cantidad || 0)
                );

            },
            0
        );

}


function obtenerNombreSucursalMobile(
    sucursalId
){

    return (
        NOMBRES_SUCURSALES_MOBILE[
            sucursalId
        ] ||
        sucursalId ||
        "Sin sucursal"
    );

}


function tieneStockOtraSucursal(
    producto,
    sucursalUsuario
){

    const stockTiendas =
        obtenerStockTiendasProducto(
            producto
        );

    const stockTiendaActual =
        Number(
            stockTiendas[
                sucursalUsuario
            ] || 0
        );

    if(stockTiendaActual > 0){

        return false;

    }

    return Object
        .entries(
            stockTiendas
        )
        .some(function([
            sucursalId,
            cantidad
        ]){

            return (
                sucursalId !==
                    sucursalUsuario &&
                Number(cantidad || 0) > 0
            );

        });

}


function construirImagenProducto(
    producto
){

    if(producto.imagen){

        return `
            <img
                class="mobile-product-image"
                src="${escaparHTMLProducto(producto.imagen)}"
                alt="${escaparHTMLProducto(producto.producto)}"
                loading="lazy"
                decoding="async"
                data-mobile-smart-image
            >
        `;

    }

    return `
        <span
            class="mobile-product-image-placeholder"
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 24 24"
                focusable="false"
            >
                <path
                    d="M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5v-9Z"
                ></path>

                <path
                    d="m4.8 7.7 7.2 4.2 7.2-4.2M12 12v8.5"
                ></path>
            </svg>
        </span>
    `;

}


function activarSmartImagesMobile(
    contenedor
){

    if(!contenedor){

        return;

    }


    contenedor
        .querySelectorAll(
            "[data-mobile-smart-image]"
        )
        .forEach(function(imagen){

            if(
                imagen.dataset
                    .mobileSmartReady ===
                "true"
            ){

                return;

            }


            function clasificarImagen(){

                const ancho =
                    Number(
                        imagen.naturalWidth || 0
                    );

                const alto =
                    Number(
                        imagen.naturalHeight || 0
                    );


                if(
                    ancho <= 0 ||
                    alto <= 0
                ){

                    return;

                }


                const proporcion =
                    ancho / alto;


                imagen.classList.remove(
                    "is-vertical",
                    "is-square",
                    "is-horizontal"
                );


                if(proporcion < 0.72){

                    imagen.classList.add(
                        "is-vertical"
                    );

                }else if(proporcion > 1.35){

                    imagen.classList.add(
                        "is-horizontal"
                    );

                }else{

                    imagen.classList.add(
                        "is-square"
                    );

                }


                imagen.dataset
                    .mobileSmartReady =
                    "true";

            }


            if(imagen.complete){

                clasificarImagen();

            }else{

                imagen.addEventListener(
                    "load",
                    clasificarImagen,
                    {
                        once:
                            true
                    }
                );

            }

        });

}


function construirResumenStock(
    producto,
    usuario
){

    const stockTiendas =
        obtenerStockTiendasProducto(
            producto
        );

    return Object
        .entries(
            stockTiendas
        )
        .sort(function(
            [sucursalA],
            [sucursalB]
        ){

            const sucursalUsuario =
                usuario?.sucursalId ||
                "principal";

            if(sucursalA === sucursalUsuario){

                return -1;

            }

            if(sucursalB === sucursalUsuario){

                return 1;

            }

            return 0;

        })
        .map(function([
            sucursalId,
            cantidad
        ]){

            const esTiendaUsuario =
                usuario?.sucursalId ===
                sucursalId;

            const tieneStock =
                cantidad > 0;

            const clases = [
                "mobile-product-stock-pill",
                esTiendaUsuario
                    ? "is-current"
                    : "",
                tieneStock
                    ? "has-stock"
                    : "no-stock"
            ]
                .filter(Boolean)
                .join(" ");

            return `
                <span class="${clases}">

                    <span class="mobile-product-stock-label">

                        ${
                            esTiendaUsuario
                                ? "Tu tienda"
                                : escaparHTMLProducto(
                                    obtenerNombreSucursalMobile(
                                        sucursalId
                                    )
                                )
                        }

                    </span>

                    <strong>
                        ${cantidad}
                    </strong>

                </span>
            `;

        })
        .join("");

}


function construirProductCardMobile(
    producto,
    usuario
){

    const sucursalUsuario =
        usuario?.sucursalId ||
        "principal";

    const stockTiendas =
        obtenerStockTiendasProducto(
            producto
        );

    const stockTiendaUsuario =
        Number(
            stockTiendas[
                sucursalUsuario
            ] || 0
        );

    const stockTotal =
        obtenerStockTotalProducto(
            producto
        );

    const disponibleOtraTienda =
        tieneStockOtraSucursal(
            producto,
            sucursalUsuario
        );

    const estadoDisponibilidad =
        stockTiendaUsuario > 0
            ? {
                clase:
                    "has-stock",

                texto:
                    "Disponible"
            }
            : disponibleOtraTienda
                ? {
                    clase:
                        "is-other-store",

                    texto:
                        "Otra tienda"
                }
                : {
                    clase:
                        "no-stock",

                    texto:
                        "Agotado"
                };

    const clasesTarjeta = [
        "mobile-product-card",
        stockTiendaUsuario <= 0
            ? "is-unavailable-here"
            : "",
        stockTotal <= 0
            ? "is-out-of-stock"
            : ""
    ]
        .filter(Boolean)
        .join(" ");

    return `
        <button
            type="button"
            class="${clasesTarjeta}"
            data-product-id="${escaparHTMLProducto(producto.id)}"
            aria-label="Ver ${escaparHTMLProducto(producto.producto)}. ${estadoDisponibilidad.texto}."
        >

            <span
                class="mobile-product-card-glow"
                aria-hidden="true"
            ></span>

            <span class="mobile-product-image-wrap">

                ${construirImagenProducto(producto)}

                <span
                    class="
                        mobile-product-availability
                        ${estadoDisponibilidad.clase}
                    "
                >

                    <span
                        class="mobile-product-availability-dot"
                        aria-hidden="true"
                    ></span>

                    ${estadoDisponibilidad.texto}

                </span>

            </span>

            <span class="mobile-product-info">

                <span class="mobile-product-topline">

                    <span class="mobile-product-category">

                        ${escaparHTMLProducto(
                            producto.categoria ||
                            "Sin categoría"
                        )}

                    </span>

                    <span class="mobile-product-code">

                        ${escaparHTMLProducto(
                            producto.codigo ||
                            "S/C"
                        )}

                    </span>

                </span>

                <span class="mobile-product-name">

                    ${escaparHTMLProducto(
                        producto.producto
                    )}

                </span>

                ${construirPreciosProductoMobile(
                    producto,
                    usuario,
                    "card"
                )}

                <span class="mobile-product-stock-summary">

                    ${construirResumenStock(
                        producto,
                        usuario
                    )}

                </span>

                <span class="mobile-product-card-footer">

                    <span class="mobile-product-card-hint">

                        ${
                            disponibleOtraTienda
                                ? "Disponible para traslado"
                                : stockTotal <= 0
                                    ? "Sin existencias"
                                    : "Ver detalles"
                        }

                    </span>

                    <span
                        class="mobile-product-card-arrow"
                        aria-hidden="true"
                    >

                        <svg
                            viewBox="0 0 20 20"
                            focusable="false"
                        >
                            <path
                                d="m7.5 4.75 5.25 5.25-5.25 5.25"
                            ></path>
                        </svg>

                    </span>

                </span>

            </span>

        </button>
    `;

}


function construirStockSheet(
    producto,
    usuario
){

    const stockTiendas =
        obtenerStockTiendasProducto(
            producto
        );

    return Object
        .entries(
            stockTiendas
        )
        .map(function([
            sucursalId,
            cantidad
        ]){

            const esTiendaUsuario =
                (
                    usuario?.sucursalId ||
                    "principal"
                ) ===
                sucursalId;

            return `
                <div
                    class="
                        mobile-product-stock-row

                        ${
                            esTiendaUsuario
                                ? "is-current"
                                : ""
                        }

                        ${
                            cantidad > 0
                                ? "has-stock"
                                : "no-stock"
                        }
                    "
                >

                    <div class="mobile-product-stock-store">

                        <span
                            class="mobile-product-stock-store-dot"
                            aria-hidden="true"
                        ></span>

                        <span class="mobile-product-stock-store-copy">

                            <strong>

                                ${escaparHTMLProducto(
                                    obtenerNombreSucursalMobile(
                                        sucursalId
                                    )
                                )}

                            </strong>

                            <small>

                                ${
                                    esTiendaUsuario
                                        ? "Tu tienda"
                                        : "Otra sucursal"
                                }

                            </small>

                        </span>

                    </div>

                    <span class="mobile-product-stock-amount">

                        <strong
                            class="
                                mobile-product-stock-number

                                ${
                                    cantidad > 0
                                        ? "has-stock"
                                        : "no-stock"
                                }
                            "
                        >
                            ${cantidad}
                        </strong>

                        <small>

                            ${
                                cantidad === 1
                                    ? "unidad"
                                    : "unidades"
                            }

                        </small>

                    </span>

                </div>
            `;

        })
        .join("");

}


function construirImagenProductSheet(
    producto
){

    if(producto.imagen){

        return `
            <img
                src="${escaparHTMLProducto(producto.imagen)}"
                alt="${escaparHTMLProducto(producto.producto)}"
                loading="eager"
                decoding="async"
            >
        `;

    }

    return `
        <span
            class="mobile-product-sheet-placeholder"
            aria-hidden="true"
        >

            <svg
                viewBox="0 0 24 24"
                focusable="false"
            >

                <path
                    d="M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5v-9Z"
                ></path>

                <path
                    d="m4.8 7.7 7.2 4.2 7.2-4.2M12 12v8.5"
                ></path>

            </svg>

        </span>
    `;

}


function construirContenidoProductSheet(
    producto,
    usuario
){

    const stockTotal =
        obtenerStockTotalProducto(
            producto
        );

    const tiendaVenta =
        obtenerTiendaVentaMobile();

    const stockTiendas =
        obtenerStockTiendasProducto(
            producto
        );

    const stockTiendaSeleccionada =
        Number(
            stockTiendas[
                tiendaVenta
            ] || 0
        );

    const stockDisponible =
        obtenerStockDisponibleCarritoMobile(
            producto,
            {
                sucursalId:
                    tiendaVenta,

                descontarCantidadActual:
                    true
            }
        );

    const nombreTienda =
        obtenerNombreTiendaVentaMobile();

    return `
        <div class="mobile-product-sheet">

            <section class="mobile-product-sheet-hero">

                <div class="mobile-product-sheet-image">

                    ${construirImagenProductSheet(
                        producto
                    )}

                </div>

                <div class="mobile-product-sheet-summary">

                    <div class="mobile-product-sheet-tags">

                        <span>
                            ${escaparHTMLProducto(
                                producto.codigo ||
                                "S/C"
                            )}
                        </span>

                        <span>
                            ${escaparHTMLProducto(
                                producto.categoria ||
                                "Sin categoría"
                            )}
                        </span>

                    </div>

                    <div class="mobile-product-sheet-availability">

                        <span
                            class="
                                mobile-product-sheet-status-dot
                                ${
                                    stockDisponible > 0
                                        ? "has-stock"
                                        : "no-stock"
                                }
                            "
                            data-product-store-status-dot
                            aria-hidden="true"
                        ></span>

                        <span>

                            <small data-product-store-name>
                                ${escaparHTMLProducto(
                                    nombreTienda
                                )}
                            </small>

                            <strong data-product-store-stock>

                                ${
                                    stockDisponible > 0
                                        ? `${stockDisponible} disponibles`
                                        : "Sin stock disponible"
                                }

                            </strong>

                        </span>

                    </div>

                    ${construirPreciosProductoMobile(
                        producto,
                        usuario,
                        "sheet"
                    )}

                </div>

            </section>


            <section class="mobile-product-sheet-section">

                <header class="mobile-product-sheet-section-header">

                    <span>
                        Tienda de venta
                    </span>

                    <strong data-product-selected-store-label>
                        ${escaparHTMLProducto(
                            nombreTienda
                        )}
                    </strong>

                </header>

                <div
                    class="mobile-product-store-selector"
                    role="group"
                    aria-label="Seleccionar tienda de venta"
                >

                    <button
                        type="button"
                        class="
                            mobile-product-store-option
                            ${
                                tiendaVenta === "principal"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-product-store="principal"
                        aria-pressed="${
                            tiendaVenta === "principal"
                                ? "true"
                                : "false"
                        }"
                    >

                        <span>
                            Mercado
                        </span>

                        <strong>
                            ${
                                Number(
                                    stockTiendas.principal || 0
                                )
                            }
                        </strong>

                    </button>

                    <button
                        type="button"
                        class="
                            mobile-product-store-option
                            ${
                                tiendaVenta === "sucursal"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-product-store="sucursal"
                        aria-pressed="${
                            tiendaVenta === "sucursal"
                                ? "true"
                                : "false"
                        }"
                    >

                        <span>
                            Peluquería
                        </span>

                        <strong>
                            ${
                                Number(
                                    stockTiendas.sucursal || 0
                                )
                            }
                        </strong>

                    </button>

                </div>

            </section>


            <section class="mobile-product-sheet-section">

                <header class="mobile-product-sheet-section-header">

                    <span>
                        Disponibilidad
                    </span>

                    <strong>
                        ${stockTotal} en total
                    </strong>

                </header>

                <div class="mobile-product-stock-list">

                    ${construirStockSheet(
                        producto,
                        usuario
                    )}

                </div>

            </section>


            <section class="mobile-product-sheet-section">

                <header class="mobile-product-sheet-section-header">

                    <span>
                        Cantidad
                    </span>

                    <strong data-product-quantity-max>
                        Máximo ${stockDisponible}
                    </strong>

                </header>

                <div class="mobile-product-quantity">

                    <button
                        type="button"
                        data-product-quantity-action="minus"
                        aria-label="Reducir cantidad"
                        disabled
                    >
                        −
                    </button>

                    <div class="mobile-product-quantity-value">

                        <small>
                            Unidades
                        </small>

                        <strong data-product-quantity>
                            ${
                                stockDisponible > 0
                                    ? "1"
                                    : "0"
                            }
                        </strong>

                    </div>

                    <button
                        type="button"
                        data-product-quantity-action="plus"
                        aria-label="Aumentar cantidad"
                        ${
                            stockDisponible <= 1
                                ? "disabled"
                                : ""
                        }
                    >
                        +
                    </button>

                </div>

                <p
                    class="mobile-product-quantity-help"
                    data-product-quantity-help
                >

                    ${
                        stockTiendaSeleccionada <= 0
                            ? `No hay stock en ${escaparHTMLProducto(
                                nombreTienda
                            )}.`
                            : stockDisponible <= 0
                                ? "Todo el stock disponible ya está en el carrito."
                                : `${stockDisponible} unidad(es) disponibles para agregar.`
                    }

                </p>

            </section>

            <section class="mobile-product-sheet-section">

    <button
        type="button"
        class="mobile-product-transfer-button"
        data-product-transfer
    >

        <span
            class="mobile-product-transfer-icon"
            aria-hidden="true"
        >
            ⇄
        </span>

        <span class="mobile-product-transfer-copy">

            <strong>
                Transferir stock
            </strong>

            <small>
                Mover unidades entre Mercado y Peluquería
            </small>

        </span>

        <span
            class="mobile-product-transfer-arrow"
            aria-hidden="true"
        >
            ›
        </span>

    </button>

</section>

        </div>
    `;

}

function abrirProductSheetMobile(
    producto,
    usuario,
    opciones = {}
){

    let tiendaVenta =
        obtenerTiendaVentaMobile();

    let cantidad =
        1;


    function obtenerDisponibleActual(){

        return obtenerStockDisponibleCarritoMobile(
            producto,
            {
                sucursalId:
                    tiendaVenta,

                descontarCantidadActual:
                    true
            }
        );

    }


    let stockDisponible =
        obtenerDisponibleActual();


    if(stockDisponible <= 0){

        cantidad =
            0;

    }


    const sheet =
        OverlayMobile.bottomSheet({

            clase:
                "mobile-product-sheet-overlay",

            eyebrow:
                producto.categoria ||
                "PRODUCTO",

            titulo:
                producto.producto,

            descripcion:
                "Selecciona la tienda y la cantidad.",

            contenido:
                construirContenidoProductSheet(
                    producto,
                    usuario
                ),

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Agregar al carrito",

            alConfirmar:
                function(){

                    stockDisponible =
                        obtenerDisponibleActual();


                    if(stockDisponible <= 0){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                `No hay stock disponible en ${
                                    tiendaVenta === "sucursal"
                                        ? "Peluquería"
                                        : "Mercado"
                                }.`

                        });

                        return false;

                    }


                    if(
                        cantidad <= 0 ||
                        cantidad > stockDisponible
                    ){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                `Solo puedes agregar ${stockDisponible} unidad(es).`

                        });

                        return false;

                    }


                    if(
                        typeof opciones
                            .alAgregar ===
                        "function"
                    ){

                        const resultado =
                            opciones.alAgregar({
                                producto,
                                cantidad,
                                tiendaVenta
                            });


                        if(
                            resultado?.operacion &&
                            resultado.operacion
                                .completada === false
                        ){

                            OverlayMobile.toast({

                                tipo:
                                    "warning",

                                mensaje:
                                    resultado.operacion
                                        .motivo ===
                                        "sin-stock"
                                            ? `No hay stock en ${
                                                resultado.operacion
                                                    .nombreTienda
                                            }.`
                                            : `Stock disponible: ${
                                                resultado.operacion
                                                    .stockDisponible
                                            }.`

                            });

                            return false;

                        }

                    }


                    OverlayMobile.toast({

                        tipo:
                            "success",

                        mensaje:
                            `${cantidad} unidad(es) agregadas desde ${
                                tiendaVenta === "sucursal"
                                    ? "Peluquería"
                                    : "Mercado"
                            }.`

                    });

                    return true;

                }

        });


    function actualizarControlesCantidad(){

        stockDisponible =
            obtenerDisponibleActual();


        if(stockDisponible <= 0){

            cantidad =
                0;

        }else{

            cantidad =
                Math.max(
                    1,
                    Math.min(
                        cantidad,
                        stockDisponible
                    )
                );

        }


        const salida =
            sheet.body?.querySelector(
                "[data-product-quantity]"
            );

        const botonMenos =
            sheet.body?.querySelector(
                '[data-product-quantity-action="minus"]'
            );

        const botonMas =
            sheet.body?.querySelector(
                '[data-product-quantity-action="plus"]'
            );

        const salidaMaximo =
            sheet.body?.querySelector(
                "[data-product-quantity-max]"
            );

        const ayuda =
            sheet.body?.querySelector(
                "[data-product-quantity-help]"
            );

        const stockVisible =
            sheet.body?.querySelector(
                "[data-product-store-stock]"
            );

        const nombreVisible =
            sheet.body?.querySelector(
                "[data-product-store-name]"
            );

        const nombreSeleccionado =
            sheet.body?.querySelector(
                "[data-product-selected-store-label]"
            );

        const puntoEstado =
            sheet.body?.querySelector(
                "[data-product-store-status-dot]"
            );

        const nombreTienda =
            tiendaVenta === "sucursal"
                ? "Peluquería"
                : "Mercado";


        if(salida){

            salida.textContent =
                cantidad;

        }


        if(botonMenos){

            botonMenos.disabled =
                cantidad <= 1;

        }


        if(botonMas){

            botonMas.disabled =
                stockDisponible <= 0 ||
                cantidad >= stockDisponible;

        }


        if(salidaMaximo){

            salidaMaximo.textContent =
                `Máximo ${stockDisponible}`;

        }


        if(stockVisible){

            stockVisible.textContent =
                stockDisponible > 0
                    ? `${stockDisponible} disponibles`
                    : "Sin stock disponible";

        }


        if(nombreVisible){

            nombreVisible.textContent =
                nombreTienda;

        }


        if(nombreSeleccionado){

            nombreSeleccionado.textContent =
                nombreTienda;

        }


        if(puntoEstado){

            puntoEstado.classList.toggle(
                "has-stock",
                stockDisponible > 0
            );

            puntoEstado.classList.toggle(
                "no-stock",
                stockDisponible <= 0
            );

        }


        if(ayuda){

            ayuda.textContent =
                stockDisponible <= 0
                    ? `No hay unidades disponibles para agregar desde ${nombreTienda}.`
                    : `${stockDisponible} unidad(es) disponibles para agregar.`;

        }


        sheet.confirmButton?.toggleAttribute(
            "disabled",
            stockDisponible <= 0
        );

    }


    async function cambiarTiendaDesdeSheet(
        nuevaTienda
    ){

        if(
            nuevaTienda ===
            tiendaVenta
        ){

            return;

        }


        const resumenCarrito =
            obtenerResumenCarritoMobile();


        if(resumenCarrito.items.length > 0){

            const confirmado =
                await OverlayMobile.confirm({

                    icono:
                        "🏪",

                    titulo:
                        "Cambiar tienda de venta",

                    mensaje:
                        "El carrito actual pertenece a otra tienda. Para cambiar de tienda debemos vaciarlo.",

                    textoCancelar:
                        "Mantener carrito",

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


        tiendaVenta =
            cambiarTiendaVentaMobile(
                nuevaTienda
            );


        cantidad =
            1;


        sheet.body
            ?.querySelectorAll(
                "[data-product-store]"
            )
            .forEach(function(boton){

                const activo =
                    boton.dataset
                        .productStore ===
                    tiendaVenta;

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


        actualizarControlesCantidad();

    }


    sheet.body
        ?.addEventListener(
            "click",
            async function(evento){

                const botonTransferir =
    evento.target.closest(
        "[data-product-transfer]"
    );


if(botonTransferir){

    if(
        typeof opciones
            .alTransferir ===
        "function"
    ){

        opciones.alTransferir({

            producto,

            usuario,

            tiendaVenta,

            cerrarProductSheet:
                sheet.cerrar

        });

    }


    return;

}

                const botonTienda =
                    evento.target.closest(
                        "[data-product-store]"
                    );


                if(botonTienda){

                    await cambiarTiendaDesdeSheet(
                        botonTienda.dataset
                            .productStore
                    );

                    return;

                }


                const botonCantidad =
                    evento.target.closest(
                        "[data-product-quantity-action]"
                    );


                if(
                    !botonCantidad ||
                    botonCantidad.disabled
                ){

                    return;

                }


                const accion =
                    botonCantidad.dataset
                        .productQuantityAction;


                stockDisponible =
                    obtenerDisponibleActual();


                if(accion === "plus"){

                    cantidad =
                        Math.min(
                            cantidad + 1,
                            stockDisponible
                        );

                }


                if(accion === "minus"){

                    cantidad =
                        Math.max(
                            1,
                            cantidad - 1
                        );

                }


                actualizarControlesCantidad();

            }
        );


    actualizarControlesCantidad();


    return sheet;

}


export {

    construirProductCardMobile,

    abrirProductSheetMobile,

    activarSmartImagesMobile,

    obtenerStockTiendasProducto,

    obtenerStockTotalProducto,

    obtenerNombreSucursalMobile,

    establecerMapaSucursalesMobile

};