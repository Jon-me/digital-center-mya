// =====================================================
// DIGITAL CENTER M&A
// BOOTSTRAP MODULE
// FASE 13
// =====================================================

export function crearBootstrap(deps){

    const {

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
    inicializarMenuCategorias,
    inicializarOnMessage

} = deps;

    function sesionActiva(){

    return localStorage.getItem("sesion") === "activa";

}

function restaurarSesion(){

    if(!sesionActiva()){
        return false;
    }

    document.getElementById("login").style.display = "none";
    document.getElementById("sistema").style.display = "block";

    apagarSonidoLogin();

    document.body.classList.remove("rol-admin", "rol-vendedor");
    document.body.classList.add(
        "rol-" + localStorage.getItem("rolActivo")
    );

    let dashboard = document.getElementById("dashboardAdmin");

    if(dashboard){

        dashboard.style.display =
            localStorage.getItem("rolActivo") === "vendedor"
                ? "none"
                : "grid";

    }

    mostrarCarrito();

    controlarColumnaGanancia();

    aplicarPermisos();

    desbloquearSistema();

    iniciarListenersFirebase();

    setTimeout(async function(){

        await hidratarProductosDesdeIndexedDB();

    }, 300);

    return true;

}

function inicializarEventosLogin(){

    let descuentoInput =
        document.getElementById("descuentoVenta");

    [
        "pagoEfectivo",
        "pagoYape",
        "pagoPlin",
        "pagoTarjeta",
        "pagoTransferencia"
    ].forEach(function(id){

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

    let inputUsuario =
        document.getElementById("usuario");

    let inputPassword =
        document.getElementById("password");

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

}

function inicializarPageshow(){

    window.addEventListener("pageshow", function(){

        limpiarDescuentoSiCarritoVacio();

    });

}

function iniciarAplicacion(){

    inicializarEventosLogin();

    inicializarPageshow();

    inicializarMenuCategorias();

    inicializarOnMessage();

    if(!restaurarSesion()){

        document.getElementById("login").style.display = "block";
        document.getElementById("sistema").style.display = "none";
        document.getElementById("btnSonido").style.display = "block";

        desbloquearSistema();

    }

}

    return {

    sesionActiva,
    restaurarSesion,
    inicializarEventosLogin,
    inicializarPageshow,
    iniciarAplicacion

};

}