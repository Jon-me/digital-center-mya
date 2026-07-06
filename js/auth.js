// =====================================================
// DIGITAL CENTER M&A
// AUTH MODULE
// FASE 11
// =====================================================

export function crearAuth(deps){

    const {

        state,

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

    } = deps;

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

    document
        .querySelectorAll("input, button, select, textarea")
        .forEach(function(elemento){

            elemento.disabled = false;
            elemento.style.pointerEvents = "auto";

        });

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

    state.accionAdminPendiente = accion;

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

async function validarCodigoAdmin(){

    let codigoIngresado =
        document.getElementById("codigoAdminInput").value.trim();

    if(codigoIngresado !== state.codigoAnulacion){
        alert("Código incorrecto");
        return;
    }

    cerrarModalCodigo();

    if(state.accionAdminPendiente){

        await state.accionAdminPendiente();

        state.accionAdminPendiente = null;

        return;

    }

    if(state.ventaPendienteAnular !== null){

        await window.ejecutarAnulacion(state.ventaPendienteAnular);

        state.ventaPendienteAnular = null;

    }

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

        let columnaGanancia =
            document.getElementById("columnaGanancia");

        if(columnaGanancia){
            columnaGanancia.style.display = "none";
        }

        document.querySelectorAll(".btn-toggle-producto").forEach(function(btn){

            if(
                btn.innerText.includes("Caja Diaria") ||
                btn.innerText.includes("Historial de Ventas")
            ){
                btn.style.display = "inline-block";
            }else{
                btn.style.display = "none";
            }

        });

        document.querySelectorAll('button[onclick^="editarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

        document.querySelectorAll('button[onclick^="eliminarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

    }else{

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

function completarInicioSesion(usuarioEncontrado){

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
    }else{
        document.getElementById("dashboardAdmin").style.display = "grid";
    }

    desbloquearSistema();

    iniciarListenersFirebase();

    setTimeout(async function(){

        mostrarCarrito();
        controlarColumnaGanancia();
        aplicarPermisos();

        await hidratarProductosDesdeIndexedDB();

    },100);

}

    return {

    desbloquearSistema,
    cerrarModalCodigo,
    pedirAutorizacionAdmin,
    validarCodigoAdmin,
    aplicarPermisos,
    cerrarSesion,
    completarInicioSesion

};

}