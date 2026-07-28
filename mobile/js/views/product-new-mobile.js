// =====================================================
// DIGITAL CENTER M&A
// PRODUCT STUDIO — NUEVO PRODUCTO
// M13.3.2 — PREMIUM LIVE EXPERIENCE
// =====================================================

import {
    crearProductoMobile
} from "../services/productos-mobile-service.js";


import {
    OverlayMobile
} from "../components/overlay/overlay-mobile.js";

let renderizada = false;

let imagenTemporalURL = null;

let guardandoProductoMobile = false;

const SELECTORES_PRODUCT_NEW = {

    formulario:
        "#mobileProductNewForm",

    imagenInput:
        "#mobileProductNewImage",

    imagenPreview:
        "#mobileProductNewPreviewImage",

    imagenVacia:
        "#mobileProductNewPreviewEmpty",

    imagenNombre:
        "#mobileProductNewImageName",

    codigo:
        "#mobileProductNewCode",

    nombre:
        "#mobileProductNewName",

    categoria:
        "#mobileProductNewCategory",

    stockPrincipal:
        "#mobileProductNewStockPrincipal",

    stockSucursal:
        "#mobileProductNewStockSucursal",

    precioCompra:
        "#mobileProductNewPurchasePrice",

    precioVenta:
        "#mobileProductNewSalePrice",

    previewNombre:
        "#mobileProductNewPreviewName",

    previewCategoria:
        "#mobileProductNewPreviewCategory",

    previewPrecio:
        "#mobileProductNewPreviewPrice",

    previewStock:
        "#mobileProductNewPreviewStock",

    previewCodigo:
        "#mobileProductNewPreviewCode",

    ganancia:
        "#mobileProductNewProfit",

    margen:
        "#mobileProductNewMargin",

    progreso:
        "#mobileProductNewProgress",

    progresoTexto:
        "#mobileProductNewProgressText",

    estado:
        "#mobileProductNewStatus",

    botonGuardar:
        "#mobileProductNewSave"

};


