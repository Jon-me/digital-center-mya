// =====================================================
// DIGITAL CENTER M&A
// MOBILE VENTAS VIEW
// FASE M4.1
// =====================================================

let renderizada =
    false;


export async function renderVentasMobile(
    contexto
){

    const {
        contenedor
    } = contexto;


    if(renderizada){

        return;

    }


    contenedor.innerHTML = `
        <section class="mobile-card">

            <div
                style="
                    font-size:34px;
                    margin-bottom:12px;
                "
            >
                🛒
            </div>

            <h1
                class="mobile-card-title"
                style="font-size:24px;"
            >
                Ventas
            </h1>

            <p class="mobile-card-copy">
                Aquí construiremos el catálogo,
                carrito y proceso de cobro móvil.
            </p>

        </section>
    `;


    renderizada =
        true;

}


export function reiniciarVentasMobile(){

    renderizada =
        false;

}