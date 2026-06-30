import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    runTransaction,
    query,
    where,
    getDocs

} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyD_vUmAunFhTZH24SfCZMST5PVRBcAMMNI",
    authDomain: "digital-center-mya.firebaseapp.com",
    projectId: "digital-center-mya",
 storageBucket: "digital-center-mya.firebasestorage.app",
    messagingSenderId: "52765537655",
    appId: "1:52765537655:web:c0d0f6f5449e3cdc339d72",
    measurementId: "G-NLS4F507HM"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const messaging = getMessaging(app);

const storage = getStorage(app);

const vapidKey = "BMSTa3aFp4Te9aFTFhFGAxlnKeGnmsry8TtLBfBQNs6BjWEvefmyR3chrKuPzLwb4FqPkz0oFFI3lgD5l21infE";

let usuarios = [

    {
        usuario: "Judith",
        password: "1234",
        rol: "vendedor",
        nombreCompleto: "Judith N."
    },

    {
        usuario: "David",
        password: "1234",
        rol: "vendedor",
        nombreCompleto: "David S."
    }

];

let productos = [];

let productosVista = [];

let busquedaCatalogo = "";

let categoriaCatalogo = "todos";

let catalogoVersion = 0;

let ultimaFirmaCatalogo = "";

let productosCargadosDesdeIndexedDB = false;

let indiceEditar = null;

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let historialVentas = [];

let codigoAnulacion = "DCMYA2811";

let ventaPendienteAnular = null;

let accionAdminPendiente = null;

let montoInicialCaja = 0;

let gastosCaja = [];

let historialCajas = [];

let panelActivoModal = null;

let placeholderModal = null;

const sonidoVenta = new Audio("venta.mp3");

let productoTransferenciaActual = null;

let listenersFirebaseActivos = [];

let listenersFirebaseIniciados = false;

let catalogoDirty = true;

let cantidadRenderProductos = 24;

let cantidadRenderAnterior = 0;

let modoRenderCatalogo = "completo";

function detenerListenersFirebase(){

    listenersFirebaseActivos.forEach(function(unsubscribe){
        if(typeof unsubscribe === "function"){
            unsubscribe();
        }
    });

    listenersFirebaseActivos = [];
    listenersFirebaseIniciados = false;

}

const tiendasSistema = {
    principal: "Mercado",
    sucursal: "Peluquería"
};