export async function renderProductNewMobile(
    contexto
){

    const {
        contenedor,
        usuario,
        navegar
    } = contexto;


    if(!contenedor){

        return;

    }


    if(usuario?.rol !== "admin"){

        renderAccesoRestringido(
            contenedor,
            navegar
        );

        return;

    }


    destruirImagenTemporal();


    contenedor.innerHTML = `
        <div class="product-new">

            <div class="product-new-aurora product-new-aurora-one"></div>
            <div class="product-new-aurora product-new-aurora-two"></div>
            <div class="product-new-noise"></div>


            <header class="product-new-header">

                <button
                    type="button"
                    class="product-new-back"
                    data-product-new-back
                    aria-label="Volver a Product Studio"
                >
                    <span aria-hidden="true">‹</span>
                    <span>Product Studio</span>
                </button>


                <div class="product-new-title-row">

                    <div>

                        <span class="product-new-eyebrow">
                            PRODUCT STUDIO
                        </span>

                        <h1>
                            Nuevo producto
                        </h1>

                        <p>
                            Diseña su presentación, inventario
                            y valor comercial.
                        </p>

                    </div>


                    <div
                        id="mobileProductNewStatus"
                        class="product-new-status"
                    >
                        <span class="product-new-status-light"></span>
                        <span>En construcción</span>
                    </div>

                </div>


                <div class="product-new-progress-shell">

                    <div class="product-new-progress-copy">

                        <span>
                            Preparación
                        </span>

                        <strong
                            id="mobileProductNewProgressText"
                        >
                            0%
                        </strong>

                    </div>

                    <div
                        class="product-new-progress-track"
                        role="progressbar"
                        aria-label="Progreso del producto"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow="0"
                    >
                        <span
                            id="mobileProductNewProgress"
                            class="product-new-progress-value"
                        ></span>
                    </div>

                </div>

            </header>


            <form
                id="mobileProductNewForm"
                class="product-new-form"
                novalidate
            >

                <!-- ====================================
                     PREVIEW PRINCIPAL
                ===================================== -->

                <section class="product-new-preview">

                    <div class="product-new-preview-glow"></div>

                    <div class="product-new-preview-top">

                        <span class="product-new-preview-chip">
                            LIVE PREVIEW
                        </span>

                        <span
                            id="mobileProductNewPreviewCode"
                            class="product-new-preview-code"
                        >
                            SIN CÓDIGO
                        </span>

                    </div>


                    <div class="product-new-preview-media">

                        <div
                            id="mobileProductNewPreviewEmpty"
                            class="product-new-preview-empty"
                        >
                            <span class="product-new-preview-box">
                                ◇
                            </span>

                            <strong>
                                Tu producto aparecerá aquí
                            </strong>

                            <small>
                                Agrega una fotografía para comenzar.
                            </small>
                        </div>


                        <img
                            id="mobileProductNewPreviewImage"
                            class="product-new-preview-image"
                            alt="Vista previa del producto"
                            hidden
                        >

                    </div>


                    <div class="product-new-preview-information">

                        <span
                            id="mobileProductNewPreviewCategory"
                            class="product-new-preview-category"
                        >
                            NUEVO PRODUCTO
                        </span>

                        <h2
                            id="mobileProductNewPreviewName"
                        >
                            Nombre del producto
                        </h2>


                        <div class="product-new-preview-bottom">

                            <div>

                                <small>
                                    PRECIO DE VENTA
                                </small>

                                <strong
                                    id="mobileProductNewPreviewPrice"
                                >
                                    S/ 0.00
                                </strong>

                            </div>


                            <div class="product-new-preview-stock">

                                <span class="product-new-preview-stock-dot"></span>

                                <span
                                    id="mobileProductNewPreviewStock"
                                >
                                    Sin stock
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                <!-- ====================================
                     IMAGEN
                ===================================== -->

                <section class="product-new-panel">

                    <div class="product-new-panel-header">

                        <div class="product-new-panel-number">
                            01
                        </div>

                        <div>

                            <span>
                                PRESENTACIÓN
                            </span>

                            <h2>
                                Imagen del producto
                            </h2>

                        </div>

                    </div>


                    <label
                        class="product-new-image-selector"
                        for="mobileProductNewImage"
                    >

                        <input
                            id="mobileProductNewImage"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            hidden
                        >

                        <span class="product-new-image-icon">
                            ＋
                        </span>

                        <span class="product-new-image-copy">

                            <strong>
                                Añadir fotografía
                            </strong>

                            <small
                                id="mobileProductNewImageName"
                            >
                                PNG, JPG o WEBP
                            </small>

                        </span>

                        <span class="product-new-image-action">
                            Elegir
                        </span>

                    </label>

                </section>


                <!-- ====================================
                     IDENTIDAD
                ===================================== -->

                <section class="product-new-panel">

                    <div class="product-new-panel-header">

                        <div class="product-new-panel-number">
                            02
                        </div>

                        <div>

                            <span>
                                IDENTIDAD
                            </span>

                            <h2>
                                Información principal
                            </h2>

                        </div>

                    </div>


                    <div class="product-new-field-grid">

                        <label class="product-new-field">

                            <span class="product-new-field-label">
                                Código
                            </span>

                            <div class="product-new-input-shell">

                                <span class="product-new-input-icon">
                                    #
                                </span>

                                <input
                                    id="mobileProductNewCode"
                                    type="text"
                                    inputmode="text"
                                    autocomplete="off"
                                    maxlength="40"
                                    placeholder="Ej. CEL-A36-001"
                                >

                            </div>

                            <small>
                                Código interno único.
                            </small>

                        </label>


                        <label class="product-new-field">

                            <span class="product-new-field-label">
                                Nombre
                            </span>

                            <div class="product-new-input-shell">

                                <span class="product-new-input-icon">
                                    ✦
                                </span>

                                <input
                                    id="mobileProductNewName"
                                    type="text"
                                    autocomplete="off"
                                    maxlength="120"
                                    placeholder="Ej. Samsung Galaxy A36"
                                >

                            </div>

                            <small>
                                Nombre visible en ventas y boleta.
                            </small>

                        </label>


                        <label class="product-new-field">

                            <span class="product-new-field-label">
                                Categoría
                            </span>

                            <div class="product-new-input-shell">

                                <span class="product-new-input-icon">
                                    ◇
                                </span>

                                <input
                                    id="mobileProductNewCategory"
                                    type="text"
                                    list="mobileProductCategories"
                                    autocomplete="off"
                                    maxlength="60"
                                    placeholder="Selecciona o escribe"
                                >

                            </div>

                            <datalist id="mobileProductCategories">
                                <option value="Celulares"></option>
                                <option value="Accesorios"></option>
                                <option value="Cargadores"></option>
                                <option value="Audífonos"></option>
                                <option value="Pantallas"></option>
                                <option value="Vidrios"></option>
                                <option value="Cases"></option>
                                <option value="Servicio Técnico"></option>
                            </datalist>

                            <small>
                                Ayuda a organizar y buscar el producto.
                            </small>

                        </label>

                    </div>

                </section>


                <!-- ====================================
                     INVENTARIO
                ===================================== -->

                <section class="product-new-panel">

                    <div class="product-new-panel-header">

                        <div class="product-new-panel-number">
                            03
                        </div>

                        <div>

                            <span>
                                INVENTARIO
                            </span>

                            <h2>
                                Stock por tienda
                            </h2>

                        </div>

                    </div>


                    <div class="product-new-stock-grid">

                        <label class="product-new-stock-card">

                            <span class="product-new-store-icon">
                                🏪
                            </span>

                            <span class="product-new-store-copy">

                                <small>
                                    TIENDA
                                </small>

                                <strong>
                                    Mercado
                                </strong>

                            </span>

                            <input
                                id="mobileProductNewStockPrincipal"
                                type="number"
                                inputmode="numeric"
                                min="0"
                                step="1"
                                value="0"
                            >

                        </label>


                        <label class="product-new-stock-card">

                            <span class="product-new-store-icon">
                                💈
                            </span>

                            <span class="product-new-store-copy">

                                <small>
                                    TIENDA
                                </small>

                                <strong>
                                    Peluquería
                                </strong>

                            </span>

                            <input
                                id="mobileProductNewStockSucursal"
                                type="number"
                                inputmode="numeric"
                                min="0"
                                step="1"
                                value="0"
                            >

                        </label>

                    </div>


                    <div class="product-new-stock-total">

                        <span>
                            Stock inicial total
                        </span>

                        <strong data-product-new-total-stock>
                            0 unidades
                        </strong>

                    </div>

                </section>


                <!-- ====================================
                     PRECIOS
                ===================================== -->

                <section class="product-new-panel">

                    <div class="product-new-panel-header">

                        <div class="product-new-panel-number">
                            04
                        </div>

                        <div>

                            <span>
                                INFORMACIÓN COMERCIAL
                            </span>

                            <h2>
                                Compra y venta
                            </h2>

                        </div>

                    </div>


                    <div class="product-new-price-grid">

                        <label class="product-new-price-field">

                            <span>
                                Precio de compra
                            </span>

                            <div class="product-new-price-input">

                                <small>
                                    S/
                                </small>

                                <input
                                    id="mobileProductNewPurchasePrice"
                                    type="number"
                                    inputmode="decimal"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                >

                            </div>

                        </label>


                        <label class="product-new-price-field is-sale">

                            <span>
                                Precio de venta
                            </span>

                            <div class="product-new-price-input">

                                <small>
                                    S/
                                </small>

                                <input
                                    id="mobileProductNewSalePrice"
                                    type="number"
                                    inputmode="decimal"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                >

                            </div>

                        </label>

                    </div>


                    <div class="product-new-metrics">

                        <article>

                            <span>
                                GANANCIA
                            </span>

                            <strong
                                id="mobileProductNewProfit"
                            >
                                S/ 0.00
                            </strong>

                            <small>
                                Por unidad
                            </small>

                        </article>


                        <article>

                            <span>
                                MARGEN
                            </span>

                            <strong
                                id="mobileProductNewMargin"
                            >
                                0.00%
                            </strong>

                            <small>
                                Sobre compra
                            </small>

                        </article>

                    </div>

                </section>


                <section class="product-new-ready-card">

                    <div class="product-new-ready-icon">
                        ✦
                    </div>

                    <div>

                        <span>
                            PRODUCT STUDIO
                        </span>

                        <strong>
                            Completa la información esencial
                        </strong>

                        <p>
                            Cuando el producto alcance el 100%,
                            estará preparado para guardarse en el
                            catálogo de Digital Center M&A.
                        </p>

                    </div>

                </section>


                <div
                    class="product-new-footer-spacer"
                    aria-hidden="true"
                ></div>

            </form>


            <footer class="product-new-sticky-footer">

                <div class="product-new-footer-content">

                    <div class="product-new-footer-state">

                        <span class="product-new-footer-dot"></span>

                        <div>

                            <small>
                                ESTADO
                            </small>

                            <strong data-product-new-footer-text>
                                Completa los datos
                            </strong>

                        </div>

                    </div>


                    <button
                        id="mobileProductNewSave"
                        type="button"
                        class="product-new-save"
                        disabled
                    >
                        <span class="product-new-save-icon">
                            ✓
                        </span>

                        <span>
                            Guardar producto
                        </span>
                    </button>

                </div>

            </footer>

        </div>
    `;


inicializarProductNewMobile(
    contenedor,
    usuario,
    navegar
);


    renderizada = true;

}


