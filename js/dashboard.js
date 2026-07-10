// =====================================================
// DIGITAL CENTER M&A
// DASHBOARD MODULE
// FASE 7
// =====================================================

export function crearDashboard(deps){

const {

    state,

    obtenerFechaISO,

    obtenerDashboardSucursal,

    obtenerStockTiendas,

    obtenerStockTotal,

    obtenerNombreSucursal,

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

    const sucursalDashboard =
    obtenerDashboardSucursal();

    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

state.historialVentas.forEach(function(venta){

    const sucursalVenta =
        venta.tiendaVenta || "principal";

    if(
        sucursalDashboard !== "empresa" &&
        sucursalVenta !== sucursalDashboard
    ){
        return;
    }

    const total =
        Number(venta.total || 0);

    const ganancia =
        Number(venta.ganancia || 0);

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

    const sucursalDashboard =
        obtenerDashboardSucursal();

    let cantidadProductos = 0;
    let valorTotal = 0;

    state.productos.forEach(function(producto){

        let stockVista = 0;

        if(sucursalDashboard === "empresa"){

            stockVista =
                obtenerStockTotal(producto);

        }else{

            const stockTiendas =
                obtenerStockTiendas(producto);

            stockVista =
                Number(
                    stockTiendas[sucursalDashboard] || 0
                );

        }

        if(stockVista > 0){
            cantidadProductos++;
        }

        valorTotal +=
            stockVista *
            Number(producto.precioCompra || 0);

    });

    totalProductos.innerHTML =
        cantidadProductos;

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

function calcularRankingSucursales(){

    const ranking = new Map();

    state.historialVentas.forEach(function(venta){

        if(venta.fechaISO !== obtenerFechaISO()){
            return;
        }

        const sucursal =
            venta.tiendaVenta || "principal";

        if(!ranking.has(sucursal)){

            ranking.set(sucursal,{
                ventas:0,
                ganancia:0,
                tickets:0
            });

        }

        const datos =
            ranking.get(sucursal);

        datos.ventas +=
            Number(venta.total || 0);

        datos.ganancia +=
            Number(venta.ganancia || 0);

        datos.tickets++;

    });

    return [...ranking.entries()]
        .sort(function(a,b){

            return b[1].ventas - a[1].ventas;

        });

}

function mostrarRankingSucursales(){

    const contenedor =
        document.getElementById("rankingSucursales");

    if(!contenedor){
        return;
    }

    const ranking =
        calcularRankingSucursales();

    if(ranking.length === 0){

        contenedor.innerHTML =
            "<p>Sin ventas registradas hoy.</p>";

        return;
    }

    const medallas = [
        "🥇",
        "🥈",
        "🥉"
    ];

    let html = "";

    ranking.forEach(function([sucursalId, datos], index){

        const ticketPromedio =
            datos.tickets > 0
                ? datos.ventas / datos.tickets
                : 0;

        html += `
            <div class="ranking-sucursal-item">

                <div class="ranking-posicion">
                    ${medallas[index] || "#" + (index + 1)}
                </div>

                <div class="ranking-info">

<strong>
    ${obtenerNombreSucursal(sucursalId)}
</strong>

                    <small>
                        ${datos.tickets} ventas ·
                        Ticket S/ ${ticketPromedio.toFixed(2)}
                    </small>

                </div>

                <div class="ranking-montos">

                    <strong>
                        S/ ${datos.ventas.toFixed(2)}
                    </strong>

                    <small>
                        Ganancia S/ ${datos.ganancia.toFixed(2)}
                    </small>

                </div>

            </div>
        `;

    });

    contenedor.innerHTML = html;

}

function calcularRankingProductos(){

    const ranking = new Map();

    const sucursalDashboard =
        obtenerDashboardSucursal();

    state.historialVentas.forEach(function(venta){

        if(venta.fechaISO !== obtenerFechaISO()){
            return;
        }

        const sucursalVenta =
            venta.tiendaVenta || "principal";

        if(
            sucursalDashboard !== "empresa" &&
            sucursalVenta !== sucursalDashboard
        ){
            return;
        }

        const productosVenta =
            Array.isArray(venta.productos)
                ? venta.productos
                : [];

        productosVenta.forEach(function(item){

            const nombreProducto =
                item.nombreBoleta ||
                item.producto ||
                "Sin producto";

            const cantidad =
                Number(item.cantidad || 0);

            if(!ranking.has(nombreProducto)){
                ranking.set(nombreProducto, 0);
            }

            ranking.set(
                nombreProducto,
                ranking.get(nombreProducto) + cantidad
            );

        });

    });

    return Array.from(ranking.entries())
        .sort(function(a, b){
            return b[1] - a[1];
        })
        .slice(0, 5);

}

function mostrarRankingProductos(){

    const panel =
        document.getElementById("rankingProductos");

    if(!panel){
        return;
    }

    const ranking =
        calcularRankingProductos();

    if(ranking.length===0){

        panel.innerHTML =
            "<p>Sin ventas registradas.</p>";

        return;

    }

    const iconos=[
        "🥇",
        "🥈",
        "🥉",
        "4️⃣",
        "5️⃣"
    ];

    let html="";

    ranking.forEach(function(item,index){

        html+=`

        <div class="ranking-sucursal-item">

            <div class="ranking-posicion">

                ${iconos[index]}

            </div>

            <div class="ranking-info">

                <strong>

                    ${item[0]}

                </strong>

            </div>

            <div class="ranking-montos">

                <strong>

                    ${item[1]}

                </strong>

<small>
    unidades vendidas
</small>

            </div>

        </div>

        `;

    });

    panel.innerHTML=html;

}

    return {

    actualizarDashboard,
    actualizarReportes,
    actualizarDashboardEjecutivo,
    mostrarReporteVendedores,
    calcularRankingSucursales,
    mostrarRankingSucursales,
    mostrarRankingProductos

};

}