// =====================================================
// DIGITAL CENTER M&A
// PRODUCTOS MODULE
// FASE 3 - Catalogo profesional
// =====================================================

export function crearCatalogoProductos(deps){

    const {
        state,
        db,
        storage,
        collection,
        addDoc,
        deleteDoc,
        updateDoc,
        doc,
        ref,
        uploadBytes,
        getDownloadURL,
        deleteObject,
        obtenerStockTiendas,
        obtenerStockTotal,
        renderizarStockHTML,
        renderizarFormularioStock,
        actualizarDashboard,
        CatalogEngine,
    } = deps;

    function normalizarTexto(valor){
        return String(valor || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function obtenerTextoBusquedaProducto(producto){

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

    function ordenarProductosPorCodigo(){

    state.productos =
        CatalogEngine.ordenarProductos(
            state.productos
        );

}

let indiceBusquedaCatalogo = null;

function reconstruirIndiceBusquedaCatalogo(){

    indiceBusquedaCatalogo =
        CatalogEngine.construirIndiceBusqueda(
            state.productos
        );

}

    function aplicarFiltrosCatalogo(){

    if(!indiceBusquedaCatalogo){
        reconstruirIndiceBusquedaCatalogo();
    }

    let resultadosBusqueda = null;

    if(state.busquedaCatalogo && state.busquedaCatalogo.trim() !== ""){
        resultadosBusqueda = CatalogEngine.buscarEnIndice(
            indiceBusquedaCatalogo,
            state.busquedaCatalogo
        );
    }

    let baseProductos = resultadosBusqueda || state.productos;

    state.productosVista = baseProductos.filter(function(producto){

        return CatalogEngine.coincideCategoriaProducto(
            producto,
            state.categoriaCatalogo
        );

    });

    state.productosVista =
        CatalogEngine.ordenarProductos(
            state.productosVista
        );

}

    function actualizarLimiteRender(){

    if(state.modoRenderCatalogo === "incremental"){
        return;
    }

    state.cantidadRenderProductos =
        CatalogEngine.obtenerLimiteRender(
            state.categoriaCatalogo,
            state.productosVista.length
        );

}

    function renderProductoCard(producto, rolActivo){

        let stockTiendas = obtenerStockTiendas(producto);
        let stockTotal = obtenerStockTotal(producto);

        return `
        <div
    class="producto-card"
    data-producto-id="${producto.id}">

            <img
    class="imagen-producto-lazy"
    loading="lazy"
    src="data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22180%22><rect width=%22100%25%22 height=%221100%25%22 fill=%22%23ffffff%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%230f172a%22 font-size=%2220%22 font-family=%22Arial%22>Cargando...</text></svg>"
    data-src="${producto.imagen || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22180%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23ffffff%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%230f172a%22 font-size=%2220%22 font-family=%22Arial%22>Sin imagen</text></svg>'}"
/>

            <h3>${producto.producto}</h3>
            <p>Código: ${producto.codigo}</p>
            <p>Categoría: ${producto.categoria}</p>

            <div class="stock-tiendas-card">

    <p class="stock-total">
        Stock Total: ${stockTotal}
    </p>

    ${renderizarStockHTML(stockTiendas)}

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

    return "";

}

function renderSkeletonCatalogo(cantidad = 12){

    return Array.from({ length: cantidad }, function(){

        return `
            <div class="producto-card skeleton-card">

                <div class="skeleton skeleton-img"></div>

                <div class="skeleton skeleton-line grande"></div>

                <div class="skeleton skeleton-line"></div>

                <div class="skeleton skeleton-line corta"></div>

                <div class="skeleton skeleton-btn"></div>

            </div>
        `;

    }).join("");

}

const CONFIG_VIRTUAL_SCROLL_CATALOGO = {
    alturaProducto: 260,
    buffer: 6,
    minimoProductosVirtual: 999999
};

const estadoVirtualCatalogo = {
    activo: false,
    inicio: 0,
    fin: 0,
    productos: []
};

function debeUsarVirtualScrollCatalogo(){
    return state.productosVista.length >= CONFIG_VIRTUAL_SCROLL_CATALOGO.minimoProductosVirtual;
}

function calcularRangoVirtualCatalogo(scrollTop, altoContenedor, totalProductos){
    let alturaProducto = CONFIG_VIRTUAL_SCROLL_CATALOGO.alturaProducto;
    let buffer = CONFIG_VIRTUAL_SCROLL_CATALOGO.buffer;

    let inicioVisible = Math.floor(scrollTop / alturaProducto);
    let cantidadVisible = Math.ceil(altoContenedor / alturaProducto);

    let inicio = Math.max(0, inicioVisible - buffer);
    let fin = Math.min(totalProductos, inicioVisible + cantidadVisible + buffer);

    return {
        inicio,
        fin
    };
}

function renderVirtualCatalogo(tabla, rolActivo){

    let totalProductos = state.productosVista.length;

    let rango = calcularRangoVirtualCatalogo(
        tabla.scrollTop,
        tabla.clientHeight || window.innerHeight,
        totalProductos
    );

    let html = renderProductosRango(
        rango.inicio,
        rango.fin,
        rolActivo
    );

    let altura = CONFIG_VIRTUAL_SCROLL_CATALOGO.alturaProducto;

    tabla.innerHTML = `
        <div class="catalogo-spacer-virtual" style="height:${rango.inicio * altura}px;"></div>
        ${html}
        <div class="catalogo-spacer-virtual" style="height:${Math.max(0, (totalProductos - rango.fin) * altura)}px;"></div>
    `;

    estadoVirtualCatalogo.activo = true;
    estadoVirtualCatalogo.inicio = rango.inicio;
    estadoVirtualCatalogo.fin = rango.fin;
    estadoVirtualCatalogo.productos = state.productosVista;
}

function actualizarVirtualCatalogo(tabla, rolActivo){

    if(!estadoVirtualCatalogo.activo){
        return;
    }

    let totalProductos = state.productosVista.length;

    let rango = calcularRangoVirtualCatalogo(
        tabla.scrollTop,
        tabla.clientHeight || window.innerHeight,
        totalProductos
    );

    if(
        rango.inicio === estadoVirtualCatalogo.inicio &&
        rango.fin === estadoVirtualCatalogo.fin
    ){
        return;
    }

    renderVirtualCatalogo(tabla, rolActivo);
}

let observerImagenes = null;

function inicializarLazyImages(){

    if(observerImagenes){
        observerImagenes.disconnect();
    }

    observerImagenes = new IntersectionObserver(function(entries){

        entries.forEach(function(entry){

            if(!entry.isIntersecting){
                return;
            }

            const imagen = entry.target;

            imagen.src = imagen.dataset.src;

            observerImagenes.unobserve(imagen);

        });

    },{
        root: null,
        rootMargin: "250px",
        threshold: 0.01
    });

    document
        .querySelectorAll(".imagen-producto-lazy")
        .forEach(function(img){
            observerImagenes.observe(img);
        });

}

    function renderProductosRango(
    inicio,
    fin,
    rolActivo
){

    let productosVisibles =
        CatalogEngine.obtenerViewportProductos(
            state.productosVista,
            inicio,
            fin - inicio
        );

    return productosVisibles
        .map(function(producto){

            return renderProductoCard(
                producto,
                rolActivo
            );

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
    },

    actualizarTarjeta: function(producto, rolActivo){

        const tarjeta = document.querySelector(
            `.producto-card[data-producto-id="${producto.id}"]`
        );

        if(!tarjeta){
            return false;
        }

        const temporal = document.createElement("div");

        temporal.innerHTML = renderProductoCard(
            producto,
            rolActivo
        );

        tarjeta.replaceWith(
            temporal.firstElementChild
        );

        return true;
    }

};

    function reiniciarRenderCatalogo(){

    state.cantidadRenderProductos = 24;
    state.cantidadRenderAnterior = 0;
    state.modoRenderCatalogo = "completo";
    state.ultimaFirmaCatalogo = "";
    state.catalogoDirty = true;
    indiceBusquedaCatalogo = null;

}
    function mostrarProductos(){

        let tabla = document.getElementById("tablaProductos");

        if(!tabla || !state.catalogoDirty){
            return;
        }

        aplicarFiltrosCatalogo();

        actualizarLimiteRender();

        let firmaCatalogo =
            state.catalogoVersion +
            "|" + state.cantidadRenderProductos +
            "|" + state.busquedaCatalogo +
            "|" + state.categoriaCatalogo +
            "|" + localStorage.getItem("rolActivo");

        if(firmaCatalogo === state.ultimaFirmaCatalogo){
            state.catalogoDirty = false;
            return;
        }

        state.ultimaFirmaCatalogo = firmaCatalogo;
        state.catalogoDirty = false;

        let rolActivo = localStorage.getItem("rolActivo");

        if(
    state.modoRenderCatalogo === "completo" &&
    debeUsarVirtualScrollCatalogo()
){
    renderVirtualCatalogo(tabla, rolActivo);
} else if(state.modoRenderCatalogo === "completo"){
    estadoVirtualCatalogo.activo = false;
    CatalogRenderer.renderInicial(tabla, rolActivo);
} else {
    estadoVirtualCatalogo.activo = false;
    CatalogRenderer.renderIncremental(tabla, rolActivo);
}

        state.modoRenderCatalogo = "completo";
        
        inicializarLazyImages();

        actualizarDashboard();

    }

    function cargarMasProductos(){

    state.cantidadRenderProductos =
    CatalogEngine.obtenerSiguienteLimiteRender(
        state.cantidadRenderProductos,
        state.productosVista.length
    );

    state.modoRenderCatalogo = "incremental";
    state.catalogoDirty = true;

    mostrarProductos();

}

function inicializarScrollCatalogo(){

    let tabla = document.getElementById("tablaProductos");

    if(!tabla){
        return;
    }

    tabla.addEventListener("scroll", function(){

        let rolActivo = localStorage.getItem("rolActivo");

        if(estadoVirtualCatalogo.activo){
            actualizarVirtualCatalogo(tabla, rolActivo);
            return;
        }

        if(
    CatalogEngine.debeCargarMasPorScroll(tabla) &&
    state.cantidadRenderProductos < state.productosVista.length
){
    cargarMasProductos();
}

    });

}

    function buscarProducto(){

        let buscador = document.getElementById("buscador");

        state.busquedaCatalogo = buscador ? buscador.value : "";

        reiniciarRenderCatalogo();
        mostrarProductos();
    }

    function filtrarCategoria(categoria){

        state.categoriaCatalogo = categoria || "todos";

        reiniciarRenderCatalogo();
        mostrarProductos();
    }

    async function subirImagenProductoStorage(archivo){

    if(!archivo){
        return "";
    }

    let nombreArchivo =
        "productos/" +
        Date.now() +
        "_" +
        archivo.name.replace(/\s+/g, "_");

    let imagenRef = ref(storage, nombreArchivo);

    await uploadBytes(imagenRef, archivo);

    return await getDownloadURL(imagenRef);
}

async function eliminarImagenAnteriorStorage(urlImagen){

    if(!urlImagen){
        return;
    }

    if(!urlImagen.includes("firebasestorage.googleapis.com")){
        return;
    }

    try{
        let imagenRef = ref(storage, urlImagen);
        await deleteObject(imagenRef);
    }catch(error){
        console.warn("No se pudo eliminar imagen anterior:", error);
    }
}

function obtenerStockFormulario(){

    const stockTiendas = {};

    document
        .querySelectorAll(".stock-sucursal-input")
        .forEach(function(input){

            const idSucursal =
                input.dataset.sucursalId;

            const cantidad =
                Number(input.value || 0);

            if(!idSucursal){
                return;
            }

            if(
                !Number.isInteger(cantidad) ||
                cantidad < 0
            ){
                throw new Error(
                    "El stock de cada sucursal debe ser un número entero mayor o igual a cero"
                );
            }

            stockTiendas[idSucursal] = cantidad;

        });

    if(Object.keys(stockTiendas).length === 0){
        throw new Error(
            "No se encontraron sucursales para registrar el stock"
        );
    }

    return stockTiendas;
}

async function guardarProducto(){

    const codigoInput =
        document.getElementById("codigo");

    const productoInput =
        document.getElementById("producto");

    const categoriaInput =
        document.getElementById("categoria");

    const precioCompraInput =
        document.getElementById("precioCompra");

    const precioInput =
        document.getElementById("precio");

    const imagenInput =
        document.getElementById("imagen");

    if(
        !codigoInput ||
        !productoInput ||
        !categoriaInput ||
        !precioCompraInput ||
        !precioInput ||
        !imagenInput
    ){
        alert("ERROR: Hay un input del formulario que no existe en el HTML.");
        return;
    }

    const codigo =
        codigoInput.value.trim();

    const producto =
        productoInput.value.trim();

    const categoria =
        categoriaInput.value.trim();

    const precioCompra =
        precioCompraInput.value;

    const precio =
        precioInput.value;

    const archivo =
        imagenInput.files[0];

    if(
        codigo === "" ||
        producto === "" ||
        categoria === "" ||
        precioCompra === "" ||
        precio === ""
    ){
        alert("Complete todos los campos del producto");
        return;
    }

    if(
        isNaN(Number(precioCompra)) ||
        isNaN(Number(precio))
    ){
        alert("Los precios deben ser números válidos");
        return;
    }

    if(
        Number(precioCompra) < 0 ||
        Number(precio) < 0
    ){
        alert("Los precios no pueden ser negativos");
        return;
    }

    let stockFormulario;

    try{

        stockFormulario =
            obtenerStockFormulario();

    }catch(error){

        alert(error.message);
        return;

    }

    let urlImagen = "";

    try{

        urlImagen =
            await subirImagenProductoStorage(archivo);

    }catch(error){

        console.error(error);

        alert(
            "ERROR REAL:\n\n" +
            error.name +
            "\n\n" +
            error.message
        );

        return;
    }

    if(
        state.indiceEditar !== null &&
        urlImagen === ""
    ){
        urlImagen =
            state.productos[state.indiceEditar].imagen || "";
    }

    let stockTiendas = {
        ...stockFormulario
    };

    if(state.indiceEditar !== null){

        const productoAnterior =
            state.productos[state.indiceEditar];

        const stockAnterior =
            obtenerStockTiendas(productoAnterior);

        stockTiendas = {
            ...stockAnterior,
            ...stockFormulario
        };

    }

    const stockTotal =
        Object.values(stockTiendas)
            .reduce(function(total, cantidad){

                return total + Number(cantidad || 0);

            }, 0);

    const nuevoProducto = {

        codigo,
        producto,
        categoria,

        stock: stockTotal,
        stockTiendas,

        precioCompra:
            Number(precioCompra),

        precio:
            Number(precio),

        imagen:
            urlImagen

    };

    if(state.indiceEditar !== null){

        const productoEditar =
            state.productos[state.indiceEditar];

        await updateDoc(
            doc(db, "productos", productoEditar.id),
            nuevoProducto
        );

        alert("✅ Producto editado correctamente");

        state.indiceEditar = null;

    }else{

        await addDoc(
            collection(db, "productos"),
            nuevoProducto
        );

        alert("✅ Producto guardado correctamente");

    }

    codigoInput.value = "";
    productoInput.value = "";
    categoriaInput.value = "";
    precioCompraInput.value = "";
    precioInput.value = "";
    imagenInput.value = "";

    document
        .querySelectorAll(".stock-sucursal-input")
        .forEach(function(input){
            input.value = "0";
        });

    const nombreImagenProducto =
        document.getElementById("nombreImagenProducto");

    if(nombreImagenProducto){
        nombreImagenProducto.innerHTML =
            "Ninguna imagen seleccionada";
    }
}

function seleccionarImagenProducto(){

    let imagenInput = document.getElementById("imagen");
    let nombreImagenProducto = document.getElementById("nombreImagenProducto");

    if(!imagenInput || !nombreImagenProducto){
        return;
    }

    let archivo = imagenInput.files[0];

    nombreImagenProducto.innerHTML = archivo
        ? archivo.name
        : "Ninguna imagen seleccionada";
}

function editarProducto(idProducto){

    localStorage.setItem("scrollEditar", window.scrollY);

    let productoEditar = state.productos.find(function(p){
        return p.id === idProducto;
    });

    if(!productoEditar){
        alert("Producto no encontrado");
        return;
    }

    let zonaAdmin = document.getElementById("zonaAdmin");

    if(zonaAdmin){
        zonaAdmin.style.display = "grid";
    }

    document.getElementById("codigo").value = productoEditar.codigo;
    document.getElementById("producto").value = productoEditar.producto;
    document.getElementById("categoria").value = productoEditar.categoria;

    let stockTiendasEditar = obtenerStockTiendas(productoEditar);

    const contenedorStock =
    document.getElementById("contenedorStockSucursales");

if(contenedorStock){

    contenedorStock.innerHTML =
        renderizarFormularioStock(
            stockTiendasEditar
        );

}
    document.getElementById("precioCompra").value = productoEditar.precioCompra || 0;
    document.getElementById("precio").value = productoEditar.precio;

    state.indiceEditar = state.productos.findIndex(function(p){
        return p.id === idProducto;
    });

    document.getElementById("zonaAdmin").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function eliminarProducto(idProducto){

    let productoEliminar = state.productos.find(function(p){
        return p.id === idProducto;
    });

    if(!productoEliminar || !productoEliminar.id){
        alert("Error: este producto no tiene ID de Firebase");
        return;
    }

    if(confirm("¿Eliminar producto?")){

        try{

            await deleteDoc(
                doc(db, "productos", productoEliminar.id)
            );

            alert("Producto eliminado correctamente");

        }catch(error){

            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar. Revisa la consola.");
        }
    }
}

    return {
        CatalogRenderer,

        normalizarTexto,
        obtenerTextoBusquedaProducto,
        ordenarProductosPorCodigo,
        aplicarFiltrosCatalogo,

        reiniciarRenderCatalogo,
        mostrarProductos,
        cargarMasProductos,
        buscarProducto,
        filtrarCategoria,
        
        subirImagenProductoStorage,
        eliminarImagenAnteriorStorage,
        guardarProducto,
        seleccionarImagenProducto,
        editarProducto,
        eliminarProducto,
        inicializarScrollCatalogo
    };
}