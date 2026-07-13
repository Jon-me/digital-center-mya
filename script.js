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
import { crearSucursales } from "./js/sucursales.js";
import { crearAuth } from "./js/auth.js";
import { crearListeners } from "./js/listeners.js";
import { crearBootstrap } from "./js/bootstrap.js";
import { crearUI } from "./js/ui.js";
import { crearNotifications } from "./js/notificaciones.js";
import { crearIndexedDB } from "./js/indexeddb.js";
import { crearCatalogEngine } from "./js/catalog-engine.js";
import { crearHTMLLoader } from "./js/html-loader.js";
import {
    obtenerFechaISO,
    obtenerSucursalActiva,
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
        nombreCompleto: "Jonatan Távara",
        sucursalId: "principal"
    },

    {
        usuario: "Mercy",
        password: "251419",
        rol: "admin",
        nombreCompleto: "Mercy Villegas",
        sucursalId: "principal"
    },

    {
        usuario: "David",
        password: "1234",
        rol: "vendedor",
        nombreCompleto: "David S.",
        sucursalId: "sucursal"
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

const CatalogEngine = crearCatalogEngine({

    normalizarTexto

});

const Sucursales = crearSucursales({

    db,
    collection,
    addDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot

});

const CatalogoProductos = crearCatalogoProductos({
    state: estadoCatalogoBridge,

    CatalogEngine,

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

renderizarStockHTML:
    Sucursales.renderizarStockHTML,

    renderizarFormularioStock:
    Sucursales.renderizarFormularioStock,

actualizarDashboard:
    () => Dashboard.actualizarDashboard()

});

const Carrito = crearCarrito({
    state: estadoCarritoBridge,
    obtenerStockTotal,
    actualizarDashboard: () => Dashboard.actualizarDashboard()
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
    obtenerSucursalActiva,
    obtenerStockTiendas,

    obtenerNombreSucursal:
        Sucursales.obtenerNombreSucursal,

    obtenerDescuento:
        Carrito.obtenerDescuento,

    obtenerPagosMixtos:
        Carrito.obtenerPagosMixtos,

    calcularTotalPagado:
        Carrito.calcularTotalPagado,

    mostrarCarrito:
        Carrito.mostrarCarrito,

    construirHTMLBoleta

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

    obtenerSucursalCajaActiva,

    obtenerIdCajaActiva,

    obtenerNombreSucursal:
        Sucursales.obtenerNombreSucursal,

    pedirAutorizacionAdmin,

    mostrarGastosCaja:
        () => Caja.mostrarGastosCaja(),

    actualizarCajaDiaria:
        () => Caja.actualizarCajaDiaria()

});

const Dashboard = crearDashboard({

    state: estadoDashboardBridge,

    obtenerFechaISO,
    obtenerDashboardSucursal,

    obtenerStockTiendas,
    obtenerStockTotal,

    obtenerNombreSucursal:
        Sucursales.obtenerNombreSucursal,

    obtenerDescuento:
        Carrito.obtenerDescuento

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
obtenerNombreSucursal:
    Sucursales.obtenerNombreSucursal,
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
    mostrarCarrito: Carrito.mostrarCarrito,
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

    obtenerSucursalCajaActiva,
    obtenerIdCajaActiva,

    actualizarCajaDiaria: Caja.actualizarCajaDiaria,
mostrarGastosCaja: Caja.mostrarGastosCaja,
mostrarHistorialCajas: Caja.mostrarHistorialCajas,
    mostrarHistorialVentas,
    actualizarReportes: Dashboard.actualizarReportes,
actualizarDashboardEjecutivo: Dashboard.actualizarDashboardEjecutivo,
mostrarRankingSucursales:
    Dashboard.mostrarRankingSucursales,
mostrarRankingProductos:
    Dashboard.mostrarRankingProductos,

mostrarReporteVendedores: Dashboard.mostrarReporteVendedores,
    
guardarProductosIndexedDB,

    reiniciarRenderCatalogo:
    CatalogoProductos.reiniciarRenderCatalogo,

mostrarProductos:
    CatalogoProductos.mostrarProductos,

ordenarProductosPorCodigo:
    CatalogoProductos.ordenarProductosPorCodigo

});

const UI = crearUI({

    localStorage,

    state: estadoUIBridge

});

const IndexedDB = crearIndexedDB({});

const HTMLLoader = crearHTMLLoader({

    directorioBase: "html",

    version: "HTML26-13",

    modoPredeterminado: "replace-element"

});

HTMLLoader.registrarFragmento(
    "centro-control",
    "#htmlCentroControl"
);

HTMLLoader.registrarFragmento(
    "categorias",
    "#htmlCategorias"
);

HTMLLoader.registrarFragmento(
    "historial",
    "#htmlHistorial"
);

HTMLLoader.registrarFragmento(
    "garantias",
    "#htmlGarantias"
);

HTMLLoader.registrarFragmento(
    "reporte-vendedores",
    "#htmlReporteVendedores"
);

HTMLLoader.registrarFragmento(
    "reportes",
    "#htmlReportes"
);

HTMLLoader.registrarFragmento(
    "dashboard",
    "#htmlDashboard"
);

HTMLLoader.registrarFragmento(
    "caja",
    "#htmlCaja"
);

HTMLLoader.registrarFragmento(
    "admin",
    "#htmlAdmin"
);

HTMLLoader.registrarFragmento(
    "transferencias",
    "#htmlTransferencias"
);

HTMLLoader.registrarFragmento(
    "ventas",
    "#htmlVentas"
);

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
    mostrarCarrito: Carrito.mostrarCarrito,
    controlarColumnaGanancia,
    aplicarPermisos: Auth.aplicarPermisos,
    desbloquearSistema,
    iniciarListenersFirebase,
    hidratarProductosDesdeIndexedDB,

    iniciarSesion,
    calcularTotalPagado: Carrito.calcularTotalPagado,
actualizarResumenVenta: Carrito.actualizarResumenVenta,
limpiarDescuentoSiCarritoVacio: Carrito.limpiarDescuentoSiCarritoVacio,

    inicializarMenuCategorias: UI.inicializarMenuCategorias,
    inicializarOnMessage: Notifications.inicializarOnMessage

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

CatalogoProductos.reiniciarRenderCatalogo();

CatalogoProductos.mostrarProductos();

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

// =====================================================
// INICIALIZAR APLICACIÓN
// El Bootstrap inicia únicamente después de montar
// y validar todos los fragmentos HTML.
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacionCompleta
);

