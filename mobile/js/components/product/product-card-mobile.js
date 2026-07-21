// =====================================================
// DIGITAL CENTER M&A
// MOBILE PRODUCT CARD
// FASE M5.1
// =====================================================

import {
    OverlayMobile
} from "../overlay/overlay-mobile.js";


const NOMBRES_SUCURSALES_MOBILE = {

    principal:
        "Mercado",

    sucursal:
        "Peluquería"

};


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


function obtenerStockTiendasProducto(
    producto
){

    const stockTiendas = {

        principal:
            0,

        sucursal:
            0,

        ...(
            producto?.stockTiendas ||
            {}
        )

    };

    Object.keys(stockTiendas)
        .forEach(function(sucursalId){

            stockTiendas[sucursalId] =
                Number(
                    stockTiendas[sucursalId] ||
                    0
                );

        });

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
            >
        `;

    }

    return `
        <div class="mobile-product-image-placeholder">
            📦
        </div>
    `;

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

                    ${
                        esTiendaUsuario
                            ? "📍"
                            : "🏪"
                    }

                    ${escaparHTMLProducto(
                        obtenerNombreSucursalMobile(
                            sucursalId
                        )
                    )}

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

    const disponibleOtraTienda =
        tieneStockOtraSucursal(
            producto,
            usuario?.sucursalId ||
            "principal"
        );

    return `
        <button
            type="button"
            class="mobile-product-card"
            data-product-id="${escaparHTMLProducto(producto.id)}"
            aria-label="Ver ${escaparHTMLProducto(producto.producto)}"
        >

            <div class="mobile-product-image-wrap">

                ${construirImagenProducto(producto)}

            </div>

            <div class="mobile-product-info">

                <div class="mobile-product-topline">

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

                </div>

                <h3 class="mobile-product-name">
                    ${escaparHTMLProducto(producto.producto)}
                </h3>

                <strong class="mobile-product-price">
                    ${formatearMonedaProducto(
                        producto.precio
                    )}
                </strong>

                <div class="mobile-product-stock-summary">

                    ${construirResumenStock(
                        producto,
                        usuario
                    )}

                </div>

            </div>

            ${
                disponibleOtraTienda
                    ? `
                        <div class="mobile-product-other-store">
                            💡 Sin stock en tu tienda,
                            pero disponible en otra sucursal.
                        </div>
                    `
                    : ""
            }

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
                usuario?.sucursalId ===
                sucursalId;

            return `
                <div class="mobile-product-stock-row">

                    <div class="mobile-product-stock-store">

                        <strong>
                            🏪 ${escaparHTMLProducto(
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

                    </div>

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

                </div>
            `;

        })
        .join("");

}


function construirContenidoProductSheet(
    producto,
    usuario
){

    const stockTotal =
        obtenerStockTotalProducto(
            producto
        );

    return `
        <div class="mobile-product-sheet">

            <section class="mobile-product-sheet-summary">

                <div class="mobile-product-sheet-image">

                    ${
                        producto.imagen
                            ? `
                                <img
                                    src="${escaparHTMLProducto(producto.imagen)}"
                                    alt="${escaparHTMLProducto(producto.producto)}"
                                >
                            `
                            : `
                                <span style="font-size:38px;">
                                    📦
                                </span>
                            `
                    }

                </div>

                <div>

                    <h3 class="mobile-product-sheet-name">
                        ${escaparHTMLProducto(producto.producto)}
                    </h3>

                    <div class="mobile-product-sheet-meta">

                        <span>
                            Código:
                            ${escaparHTMLProducto(
                                producto.codigo ||
                                "S/C"
                            )}
                        </span>

                        <span>
                            Categoría:
                            ${escaparHTMLProducto(
                                producto.categoria ||
                                "Sin categoría"
                            )}
                        </span>

                        <span>
                            Stock total:
                            ${stockTotal}
                        </span>

                    </div>

                    <div class="mobile-product-sheet-price">
                        ${formatearMonedaProducto(
                            producto.precio
                        )}
                    </div>

                </div>

            </section>

            <section class="mobile-section">

                <header class="mobile-section-header">

                    <h2>
                        Stock por tienda
                    </h2>

                    <small>
                        Todas las sucursales
                    </small>

                </header>

                <div class="mobile-product-stock-list">

                    ${construirStockSheet(
                        producto,
                        usuario
                    )}

                </div>

            </section>

            <section class="mobile-product-quantity">

                <button
                    type="button"
                    data-product-quantity-action="minus"
                    aria-label="Reducir cantidad"
                >
                    −
                </button>

                <div class="mobile-product-quantity-value">

                    <small>
                        Cantidad
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

            eyebrow:
                producto.categoria ||
                "PRODUCTO",

            titulo:
                producto.producto,

            descripcion:
                "Consulta existencias y elige la cantidad.",

            contenido:
                construirContenidoProductSheet(
                    producto,
                    usuario
                ),

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Agregar",

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

    obtenerStockTiendasProducto,

    obtenerStockTotalProducto,

    obtenerNombreSucursalMobile

};