function inicializarProductNewMobile(
    contenedor,
    usuario,
    navegar
){

    const obtener =
        function(selector){

            return contenedor.querySelector(
                selector
            );

        };


    const elementos = {

        formulario:
            obtener(
                SELECTORES_PRODUCT_NEW.formulario
            ),

        imagenInput:
            obtener(
                SELECTORES_PRODUCT_NEW.imagenInput
            ),

        imagenPreview:
            obtener(
                SELECTORES_PRODUCT_NEW.imagenPreview
            ),

        imagenVacia:
            obtener(
                SELECTORES_PRODUCT_NEW.imagenVacia
            ),

        imagenNombre:
            obtener(
                SELECTORES_PRODUCT_NEW.imagenNombre
            ),

        codigo:
            obtener(
                SELECTORES_PRODUCT_NEW.codigo
            ),

        nombre:
            obtener(
                SELECTORES_PRODUCT_NEW.nombre
            ),

        categoria:
            obtener(
                SELECTORES_PRODUCT_NEW.categoria
            ),

        stockPrincipal:
            obtener(
                SELECTORES_PRODUCT_NEW.stockPrincipal
            ),

        stockSucursal:
            obtener(
                SELECTORES_PRODUCT_NEW.stockSucursal
            ),

        precioCompra:
            obtener(
                SELECTORES_PRODUCT_NEW.precioCompra
            ),

        precioVenta:
            obtener(
                SELECTORES_PRODUCT_NEW.precioVenta
            ),

        previewNombre:
            obtener(
                SELECTORES_PRODUCT_NEW.previewNombre
            ),

        previewCategoria:
            obtener(
                SELECTORES_PRODUCT_NEW.previewCategoria
            ),

        previewPrecio:
            obtener(
                SELECTORES_PRODUCT_NEW.previewPrecio
            ),

        previewStock:
            obtener(
                SELECTORES_PRODUCT_NEW.previewStock
            ),

        previewCodigo:
            obtener(
                SELECTORES_PRODUCT_NEW.previewCodigo
            ),

        ganancia:
            obtener(
                SELECTORES_PRODUCT_NEW.ganancia
            ),

        margen:
            obtener(
                SELECTORES_PRODUCT_NEW.margen
            ),

        progreso:
            obtener(
                SELECTORES_PRODUCT_NEW.progreso
            ),

        progresoTexto:
            obtener(
                SELECTORES_PRODUCT_NEW.progresoTexto
            ),

        estado:
            obtener(
                SELECTORES_PRODUCT_NEW.estado
            ),

        botonGuardar:
            obtener(
                SELECTORES_PRODUCT_NEW.botonGuardar
            ),

        stockTotal:
            obtener(
                "[data-product-new-total-stock]"
            ),

        footerTexto:
            obtener(
                "[data-product-new-footer-text]"
            ),

        progresoTrack:
            obtener(
                ".product-new-progress-track"
            )

    };


    const botonVolver =
        obtener(
            "[data-product-new-back]"
        );


    botonVolver?.addEventListener(
        "click",
        function(){

            destruirImagenTemporal();

            navegar?.(
                "productstudio"
            );

        }
    );


    elementos.imagenInput?.addEventListener(
        "change",
        function(){

            manejarImagenSeleccionada(
                elementos
            );

        }
    );


    elementos.formulario
        ?.querySelectorAll(
            "input"
        )
        .forEach(function(input){

            if(
                input.type === "file"
            ){

                return;

            }

            input.addEventListener(
                "input",
                function(){

                    sanitizarCampoNumerico(
                        input
                    );

                    actualizarExperiencia(
                        elementos
                    );

                }
            );

        });


elementos.botonGuardar?.addEventListener(
    "click",
    async function(){

        if(
            guardandoProductoMobile ||
            elementos.botonGuardar.disabled
        ){

            return;

        }


        const borrador =
            obtenerBorradorProducto(
                elementos
            );


        guardandoProductoMobile =
            true;


        bloquearFormularioProductNewMobile(
            elementos,
            true
        );


        elementos.botonGuardar.classList.add(
            "is-pressed"
        );


        window.setTimeout(
            function(){

                elementos.botonGuardar
                    ?.classList.remove(
                        "is-pressed"
                    );

            },
            180
        );


        const loading =
            OverlayMobile.loading({

                titulo:
                    "Creando producto",

                mensaje:
                    "Subiendo imagen y registrando el producto en Firebase..."

            });


        try{

            const resultado =
                await crearProductoMobile({

                    datos: {

                        codigo:
                            borrador.codigo,

                        producto:
                            borrador.producto,

                        categoria:
                            borrador.categoria,

                        stockPrincipal:
                            borrador.stockPrincipal,

                        stockSucursal:
                            borrador.stockSucursal,

                        precioCompra:
                            borrador.precioCompra,

                        precio:
                            borrador.precio

                    },

                    imagen:
                        borrador.imagen,

                    usuario

                });


            loading.cerrar();


            if(!resultado.completada){

                OverlayMobile.toast({

                    tipo:
                        "danger",

                    mensaje:
                        resultado.mensaje ||
                        "No se pudo crear el producto."

                });


                bloquearFormularioProductNewMobile(
                    elementos,
                    false
                );


                actualizarExperiencia(
                    elementos
                );


                return;

            }


            destruirImagenTemporal();


            vibrarProductNewMobile(
                "success"
            );


            OverlayMobile.toast({

                tipo:
                    "success",

                mensaje:
                    "Producto creado correctamente."

            });


            /*
             * El inventario recibirá automáticamente
             * el producto mediante onSnapshot().
             */
            navegar?.(
                "inventario",
                {
                    forzarRender:
                        true
                }
            );

        }catch(error){

            loading.cerrar();


            console.error(
                "Error guardando producto desde Product Studio:",
                error
            );


            OverlayMobile.toast({

                tipo:
                    "danger",

                mensaje:
                    error?.message ||
                    "Ocurrió un error al crear el producto."

            });


            bloquearFormularioProductNewMobile(
                elementos,
                false
            );


            actualizarExperiencia(
                elementos
            );

        }finally{

            guardandoProductoMobile =
                false;

        }

    }
);


    actualizarExperiencia(
        elementos
    );

}


