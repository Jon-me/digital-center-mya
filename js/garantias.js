// =====================================================
// DIGITAL CENTER M&A
// GARANTÍAS MODULE
// FASE 31.3 - Warranty Center Pro
// =====================================================

export function crearGarantias(deps){

    const {
        db,
        collection,
        doc,
        updateDoc,
        query,
        where,
        getDocs
    } = deps;

    function escaparHTML(valor){

        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    function obtenerEstadoGarantia(estado){

        const valor =
            String(estado || "Pendiente")
                .trim();

        if(valor === "Aprobada"){

            return {
                texto: "Aprobada",
                clase: "estado-aprobada",
                icono: "✓"
            };

        }

        if(valor === "Rechazada"){

            return {
                texto: "Rechazada",
                clase: "estado-rechazada",
                icono: "×"
            };

        }

        if(
            valor === "Observación" ||
            valor === "Observacion"
        ){

            return {
                texto: "Observación",
                clase: "estado-pendiente",
                icono: "!"
            };

        }

        return {
            texto: "Pendiente",
            clase: "estado-pendiente",
            icono: "•"
        };

    }

    function construirProductosGarantia(productos){

        if(
            !Array.isArray(productos) ||
            productos.length === 0
        ){

            return `
                <div class="garantia-product-item">

                    <span>
                        Producto no registrado
                    </span>

                    <b>
                        x0
                    </b>

                </div>
            `;

        }

        return productos
            .map(function(item){

                const nombre =
                    item.nombreBoleta ||
                    item.producto ||
                    "Producto sin nombre";

                const cantidad =
                    Number(
                        item.cantidad || 0
                    );

                return `
                    <div class="garantia-product-item">

                        <span>
                            ${escaparHTML(nombre)}
                        </span>

                        <b>
                            x${cantidad}
                        </b>

                    </div>
                `;

            })
            .join("");

    }

    function construirCardGarantia(id, boleta){

        const estado =
            obtenerEstadoGarantia(
                boleta.estadoGarantia
            );

        const productosHtml =
            construirProductosGarantia(
                boleta.productos
            );

        const clienteNombre =
            boleta.clienteNombre ||
            "Cliente no registrado";

        const clienteDni =
            boleta.clienteDni ||
            "Sin DNI";

        const fecha =
            boleta.fecha ||
            "-";

        const vendedor =
            boleta.vendedor ||
            "Sin vendedor";

        const total =
            Number(
                boleta.total || 0
            ).toFixed(2);

        const atendido =
            boleta.atendidoGarantia ||
            "Sin atención registrada";

        const fechaGarantia =
            boleta.fechaGarantia ||
            "Sin actualización";

        const observacion =
            boleta.observacionGarantia ||
            "";

        return `
            <article
                class="garantia-card"
                data-garantia-id="${escaparHTML(id)}"
            >

                <header class="garantia-card-header">

                    <div class="garantia-card-title">

                        <small>
                            COMPROBANTE
                        </small>

                        <h3>
                            ${escaparHTML(
                                boleta.numeroBoleta ||
                                "Sin número de boleta"
                            )}
                        </h3>

                    </div>

                    <span
                        class="garantia-status ${estado.clase}"
                    >
                        ${estado.icono}
                        ${estado.texto}
                    </span>

                </header>

                <div class="garantia-info-grid">

                    <div class="garantia-info-item">

                        <small>
                            Cliente
                        </small>

                        <strong>
                            ${escaparHTML(clienteNombre)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            DNI
                        </small>

                        <strong>
                            ${escaparHTML(clienteDni)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Fecha de venta
                        </small>

                        <strong>
                            ${escaparHTML(fecha)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Vendedor
                        </small>

                        <strong>
                            ${escaparHTML(vendedor)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Total
                        </small>

                        <strong>
                            S/ ${total}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Última atención
                        </small>

                        <strong>
                            ${escaparHTML(atendido)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Fecha garantía
                        </small>

                        <strong>
                            ${escaparHTML(fechaGarantia)}
                        </strong>

                    </div>

                    <div class="garantia-info-item">

                        <small>
                            Estado
                        </small>

                        <strong>
                            ${escaparHTML(estado.texto)}
                        </strong>

                    </div>

                </div>

                <section class="garantia-products">

                    <header class="garantia-products-header">

                        <small>
                            Productos de la venta
                        </small>

                    </header>

                    ${productosHtml}

                </section>

                <section class="garantia-resolution">

                    <div class="garantia-observation">

                        <label
                            for="observacionGarantia-${escaparHTML(id)}"
                        >
                            Observación de garantía
                        </label>

                        <textarea
                            id="observacionGarantia-${escaparHTML(id)}"
                            placeholder="Describe la evaluación, diagnóstico o resolución..."
                        >${escaparHTML(observacion)}</textarea>

                    </div>

                    <div class="acciones-garantia">

                        <button
                            type="button"
                            class="btn-garantia-aprobar"
                            onclick="window.actualizarGarantia(
                                '${escaparHTML(id)}',
                                'Aprobada',
                                this
                            )"
                        >
                            ✓ Aprobar
                        </button>

                        <button
                            type="button"
                            class="btn-garantia-observacion"
                            onclick="window.actualizarGarantia(
                                '${escaparHTML(id)}',
                                'Observación',
                                this
                            )"
                        >
                            ! Observación
                        </button>

                        <button
                            type="button"
                            class="btn-garantia-rechazar"
                            onclick="window.actualizarGarantia(
                                '${escaparHTML(id)}',
                                'Rechazada',
                                this
                            )"
                        >
                            × Rechazar
                        </button>

                    </div>

                </section>

            </article>
        `;

    }

    function obtenerInputGarantia(){

        return (
            document.querySelector(
                "#contenidoModalPanel #inputGarantia"
            ) ||
            document.getElementById(
                "inputGarantia"
            )
        );

    }

    function obtenerResultadoGarantia(){

        return (
            document.querySelector(
                "#contenidoModalPanel #resultadoGarantia"
            ) ||
            document.getElementById(
                "resultadoGarantia"
            )
        );

    }

    function renderEstadoInicial(){

        const resultado =
            obtenerResultadoGarantia();

        if(!resultado){

            return;

        }

        resultado.innerHTML = `
            <div class="warranty-empty">

                <div class="warranty-empty-icon">
                    🛡️
                </div>

                <h3>
                    Warranty Center
                </h3>

                <p>
                    Busca una garantía utilizando
                    el DNI del cliente o el número
                    de boleta.
                </p>

            </div>
        `;

    }

    function renderCargando(){

        const resultado =
            obtenerResultadoGarantia();

        if(!resultado){

            return;

        }

        resultado.innerHTML = `
            <div class="warranty-loading">

                <span>
                    ⏳
                </span>

                <h3>
                    Buscando garantía
                </h3>

                <p>
                    Estamos consultando los registros.
                </p>

            </div>
        `;

    }

    function renderSinResultados(texto){

        const resultado =
            obtenerResultadoGarantia();

        if(!resultado){

            return;

        }

        resultado.innerHTML = `
            <div class="warranty-no-results">

                <span>
                    🔎
                </span>

                <h3>
                    Sin resultados
                </h3>

                <p>
                    No encontramos garantías para
                    “${escaparHTML(texto)}”.
                </p>

            </div>
        `;

    }

    function renderError(){

        const resultado =
            obtenerResultadoGarantia();

        if(!resultado){

            return;

        }

        resultado.innerHTML = `
            <div class="warranty-error">

                <span>
                    ⚠️
                </span>

                <h3>
                    Error en la consulta
                </h3>

                <p>
                    No fue posible buscar la garantía.
                    Revisa la conexión e inténtalo nuevamente.
                </p>

            </div>
        `;

    }

    async function buscarGarantia(){

        const input =
            obtenerInputGarantia();

        const resultado =
            obtenerResultadoGarantia();

        if(!input || !resultado){

            alert(
                "No se encontró el buscador de garantía"
            );

            return;

        }

        const texto =
            input.value.trim();

        if(!texto){

            alert(
                "Ingrese DNI o número de boleta"
            );

            input.focus();

            return;

        }

        renderCargando();

        try{

            const consultaDni =
                query(
                    collection(
                        db,
                        "boletas"
                    ),
                    where(
                        "clienteDni",
                        "==",
                        texto
                    )
                );

            const consultaBoleta =
                query(
                    collection(
                        db,
                        "boletas"
                    ),
                    where(
                        "numeroBoleta",
                        "==",
                        texto
                    )
                );

            const [
                datosDni,
                datosBoleta
            ] = await Promise.all([
                getDocs(consultaDni),
                getDocs(consultaBoleta)
            ]);

            const documentos =
                new Map();

            datosDni.forEach(
                function(documento){

                    documentos.set(
                        documento.id,
                        documento.data()
                    );

                }
            );

            datosBoleta.forEach(
                function(documento){

                    documentos.set(
                        documento.id,
                        documento.data()
                    );

                }
            );

            if(documentos.size === 0){

                renderSinResultados(
                    texto
                );

                return;

            }

            const html =
                Array.from(
                    documentos.entries()
                )
                .map(function([
                    id,
                    boleta
                ]){

                    return construirCardGarantia(
                        id,
                        boleta
                    );

                })
                .join("");

            resultado.innerHTML =
                html;

        }catch(error){

            console.error(
                "Error buscando garantía:",
                error
            );

            renderError();

        }

    }

    function limpiarBusquedaGarantia(){

        const input =
            obtenerInputGarantia();

        if(input){

            input.value = "";
            input.focus();

        }

        renderEstadoInicial();

    }

    async function actualizarGarantia(
        idBoleta,
        estado,
        boton
    ){

        const textarea =
            document.getElementById(
                "observacionGarantia-" +
                idBoleta
            );

        if(!textarea){

            alert(
                "No se encontró el campo de observación"
            );

            return;

        }

        const observacion =
            textarea.value.trim();

        if(
            estado === "Observación" &&
            !observacion
        ){

            alert(
                "Escriba una observación antes de cambiar el estado"
            );

            textarea.focus();

            return;

        }

        const confirmar =
            confirm(
                `¿Cambiar la garantía a "${estado}"?`
            );

        if(!confirmar){

            return;

        }

        const botonesTarjeta =
            boton
                ?.closest(
                    ".acciones-garantia"
                )
                ?.querySelectorAll(
                    "button"
                ) || [];

        botonesTarjeta.forEach(
            function(item){

                item.disabled = true;

            }
        );

        const textoOriginal =
            boton?.textContent || "";

        if(boton){

            boton.textContent =
                "Actualizando...";

        }

        try{

            await updateDoc(
                doc(
                    db,
                    "boletas",
                    idBoleta
                ),
                {
                    estadoGarantia:
                        estado,

                    observacionGarantia:
                        observacion,

                    fechaGarantia:
                        new Date()
                            .toLocaleString(
                                "es-PE"
                            ),

                    atendidoGarantia:
                        localStorage.getItem(
                            "nombreActivo"
                        ) ||
                        "Sin usuario"
                }
            );

            alert(
                `✅ Garantía ${estado} correctamente`
            );

            await buscarGarantia();

        }catch(error){

            console.error(
                "Error actualizando garantía:",
                error
            );

            alert(
                "No se pudo actualizar la garantía"
            );

        }finally{

            botonesTarjeta.forEach(
                function(item){

                    item.disabled = false;

                }
            );

            if(boton){

                boton.textContent =
                    textoOriginal;

            }

        }

    }

    function inicializarGarantias(){

        const input =
            obtenerInputGarantia();

        if(
            !input ||
            input.dataset.inicializado === "true"
        ){

            return;

        }

        input.dataset.inicializado =
            "true";

        input.addEventListener(
            "keydown",
            function(evento){

                if(evento.key === "Enter"){

                    evento.preventDefault();

                    buscarGarantia();

                }

                if(evento.key === "Escape"){

                    limpiarBusquedaGarantia();

                }

            }
        );

        renderEstadoInicial();

    }

    return {

        buscarGarantia,
        limpiarBusquedaGarantia,
        actualizarGarantia,
        inicializarGarantias,
        renderEstadoInicial

    };

}