// =====================================================
// DIGITAL CENTER M&A
// BOOTSTRAP MODULE
// FASE 13
// =====================================================

export function crearBootstrap(deps){

    const {

    localStorage,

    FirebaseAuthService,

    db,
    doc,
    getDoc,

    completarInicioSesion,

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

async function restaurarSesion(){

    const usuarioFirebase =
        await FirebaseAuthService
            .esperarUsuarioAutenticado();

    if(!usuarioFirebase){

        return false;

    }

    const correo =
        usuarioFirebase.email || "";

    const usuarioDocumento =
        correo
            .split("@")[0]
            .trim();

    const nombreDocumento =
        usuarioDocumento
            .charAt(0)
            .toUpperCase() +
        usuarioDocumento.slice(1);

    const usuarioRef =
        doc(
            db,
            "usuarios",
            nombreDocumento
        );

    const usuarioSnap =
        await getDoc(usuarioRef);

    if(!usuarioSnap.exists()){

        console.error(
            "No existe el perfil Firestore:",
            nombreDocumento
        );

        await FirebaseAuthService.cerrarSesion();

        return false;

    }

    const usuarioEncontrado =
        usuarioSnap.data();

    if(
        !usuarioEncontrado.uid ||
        usuarioEncontrado.uid !== usuarioFirebase.uid
    ){

        console.error(
            "UID incompatible al restaurar sesión:",
            {
                uidAuthentication:
                    usuarioFirebase.uid,

                uidFirestore:
                    usuarioEncontrado.uid
            }
        );

        await FirebaseAuthService.cerrarSesion();

        return false;

    }

    completarInicioSesion(
        usuarioEncontrado
    );

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

async function iniciarAplicacion(){

    inicializarEventosLogin();

    inicializarPageshow();

    inicializarMenuCategorias();

    inicializarOnMessage();

    if(!await restaurarSesion()){

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