function manejarImagenSeleccionada(
    elementos
){

    const archivo =
        elementos.imagenInput
            ?.files?.[0];


    destruirImagenTemporal();


    if(!archivo){

        elementos.imagenPreview.hidden =
            true;

        elementos.imagenVacia.hidden =
            false;

        elementos.imagenNombre.textContent =
            "PNG, JPG o WEBP";

        actualizarExperiencia(
            elementos
        );

        return;

    }


    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if(
        !tiposPermitidos.includes(
            archivo.type
        )
    ){

        elementos.imagenInput.value =
            "";

        elementos.imagenNombre.textContent =
            "Formato no permitido";

        actualizarExperiencia(
            elementos
        );

        return;

    }


    imagenTemporalURL =
        URL.createObjectURL(
            archivo
        );


    elementos.imagenPreview.src =
        imagenTemporalURL;

    elementos.imagenPreview.hidden =
        false;

    elementos.imagenVacia.hidden =
        true;

    elementos.imagenNombre.textContent =
        archivo.name;


    actualizarExperiencia(
        elementos
    );

}


function actualizarExperiencia(
    elementos
){

    const borrador =
        obtenerBorradorProducto(
            elementos
        );


    actualizarPreview(
        elementos,
        borrador
    );


    actualizarMetricas(
        elementos,
        borrador
    );


    actualizarStock(
        elementos,
        borrador
    );


    actualizarProgreso(
        elementos,
        borrador
    );

}


