// =====================================================
// DIGITAL CENTER M&A
// MOBILE INVENTARIO VIEW
// FASE M4.1
// =====================================================

let renderizada =
    false;


export async function renderInventarioMobile(
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
                📦
            </div>

            <h1
                class="mobile-card-title"
                style="font-size:24px;"
            >
                Inventario
            </h1>

            <p class="mobile-card-copy">
                Aquí mostraremos productos,
                stock por sucursal y búsqueda móvil.
            </p>

        </section>
    `;


    renderizada =
        true;

}


export function reiniciarInventarioMobile(){

    renderizada =
        false;

}