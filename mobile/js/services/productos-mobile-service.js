// =====================================================
// DIGITAL CENTER M&A
// PRODUCTOS MOBILE SERVICE
// FASE M5.3
// =====================================================

import {
    mobileDB,
    collection,
    getDocs
} from "../firebase-mobile.js";


let cacheProductosMobile =
    null;

let promesaProductosMobile =
    null;


function normalizarStockProductoMobile(
    producto
){

    const stockTiendasOriginal =
        producto?.stockTiendas &&
        typeof producto.stockTiendas === "object"
            ? producto.stockTiendas
            : {};


    const stockTiendas = {};


    Object
        .entries(
            stockTiendasOriginal
        )
        .forEach(function([
            sucursalId,
            cantidad
        ]){

            stockTiendas[sucursalId] =
                Number(cantidad || 0);

        });


    /*
     * Compatibilidad con productos antiguos.
     * Si todavía no tienen stockTiendas,
     * colocamos el stock general en principal.
     */
    if(
        Object.keys(stockTiendas).length === 0 &&
        Number(producto?.stock || 0) > 0
    ){

        stockTiendas.principal =
            Number(producto.stock || 0);

    }


    return stockTiendas;

}


function normalizarProductoMobile(
    documento
){

    const datos =
        documento.data();


    return {

        id:
            documento.id,

        codigo:
            String(
                datos.codigo || ""
            ).trim(),

        producto:
            String(
                datos.producto ||
                datos.nombre ||
                "Producto sin nombre"
            ).trim(),

        categoria:
            String(
                datos.categoria ||
                "Sin categoría"
            ).trim(),

        precio:
            Number(
                datos.precio ||
                datos.precioVenta ||
                0
            ),

        precioCompra:
            Number(
                datos.precioCompra || 0
            ),

        imagen:
            String(
                datos.imagen || ""
            ).trim(),

        stock:
            Number(
                datos.stock || 0
            ),

        stockTiendas:
            normalizarStockProductoMobile(
                datos
            )

    };

}


function ordenarProductosMobile(
    productos
){

    return [...productos]
        .sort(function(a, b){

            const codigoA =
                String(a.codigo || "");

            const codigoB =
                String(b.codigo || "");


            const comparacionCodigo =
                codigoA.localeCompare(
                    codigoB,
                    "es",
                    {
                        numeric:
                            true,

                        sensitivity:
                            "base"
                    }
                );


            if(comparacionCodigo !== 0){

                return comparacionCodigo;

            }


            return String(
                a.producto || ""
            )
                .localeCompare(
                    String(
                        b.producto || ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

        });

}


async function consultarProductosFirebaseMobile(){

    const snapshot =
        await getDocs(
            collection(
                mobileDB,
                "productos"
            )
        );


    const productos =
        snapshot.docs.map(
            normalizarProductoMobile
        );


    return ordenarProductosMobile(
        productos
    );

}


async function cargarProductosMobile(
    opciones = {}
){

    const {
        forzar =
            false
    } = opciones;


    if(
        cacheProductosMobile &&
        !forzar
    ){

        return cacheProductosMobile;

    }


    if(
        promesaProductosMobile &&
        !forzar
    ){

        return promesaProductosMobile;

    }


    promesaProductosMobile =
        consultarProductosFirebaseMobile();


    try{

        cacheProductosMobile =
            await promesaProductosMobile;


        return cacheProductosMobile;

    }finally{

        promesaProductosMobile =
            null;

    }

}


function obtenerProductosCacheMobile(){

    return cacheProductosMobile || [];

}


function limpiarCacheProductosMobile(){

    cacheProductosMobile =
        null;

    promesaProductosMobile =
        null;

}


export {

    cargarProductosMobile,

    obtenerProductosCacheMobile,

    limpiarCacheProductosMobile

};