function obtenerBorradorProducto(
    elementos
){

    return {

        codigo:
            String(
                elementos.codigo?.value || ""
            ).trim(),

        producto:
            String(
                elementos.nombre?.value || ""
            ).trim(),

        categoria:
            String(
                elementos.categoria?.value || ""
            ).trim(),

        stockPrincipal:
            numeroSeguro(
                elementos.stockPrincipal?.value
            ),

        stockSucursal:
            numeroSeguro(
                elementos.stockSucursal?.value
            ),

        precioCompra:
            numeroSeguro(
                elementos.precioCompra?.value
            ),

        precio:
            numeroSeguro(
                elementos.precioVenta?.value
            ),

        imagen:
            elementos.imagenInput
                ?.files?.[0] || null

    };

}

function bloquearFormularioProductNewMobile(
    elementos,
    bloqueado
){

    elementos.formulario?.setAttribute(
        "aria-busy",
        bloqueado
            ? "true"
            : "false"
    );


    elementos.formulario
        ?.querySelectorAll(
            "input"
        )
        .forEach(function(input){

            input.disabled =
                Boolean(
                    bloqueado
                );

        });


    if(elementos.botonGuardar){

        elementos.botonGuardar.disabled =
            Boolean(
                bloqueado
            );


        elementos.botonGuardar.setAttribute(
            "aria-busy",
            bloqueado
                ? "true"
                : "false"
        );


        const texto =
            elementos.botonGuardar
                .querySelector(
                    "span:last-child"
                );


        if(texto){

            texto.textContent =
                bloqueado
                    ? "Guardando..."
                    : "Guardar producto";

        }

    }


    const botonVolver =
        elementos.formulario
            ?.closest(
                ".product-new"
            )
            ?.querySelector(
                "[data-product-new-back]"
            );


    if(botonVolver){

        botonVolver.disabled =
            Boolean(
                bloqueado
            );

    }


    if(elementos.footerTexto){

        elementos.footerTexto.textContent =
            bloqueado
                ? "Registrando en Firebase"
                : "Preparado para guardar";

    }

}

