// =====================================================
// DIGITAL CENTER M&A
// PRODUCT STUDIO MOBILE
// M13.3.1 — APPLE PRODUCT STUDIO
// =====================================================

let renderizada =
    false;


export async function renderProductStudioMobile(
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

        contenedor.innerHTML = `
            <section class="product-studio-access-denied">

                <div class="product-studio-access-icon">
                    🔒
                </div>

                <h1>
                    Acceso restringido
                </h1>

                <p>
                    Product Studio está disponible
                    únicamente para administradores.
                </p>

                <button
                    type="button"
                    class="product-studio-secondary-button"
                    data-mobile-go="inicio"
                >
                    Volver al inicio
                </button>

            </section>
        `;

        return;

    }


    contenedor.innerHTML = `
        <div class="product-studio">

            <header class="product-studio-hero">

                <button
                    type="button"
                    class="product-studio-back-button"
                    data-product-studio-back
                    aria-label="Volver"
                >
                    <span aria-hidden="true">
                        ‹
                    </span>

                    <span>
                        Más
                    </span>
                </button>

                <div class="product-studio-hero-glow"></div>

                <div class="product-studio-brand-mark">
                    <span>
                        DC
                    </span>
                </div>

                <span class="product-studio-eyebrow">
                    DIGITAL CENTER M&A
                </span>

                <h1>
                    Product Studio
                </h1>

                <p>
                    Diseña, organiza y controla todo
                    tu catálogo desde un solo lugar.
                </p>

                <div class="product-studio-status">

                    <span class="product-studio-status-dot"></span>

                    <span>
                        Catálogo conectado en tiempo real
                    </span>

                </div>

            </header>


            <main class="product-studio-content">

                <section class="product-studio-primary-action">

                    <button
                        type="button"
                        class="product-studio-create-card"
                        data-product-studio-action="nuevo"
                    >

                        <span class="product-studio-create-glow"></span>

                        <span class="product-studio-create-icon">
                            ＋
                        </span>

                        <span class="product-studio-create-copy">

                            <small>
                                CREAR
                            </small>

                            <strong>
                                Nuevo producto
                            </strong>

                            <span>
                                Registra identidad, stock,
                                precios e imagen.
                            </span>

                        </span>

                        <span class="product-studio-chevron">
                            ›
                        </span>

                    </button>

                </section>


                <section class="product-studio-section">

                    <div class="product-studio-section-header">

                        <div>

                            <span>
                                HERRAMIENTAS
                            </span>

                            <h2>
                                Gestión del catálogo
                            </h2>

                        </div>

                        <span class="product-studio-section-count">
                            4 módulos
                        </span>

                    </div>


                    <div class="product-studio-grid">

                        <button
                            type="button"
                            class="product-studio-tool-card"
                            data-product-studio-action="catalogo"
                        >

                            <span
                                class="
                                    product-studio-tool-icon
                                    is-catalog
                                "
                            >
                                ◫
                            </span>

                            <span class="product-studio-tool-copy">

                                <strong>
                                    Catálogo
                                </strong>

                                <small>
                                    Buscar, editar y gestionar
                                    productos.
                                </small>

                            </span>

                            <span class="product-studio-tool-arrow">
                                ›
                            </span>

                        </button>


                        <button
                            type="button"
                            class="product-studio-tool-card"
                            data-product-studio-action="stock"
                        >

                            <span
                                class="
                                    product-studio-tool-icon
                                    is-stock
                                "
                            >
                                ▤
                            </span>

                            <span class="product-studio-tool-copy">

                                <strong>
                                    Stock
                                </strong>

                                <small>
                                    Mercado, Peluquería
                                    y existencias totales.
                                </small>

                            </span>

                            <span class="product-studio-tool-arrow">
                                ›
                            </span>

                        </button>


                        <button
                            type="button"
                            class="product-studio-tool-card"
                            data-product-studio-action="imagenes"
                        >

                            <span
                                class="
                                    product-studio-tool-icon
                                    is-images
                                "
                            >
                                ◉
                            </span>

                            <span class="product-studio-tool-copy">

                                <strong>
                                    Imágenes
                                </strong>

                                <small>
                                    Fotografía y presentación
                                    del catálogo.
                                </small>

                            </span>

                            <span class="product-studio-tool-arrow">
                                ›
                            </span>

                        </button>


                        <button
                            type="button"
                            class="product-studio-tool-card"
                            data-product-studio-action="categorias"
                        >

                            <span
                                class="
                                    product-studio-tool-icon
                                    is-category
                                "
                            >
                                ◇
                            </span>

                            <span class="product-studio-tool-copy">

                                <strong>
                                    Categorías
                                </strong>

                                <small>
                                    Organización inteligente
                                    de productos.
                                </small>

                            </span>

                            <span class="product-studio-tool-arrow">
                                ›
                            </span>

                        </button>

                    </div>

                </section>


                <section class="product-studio-insight">

                    <div class="product-studio-insight-icon">
                        ✦
                    </div>

                    <div>

                        <span>
                            PRODUCT STUDIO
                        </span>

                        <strong>
                            Preparado para crecer
                        </strong>

                        <p>
                            Esta arquitectura permitirá incorporar
                            escáner, importación, proveedores y
                            automatización sin reconstruir el módulo.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    `;


    const botonVolver =
        contenedor.querySelector(
            "[data-product-studio-back]"
        );


    if(botonVolver){

        botonVolver.addEventListener(
            "click",
            function(){

                if(
                    typeof navegar ===
                    "function"
                ){

                    navegar(
                        "mas"
                    );

                }

            }
        );

    }


contenedor
    .querySelectorAll(
        "[data-product-studio-action]"
    )
    .forEach(function(boton){

        boton.addEventListener(
            "click",
            function(){

                const accion =
                    boton.dataset
                        .productStudioAction;


                boton.classList.add(
                    "is-pressed"
                );


                window.setTimeout(
                    function(){

                        boton.classList.remove(
                            "is-pressed"
                        );

                    },
                    220
                );


                if(
                    accion === "nuevo" &&
                    typeof navegar === "function"
                ){

                    navegar(
                        "productnew"
                    );

                    return;

                }


                console.info(
                    "Product Studio Mobile:",
                    accion
                );

            }
        );

    });


renderizada =
    true;

}


export function reiniciarProductStudioMobile(){

    renderizada =
        false;

}