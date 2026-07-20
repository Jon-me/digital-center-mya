// =====================================================
// DIGITAL CENTER M&A
// CARRITO MODULE
// FASE 28.1.2 — CARRITO ENTERPRISE
// =====================================================

export function crearCarrito(deps){

    const {
        state,
        obtenerStockTotal,
        actualizarDashboard
    } = deps;

    // =====================================================
    // UTILIDADES
    // =====================================================

    function obtenerElemento(id){

        return document.getElementById(id);

    }

    function actualizarTextoElemento(id, valor){

        const elemento = obtenerElemento(id);

        if(elemento){
            elemento.textContent = valor;
        }

    }

    function limpiarInput(id){

        const input = obtenerElemento(id);

        if(input){
            input.value = "";
        }

    }

    function escaparHTML(valor){

        return String(valor || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    // =====================================================
    // DESCUENTO
    // =====================================================

    function obtenerDescuento(){

        const input = obtenerElemento(
            "descuentoVenta"
        );

        if(
            !input ||
            input.value.trim() === ""
        ){
            return 0;
        }

        let descuento = Number(
            input.value
        );

        if(
            Number.isNaN(descuento) ||
            descuento < 0
        ){
            return 0;
        }

        const totalVenta =
            state.carrito.reduce(
                function(total, item){

                    return (
                        total +
                        Number(item.subtotal || 0)
                    );

                },
                0
            );

        if(descuento > totalVenta){
            descuento = totalVenta;
        }

        input.value = descuento;

        return descuento;

    }

    function limpiarDescuentoSiCarritoVacio(){

        const input = obtenerElemento(
            "descuentoVenta"
        );

        if(
            input &&
            state.carrito.length === 0
        ){

            input.value = "";
            input.defaultValue = "";

            input.removeAttribute(
                "value"
            );

        }

    }

    // =====================================================
    // PAGOS
    // =====================================================

    function obtenerValorPago(id){

        const input = obtenerElemento(id);

        return Number(input?.value) || 0;

    }

    function obtenerPagosMixtos(){

        return {

            efectivo:
                obtenerValorPago(
                    "pagoEfectivo"
                ),

            yape:
                obtenerValorPago(
                    "pagoYape"
                ),

            plin:
                obtenerValorPago(
                    "pagoPlin"
                ),

            tarjeta:
                obtenerValorPago(
                    "pagoTarjeta"
                ),

            transferencia:
                obtenerValorPago(
                    "pagoTransferencia"
                )

        };

    }

    function calcularTotalPagado(){

        const pagos =
            obtenerPagosMixtos();

        const totalPagado =
            pagos.efectivo +
            pagos.yape +
            pagos.plin +
            pagos.tarjeta +
            pagos.transferencia;

        let totalVenta =
            state.carrito.reduce(
                function(total, item){

                    return (
                        total +
                        Number(item.subtotal || 0)
                    );

                },
                0
            );

        totalVenta -= obtenerDescuento();

        if(totalVenta < 0){
            totalVenta = 0;
        }

        let pendiente =
            totalVenta -
            totalPagado;

        if(pendiente < 0){
            pendiente = 0;
        }

        actualizarTextoElemento(
            "totalPagado",
            "S/ " +
            totalPagado.toFixed(2)
        );

        actualizarTextoElemento(
            "totalPendienteCobro",
            "S/ " +
            pendiente.toFixed(2)
        );

        return totalPagado;

    }

    // =====================================================
    // RESUMEN DEL CARRITO
    // =====================================================

    function obtenerResumenCarrito(){

        let totalArticulos = 0;
        let subtotal = 0;

        state.carrito.forEach(
            function(item){

                totalArticulos +=
                    Number(
                        item.cantidad ||
                        0
                    );

                subtotal +=
                    Number(
                        item.subtotal ||
                        0
                    );

            }
        );

        const descuento =
            obtenerDescuento();

        let totalFinal =
            subtotal -
            descuento;

        if(totalFinal < 0){
            totalFinal = 0;
        }

        return {

            productosUnicos:
                state.carrito.length,

            totalArticulos,

            subtotal,

            descuento,

            totalFinal

        };

    }

    function actualizarIndicadoresCarrito(){

        const resumen =
            obtenerResumenCarrito();

        actualizarTextoElemento(
            "carritoProductosUnicos",
            String(
                resumen.productosUnicos
            )
        );

        actualizarTextoElemento(
            "carritoTotalArticulos",
            String(
                resumen.totalArticulos
            )
        );

        actualizarTextoElemento(
            "carritoSubtotal",
            "S/ " +
            resumen.subtotal.toFixed(2)
        );

        actualizarTextoElemento(
            "carritoResumenSubtotal",
            "S/ " +
            resumen.subtotal.toFixed(2)
        );

        actualizarTextoElemento(
            "carritoResumenDescuento",
            "- S/ " +
            resumen.descuento.toFixed(2)
        );

        actualizarTextoElemento(
            "carritoResumenArticulos",
            String(
                resumen.totalArticulos
            )
        );

    }

    function actualizarResumenVenta(){

        const resumen =
            obtenerResumenCarrito();

        actualizarTextoElemento(
            "resumenProductosCobro",
            String(
                resumen.totalArticulos
            )
        );

        actualizarTextoElemento(
            "totalVenta",
            "S/ " +
            resumen.totalFinal.toFixed(2)
        );

        actualizarTextoElemento(
            "resumenTotalCobro",
            "S/ " +
            resumen.totalFinal.toFixed(2)
        );

        actualizarIndicadoresCarrito();

        calcularTotalPagado();

        actualizarDashboard();

    }

    // =====================================================
    // RENDER DEL CARRITO
    // =====================================================

    function obtenerImagenCarrito(item){

        return (
            item.imagen ||
            "icons/todos.png"
        );

    }

    function renderFilaCarrito(
        item,
        index
    ){

        const producto =
            escaparHTML(
                item.producto
            );

        const codigo =
            escaparHTML(
                item.codigo ||
                "S/C"
            );

        const nombreBoleta =
            escaparHTML(
                item.nombreBoleta ||
                ""
            );

        const imagen =
            escaparHTML(
                obtenerImagenCarrito(
                    item
                )
            );

        const cantidad =
            Number(
                item.cantidad ||
                0
            );

        const precio =
            Number(
                item.precio ||
                0
            );

        const subtotal =
            Number(
                item.subtotal ||
                0
            );

        return `
            <tr>

                <td>

                    <div class="carrito-producto-info">

                        <img
                            src="${imagen}"
                            alt=""
                            class="carrito-producto-miniatura"
                            loading="lazy"
                        >

                        <div>

                            <strong title="${producto}">
                                ${producto}
                            </strong>

                            <small>
                                Código: ${codigo}
                            </small>

                            <input
                                type="text"
                                class="input-nombre-boleta-carrito"
                                value="${nombreBoleta}"
                                placeholder="Nombre para boleta"
                                oninput="window.actualizarNombreBoletaCarrito(
                                    ${index},
                                    this.value
                                )"
                            >

                        </div>

                    </div>

                </td>

                <td>

                    <span class="carrito-cantidad-chip">
                        ${cantidad}
                    </span>

                </td>

                <td>
                    S/ ${precio.toFixed(2)}
                </td>

                <td>
                    S/ ${subtotal.toFixed(2)}
                </td>

                <td>

                    <button
                        type="button"
                        class="carrito-eliminar-item"
                        onclick="window.eliminarDelCarrito(${index})"
                        title="Eliminar producto"
                        aria-label="Eliminar ${producto}"
                    >
                        ×
                    </button>

                </td>

            </tr>
        `;

    }

    function mostrarCarrito(){

        const tablaCarrito =
            obtenerElemento(
                "carritoTabla"
            );

        if(!tablaCarrito){
            return;
        }

        limpiarDescuentoSiCarritoVacio();

        let html = "";
        let cantidadProductos = 0;

        state.carrito.forEach(
            function(item, index){

                cantidadProductos +=
                    Number(
                        item.cantidad ||
                        0
                    );

                html += renderFilaCarrito(
                    item,
                    index
                );

            }
        );

        tablaCarrito.innerHTML = html;

        actualizarTextoElemento(
            "tituloCarrito",
            "Carrito (" +
            cantidadProductos +
            ")"
        );

        actualizarResumenVenta();

    }

    // =====================================================
    // NOMBRE PERSONALIZADO PARA BOLETA
    // =====================================================

    function actualizarNombreBoletaCarrito(
        index,
        valor
    ){

        const item =
            state.carrito[index];

        if(!item){
            return;
        }

        item.nombreBoleta =
            String(
                valor ||
                ""
            ).trim();

        localStorage.setItem(
            "carrito",
            JSON.stringify(
                state.carrito
            )
        );

    }

    // =====================================================
    // ELIMINAR PRODUCTO
    // =====================================================

    function eliminarDelCarrito(index){

        if(
            index < 0 ||
            index >= state.carrito.length
        ){
            return;
        }

        state.carrito.splice(
            index,
            1
        );

        localStorage.setItem(
            "carrito",
            JSON.stringify(
                state.carrito
            )
        );

        mostrarCarrito();

    }

    // =====================================================
    // AGREGAR PRODUCTO
    // =====================================================

    function agregarDirecto(idProducto){

        const producto =
            state.productos.find(
                function(item){

                    return (
                        item.id ===
                        idProducto
                    );

                }
            );

        if(!producto){

            alert(
                "Producto no encontrado"
            );

            return;

        }

        const stockTotal =
            obtenerStockTotal(
                producto
            );

        if(
            stockTotal <= 0 ||
            Number.isNaN(stockTotal)
        ){

            alert("Sin stock");

            return;

        }

        const itemExistente =
            state.carrito.find(
                function(item){

                    return (
                        item.id ===
                        producto.id
                    );

                }
            );

        const cantidadEnCarrito =
            itemExistente
                ? Number(
                    itemExistente.cantidad ||
                    0
                )
                : 0;

        if(
            cantidadEnCarrito + 1 >
            stockTotal
        ){

            alert(
                "No hay más stock disponible"
            );

            return;

        }

        if(itemExistente){

            itemExistente.codigo =
                itemExistente.codigo ||
                producto.codigo ||
                "";

            itemExistente.imagen =
                itemExistente.imagen ||
                producto.imagen ||
                "";

            itemExistente.categoria =
                itemExistente.categoria ||
                producto.categoria ||
                "Sin categoría";

            itemExistente.cantidad += 1;

            itemExistente.subtotal =
                itemExistente.cantidad *
                itemExistente.precio;

        }else{

            state.carrito.push({

                id:
                    producto.id,

                producto:
                    producto.producto,

                codigo:
                    producto.codigo ||
                    "",

                imagen:
                    producto.imagen ||
                    "",

                categoria:
                    producto.categoria ||
                    "Sin categoría",

                cantidad:
                    1,

                precioCompra:
                    Number(
                        producto.precioCompra ||
                        0
                    ),

                precio:
                    Number(
                        producto.precio ||
                        0
                    ),

                subtotal:
                    Number(
                        producto.precio ||
                        0
                    )

            });

        }

        localStorage.setItem(
            "carrito",
            JSON.stringify(
                state.carrito
            )
        );

        mostrarCarrito();

    }

    // =====================================================
    // CANCELAR VENTA
    // =====================================================

    function cancelarVenta(){

        if(
            state.carrito.length > 0 &&
            !window.confirm(
                "¿Cancelar la venta actual?"
            )
        ){
            return;
        }

        state.carrito = [];

        localStorage.removeItem(
            "carrito"
        );

        [
            "descuentoVenta",
            "pagoEfectivo",
            "pagoYape",
            "pagoPlin",
            "pagoTarjeta",
            "pagoTransferencia"
        ].forEach(
            limpiarInput
        );

        calcularTotalPagado();

        mostrarCarrito();

    }

    // =====================================================
    // API PÚBLICA
    // =====================================================

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