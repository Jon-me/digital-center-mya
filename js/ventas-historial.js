// =====================================================
// DIGITAL CENTER M&A
// VENTAS HISTORIAL MODULE
// FASE 29.5
// =====================================================

export function crearVentasHistorial(deps){

    const {
        state,
        obtenerFechaISO,
        tiendasSistema,
        construirHTMLReimpresionBoleta,
        imprimirHTML
    } = deps;

    function obtenerDetallePagosVenta(venta){

        if(venta.pagos){

            let detalle = "";

            if(venta.pagos.efectivo > 0){
                detalle += "Efectivo: S/ " + venta.pagos.efectivo.toFixed(2) + "<br>";
            }

            if(venta.pagos.yape > 0){
                detalle += "Yape: S/ " + venta.pagos.yape.toFixed(2) + "<br>";
            }

            if(venta.pagos.plin > 0){
                detalle += "Plin: S/ " + venta.pagos.plin.toFixed(2) + "<br>";
            }

            if(venta.pagos.tarjeta > 0){
                detalle += "Tarjeta: S/ " + venta.pagos.tarjeta.toFixed(2) + "<br>";
            }

            if(venta.pagos.transferencia > 0){
                detalle += "Transferencia: S/ " + venta.pagos.transferencia.toFixed(2);
            }

            return detalle || "No registrado";
        }

        return venta.metodoPago || "No registrado";
    }

    function obtenerProductosVenta(venta){

        if(!venta.productos || venta.productos.length === 0){
            return "Sin productos";
        }

        return venta.productos.map(function(item){
            return (item.nombreBoleta || item.producto) + " x " + item.cantidad;
        }).join("<br>");
    }

    function obtenerCategoriasVenta(venta){

        if(!venta.productos || venta.productos.length === 0){
            return "Sin categoría";
        }

        return venta.productos.map(function(item){

            if(item.categoria){
                return item.categoria;
            }

            let productoEncontrado = state.productos.find(function(p){
                return p.id === item.id;
            });

            return productoEncontrado
                ? productoEncontrado.categoria
                : "Sin categoría";

        }).join("<br>");
    }

    function reimprimirBoletaVenta(index){

        let venta = state.historialVentas[index];

        if(!venta){
            alert("No se encontró la venta");
            return;
        }

        if(!venta.numeroBoleta || venta.numeroBoleta === "SIN IMPRESION"){
            alert("Esta venta no tiene boleta para reimprimir");
            return;
        }

        let detallePagos = obtenerDetallePagosVenta(venta);

        let contenido = construirHTMLReimpresionBoleta(
            venta,
            detallePagos
        );

        imprimirHTML(contenido);
    }

    function normalizarBusqueda(valor){

        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function limpiarHTMLBusqueda(valor){

        const temporal =
            document.createElement("div");

        temporal.innerHTML =
            String(valor || "");

        return temporal.textContent || "";
    }

    function obtenerTextoBusquedaVenta(venta){

        const productos =
            limpiarHTMLBusqueda(
                obtenerProductosVenta(venta)
            );

        const categorias =
            limpiarHTMLBusqueda(
                obtenerCategoriasVenta(venta)
            );

        const pagos =
            limpiarHTMLBusqueda(
                obtenerDetallePagosVenta(venta)
            );

        const tienda =
            venta.tiendaVentaNombre ||
            tiendasSistema?.[venta.tiendaVenta] ||
            venta.tiendaVenta ||
            "";

        return normalizarBusqueda([
            venta.numeroBoleta,
            venta.fecha,
            venta.fechaISO,
            venta.hora,
            productos,
            categorias,
            venta.vendedor,
            tienda,
            venta.total,
            venta.ganancia,
            venta.metodoPago,
            pagos
        ].join(" "));
    }

    function coincideBusquedaVenta(
        venta,
        textoBusqueda
    ){

        const consulta =
            normalizarBusqueda(textoBusqueda);

        if(!consulta){
            return true;
        }

        const textoVenta =
            obtenerTextoBusquedaVenta(venta);

        return consulta
            .split(" ")
            .filter(Boolean)
            .every(function(token){
                return textoVenta.includes(token);
            });
    }

    return {
        obtenerDetallePagosVenta,
        obtenerProductosVenta,
        obtenerCategoriasVenta,
        obtenerTextoBusquedaVenta,
        coincideBusquedaVenta,
        reimprimirBoletaVenta
    };
}