function vibrarProductNewMobile(
    tipo = "tap"
){

    if(
        !navigator.vibrate
    ){

        return;

    }


    const patrones = {

        tap:
            20,

        success:
            [
                25,
                45,
                35
            ],

        warning:
            [
                45,
                35,
                45
            ]

    };


    navigator.vibrate(
        patrones[tipo] ||
        patrones.tap
    );

}


function actualizarPreview(
    elementos,
    borrador
){

    elementos.previewCodigo.textContent =
        borrador.codigo
            ? borrador.codigo.toUpperCase()
            : "SIN CÓDIGO";


    elementos.previewNombre.textContent =
        borrador.producto ||
        "Nombre del producto";


    elementos.previewCategoria.textContent =
        borrador.categoria
            ? borrador.categoria.toUpperCase()
            : "NUEVO PRODUCTO";


    elementos.previewPrecio.textContent =
        formatoMoneda(
            borrador.precio
        );


    const stockTotal =
        borrador.stockPrincipal +
        borrador.stockSucursal;


    elementos.previewStock.textContent =
        stockTotal > 0
            ? `${stockTotal} ${
                stockTotal === 1
                    ? "unidad"
                    : "unidades"
            }`
            : "Sin stock";

}


function actualizarMetricas(
    elementos,
    borrador
){

    const ganancia =
        borrador.precio -
        borrador.precioCompra;


    const margen =
        borrador.precioCompra > 0
            ? (
                ganancia /
                borrador.precioCompra
            ) * 100
            : 0;


    elementos.ganancia.textContent =
        formatoMoneda(
            ganancia
        );


    elementos.margen.textContent =
        `${margen.toFixed(2)}%`;


    elementos.ganancia.classList.toggle(
        "is-negative",
        ganancia < 0
    );


    elementos.margen.classList.toggle(
        "is-negative",
        margen < 0
    );

}


