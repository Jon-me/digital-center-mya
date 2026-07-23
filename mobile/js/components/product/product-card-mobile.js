// =====================================================
// DIGITAL CENTER M&A
// MOBILE PRODUCT CARD
// FASE M7.2.1 - PRODUCT CARD PREMIUM
// =====================================================

import {
    OverlayMobile
} from "../overlay/overlay-mobile.js";


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

    const sucursalUsuario =
        usuario?.sucursalId ||
        "principal";

    const stockTiendaUsuario =
        Number(
            obtenerStockTiendasProducto(
                producto
            )[
                sucursalUsuario
            ] || 0
        );

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
                                    stockTiendaUsuario > 0
                                        ? "has-stock"
                                        : "no-stock"
                                }
                            "
                            aria-hidden="true"
                        ></span>

                        <span>

                            <small>
                                Tu tienda
                            </small>

                            <strong>

                                ${
                                    stockTiendaUsuario > 0
                                        ? `${stockTiendaUsuario} disponibles`
                                        : "Sin stock"
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

                    <strong>
                        Máximo ${stockTiendaUsuario}
                    </strong>

                </header>

                <div class="mobile-product-quantity">

                    <button
                        type="button"
                        data-product-quantity-action="minus"
                        aria-label="Reducir cantidad"
                    >
                        −
                    </button>

                    <div class="mobile-product-quantity-value">

                        <small>
                            Unidades
                        </small>

                        <strong data-product-quantity>
                            1
                        </strong>

                    </div>

                    <button
                        type="button"
                        data-product-quantity-action="plus"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>

            </section>

        </div>
    `;

}


function abrirProductSheetMobile(
    producto,
    usuario,
    opciones = {}
){

    let cantidad =
        1;

    const stockTiendaUsuario =
        Number(
            obtenerStockTiendasProducto(
                producto
            )[
                usuario?.sucursalId ||
                "principal"
            ] || 0
        );

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
                "Elige la cantidad para tu tienda.",

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

                    if(stockTiendaUsuario <= 0){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                "No hay stock en tu tienda. Solicítalo a otra sucursal."

                        });

                        return false;

                    }

                    if(cantidad > stockTiendaUsuario){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                "La cantidad supera el stock de tu tienda."

                        });

                        return false;

                    }

                    if(
                        typeof opciones
                            .alAgregar ===
                        "function"
                    ){

                        opciones.alAgregar({
                            producto,
                            cantidad
                        });

                    }

                    OverlayMobile.toast({

                        tipo:
                            "success",

                        mensaje:
                            `${cantidad} unidad(es) agregadas al carrito.`

                    });

                    return true;

                }

        });

    sheet.body
        ?.addEventListener(
            "click",
            function(evento){

                const boton =
                    evento.target.closest(
                        "[data-product-quantity-action]"
                    );

                if(!boton){

                    return;

                }

                const accion =
                    boton.dataset
                        .productQuantityAction;

                if(accion === "plus"){

                    cantidad++;

                }

                if(accion === "minus"){

                    cantidad =
                        Math.max(
                            1,
                            cantidad - 1
                        );

                }

                const salida =
                    sheet.body.querySelector(
                        "[data-product-quantity]"
                    );

                if(salida){

                    salida.textContent =
                        cantidad;

                }

            }
        );

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