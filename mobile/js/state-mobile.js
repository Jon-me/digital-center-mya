// =====================================================
// DIGITAL CENTER M&A
// MOBILE STATE
// FASE M7.2.2
// ESTADO GLOBAL + TIENDA DE VENTA
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
        "mobileSucursalActiva",

    // Tienda seleccionada para realizar la venta.
    tiendaVenta:
        "mobileTiendaVenta"

};


const MobileState = {

    usuarioActual:
        null,

    autenticando:
        false,

    appLista:
        false,

    // Tienda desde la cual se descontará el stock.
    // principal = Mercado
    // sucursal = Peluquería
    tiendaVenta:
        "principal"

};


// =====================================================
// NORMALIZAR TIENDA DE VENTA
// =====================================================

function normalizarTiendaVentaMobile(tienda){

    const valor =
        String(
            tienda || ""
        )
            .trim()
            .toLowerCase();

    if(
        valor === "sucursal" ||
        valor === "peluqueria" ||
        valor === "peluquería"
    ){

        return "sucursal";

    }

    return "principal";

}


// =====================================================
// GUARDAR SESIÓN
// =====================================================

function guardarSesionMobile(usuario){

    const sucursalUsuario =
        normalizarTiendaVentaMobile(
            usuario.sucursalId ||
            "principal"
        );

    /*
     * Conservamos la tienda elegida si ya existe.
     * Si todavía no existe, usamos inicialmente
     * la sucursal asignada al usuario.
     */
    const tiendaGuardada =
        localStorage.getItem(
            CLAVES_SESION_MOBILE.tiendaVenta
        );

    const tiendaVentaInicial =
        tiendaGuardada
            ? normalizarTiendaVentaMobile(
                tiendaGuardada
            )
            : sucursalUsuario;

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
        sucursalUsuario
    );

    localStorage.setItem(
        CLAVES_SESION_MOBILE.tiendaVenta,
        tiendaVentaInicial
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
            sucursalUsuario

    };

    MobileState.tiendaVenta =
        tiendaVentaInicial;

}


// =====================================================
// OBTENER SESIÓN
// =====================================================

function obtenerSesionMobile(){

    const sesionActiva =
        localStorage.getItem(
            CLAVES_SESION_MOBILE.sesion
        ) === "activa";

    if(!sesionActiva){

        return null;

    }

    const sucursalUsuario =
        normalizarTiendaVentaMobile(
            localStorage.getItem(
                CLAVES_SESION_MOBILE.sucursal
            ) || "principal"
        );

    const tiendaVenta =
        normalizarTiendaVentaMobile(
            localStorage.getItem(
                CLAVES_SESION_MOBILE.tiendaVenta
            ) ||
            sucursalUsuario
        );

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
            sucursalUsuario

    };

    MobileState.usuarioActual =
        usuario;

    MobileState.tiendaVenta =
        tiendaVenta;

    localStorage.setItem(
        CLAVES_SESION_MOBILE.tiendaVenta,
        tiendaVenta
    );

    return usuario;

}


// =====================================================
// LIMPIAR SESIÓN
// =====================================================

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

    MobileState.tiendaVenta =
        "principal";

}


// =====================================================
// OBTENER ROL
// =====================================================

function obtenerRolMobile(){

    return (
        MobileState.usuarioActual?.rol ||
        localStorage.getItem(
            CLAVES_SESION_MOBILE.rol
        ) ||
        ""
    );

}


// =====================================================
// OBTENER SUCURSAL ASIGNADA AL USUARIO
// =====================================================

function obtenerSucursalMobile(){

    return (
        MobileState.usuarioActual?.sucursalId ||
        localStorage.getItem(
            CLAVES_SESION_MOBILE.sucursal
        ) ||
        "principal"
    );

}


// =====================================================
// CAMBIAR TIENDA DE VENTA
// =====================================================

function cambiarTiendaVentaMobile(tienda){

    const tiendaNormalizada =
        normalizarTiendaVentaMobile(
            tienda
        );

    MobileState.tiendaVenta =
        tiendaNormalizada;

    localStorage.setItem(
        CLAVES_SESION_MOBILE.tiendaVenta,
        tiendaNormalizada
    );

    return tiendaNormalizada;

}


// =====================================================
// OBTENER TIENDA DE VENTA
// =====================================================

function obtenerTiendaVentaMobile(){

    const tienda =
        normalizarTiendaVentaMobile(
            MobileState.tiendaVenta ||
            localStorage.getItem(
                CLAVES_SESION_MOBILE.tiendaVenta
            ) ||
            obtenerSucursalMobile()
        );

    MobileState.tiendaVenta =
        tienda;

    return tienda;

}


// =====================================================
// OBTENER NOMBRE VISIBLE DE LA TIENDA
// =====================================================

function obtenerNombreTiendaVentaMobile(){

    return obtenerTiendaVentaMobile() ===
        "sucursal"
            ? "Peluquería"
            : "Mercado";

}


// =====================================================
// EXPORTACIONES
// =====================================================

export {

    MobileState,

    CLAVES_SESION_MOBILE,

    guardarSesionMobile,

    obtenerSesionMobile,

    limpiarSesionMobile,

    obtenerRolMobile,

    obtenerSucursalMobile,

    cambiarTiendaVentaMobile,

    obtenerTiendaVentaMobile,

    obtenerNombreTiendaVentaMobile,

    normalizarTiendaVentaMobile

};