// =====================================================
// DIGITAL CENTER M&A
// DASHBOARD MODULE
// FASE 7
// =====================================================

export function crearDashboard(deps){

    const {

    state,

    obtenerFechaISO,
    obtenerStockTotal,
    obtenerDescuento

} = deps;

function calcularIndicadoresDashboard(){

    const indicadores = {

        ventasHoy: 0,
        gananciaHoy: 0,

        ventasMes: 0,
        gananciaMes: 0,

        ventasEfectivo: 0,
        ventasYape: 0,
        ventasPlin: 0,
        ventasTarjeta: 0,
        ventasTransferencia: 0,

        gananciaRealDia: 0,

        totalVentasDia: 0,
        cantidadVentasDia: 0,

        productosVendidos: {},
        vendedores: {}

    };

    const hoy = obtenerFechaISO();

    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    state.historialVentas.forEach(function(venta){

        const total = Number(venta.total || 0);
        const ganancia = Number(venta.ganancia || 0);

        const fechaVenta = venta.fechaISO
            ? new Date(venta.fechaISO + "T00:00:00")
            : new Date(venta.fecha);

        if(
            fechaVenta.getMonth() === mesActual &&
            fechaVenta.getFullYear() === anioActual
        ){

            indicadores.ventasMes += total;
            indicadores.gananciaMes += ganancia;

        }

        if(venta.fechaISO !== hoy){
            return;
        }

        indicadores.ventasHoy += total;
        indicadores.gananciaHoy += ganancia;
        indicadores.gananciaRealDia += ganancia;

        indicadores.totalVentasDia += total;
        indicadores.cantidadVentasDia++;

        const vendedor = venta.vendedor || "Sin vendedor";

        if(!indicadores.vendedores[vendedor]){
            indicadores.vendedores[vendedor] = 0;
        }

        indicadores.vendedores[vendedor] += total;

        if(venta.productos){

            venta.productos.forEach(function(item){

                const nombre =
                    item.nombreBoleta ||
                    item.producto ||
                    "Sin producto";

                if(!indicadores.productosVendidos[nombre]){
                    indicadores.productosVendidos[nombre] = 0;
                }

                indicadores.productosVendidos[nombre] +=
                    Number(item.cantidad || 0);

            });

        }

        if(venta.pagos){

            indicadores.ventasEfectivo += Number(venta.pagos.efectivo || 0);
            indicadores.ventasYape += Number(venta.pagos.yape || 0);
            indicadores.ventasPlin += Number(venta.pagos.plin || 0);
            indicadores.ventasTarjeta += Number(venta.pagos.tarjeta || 0);
            indicadores.ventasTransferencia += Number(venta.pagos.transferencia || 0);

        }else{

            switch(venta.metodoPago){

                case "Efectivo":
                    indicadores.ventasEfectivo += total;
                    break;

                case "Yape":
                    indicadores.ventasYape += total;
                    break;

                case "Plin":
                    indicadores.ventasPlin += total;
                    break;

                case "Tarjeta":
                    indicadores.ventasTarjeta += total;
                    break;

                case "Transferencia":
                    indicadores.ventasTransferencia += total;
                    break;

            }

        }

    });

    return indicadores;

}

function actualizarReportes(){

    const indicadores = calcularIndicadoresDashboard();

    const elementos = {
        ventasHoy: document.getElementById("ventasHoy"),
        gananciaHoy: document.getElementById("gananciaHoy"),
        ventasMes: document.getElementById("ventasMes"),
        gananciaMes: document.getElementById("gananciaMes"),
        ventasEfectivo: document.getElementById("ventasEfectivo"),
        ventasYape: document.getElementById("ventasYape"),
        ventasPlin: document.getElementById("ventasPlin"),
        ventasTarjeta: document.getElementById("ventasTarjeta"),
        ventasTransferencia: document.getElementById("ventasTransferencia")
    };

    if(Object.values(elementos).some(function(elemento){ return !elemento; })){
        return;
    }

    elementos.ventasHoy.innerHTML = "S/ " + indicadores.ventasHoy.toFixed(2);
    elementos.gananciaHoy.innerHTML = "S/ " + indicadores.gananciaHoy.toFixed(2);
    elementos.ventasMes.innerHTML = "S/ " + indicadores.ventasMes.toFixed(2);
    elementos.gananciaMes.innerHTML = "S/ " + indicadores.gananciaMes.toFixed(2);

    elementos.ventasEfectivo.innerHTML = "S/ " + indicadores.ventasEfectivo.toFixed(2);
    elementos.ventasYape.innerHTML = "S/ " + indicadores.ventasYape.toFixed(2);
    elementos.ventasPlin.innerHTML = "S/ " + indicadores.ventasPlin.toFixed(2);
    elementos.ventasTarjeta.innerHTML = "S/ " + indicadores.ventasTarjeta.toFixed(2);
    elementos.ventasTransferencia.innerHTML = "S/ " + indicadores.ventasTransferencia.toFixed(2);
}

function obtenerTopMapa(mapa){

    let nombreTop = "-";
    let valorTop = 0;

    for(let nombre in mapa){
        if(mapa[nombre] > valorTop){
            nombreTop = nombre;
            valorTop = mapa[nombre];
        }
    }

    return {
        nombre: nombreTop,
        valor: valorTop
    };
}

function actualizarDashboardEjecutivo(){

    const indicadores = calcularIndicadoresDashboard();

    const elementos = {
        productoMasVendido: document.getElementById("productoMasVendido"),
        mejorVendedor: document.getElementById("mejorVendedor"),
        gananciaRealDia: document.getElementById("gananciaRealDia"),
        ticketPromedio: document.getElementById("ticketPromedio"),
        gananciaMesEjecutiva: document.getElementById("gananciaMesEjecutiva")
    };

    if(Object.values(elementos).some(function(elemento){ return !elemento; })){
        return;
    }

    const productoTop = obtenerTopMapa(indicadores.productosVendidos);
    const vendedorTop = obtenerTopMapa(indicadores.vendedores);

    const ticketPromedio =
        indicadores.cantidadVentasDia > 0
        ? indicadores.totalVentasDia / indicadores.cantidadVentasDia
        : 0;

    const nombreProductoCorto =
        productoTop.nombre.length > 15
        ? productoTop.nombre.substring(0, 15) + "..."
        : productoTop.nombre;

    elementos.productoMasVendido.innerHTML =
        productoTop.nombre === "-"
        ? "-"
        : nombreProductoCorto + "<br><small>Vendidos: " + productoTop.valor + "</small>";

    elementos.mejorVendedor.innerHTML =
        vendedorTop.nombre === "-"
        ? "-"
        : vendedorTop.nombre + "<br><small>S/ " + vendedorTop.valor.toFixed(2) + "</small>";

    elementos.gananciaRealDia.innerHTML =
        "S/ " + indicadores.gananciaRealDia.toFixed(2);

    elementos.ticketPromedio.innerHTML =
        "S/ " + ticketPromedio.toFixed(2);

    elementos.gananciaMesEjecutiva.innerHTML =
        "S/ " + indicadores.gananciaMes.toFixed(2);
}

function mostrarReporteVendedores(){

    const tabla =
        document.getElementById("reporteVendedoresTabla");

    if(!tabla){
        return;
    }

    const vendedores = {};

    state.historialVentas.forEach(function(venta){

        const nombre = venta.vendedor || "Sin vendedor";

        if(!vendedores[nombre]){
            vendedores[nombre] = {
                ventas: 0,
                total: 0,
                ganancia: 0
            };
        }

        vendedores[nombre].ventas++;
        vendedores[nombre].total += Number(venta.total || 0);
        vendedores[nombre].ganancia += Number(venta.ganancia || 0);

    });

    let html = "";

    for(const nombre in vendedores){

        html += `
            <tr>
                <td>${nombre}</td>
                <td>${vendedores[nombre].ventas}</td>
                <td>S/ ${vendedores[nombre].total.toFixed(2)}</td>
                <td>S/ ${vendedores[nombre].ganancia.toFixed(2)}</td>
            </tr>
        `;

    }

    tabla.innerHTML = html;

}

function actualizarIndicadoresInventario(){

    const totalProductos =
        document.getElementById("totalProductos");

    const valorInventario =
        document.getElementById("valorInventario");

    if(!totalProductos || !valorInventario){
        return;
    }

    totalProductos.innerHTML = state.productos.length;

    let valorTotal = 0;

    state.productos.forEach(function(producto){

        valorTotal +=
            obtenerStockTotal(producto) *
            Number(producto.precio || 0);

    });

    valorInventario.innerHTML =
        "S/ " + valorTotal.toFixed(2);

}

function actualizarIndicadoresVenta(){

    const productosCarrito =
        document.getElementById("productosCarrito");

    const ventaActual =
        document.getElementById("ventaActual");

    if(!productosCarrito || !ventaActual){
        return;
    }

    let cantidad = 0;
    let total = 0;

    state.carrito.forEach(function(item){

        cantidad += Number(item.cantidad || 0);
        total += Number(item.subtotal || 0);

    });

    total -= obtenerDescuento();

    if(total < 0){
        total = 0;
    }

    productosCarrito.innerHTML = cantidad;
    ventaActual.innerHTML = "S/ " + total.toFixed(2);

}

function actualizarDashboard(){

    actualizarIndicadoresInventario();

    actualizarIndicadoresVenta();

}

    return {

    actualizarDashboard,
    actualizarReportes,
    actualizarDashboardEjecutivo,
    mostrarReporteVendedores

};

}