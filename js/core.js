// =====================================================
// DIGITAL CENTER M&A
// CORE MODULE
// FASE 10
// =====================================================

export function obtenerFechaISO(){

    let fecha = new Date();

    let año = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

export function normalizarTexto(valor){

    return String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export function obtenerStockTiendas(producto){

    if(producto.stockTiendas){
        return {
            principal: Number(producto.stockTiendas.principal || 0),
            sucursal: Number(producto.stockTiendas.sucursal || 0)
        };
    }

    return {
        principal: Number(producto.stock || 0),
        sucursal: 0
    };
}

export function obtenerStockTotal(producto){

    let stockTiendas = obtenerStockTiendas(producto);

    return stockTiendas.principal + stockTiendas.sucursal;
}

export function obtenerTextoBusquedaProducto(producto){

    if(producto.textoBusqueda){
        return producto.textoBusqueda;
    }

    producto.textoBusqueda = normalizarTexto(
        (producto.producto || "") + " " +
        (producto.codigo || "") + " " +
        (producto.categoria || "")
    );

    return producto.textoBusqueda;
}