async function iniciarAplicacionCompleta(){

    try{

await HTMLLoader
    .cargarFragmentosRegistrados();

HTMLLoader.validarElementosCriticos([

    "#login",
    "#sistema",
    "#btnSonido",
    "#usuario",
    "#password",

    "#carritoTabla",
    "#tablaProductos",

    "#centroControlAdmin",
    "#categoriasMenu",

    "#panelHistorialVentas",
    "#historialVentasTabla",
    "#columnaGanancia",

    "#panelGarantias",
    "#inputGarantia",
    "#resultadoGarantia",

    "#panelReporteVendedores",
    "#reporteVendedoresTabla",

    "#panelReportes",
    "#dashboardAdmin",
    "#dashboardReportes",
    "#totalProductos",
    "#valorInventario",
    "#productosCarrito",
    "#ventaActual",
    "#ventasHoy",
    "#gananciaHoy",
    "#ventasMes",
    "#gananciaMes",
    "#ventasEfectivo",
    "#ventasYape",
    "#ventasPlin",
    "#ventasTarjeta",
    "#ventasTransferencia",

    "#panelDashboardEjecutivo",
    "#tituloDashboardEjecutivo",
    "#dashboardSucursal",
    "#dashboardEjecutivo",
    "#productoMasVendido",
    "#mejorVendedor",
    "#gananciaRealDia",
    "#ticketPromedio",
    "#gananciaMesEjecutiva",
    "#rankingSucursales",
    "#rankingProductos",

    "#panelCajaDiaria",
    "#sucursalCaja",
    "#cajaInicial",
    "#cajaVentas",
    "#cajaEfectivo",
    "#cajaYape",
    "#cajaPlin",
    "#cajaTarjeta",
    "#cajaTransferencia",
    "#cajaGastos",
    "#cajaEsperada",
    "#montoInicialCaja",
    "#descripcionGasto",
    "#montoGasto",
    "#tablaGastosCaja",
    "#dineroRealCaja",
    "#resultadoCuadreCaja",
    "#btnBorrarHistorialCajas",
    "#historialCajasTabla", 

    "#tituloCarrito",
    "#carritoTabla",
    "#totalVenta",

    "#panelCobroVenta",
    "#descuentoVenta",
    "#resumenProductosCobro",
    "#resumenTotalCobro",

    "#tiendaVenta",

    "#pagosMixtos",
    "#pagoEfectivo",
    "#pagoYape",
    "#pagoPlin",
    "#pagoTarjeta",
    "#pagoTransferencia",

    "#totalPagado",
    "#totalPendienteCobro",

    "#tablaProductos",

    "#modalTransferenciaStock",
    "#transferenciaProductoNombre",
    "#stockTransferPrincipal",
    "#stockTransferSucursal",
    "#transferenciaOrigen",
    "#transferenciaDestino",
    "#transferenciaCantidad",

    "#modalPanel",
    "#contenidoModalPanel"
]);
        Bootstrap.iniciarAplicacion();

        CatalogoProductos
            .inicializarScrollCatalogo();

        Sucursales.iniciarListener();

        Sucursales.alCargar(
            cargarSucursalesEnCombos
        );

    }catch(error){

        console.error(
            "Error crítico inicializando Digital Center M&A:",
            error
        );

        mostrarErrorInicializacion(error);

    }

}

