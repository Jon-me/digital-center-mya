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

    function aplicarFiltrosCatalogo(){

    state.productosVista = state.productos.filter(function(producto){

        let coincideCategoria =
            CatalogEngine.coincideCategoriaProducto(
                producto,
                state.categoriaCatalogo
            );

        if(!coincideCategoria){
            return false;
        }

        return CatalogEngine.coincideBusquedaProducto(
            producto,
            state.busquedaCatalogo
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

    return "";

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
        }
    };

    function reiniciarRenderCatalogo(){

    state.cantidadRenderProductos = 24;
    state.cantidadRenderAnterior = 0;
    state.modoRenderCatalogo = "completo";
    state.ultimaFirmaCatalogo = "";
    state.catalogoDirty = true;

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

        if(state.modoRenderCatalogo === "completo"){
            CatalogRenderer.renderInicial(tabla, rolActivo);
        } else {
            CatalogRenderer.renderIncremental(tabla, rolActivo);
        }

        state.modoRenderCatalogo = "completo";

        actualizarDashboard();

    }

    function cargarMasProductos(){

    state.cantidadRenderProductos =
        CatalogEngine.obtenerSiguienteLimiteRender(
            state.cantidadRenderProductos
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

        if(
            CatalogEngine.debeCargarMasPorScroll(tabla) &&
            state.productosVista.length > state.cantidadRenderProductos
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

async function guardarProducto(){

    let codigoInput = document.getElementById("codigo");
    let productoInput = document.getElementById("producto");
    let categoriaInput = document.getElementById("categoria");
    let stockPrincipalInput = document.getElementById("stockPrincipal");
    let stockSucursalInput = document.getElementById("stockSucursal");
    let precioCompraInput = document.getElementById("precioCompra");
    let precioInput = document.getElementById("precio");
    let imagenInput = document.getElementById("imagen");

    if(
        !codigoInput ||
        !productoInput ||
        !categoriaInput ||
        !stockPrincipalInput ||
        !stockSucursalInput ||
        !precioCompraInput ||
        !precioInput ||
        !imagenInput
    ){
        alert("ERROR: Hay un input del formulario que no existe en el HTML.");
        return;
    }

    let codigo = codigoInput.value.trim();
    let producto = productoInput.value.trim();
    let categoria = categoriaInput.value.trim();

    let stockPrincipal = stockPrincipalInput.value;
    let stockSucursal = stockSucursalInput.value;
    let stock = Number(stockPrincipal || 0) + Number(stockSucursal || 0);

    let precioCompra = precioCompraInput.value;
    let precio = precioInput.value;

    let archivo = imagenInput.files[0];

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
        isNaN(Number(stockPrincipal || 0)) ||
        isNaN(Number(stockSucursal || 0)) ||
        isNaN(Number(precioCompra)) ||
        isNaN(Number(precio))
    ){
        alert("Stock y precios deben ser números válidos");
        return;
    }

    if(
        !Number.isInteger(Number(stockPrincipal || 0)) ||
        !Number.isInteger(Number(stockSucursal || 0))
    ){
        alert("El stock por tienda debe ser un número entero");
        return;
    }

    if(
        Number(stockPrincipal || 0) < 0 ||
        Number(stockSucursal || 0) < 0 ||
        Number(precioCompra) < 0 ||
        Number(precio) < 0
    ){
        alert("Stock y precios no pueden ser negativos");
        return;
    }

    let urlImagen = "";

    try{
        urlImagen = await subirImagenProductoStorage(archivo);
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

    if(state.indiceEditar !== null && urlImagen === ""){
        urlImagen = state.productos[state.indiceEditar].imagen || "";
    }

    let nuevoProducto = {
        codigo: codigo,
        producto: producto,
        categoria: categoria,
        stock: Number(stock),
        stockTiendas: {
            principal: Number(stockPrincipal || 0),
            sucursal: Number(stockSucursal || 0)
        },
        precioCompra: Number(precioCompra),
        precio: Number(precio),
        imagen: urlImagen
    };

    if(state.indiceEditar !== null){

        let productoEditar = state.productos[state.indiceEditar];

        await updateDoc(
            doc(db, "productos", productoEditar.id),
            nuevoProducto
        );

        alert("✅ Producto editado correctamente");

        state.indiceEditar = null;

    } else {

        await addDoc(collection(db, "productos"), nuevoProducto);

        alert("✅ Producto guardado correctamente");
    }

    codigoInput.value = "";
    productoInput.value = "";
    categoriaInput.value = "";
    stockPrincipalInput.value = "";
    stockSucursalInput.value = "";
    precioCompraInput.value = "";
    precioInput.value = "";
    imagenInput.value = "";

    let nombreImagenProducto = document.getElementById("nombreImagenProducto");

    if(nombreImagenProducto){
        nombreImagenProducto.innerHTML = "Ninguna imagen seleccionada";
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

    document.getElementById("stockPrincipal").value = stockTiendasEditar.principal;
    document.getElementById("stockSucursal").value = stockTiendasEditar.sucursal;
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