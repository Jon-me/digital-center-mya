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
import { crearListeners } from "./js/listeners.js";
import { crearBootstrap } from "./js/bootstrap.js";
import { crearUI } from "./js/ui.js";
import { crearNotifications } from "./js/notificaciones.js";
import { crearIndexedDB } from "./js/indexeddb.js";
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

    get catalogoDirty(){ return catalogoDirty; },
    set catalogoDirty(valor){ catalogoDirty = valor; },

    get busquedaCatalogo(){ return busquedaCatalogo; },
    set busquedaCatalogo(valor){ busquedaCatalogo = valor; },

    get categoriaCatalogo(){ return categoriaCatalogo; },
    set categoriaCatalogo(valor){ categoriaCatalogo = valor; },

    get catalogoVersion(){ return catalogoVersion; },
    set catalogoVersion(valor){ catalogoVersion = valor; },

    get ultimaFirmaCatalogo(){ return ultimaFirmaCatalogo; },
    set ultimaFirmaCatalogo(valor){ ultimaFirmaCatalogo = valor; },

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

const estadoListenersBridge = {

    get productos(){ return productos; },
    set productos(valor){ productos = valor; },

    get historialVentas(){ return historialVentas; },
    set historialVentas(valor){ historialVentas = valor; },

    get montoInicialCaja(){ return montoInicialCaja; },
    set montoInicialCaja(valor){ montoInicialCaja = valor; },

    get gastosCaja(){ return gastosCaja; },
    set gastosCaja(valor){ gastosCaja = valor; },

    get historialCajas(){ return historialCajas; },
    set historialCajas(valor){ historialCajas = valor; },

    get codigoAnulacion(){ return codigoAnulacion; },
    set codigoAnulacion(valor){ codigoAnulacion = valor; },

    get listenersFirebaseActivos(){ return listenersFirebaseActivos; },
    set listenersFirebaseActivos(valor){ listenersFirebaseActivos = valor; },

    get listenersFirebaseIniciados(){ return listenersFirebaseIniciados; },
    set listenersFirebaseIniciados(valor){ listenersFirebaseIniciados = valor; },

    get catalogoVersion(){ return catalogoVersion; },
    set catalogoVersion(valor){ catalogoVersion = valor; },

    get ultimaFirmaCatalogo(){ return ultimaFirmaCatalogo; },
    set ultimaFirmaCatalogo(valor){ ultimaFirmaCatalogo = valor; }

};

const estadoUIBridge = {

    get panelActivoModal(){
        return panelActivoModal;
    },
    set panelActivoModal(valor){
        panelActivoModal = valor;
    },

    get placeholderModal(){
        return placeholderModal;
    },
    set placeholderModal(valor){
        placeholderModal = valor;
    }

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

const Listeners = crearListeners({

    state: estadoListenersBridge,

    db,
    collection,
    doc,
    onSnapshot,

    obtenerFechaISO,

    actualizarCajaDiaria,
    mostrarGastosCaja,
    mostrarHistorialCajas,
    mostrarHistorialVentas,
    actualizarReportes,
    actualizarDashboardEjecutivo,
    mostrarReporteVendedores,
    guardarProductosIndexedDB,

    reiniciarRenderCatalogo,
    mostrarProductos,
    ordenarProductosPorCodigo

});

const UI = crearUI({

    localStorage,

    state: estadoUIBridge

});

const IndexedDB = crearIndexedDB({});

const Notifications = crearNotifications({

    messaging,
    vapidKey,

    db,
    doc,
    setDoc,
    getToken,
    onMessage,

    localStorage

});

const Bootstrap = crearBootstrap({

    localStorage,

    apagarSonidoLogin,
    mostrarCarrito,
    controlarColumnaGanancia,
    aplicarPermisos,
    desbloquearSistema,
    iniciarListenersFirebase,
    hidratarProductosDesdeIndexedDB,

    iniciarSesion,
    calcularTotalPagado,
    actualizarResumenVenta,
    limpiarDescuentoSiCarritoVacio,

    inicializarMenuCategorias: UI.inicializarMenuCategorias

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

// INICIALIZAR APLICACIÓN
document.addEventListener("DOMContentLoaded", function(){

    Bootstrap.iniciarAplicacion();

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

    return IndexedDB.abrirDBProductos();

}

async function guardarProductosIndexedDB(){

    return await IndexedDB.guardarProductosIndexedDB(productos);

}

async function cargarProductosIndexedDB(){

    return await IndexedDB.cargarProductosIndexedDB();

}

function iniciarListenersFirebase(){

    if(listenersFirebaseIniciados){
        return;
    }

    listenersFirebaseIniciados = true;

Listeners.escucharProductos();

Listeners.escucharVentas();

Listeners.escucharConfiguracion();

Listeners.escucharCaja();

Listeners.escucharGastos();

Listeners.escucharHistorialCierres();

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
    UI.abrirPanelSeguro(ids);
}

function toggleAgregarProducto(){
    UI.abrirSeccion([
        "zonaAdmin",
        "panelAgregarProducto"
    ]);
}

function toggleReporteVendedores(){

    UI.abrirSeccion([
        "panelReporteVendedores",
        "reporteVendedores"
    ]);

}

function toggleCajaDiaria(){

    UI.abrirSeccion([
        "panelCajaDiaria",
        "cajaDiaria"
    ]);

}

function toggleHistorialVentas(){
    UI.abrirSeccion([
        "panelHistorialVentas",
        "historialVentas"
    ]);
}

function toggleReportes(){
    UI.abrirSeccion([
        "dashboardReportes",
        "panelReportes"
    ]);
}

function toggleDashboardEjecutivo(){
    UI.abrirSeccion([
        "dashboardEjecutivo",
        "panelDashboardEjecutivo"
    ]);
}

function toggleGarantias(){
    UI.abrirSeccion([
        "panelGarantias",
        "garantias"
    ]);
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
    return await Notifications.activarNotificaciones();
}

Notifications.inicializarOnMessage();

window.activarNotificaciones = activarNotificaciones;

async function toggleSonido(){

    return await Notifications.toggleSonido();

}

window.toggleSonido = toggleSonido;

function abrirModalPanel(idPanel){
    UI.abrirModalPanel(idPanel);
}

function cerrarModalPanel(){
    UI.cerrarModalPanel();
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
    UI.toggleCategoriasMenu();
}

function cerrarCategoriasMenu(){
    UI.cerrarCategoriasMenu();
}

window.toggleCategoriasMenu = toggleCategoriasMenu;
window.cerrarCategoriasMenu = cerrarCategoriasMenu;
