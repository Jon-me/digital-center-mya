// =====================================================
// DIGITAL CENTER M&A
// MOBILE PRODUCT STOCK MANAGER
// GESTIÓN DE STOCK ENTERPRISE
// =====================================================


import {
    OverlayMobile
} from "../overlay/overlay-mobile.js";


import {
    gestionarStockMobile
} from "../../services/productos-mobile-service.js";

import {
    solicitarAutorizacionAdminMobile
} from "../admin-authorization-mobile.js";

function escaparHTMLStockMobile(
    valor
){

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function obtenerStockGestionMobile(
    producto
){

    const raw =
        producto?.stockTiendas &&
        typeof producto.stockTiendas === "object"
            ? producto.stockTiendas
            : {};


    const tieneStockPorTienda =
        Object.keys(raw).length > 0;


    let mercado =
        Number(
            raw.mercado ??
            raw.principal ??
            0
        );


    const peluqueria =
        Number(
            raw.peluqueria ??
            raw["peluquería"] ??
            raw.sucursal ??
            0
        );


    if(
        !tieneStockPorTienda &&
        Number(producto?.stock || 0) > 0
    ){

        mercado =
            Number(
                producto.stock || 0
            );

    }


    return {
        mercado,
        peluqueria,
        total:
            mercado +
            peluqueria
    };

}

// =====================================================
// PRESENTACIÓN
// =====================================================

function obtenerNombreTiendaStockMobile(
    tienda
){

    return tienda === "peluqueria"
        ? "Peluquería"
        : "Mercado";

}


function obtenerPresentacionMovimientoStockMobile(
    tipo
){

    switch(tipo){

        case "retiro":

            return {
                icono: "−",
                titulo: "Retiro",
                descripcion: "Descontar unidades del inventario."
            };


        case "establecer":

            return {
                icono: "⚙",
                titulo: "Establecer",
                descripcion: "Corregir el stock a una cantidad exacta."
            };


        default:

            return {
                icono: "+",
                titulo: "Ingreso",
                descripcion: "Registrar nueva mercadería recibida."
            };

    }

}


// =====================================================
// CONSTRUIR CONTENIDO
// =====================================================

function construirContenidoGestionStockMobile(
    producto,
    estado
){

    const stock =
        obtenerStockGestionMobile(
            producto
        );


    const stockTienda =
        Number(
            stock[
                estado.tienda
            ] || 0
        );


    let stockResultado =
        stockTienda;


    if(estado.tipo === "ingreso"){

        stockResultado =
            stockTienda +
            estado.cantidad;

    }


    if(estado.tipo === "retiro"){

        stockResultado =
            Math.max(
                0,
                stockTienda -
                    estado.cantidad
            );

    }


    if(estado.tipo === "establecer"){

        stockResultado =
            estado.cantidad;

    }


    return `
        <div class="mobile-stock-manager">

            <section class="mobile-stock-manager-product">

                <div class="mobile-stock-manager-product-copy">

                    <span>
                        PRODUCTO
                    </span>

                    <strong>
                        ${escaparHTMLStockMobile(
                            producto.producto ||
                            "Producto"
                        )}
                    </strong>

                    <small>
                        Código:
                        ${escaparHTMLStockMobile(
                            producto.codigo ||
                            "S/C"
                        )}
                    </small>

                </div>

                <div class="mobile-stock-manager-total">

                    <span>
                        Stock total
                    </span>

                    <strong>
                        ${stock.total}
                    </strong>

                </div>

            </section>


            <section class="mobile-stock-manager-section">

                <header class="mobile-stock-manager-section-header">

                    <span>
                        Tienda
                    </span>

                    <strong>
                        ${escaparHTMLStockMobile(
                            obtenerNombreTiendaStockMobile(
                                estado.tienda
                            )
                        )}
                    </strong>

                </header>


                <div
                    class="mobile-stock-manager-stores"
                    role="group"
                    aria-label="Seleccionar tienda"
                >

                    <button
                        type="button"
                        class="
                            mobile-stock-manager-store
                            ${
                                estado.tienda === "mercado"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-stock-store="mercado"
                        aria-pressed="${
                            estado.tienda === "mercado"
                                ? "true"
                                : "false"
                        }"
                    >

                        <span>
                            Mercado
                        </span>

                        <strong>
                            ${stock.mercado}
                        </strong>

                        <small>
                            unidades
                        </small>

                    </button>


                    <button
                        type="button"
                        class="
                            mobile-stock-manager-store
                            ${
                                estado.tienda === "peluqueria"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-stock-store="peluqueria"
                        aria-pressed="${
                            estado.tienda === "peluqueria"
                                ? "true"
                                : "false"
                        }"
                    >

                        <span>
                            Peluquería
                        </span>

                        <strong>
                            ${stock.peluqueria}
                        </strong>

                        <small>
                            unidades
                        </small>

                    </button>

                </div>

            </section>


            <section class="mobile-stock-manager-section">

                <header class="mobile-stock-manager-section-header">

                    <span>
                        Movimiento
                    </span>

                    <strong>
                        ${
                            obtenerPresentacionMovimientoStockMobile(
                                estado.tipo
                            ).titulo
                        }
                    </strong>

                </header>


                <div
                    class="mobile-stock-manager-types"
                    role="group"
                    aria-label="Tipo de movimiento"
                >

                    <button
                        type="button"
                        class="
                            mobile-stock-manager-type
                            ${
                                estado.tipo === "ingreso"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-stock-type="ingreso"
                    >
                        <span>+</span>
                        <strong>Ingreso</strong>
                        <small>Nueva mercadería</small>
                    </button>


                    <button
                        type="button"
                        class="
                            mobile-stock-manager-type
                            ${
                                estado.tipo === "retiro"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-stock-type="retiro"
                    >
                        <span>−</span>
                        <strong>Retiro</strong>
                        <small>Descontar unidades</small>
                    </button>


                    <button
                        type="button"
                        class="
                            mobile-stock-manager-type
                            ${
                                estado.tipo === "establecer"
                                    ? "is-active"
                                    : ""
                            }
                        "
                        data-stock-type="establecer"
                    >
                        <span>⚙</span>
                        <strong>Establecer</strong>
                        <small>Corrección exacta</small>
                    </button>

                </div>

            </section>


            <section class="mobile-stock-manager-section">

                <header class="mobile-stock-manager-section-header">

                    <span>
                        Cantidad
                    </span>

                    <strong>
                        ${
                            estado.tipo === "establecer"
                                ? "Stock final"
                                : "Unidades"
                        }
                    </strong>

                </header>


                <div class="mobile-stock-manager-quantity">

                    <button
                        type="button"
                        data-stock-quantity-action="minus"
                        aria-label="Reducir cantidad"
                        ${
                            estado.cantidad <= 0
                                ? "disabled"
                                : ""
                        }
                    >
                        −
                    </button>


                    <div class="mobile-stock-manager-quantity-value">

                        <small>
                            ${
                                estado.tipo === "establecer"
                                    ? "Nuevo stock"
                                    : "Cantidad"
                            }
                        </small>

                        <strong data-stock-quantity>
                            ${estado.cantidad}
                        </strong>

                    </div>


                    <button
                        type="button"
                        data-stock-quantity-action="plus"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>

            </section>


            <section class="mobile-stock-manager-preview">

                <div>

                    <small>
                        ${
                            escaparHTMLStockMobile(
                                obtenerNombreTiendaStockMobile(
                                    estado.tienda
                                )
                            )
                        }
                    </small>

                    <strong>
                        ${stockTienda}
                        <span aria-hidden="true">→</span>
                        ${stockResultado}
                    </strong>

                </div>


                <div>

                    <small>
                        Resultado
                    </small>

                    <strong>
                        ${
                            stockResultado === stockTienda
                                ? "Sin cambios"
                                : stockResultado > stockTienda
                                    ? `+${stockResultado - stockTienda}`
                                    : `${stockResultado - stockTienda}`
                        }
                    </strong>

                </div>

            </section>


            <label class="mobile-stock-manager-reason">

                <span>
                    Motivo
                </span>

                <textarea
                    rows="3"
                    maxlength="240"
                    data-stock-reason
                    placeholder="${
                        estado.tipo === "ingreso"
                            ? "Ejemplo: Nueva mercadería recibida"
                            : estado.tipo === "retiro"
                                ? "Indica por qué se retira este stock"
                                : "Indica el motivo de la corrección"
                    }"
                ></textarea>

                <small>
                    ${
                        estado.tipo === "ingreso"
                            ? "Opcional para ingresos."
                            : "Será utilizado en la autorización administrativa."
                    }
                </small>

            </label>

        </div>
    `;

}

// =====================================================
// ABRIR GESTIÓN DE STOCK
// =====================================================

function abrirGestionStockMobile(
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
            tipo: "danger",
            mensaje: "No se encontró el producto."
        });

        return null;

    }


    if(
        String(
            usuario?.rol || ""
        )
            .trim()
            .toLowerCase() !==
        "admin"
    ){

        OverlayMobile.toast({
            tipo: "warning",
            mensaje: "Solo un administrador puede gestionar el stock."
        });

        return null;

    }


    const estado = {

        tienda:
            "mercado",

        tipo:
            "ingreso",

        cantidad:
            1,

        motivo:
            ""

    };


    function obtenerStockActualTienda(){

        const stock =
            obtenerStockGestionMobile(
                producto
            );


        return Number(
            stock[
                estado.tienda
            ] || 0
        );

    }


    function normalizarCantidad(){

        let cantidad =
            Number(
                estado.cantidad || 0
            );


        if(
            !Number.isFinite(
                cantidad
            )
        ){

            cantidad =
                estado.tipo === "establecer"
                    ? 0
                    : 1;

        }


        cantidad =
            Math.max(
                0,
                Math.trunc(
                    cantidad
                )
            );


        if(
            estado.tipo !== "establecer" &&
            cantidad <= 0
        ){

            cantidad =
                1;

        }


        if(
            estado.tipo === "retiro"
        ){

            const disponible =
                obtenerStockActualTienda();


            if(disponible <= 0){

                cantidad =
                    0;

            }else{

                cantidad =
                    Math.min(
                        cantidad,
                        disponible
                    );

            }

        }


        estado.cantidad =
            cantidad;

    }


    normalizarCantidad();


    const sheet =
        OverlayMobile.bottomSheet({

            clase:
                "mobile-stock-manager-overlay",

            eyebrow:
                "GESTIÓN DE STOCK",

            titulo:
                producto.producto ||
                "Producto",

            descripcion:
                "Registra ingresos y ajustes de inventario.",

            contenido:
                construirContenidoGestionStockMobile(
                    producto,
                    estado
                ),

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Confirmar movimiento",

            cerrarAlTocarFondo:
                false,

            alConfirmar:
                async function(){

                    guardarMotivoActual();


                    const stockActual =
                        obtenerStockActualTienda();


                    if(
                        estado.tipo === "ingreso" &&
                        estado.cantidad <= 0
                    ){

                        OverlayMobile.toast({
                            tipo: "warning",
                            mensaje: "Ingresa una cantidad mayor que cero."
                        });

                        return false;

                    }


                    if(
                        estado.tipo === "retiro"
                    ){

                        if(stockActual <= 0){

                            OverlayMobile.toast({
                                tipo: "warning",
                                mensaje:
                                    `No existe stock disponible en ${
                                        obtenerNombreTiendaStockMobile(
                                            estado.tienda
                                        )
                                    }.`
                            });

                            return false;

                        }


                        if(
                            estado.cantidad <= 0 ||
                            estado.cantidad >
                                stockActual
                        ){

                            OverlayMobile.toast({
                                tipo: "warning",
                                mensaje:
                                    `Solo puedes retirar hasta ${stockActual} unidad(es).`
                            });

                            return false;

                        }

                    }


                    if(
                        estado.tipo === "establecer" &&
                        estado.cantidad ===
                            stockActual
                    ){

                        OverlayMobile.toast({
                            tipo: "warning",
                            mensaje: "El nuevo stock es igual al stock actual."
                        });

                        return false;

                    }


                    let motivoFinal =
                        estado.motivo.trim();


                    let usuarioOperacion =
                        usuario;


                    if(
                        estado.tipo === "retiro" ||
                        estado.tipo === "establecer"
                    ){

                        const presentacion =
                            obtenerPresentacionMovimientoStockMobile(
                                estado.tipo
                            );


                        const autorizacion =
                            await solicitarAutorizacionAdminMobile({

                                titulo:
                                    estado.tipo === "retiro"
                                        ? "Autorizar retiro de stock"
                                        : "Autorizar corrección de stock",

                                descripcion:
                                    `${
                                        presentacion.descripcion
                                    } Producto: ${
                                        producto.producto ||
                                        "Producto"
                                    }.`,

                                accion:
                                    estado.tipo === "retiro"
                                        ? `Retirar ${estado.cantidad} unidad(es) de ${
                                            obtenerNombreTiendaStockMobile(
                                                estado.tienda
                                            )
                                        }`
                                        : `Establecer stock de ${
                                            obtenerNombreTiendaStockMobile(
                                                estado.tienda
                                            )
                                        } en ${estado.cantidad} unidad(es)`,

                                solicitarMotivo:
                                    true,

                                motivoObligatorio:
                                    true,

                                etiquetaMotivo:
                                    "Motivo del movimiento",

                                placeholderMotivo:
                                    estado.tipo === "retiro"
                                        ? "Ejemplo: producto dañado, merma o ajuste"
                                        : "Explique por qué se corrige el stock",

                                textoConfirmar:
                                    "Autorizar movimiento"

                            });


                        if(
                            !autorizacion?.autorizado
                        ){

                            return false;

                        }


                        motivoFinal =
                            String(
                                autorizacion.motivo ||
                                motivoFinal ||
                                ""
                            ).trim();


                        /*
                         * Conservamos al usuario de sesión para que
                         * el servicio mantenga su validación de rol.
                         * La identidad del administrador autorizado
                         * se incorpora como contexto adicional.
                         */
                        usuarioOperacion = {
                            ...usuario,

                            autorizadoPor:
                                autorizacion.administrador ||
                                null
                        };

                    }


                    const loading =
                        OverlayMobile.loading({

                            titulo:
                                estado.tipo === "ingreso"
                                    ? "Registrando ingreso"
                                    : estado.tipo === "retiro"
                                        ? "Registrando retiro"
                                        : "Corrigiendo stock",

                            mensaje:
                                "Actualizando inventario en Firebase..."

                        });


                    try{

                        const resultado =
                            await gestionarStockMobile({

                                producto,

                                tienda:
                                    estado.tienda,

                                tipo:
                                    estado.tipo,

                                cantidad:
                                    estado.cantidad,

                                motivo:
                                    motivoFinal,

                                usuario:
                                    usuarioOperacion

                            });


                        loading.cerrar();


                        if(
                            !resultado?.completada
                        ){

                            OverlayMobile.toast({

                                tipo:
                                    "danger",

                                mensaje:
                                    resultado?.mensaje ||
                                    "No se pudo actualizar el stock."

                            });

                            return false;

                        }


                        OverlayMobile.toast({

                            tipo:
                                "success",

                            mensaje:
                                resultado.mensaje ||
                                "Stock actualizado correctamente."

                        });


                        return true;

                    }catch(error){

                        loading.cerrar();


                        console.error(
                            "Error gestionando stock Mobile:",
                            error
                        );


                        OverlayMobile.toast({

                            tipo:
                                "danger",

                            mensaje:
                                error?.message ||
                                "No se pudo actualizar el stock."

                        });


                        return false;

                    }

                }

        });


    function guardarMotivoActual(){

        const textarea =
            sheet.body?.querySelector(
                "[data-stock-reason]"
            );


        estado.motivo =
            textarea?.value ||
            estado.motivo ||
            "";

    }


    function renderizarGestionStock(){

        guardarMotivoActual();

        normalizarCantidad();


        if(!sheet.body){

            return;

        }


        sheet.body.innerHTML =
            construirContenidoGestionStockMobile(
                producto,
                estado
            );


        const textarea =
            sheet.body.querySelector(
                "[data-stock-reason]"
            );


        if(textarea){

            textarea.value =
                estado.motivo;

        }


        actualizarEstadoBotonConfirmar();

    }


    function actualizarEstadoBotonConfirmar(){

        const boton =
            sheet.confirmButton;


        if(!boton){

            return;

        }


        const stockActual =
            obtenerStockActualTienda();


        let deshabilitado =
            false;


        if(
            estado.tipo === "ingreso"
        ){

            deshabilitado =
                estado.cantidad <= 0;

        }


        if(
            estado.tipo === "retiro"
        ){

            deshabilitado =
                stockActual <= 0 ||
                estado.cantidad <= 0 ||
                estado.cantidad >
                    stockActual;

        }


        if(
            estado.tipo === "establecer"
        ){

            deshabilitado =
                estado.cantidad ===
                    stockActual;

        }


        boton.disabled =
            deshabilitado;

    }


    sheet.body?.addEventListener(
        "input",
        function(evento){

            const motivo =
                evento.target.closest(
                    "[data-stock-reason]"
                );


            if(motivo){

                estado.motivo =
                    motivo.value;

            }

        }
    );


    sheet.body?.addEventListener(
        "click",
        function(evento){

            const botonTienda =
                evento.target.closest(
                    "[data-stock-store]"
                );


            if(botonTienda){

                guardarMotivoActual();


                estado.tienda =
                    botonTienda.dataset
                        .stockStore ===
                    "peluqueria"
                        ? "peluqueria"
                        : "mercado";


                if(
                    estado.tipo === "retiro"
                ){

                    estado.cantidad =
                        obtenerStockActualTienda() > 0
                            ? 1
                            : 0;

                }


                renderizarGestionStock();

                return;

            }


            const botonTipo =
                evento.target.closest(
                    "[data-stock-type]"
                );


            if(botonTipo){

                guardarMotivoActual();


                const tipo =
                    botonTipo.dataset
                        .stockType;


                if(
                    ![
                        "ingreso",
                        "retiro",
                        "establecer"
                    ].includes(
                        tipo
                    )
                ){

                    return;

                }


                estado.tipo =
                    tipo;


                if(tipo === "establecer"){

                    estado.cantidad =
                        obtenerStockActualTienda();

                }else if(tipo === "retiro"){

                    estado.cantidad =
                        obtenerStockActualTienda() > 0
                            ? 1
                            : 0;

                }else{

                    estado.cantidad =
                        1;

                }


                renderizarGestionStock();

                return;

            }


            const botonCantidad =
                evento.target.closest(
                    "[data-stock-quantity-action]"
                );


            if(
                !botonCantidad ||
                botonCantidad.disabled
            ){

                return;

            }


            const accion =
                botonCantidad.dataset
                    .stockQuantityAction;


            if(accion === "plus"){

                estado.cantidad +=
                    1;

            }


            if(accion === "minus"){

                estado.cantidad -=
                    1;

            }


            normalizarCantidad();

            renderizarGestionStock();

        }
    );


    actualizarEstadoBotonConfirmar();


    return sheet;

}


export {

    escaparHTMLStockMobile,

    obtenerStockGestionMobile,

    construirContenidoGestionStockMobile,

    abrirGestionStockMobile

};