function mostrarErrorInicializacion(error){

    const mensaje =
        error instanceof Error
            ? error.message
            : "Error desconocido durante la inicialización.";

    document.body.innerHTML = `
        <main class="error-inicializacion-sistema">
            <h1>⚠️ No se pudo iniciar el sistema</h1>

            <p>
                Digital Center M&A encontró un problema
                cargando su interfaz.
            </p>

            <pre>${escaparHTML(mensaje)}</pre>

            <button type="button" onclick="window.location.reload()">
                Reintentar
            </button>
        </main>
    `;

}

function escaparHTML(valor){

    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function cargarSucursalesEnCombos(){

    const comboVenta =
        document.getElementById("tiendaVenta");

    const comboOrigen =
        document.getElementById("transferenciaOrigen");

    const comboDestino =
        document.getElementById("transferenciaDestino");

    const comboCaja =
        document.getElementById("sucursalCaja");

    const comboDashboard =
        document.getElementById("dashboardSucursal");

    const rolActivo =
        localStorage.getItem("rolActivo");

    const sucursalUsuario =
        obtenerSucursalActiva();

    const valorCaja =
        rolActivo === "vendedor"
            ? sucursalUsuario
            : (
                comboCaja?.value ||
                localStorage.getItem("sucursalCajaActiva") ||
                "principal"
            );

    const valorVenta =
        rolActivo === "vendedor"
            ? sucursalUsuario
            : (
                comboVenta?.value ||
                sucursalUsuario
            );

    Sucursales.cargarOpcionesEnSelect(
        comboCaja,
        valorCaja
    );

    Sucursales.cargarOpcionesEnSelect(
        comboVenta,
        valorVenta
    );

    if(comboCaja){

        comboCaja.disabled =
            rolActivo === "vendedor";

    }

    if(comboVenta){

        comboVenta.disabled =
            rolActivo === "vendedor";

    }

    Sucursales.cargarOpcionesEnSelect(
        comboOrigen,
        comboOrigen?.value ||
        "principal"
    );

    Sucursales.cargarOpcionesEnSelect(
        comboDestino,
        comboDestino?.value ||
        "sucursal"
    );

    if(comboDashboard){

        comboDashboard.innerHTML = `
            <option value="empresa">
                🌎 Toda la empresa
            </option>
        `;

        Sucursales
            .obtenerSucursales()
            .forEach(function(sucursal){

                comboDashboard.insertAdjacentHTML(
                    "beforeend",
                    `
                        <option value="${sucursal.id}">
                            ${sucursal.nombre}
                        </option>
                    `
                );

            });

        const valorDashboard =
            rolActivo === "vendedor"
                ? sucursalUsuario
                : (
                    localStorage.getItem(
                        "dashboardSucursal"
                    ) ||
                    "empresa"
                );

        const existeValorDashboard =
            Array.from(
                comboDashboard.options
            ).some(function(opcion){

                return (
                    opcion.value ===
                    valorDashboard
                );

            });

        comboDashboard.value =
            existeValorDashboard
                ? valorDashboard
                : "empresa";

        comboDashboard.disabled =
            rolActivo === "vendedor";

    }

    const contenedorStock =
        document.getElementById(
            "contenedorStockSucursales"
        );

    if(contenedorStock){

        contenedorStock.innerHTML =
            Sucursales
                .renderizarFormularioStock();

    }

}

function obtenerSucursalCajaActiva(){

    const rol =
        localStorage.getItem("rolActivo");

    if(rol === "vendedor"){

        return obtenerSucursalActiva();

    }

    const comboCaja =
        document.getElementById("sucursalCaja");

    return (
        comboCaja?.value ||
        localStorage.getItem("sucursalCajaActiva") ||
        obtenerSucursalActiva() ||
        "principal"
    );

}

function obtenerIdCajaActiva(){

    return (
        obtenerSucursalCajaActiva() +
        "__" +
        obtenerFechaISO()
    );

}

function cambiarSucursalCaja(){

    const rol =
    localStorage.getItem("rolActivo");

if(rol === "vendedor"){
    return;
}

    const sucursalId =
        obtenerSucursalCajaActiva();

    localStorage.setItem(
        "sucursalCajaActiva",
        sucursalId
    );

    detenerListenersFirebase();
    iniciarListenersFirebase();

    Caja.actualizarCajaDiaria();
    Caja.mostrarHistorialCajas();

}

function obtenerDashboardSucursal(){

    const rol =
        localStorage.getItem("rolActivo");

    if(rol === "vendedor"){

        return obtenerSucursalActiva();

    }

    return (
        document.getElementById("dashboardSucursal")?.value ||
        localStorage.getItem("dashboardSucursal") ||
        "empresa"
    );

}

function cambiarSucursalDashboard(){

    localStorage.setItem(
        "dashboardSucursal",
        obtenerDashboardSucursal()
    );

    Dashboard.actualizarDashboard();
    Dashboard.actualizarReportes();
    Dashboard.actualizarDashboardEjecutivo();
    Dashboard.mostrarRankingSucursales();
    Dashboard.mostrarRankingProductos();

}

async function finalizarEImprimir(){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let numeroBoleta = await Ventas.imprimirBoleta();

if(!numeroBoleta){
    return;
}

await Ventas.finalizarVenta("B001-" + numeroBoleta);
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
    <td>${VentasHistorial.obtenerProductosVenta(venta)}</td>
    <td>${VentasHistorial.obtenerCategoriasVenta(venta)}</td>
   <td>${venta.vendedor || "Sin vendedor"}</td>
<td>${venta.tiendaVentaNombre ||
Sucursales.obtenerNombreSucursal(venta.tiendaVenta)}</td>
<td>S/ ${Number(venta.total || 0).toFixed(2)}</td>
    <td>${VentasHistorial.obtenerDetallePagosVenta(venta)}</td>

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

const stockTotal =
    Object.values(stockTiendas)
        .reduce(function(total, cantidad){

            return total + Number(cantidad || 0);

        }, 0);

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
window.cerrarSesion = Auth.cerrarSesion;
window.buscarProducto = CatalogoProductos.buscarProducto;
window.filtrarCategoria = CatalogoProductos.filtrarCategoria;
window.seleccionarImagenProducto = CatalogoProductos.seleccionarImagenProducto;
window.guardarProducto = CatalogoProductos.guardarProducto;
window.agregarDirecto = Carrito.agregarDirecto;
window.editarProducto = CatalogoProductos.editarProducto;
window.eliminarProducto = CatalogoProductos.eliminarProducto;
window.eliminarDelCarrito = Carrito.eliminarDelCarrito;
window.cancelarVenta = Carrito.cancelarVenta;
window.finalizarVenta = Ventas.finalizarVenta;
window.finalizarEImprimir = finalizarEImprimir;
window.imprimirBoleta = Ventas.imprimirBoleta;
window.toggleAgregarProducto = toggleAgregarProducto;
window.toggleReporteVendedores = toggleReporteVendedores;
window.abrirConfiguracion = abrirConfiguracion;
window.guardarConfiguracion = guardarConfiguracion;
window.validarCodigoAdmin = validarCodigoAdmin;
window.cerrarModalCodigo =
    Auth.cerrarModalCodigo;
window.anularVenta = anularVenta;
window.ejecutarAnulacion = ejecutarAnulacion;
window.mostrarCarrito = Carrito.mostrarCarrito;
window.actualizarDashboard = Dashboard.actualizarDashboard;
window.toggleCajaDiaria = toggleCajaDiaria;
window.abrirCaja = Caja.abrirCaja;
window.registrarGasto = Caja.registrarGasto;
window.cerrarCaja = Caja.cerrarCaja;
window.anularGastoCaja = Caja.anularGastoCaja;
window.anularCajaDelDia = Caja.anularCajaDelDia;
window.cuadrarCaja = Caja.cuadrarCaja;
window.mostrarHistorialCajas = Caja.mostrarHistorialCajas;
window.borrarHistorialCierres = Caja.borrarHistorialCierres;
window.actualizarDashboardEjecutivo =
    Dashboard.actualizarDashboardEjecutivo;
window.buscarGarantia = Garantias.buscarGarantia;
window.toggleHistorialVentas = toggleHistorialVentas;
window.toggleReportes = toggleReportes;
window.toggleDashboardEjecutivo = toggleDashboardEjecutivo;
window.toggleGarantias = toggleGarantias;
window.actualizarGarantia = Garantias.actualizarGarantia;
window.actualizarNombreBoletaCarrito =
    Carrito.actualizarNombreBoletaCarrito;
window.abrirTransferenciaStock =
    Transferencias.abrirTransferenciaStock;
window.cerrarTransferenciaStock =
    Transferencias.cerrarTransferenciaStock;
window.confirmarTransferenciaStock =
    Transferencias.confirmarTransferenciaStock;
window.cargarMasProductos = CatalogoProductos.cargarMasProductos;
window.reimprimirBoletaVenta =
    VentasHistorial.reimprimirBoletaVenta;

window.activarNotificaciones =
    Notifications.activarNotificaciones;

window.toggleSonido =
    Notifications.toggleSonido;

window.cambiarSucursalCaja =
    cambiarSucursalCaja;

window.cambiarSucursalDashboard =
    cambiarSucursalDashboard;

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
