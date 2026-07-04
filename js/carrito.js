// =====================================================
// DIGITAL CENTER M&A
// CARRITO MODULE
// FASE 4
// =====================================================

export function crearCarrito(deps){

    const {
        state,
        obtenerStockTotal,
        actualizarDashboard
    } = deps;

    function obtenerDescuento(){

        let input = document.getElementById("descuentoVenta");

        if(!input || input.value.trim() === ""){
            return 0;
        }

        let descuento = Number(input.value);

        if(isNaN(descuento) || descuento < 0){
            return 0;
        }

        let totalVenta = 0;

        state.carrito.forEach(function(item){
            totalVenta += Number(item.subtotal || 0);
        });

        if(descuento > totalVenta){
            descuento = totalVenta;
        }

        input.value = descuento;

        return descuento;
    }

    function limpiarDescuentoSiCarritoVacio(){

        let input = document.getElementById("descuentoVenta");

        if(input && state.carrito.length === 0){
            input.value = "";
            input.defaultValue = "";
            input.removeAttribute("value");
        }
    }

    function obtenerPagosMixtos(){

        return {
            efectivo: Number(document.getElementById("pagoEfectivo").value) || 0,
            yape: Number(document.getElementById("pagoYape").value) || 0,
            plin: Number(document.getElementById("pagoPlin").value) || 0,
            tarjeta: Number(document.getElementById("pagoTarjeta").value) || 0,
            transferencia: Number(document.getElementById("pagoTransferencia").value) || 0
        };
    }

    function calcularTotalPagado(){

        let pagos = obtenerPagosMixtos();

        let totalPagado =
            pagos.efectivo +
            pagos.yape +
            pagos.plin +
            pagos.tarjeta +
            pagos.transferencia;

        let totalVenta = 0;

        state.carrito.forEach(function(item){
            totalVenta += Number(item.subtotal || 0);
        });

        totalVenta = totalVenta - obtenerDescuento();

        if(totalVenta < 0){
            totalVenta = 0;
        }

        let pendiente = totalVenta - totalPagado;

        if(pendiente < 0){
            pendiente = 0;
        }

        document.getElementById("totalPagado").innerHTML =
            "S/ " + totalPagado.toFixed(2);

        let totalPendienteCobro = document.getElementById("totalPendienteCobro");

        if(totalPendienteCobro){
            totalPendienteCobro.innerHTML =
                "S/ " + pendiente.toFixed(2);
        }

        return totalPagado;
    }

    function actualizarResumenVenta(){

        let total = 0;
        let cantidadProductos = 0;

        state.carrito.forEach(function(item){
            cantidadProductos += Number(item.cantidad || 0);
            total += Number(item.subtotal || 0);
        });

        let resumenProductosCobro = document.getElementById("resumenProductosCobro");

        if(resumenProductosCobro){
            resumenProductosCobro.innerHTML = cantidadProductos;
        }

        let descuento = obtenerDescuento();

        let totalFinal = total - descuento;

        if(totalFinal < 0){
            totalFinal = 0;
        }

        let totalVenta = document.getElementById("totalVenta");

        if(totalVenta){
            totalVenta.innerHTML = "Total: S/ " + totalFinal.toFixed(2);
        }

        let resumenTotalCobro = document.getElementById("resumenTotalCobro");

        if(resumenTotalCobro){
            resumenTotalCobro.innerHTML = "S/ " + totalFinal.toFixed(2);
        }

        calcularTotalPagado();
        actualizarDashboard();
    }

    function mostrarCarrito(){

        let tablaCarrito = document.getElementById("carritoTabla");

        if(!tablaCarrito){
            return;
        }

        let html = "";
        let cantidadProductos = 0;

        limpiarDescuentoSiCarritoVacio();

        state.carrito.forEach(function(item, index){

            cantidadProductos += item.cantidad;

            html += `
            <tr>
                <td>
                    <strong>${item.producto}</strong>

                    <input
                        type="text"
                        class="input-nombre-boleta-carrito"
                        value="${item.nombreBoleta || ""}"
                        placeholder="Nombre para boleta"
                        oninput="window.actualizarNombreBoletaCarrito(${index}, this.value)"
                    >
                </td>

                <td>${item.cantidad}</td>
                <td>S/ ${item.precio.toFixed(2)}</td>
                <td>S/ ${item.subtotal.toFixed(2)}</td>

                <td>
                    <button onclick="window.eliminarDelCarrito(${index})">
                        X
                    </button>
                </td>
            </tr>
            `;
        });

        tablaCarrito.innerHTML = html;

        document.getElementById("tituloCarrito").innerHTML =
            "🛒 Carrito (" + cantidadProductos + ")";

        actualizarResumenVenta();
    }

    function actualizarNombreBoletaCarrito(index, valor){

        state.carrito[index].nombreBoleta = valor.trim();

        localStorage.setItem("carrito", JSON.stringify(state.carrito));
    }

    function eliminarDelCarrito(index){

        state.carrito.splice(index, 1);

        localStorage.setItem("carrito", JSON.stringify(state.carrito));

        mostrarCarrito();
    }

    function agregarDirecto(idProducto){

        let producto = state.productos.find(function(p){
            return p.id === idProducto;
        });

        if(!producto){
            alert("Producto no encontrado");
            return;
        }

        let stockTotal = obtenerStockTotal(producto);

        if(stockTotal <= 0 || isNaN(stockTotal)){
            alert("Sin stock");
            return;
        }

        let itemExistente = state.carrito.find(function(item){
            return item.id === producto.id;
        });

        let cantidadEnCarrito = itemExistente
            ? Number(itemExistente.cantidad || 0)
            : 0;

        if(cantidadEnCarrito + 1 > stockTotal){
            alert("No hay más stock disponible");
            return;
        }

        if(itemExistente){

            itemExistente.cantidad += 1;
            itemExistente.subtotal =
                itemExistente.cantidad * itemExistente.precio;

        } else {

            state.carrito.push({
                id: producto.id,
                producto: producto.producto,
                categoria: producto.categoria || "Sin categoría",
                cantidad: 1,
                precioCompra: Number(producto.precioCompra || 0),
                precio: Number(producto.precio),
                subtotal: Number(producto.precio)
            });
        }

        localStorage.setItem("carrito", JSON.stringify(state.carrito));

        mostrarCarrito();
    }

    function cancelarVenta(){

        state.carrito = [];

        localStorage.removeItem("carrito");

        document.getElementById("descuentoVenta").value = "";
        document.getElementById("pagoEfectivo").value = "";
        document.getElementById("pagoYape").value = "";
        document.getElementById("pagoPlin").value = "";
        document.getElementById("pagoTarjeta").value = "";
        document.getElementById("pagoTransferencia").value = "";

        calcularTotalPagado();
        mostrarCarrito();
    }

    return {
        mostrarCarrito,
        actualizarResumenVenta,
        actualizarNombreBoletaCarrito,
        eliminarDelCarrito,
        agregarDirecto,
        cancelarVenta,
        obtenerPagosMixtos,
        calcularTotalPagado,
        obtenerDescuento,
        limpiarDescuentoSiCarritoVacio
    };
}