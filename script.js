import {
    db,
    messaging,
    storage,
    vapidKey,
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
    getDocs,
    getToken,
    onMessage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "./js/firebase.js";

import { AppState } from "./js/state.js";
import { crearCatalogoProductos } from "./js/productos.js";
import { crearCarrito } from "./js/carrito.js";
import { crearVentas } from "./js/ventas.js";
import { crearVentasHistorial } from "./js/ventas-historial.js";
import {
    construirHTMLBoleta,
    construirHTMLReimpresionBoleta
} from "./js/boleta.js";

import { crearCaja } from "./js/caja.js";
import { crearDashboard } from "./js/dashboard.js";
import { crearGarantias } from "./js/garantias.js";
import { crearTransferencias } from "./js/transferencias.js";
import { crearAuth } from "./js/auth.js";
import {
    obtenerFechaISO,
    normalizarTexto,
    obtenerStockTiendas,
    obtenerStockTotal,
    obtenerTextoBusquedaProducto
} from "./js/core.js";


let usuarios = [

     {
        usuario: "Jonatan",
        password: "262214",
        rol: "admin",
        nombreCompleto: "Jonatan Távara"
    },

     {
        usuario: "Mercy",
        password: "251419",
        rol: "admin",
        nombreCompleto: "Mercy Villegas"
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

const estadoCatalogoBridge = {
    get productos(){ return productos; },
    set productos(valor){ productos = valor; },

    get productosVista(){ return productosVista; },
    set productosVista(valor){ productosVista = valor; },

    get busquedaCatalogo(){ return busquedaCatalogo; },
    set busquedaCatalogo(valor){ busquedaCatalogo = valor; },

    get categoriaCatalogo(){ return categoriaCatalogo; },
    set categoriaCatalogo(valor){ categoriaCatalogo = valor; },

    get catalogoVersion(){ return catalogoVersion; },
    set catalogoVersion(valor){ catalogoVersion = valor; },

    get ultimaFirmaCatalogo(){ return ultimaFirmaCatalogo; },
    set ultimaFirmaCatalogo(valor){ ultimaFirmaCatalogo = valor; },

    get catalogoDirty(){ return catalogoDirty; },
    set catalogoDirty(valor){ catalogoDirty = valor; },

    get cantidadRenderProductos(){ return cantidadRenderProductos; },
    set cantidadRenderProductos(valor){ cantidadRenderProductos = valor; },

    get cantidadRenderAnterior(){ return cantidadRenderAnterior; },
    set cantidadRenderAnterior(valor){ cantidadRenderAnterior = valor; },

    get modoRenderCatalogo(){ return modoRenderCatalogo; },
    set modoRenderCatalogo(valor){ modoRenderCatalogo = valor; },

    get indiceEditar(){ return indiceEditar; },
    set indiceEditar(valor){ indiceEditar = valor; }

};

const estadoCarritoBridge = {
    get carrito(){ return carrito; },
    set carrito(valor){ carrito = valor; },

    get productos(){ return productos; },
    set productos(valor){ productos = valor; }
};

const estadoVentasBridge = {

    get carrito(){ return carrito; },
    set carrito(valor){ carrito = valor; },

    get productos(){ return productos; },
    set productos(valor){ productos = valor; },

    get historialVentas(){ return historialVentas; },
    set historialVentas(valor){ historialVentas = valor; }  

};

const estadoCajaBridge = {

    get historialVentas(){ return historialVentas; },
    set historialVentas(valor){ historialVentas = valor; },

    get gastosCaja(){ return gastosCaja; },
    set gastosCaja(valor){ gastosCaja = valor; },

    get historialCajas(){ return historialCajas; },
    set historialCajas(valor){ historialCajas = valor; },

    get montoInicialCaja(){ return montoInicialCaja; },
    set montoInicialCaja(valor){ montoInicialCaja = valor; }

};

const estadoDashboardBridge = {

    get historialVentas(){ return historialVentas; },
    set historialVentas(valor){ historialVentas = valor; },

    get productos(){ return productos; },
    set productos(valor){ productos = valor; },

    get carrito(){ return carrito; },
    set carrito(valor){ carrito = valor; }

};

const estadoGarantiasBridge = {

    get productos(){ return productos; },
    set productos(valor){ productos = valor; }

};

const estadoTransferenciasBridge = {

    get productos(){ return productos; },
    set productos(valor){ productos = valor; },

    get productoTransferenciaActual(){ return productoTransferenciaActual; },
    set productoTransferenciaActual(valor){ productoTransferenciaActual = valor; }

};

const estadoAuthBridge = {

    get usuarios(){ return usuarios; },
    set usuarios(valor){ usuarios = valor; },

    get accionAdminPendiente(){ return accionAdminPendiente; },
    set accionAdminPendiente(valor){ accionAdminPendiente = valor; },

    get ventaPendienteAnular(){ return ventaPendienteAnular; },
    set ventaPendienteAnular(valor){ ventaPendienteAnular = valor; },

    get codigoAnulacion(){ return codigoAnulacion; },
    set codigoAnulacion(valor){ codigoAnulacion = valor; }

};

const CatalogoProductos = crearCatalogoProductos({
    state: estadoCatalogoBridge,

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
    actualizarDashboard
});

const Carrito = crearCarrito({
    state: estadoCarritoBridge,
    obtenerStockTotal,
    actualizarDashboard
});

const tiendasSistema = {
    principal: "Mercado",
    sucursal: "Peluquería"
};

const Ventas = crearVentas({
    state: estadoVentasBridge,

    db,
    collection,
    doc,
    getDoc,
    runTransaction,

    obtenerFechaISO,
    obtenerStockTiendas,
    tiendasSistema,

    obtenerDescuento,
    obtenerPagosMixtos,
    calcularTotalPagado,
    mostrarCarrito,

    construirHTMLBoleta,
});

const VentasHistorial = crearVentasHistorial({

    state: estadoVentasBridge,

    obtenerFechaISO,

    tiendasSistema,

    construirHTMLReimpresionBoleta,

    imprimirHTML: Ventas.imprimirHTML

});

const Caja = crearCaja({

    state: estadoCajaBridge,

    db,
    collection,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    runTransaction,

    obtenerFechaISO,
    pedirAutorizacionAdmin,

    mostrarGastosCaja: () => Caja.mostrarGastosCaja(),
    actualizarCajaDiaria: () => Caja.actualizarCajaDiaria()

});

const Dashboard = crearDashboard({

    state: estadoDashboardBridge,

    obtenerFechaISO,
    obtenerStockTotal,
    obtenerDescuento

});

const Garantias = crearGarantias({

    state: estadoGarantiasBridge,

    db,
    collection,
    doc,
    updateDoc,
    query,
    where,
    getDocs

});

const Transferencias = crearTransferencias({

    state: estadoTransferenciasBridge,

    db,
    doc,
    collection,
    runTransaction,

    obtenerStockTiendas,
    tiendasSistema,
    obtenerFechaISO

});

const Auth = crearAuth({

    state: estadoAuthBridge,

    db,
    doc,
    getDoc,
    setDoc,

    detenerListenersFirebase,
    iniciarListenersFirebase,
    hidratarProductosDesdeIndexedDB,
    mostrarCarrito,
    controlarColumnaGanancia,
    apagarSonidoLogin,

    sonidoVenta,
    location,
    localStorage

});

function detenerListenersFirebase(){

    listenersFirebaseActivos.forEach(function(unsubscribe){
        if(typeof unsubscribe === "function"){
            unsubscribe();
        }
    });

    listenersFirebaseActivos = [];
    listenersFirebaseIniciados = false;

}

sonidoVenta.volume = 0.4;

function ordenarProductosPorCodigo(){

    productos.sort(function(a, b){
        return String(a.codigo || "").localeCompare(String(b.codigo || ""));
    });

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

function reiniciarRenderCatalogo(){
    CatalogoProductos.reiniciarRenderCatalogo();
}

function mostrarProductos(){
    CatalogoProductos.mostrarProductos();
}

function cargarMasProductos(){
    CatalogoProductos.cargarMasProductos();
}

async function subirImagenProductoStorage(archivo){
    return await CatalogoProductos.subirImagenProductoStorage(archivo);
}

async function eliminarImagenAnteriorStorage(urlImagen){
    return await CatalogoProductos.eliminarImagenAnteriorStorage(urlImagen);
}

async function guardarProducto(){
    return await CatalogoProductos.guardarProducto();
}

function seleccionarImagenProducto(){
    CatalogoProductos.seleccionarImagenProducto();
}

function editarProducto(idProducto){
    CatalogoProductos.editarProducto(idProducto);
}

async function eliminarProducto(idProducto){
    await CatalogoProductos.eliminarProducto(idProducto);
}

function buscarProducto(){
    CatalogoProductos.buscarProducto();
}

function mostrarCarrito(){
    Carrito.mostrarCarrito();
}

function actualizarResumenVenta(){
    Carrito.actualizarResumenVenta();
}


function actualizarNombreBoletaCarrito(index, valor){
    Carrito.actualizarNombreBoletaCarrito(index, valor);
}

function eliminarDelCarrito(index){
    Carrito.eliminarDelCarrito(index);
}

function agregarDirecto(idProducto){
    Carrito.agregarDirecto(idProducto);
}

function cancelarVenta(){
    Carrito.cancelarVenta();
}

function obtenerPagosMixtos(){
    return Carrito.obtenerPagosMixtos();
}

function calcularTotalPagado(){
    return Carrito.calcularTotalPagado();
}

async function finalizarVenta(numeroBoleta = "SIN IMPRESION"){
    return await Ventas.finalizarVenta(numeroBoleta);
}

function desbloquearSistema(){
    Auth.desbloquearSistema();
}

function apagarSonidoLogin(){

    let videoLaptop = document.getElementById("videoFondoLaptop");
    let boton = document.getElementById("btnSonido");

    if(videoLaptop){
        videoLaptop.muted = true;
        videoLaptop.volume = 0;
        videoLaptop.pause();
        videoLaptop.currentTime = 0;
    }

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

    CatalogoProductos.ordenarProductosPorCodigo();

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
try{

    let usuarioRef = doc(db, "usuarios", usuarioInput);
    let usuarioSnap = await getDoc(usuarioRef);

    if(usuarioSnap.exists()){

        let usuarioFirebase = usuarioSnap.data();

        if(usuarioFirebase.password === passwordInput){
            usuarioEncontrado = usuarioFirebase;
        }

    }

}catch(error){

    console.warn("No se pudo leer usuario desde Firebase. Se usará login local si existe.", error);

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

        Auth.completarInicioSesion(usuarioEncontrado);

}

function aplicarPermisos(){
    Auth.aplicarPermisos();
}

function cerrarSesion(){
    Auth.cerrarSesion();
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
    Dashboard.actualizarDashboard();
}

async function validarStockAntesDeImprimir(){
    return await Ventas.validarStockAntesDeImprimir();
}

async function imprimirBoleta(){
    return await Ventas.imprimirBoleta();
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
    return VentasHistorial.obtenerDetallePagosVenta(venta);
}

function obtenerProductosVenta(venta){
    return VentasHistorial.obtenerProductosVenta(venta);
}

function obtenerCategoriasVenta(venta){
    return VentasHistorial.obtenerCategoriasVenta(venta);
}

function mostrarHistorialVentas(){

    let tabla = document.getElementById("historialVentasTabla");

    if(!tabla){
        return;
    }

    let html = "";

    let rol = localStorage.getItem("rolActivo");
    
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
        ? `<button onclick="reimprimirBoletaVenta(${indexReal})" title="Reimprimir boleta">🧾</button>`
        : ""
    }

    <button onclick="anularVenta(${indexReal})" title="Anular venta">↩️</button>
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
    VentasHistorial.reimprimirBoletaVenta(index);
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
    document.getElementById("nuevoCodigoAnulacion").value.trim();

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
    return await Auth.validarCodigoAdmin();
}

function cerrarModalCodigo(){
    Auth.cerrarModalCodigo();
}

function pedirAutorizacionAdmin(accion){
    Auth.pedirAutorizacionAdmin(accion);
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
    return await Caja.anularGastoCaja(idGasto, autorizado);
}

function filtrarCategoria(categoria){
    CatalogoProductos.filtrarCategoria(categoria);
}

function actualizarReportes(){
    Dashboard.actualizarReportes();
}

function actualizarDashboardEjecutivo(){
    Dashboard.actualizarDashboardEjecutivo();
}

function mostrarReporteVendedores(){
    Dashboard.mostrarReporteVendedores();
}

function obtenerDescuento(){
    return Carrito.obtenerDescuento();
}

function limpiarDescuentoSiCarritoVacio(){
    Carrito.limpiarDescuentoSiCarritoVacio();
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

        CatalogoProductos.ordenarProductosPorCodigo();

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
    return await Caja.abrirCaja();
}

async function registrarGasto(){
    return await Caja.registrarGasto();
}

function mostrarGastosCaja(){
    Caja.mostrarGastosCaja();
}

function actualizarCajaDiaria(){
    Caja.actualizarCajaDiaria();
}

function cuadrarCaja(){
    Caja.cuadrarCaja();
}

function mostrarHistorialCajas(){
    Caja.mostrarHistorialCajas();
}

async function borrarHistorialCierres(){
    return await Caja.borrarHistorialCierres();
}

async function cerrarCaja(){
    return await Caja.cerrarCaja();
}

async function anularCajaDelDia(autorizado = false){
    return await Caja.anularCajaDelDia(autorizado);
}

async function buscarGarantia(){
    return await Garantias.buscarGarantia();
}

async function actualizarGarantia(idBoleta, estado){
    return await Garantias.actualizarGarantia(idBoleta, estado);
}

function abrirTransferenciaStock(idProducto){
    Transferencias.abrirTransferenciaStock(idProducto);
}

function cerrarTransferenciaStock(){
    Transferencias.cerrarTransferenciaStock();
}

async function confirmarTransferenciaStock(){
    return await Transferencias.confirmarTransferenciaStock();
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
window.seleccionarImagenProducto = seleccionarImagenProducto;
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

    const video = document.getElementById("videoFondoLaptop");
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

function toggleCategoriasMenu(){
    document.body.classList.toggle("categorias-menu-abierto");
}

function cerrarCategoriasMenu(){
    document.body.classList.remove("categorias-menu-abierto");
}

document.addEventListener("click", function(evento){
    const menuCategorias = document.getElementById("categoriasMenu");
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
