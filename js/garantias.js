// =====================================================
// DIGITAL CENTER M&A
// GARANTÍAS MODULE
// FASE 8
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

    function construirProductosGarantia(productos){

        let html = "";

        if(!productos){
            return html;
        }

        productos.forEach(function(item){
            html += `
                <p>📱 ${item.nombreBoleta || item.producto} x ${item.cantidad}</p>
            `;
        });

        return html;
    }

    function construirCardGarantia(id, b){

        const productosHtml = construirProductosGarantia(b.productos);

        return `
            <div class="garantia-card">
                <h3>🧾 ${b.numeroBoleta}</h3>

                <p><strong>Cliente:</strong> ${b.clienteNombre}</p>
                <p><strong>DNI:</strong> ${b.clienteDni}</p>
                <p><strong>Fecha:</strong> ${b.fecha}</p>
                <p><strong>Vendedor:</strong> ${b.vendedor}</p>
                <p><strong>Total:</strong> S/ ${Number(b.total || 0).toFixed(2)}</p>

                <hr>
                ${productosHtml}
                <hr>

                <p>
                    <strong>Estado Garantía:</strong>
                    <span class="${
                        b.estadoGarantia === "Aprobada"
                            ? "estado-aprobada"
                            : b.estadoGarantia === "Rechazada"
                            ? "estado-rechazada"
                            : "estado-pendiente"
                    }">
                        ${b.estadoGarantia || "Pendiente"}
                    </span>
                </p>

                <p><strong>Última atención:</strong> ${b.atendidoGarantia || "-"}</p>
                <p><strong>Fecha garantía:</strong> ${b.fechaGarantia || "-"}</p>

                <textarea
                    id="observacionGarantia-${id}"
                    placeholder="📝 Escribir observación de garantía..."
                >${b.observacionGarantia || ""}</textarea>

                <div class="acciones-garantia">
                    <button onclick="actualizarGarantia('${id}','Aprobada')">
                        ✅ Aprobar Garantía
                    </button>

                    <button onclick="actualizarGarantia('${id}','Rechazada')">
                        ❌ Rechazar Garantía
                    </button>
                </div>
            </div>
        `;
    }

    async function buscarGarantia(){

        let inputGarantia =
            document.querySelector("#contenidoModalPanel #inputGarantia") ||
            document.getElementById("inputGarantia");

        if(!inputGarantia){
            alert("No se encontró el buscador de garantía");
            return;
        }

        let texto = inputGarantia.value.trim();

        if(!texto){
            alert("Ingrese DNI o número de boleta");
            return;
        }

        let resultado =
            document.querySelector("#contenidoModalPanel #resultadoGarantia") ||
            document.getElementById("resultadoGarantia");

        resultado.innerHTML = "Buscando...";

        try{

            let consultaDni = query(
                collection(db, "boletas"),
                where("clienteDni", "==", texto)
            );

            let consultaBoleta = query(
                collection(db, "boletas"),
                where("numeroBoleta", "==", texto)
            );

            let datosDni = await getDocs(consultaDni);
            let datosBoleta = await getDocs(consultaBoleta);

            let html = "";
            let idsMostrados = [];

            datosDni.forEach(function(documento){

                let id = documento.id;

                if(!idsMostrados.includes(id)){
                    idsMostrados.push(id);
                    html += construirCardGarantia(id, documento.data());
                }

            });

            datosBoleta.forEach(function(documento){

                let id = documento.id;

                if(!idsMostrados.includes(id)){
                    idsMostrados.push(id);
                    html += construirCardGarantia(id, documento.data());
                }

            });

            if(html === ""){
                html = "<p style='color:white;'>No se encontraron garantías.</p>";
            }

            resultado.innerHTML = html;

        }catch(error){

            console.error("Error buscando garantía:", error);
            resultado.innerHTML = "<p style='color:white;'>Error buscando garantía.</p>";

        }
    }

    async function actualizarGarantia(idBoleta, estado){

        let observacion =
            document.getElementById("observacionGarantia-" + idBoleta)
            .value
            .trim();

        try{

            await updateDoc(
                doc(db, "boletas", idBoleta),
                {
                    estadoGarantia: estado,
                    observacionGarantia: observacion,
                    fechaGarantia: new Date().toLocaleString(),
                    atendidoGarantia: localStorage.getItem("nombreActivo") || "Sin usuario"
                }
            );

            alert("✅ Garantía " + estado + " correctamente");

            await buscarGarantia();

        }catch(error){

            console.error("Error actualizando garantía:", error);
            alert("No se pudo actualizar la garantía");

        }
    }

    return {
        buscarGarantia,
        actualizarGarantia
    };
}