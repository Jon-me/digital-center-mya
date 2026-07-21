// =====================================================
// DIGITAL CENTER M&A
// MOBILE STATE
// FASE M3.2
// =====================================================

const CLAVES_SESION_MOBILE = {

    sesion:
        "mobileSesion",

    usuario:
        "mobileUsuarioActivo",

    nombre:
        "mobileNombreActivo",

    rol:
        "mobileRolActivo",

    sucursal:
        "mobileSucursalActiva"

};


const MobileState = {

    usuarioActual:
        null,

    autenticando:
        false,

    appLista:
        false

};


function guardarSesionMobile(usuario){

    localStorage.setItem(
        CLAVES_SESION_MOBILE.sesion,
        "activa"
    );

    localStorage.setItem(
        CLAVES_SESION_MOBILE.usuario,
        usuario.usuario || ""
    );

    localStorage.setItem(
        CLAVES_SESION_MOBILE.nombre,
        usuario.nombreCompleto ||
        usuario.usuario ||
        "Usuario"
    );

    localStorage.setItem(
        CLAVES_SESION_MOBILE.rol,
        usuario.rol || "vendedor"
    );

    localStorage.setItem(
        CLAVES_SESION_MOBILE.sucursal,
        usuario.sucursalId ||
        "principal"
    );

    MobileState.usuarioActual = {

        usuario:
            usuario.usuario || "",

        nombreCompleto:
            usuario.nombreCompleto ||
            usuario.usuario ||
            "Usuario",

        rol:
            usuario.rol || "vendedor",

        sucursalId:
            usuario.sucursalId ||
            "principal"

    };

}


function obtenerSesionMobile(){

    const sesionActiva =
        localStorage.getItem(
            CLAVES_SESION_MOBILE.sesion
        ) === "activa";

    if(!sesionActiva){

        return null;

    }

    const usuario = {

        usuario:
            localStorage.getItem(
                CLAVES_SESION_MOBILE.usuario
            ) || "",

        nombreCompleto:
            localStorage.getItem(
                CLAVES_SESION_MOBILE.nombre
            ) || "Usuario",

        rol:
            localStorage.getItem(
                CLAVES_SESION_MOBILE.rol
            ) || "vendedor",

        sucursalId:
            localStorage.getItem(
                CLAVES_SESION_MOBILE.sucursal
            ) || "principal"

    };

    MobileState.usuarioActual =
        usuario;

    return usuario;

}


function limpiarSesionMobile(){

    Object
        .values(
            CLAVES_SESION_MOBILE
        )
        .forEach(function(clave){

            localStorage.removeItem(
                clave
            );

        });

    MobileState.usuarioActual =
        null;

}


function obtenerRolMobile(){

    return (
        MobileState.usuarioActual?.rol ||
        localStorage.getItem(
            CLAVES_SESION_MOBILE.rol
        ) ||
        ""
    );

}


function obtenerSucursalMobile(){

    return (
        MobileState.usuarioActual?.sucursalId ||
        localStorage.getItem(
            CLAVES_SESION_MOBILE.sucursal
        ) ||
        "principal"
    );

}


export {

    MobileState,

    CLAVES_SESION_MOBILE,

    guardarSesionMobile,

    obtenerSesionMobile,

    limpiarSesionMobile,

    obtenerRolMobile,

    obtenerSucursalMobile

};