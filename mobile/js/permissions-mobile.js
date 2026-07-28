// =====================================================
// DIGITAL CENTER M&A
// MOBILE PERMISSIONS
// FASE M3.5
// =====================================================

const RUTAS_MOBILE_POR_ROL = {

    admin: [
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
    ],

    vendedor: [
        "inicio",
        "ventas",
        "inventario",
        "caja",
        "historial",
        "mas",
        "garantias"
    ]

};


const ACCIONES_MOBILE_POR_ROL = {

    admin: [
        "ver-metricas",
        "crear-venta",
        "ver-inventario",
        "gestionar-productos",
        "ver-caja",
        "ver-garantias",
        "ver-reportes",
        "ver-dashboard",
        "ver-configuracion",
        "ver-transferencias"
    ],

    vendedor: [
        "crear-venta",
        "ver-inventario",
        "ver-caja",
        "ver-garantias"
    ]

};


function tienePermisoMobile(
    rol,
    accion
){

    const permisos =
        ACCIONES_MOBILE_POR_ROL[
            rol
        ] || [];

    return permisos.includes(
        accion
    );

}


function puedeNavegarMobile(
    rol,
    ruta
){

    const rutas =
        RUTAS_MOBILE_POR_ROL[
            rol
        ] || [];

    return rutas.includes(
        ruta
    );

}


function aplicarPermisosMobile(
    usuario
){

    const rol =
        usuario?.rol ||
        "vendedor";

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

            const permiso =
                elemento.dataset
                    .mobilePermission;

            const permitido =
                tienePermisoMobile(
                    rol,
                    permiso
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

                    return item.trim();

                })
                .filter(Boolean);

            elemento.hidden =
                !rolesPermitidos.includes(
                    rol
                );

        });

}


export {

    RUTAS_MOBILE_POR_ROL,

    ACCIONES_MOBILE_POR_ROL,

    tienePermisoMobile,

    puedeNavegarMobile,

    aplicarPermisosMobile

};