function actualizarStock(
    elementos,
    borrador
){

    const stockTotal =
        borrador.stockPrincipal +
        borrador.stockSucursal;


    elementos.stockTotal.textContent =
        `${stockTotal} ${
            stockTotal === 1
                ? "unidad"
                : "unidades"
        }`;

}


function actualizarProgreso(
    elementos,
    borrador
){

    const validaciones = [

        Boolean(
            borrador.imagen
        ),

        borrador.codigo.length >= 2,

        borrador.producto.length >= 3,

        borrador.categoria.length >= 2,

        (
            borrador.stockPrincipal >= 0 &&
            borrador.stockSucursal >= 0
        ),

        borrador.precioCompra > 0,

        (
            borrador.precio > 0 &&
            borrador.precio >=
            borrador.precioCompra
        )

    ];


    const completos =
        validaciones.filter(
            Boolean
        ).length;


    const porcentaje =
        Math.round(
            (
                completos /
                validaciones.length
            ) * 100
        );


    const listo =
        porcentaje === 100;


    elementos.progreso.style.width =
        `${porcentaje}%`;

    elementos.progresoTexto.textContent =
        `${porcentaje}%`;

    elementos.progresoTrack?.setAttribute(
        "aria-valuenow",
        String(porcentaje)
    );


    elementos.estado.classList.toggle(
        "is-ready",
        listo
    );


    elementos.estado
        .querySelector("span:last-child")
        .textContent =
            listo
                ? "Producto listo"
                : "En construcción";


    elementos.botonGuardar.disabled =
        !listo;


    elementos.footerTexto.textContent =
        listo
            ? "Preparado para guardar"
            : "Completa los datos";


    document
        .querySelector(".product-new")
        ?.classList.toggle(
            "is-complete",
            listo
        );

}


function sanitizarCampoNumerico(
    input
){

    if(
        input.type !== "number"
    ){

        return;

    }


    if(
        input.value !== "" &&
        Number(input.value) < 0
    ){

        input.value =
            "0";

    }

}


function numeroSeguro(
    valor
){

    const numero =
        Number(valor);


    return Number.isFinite(numero)
        ? Math.max(0, numero)
        : 0;

}


function formatoMoneda(
    valor
){

    const numero =
        Number(valor || 0);


    return `S/ ${numero.toFixed(2)}`;

}


function renderAccesoRestringido(
    contenedor,
    navegar
){

    contenedor.innerHTML = `
        <section class="product-new-access-denied">

            <div>
                🔒
            </div>

            <h1>
                Acceso restringido
            </h1>

            <p>
                La creación de productos está reservada
                para administradores.
            </p>

            <button
                type="button"
                data-product-new-access-back
            >
                Volver
            </button>

        </section>
    `;


    contenedor
        .querySelector(
            "[data-product-new-access-back]"
        )
        ?.addEventListener(
            "click",
            function(){

                navegar?.(
                    "inicio"
                );

            }
        );

}


function destruirImagenTemporal(){

    if(!imagenTemporalURL){

        return;

    }


    URL.revokeObjectURL(
        imagenTemporalURL
    );


    imagenTemporalURL =
        null;

}


export function reiniciarProductNewMobile(){

    destruirImagenTemporal();

    guardandoProductoMobile =
        false;

    renderizada =
        false;

}