// =====================================================
// DIGITAL CENTER M&A
// CATALOG ENGINE
// FASE 18
// =====================================================

export function crearCatalogEngine(deps){

    const {

        normalizarTexto

    } = deps;

    function coincideCategoriaProducto(producto, categoriaActual){

        let categoria =
            normalizarTexto(categoriaActual);

        let categoriaProducto =
            normalizarTexto(producto.categoria);

        if(categoria === "todos"){
            return true;
        }

        return (
            categoriaProducto === categoria ||
            categoriaProducto.includes(categoria)
        );

    }

    function crearTokensBusqueda(texto){

    return normalizarTexto(texto)
        .split(/\s+/)
        .filter(function(token){
            return token.length > 0;
        });

}

function crearTextoBusquedaProducto(producto){

    return [
        producto.producto,
        producto.codigo,
        producto.categoria
    ].join(" ");

}

function construirIndiceBusqueda(productos){

    const indice = new Map();

    productos.forEach(function(producto){

        const texto = crearTextoBusquedaProducto(producto);
        const tokens = crearTokensBusqueda(texto);

        tokens.forEach(function(token){

            if(!indice.has(token)){
                indice.set(token, []);
            }

            indice.get(token).push(producto);

        });

    });

    return indice;

}

function buscarEnIndice(indice, busquedaActual){

    const tokensBusqueda = crearTokensBusqueda(busquedaActual);

    if(tokensBusqueda.length === 0){
        return null;
    }

    const resultados = new Map();

    tokensBusqueda.forEach(function(tokenBuscado){

        indice.forEach(function(productos, tokenIndice){

            if(tokenIndice.includes(tokenBuscado)){
                productos.forEach(function(producto){
                    resultados.set(producto.id, producto);
                });
            }

        });

    });

    return Array.from(resultados.values());

}

    function coincideBusquedaProducto(producto, busquedaActual){

    let busqueda =
        normalizarTexto(busquedaActual);

    if(busqueda === ""){
        return true;
    }

    let textoBusqueda = normalizarTexto(
        (producto.producto || "") + " " +
        (producto.codigo || "") + " " +
        (producto.categoria || "")
    );

    return textoBusqueda.includes(busqueda);

}

function ordenarProductos(lista){

    return [...lista].sort(function(a, b){

        return String(a.codigo || "")
            .localeCompare(String(b.codigo || ""));

    });

}

function obtenerViewportProductos(
    productos,
    inicio,
    cantidad
){

    return productos.slice(
        inicio,
        inicio + cantidad
    );

}

function obtenerLimiteRender(
    categoria,
    cantidadProductos
){

    return Math.min(48, cantidadProductos);

}

function obtenerSiguienteLimiteRender(
    limiteActual,
    totalProductos,
    incremento = 48
){

    return Math.min(
        limiteActual + incremento,
        totalProductos
    );

}

function debeCargarMasPorScroll(elemento, margen = 250){

    if(!elemento){
        return false;
    }

    return (
        elemento.scrollTop +
        elemento.clientHeight >=
        elemento.scrollHeight - margen
    );

}

    return {

    coincideCategoriaProducto,
    coincideBusquedaProducto,
    ordenarProductos,
    obtenerViewportProductos,
    obtenerLimiteRender,
    obtenerSiguienteLimiteRender,
    debeCargarMasPorScroll,
    crearTokensBusqueda,
    crearTextoBusquedaProducto,
    construirIndiceBusqueda,
    buscarEnIndice

};

}