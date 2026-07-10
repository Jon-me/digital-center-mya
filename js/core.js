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

    const stockTiendas = {};

    if(
        producto &&
        producto.stockTiendas &&
        typeof producto.stockTiendas === "object"
    ){

        Object.entries(producto.stockTiendas)
            .forEach(function([idSucursal, cantidad]){

                stockTiendas[idSucursal] =
                    Number(cantidad || 0);

            });

    }

    if(Object.keys(stockTiendas).length === 0){

        stockTiendas.principal =
            Number(producto?.stock || 0);

        stockTiendas.sucursal = 0;

    }

    if(!Object.prototype.hasOwnProperty.call(stockTiendas, "principal")){
        stockTiendas.principal = 0;
    }

    if(!Object.prototype.hasOwnProperty.call(stockTiendas, "sucursal")){
        stockTiendas.sucursal = 0;
    }

    return stockTiendas;
}

export function obtenerStockTotal(producto){

    const stockTiendas =
        obtenerStockTiendas(producto);

    return Object.values(stockTiendas)
        .reduce(function(total, cantidad){

            return total + Number(cantidad || 0);

        }, 0);
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