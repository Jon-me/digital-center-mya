// =====================================================
// DIGITAL CENTER M&A
// MOBILE STATE
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

    // Tienda seleccionada para realizar la venta.
    tiendaVenta:
        "mobileTiendaVenta"

};


// =====================================================
// ESTADO GLOBAL
// =====================================================

const MobileState = {

    usuarioActual:
        null,

    autenticando:
        false,

    appLista:
        false,

    // IDs canónicos:
    // mercado     = Mercado
    // peluqueria  = Peluquería
    tiendaVenta:
        "mercado"

};


// =====================================================
// NORMALIZAR TIENDA
// =====================================================

function normalizarTiendaVentaMobile(tienda){

    const valor =
        String(
            tienda || ""
        )
            .trim()
            .toLowerCase();

    /*
     * =================================================
     * COMPATIBILIDAD LEGACY
     * =================================================
     *
     * principal  -> mercado
     * sucursal   -> peluqueria
     *
     * También aceptamos nombres visibles antiguos.
     */

    if(
        valor === "peluqueria" ||
        valor === "peluquería" ||
        valor === "sucursal"
    ){

        return "peluqueria";

    }

    if(
        valor === "mercado" ||
        valor === "principal"
    ){

        return "mercado";

    }

    /*
     * Fallback seguro.
     *
     * Si llega un valor vacío o desconocido,
     * la tienda predeterminada es Mercado.
     */

    return "mercado";

}


// =====================================================
// GUARDAR SESIÓN
// =====================================================

function guardarSesionMobile(usuario){

    /*
     * Conservamos la tienda elegida si ya existe.
     *
     * normalizarTiendaVentaMobile() también migra
     * automáticamente valores legacy guardados en
     * localStorage:
     *
     * principal -> mercado
     * sucursal  -> peluqueria
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
            : "mercado";

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

    const tiendaVenta =
        normalizarTiendaVentaMobile(
            localStorage.getItem(
                CLAVES_SESION_MOBILE.tiendaVenta
            ) ||
            "mercado"
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
            ) || "vendedor"

    };

    MobileState.usuarioActual =
        usuario;

    MobileState.tiendaVenta =
        tiendaVenta;

    /*
     * Reescribimos los valores normalizados.
     *
     * Esto migra silenciosamente sesiones antiguas
     * almacenadas como principal/sucursal.
     */

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
        "mercado";

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
            "mercado"
        );

    MobileState.tiendaVenta =
        tienda;

    /*
     * Garantizamos que localStorage también quede
     * usando siempre el ID canónico.
     */

    localStorage.setItem(
        CLAVES_SESION_MOBILE.tiendaVenta,
        tienda
    );

    return tienda;

}


// =====================================================
// OBTENER NOMBRE VISIBLE DE LA TIENDA
// =====================================================

function obtenerNombreTiendaVentaMobile(){

    return obtenerTiendaVentaMobile() ===
        "peluqueria"
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

    cambiarTiendaVentaMobile,

    obtenerTiendaVentaMobile,

    obtenerNombreTiendaVentaMobile,

    normalizarTiendaVentaMobile

};