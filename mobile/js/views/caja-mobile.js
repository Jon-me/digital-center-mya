// =====================================================
// DIGITAL CENTER M&A
// MOBILE CAJA VIEW
// FASE M4.1
// =====================================================

let renderizada =
    false;


export async function renderCajaMobile(
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
                💰
            </div>

            <h1
                class="mobile-card-title"
                style="font-size:24px;"
            >
                Caja
            </h1>

            <p class="mobile-card-copy">
                Aquí construiremos apertura,
                movimientos, gastos y cierre de caja.
            </p>

        </section>
    `;


    renderizada =
        true;

}


export function reiniciarCajaMobile(){

    renderizada =
        false;

}