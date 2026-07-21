// =====================================================
// DIGITAL CENTER M&A
// MOBILE INVENTARIO VIEW
// FASE M5.1 - PRODUCT CARDS
// =====================================================

import {

    construirProductCardMobile,

    abrirProductSheetMobile

} from "../components/product/product-card-mobile.js";


let renderizada =
    false;

let productosPrueba =
    [];


export async function renderInventarioMobile(
    contexto
){

    const {

        contenedor,

        usuario

    } = contexto;


    if(!renderizada){

        productosPrueba =
            crearProductosPruebaMobile();


        contenedor.innerHTML = `
            <div class="mobile-catalog">

                <section class="mobile-card">

                    <span class="mobile-badge mobile-badge-success">
                        Product Cards M5.1
                    </span>

                    <h1
                        class="mobile-card-title"
                        style="
                            margin-top:13px;
                            font-size:24px;
                        "
                    >
                        Inventario móvil
                    </h1>

                    <p class="mobile-card-copy">
                        Toca un producto para consultar
                        el stock y elegir la cantidad.
                    </p>

                </section>

                <section class="mobile-section">

                    <header class="mobile-section-header">

                        <h2>
                            Productos
                        </h2>

                        <small>
                            ${productosPrueba.length} disponibles
                        </small>

                    </header>

                    <div
                        id="mobileCatalogGrid"
                        class="mobile-catalog-grid"
                    ></div>

                </section>

            </div>
        `;


        const grid =
            contenedor.querySelector(
                "#mobileCatalogGrid"
            );


        if(grid){

            grid.innerHTML =
                productosPrueba
                    .map(function(producto){

                        return construirProductCardMobile(
                            producto,
                            usuario
                        );

                    })
                    .join("");

        }


        contenedor.addEventListener(
            "click",
            function(evento){

                const tarjeta =
                    evento.target.closest(
                        "[data-product-id]"
                    );

                if(!tarjeta){

                    return;

                }

                const producto =
                    productosPrueba.find(
                        function(item){

                            return (
                                item.id ===
                                tarjeta.dataset.productId
                            );

                        }
                    );


                if(!producto){

                    return;

                }


                abrirProductSheetMobile(
                    producto,
                    usuario,
                    {

                        alAgregar:
                            function(detalle){

                                console.info(
                                    "Producto móvil agregado:",
                                    detalle
                                );

                            }

                    }
                );

            }
        );


        renderizada =
            true;

    }

}


function crearProductosPruebaMobile(){

    return [

        {
            id:
                "demo-a36",

            codigo:
                "SM-A366B",

            producto:
                "Samsung Galaxy A36 5G 256GB",

            categoria:
                "Celulares",

            precio:
                899,

            imagen:
                "",

            stockTiendas: {
                principal:
                    0,
                sucursal:
                    6
            }
        },

        {
            id:
                "demo-note14",

            codigo:
                "RN14-256",

            producto:
                "Xiaomi Redmi Note 14 256GB",

            categoria:
                "Celulares",

            precio:
                769,

            imagen:
                "",

            stockTiendas: {
                principal:
                    8,
                sucursal:
                    3
            }
        },

        {
            id:
                "demo-cargador",

            codigo:
                "CARG-25W",

            producto:
                "Cargador Samsung 25W Tipo C",

            categoria:
                "Cargadores",

            precio:
                65,

            imagen:
                "",

            stockTiendas: {
                principal:
                    14,
                sucursal:
                    0
            }
        },

        {
            id:
                "demo-pantalla",

            codigo:
                "LCD-A15",

            producto:
                "Pantalla Samsung Galaxy A15",

            categoria:
                "Pantallas",

            precio:
                145,

            imagen:
                "",

            stockTiendas: {
                principal:
                    2,
                sucursal:
                    4
            }
        }

    ];

}


export function reiniciarInventarioMobile(){

    renderizada =
        false;

    productosPrueba =
        [];

}