// =====================================================
// DIGITAL CENTER M&A
// ENTERPRISE PERMISSIONS MOBILE
// AUTHORIZATION ENGINE
// FASE S1.5
// =====================================================


// =====================================================
// ROLES SOPORTADOS
// =====================================================

const ROL_ADMIN =
    "admin";

const ROL_VENDEDOR =
    "vendedor";


// =====================================================
// PERMISOS ENTERPRISE
// =====================================================

const PERMISOS_ENTERPRISE_MOBILE = Object.freeze({

    // Dashboard
    DASHBOARD_VER:
        "dashboard.ver",

    METRICAS_VER:
        "metricas.ver",

    // Ventas
    VENTAS_CREAR:
        "ventas.crear",

    VENTAS_VER_HISTORIAL:
        "ventas.historial.ver",

    VENTAS_ANULAR:
        "ventas.anular",

    // Inventario
    INVENTARIO_VER:
        "inventario.ver",

    PRODUCTOS_CREAR:
        "productos.crear",

    PRODUCTOS_EDITAR:
        "productos.editar",

    PRODUCTOS_ELIMINAR:
        "productos.eliminar",

    PRODUCTOS_GESTIONAR:
        "productos.gestionar",

    // Caja
    CAJA_VER:
        "caja.ver",

    CAJA_ABRIR:
        "caja.abrir",

    CAJA_REGISTRAR_GASTO:
        "caja.gasto.crear",

    CAJA_CERRAR:
        "caja.cerrar",

    // Garantías
    GARANTIAS_VER:
        "garantias.ver",

    GARANTIAS_RESOLVER:
        "garantias.resolver",

    // Reportes
    REPORTES_VER:
        "reportes.ver",

    // Configuración
    CONFIGURACION_VER:
        "configuracion.ver",

    // Transferencias
    TRANSFERENCIAS_VER:
        "transferencias.ver",

    TRANSFERENCIAS_CREAR:
        "transferencias.crear"

});


// =====================================================
// MATRIZ DE PERMISOS POR ROL
// =====================================================

const PERMISOS_POR_ROL_MOBILE = Object.freeze({

    [ROL_ADMIN]: Object.freeze([

        PERMISOS_ENTERPRISE_MOBILE.DASHBOARD_VER,

        PERMISOS_ENTERPRISE_MOBILE.METRICAS_VER,

        PERMISOS_ENTERPRISE_MOBILE.VENTAS_CREAR,

        PERMISOS_ENTERPRISE_MOBILE.VENTAS_VER_HISTORIAL,

        PERMISOS_ENTERPRISE_MOBILE.VENTAS_ANULAR,

        PERMISOS_ENTERPRISE_MOBILE.INVENTARIO_VER,

        PERMISOS_ENTERPRISE_MOBILE.PRODUCTOS_CREAR,

        PERMISOS_ENTERPRISE_MOBILE.PRODUCTOS_EDITAR,

        PERMISOS_ENTERPRISE_MOBILE.PRODUCTOS_ELIMINAR,

        PERMISOS_ENTERPRISE_MOBILE.PRODUCTOS_GESTIONAR,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_VER,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_ABRIR,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_REGISTRAR_GASTO,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_CERRAR,

        PERMISOS_ENTERPRISE_MOBILE.GARANTIAS_VER,

        PERMISOS_ENTERPRISE_MOBILE.GARANTIAS_RESOLVER,

        PERMISOS_ENTERPRISE_MOBILE.REPORTES_VER,

        PERMISOS_ENTERPRISE_MOBILE.CONFIGURACION_VER,

        PERMISOS_ENTERPRISE_MOBILE.TRANSFERENCIAS_VER,

        PERMISOS_ENTERPRISE_MOBILE.TRANSFERENCIAS_CREAR

    ]),


    [ROL_VENDEDOR]: Object.freeze([

        PERMISOS_ENTERPRISE_MOBILE.VENTAS_CREAR,

        PERMISOS_ENTERPRISE_MOBILE.VENTAS_VER_HISTORIAL,

        PERMISOS_ENTERPRISE_MOBILE.INVENTARIO_VER,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_VER,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_ABRIR,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_REGISTRAR_GASTO,

        PERMISOS_ENTERPRISE_MOBILE.CAJA_CERRAR,

        PERMISOS_ENTERPRISE_MOBILE.GARANTIAS_VER

    ])

});


// =====================================================
// NORMALIZACIÓN SEGURA
// =====================================================

function normalizarRolPermisosMobile(
    rol
){

    return rol === ROL_ADMIN
        ? ROL_ADMIN
        : ROL_VENDEDOR;

}


// =====================================================
// CONSULTA DE PERMISOS
// =====================================================

function obtenerPermisosPorRolMobile(
    rol
){

    const rolNormalizado =
        normalizarRolPermisosMobile(
            rol
        );


    return (
        PERMISOS_POR_ROL_MOBILE[
            rolNormalizado
        ] || []
    );

}


function tienePermisoEnterpriseMobile(
    usuarioORol,
    permiso
){

    if(
        !permiso ||
        typeof permiso !==
        "string"
    ){

        return false;

    }


    const rol =
        typeof usuarioORol ===
        "string"
            ? usuarioORol
            : usuarioORol?.rol;


    const permisos =
        obtenerPermisosPorRolMobile(
            rol
        );


    return permisos.includes(
        permiso
    );

}


function tieneTodosLosPermisosEnterpriseMobile(
    usuarioORol,
    permisos = []
){

    if(
        !Array.isArray(permisos) ||
        permisos.length === 0
    ){

        return false;

    }


    return permisos.every(
        function(permiso){

            return tienePermisoEnterpriseMobile(
                usuarioORol,
                permiso
            );

        }
    );

}


function tieneAlgunPermisoEnterpriseMobile(
    usuarioORol,
    permisos = []
){

    if(
        !Array.isArray(permisos) ||
        permisos.length === 0
    ){

        return false;

    }


    return permisos.some(
        function(permiso){

            return tienePermisoEnterpriseMobile(
                usuarioORol,
                permiso
            );

        }
    );

}


// =====================================================
// VALIDACIONES DE ROL
// =====================================================

function esAdministradorPermisosMobile(
    usuarioORol
){

    const rol =
        typeof usuarioORol ===
        "string"
            ? usuarioORol
            : usuarioORol?.rol;


    return rol === ROL_ADMIN;

}


function esVendedorPermisosMobile(
    usuarioORol
){

    const rol =
        typeof usuarioORol ===
        "string"
            ? usuarioORol
            : usuarioORol?.rol;


    return rol === ROL_VENDEDOR;

}


// =====================================================
// EXPORTACIÓN
// =====================================================

export {

    ROL_ADMIN,

    ROL_VENDEDOR,

    PERMISOS_ENTERPRISE_MOBILE,

    PERMISOS_POR_ROL_MOBILE,

    obtenerPermisosPorRolMobile,

    tienePermisoEnterpriseMobile,

    tieneTodosLosPermisosEnterpriseMobile,

    tieneAlgunPermisoEnterpriseMobile,

    esAdministradorPermisosMobile,

    esVendedorPermisosMobile

};