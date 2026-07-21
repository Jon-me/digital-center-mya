// =====================================================
// DIGITAL CENTER M&A
// MOBILE MÁS VIEW
// FASE M4.1
// =====================================================

let renderizada =
    false;


export async function renderMasMobile(
    contexto
){

    const {

        contenedor,

        usuario

    } = contexto;


    if(renderizada){

        return;

    }


    const esAdmin =
        usuario?.rol === "admin";


    contenedor.innerHTML = `
        <div class="mobile-section">

            <section class="mobile-card">

                <div
                    style="
                        font-size:34px;
                        margin-bottom:12px;
                    "
                >
                    ☰
                </div>

                <h1
                    class="mobile-card-title"
                    style="font-size:24px;"
                >
                    Más opciones
                </h1>

                <p class="mobile-card-copy">
                    Herramientas disponibles para
                    ${esAdmin
                        ? "administración."
                        : "el vendedor."}
                </p>

            </section>

            <section class="mobile-section">

                <button
                    type="button"
                    class="mobile-button"
                >
                    🛡 Garantías
                </button>

                ${
                    esAdmin
                        ? `
                            <button
                                type="button"
                                class="mobile-button"
                            >
                                📊 Reportes
                            </button>

                            <button
                                type="button"
                                class="mobile-button"
                            >
                                ⚙️ Configuración
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="mobile-button"
                    onclick="window.cerrarSesionMobile()"
                >
                    ↪ Cerrar sesión
                </button>

            </section>

        </div>
    `;


    renderizada =
        true;

}


export function reiniciarMasMobile(){

    renderizada =
        false;

}