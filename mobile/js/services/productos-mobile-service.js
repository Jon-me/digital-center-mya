// =====================================================
// DIGITAL CENTER M&A
// PRODUCTOS MOBILE SERVICE
// FASE M5.3
// =====================================================

import {

    mobileDB,

    mobileStorage,

    collection,

    doc,

    getDocs,

    updateDoc,

    onSnapshot,

    serverTimestamp,

    ref,

    uploadBytes,

    getDownloadURL

} from "../firebase-mobile.js";


let cacheProductosMobile =
    null;

let promesaProductosMobile =
    null;

let cancelarSuscripcionProductosMobile =
    null;    

const suscriptoresProductosMobile =
    new Set();    

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

function construirProductosDesdeSnapshotMobile(
    snapshot
){

    const productos =
        snapshot.docs.map(
            normalizarProductoMobile
        );


    return ordenarProductosMobile(
        productos
    );

}

async function consultarProductosFirebaseMobile(){

    const snapshot =
        await getDocs(
            collection(
                mobileDB,
                "productos"
            )
        );


return construirProductosDesdeSnapshotMobile(
    snapshot
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

function suscribirProductosMobile(
    alActualizar,
    alError
){

    const suscriptor = {

        alActualizar,

        alError

    };


    suscriptoresProductosMobile.add(
        suscriptor
    );


    if(
        cacheProductosMobile &&
        typeof alActualizar ===
        "function"
    ){

        alActualizar(
            cacheProductosMobile
        );

    }


    iniciarListenerProductosMobile();


    return function cancelar(){

        suscriptoresProductosMobile.delete(
            suscriptor
        );


        if(
            suscriptoresProductosMobile.size ===
            0
        ){

            destruirSuscripcionProductosMobile();

        }

    };

}

function iniciarListenerProductosMobile(){

    if(
        typeof cancelarSuscripcionProductosMobile ===
        "function"
    ){

        return;

    }


    const productosRef =
        collection(
            mobileDB,
            "productos"
        );


    cancelarSuscripcionProductosMobile =
        onSnapshot(

            productosRef,

            function(snapshot){

                const productos =
                    construirProductosDesdeSnapshotMobile(
                        snapshot
                    );


                cacheProductosMobile =
                    productos;


                suscriptoresProductosMobile
                    .forEach(function(suscriptor){

                        if(
                            typeof suscriptor
                                .alActualizar ===
                            "function"
                        ){

                            suscriptor
                                .alActualizar(
                                    productos
                                );

                        }

                    });

            },

            function(error){

                console.error(
                    "Error escuchando productos móviles:",
                    error
                );


                suscriptoresProductosMobile
                    .forEach(function(suscriptor){

                        if(
                            typeof suscriptor
                                .alError ===
                            "function"
                        ){

                            suscriptor
                                .alError(
                                    error
                                );

                        }

                    });

            }

        );

}

function destruirSuscripcionProductosMobile(){

    if(
        typeof cancelarSuscripcionProductosMobile ===
        "function"
    ){

        cancelarSuscripcionProductosMobile();

    }


    cancelarSuscripcionProductosMobile =
        null;

}

function limpiarNombreArchivoProductoMobile(
    nombre
){

    const nombreSeguro =
        String(
            nombre || "imagen"
        )
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9._-]+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-|-$|^\.+/g,
                ""
            );


    return (
        nombreSeguro ||
        "imagen-producto"
    );

}



async function subirImagenProductoMobile({
    productoId,
    archivo
}){

    if(
        !productoId ||
        !(archivo instanceof File)
    ){

        return "";

    }


    if(
        !String(
            archivo.type || ""
        ).startsWith(
            "image/"
        )
    ){

        throw new Error(
            "El archivo seleccionado no es una imagen válida."
        );

    }


    const limiteBytes =
        5 * 1024 * 1024;


    if(
        Number(
            archivo.size || 0
        ) >
        limiteBytes
    ){

        throw new Error(
            "La imagen supera el límite de 5 MB."
        );

    }


    const nombreArchivo =
        limpiarNombreArchivoProductoMobile(
            archivo.name
        );


    const ruta =
        [
            "productos",
            productoId,
            `${Date.now()}-${nombreArchivo}`
        ].join("/");


    const referenciaImagen =
        ref(
            mobileStorage,
            ruta
        );


    await uploadBytes(

        referenciaImagen,

        archivo,

        {

            contentType:
                archivo.type ||

                "image/jpeg",

            customMetadata: {

                productoId:
                    String(
                        productoId
                    ),

                origen:
                    "mobile-product-editor"

            }

        }

    );


    return await getDownloadURL(
        referenciaImagen
    );

}



