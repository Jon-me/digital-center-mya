// =====================================================
// DIGITAL CENTER M&A
// MOBILE PERMISSIONS BRIDGE
// ENTERPRISE AUTHORIZATION ENGINE
// FASE S1.5
// =====================================================

import {

    PERMISOS_ENTERPRISE_MOBILE,

    tienePermisoEnterpriseMobile

} from "./services/enterprise-permissions-mobile.js";


// =====================================================
// RUTAS POR ROL
// =====================================================

const RUTAS_MOBILE_POR_ROL = Object.freeze({

    admin: Object.freeze([
        "inicio",
        "ventas",
        "inventario",
        "productstudio",
        "productnew",
        "caja",
        "reportes",
        "historial",
        "mas",
        "garantias"
    ]),

    vendedor: Object.freeze([
        "inicio",
        "ventas",
        "inventario",
        "caja",
        "historial",
        "mas",
        "garantias"
    ])

});


// =====================================================
// COMPATIBILIDAD CON PERMISOS HTML ANTIGUOS
// =====================================================

const MAPA_PERMISOS_LEGACY_MOBILE = Object.freeze({

    "ver-metricas":
        PERMISOS_ENTERPRISE_MOBILE.METRICAS_VER,

    "crear-venta":
        PERMISOS_ENTERPRISE_MOBILE.VENTAS_CREAR,

    "ver-inventario":
        PERMISOS_ENTERPRISE_MOBILE.INVENTARIO_VER,

    "gestionar-productos":
        PERMISOS_ENTERPRISE_MOBILE.PRODUCTOS_GESTIONAR,

    "ver-caja":
        PERMISOS_ENTERPRISE_MOBILE.CAJA_VER,

    "ver-garantias":
        PERMISOS_ENTERPRISE_MOBILE.GARANTIAS_VER,

    "ver-reportes":
        PERMISOS_ENTERPRISE_MOBILE.REPORTES_VER,

    "ver-dashboard":
        PERMISOS_ENTERPRISE_MOBILE.DASHBOARD_VER,

    "ver-configuracion":
        PERMISOS_ENTERPRISE_MOBILE.CONFIGURACION_VER,

    "ver-transferencias":
        PERMISOS_ENTERPRISE_MOBILE.TRANSFERENCIAS_VER

});


// =====================================================
// NORMALIZACIÓN SEGURA DE ROL
// =====================================================

function normalizarRolMobile(
    rol
){

    return rol === "admin"
        ? "admin"
        : "vendedor";

}


// =====================================================
// RESOLVER PERMISO LEGACY O ENTERPRISE
// =====================================================

function resolverPermisoMobile(
    accion
){

    if(
        !accion ||
        typeof accion !==
        "string"
    ){

        return null;

    }


    return (
        MAPA_PERMISOS_LEGACY_MOBILE[
            accion
        ] ||
        accion
    );

}


// =====================================================
// CONSULTA DE PERMISOS
// =====================================================

function tienePermisoMobile(
    usuarioORol,
    accion
){

    const permisoEnterprise =
        resolverPermisoMobile(
            accion
        );


    if(!permisoEnterprise){

        return false;

    }


    return tienePermisoEnterpriseMobile(
        usuarioORol,
        permisoEnterprise
    );

}


// =====================================================
// NAVEGACIÓN
// =====================================================

function puedeNavegarMobile(
    usuarioORol,
    ruta
){

    if(
        !ruta ||
        typeof ruta !==
        "string"
    ){

        return false;

    }


    const rol =
        typeof usuarioORol ===
        "string"
            ? usuarioORol
            : usuarioORol?.rol;


    const rolNormalizado =
        normalizarRolMobile(
            rol
        );


    const rutas =
        RUTAS_MOBILE_POR_ROL[
            rolNormalizado
        ] || [];


    return rutas.includes(
        ruta
    );

}


// =====================================================
// APLICAR PERMISOS EN INTERFAZ
// =====================================================

function aplicarPermisosMobile(
    usuario
){

    const rol =
        normalizarRolMobile(
            usuario?.rol
        );


    document.body.classList.remove(
        "mobile-rol-admin",
        "mobile-rol-vendedor"
    );


    document.body.classList.add(
        "mobile-rol-" + rol
    );


    document
        .querySelectorAll(
            "[data-mobile-permission]"
        )
        .forEach(function(elemento){

            const accion =
                elemento.dataset
                    .mobilePermission;


            const permitido =
                tienePermisoMobile(
                    usuario,
                    accion
                );


            elemento.hidden =
                !permitido;


            elemento.setAttribute(
                "aria-hidden",
                permitido
                    ? "false"
                    : "true"
            );


            if(
                "disabled" in elemento
            ){

                elemento.disabled =
                    !permitido;

            }

        });


    document
        .querySelectorAll(
            "[data-mobile-role]"
        )
        .forEach(function(elemento){

            const rolesPermitidos =
                String(
                    elemento.dataset
                        .mobileRole || ""
                )
                .split(",")
                .map(function(item){

                    return normalizarRolMobile(
                        item.trim()
                    );

                })
                .filter(Boolean);


            const permitido =
                rolesPermitidos.includes(
                    rol
                );


            elemento.hidden =
                !permitido;


            elemento.setAttribute(
                "aria-hidden",
                permitido
                    ? "false"
                    : "true"
            );

        });

}


// =====================================================
// EXPORTACIÓN
// =====================================================

export {

    RUTAS_MOBILE_POR_ROL,

    MAPA_PERMISOS_LEGACY_MOBILE,

    resolverPermisoMobile,

    tienePermisoMobile,

    puedeNavegarMobile,

    aplicarPermisosMobile

};