// =====================================================
// DIGITAL CENTER M&A
// PRODUCT EDITOR MOBILE
// M13.1
// =====================================================

import {

    OverlayMobile

} from "../overlay/overlay-mobile.js";


export function abrirProductEditorMobile(
    opciones = {}
){

    const {

        producto = {},

        usuario = null,

        alGuardar = null,

        alEliminar = null

    } = opciones;


    let imagenSeleccionada =
        null;


    let urlPreviewImagen =
        null;


    if(!producto){

        return;

    }


    const sheet =
        OverlayMobile.bottomSheet({

            clase:
                "mobile-product-editor",

            eyebrow:
                "PRODUCT EDITOR",

            titulo:
                producto.producto ||
                "Producto",

            descripcion:
                "Editar información del producto.",

            contenido:
                construirContenidoEditorMobile(
                    producto
                ),

            textoCancelar:
                "Cancelar",

            textoConfirmar:
                "Guardar cambios",

            cerrarAlTocarFondo:
                false,

            alConfirmar:
                async function(){

                    const resultado =
                        leerDatosEditorMobile(
                            sheet.body
                        );


                    if(!resultado.valido){

                        OverlayMobile.toast({

                            tipo:
                                "warning",

                            mensaje:
                                resultado.mensaje

                        });


                        resultado.campo
                            ?.focus();


                        resultado.campo
                            ?.classList.add(
                                "has-error"
                            );


                        setTimeout(function(){

                            resultado.campo
                                ?.classList.remove(
                                    "has-error"
                                );

                        }, 700);


                        return false;

                    }


                    if(
                        typeof alGuardar ===
                        "function"
                    ){

                        return await alGuardar({

                            producto,

                            usuario,

                            cambios:
                                resultado.datos,

                            imagen:
                                imagenSeleccionada,

                            sheet

                        });

                    }


                    return false;

                }

        });


    /*
     * ELIMINAR PRODUCTO
     */
    sheet.body
        ?.addEventListener(

            "click",

            function(evento){

                const eliminar =
                    evento.target.closest(
                        "[data-editor-delete]"
                    );


                if(!eliminar){

                    return;

                }


                if(
                    typeof alEliminar ===
                    "function"
                ){

                    alEliminar({

                        producto,

                        usuario,

                        sheet

                    });

                }

            }

        );


    /*
     * CAMBIAR FOTOGRAFÍA
     */
    const botonImagen =
        sheet.body?.querySelector(
            "[data-editor-image-button]"
        );


    const inputImagen =
        sheet.body?.querySelector(
            "[data-editor-image-input]"
        );


    const elementoPreviewImagen =
        sheet.body?.querySelector(
            ".mobile-product-editor-photo img"
        );


    botonImagen
        ?.addEventListener(

            "click",

            function(){

                inputImagen?.click();

            }

        );


    inputImagen
        ?.addEventListener(

            "change",

            function(){

                const archivo =
                    inputImagen.files?.[0];


                if(!archivo){

                    return;

                }


                if(
                    !String(
                        archivo.type || ""
                    ).startsWith(
                        "image/"
                    )
                ){

                    OverlayMobile.toast({

                        tipo:
                            "warning",

                        mensaje:
                            "Selecciona un archivo de imagen válido."

                    });


                    inputImagen.value =
                        "";


                    return;

                }


                const limiteBytes =
                    5 * 1024 * 1024;


                if(
                    Number(
                        archivo.size || 0
                    ) >
                    limiteBytes
                ){

                    OverlayMobile.toast({

                        tipo:
                            "warning",

                        mensaje:
                            "La imagen no puede superar los 5 MB."

                    });


                    inputImagen.value =
                        "";


                    return;

                }


                if(urlPreviewImagen){

                    URL.revokeObjectURL(
                        urlPreviewImagen
                    );

                }


                urlPreviewImagen =
                    URL.createObjectURL(
                        archivo
                    );


                if(elementoPreviewImagen){

                    elementoPreviewImagen.src =
                        urlPreviewImagen;

                }


                imagenSeleccionada =
                    archivo;


                OverlayMobile.toast({

                    tipo:
                        "success",

                    mensaje:
                        "Nueva fotografía seleccionada."

                });

            }

        );


    return sheet;

}