function validarCambiosProductoMobile(
    cambios = {}
){

    const codigo =
        String(
            cambios.codigo || ""
        ).trim();

    const producto =
        String(
            cambios.producto || ""
        ).trim();

    const categoria =
        String(
            cambios.categoria || ""
        ).trim();

    const precioCompra =
        Number(
            cambios.precioCompra
        );

    const precio =
        Number(
            cambios.precio
        );


    if(!codigo){

        throw new Error(
            "El código del producto es obligatorio."
        );

    }


    if(!producto){

        throw new Error(
            "El nombre del producto es obligatorio."
        );

    }


    if(!categoria){

        throw new Error(
            "La categoría del producto es obligatoria."
        );

    }


    if(
        !Number.isFinite(
            precioCompra
        ) ||
        precioCompra < 0
    ){

        throw new Error(
            "El precio de compra no es válido."
        );

    }


    if(
        !Number.isFinite(
            precio
        ) ||
        precio < 0
    ){

        throw new Error(
            "El precio de venta no es válido."
        );

    }


    return {

        codigo,

        producto,

        categoria,

        precioCompra:
            Math.round(
                precioCompra * 100
            ) / 100,

        precio:
            Math.round(
                precio * 100
            ) / 100

    };

}



async function actualizarProductoMobile(
    opciones = {}
){

    const {

        producto = null,

        cambios = {},

        imagen = null,

        usuario = null

    } = opciones;


    const productoId =
        String(
            producto?.id || ""
        ).trim();


    if(!productoId){

        return {

            completada:
                false,

            mensaje:
                "No se encontró el identificador del producto.",

            error:
                null

        };

    }


    try{

        const datosActualizados =
            validarCambiosProductoMobile(
                cambios
            );


        let urlImagen =
            String(
                producto?.imagen || ""
            ).trim();


        if(
            imagen instanceof File
        ){

            urlImagen =
                await subirImagenProductoMobile({

                    productoId,

                    archivo:
                        imagen

                });

        }


        const referenciaProducto =
            doc(

                mobileDB,

                "productos",

                productoId

            );


        const datosFirestore = {

            ...datosActualizados,

            imagen:
                urlImagen,

            actualizadoEn:
                serverTimestamp(),

            actualizadoPor: {

                uid:
                    String(
                        usuario?.uid || ""
                    ),

                nombre:
                    String(
                        usuario?.nombre ||
                        usuario?.displayName ||
                        usuario?.email ||
                        "Administrador"
                    ).trim(),

                rol:
                    String(
                        usuario?.rol ||
                        "admin"
                    ).trim()

            }

        };


        await updateDoc(

            referenciaProducto,

            datosFirestore

        );


        /*
         * No modificamos directamente el catálogo.
         * onSnapshot recibirá la versión actualizada
         * desde Firestore y reconstruirá el caché.
         */
        return {

            completada:
                true,

            mensaje:
                "Producto actualizado correctamente.",

            productoId,

            imagenActualizada:
                imagen instanceof File,

            imagen:
                urlImagen

        };

    }catch(error){

        console.error(
            "Error actualizando producto Mobile:",
            error
        );


        return {

            completada:
                false,

            mensaje:
                error?.message ||
                "No se pudo actualizar el producto.",

            error

        };

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

    suscribirProductosMobile,

    destruirSuscripcionProductosMobile,

    obtenerProductosCacheMobile,

    limpiarCacheProductosMobile,

    actualizarProductoMobile

};