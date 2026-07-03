// =====================================================
// DIGITAL CENTER M&A
// PRODUCTOS MODULE
// FASE 3.1 - Render catálogo
// =====================================================

export function crearCatalogoProductos(deps){

  const {
    state,
    obtenerStockTiendas,
    obtenerStockTotal,
    actualizarDashboard,

    agregarDirecto,
    abrirTransferenciaStock,
    editarProducto,
    eliminarProducto

} = deps;

    function renderProductoCard(producto, rolActivo){

        let stockTiendas = obtenerStockTiendas(producto);
        let stockTotal = obtenerStockTotal(producto);

        return `
        <div class="producto-card">

            <img loading="lazy" src="${producto.imagen || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22180%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23ffffff%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%230f172a%22 font-size=%2220%22 font-family=%22Arial%22>Sin imagen</text></svg>'}" />

            <h3>${producto.producto}</h3>
            <p>Código: ${producto.codigo}</p>
            <p>Categoría: ${producto.categoria}</p>

            <div class="stock-tiendas-card">
                <p class="stock-total">Stock Total: ${stockTotal}</p>

                <div class="stock-tienda">
                    <span>🏬 Mercado</span>
                    <strong>${stockTiendas.principal}</strong>
                </div>

                <div class="stock-tienda">
                    <span>✂️ Peluquería</span>
                    <strong>${stockTiendas.sucursal}</strong>
                </div>
            </div>

            ${
                rolActivo === "admin"
                ? `
                    <p>Compra: S/ ${producto.precioCompra || 0}</p>
                    <p>Venta: S/ ${producto.precio}</p>
                `
                : `
                    <p>Precio: S/ ${producto.precio}</p>
                `
            }

            <button class="btn-agregar" onclick="window.agregarDirecto('${producto.id}')">
                🛒 Agregar
            </button>

            ${
                rolActivo === "admin"
                ? `
                    <button class="btn-transferir-stock" onclick="window.abrirTransferenciaStock('${producto.id}')">
                        🔄 Transferir
                    </button>

                    <button onclick="window.editarProducto('${producto.id}')">
                        ✏️ Editar
                    </button>

                    <button onclick="window.eliminarProducto('${producto.id}')">
                        🗑️ Eliminar
                    </button>
                `
                : ""
            }

        </div>
        `;

    }

    function renderBotonVerMas(){

        if(state.productosVista.length <= state.cantidadRenderProductos){
            return "";
        }

        return `
            <button class="btn-cargar-mas-productos" onclick="cargarMasProductos()">
                Ver más productos
            </button>
        `;

    }

    function renderProductosRango(inicio, fin, rolActivo){

        return state.productosVista
            .slice(inicio, fin)
            .map(function(producto){
                return renderProductoCard(producto, rolActivo);
            })
            .join("");

    }

    const CatalogRenderer = {

        renderIncremental: function(tabla, rolActivo){

            let html = renderProductosRango(
                state.cantidadRenderAnterior,
                state.cantidadRenderProductos,
                rolActivo
            );

            let boton = tabla.querySelector(".btn-cargar-mas-productos");

            if(boton){
                boton.remove();
            }

            tabla.insertAdjacentHTML("beforeend", html);
            tabla.insertAdjacentHTML("beforeend", renderBotonVerMas());

            state.cantidadRenderAnterior = state.cantidadRenderProductos;

        },

        limpiar: function(tabla){
            tabla.innerHTML = "";
            state.cantidadRenderAnterior = 0;
        },

        renderInicial: function(tabla, rolActivo){

            this.limpiar(tabla);

            let html = renderProductosRango(
                0,
                state.cantidadRenderProductos,
                rolActivo
            );

            html += renderBotonVerMas();

            tabla.innerHTML = html;

            state.cantidadRenderAnterior = state.cantidadRenderProductos;

        }

    };

    return {
        CatalogRenderer,
        renderProductoCard,
        renderBotonVerMas,
        renderProductosRango
    };

}