function obtenerStockTiendas(producto){

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

function obtenerStockTotal(producto){

    let stockTiendas = obtenerStockTiendas(producto);

    return stockTiendas.principal + stockTiendas.sucursal;

}

sonidoVenta.volume = 0.4;

function obtenerFechaISO(){
    let fecha = new Date();

    let año = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

function ordenarProductosPorCodigo(){

    productos.sort(function(a, b){
        return String(a.codigo || "").localeCompare(String(b.codigo || ""));
    });

}

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

function aplicarFiltrosCatalogo(){

    let busqueda = normalizarTexto(busquedaCatalogo);
    let categoria = normalizarTexto(categoriaCatalogo);

    productosVista = productos.filter(function(producto){

        let coincideCategoria =
            categoria === "todos" ||
            normalizarTexto(producto.categoria) === categoria;

        if(!coincideCategoria){
            return false;
        }

        if(busqueda === ""){
            return true;
        }

        return obtenerTextoBusquedaProducto(producto).includes(busqueda);

    });

}

function renderProductoCard(producto, rolActivo){

    let stockTiendas = obtenerStockTiendas(producto);
    let stockTotal = obtenerStockTotal(producto);

    return `
     <div class="producto-card">

        <img
            loading="lazy"
            src="${producto.imagen || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22180%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23ffffff%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%230f172a%22 font-size=%2220%22 font-family=%22Arial%22>Sin imagen</text></svg>'}"
        />

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

        <button class="btn-agregar" onclick="agregarDirecto('${producto.id}')">
            🛒 Agregar
        </button>

        ${
            rolActivo === "admin"
            ? `
                <button class="btn-transferir-stock" onclick="abrirTransferenciaStock('${producto.id}')">
                    🔄 Transferir
                </button>

                <button onclick="editarProducto('${producto.id}')">
                    ✏️ Editar
                </button>

                <button onclick="eliminarProducto('${producto.id}')">
                    🗑️ Eliminar
                </button>
              `
            : ""
        }

     </div>
    `;

}

function renderBotonVerMas(){

    if(productosVista.length <= cantidadRenderProductos){
        return "";
    }

    return `
        <button class="btn-cargar-mas-productos" onclick="cargarMasProductos()">
            Ver más productos
        </button>
    `;

}

function renderProductosRango(inicio, fin, rolActivo){

    return productosVista
        .slice(inicio, fin)
        .map(function(producto){
            return renderProductoCard(producto, rolActivo);
        })
        .join("");

}

const CatalogRenderer = {

   renderIncremental: function(tabla, rolActivo){

    let html = renderProductosRango(
        cantidadRenderAnterior,
        cantidadRenderProductos,
        rolActivo
    );

    let boton = tabla.querySelector(".btn-cargar-mas-productos");

    if(boton){
        boton.remove();
    }

    tabla.insertAdjacentHTML("beforeend", html);

    tabla.insertAdjacentHTML(
        "beforeend",
        renderBotonVerMas()
    );

    cantidadRenderAnterior = cantidadRenderProductos;

},
   
    limpiar: function(tabla){
        tabla.innerHTML = "";
        cantidadRenderAnterior = 0;
    },

    renderInicial: function(tabla, rolActivo){

        this.limpiar(tabla);

        let html = renderProductosRango(
            0,
            cantidadRenderProductos,
            rolActivo
        );

        html += renderBotonVerMas();

        tabla.innerHTML = html;

        cantidadRenderAnterior = cantidadRenderProductos;

    }

};

function reiniciarRenderCatalogo(){

    cantidadRenderProductos = 24;
    cantidadRenderAnterior = 0;

    modoRenderCatalogo = "completo";

    ultimaFirmaCatalogo = "";
    catalogoDirty = true;

}

function mostrarProductos(){

    console.time("Render productos");

    let tabla = document.getElementById("tablaProductos");

    if(!tabla){
        return;
    }

    if(!catalogoDirty){
        return;
    }

    aplicarFiltrosCatalogo();

let firmaCatalogo =
    catalogoVersion +
    "|" + cantidadRenderProductos +
    "|" + busquedaCatalogo +
    "|" + categoriaCatalogo +
    "|" + localStorage.getItem("rolActivo");

    if(firmaCatalogo === ultimaFirmaCatalogo){
        catalogoDirty = false;
        console.timeEnd("Render productos");
        return;
    }

    ultimaFirmaCatalogo = firmaCatalogo;
    catalogoDirty = false;

    let rolActivo = localStorage.getItem("rolActivo");

if (modoRenderCatalogo === "completo") {

    CatalogRenderer.renderInicial(
        tabla,
        rolActivo
    );

} else {

    CatalogRenderer.renderIncremental(
        tabla,
        rolActivo
    );

}

modoRenderCatalogo = "completo";

actualizarDashboard();

console.timeEnd("Render productos");

}

function cargarMasProductos(){

    cantidadRenderProductos += 24;

    modoRenderCatalogo = "incremental";

    catalogoDirty = true;

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

    let urlImagen = await getDownloadURL(imagenRef);

    return urlImagen;

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
    let imagenCamaraInput = document.getElementById("imagenCamara");

    if(
        !codigoInput ||
        !productoInput ||
        !categoriaInput ||
        !stockPrincipalInput ||
        !stockSucursalInput ||
        !precioCompraInput ||
        !precioInput ||
        !imagenInput ||
        !imagenCamaraInput
    )

    {
        alert("ERROR: Hay un input del formulario que no existe en el HTML.");
        return;
    }

    let codigo = codigoInput.value;
    let producto = productoInput.value;
    let categoria = categoriaInput.value;

    let stockPrincipal = stockPrincipalInput.value;
    let stockSucursal = stockSucursalInput.value;
    let stock = Number(stockPrincipal || 0) + Number(stockSucursal || 0);

    let precioCompra = precioCompraInput.value;
    let precio = precioInput.value;

    let archivo =
    imagenCamaraInput.files[0] ||
    imagenInput.files[0];

    if(
        codigo.trim() === "" ||
        producto.trim() === "" ||
        categoria.trim() === "" ||
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
    if(indiceEditar !== null && urlImagen === ""){
        urlImagen = productos[indiceEditar].imagen || "";
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

    if(indiceEditar !== null){

        let productoEditar = productos[indiceEditar];

        await updateDoc(
            doc(db, "productos", productoEditar.id),
            nuevoProducto
        );

        alert("✅ Producto editado correctamente");

        indiceEditar = null;

    } else {

        await addDoc(collection(db, "productos"), nuevoProducto);

        alert("✅ Producto guardado correctamente");

    }

    document.getElementById("codigo").value = "";
    document.getElementById("producto").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("stockPrincipal").value = "";
    document.getElementById("stockSucursal").value = "";
    document.getElementById("precioCompra").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("imagenCamara").value = "";
    document.getElementById("nombreImagenProducto").innerHTML = "Ninguna imagen seleccionada";

}

function seleccionarImagenProducto(origen){

    let imagenInput = document.getElementById("imagen");
    let imagenCamaraInput = document.getElementById("imagenCamara");
    let nombreImagenProducto = document.getElementById("nombreImagenProducto");

    if(origen === "galeria"){
        imagenCamaraInput.value = "";
    }

    if(origen === "camara"){
        imagenInput.value = "";
    }

    let archivo =
        imagenCamaraInput.files[0] ||
        imagenInput.files[0];

    if(nombreImagenProducto){
        nombreImagenProducto.innerHTML = archivo
            ? archivo.name
            : "Ninguna imagen seleccionada";
    }

}

window.seleccionarImagenProducto = seleccionarImagenProducto;

window.guardarProducto = guardarProducto;

function editarProducto(idProducto){

    localStorage.setItem(
        "scrollEditar",
        window.scrollY
    );

    let productoEditar = productos.find(function(p){
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

    indiceEditar = productos.findIndex(function(p){
        return p.id === idProducto;
    });

    document.getElementById("zonaAdmin").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

async function eliminarProducto(idProducto){

    let productoEliminar = productos.find(function(p){
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

        } catch(error){

            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar. Revisa la consola.");

        }

    }

}

function buscarProducto(){

    let buscador = document.getElementById("buscador");

    busquedaCatalogo = buscador ? buscador.value : "";

   reiniciarRenderCatalogo();

    mostrarProductos();

}

function mostrarCarrito(){

    let tablaCarrito = document.getElementById("carritoTabla");

    if(!tablaCarrito){
        return;
    }

    let html = "";
    let total = 0;
    let cantidadProductos = 0;

    limpiarDescuentoSiCarritoVacio();

    carrito.forEach(function(item, index){

        cantidadProductos += item.cantidad;
        total += Number(item.subtotal);

        html += `
        <tr>
            <td>
                <strong>${item.producto}</strong>

                <input
                    type="text"
                    class="input-nombre-boleta-carrito"
                    value="${item.nombreBoleta || ""}"
                    placeholder="Nombre para boleta"
                    oninput="actualizarNombreBoletaCarrito(${index}, this.value)"
                >
            </td>

            <td>${item.cantidad}</td>
            <td>S/ ${item.precio.toFixed(2)}</td>
            <td>S/ ${item.subtotal.toFixed(2)}</td>

            <td>
                <button onclick="eliminarDelCarrito(${index})">
                    X
                </button>
            </td>
        </tr>
        `;

    });

    tablaCarrito.innerHTML = html;

    document.getElementById("tituloCarrito").innerHTML =
        "🛒 Carrito (" + cantidadProductos + ")";

let contadorFlotante = document.getElementById("contadorCarritoFlotante");

if(contadorFlotante){
    contadorFlotante.innerHTML = cantidadProductos;
}

actualizarResumenVenta();

}

function actualizarResumenVenta(){

    let total = 0;
    let cantidadProductos = 0;

    carrito.forEach(function(item){
        cantidadProductos += Number(item.cantidad || 0);
        total += Number(item.subtotal || 0);
    });

    let contadorFlotante = document.getElementById("contadorCarritoFlotante");

    if(contadorFlotante){
        contadorFlotante.innerHTML = cantidadProductos;
    }

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

function actualizarNombreBoletaCarrito(index, valor){

    carrito[index].nombreBoleta = valor.trim();

    localStorage.setItem("carrito", JSON.stringify(carrito));

}

function eliminarDelCarrito(index){

    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

   mostrarCarrito();

}

function agregarDirecto(idProducto){

    let producto = productos.find(function(p){
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

    let itemExistente = carrito.find(function(item){
        return item.id === producto.id;
    });

    let cantidadEnCarrito = itemExistente ? Number(itemExistente.cantidad || 0) : 0;

    if(cantidadEnCarrito + 1 > stockTotal){
        alert("No hay más stock disponible");
        return;
    }

    if(itemExistente){

        itemExistente.cantidad += 1;
        itemExistente.subtotal =
            itemExistente.cantidad * itemExistente.precio;

    } else {

        carrito.push({
            id: producto.id,
            producto: producto.producto,
            categoria: producto.categoria || "Sin categoría",
            cantidad: 1,
            precioCompra: Number(producto.precioCompra || 0),
            precio: Number(producto.precio),
            subtotal: Number(producto.precio)
        });

    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

   mostrarCarrito();

}

function cancelarVenta(){

    carrito = [];

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

function obtenerPagosMixtos(){

    let pagos = {
        efectivo: Number(document.getElementById("pagoEfectivo").value) || 0,
        yape: Number(document.getElementById("pagoYape").value) || 0,
        plin: Number(document.getElementById("pagoPlin").value) || 0,
        tarjeta: Number(document.getElementById("pagoTarjeta").value) || 0,
        transferencia: Number(document.getElementById("pagoTransferencia").value) || 0
    };

    return pagos;

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

    carrito.forEach(function(item){
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

async function finalizarVenta(numeroBoleta = "SIN IMPRESION"){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let total = 0;
    let ganancia = 0;
    let descuento = obtenerDescuento();
    let metodoPago = "Pagos mixtos";
let tiendaVenta =
    document.getElementById("tiendaVenta").value || "principal";

carrito.forEach(function(item){

    total += item.subtotal;

    ganancia +=
        (item.precio - item.precioCompra) * item.cantidad;

});

let totalFinal = total - descuento;

if(totalFinal < 0){
    totalFinal = 0;
}

let pagos = obtenerPagosMixtos();

let totalPagado =
    pagos.efectivo +
    pagos.yape +
    pagos.plin +
    pagos.tarjeta +
    pagos.transferencia;

if(Math.abs(totalPagado - totalFinal) > 0.01){

    alert(
        "⚠️ El pago no coincide con el total.\n\n" +
        "Total venta: S/ " + totalFinal.toFixed(2) + "\n" +
        "Pagado: S/ " + totalPagado.toFixed(2)
    );

    return;
}

let clienteNombre =
    document.getElementById("clienteNombre").value || "CLIENTE GENERAL";

let clienteDni =
    document.getElementById("clienteDni").value || "-";

let venta = {
    numeroBoleta: numeroBoleta,
    fecha: new Date().toLocaleDateString(),
    fechaISO: obtenerFechaISO(),
    hora: new Date().toLocaleTimeString(),
    clienteNombre: clienteNombre,
    clienteDni: clienteDni,
    vendedor: localStorage.getItem("nombreActivo") || "Sin vendedor",
    productos: JSON.parse(JSON.stringify(carrito)),
    descuento: descuento,
    metodoPago: metodoPago,
    tiendaVenta: tiendaVenta,
tiendaVentaNombre: tiendasSistema[tiendaVenta],
    pagos: pagos,
    total: totalFinal,
    ganancia: ganancia - descuento
};

try{

    await runTransaction(db, async function(transaction){

        for(let item of carrito){

            let productoRef = doc(db, "productos", item.id);
            let productoSnap = await transaction.get(productoRef);

            if(!productoSnap.exists()){
                throw new Error("Producto no encontrado");
            }

            let productoData = productoSnap.data();
           let stockTiendas = obtenerStockTiendas(productoData);
let cantidadDescontar = Number(item.cantidad);

if(stockTiendas[tiendaVenta] < cantidadDescontar){
    throw new Error(
        "Stock insuficiente en " +
        tiendasSistema[tiendaVenta] +
        " para: " +
        item.producto
    );
}

stockTiendas[tiendaVenta] -= cantidadDescontar;

let nuevoStockTotal =
    stockTiendas.principal +
    stockTiendas.sucursal;

transaction.update(productoRef, {
    stock: nuevoStockTotal,
    stockTiendas: stockTiendas
});

        }

        let ventaRef = doc(collection(db, "ventas"));
        transaction.set(ventaRef, venta);

        if(numeroBoleta !== "SIN IMPRESION"){

    let boletaRef = doc(collection(db, "boletas"));

    transaction.set(boletaRef, {
        ...venta,
        estado: "activa",
        creadaEn: new Date().toISOString()
    });

}
    });

} catch(error){

    alert(error.message);
    return;

}

sonidoVenta.currentTime = 0;

sonidoVenta.play().catch(function(error){
    console.log(error);
});

setTimeout(function(){

    alert("✅ Venta realizada correctamente");

}, 150);

carrito = [];

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

function desbloquearSistema(){

    let fondo = document.getElementById("fondoModal");
    let modal = document.getElementById("modalCodigo");

    if(fondo){
        fondo.style.display = "none";
        fondo.style.visibility = "hidden";
        fondo.style.pointerEvents = "none";
    }

    if(modal){
        modal.style.display = "none";
        modal.style.visibility = "hidden";
        modal.style.pointerEvents = "none";
    }

    document.body.style.pointerEvents = "auto";
    document.documentElement.style.pointerEvents = "auto";

    document.querySelectorAll("input, button, select, textarea").forEach(function(elemento){
        elemento.disabled = false;
        elemento.style.pointerEvents = "auto";
    });

}

function apagarSonidoLogin(){

    let videoLaptop = document.getElementById("videoFondoLaptop");
    let videoApp = document.getElementById("videoFondoApp");
    let boton = document.getElementById("btnSonido");

    [videoLaptop, videoApp].forEach(function(video){

        if(video){
            video.muted = true;
            video.volume = 0;
            video.pause();
            video.currentTime = 0;
        }

    });

    if(boton){
        boton.textContent = "🔊 Activar sonido";
        boton.style.display = "none";
    }

}

async function hidratarProductosDesdeIndexedDB(){

    if(productosCargadosDesdeIndexedDB){
        return;
    }

    productosCargadosDesdeIndexedDB = true;

    let productosLocalDB = await cargarProductosIndexedDB();

    if(productosLocalDB.length === 0){
        return;
    }

    productos = productosLocalDB;

    ordenarProductosPorCodigo();

catalogoVersion++;

ultimaFirmaCatalogo = "";

reiniciarRenderCatalogo();

    mostrarProductos();

}

async function iniciarSesion(){

    let usuarioInput =
        document.getElementById("usuario").value.trim();

    let passwordInput =
        document.getElementById("password").value.trim();

    let usuarioEncontrado = null;

    // 1. Buscar primero en Firebase
    let usuarioRef = doc(db, "usuarios", usuarioInput);
    let usuarioSnap = await getDoc(usuarioRef);

    if(usuarioSnap.exists()){

        let usuarioFirebase = usuarioSnap.data();

        if(usuarioFirebase.password === passwordInput){
            usuarioEncontrado = usuarioFirebase;
        }

    }

    // 2. Si no está en Firebase, buscar vendedores locales
    if(!usuarioEncontrado){

        usuarioEncontrado = usuarios.find(function(user){
            return (
                user.usuario === usuarioInput &&
                user.password === passwordInput
            );
        });

    }

    if(!usuarioEncontrado){
        alert("Usuario o contraseña incorrectos");
        return;
    }

    localStorage.setItem("sesion", "activa");
    localStorage.setItem("usuarioActivo", usuarioEncontrado.usuario);
    localStorage.setItem("nombreActivo", usuarioEncontrado.nombreCompleto);
    localStorage.setItem("rolActivo", usuarioEncontrado.rol);

    document.body.classList.remove("rol-admin", "rol-vendedor");
    document.body.classList.add("rol-" + usuarioEncontrado.rol);

    document.getElementById("login").style.display = "none";
document.getElementById("sistema").style.display = "block";

apagarSonidoLogin();

sonidoVenta.load();

    if(usuarioEncontrado.rol === "vendedor"){
        document.getElementById("dashboardAdmin").style.display = "none";
    } else {
        document.getElementById("dashboardAdmin").style.display = "grid";
    }

    desbloquearSistema();
    iniciarListenersFirebase();

    setTimeout(async function(){

    mostrarCarrito();
    controlarColumnaGanancia();
    aplicarPermisos();

await hidratarProductosDesdeIndexedDB();

}, 100);

}

function aplicarPermisos(){

    const centroControl = document.getElementById("centroControlAdmin");

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor"){

    if(centroControl){
        centroControl.style.display = "none";
    }

        document.getElementById("dashboardAdmin").style.display = "none";
        document.getElementById("dashboardReportes").style.display = "none";
        document.getElementById("panelReporteVendedores").style.display = "none";
        document.getElementById("zonaAdmin").style.display = "none";
        document.getElementById("tituloReportes").style.display = "none";
        document.getElementById("tituloDashboardEjecutivo").style.display = "none";
        document.getElementById("dashboardEjecutivo").style.display = "none";

let btnBorrarHistorial =
    document.getElementById("btnBorrarHistorialCajas");

if(btnBorrarHistorial){
    btnBorrarHistorial.style.display = "none";
}

        let columnaGanancia = document.getElementById("columnaGanancia");
        if(columnaGanancia){
            columnaGanancia.style.display = "none";
        }

        document.querySelectorAll(".btn-toggle-producto").forEach(function(btn){

    if(
    btn.innerText.includes("Caja Diaria") ||
    btn.innerText.includes("Historial de Ventas")
){
    btn.style.display = "inline-block";
} else {
    btn.style.display = "none";
}

});
        document.querySelectorAll('button[onclick^="editarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

        document.querySelectorAll('button[onclick^="eliminarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

    } else {

        if(centroControl){
        centroControl.style.display = "block";
    }

    document.getElementById("dashboardAdmin").style.display = "grid";
    document.getElementById("tituloReportes").style.display = "block";
    document.getElementById("dashboardReportes").style.display = "grid";
    document.getElementById("tituloDashboardEjecutivo").style.display = "block";
    document.getElementById("dashboardEjecutivo").style.display = "grid";
    
    let btnBorrarHistorial =
        document.getElementById("btnBorrarHistorialCajas");

    if(btnBorrarHistorial){
        btnBorrarHistorial.style.display = "inline-block";
    }

    document.querySelectorAll(".btn-toggle-producto").forEach(function(btn){
        btn.style.display = "inline-block";
    });

}

}

function cerrarSesion(){

    detenerListenersFirebase();

    localStorage.removeItem("sesion");
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("nombreActivo");
    localStorage.removeItem("rolActivo");

    location.reload();

}

// VERIFICAR SESIÓN ACTIVA AL RECARGAR
if(localStorage.getItem("sesion") === "activa"){

    document.getElementById("login").style.display = "none";

    document.getElementById("sistema").style.display = "block";

    apagarSonidoLogin();

    document.body.classList.remove("rol-admin", "rol-vendedor");
document.body.classList.add("rol-" + localStorage.getItem("rolActivo"));

    if(localStorage.getItem("rolActivo") === "vendedor"){
        document.getElementById("dashboardAdmin").style.display = "none";
    } else {
        document.getElementById("dashboardAdmin").style.display = "grid";
    }

           mostrarCarrito();

controlarColumnaGanancia();

aplicarPermisos();

desbloquearSistema();

iniciarListenersFirebase();

setTimeout(async function(){

await hidratarProductosDesdeIndexedDB();

}, 300);

} else {

    document.getElementById("login").style.display = "block";

    document.getElementById("sistema").style.display = "none";

    document.getElementById("btnSonido").style.display = "block";

    desbloquearSistema();

}

// ENTER SOLO PARA LOGIN
document.addEventListener("DOMContentLoaded", function(){

    let descuentoInput = document.getElementById("descuentoVenta");
["pagoEfectivo", "pagoYape", "pagoPlin", "pagoTarjeta", "pagoTransferencia"].forEach(function(id){

    let input = document.getElementById(id);

    if(input){
        input.addEventListener("input", function(){
            calcularTotalPagado();
        });
    }

});

    limpiarDescuentoSiCarritoVacio();

    setTimeout(limpiarDescuentoSiCarritoVacio, 100);
    setTimeout(limpiarDescuentoSiCarritoVacio, 500);

    if(descuentoInput){
        descuentoInput.addEventListener("input", function(){
    actualizarResumenVenta();
});
    }

   let inputUsuario = document.getElementById("usuario");
let inputPassword = document.getElementById("password");

if(inputUsuario){
    inputUsuario.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });
}

if(inputPassword){
    inputPassword.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });
}

});

window.addEventListener("pageshow", function(){
    limpiarDescuentoSiCarritoVacio();
});

function actualizarDashboard(){

    let totalProductos = document.getElementById("totalProductos");
    let valorInventario = document.getElementById("valorInventario");
    let productosCarrito = document.getElementById("productosCarrito");
    let ventaActualElemento = document.getElementById("ventaActual");

    if(!totalProductos || !valorInventario || !productosCarrito || !ventaActualElemento){
        return;
    }

    totalProductos.innerHTML = productos.length;

    let valorTotal = 0;

    productos.forEach(function(producto){
      valorTotal += obtenerStockTotal(producto) * Number(producto.precio || 0);
    });

    valorInventario.innerHTML =
        "S/ " + valorTotal.toFixed(2);

    let cantidadCarrito = 0;

    carrito.forEach(function(item){
        cantidadCarrito += Number(item.cantidad || 0);
    });

    productosCarrito.innerHTML = cantidadCarrito;

    let ventaActual = 0;

    carrito.forEach(function(item){
        ventaActual += Number(item.subtotal || 0);
    });

    ventaActual = ventaActual - obtenerDescuento();

    if(ventaActual < 0){
        ventaActual = 0;
    }

    ventaActualElemento.innerHTML =
        "S/ " + ventaActual.toFixed(2);

}

async function validarStockAntesDeImprimir(){

    let tiendaVenta =
        document.getElementById("tiendaVenta").value || "principal";

    for(let item of carrito){

        let productoRef = doc(db, "productos", item.id);
        let productoSnap = await getDoc(productoRef);

        if(!productoSnap.exists()){
            alert("Producto no encontrado: " + item.producto);
            return false;
        }

        let productoData = productoSnap.data();
        let stockTiendas = obtenerStockTiendas(productoData);
        let cantidad = Number(item.cantidad || 0);

        if(stockTiendas[tiendaVenta] < cantidad){

            alert(
                "Stock insuficiente en " +
                tiendasSistema[tiendaVenta] +
                " para: " +
                item.producto
            );

            return false;
        }

    }

    return true;

}

async function imprimirBoleta(){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let fecha = new Date().toLocaleDateString();
    let hora = new Date().toLocaleTimeString();
    let total = 0;
    let descuento = obtenerDescuento();
    let metodoPago = "Pagos mixtos";
carrito.forEach(function(item){
    total += Number(item.subtotal);
});

let totalFinal = total - descuento;

if(totalFinal < 0){
    totalFinal = 0;
}

let pagos = obtenerPagosMixtos();

let totalPagado =
    pagos.efectivo +
    pagos.yape +
    pagos.plin +
    pagos.tarjeta +
    pagos.transferencia;

if(Math.abs(totalPagado - totalFinal) > 0.01){

    alert(
        "⚠️ No puedes imprimir la boleta.\n\n" +
        "El pago no coincide con el total.\n\n" +
        "Total venta: S/ " + totalFinal.toFixed(2) + "\n" +
        "Pagado: S/ " + totalPagado.toFixed(2)
    );

    return;
}

let stockDisponible = await validarStockAntesDeImprimir();

if(!stockDisponible){
    return;
}

    let numeroVenta = "";

await runTransaction(db, async function(transaction){

    let correlativoRef = doc(db, "configuracion", "boletas");
    let correlativoSnap = await transaction.get(correlativoRef);

    let ultimoNumero = 0;

    if(correlativoSnap.exists()){
        ultimoNumero = Number(correlativoSnap.data().ultimoNumero || 0);
    }

    let nuevoNumero = ultimoNumero + 1;

    transaction.set(
        correlativoRef,
        {
            ultimoNumero: nuevoNumero
        },
        { merge: true }
    );

    numeroVenta = String(nuevoNumero).padStart(6, "0");

});

let detallePagos = "";

if(pagos.efectivo > 0){
    detallePagos += `Efectivo: S/ ${pagos.efectivo.toFixed(2)}<br>`;
}

if(pagos.yape > 0){
    detallePagos += `Yape: S/ ${pagos.yape.toFixed(2)}<br>`;
}

if(pagos.plin > 0){
    detallePagos += `Plin: S/ ${pagos.plin.toFixed(2)}<br>`;
}

if(pagos.tarjeta > 0){
    detallePagos += `Tarjeta: S/ ${pagos.tarjeta.toFixed(2)}<br>`;
}

if(pagos.transferencia > 0){
    detallePagos += `Transferencia: S/ ${pagos.transferencia.toFixed(2)}<br>`;
}

if(detallePagos === ""){
    detallePagos = metodoPago;
}
    let clienteNombre =
    document.getElementById("clienteNombre").value || "CLIENTE GENERAL";

let clienteDni =
    document.getElementById("clienteDni").value || "-";

    let contenido = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Boleta Digital Center M&A</title>

<style>

*{
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

    body{
    font-family: Arial, sans-serif;
    background: #e2e8f0;

    display:flex;
    justify-content:center;
    align-items:flex-start;

    padding:30px;
}

    .boleta{
        width: 260px;
        margin: auto;
        background: white;
        padding: 20px;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        position: relative;
        overflow: hidden;

    }

    .marca-agua{
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-25deg);
        font-size: 46px;
        font-weight: bold;
        color: rgba(37,99,235,0.08);
        white-space: nowrap;
        z-index: 0;
    }

    .contenido{
        position: relative;
        z-index: 1;
    }

    .logo-container{
    text-align: center;
    margin-bottom: 15px;
    overflow: visible;
}

.logo-boleta{
    width: 220px;
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto 10px auto;
    object-fit: contain;
}

    h2{
        text-align: center;
        margin: 10px 0 5px;
        font-size: 22px;
        color: #0f172a;
    }

    .subtitulo{
        text-align: center;
        font-size: 12px;
        color: #475569;
        margin-bottom: 12px;
    }

    .linea{
        border-top: 1px dashed #334155;
        margin: 12px 0;
    }

    .datos{
        font-size: 12px;
        color: #334155;
        line-height: 1.6;
    }

    .producto{
        margin-bottom: 10px;
        font-size: 13px;
    }

    .producto-nombre{
        font-weight: bold;
        color: #0f172a;
    }

    .producto-detalle{
        display: flex;
        justify-content: space-between;
        color: #334155;
        margin-top: 3px;
    }

    .total{
        background: #0f172a;
        color: white;
        padding: 12px;
        border-radius: 12px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-top: 15px;
    }

    .gracias{
        text-align: center;
        font-size: 13px;
        margin-top: 14px;
        font-weight: bold;
        color: #0f172a;
    }

    .footer{
        text-align: center;
        font-size: 11px;
        color: #64748b;
        margin-top: 8px;
    }

    @media print{
        body{
            background: white;
            padding: 0;
        }

        .boleta{
            box-shadow: none;
            border-radius: 0;
            width: 280px;
        }
    }

    .qr-container{

    text-align: center;

    margin-top: 20px;

}

.qr-container img{

    border-radius: 10px;

}

.qr-container p{

    font-size: 11px;

    color: #475569;

    margin-top: 5px;

    font-weight: bold;

}

</style>
</head>

<body>

<div class="boleta">
    <div class="marca-agua">DIGITAL CENTER M&A</div>

    <div class="contenido">

        <div class="logo-container">
        <img src="logo-boleta.png" class="logo-boleta">
        </div>
        <h2>DIGITAL CENTER M&A</h2>
        <div style="
        text-align:center;
        font-size:18px;
        font-weight:bold;
        letter-spacing:2px;
        margin-bottom:10px;
        ">
        BOLETA DE VENTA
        
        </div>

       <div class="subtitulo">

    <strong>RUC:</strong> 10027914077<br>

    <strong>Dirección:</strong><br>
    Calle Chepa Santos 601<br>
    Frente al Banco de la Nación<br>

    <strong>WhatsApp:</strong>
    +51 913267246<br>

    Celulares • Accesorios • Servicio Técnico

</div>

        <div class="linea"></div>

        <div class="datos">
            <strong>BOLETA N°:</strong>
            B001-${numeroVenta}
            <br>
            <strong>Fecha:</strong> ${fecha}
            <br>
            <strong>Hora:</strong> ${hora}
            <br>
            <strong>Atendido por:</strong> ${localStorage.getItem("nombreActivo") || "Vendedor"}
            <br>
           <strong>Cliente:</strong> ${clienteNombre}<br>
<strong>DNI:</strong> ${clienteDni}<br>
<strong>Método de Pago:</strong><br>
${detallePagos}
            </div>

        <div class="linea"></div>
`;

    carrito.forEach(function(item){
        contenido += `
        <div class="producto">
           <div class="producto-nombre">
    ${item.nombreBoleta || item.producto}
</div>
            <div class="producto-detalle">
                <span>${item.cantidad} x S/ ${item.precio.toFixed(2)}</span>
                <span>S/ ${item.subtotal.toFixed(2)}</span>
            </div>
        </div>
`;

    });

    contenido += `
        <div class="linea"></div>

        <div class="linea"></div>

<div class="datos">
    <strong>Subtotal:</strong> S/ ${total.toFixed(2)}

    ${
        descuento > 0
        ? `<br><strong>Descuento:</strong> S/ ${descuento.toFixed(2)}`
        : ""
    }
</div>

<div class="total">
  TOTAL: S/ ${totalFinal.toFixed(2)}
</div>

        <div class="gracias">
            ¡Gracias por su compra!
        </div>
        <div class="qr-container">

       <img
src="qr-whatsapp.png"
width="160"
>

        <p>
        📲 Soporte, garantías y consultas aquí
        </p>
        </div>

       <div class="footer">

    Gracias por confiar en nosotros ❤️

    <br><br>

    📍 Calle Chepa Santos 601
    <br>

    Frente al Banco de la Nación
    <br>

    📱 WhatsApp:
    +51 913267246

    <br><br>

    Conserve esta boleta para cualquier garantía.

</div>

    </div>
</div>

</body>
</html>
`;

    let iframe = document.createElement("iframe");

iframe.style.position = "fixed";
iframe.style.right = "0";
iframe.style.bottom = "0";
iframe.style.width = "0";
iframe.style.height = "0";
iframe.style.border = "0";

document.body.appendChild(iframe);

let documento = iframe.contentWindow.document;

documento.open();
documento.write(contenido);
documento.close();

function imprimirCuandoImagenesCarguen(){

    let imagenes = iframe.contentDocument.images;
    let totalImagenes = imagenes.length;
    let cargadas = 0;

    if(totalImagenes === 0){
        imprimirAhora();
        return;
    }

    for(let img of imagenes){

        if(img.complete){
            cargadas++;
        } else {
            img.onload = function(){
                cargadas++;
                if(cargadas === totalImagenes){
                    imprimirAhora();
                }
            };

            img.onerror = function(){
                cargadas++;
                if(cargadas === totalImagenes){
                    imprimirAhora();
                }
            };
        }

    }

    if(cargadas === totalImagenes){
        imprimirAhora();
    }

}

function imprimirAhora(){

    setTimeout(function(){

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(function(){
            document.body.removeChild(iframe);

            document.getElementById("clienteNombre").disabled = false;
            document.getElementById("clienteDni").disabled = false;

            document.getElementById("clienteNombre").focus();

        }, 1000);

    }, 300);

}

imprimirCuandoImagenesCarguen();

return numeroVenta;

}

async function finalizarEImprimir(){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let numeroBoleta = await imprimirBoleta();

    if(!numeroBoleta){
        return;
    }

    await finalizarVenta("B001-" + numeroBoleta);

    cerrarDatosClienteBoleta();

    if(typeof cerrarModalPanel === "function"){
        cerrarModalPanel();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

window.finalizarEImprimir = finalizarEImprimir;

function obtenerDetallePagosVenta(venta){

    if(venta.pagos){

        let detalle = "";

        if(venta.pagos.efectivo > 0){
            detalle += "Efectivo: S/ " + venta.pagos.efectivo.toFixed(2) + "<br>";
        }

        if(venta.pagos.yape > 0){
            detalle += "Yape: S/ " + venta.pagos.yape.toFixed(2) + "<br>";
        }

        if(venta.pagos.plin > 0){
            detalle += "Plin: S/ " + venta.pagos.plin.toFixed(2) + "<br>";
        }

        if(venta.pagos.tarjeta > 0){
            detalle += "Tarjeta: S/ " + venta.pagos.tarjeta.toFixed(2) + "<br>";
        }

        if(venta.pagos.transferencia > 0){
            detalle += "Transferencia: S/ " + venta.pagos.transferencia.toFixed(2);
        }

        return detalle || "No registrado";

    }

    return venta.metodoPago || "No registrado";

}

function obtenerProductosVenta(venta){

    if(!venta.productos || venta.productos.length === 0){
        return "Sin productos";
    }

    return venta.productos.map(function(item){

        return (item.nombreBoleta || item.producto) + " x " + item.cantidad;

    }).join("<br>");

}

function obtenerCategoriasVenta(venta){

    if(!venta.productos || venta.productos.length === 0){
        return "Sin categoría";
    }

    return venta.productos.map(function(item){

        if(item.categoria){
            return item.categoria;
        }

        let productoEncontrado = productos.find(function(p){
            return p.id === item.id;
        });

        return productoEncontrado
            ? productoEncontrado.categoria
            : "Sin categoría";

    }).join("<br>");

}

function mostrarHistorialVentas(){

    let tabla = document.getElementById("historialVentasTabla");

    if(!tabla){
        return;
    }

    let html = "";

    let rol = localStorage.getItem("rolActivo");
    let vendedorActivo = localStorage.getItem("nombreActivo") || "";

   let ventasFiltradas = historialVentas.filter(function(venta){

    if(rol === "vendedor"){
        return venta.fechaISO === obtenerFechaISO();
    }

    return true;

});

    ventasFiltradas.forEach(function(venta){

        let indexReal = historialVentas.findIndex(function(v){
            return v.id === venta.id;
        });

        html += `
<tr>
    <td>${venta.fecha}</td>
    <td>${venta.hora}</td>
    <td>${obtenerProductosVenta(venta)}</td>
    <td>${obtenerCategoriasVenta(venta)}</td>
   <td>${venta.vendedor || "Sin vendedor"}</td>
<td>${venta.tiendaVentaNombre || tiendasSistema[venta.tiendaVenta] || "Mercado"}</td>
<td>S/ ${Number(venta.total || 0).toFixed(2)}</td>
    <td>${obtenerDetallePagosVenta(venta)}</td>

    ${
        rol === "admin"
        ? `<td>S/ ${Number(venta.ganancia || 0).toFixed(2)}</td>`
        : ""
    }

    <td>
    ${
        venta.numeroBoleta && venta.numeroBoleta !== "SIN IMPRESION"
        ? `<button onclick="reimprimirBoletaVenta(${indexReal})">🧾 Reimprimir</button>`
        : ""
    }

    <button onclick="anularVenta(${indexReal})">
        ↩️ Anular
    </button>
</td>

</tr>
`;

    });

    if(html === ""){
        html = `
        <tr>
            <td colspan="9" style="text-align:center;">
                No tienes ventas registradas hoy.
            </td>
        </tr>
        `;
    }

    tabla.innerHTML = html;

}

function reimprimirBoletaVenta(index){

    let venta = historialVentas[index];

    if(!venta){
        alert("No se encontró la venta");
        return;
    }

    if(!venta.numeroBoleta || venta.numeroBoleta === "SIN IMPRESION"){
        alert("Esta venta no tiene boleta para reimprimir");
        return;
    }

    let detallePagos = obtenerDetallePagosVenta(venta);

    let contenido = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reimpresión ${venta.numeroBoleta}</title>
<style>
body{
    font-family: Arial, sans-serif;
    background:white;
    padding:0;
}
.boleta{
    width:280px;
    margin:auto;
    padding:15px;
}
.logo-boleta{
    width:220px;
    display:block;
    margin:0 auto 10px auto;
}
h2{
    text-align:center;
    margin:5px 0;
}
.subtitulo,.datos,.footer{
    font-size:12px;
    line-height:1.5;
}
.linea{
    border-top:1px dashed #000;
    margin:10px 0;
}
.producto{
    font-size:13px;
    margin-bottom:8px;
}
.producto-nombre{
    font-weight:bold;
}
.producto-detalle{
    display:flex;
    justify-content:space-between;
}
.total{
    font-size:20px;
    font-weight:bold;
    text-align:center;
    margin-top:12px;
}
.qr-container{
    text-align:center;
    margin-top:15px;
}
@media print{
    body{ margin:0; }
}
</style>
</head>
<body>

<div class="boleta">

<img src="logo-boleta.png" class="logo-boleta">

<h2>DIGITAL CENTER M&A</h2>

<div style="text-align:center;font-weight:bold;">
REIMPRESIÓN DE BOLETA
</div>

<div class="subtitulo" style="text-align:center;">
<strong>RUC:</strong> 10027914077<br>
Calle Chepa Santos 601<br>
Frente al Banco de la Nación<br>
WhatsApp: +51 913267246
</div>

<div class="linea"></div>

<div class="datos">
<strong>BOLETA N°:</strong> ${venta.numeroBoleta}<br>
<strong>Fecha:</strong> ${venta.fecha}<br>
<strong>Hora:</strong> ${venta.hora}<br>
<strong>Atendido por:</strong> ${venta.vendedor || "Vendedor"}<br>
<strong>Cliente:</strong> ${venta.clienteNombre || "CLIENTE GENERAL"}<br>
<strong>DNI:</strong> ${venta.clienteDni || "-"}<br>
<strong>Método de Pago:</strong><br>
${detallePagos}
</div>

<div class="linea"></div>
`;

    if(venta.productos){
        venta.productos.forEach(function(item){
            contenido += `
<div class="producto">
    <div class="producto-nombre">${item.nombreBoleta || item.producto}</div>
    <div class="producto-detalle">
        <span>${item.cantidad} x S/ ${Number(item.precio || 0).toFixed(2)}</span>
        <span>S/ ${Number(item.subtotal || 0).toFixed(2)}</span>
    </div>
</div>
`;
        });
    }

    contenido += `
<div class="linea"></div>

<div class="datos">
<strong>Descuento:</strong> S/ ${Number(venta.descuento || 0).toFixed(2)}
</div>

<div class="total">
TOTAL: S/ ${Number(venta.total || 0).toFixed(2)}
</div>

<div class="qr-container">
<img src="qr-whatsapp.png" width="150">
<p>Soporte, garantías y consultas aquí</p>
</div>

<div class="footer" style="text-align:center;">
Conserve esta boleta para cualquier garantía.
</div>

</div>

</body>
</html>
`;

    let iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    let documento = iframe.contentWindow.document;

    documento.open();
    documento.write(contenido);
    documento.close();

    setTimeout(function(){
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(function(){
            document.body.removeChild(iframe);
        }, 1000);

    }, 500);

}

function anularVenta(index){

    let rol = localStorage.getItem("rolActivo");

    ventaPendienteAnular = index;

    if(rol === "vendedor"){

        document.getElementById("codigoAdminInput").value = "";
        let modal = document.getElementById("modalCodigo");
let fondo = document.getElementById("fondoModal");

modal.style.display = "block";
modal.style.visibility = "visible";
modal.style.pointerEvents = "auto";

fondo.style.display = "block";
fondo.style.visibility = "visible";
fondo.style.pointerEvents = "auto";
        
        document.getElementById("codigoAdminInput").focus();

        return;
    }

    ejecutarAnulacion(index);
}

function abrirConfiguracion(){

    document.getElementById("panelConfiguracion").style.display = "block";

    document.getElementById("nuevoCodigoAnulacion").value = codigoAnulacion;

}

async function guardarConfiguracion(){

    codigoAnulacion =
        document.getElementById("nuevoCodigoAnulacion").value;

    await setDoc(
    doc(db, "configuracion", "sistema"),
    {
        codigoAnulacion: codigoAnulacion
    }
);

    alert("Configuración guardada correctamente");

    document.getElementById("panelConfiguracion").style.display = "none";

}

function controlarColumnaGanancia(){

    let columnaGanancia =
        document.getElementById("columnaGanancia");

    if(!columnaGanancia){
        return;
    }

    if(localStorage.getItem("rolActivo") === "vendedor"){
        columnaGanancia.style.display = "none";
    } else {
        columnaGanancia.style.display = "table-cell";
    }

}

async function validarCodigoAdmin(){

    let codigoIngresado =
        document.getElementById("codigoAdminInput").value;

    if(codigoIngresado !== codigoAnulacion){
        alert("Código incorrecto");
        return;
    }

    cerrarModalCodigo();

    if(accionAdminPendiente){
        await accionAdminPendiente();
        accionAdminPendiente = null;
        return;
    }

    if(ventaPendienteAnular !== null){
        await ejecutarAnulacion(ventaPendienteAnular);
        ventaPendienteAnular = null;
    }

}

function cerrarModalCodigo(){

    let modal = document.getElementById("modalCodigo");
    let fondo = document.getElementById("fondoModal");

    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.pointerEvents = "none";

    fondo.style.display = "none";
    fondo.style.visibility = "hidden";
    fondo.style.pointerEvents = "none";

    document.getElementById("codigoAdminInput").value = "";

}

function pedirAutorizacionAdmin(accion){

    accionAdminPendiente = accion;

    document.getElementById("codigoAdminInput").value = "";

    let modal = document.getElementById("modalCodigo");
    let fondo = document.getElementById("fondoModal");

    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";

    fondo.style.display = "block";
    fondo.style.visibility = "visible";
    fondo.style.pointerEvents = "auto";

    document.getElementById("codigoAdminInput").focus();

}

async function ejecutarAnulacion(index){

    if(index === null || index === undefined){
        alert("Error: no hay venta seleccionada");
        return;
    }

    if(!confirm("¿Anular esta venta?")){
        return;
    }

    let venta = historialVentas[index];

    if(!venta || !venta.id){
        alert("Error: esta venta no tiene ID de Firebase");
        return;
    }

    try{

        let boletasAnular = [];

if(venta.numeroBoleta && venta.numeroBoleta !== "SIN IMPRESION"){

    let consultaBoleta = query(
        collection(db, "boletas"),
        where("numeroBoleta", "==", venta.numeroBoleta)
    );

    let resultadoBoleta = await getDocs(consultaBoleta);

    resultadoBoleta.forEach(function(documento){
        boletasAnular.push(documento.id);
    });

}

        await runTransaction(db, async function(transaction){

    for(let item of venta.productos){

        let productoRef = doc(db, "productos", item.id);
        let productoSnap = await transaction.get(productoRef);

        if(productoSnap.exists()){

            let productoData = productoSnap.data();
let stockTiendas = obtenerStockTiendas(productoData);

let tiendaVenta =
    venta.tiendaVenta || "principal";

stockTiendas[tiendaVenta] += Number(item.cantidad);

let stockTotal =
    stockTiendas.principal +
    stockTiendas.sucursal;

transaction.update(productoRef, {
    stock: stockTotal,
    stockTiendas: stockTiendas
});

        }

    }

    let ventaRef = doc(db, "ventas", venta.id);
    transaction.delete(ventaRef);

boletasAnular.forEach(function(idBoleta){

    let boletaRef = doc(db, "boletas", idBoleta);
    transaction.delete(boletaRef);

});

});

        ventaPendienteAnular = null;

        alert("Venta anulada correctamente");

    } catch(error){

        console.error("Error al anular:", error);
        alert("No se pudo anular. Revisa la consola.");

    }

}

async function anularGastoCaja(idGasto, autorizado = false){

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor" && autorizado === false){

        pedirAutorizacionAdmin(async function(){
            await anularGastoCaja(idGasto, true);
        });

        return;

    }

    if(!confirm("¿Anular este gasto?")){
        return;
    }

   let fechaCaja = obtenerFechaISO();

    await deleteDoc(
        doc(
            db,
            "cajas",
            fechaCaja,
            "gastos",
            idGasto
        )
    );

    alert("✅ Gasto anulado correctamente");

}

function filtrarCategoria(categoria){

    categoriaCatalogo = categoria || "todos";

   reiniciarRenderCatalogo();

    mostrarProductos();

}

function actualizarReportes(){

    let ventasHoyElemento = document.getElementById("ventasHoy");
    let gananciaHoyElemento = document.getElementById("gananciaHoy");
    let ventasMesElemento = document.getElementById("ventasMes");
    let gananciaMesElemento = document.getElementById("gananciaMes");
    let ventasEfectivoElemento = document.getElementById("ventasEfectivo");
    let ventasYapeElemento = document.getElementById("ventasYape");
    let ventasPlinElemento = document.getElementById("ventasPlin");
    let ventasTarjetaElemento = document.getElementById("ventasTarjeta");
    let ventasTransferenciaElemento = document.getElementById("ventasTransferencia");

    if(
        !ventasHoyElemento ||
        !gananciaHoyElemento ||
        !ventasMesElemento ||
        !gananciaMesElemento ||
        !ventasEfectivoElemento ||
        !ventasYapeElemento ||
        !ventasPlinElemento ||
        !ventasTarjetaElemento ||
        !ventasTransferenciaElemento
    ){
        return;
    }

    let mesActual = new Date().getMonth();
    let anioActual = new Date().getFullYear();

    let ventasHoy = 0;
    let gananciaHoy = 0;
    let ventasMes = 0;
    let gananciaMes = 0;

    let ventasEfectivo = 0;
    let ventasYape = 0;
    let ventasPlin = 0;
    let ventasTarjeta = 0;
    let ventasTransferencia = 0;

    historialVentas.forEach(function(venta){

        if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += Number(venta.total || 0);
            gananciaHoy += Number(venta.ganancia || 0);

            if(venta.pagos){

                ventasEfectivo += Number(venta.pagos.efectivo || 0);
                ventasYape += Number(venta.pagos.yape || 0);
                ventasPlin += Number(venta.pagos.plin || 0);
                ventasTarjeta += Number(venta.pagos.tarjeta || 0);
                ventasTransferencia += Number(venta.pagos.transferencia || 0);

            } else {

                let metodo = venta.metodoPago || "No registrado";

                if(metodo === "Efectivo"){
                    ventasEfectivo += Number(venta.total || 0);
                }

                if(metodo === "Yape"){
                    ventasYape += Number(venta.total || 0);
                }

                if(metodo === "Plin"){
                    ventasPlin += Number(venta.total || 0);
                }

                if(metodo === "Tarjeta"){
                    ventasTarjeta += Number(venta.total || 0);
                }

                if(metodo === "Transferencia"){
                    ventasTransferencia += Number(venta.total || 0);
                }

            }

        }

        let fechaVenta = venta.fechaISO
            ? new Date(venta.fechaISO + "T00:00:00")
            : new Date(venta.fecha);

        if(
            fechaVenta.getMonth() === mesActual &&
            fechaVenta.getFullYear() === anioActual
        ){
            ventasMes += Number(venta.total || 0);
            gananciaMes += Number(venta.ganancia || 0);
        }

    });

    ventasHoyElemento.innerHTML = "S/ " + ventasHoy.toFixed(2);
    gananciaHoyElemento.innerHTML = "S/ " + gananciaHoy.toFixed(2);
    ventasMesElemento.innerHTML = "S/ " + ventasMes.toFixed(2);
    gananciaMesElemento.innerHTML = "S/ " + gananciaMes.toFixed(2);

    ventasEfectivoElemento.innerHTML = "S/ " + ventasEfectivo.toFixed(2);
    ventasYapeElemento.innerHTML = "S/ " + ventasYape.toFixed(2);
    ventasPlinElemento.innerHTML = "S/ " + ventasPlin.toFixed(2);
    ventasTarjetaElemento.innerHTML = "S/ " + ventasTarjeta.toFixed(2);
    ventasTransferenciaElemento.innerHTML = "S/ " + ventasTransferencia.toFixed(2);

}

function actualizarDashboardEjecutivo(){

    let productoMasVendidoElemento = document.getElementById("productoMasVendido");
    let mejorVendedorElemento = document.getElementById("mejorVendedor");
    let gananciaRealDiaElemento = document.getElementById("gananciaRealDia");
    let ticketPromedioElemento = document.getElementById("ticketPromedio");
    let gananciaMesEjecutivaElemento = document.getElementById("gananciaMesEjecutiva");

    if(
        !productoMasVendidoElemento ||
        !mejorVendedorElemento ||
        !gananciaRealDiaElemento ||
        !ticketPromedioElemento ||
        !gananciaMesEjecutivaElemento
    ){
        return;
    }

    let productosVendidos = {};
    let vendedores = {};

    let gananciaDia = 0;
    let gananciaMes = 0;
    let totalVentasDia = 0;
    let cantidadVentasDia = 0;

    historialVentas.forEach(function(venta){

        let fechaVenta = venta.fechaISO
            ? new Date(venta.fechaISO + "T00:00:00")
            : new Date(venta.fecha);

        let hoyFecha = new Date();

        if(
            fechaVenta.getMonth() === hoyFecha.getMonth() &&
            fechaVenta.getFullYear() === hoyFecha.getFullYear()
        ){
            gananciaMes += Number(venta.ganancia || 0);
        }

        if(venta.fechaISO === obtenerFechaISO()){

            gananciaDia += Number(venta.ganancia || 0);
            totalVentasDia += Number(venta.total || 0);
            cantidadVentasDia++;

            let vendedor = venta.vendedor || "Sin vendedor";

            if(!vendedores[vendedor]){
                vendedores[vendedor] = 0;
            }

            vendedores[vendedor] += Number(venta.total || 0);

            if(venta.productos){

                venta.productos.forEach(function(item){

                    let producto = item.nombreBoleta || item.producto || "Sin producto";

                    if(!productosVendidos[producto]){
                        productosVendidos[producto] = 0;
                    }

                    productosVendidos[producto] += Number(item.cantidad || 0);

                });

            }

        }

    });

    let productoTop = "-";
    let cantidadTop = 0;

    for(let producto in productosVendidos){
        if(productosVendidos[producto] > cantidadTop){
            productoTop = producto;
            cantidadTop = productosVendidos[producto];
        }
    }

    let vendedorTop = "-";
    let montoTop = 0;

    for(let vendedor in vendedores){
        if(vendedores[vendedor] > montoTop){
            vendedorTop = vendedor;
            montoTop = vendedores[vendedor];
        }
    }

    let ticketPromedio =
        cantidadVentasDia > 0
        ? totalVentasDia / cantidadVentasDia
        : 0;

    let nombreCorto =
        productoTop.length > 15
        ? productoTop.substring(0, 15) + "..."
        : productoTop;

    productoMasVendidoElemento.innerHTML =
        productoTop === "-"
        ? "-"
        : nombreCorto + "<br><small>Vendidos: " + cantidadTop + "</small>";

    mejorVendedorElemento.innerHTML =
        vendedorTop === "-"
        ? "-"
        : vendedorTop + "<br><small>S/ " + montoTop.toFixed(2) + "</small>";

    gananciaRealDiaElemento.innerHTML =
        "S/ " + gananciaDia.toFixed(2);

    ticketPromedioElemento.innerHTML =
        "S/ " + ticketPromedio.toFixed(2);

    gananciaMesEjecutivaElemento.innerHTML =
        "S/ " + gananciaMes.toFixed(2);

}

function mostrarReporteVendedores(){

    let tabla =
        document.getElementById("reporteVendedoresTabla");

    if(!tabla){
        return;
    }

    let vendedores = {};
    let html = "";

    historialVentas.forEach(function(venta){

        let nombre = venta.vendedor || "Sin vendedor";

        if(!vendedores[nombre]){
            vendedores[nombre] = {
                ventas: 0,
                total: 0,
                ganancia: 0
            };
        }

        vendedores[nombre].ventas += 1;
        vendedores[nombre].total += venta.total;
        vendedores[nombre].ganancia += venta.ganancia;

    });

    for(let nombre in vendedores){

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

carrito.forEach(function(item){
    totalVenta += Number(item.subtotal || 0);
});

if(descuento > totalVenta){
    descuento = totalVenta;
}

document.getElementById("descuentoVenta").value =
    descuento;

return descuento;

}

function limpiarDescuentoSiCarritoVacio(){

    let input = document.getElementById("descuentoVenta");

    if(input && carrito.length === 0){
        input.value = "";
        input.defaultValue = "";
        input.removeAttribute("value");
    }

}

function abrirDBProductos(){

    return new Promise(function(resolve, reject){

        let request = indexedDB.open("DigitalCenterMYA_DB", 1);

        request.onupgradeneeded = function(event){

            let dbLocal = event.target.result;

            if(!dbLocal.objectStoreNames.contains("productos")){
                dbLocal.createObjectStore("productos", { keyPath: "id" });
            }

        };

        request.onsuccess = function(event){
            resolve(event.target.result);
        };

        request.onerror = function(){
            reject("No se pudo abrir IndexedDB");
        };

    });

}

async function guardarProductosIndexedDB(){

    try{

        let dbLocal = await abrirDBProductos();
        let transaction = dbLocal.transaction(["productos"], "readwrite");
        let store = transaction.objectStore("productos");

        store.clear();

        productos.forEach(function(producto){
            store.put(producto);
        });

        transaction.oncomplete = function(){
            dbLocal.close();
        };

    }catch(error){
        console.warn("No se pudo guardar productos en IndexedDB:", error);
    }

}

async function cargarProductosIndexedDB(){

    try{

        let dbLocal = await abrirDBProductos();

        return new Promise(function(resolve, reject){

            let transaction = dbLocal.transaction(["productos"], "readonly");

            let store = transaction.objectStore("productos");

            let request = store.getAll();

            request.onsuccess = function(){
                dbLocal.close();
                resolve(request.result || []);
            };

            request.onerror = function(){
                dbLocal.close();
                reject("No se pudo leer productos desde IndexedDB");
            };

        });

    }catch(error){

        console.warn("No se pudo cargar productos desde IndexedDB:", error);
        return [];

    }

}

function iniciarListenersFirebase(){

    if(listenersFirebaseIniciados){
        return;
    }

    listenersFirebaseIniciados = true;

listenersFirebaseActivos.push(
onSnapshot(
    collection(db, "productos"),
    function(snapshot){

        productos = snapshot.docs.map(function(documento){
            return {
                id: documento.id,
                ...documento.data()
            };
        });

        ordenarProductosPorCodigo();

        catalogoVersion++;

        ultimaFirmaCatalogo = "";

        guardarProductosIndexedDB();

        if(localStorage.getItem("sesion") === "activa"){
          reiniciarRenderCatalogo();
        mostrarProductos();
        }

    },

    function(error){

        console.error("Error en tiempo real productos:", error);

        if(productos.length === 0){
            hidratarProductosDesdeIndexedDB();
        }

    }
)
);

listenersFirebaseActivos.push(
onSnapshot(
    collection(db, "ventas"),
    function(snapshot){

        historialVentas = [];

        snapshot.forEach(function(documento){
            historialVentas.push({
                id: documento.id,
                ...documento.data()
            });
        });

        historialVentas.sort(function(a, b){
            return String(b.fechaISO || "").localeCompare(String(a.fechaISO || ""));
        });

        if(localStorage.getItem("sesion") === "activa"){
            mostrarHistorialVentas();
            actualizarReportes();
            actualizarDashboardEjecutivo();
            mostrarReporteVendedores();
            actualizarCajaDiaria();
        }

    },
    function(error){
        console.error("Error cargando ventas:", error);
    }
)
);

listenersFirebaseActivos.push(
onSnapshot(doc(db, "configuracion", "sistema"), function(documento){

    if(documento.exists()){

        codigoAnulacion =
            documento.data().codigoAnulacion || "9999";

    }

}
)
);

listenersFirebaseActivos.push(
onSnapshot(
    doc(
        db,
        "cajas",
        obtenerFechaISO()
    ),
    function(documento){

        if(!documento.exists()){
            return;
        }

        let datos = documento.data();

        montoInicialCaja = datos.montoInicial || 0;

       if(localStorage.getItem("sesion") === "activa"){
    document.getElementById("cajaInicial").innerHTML =
        "S/ " + montoInicialCaja.toFixed(2);

    actualizarCajaDiaria();
}

    }
)
);

listenersFirebaseActivos.push(
onSnapshot(
    collection(
        db,
        "cajas",
        obtenerFechaISO(),
        "gastos"
    ),
    function(snapshot){

        gastosCaja = [];

        snapshot.forEach(function(documento){

            gastosCaja.push({
                id: documento.id,
                ...documento.data()
            });

        });

       if(localStorage.getItem("sesion") === "activa"){

    mostrarGastosCaja();
    actualizarCajaDiaria();

}

    }
)
);

listenersFirebaseActivos.push(
onSnapshot(
    collection(db, "cierresCaja"),

    function(snapshot){

        historialCajas = [];

        snapshot.forEach(function(documento){

            let caja = {
                id: documento.id,
                ...documento.data()
            };

            historialCajas.push(caja);

        });

        historialCajas.sort(function(a, b){
            return (b.fecha || "").localeCompare(a.fecha || "");
        });

      if(localStorage.getItem("sesion") === "activa"){

    mostrarHistorialCajas();

}

    }

)
);

}

async function abrirCaja(){

    montoInicialCaja = Number(
        document.getElementById("montoInicialCaja").value
    );

    if(montoInicialCaja <= 0){
        alert("Ingrese un monto válido");
        return;
    }

    let fechaCaja = obtenerFechaISO();

    let cajaRef = doc(db, "cajas", fechaCaja);

    try{

        await runTransaction(db, async function(transaction){

            let cajaDoc = await transaction.get(cajaRef);

            if(cajaDoc.exists()){
                throw new Error("CAJA_EXISTENTE");
            }

            transaction.set(cajaRef,{

                fecha: fechaCaja,

                montoInicial: montoInicialCaja,

                abierta: true,

                abiertaPor:
                    localStorage.getItem("nombreActivo") || "Sin usuario",

                horaApertura:
                    new Date().toLocaleTimeString()

            });

        });

        alert("✅ Caja abierta correctamente");

    }catch(error){

        if(error.message === "CAJA_EXISTENTE"){

            alert("⚠️ La caja del día ya fue abierta.");

            return;

        }

        console.error(error);

        alert("Error al abrir la caja.");

    }

}

async function registrarGasto(){

    let descripcion =
        document.getElementById("descripcionGasto").value;

    let monto =
        Number(
            document.getElementById("montoGasto").value
        );

    if(descripcion === "" || monto <= 0){
        alert("Complete los datos");
        return;
    }

   let fechaCaja = obtenerFechaISO();

    await addDoc(
        collection(db, "cajas", fechaCaja, "gastos"),
        {
            hora: new Date().toLocaleTimeString(),
            descripcion: descripcion,
            monto: monto,
            registradoPor: localStorage.getItem("nombreActivo") || "Sin usuario"
        }
    );

    document.getElementById("descripcionGasto").value = "";
    document.getElementById("montoGasto").value = "";

    alert("✅ Gasto registrado correctamente");

}

function mostrarGastosCaja(){

    let tabla =
        document.getElementById("tablaGastosCaja");

    if(!tabla){
        return;
    }

    let html = "";

    gastosCaja.forEach(function(gasto){

        html += `
        <tr>
            <td>${gasto.hora}</td>
            <td>${gasto.descripcion}</td>
            <td>S/ ${gasto.monto.toFixed(2)}</td>
            <td>
                <button onclick="anularGastoCaja('${gasto.id}')">
                    ↩️ Anular
                </button>
            </td>
        </tr>
        `;

    });

    tabla.innerHTML = html;

}
function actualizarCajaDiaria(){

    let ventasHoy = 0;

    let cajaEfectivo = 0;
    let cajaYape = 0;
    let cajaPlin = 0;
    let cajaTarjeta = 0;
    let cajaTransferencia = 0;

    historialVentas.forEach(function(venta){

        if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += Number(venta.total || 0);

            if(venta.pagos){

                cajaEfectivo += Number(venta.pagos.efectivo || 0);
                cajaYape += Number(venta.pagos.yape || 0);
                cajaPlin += Number(venta.pagos.plin || 0);
                cajaTarjeta += Number(venta.pagos.tarjeta || 0);
                cajaTransferencia += Number(venta.pagos.transferencia || 0);

            } else {

                let metodo = venta.metodoPago || "No registrado";

                if(metodo === "Efectivo"){
                    cajaEfectivo += Number(venta.total || 0);
                }

                if(metodo === "Yape"){
                    cajaYape += Number(venta.total || 0);
                }

                if(metodo === "Plin"){
                    cajaPlin += Number(venta.total || 0);
                }

                if(metodo === "Tarjeta"){
                    cajaTarjeta += Number(venta.total || 0);
                }

                if(metodo === "Transferencia"){
                    cajaTransferencia += Number(venta.total || 0);
                }

            }

        }

    });

    let gastos = 0;

    gastosCaja.forEach(function(gasto){
        gastos += Number(gasto.monto || 0);
    });

    let esperado =
        montoInicialCaja +
        ventasHoy -
        gastos;

    document.getElementById("cajaVentas").innerHTML =
        "S/ " + ventasHoy.toFixed(2);

    document.getElementById("cajaEfectivo").innerHTML =
        "S/ " + cajaEfectivo.toFixed(2);

    document.getElementById("cajaYape").innerHTML =
        "S/ " + cajaYape.toFixed(2);

    document.getElementById("cajaPlin").innerHTML =
        "S/ " + cajaPlin.toFixed(2);

    document.getElementById("cajaTarjeta").innerHTML =
        "S/ " + cajaTarjeta.toFixed(2);

    document.getElementById("cajaTransferencia").innerHTML =
        "S/ " + cajaTransferencia.toFixed(2);

    document.getElementById("cajaGastos").innerHTML =
        "S/ " + gastos.toFixed(2);

    document.getElementById("cajaEsperada").innerHTML =
        "S/ " + esperado.toFixed(2);

}

function cuadrarCaja(){

    let dineroReal =
        Number(
            document.getElementById("dineroRealCaja").value
        );

    if(isNaN(dineroReal) || dineroReal < 0){

        alert("Ingrese un monto válido");

        return;

    }

    let ventasHoy = 0;

    historialVentas.forEach(function(venta){

       if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += venta.total;

        }

    });

    let gastos = 0;

    gastosCaja.forEach(function(gasto){

        gastos += gasto.monto;

    });

    let esperado =
        montoInicialCaja +
        ventasHoy -
        gastos;

    let diferencia =
        dineroReal - esperado;

    let resultado =
        document.getElementById("resultadoCuadreCaja");

    if(Math.abs(diferencia) < 0.01){

        resultado.innerHTML =
            "✅ Caja exacta";

    } else if(diferencia > 0){

        resultado.innerHTML =
            "🟢 Sobrante: S/ " +
            diferencia.toFixed(2);

    } else {

        resultado.innerHTML =
            "🔴 Faltante: S/ " +
            Math.abs(diferencia).toFixed(2);

    }

}

function mostrarHistorialCajas(){

    let tabla =
        document.getElementById("historialCajasTabla");

    if(!tabla){
        return;
    }

    let html = "";

    historialCajas.forEach(function(caja){

        html += `
        <tr>
            <td>${caja.fecha || "-"}</td>
            <td>${caja.cerradaPor || "-"}</td>
            <td>S/ ${(caja.ventasDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.efectivoDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.yapeDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.plinDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.tarjetaDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.transferenciaDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.gastosDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.cajaEsperada || 0).toFixed(2)}</td>
            <td>S/ ${(caja.dineroReal || 0).toFixed(2)}</td>
            <td>${caja.resultadoCuadre || "-"}</td>
        </tr>
        `;

    });

    tabla.innerHTML = html;

}

async function borrarHistorialCierres(){

    let rol = localStorage.getItem("rolActivo");

    if(rol !== "admin"){
        alert("Solo el administrador puede borrar este historial");
        return;
    }

    if(!confirm("¿Borrar todo el historial de cierres?")){
        return;
    }

    for(let caja of historialCajas){

        if(caja.id){

            await deleteDoc(
                doc(db, "cierresCaja", caja.id)
            );

        }

    }

    historialCajas = [];
    mostrarHistorialCajas();

    alert("✅ Historial de cierres borrado");

}

async function cerrarCaja(){

    let fechaCaja = obtenerFechaISO();

    let ventasHoy = 0;
    let gastos = 0;

    let efectivoDia = 0;
    let yapeDia = 0;
    let plinDia = 0;
    let tarjetaDia = 0;
    let transferenciaDia = 0;

    historialVentas.forEach(function(venta){

        if(venta.fechaISO === fechaCaja){

            ventasHoy += Number(venta.total || 0);

            if(venta.pagos){

                efectivoDia += Number(venta.pagos.efectivo || 0);
                yapeDia += Number(venta.pagos.yape || 0);
                plinDia += Number(venta.pagos.plin || 0);
                tarjetaDia += Number(venta.pagos.tarjeta || 0);
                transferenciaDia += Number(venta.pagos.transferencia || 0);

            } else {

                let metodo = venta.metodoPago || "No registrado";

                if(metodo === "Efectivo"){
                    efectivoDia += Number(venta.total || 0);
                }

                if(metodo === "Yape"){
                    yapeDia += Number(venta.total || 0);
                }

                if(metodo === "Plin"){
                    plinDia += Number(venta.total || 0);
                }

                if(metodo === "Tarjeta"){
                    tarjetaDia += Number(venta.total || 0);
                }

                if(metodo === "Transferencia"){
                    transferenciaDia += Number(venta.total || 0);
                }

            }

        }

    });

    gastosCaja.forEach(function(gasto){
        gastos += Number(gasto.monto || 0);
    });

    let esperado =
        montoInicialCaja + ventasHoy - gastos;

    let dineroReal =
        Number(document.getElementById("dineroRealCaja").value);

    if(isNaN(dineroReal) || dineroReal < 0){
        alert("Ingrese el dinero físico contado antes de cerrar caja");
        return;
    }

    let diferencia = dineroReal - esperado;

    let resultadoCuadre = "";

    if(Math.abs(diferencia) < 0.01){
        resultadoCuadre = "Caja exacta";
    } else if(diferencia > 0){
        resultadoCuadre = "Sobrante S/ " + diferencia.toFixed(2);
    } else {
        resultadoCuadre = "Faltante S/ " + Math.abs(diferencia).toFixed(2);
    }

    let cierre = {
        fecha: fechaCaja,
        cerradaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
        horaCierre: new Date().toLocaleTimeString(),

        ventasDia: ventasHoy,

        efectivoDia: efectivoDia,
        yapeDia: yapeDia,
        plinDia: plinDia,
        tarjetaDia: tarjetaDia,
        transferenciaDia: transferenciaDia,

        gastosDia: gastos,
        cajaEsperada: esperado,
        dineroReal: dineroReal,
        resultadoCuadre: resultadoCuadre
    };

    await setDoc(
        doc(db, "cajas", fechaCaja),
        {
            abierta: false,
            ...cierre
        },
        { merge: true }
    );

    await addDoc(
        collection(db, "cierresCaja"),
        cierre
    );

    historialCajas.unshift(cierre);
    mostrarHistorialCajas();

    alert(

`💰 CAJA CERRADA

Ventas:
S/ ${ventasHoy.toFixed(2)}

💵 Efectivo:
S/ ${efectivoDia.toFixed(2)}

📱 Yape:
S/ ${yapeDia.toFixed(2)}

🟢 Plin:
S/ ${plinDia.toFixed(2)}

💳 Tarjeta:
S/ ${tarjetaDia.toFixed(2)}

🏦 Transferencia:
S/ ${transferenciaDia.toFixed(2)}

${resultadoCuadre}`

);

}

async function anularCajaDelDia(autorizado = false){

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor" && autorizado === false){

        pedirAutorizacionAdmin(async function(){
            await anularCajaDelDia(true);
        });

        return;

    }

    if(!confirm("¿Anular toda la caja del día? Se borrará la apertura y los gastos.")){
        return;
    }

    let fechaCaja = obtenerFechaISO();

    for(let gasto of gastosCaja){

        if(gasto.id){

            await deleteDoc(
                doc(
                    db,
                    "cajas",
                    fechaCaja,
                    "gastos",
                    gasto.id
                )
            );

        }

    }

    await setDoc(
        doc(db, "cajas", fechaCaja),
        {
            fecha: fechaCaja,
            montoInicial: 0,
            abierta: false,
            anulada: true,
            anuladaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
            horaAnulacion: new Date().toLocaleTimeString()
        }
    );

    montoInicialCaja = 0;
    gastosCaja = [];

    document.getElementById("montoInicialCaja").value = "";
    document.getElementById("cajaInicial").innerHTML = "S/ 0.00";
    document.getElementById("cajaVentas").innerHTML = "S/ 0.00";
    document.getElementById("cajaGastos").innerHTML = "S/ 0.00";
    document.getElementById("cajaEsperada").innerHTML = "S/ 0.00";

    mostrarGastosCaja();
    actualizarCajaDiaria();

    alert("✅ Caja del día anulada correctamente");

}

async function buscarGarantia(){

let inputGarantiaModal =
    document.querySelector("#contenidoModalPanel #inputGarantia");

let inputGarantiaNormal =
    document.getElementById("inputGarantia");

let inputGarantia =
    inputGarantiaModal || inputGarantiaNormal;

if(!inputGarantia){
    alert("No se encontró el buscador de garantía");
    return;
}

let texto = inputGarantia.value.trim();

    if(!texto){
        alert("Ingrese DNI o número de boleta");
        return;
    }

    let resultado =
    document.querySelector("#contenidoModalPanel #resultadoGarantia") ||
    document.getElementById("resultadoGarantia");

    resultado.innerHTML = "Buscando...";

    try{

        let consultaDni = query(
            collection(db, "boletas"),
            where("clienteDni", "==", texto)
        );

        let consultaBoleta = query(
            collection(db, "boletas"),
            where("numeroBoleta", "==", texto)
        );

        let datosDni = await getDocs(consultaDni);
        let datosBoleta = await getDocs(consultaBoleta);

        let html = "";
        let idsMostrados = [];

        function pintarBoleta(id, b){

            if(idsMostrados.includes(id)){
                return;
            }

            idsMostrados.push(id);

            let productosHtml = "";

            if(b.productos){
                b.productos.forEach(function(item){
                   productosHtml += `
    <p>📱 ${item.nombreBoleta || item.producto} x ${item.cantidad}</p>
`;
                });
            }

            html += `
                <div class="garantia-card">
                    <h3>🧾 ${b.numeroBoleta}</h3>

                    <p><strong>Cliente:</strong> ${b.clienteNombre}</p>
                    <p><strong>DNI:</strong> ${b.clienteDni}</p>
                    <p><strong>Fecha:</strong> ${b.fecha}</p>
                    <p><strong>Vendedor:</strong> ${b.vendedor}</p>
                    <p><strong>Total:</strong> S/ ${Number(b.total || 0).toFixed(2)}</p>

                    <hr>

                    ${productosHtml}

                    <hr>

                    <p>
    <strong>Estado Garantía:</strong>

    <span class="
        ${
            b.estadoGarantia === "Aprobada"
            ? "estado-aprobada"
            : b.estadoGarantia === "Rechazada"
            ? "estado-rechazada"
            : "estado-pendiente"
        }
    ">
        ${b.estadoGarantia || "Pendiente"}
    </span>
</p>
                    <p>
                        <strong>Última atención:</strong>
                        ${b.atendidoGarantia || "-"}
                    </p>

                    <p>
                        <strong>Fecha garantía:</strong>
                        ${b.fechaGarantia || "-"}
                    </p>

                    <textarea
                        id="observacionGarantia-${id}"
                        placeholder="📝 Escribir observación de garantía..."
                    >${b.observacionGarantia || ""}</textarea>

                    <div class="acciones-garantia">
                        <button onclick="actualizarGarantia('${id}', 'Aprobada')">
                            ✅ Aprobar Garantía
                        </button>

                        <button onclick="actualizarGarantia('${id}', 'Rechazada')">
                            ❌ Rechazar Garantía
                        </button>
                    </div>
                </div>
            `;
        }

        datosDni.forEach(function(documento){
            pintarBoleta(documento.id, documento.data());
        });

        datosBoleta.forEach(function(documento){
            pintarBoleta(documento.id, documento.data());
        });

        if(html === ""){
            html = "<p style='color:white;'>No se encontraron garantías.</p>";
        }

        resultado.innerHTML = html;

    } catch(error){

        console.error("Error buscando garantía:", error);
        resultado.innerHTML = "<p style='color:white;'>Error buscando garantía.</p>";

    }

}

async function actualizarGarantia(idBoleta, estado){

    let observacion =
        document.getElementById("observacionGarantia-" + idBoleta)
        .value
        .trim();

    try{

        await updateDoc(
            doc(db, "boletas", idBoleta),
            {
                estadoGarantia: estado,
                observacionGarantia: observacion,
                fechaGarantia: new Date().toLocaleString(),
                atendidoGarantia: localStorage.getItem("nombreActivo") || "Sin usuario"
            }
        );

        alert("✅ Garantía " + estado + " correctamente");

        buscarGarantia();

    } catch(error){

        console.error("Error actualizando garantía:", error);
        alert("No se pudo actualizar la garantía");

    }

}

function abrirTransferenciaStock(idProducto){

    let producto = productos.find(function(p){
        return p.id === idProducto;
    });

    if(!producto){
        alert("Producto no encontrado");
        return;
    }

    productoTransferenciaActual = producto;

    let stockTiendas = obtenerStockTiendas(producto);

    document.getElementById("transferenciaProductoNombre").innerHTML =
        producto.producto;

    document.getElementById("stockTransferPrincipal").innerHTML =
        stockTiendas.principal;

    document.getElementById("stockTransferSucursal").innerHTML =
        stockTiendas.sucursal;

    document.getElementById("transferenciaOrigen").value = "principal";
    document.getElementById("transferenciaDestino").value = "sucursal";
    document.getElementById("transferenciaCantidad").value = "";

    document.getElementById("modalTransferenciaStock").style.display = "flex";

}

function cerrarTransferenciaStock(){

    document.getElementById("modalTransferenciaStock").style.display = "none";
    productoTransferenciaActual = null;

}

async function confirmarTransferenciaStock(){

    if(!productoTransferenciaActual){
        alert("No hay producto seleccionado");
        return;
    }

    let origen = document.getElementById("transferenciaOrigen").value;
    let destino = document.getElementById("transferenciaDestino").value;
    let cantidad = Number(document.getElementById("transferenciaCantidad").value);

    if(origen === destino){
        alert("Origen y destino no pueden ser iguales");
        return;
    }

    if(!Number.isInteger(cantidad) || cantidad <= 0){
        alert("Ingrese una cantidad válida");
        return;
    }

    let productoRef = doc(db, "productos", productoTransferenciaActual.id);

    try{

        await runTransaction(db, async function(transaction){

            let productoSnap = await transaction.get(productoRef);

            if(!productoSnap.exists()){
                throw new Error("Producto no encontrado");
            }

            let productoData = productoSnap.data();
            let stockTiendas = obtenerStockTiendas(productoData);

            if(stockTiendas[origen] < cantidad){
                throw new Error("Stock insuficiente en " + tiendasSistema[origen]);
            }

            stockTiendas[origen] -= cantidad;
            stockTiendas[destino] += cantidad;

            let stockTotal = stockTiendas.principal + stockTiendas.sucursal;

            transaction.update(productoRef, {
                stock: stockTotal,
                stockTiendas: stockTiendas
            });

            let transferenciaRef = doc(collection(db, "transferenciasStock"));

            transaction.set(transferenciaRef, {
                productoId: productoTransferenciaActual.id,
                codigo: productoTransferenciaActual.codigo || "",
                producto: productoTransferenciaActual.producto || "",
                cantidad: cantidad,
                origen: tiendasSistema[origen],
                destino: tiendasSistema[destino],
                fecha: new Date().toLocaleDateString(),
                fechaISO: obtenerFechaISO(),
                hora: new Date().toLocaleTimeString(),
                usuario: localStorage.getItem("nombreActivo") || "Sin usuario"
            });

        });

        alert("✅ Stock transferido correctamente");

        cerrarTransferenciaStock();

    } catch(error){

        console.error("Error transfiriendo stock:", error);
        alert(error.message || "No se pudo transferir stock");

    }

}

function abrirPanelSeguro(ids){

    for(let id of ids){
        let panel = document.getElementById(id);

        if(panel){
            abrirModalPanel(id);
            return;
        }
    }

    alert("No se encontró el panel");
}

function toggleAgregarProducto(){
    abrirPanelSeguro(["zonaAdmin", "panelAgregarProducto"]);
}

function toggleReporteVendedores(){
    abrirPanelSeguro(["panelReporteVendedores", "reporteVendedores"]);
}

function toggleCajaDiaria(){
    abrirPanelSeguro(["panelCajaDiaria", "cajaDiaria"]);
}

function toggleHistorialVentas(){
    abrirPanelSeguro(["panelHistorialVentas", "historialVentas"]);
}

function toggleReportes(){
    abrirPanelSeguro(["dashboardReportes", "panelReportes"]);
}

function toggleDashboardEjecutivo(){
    abrirPanelSeguro(["dashboardEjecutivo", "panelDashboardEjecutivo"]);
}

function toggleGarantias(){
    abrirPanelSeguro(["panelGarantias", "garantias"]);
}

window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.buscarProducto = buscarProducto;
window.filtrarCategoria = filtrarCategoria;
window.guardarProducto = guardarProducto;
window.agregarDirecto = agregarDirecto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.eliminarDelCarrito = eliminarDelCarrito;
window.cancelarVenta = cancelarVenta;
window.finalizarVenta = finalizarVenta;
window.finalizarEImprimir = finalizarEImprimir;
window.imprimirBoleta = imprimirBoleta;
window.toggleAgregarProducto = toggleAgregarProducto;
window.toggleReporteVendedores = toggleReporteVendedores;
window.abrirConfiguracion = abrirConfiguracion;
window.guardarConfiguracion = guardarConfiguracion;
window.validarCodigoAdmin = validarCodigoAdmin;
window.cerrarModalCodigo = cerrarModalCodigo;
window.anularVenta = anularVenta;
window.ejecutarAnulacion = ejecutarAnulacion;
window.mostrarCarrito = mostrarCarrito;
window.actualizarDashboard = actualizarDashboard;
window.toggleCajaDiaria = toggleCajaDiaria;
window.abrirCaja = abrirCaja;
window.registrarGasto = registrarGasto;
window.cerrarCaja = cerrarCaja;
window.anularGastoCaja = anularGastoCaja;
window.anularCajaDelDia = anularCajaDelDia;
window.cuadrarCaja = cuadrarCaja;
window.mostrarHistorialCajas = mostrarHistorialCajas;
window.borrarHistorialCierres = borrarHistorialCierres;
window.actualizarDashboardEjecutivo = actualizarDashboardEjecutivo;
window.buscarGarantia = buscarGarantia;
window.toggleHistorialVentas = toggleHistorialVentas;
window.toggleReportes = toggleReportes;
window.toggleDashboardEjecutivo = toggleDashboardEjecutivo;
window.toggleGarantias = toggleGarantias;
window.actualizarGarantia = actualizarGarantia;
window.actualizarNombreBoletaCarrito = actualizarNombreBoletaCarrito;
window.abrirTransferenciaStock = abrirTransferenciaStock;
window.cerrarTransferenciaStock = cerrarTransferenciaStock;
window.confirmarTransferenciaStock = confirmarTransferenciaStock;
window.cargarMasProductos = cargarMasProductos;
window.reimprimirBoletaVenta = reimprimirBoletaVenta;

async function activarNotificaciones(){

    if(!("Notification" in window)){
        alert("Este navegador no soporta notificaciones");
        return;
    }

    if(!("serviceWorker" in navigator)){
        alert("Este navegador no soporta service workers");
        return;
    }

    try{

        const permiso = await Notification.requestPermission();

        if(permiso !== "granted"){
            alert("Permiso de notificaciones denegado");
            return;
        }

        const registration =
    await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
    });

await navigator.serviceWorker.ready;

const token = await getToken(messaging, {
    vapidKey: vapidKey,
    serviceWorkerRegistration: registration
});
            await setDoc(
                doc(db, "tokensNotificaciones", token),
                {
                    token: token,
                    usuario: localStorage.getItem("nombreActivo") || "Sin usuario",
                    fecha: new Date().toISOString()
                }
            );

            alert("🔔 Notificaciones activadas correctamente");

        }

     catch(error){

       console.error("Error activando notificaciones:", error);

alert(
    "ERROR REAL\n\n" +
    (error.code || "sin-code") +
    "\n\n" +
    (error.message || error)
);

}

}

onMessage(messaging, function(payload){

    let titulo = payload.notification?.title || "Nueva notificación";
    let cuerpo = payload.notification?.body || "Tienes una actualización";

    alert(
        "🔔 " + titulo + "\n\n" + cuerpo
    );

});

window.activarNotificaciones = activarNotificaciones;

async function toggleSonido(){

   const video =
    window.innerWidth <= 768
    ? document.getElementById("videoFondoApp")
    : document.getElementById("videoFondoLaptop");
    const boton = document.getElementById("btnSonido");

    if(!video || !boton){
        alert("No se encontró el video o el botón de sonido");
        return;
    }

    try{

        if(video.muted){

            video.muted = false;
            video.volume = 0.6;

            await video.play();

            boton.textContent = "🔇 Silenciar";

        }else{

            video.muted = true;

            boton.textContent = "🔊 Activar sonido";

        }

    }catch(error){

        console.error("Error activando sonido:", error);
        alert("El navegador bloqueó el sonido. Toca otra vez el botón.");

    }

}

window.toggleSonido = toggleSonido;

function abrirModalPanel(idPanel){

    const rol = localStorage.getItem("rolActivo");

const panelesSoloAdmin = [
    "panelReportes",
    "panelDashboardEjecutivo",
    "panelReporteVendedores",
    "zonaAdmin",
    "panelGarantias"
];

if(
    rol === "vendedor" &&
    panelesSoloAdmin.includes(idPanel)
){
    return;
}

    let panel = document.getElementById(idPanel);
    let modal = document.getElementById("modalPanel");
    let contenido = document.getElementById("contenidoModalPanel");
    let modalContenido = document.querySelector(".modal-contenido");

    if(!panel || !modal || !contenido){
        alert("Error abriendo panel");
        return;
    }

    // Modal especial para Gestión de Productos
    if(idPanel === "zonaAdmin"){

    modalContenido.classList.add("modal-admin");

    setTimeout(function(){
        document.getElementById("codigo")?.focus();
    }, 100);

} else {

        modalContenido.classList.remove("modal-admin");

    }

    placeholderModal = document.createComment("placeholder-" + idPanel);

    panel.parentNode.insertBefore(placeholderModal, panel);

    contenido.innerHTML = "";
    contenido.appendChild(panel);

    panel.style.display = "block";
    modal.style.display = "flex";

    panelActivoModal = panel;
}

function cerrarModalPanel(){

    let modal = document.getElementById("modalPanel");

    if(panelActivoModal && placeholderModal){
        placeholderModal.parentNode.insertBefore(panelActivoModal, placeholderModal);
        placeholderModal.remove();

        panelActivoModal.style.display = "none";
    }

    panelActivoModal = null;
    placeholderModal = null;

    modal.style.display = "none";
}

window.abrirModalPanel = abrirModalPanel;
window.cerrarModalPanel = cerrarModalPanel;

async function actualizarSistema(){

    const confirmar = confirm("¿Actualizar el sistema y cargar la versión más reciente?");

    if(!confirmar){
        return;
    }

    try{

        if("caches" in window){
            const nombresCache = await caches.keys();

            await Promise.all(
                nombresCache.map(function(nombre){
                    return caches.delete(nombre);
                })
            );
        }

        if("serviceWorker" in navigator){
            const registros = await navigator.serviceWorker.getRegistrations();

            for(const registro of registros){
                await registro.unregister();
            }
        }

        localStorage.setItem("forzarRecargaSistema", Date.now());

        window.location.href =
            window.location.origin +
            window.location.pathname +
            "?v=" + Date.now();

    }catch(error){

        console.error("Error actualizando sistema:", error);
        alert("No se pudo actualizar automáticamente. Intenta borrar caché manualmente.");

    }

}

window.actualizarSistema = actualizarSistema;

function abrirCobroVenta(){

    document.body.classList.remove("carrito-app-abierto");

    if(carrito.length === 0){

        alert("⚠️ Agregue productos al carrito primero");
        return;

    }

    abrirModalPanel("panelCobroVenta");

}

window.abrirCobroVenta = abrirCobroVenta;

function abrirDatosClienteBoleta(){

    let modal = document.getElementById("modalDatosClienteBoleta");

    if(!modal){
        alert("No se encontró la ventana de datos del cliente");
        return;
    }

    modal.style.display = "flex";

    setTimeout(function(){
        let clienteNombre = document.getElementById("clienteNombre");

        if(clienteNombre){
            clienteNombre.focus();
        }
    }, 100);

}

function cerrarDatosClienteBoleta(){

    let modal = document.getElementById("modalDatosClienteBoleta");
    let clienteNombre = document.getElementById("clienteNombre");
    let clienteDni = document.getElementById("clienteDni");

    if(clienteNombre){
        clienteNombre.value = "";
        clienteNombre.disabled = false;
    }

    if(clienteDni){
        clienteDni.value = "";
        clienteDni.disabled = false;
    }

    if(modal){
        modal.style.display = "none";
    }

}

window.abrirDatosClienteBoleta = abrirDatosClienteBoleta;
window.cerrarDatosClienteBoleta = cerrarDatosClienteBoleta;

function prepararCarritoVentanaFinal(){

    const panel = document.querySelector(".panel-carrito");
    const titulo = document.getElementById("tituloCarrito");
    const resizeHandle = document.querySelector(".carrito-resize-handle");

    if(!panel || !titulo){
        return;
    }

    if(panel.dataset.fixFinalInit === "true"){
        return;
    }

    panel.dataset.fixFinalInit = "true";

    function esMovil(){
        return window.innerWidth <= 768;
    }

    function limitar(valor, minimo, maximo){
        return Math.min(Math.max(valor, minimo), maximo);
    }

    function aplicarEstado(){
        let estado = null;

        try{
            estado = JSON.parse(localStorage.getItem("carritoVentanaEstado"));
        }catch(error){
            estado = null;
        }

        const anchoDefault = window.innerWidth - 24;
        const altoDefault = Math.round(window.innerHeight * 0.42);

        const ancho = limitar(
            Number(estado?.w || anchoDefault),
            240,
            window.innerWidth - 24
        );

        const alto = limitar(
            Number(estado?.h || altoDefault),
            90,
            Math.round(window.innerHeight * 0.75)
        );

        const x = limitar(
            Number(estado?.x || 12),
            8,
            window.innerWidth - ancho - 8
        );

        const y = limitar(
            Number(estado?.y || (window.innerHeight - alto - 86)),
            68,
            window.innerHeight - 86
        );

        panel.style.setProperty("--carrito-x", x + "px");
        panel.style.setProperty("--carrito-y", y + "px");
        panel.style.setProperty("--carrito-w", ancho + "px");
        panel.style.setProperty("--carrito-h", alto + "px");
    }

    function guardarEstado(){
        const rect = panel.getBoundingClientRect();

        localStorage.setItem(
            "carritoVentanaEstado",
            JSON.stringify({
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: panel.offsetHeight
            })
        );
    }

    aplicarEstado();

    let modo = null;
    let inicioX = 0;
    let inicioY = 0;
    let rectInicial = null;

    titulo.addEventListener("pointerdown", function(evento){

        if(!esMovil()){
            return;
        }

        modo = "mover";
        inicioX = evento.clientX;
        inicioY = evento.clientY;
        rectInicial = panel.getBoundingClientRect();

        panel.classList.add("carrito-arrastrando");

        try{
            titulo.setPointerCapture(evento.pointerId);
        }catch(error){}

    });

    titulo.addEventListener("pointermove", function(evento){

        if(modo !== "mover" || !rectInicial){
            return;
        }

        evento.preventDefault();

        const nuevoX = limitar(
            rectInicial.left + evento.clientX - inicioX,
            8,
            window.innerWidth - rectInicial.width - 8
        );

        const nuevoY = limitar(
            rectInicial.top + evento.clientY - inicioY,
            68,
            window.innerHeight - 86
        );

        panel.style.setProperty("--carrito-x", nuevoX + "px");
        panel.style.setProperty("--carrito-y", nuevoY + "px");

    });

    function terminarMovimiento(evento){

        if(modo !== "mover"){
            return;
        }

        modo = null;
        rectInicial = null;

        panel.classList.remove("carrito-arrastrando");

        try{
            titulo.releasePointerCapture(evento.pointerId);
        }catch(error){}

        guardarEstado();

    }

    titulo.addEventListener("pointerup", terminarMovimiento);
    titulo.addEventListener("pointercancel", terminarMovimiento);

    if(resizeHandle){

        resizeHandle.addEventListener("pointerdown", function(evento){

            if(!esMovil()){
                return;
            }

            modo = "resize";
            inicioX = evento.clientX;
            inicioY = evento.clientY;
            rectInicial = panel.getBoundingClientRect();

            panel.classList.add("carrito-redimensionando");

            try{
                resizeHandle.setPointerCapture(evento.pointerId);
            }catch(error){}

        });

        resizeHandle.addEventListener("pointermove", function(evento){

            if(modo !== "resize" || !rectInicial){
                return;
            }

            evento.preventDefault();

            const nuevoAncho = limitar(
                rectInicial.width + evento.clientX - inicioX,
                240,
                window.innerWidth - rectInicial.left - 8
            );

            const nuevoAlto = limitar(
                rectInicial.height + evento.clientY - inicioY,
                90,
                Math.round(window.innerHeight * 0.75)
            );

            panel.style.setProperty("--carrito-w", nuevoAncho + "px");
            panel.style.setProperty("--carrito-h", nuevoAlto + "px");

        });

        function terminarResize(evento){

            if(modo !== "resize"){
                return;
            }

            modo = null;
            rectInicial = null;

            panel.classList.remove("carrito-redimensionando");

            try{
                resizeHandle.releasePointerCapture(evento.pointerId);
            }catch(error){}

            guardarEstado();

        }

        resizeHandle.addEventListener("pointerup", terminarResize);
        resizeHandle.addEventListener("pointercancel", terminarResize);

    }

    window.addEventListener("resize", aplicarEstado);

}

window.abrirCarritoApp = function(){

    const panel = document.querySelector(".panel-carrito");

    if(!panel){
        return;
    }

    prepararCarritoVentanaFinal();

    document.body.classList.add("carrito-abierto");
    document.body.classList.add("carrito-app-abierto");

    panel.classList.add("carrito-visible");

    panel.style.setProperty("display", "block", "important");
    panel.style.setProperty("opacity", "1", "important");
    panel.style.setProperty("pointer-events", "auto", "important");
    panel.style.setProperty("transform", "translateY(0)", "important");

};

window.cerrarCarritoApp = function(){

    const panel = document.querySelector(".panel-carrito");

    document.body.classList.remove("carrito-abierto");
    document.body.classList.remove("carrito-app-abierto");

    if(panel){
        panel.classList.remove("carrito-visible");
        panel.style.removeProperty("opacity");
        panel.style.removeProperty("pointer-events");
        panel.style.removeProperty("transform");
    }

};

document.addEventListener("DOMContentLoaded", prepararCarritoVentanaFinal);

setTimeout(prepararCarritoVentanaFinal, 700);

/* FIN CARRITOFIX1 */

function toggleCategoriasMenu(){
    document.body.classList.toggle("categorias-menu-abierto");
}

function cerrarCategoriasMenu(){
    document.body.classList.remove("categorias-menu-abierto");
}

document.addEventListener("click", function(evento){
    const menuCategorias = document.getElementById("categoriasMenuApp");
    const botonCategorias = document.querySelector(".btn-categorias-menu");

    if(!menuCategorias || !botonCategorias || !document.body.classList.contains("categorias-menu-abierto")){
        return;
    }

    if(!menuCategorias.contains(evento.target) && !botonCategorias.contains(evento.target)){
        cerrarCategoriasMenu();
    }
});

document.addEventListener("keydown", function(evento){
    if(evento.key === "Escape"){
        cerrarCategoriasMenu();
    }
});

window.toggleCategoriasMenu = toggleCategoriasMenu;
window.cerrarCategoriasMenu = cerrarCategoriasMenu;