function leerDatosEditorMobile(
    contenedor
){

    if(!contenedor){

        return {

            valido:
                false,

            mensaje:
                "No se pudo leer el formulario del producto.",

            campo:
                null

        };

    }


    const codigoInput =
        contenedor.querySelector(
            "[data-editor-codigo]"
        );

    const productoInput =
        contenedor.querySelector(
            "[data-editor-producto]"
        );

    const nombreBoletaInput =
        contenedor.querySelector(
            "[data-editor-nombre-boleta]"
    );

    const categoriaInput =
        contenedor.querySelector(
            "[data-editor-categoria]"
        );

    const compraInput =
        contenedor.querySelector(
            "[data-editor-compra]"
        );

    const ventaInput =
        contenedor.querySelector(
            "[data-editor-venta]"
        );


    const codigo =
        String(
            codigoInput?.value || ""
        ).trim();

    const nombreProducto =
        String(
            productoInput?.value || ""
        ).trim();

    const nombreBoleta =
        String(
            nombreBoletaInput?.value || ""
        ).trim();

    const categoria =
        String(
            categoriaInput?.value || ""
        ).trim();

    const precioCompra =
        normalizarNumeroEditorMobile(
            compraInput?.value
        );

    const precio =
        normalizarNumeroEditorMobile(
            ventaInput?.value
        );


    if(!codigo){

        return {

            valido:
                false,

            mensaje:
                "Ingresa el código del producto.",

            campo:
                codigoInput

        };

    }


    if(!nombreProducto){

        return {

            valido:
                false,

            mensaje:
                "Ingresa el nombre del producto.",

            campo:
                productoInput

        };

    }


    if(!categoria){

        return {

            valido:
                false,

            mensaje:
                "Ingresa la categoría del producto.",

            campo:
                categoriaInput

        };

    }


    if(
        !Number.isFinite(
            precioCompra
        )
    ){

        return {

            valido:
                false,

            mensaje:
                "El precio de compra no es válido.",

            campo:
                compraInput

        };

    }


    if(
        !Number.isFinite(
            precio
        )
    ){

        return {

            valido:
                false,

            mensaje:
                "El precio de venta no es válido.",

            campo:
                ventaInput

        };

    }


    if(precioCompra < 0){

        return {

            valido:
                false,

            mensaje:
                "El precio de compra no puede ser negativo.",

            campo:
                compraInput

        };

    }


    if(precio < 0){

        return {

            valido:
                false,

            mensaje:
                "El precio de venta no puede ser negativo.",

            campo:
                ventaInput

        };

    }


    return {

        valido:
            true,

        mensaje:
            "",

        campo:
            null,

        datos: {

            codigo,

            producto:
                nombreProducto,

            nombreBoleta,    

            categoria,

            precioCompra:
                redondearPrecioEditorMobile(
                    precioCompra
                ),

            precio:
                redondearPrecioEditorMobile(
                    precio
                )

        }

    };

}



function normalizarNumeroEditorMobile(
    valor
){

    const texto =
        String(
            valor ?? ""
        )
            .trim()
            .replace(
                ",",
                "."
            );


    if(texto === ""){

        return Number.NaN;

    }


    return Number(
        texto
    );

}



function redondearPrecioEditorMobile(
    valor
){

    return Math.round(
        Number(valor) * 100
    ) / 100;

}

function construirContenidoEditorMobile(
    producto
){

    return `

        <section
            class="
                mobile-product-editor-hero
            "
        >

            <div
                class="
                    mobile-product-editor-photo
                "
            >

                <img

                    src="${
                        producto.imagen || ""
                    }"

                    alt="${
                        producto.producto
                    }"

                >

            </div>

            <div
                class="
                    mobile-product-editor-info
                "
            >

                <h3>

                    ${
                        producto.producto
                    }

                </h3>

                <span>

                    Código:
                    ${
                        producto.codigo
                    }

                </span>

                <small>

                    ${
                        producto.categoria
                    }

                </small>

            </div>

        </section>


        <section
            class="
                mobile-product-editor-card
            "
        >

            <label>

                Código

            </label>

            <input

                type="text"

                value="${
                    producto.codigo || ""
                }"

                data-editor-codigo

            >


            <label>

                Producto

            </label>

            <input

                type="text"

                value="${
                    producto.producto || ""
                }"

                data-editor-producto

            >

<label>

    Nombre para boleta

</label>

<input

    type="text"

    maxlength="80"

    placeholder="Ej. Samsung A36"

    value="${
        producto.nombreBoleta || ""
    }"

    data-editor-nombre-boleta

>

<small
    class="
        mobile-product-editor-help
    "
>
    Opcional. Si está vacío, se imprimirá el nombre completo.
</small>


            <label>

                Categoría

            </label>

            <input

                type="text"

                value="${
                    producto.categoria || ""
                }"

                data-editor-categoria

            >

        </section>


        <section
            class="
                mobile-product-editor-card
            "
        >

            <label>

                Precio Compra

            </label>

            <input

                type="number"

                inputmode="decimal"

                value="${
                    producto.precioCompra || 0
                }"

                data-editor-compra

            >


            <label>

                Precio Venta

            </label>

            <input

                type="number"

                inputmode="decimal"

                value="${
                    producto.precio || 0
                }"

                data-editor-venta

            >

        </section>


        <section
            class="
                mobile-product-editor-card
            "
        >

<button

    type="button"

    class="
        mobile-product-editor-image-button
    "

    data-editor-image-button

>

    📷 Cambiar fotografía

</button>


<input

    type="file"

    accept="image/*"

    data-editor-image-input

    hidden

>

        </section>


        <section
            class="
                mobile-product-editor-danger
            "
        >

            <button

                type="button"

                class="
                    mobile-product-editor-delete
                "

                data-editor-delete

            >

                🗑 Eliminar producto

            </button>

        </section>

    `;

}