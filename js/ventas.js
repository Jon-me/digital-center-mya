// =====================================================
// DIGITAL CENTER M&A
// VENTAS MODULE
// FASE 5 - BLOQUE A
// =====================================================

export function crearVentas(deps){

    const {
    state,

    db,
    collection,
    doc,
    getDoc,
    runTransaction,

    obtenerFechaISO,
    obtenerStockTiendas,
    tiendasSistema,
    obtenerDescuento,
    obtenerPagosMixtos,
    calcularTotalPagado,
    mostrarCarrito,
    construirHTMLBoleta
} = deps;

    async function validarStockAntesDeImprimir(){

        let tiendaVenta =
            document.getElementById("tiendaVenta").value || "principal";

        for(let item of state.carrito){

            let productoRef = doc(db, "productos", item.id);
            let productoSnap = await getDoc(productoRef);

            if(!productoSnap.exists()){
                alert("Producto no encontrado: " + item.producto);
                return false;
            }

            let productoData = productoSnap.data();
            let stockTiendas = obtenerStockTiendas(productoData);
            let cantidad = Number(item.cantidad || 0);

            if(stockTiendas[tiendaVenta] < cantidad){

                alert(
                    "Stock insuficiente en " +
                    tiendasSistema[tiendaVenta] +
                    " para: " +
                    item.producto
                );

                return false;
            }
        }

        return true;
    }

    function calcularTotalesBoleta(){

    let total = 0;
    let descuento = obtenerDescuento();

    state.carrito.forEach(function(item){
        total += Number(item.subtotal || 0);
    });

    let totalFinal = total - descuento;

    if(totalFinal < 0){
        totalFinal = 0;
    }

    return {
        total,
        descuento,
        totalFinal
    };
}

function construirDetallePagos(pagos){

    let detallePagos = "";

    if(pagos.efectivo > 0){
        detallePagos += `Efectivo: S/ ${pagos.efectivo.toFixed(2)}<br>`;
    }

    if(pagos.yape > 0){
        detallePagos += `Yape: S/ ${pagos.yape.toFixed(2)}<br>`;
    }

    if(pagos.plin > 0){
        detallePagos += `Plin: S/ ${pagos.plin.toFixed(2)}<br>`;
    }

    if(pagos.tarjeta > 0){
        detallePagos += `Tarjeta: S/ ${pagos.tarjeta.toFixed(2)}<br>`;
    }

    if(pagos.transferencia > 0){
        detallePagos += `Transferencia: S/ ${pagos.transferencia.toFixed(2)}<br>`;
    }

    return detallePagos || "Pagos mixtos";
}

async function obtenerNumeroBoleta(){

    let numeroVenta = "";

    await runTransaction(db, async function(transaction){

        let correlativoRef = doc(db, "configuracion", "boletas");
        let correlativoSnap = await transaction.get(correlativoRef);

        let ultimoNumero = 0;

        if(correlativoSnap.exists()){
            ultimoNumero = Number(correlativoSnap.data().ultimoNumero || 0);
        }

        let nuevoNumero = ultimoNumero + 1;

        transaction.set(
            correlativoRef,
            {
                ultimoNumero: nuevoNumero
            },
            { merge: true }
        );

        numeroVenta = String(nuevoNumero).padStart(6, "0");

    });

    return numeroVenta;
}

function validarPagoBoleta(totalFinal, pagos){

    let totalPagado =
        pagos.efectivo +
        pagos.yape +
        pagos.plin +
        pagos.tarjeta +
        pagos.transferencia;

    if(Math.abs(totalPagado - totalFinal) > 0.01){

        alert(
            "⚠️ No puedes imprimir la boleta.\n\n" +
            "El pago no coincide con el total.\n\n" +
            "Total venta: S/ " + totalFinal.toFixed(2) + "\n" +
            "Pagado: S/ " + totalPagado.toFixed(2)
        );

        return false;
    }

    return true;
}

function imprimirHTML(html){

    return new Promise(function(resolve){

        let iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";

        document.body.appendChild(iframe);

        let documento = iframe.contentWindow.document;

        documento.open();
        documento.write(html);
        documento.close();

        function imprimirAhora(){

            setTimeout(function(){

                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                setTimeout(function(){

                    document.body.removeChild(iframe);

                    let clienteNombre = document.getElementById("clienteNombre");
                    let clienteDni = document.getElementById("clienteDni");

                    if(clienteNombre){
                        clienteNombre.disabled = false;
                        clienteNombre.focus();
                    }

                    if(clienteDni){
                        clienteDni.disabled = false;
                    }

                    resolve();

                }, 1000);

            }, 300);
        }

        function imprimirCuandoImagenesCarguen(){

            let imagenes = iframe.contentDocument.images;
            let totalImagenes = imagenes.length;
            let cargadas = 0;

            if(totalImagenes === 0){
                imprimirAhora();
                return;
            }

            for(let img of imagenes){

                if(img.complete){
                    cargadas++;
                } else {
                    img.onload = function(){
                        cargadas++;
                        if(cargadas === totalImagenes){
                            imprimirAhora();
                        }
                    };

                    img.onerror = function(){
                        cargadas++;
                        if(cargadas === totalImagenes){
                            imprimirAhora();
                        }
                    };
                }
            }

            if(cargadas === totalImagenes){
                imprimirAhora();
            }
        }

        imprimirCuandoImagenesCarguen();

    });
}

async function imprimirBoleta(){

    if(state.carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let fecha = new Date().toLocaleDateString();
    let hora = new Date().toLocaleTimeString();

    let pagos = obtenerPagosMixtos();

    let {
        total,
        descuento,
        totalFinal
    } = calcularTotalesBoleta();

    if(!validarPagoBoleta(totalFinal, pagos)){
        return;
    }

    let stockDisponible = await validarStockAntesDeImprimir();

    if(!stockDisponible){
        return;
    }

    let numeroVenta = await obtenerNumeroBoleta();

    let detallePagos = construirDetallePagos(pagos);

    let clienteNombre =
        document.getElementById("clienteNombre").value || "CLIENTE GENERAL";

    let clienteDni =
        document.getElementById("clienteDni").value || "-";

    let html = construirHTMLBoleta({
        numeroVenta,
        fecha,
        hora,
        vendedor: localStorage.getItem("nombreActivo") || "Vendedor",
        clienteNombre,
        clienteDni,
        detallePagos,
        carrito: state.carrito,
        total,
        descuento,
        totalFinal
    });

    await imprimirHTML(html);

    return numeroVenta;
}

async function finalizarVenta(numeroBoleta = "SIN IMPRESION"){

    if(state.carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let total = 0;
    let ganancia = 0;
    let descuento = obtenerDescuento();
    let metodoPago = "Pagos mixtos";

    let tiendaVenta =
        document.getElementById("tiendaVenta").value || "principal";

    state.carrito.forEach(function(item){

        total += Number(item.subtotal || 0);

        ganancia +=
            (Number(item.precio || 0) - Number(item.precioCompra || 0)) *
            Number(item.cantidad || 0);

    });

    let totalFinal = total - descuento;

    if(totalFinal < 0){
        totalFinal = 0;
    }

    let pagos = obtenerPagosMixtos();

    let totalPagado =
        pagos.efectivo +
        pagos.yape +
        pagos.plin +
        pagos.tarjeta +
        pagos.transferencia;

    if(Math.abs(totalPagado - totalFinal) > 0.01){

        alert(
            "⚠️ El pago no coincide con el total.\n\n" +
            "Total venta: S/ " + totalFinal.toFixed(2) + "\n" +
            "Pagado: S/ " + totalPagado.toFixed(2)
        );

        return;
    }

    let clienteNombre =
        document.getElementById("clienteNombre").value || "CLIENTE GENERAL";

    let clienteDni =
        document.getElementById("clienteDni").value || "-";

    let venta = {
        numeroBoleta: numeroBoleta,
        fecha: new Date().toLocaleDateString(),
        fechaISO: obtenerFechaISO(),
        hora: new Date().toLocaleTimeString(),
        clienteNombre: clienteNombre,
        clienteDni: clienteDni,
        vendedor: localStorage.getItem("nombreActivo") || "Sin vendedor",
        productos: JSON.parse(JSON.stringify(state.carrito)),
        descuento: descuento,
        metodoPago: metodoPago,
        tiendaVenta: tiendaVenta,
        tiendaVentaNombre: tiendasSistema[tiendaVenta],
        pagos: pagos,
        total: totalFinal,
        ganancia: ganancia - descuento
    };

    try{

        await runTransaction(db, async function(transaction){

            for(let item of state.carrito){

                let productoRef = doc(db, "productos", item.id);
                let productoSnap = await transaction.get(productoRef);

                if(!productoSnap.exists()){
                    throw new Error("Producto no encontrado");
                }

                let productoData = productoSnap.data();
                let stockTiendas = obtenerStockTiendas(productoData);
                let cantidadDescontar = Number(item.cantidad || 0);

                if(stockTiendas[tiendaVenta] < cantidadDescontar){
                    throw new Error(
                        "Stock insuficiente en " +
                        tiendasSistema[tiendaVenta] +
                        " para: " +
                        item.producto
                    );
                }

                stockTiendas[tiendaVenta] -= cantidadDescontar;

                let nuevoStockTotal =
                    stockTiendas.principal +
                    stockTiendas.sucursal;

                transaction.update(productoRef, {
                    stock: nuevoStockTotal,
                    stockTiendas: stockTiendas
                });
            }

            let ventaRef = doc(collection(db, "ventas"));
            transaction.set(ventaRef, venta);

            if(numeroBoleta !== "SIN IMPRESION"){

                let boletaRef = doc(collection(db, "boletas"));

                transaction.set(boletaRef, {
                    ...venta,
                    estado: "activa",
                    creadaEn: new Date().toISOString()
                });
            }

        });

    }catch(error){

        alert(error.message);
        return;
    }

    state.carrito = [];

    localStorage.removeItem("carrito");

    let descuentoInput = document.getElementById("descuentoVenta");
    let pagoEfectivo = document.getElementById("pagoEfectivo");
    let pagoYape = document.getElementById("pagoYape");
    let pagoPlin = document.getElementById("pagoPlin");
    let pagoTarjeta = document.getElementById("pagoTarjeta");
    let pagoTransferencia = document.getElementById("pagoTransferencia");

    if(descuentoInput){ descuentoInput.value = ""; }
    if(pagoEfectivo){ pagoEfectivo.value = ""; }
    if(pagoYape){ pagoYape.value = ""; }
    if(pagoPlin){ pagoPlin.value = ""; }
    if(pagoTarjeta){ pagoTarjeta.value = ""; }
    if(pagoTransferencia){ pagoTransferencia.value = ""; }

    calcularTotalPagado();
    mostrarCarrito();

    setTimeout(function(){
        alert("✅ Venta realizada correctamente");
    }, 150);
}

    return {
    validarStockAntesDeImprimir,
    calcularTotalesBoleta,
    construirDetallePagos,
    obtenerNumeroBoleta,
    validarPagoBoleta,
    imprimirHTML,
    imprimirBoleta,
    finalizarVenta
};

}