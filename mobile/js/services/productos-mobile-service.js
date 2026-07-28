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

    addDoc,

    updateDoc,

    deleteDoc,

    onSnapshot,

    query,

    where,

    serverTimestamp,

    ref,

    uploadBytes,

    getDownloadURL,

    deleteObject

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

        nombreBoleta:
            String(
                datos.nombreBoleta || ""
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

    const nombreBoleta =
        String(
            cambios.nombreBoleta || ""
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

        nombreBoleta,

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

async function existeCodigoProductoMobile(
    codigo
){

    const codigoNormalizado =
        String(
            codigo || ""
        )
            .trim()
            .toLowerCase();


    if(!codigoNormalizado){

        return false;

    }


    /*
     * Primero revisamos el caché Realtime.
     * Esto evita una consulta innecesaria
     * cuando el catálogo ya está cargado.
     */
    const existeEnCache =
        obtenerProductosCacheMobile()
            .some(function(producto){

                return String(
                    producto.codigo || ""
                )
                    .trim()
                    .toLowerCase() ===
                    codigoNormalizado;

            });


    if(existeEnCache){

        return true;

    }


    /*
     * Respaldo directo contra Firebase.
     * Se consulta el código tal como fue ingresado.
     */
    const consulta =
        query(

            collection(
                mobileDB,
                "productos"
            ),

            where(
                "codigo",
                "==",
                String(codigo || "").trim()
            )

        );


    const snapshot =
        await getDocs(
            consulta
        );


    return !snapshot.empty;

}

function validarNuevoProductoMobile(
    datos = {}
){

    const datosBase =
        validarCambiosProductoMobile(
            datos
        );


    const stockPrincipal =
        Number(
            datos.stockPrincipal || 0
        );


    const stockSucursal =
        Number(
            datos.stockSucursal || 0
        );


    if(
        !Number.isFinite(
            stockPrincipal
        ) ||
        stockPrincipal < 0 ||
        !Number.isInteger(
            stockPrincipal
        )
    ){

        throw new Error(
            "El stock de Mercado no es válido."
        );

    }


    if(
        !Number.isFinite(
            stockSucursal
        ) ||
        stockSucursal < 0 ||
        !Number.isInteger(
            stockSucursal
        )
    ){

        throw new Error(
            "El stock de Peluquería no es válido."
        );

    }


    if(
        datosBase.precio <= 0
    ){

        throw new Error(
            "El precio de venta debe ser mayor que cero."
        );

    }


    if(
        datosBase.precioCompra <= 0
    ){

        throw new Error(
            "El precio de compra debe ser mayor que cero."
        );

    }


    if(
        datosBase.precio <
        datosBase.precioCompra
    ){

        throw new Error(
            "El precio de venta no puede ser menor al precio de compra."
        );

    }


    return {

        ...datosBase,

        stockPrincipal,

        stockSucursal,

        stockTotal:
            stockPrincipal +
            stockSucursal

    };

}

async function crearProductoMobile(
    opciones = {}
){

    const {

        datos = {},

        imagen = null,

        usuario = null

    } = opciones;


    let referenciaImagenCreada =
        null;


    try{

        if(
            usuario?.rol !==
            "admin"
        ){

            throw new Error(
                "No tienes permisos para crear productos."
            );

        }


        const datosValidados =
            validarNuevoProductoMobile(
                datos
            );


        const codigoDuplicado =
            await existeCodigoProductoMobile(
                datosValidados.codigo
            );


        if(codigoDuplicado){

            throw new Error(
                `Ya existe un producto con el código ${datosValidados.codigo}.`
            );

        }


        if(
            !(imagen instanceof File)
        ){

            throw new Error(
                "Selecciona una imagen para el producto."
            );

        }


        /*
         * Creamos primero el documento para obtener
         * un ID definitivo para Storage.
         */
        const referenciaProducto =
            await addDoc(

                collection(
                    mobileDB,
                    "productos"
                ),

                {

                    codigo:
                        datosValidados.codigo,

                    producto:
                        datosValidados.producto,

                    categoria:
                        datosValidados.categoria,

                    precioCompra:
                        datosValidados.precioCompra,

                    precio:
                        datosValidados.precio,

                    stock:
                        datosValidados.stockTotal,

                    stockTiendas: {

                        principal:
                            datosValidados.stockPrincipal,

                        sucursal:
                            datosValidados.stockSucursal

                    },

                    imagen:
                        "",

                    creadoEn:
                        serverTimestamp(),

                    actualizadoEn:
                        serverTimestamp(),

                    creadoPor: {

                        uid:
                            String(
                                usuario?.uid || ""
                            ),

                        nombre:
                            String(
                                usuario?.nombreCompleto ||
                                usuario?.nombre ||
                                usuario?.usuario ||
                                usuario?.email ||
                                "Administrador"
                            ).trim(),

                        rol:
                            String(
                                usuario?.rol ||
                                "admin"
                            ).trim()

                    }

                }

            );


        const productoId =
            referenciaProducto.id;


        /*
         * Subimos la imagen usando el ID real
         * del documento recién creado.
         */
        const nombreArchivo =
            limpiarNombreArchivoProductoMobile(
                imagen.name
            );


        const rutaImagen =
            [
                "productos",
                productoId,
                `${Date.now()}-${nombreArchivo}`
            ].join("/");


        referenciaImagenCreada =
            ref(
                mobileStorage,
                rutaImagen
            );


        await uploadBytes(

            referenciaImagenCreada,

            imagen,

            {

                contentType:
                    imagen.type ||
                    "image/jpeg",

                customMetadata: {

                    productoId,

                    origen:
                        "mobile-product-studio"

                }

            }

        );


        const urlImagen =
            await getDownloadURL(
                referenciaImagenCreada
            );


        await updateDoc(

            doc(
                mobileDB,
                "productos",
                productoId
            ),

            {

                imagen:
                    urlImagen,

                actualizadoEn:
                    serverTimestamp()

            }

        );


        return {

            completada:
                true,

            mensaje:
                "Producto creado correctamente.",

            productoId,

            imagen:
                urlImagen

        };

    }catch(error){

        console.error(
            "Error creando producto Mobile:",
            error
        );


        /*
         * Si la imagen alcanzó a subirse pero una operación
         * posterior falló, intentamos eliminarla.
         */
        if(referenciaImagenCreada){

            try{

                await deleteObject(
                    referenciaImagenCreada
                );

            }catch(errorRollback){

                console.warn(
                    "No se pudo eliminar la imagen después del error:",
                    errorRollback
                );

            }

        }


        return {

            completada:
                false,

            mensaje:
                error?.message ||
                "No se pudo crear el producto.",

            error

        };

    }

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


async function eliminarProductoMobile(
    opciones = {}
){

    const {

        producto = null,

        usuario = null

    } = opciones;


    const productoId =
        String(
            producto?.id || ""
        ).trim();


    const nombreProducto =
        String(
            producto?.producto ||
            producto?.nombre ||
            "Producto"
        ).trim();


    const urlImagen =
        String(
            producto?.imagen || ""
        ).trim();


    try{

        /*
         * Seguridad de aplicación.
         * Firestore Rules también deben restringir
         * esta operación exclusivamente a admins.
         */
        if(
            usuario?.rol !==
            "admin"
        ){

            throw new Error(
                "No tienes permisos para eliminar productos."
            );

        }


        if(!productoId){

            throw new Error(
                "No se encontró el identificador del producto."
            );

        }


        /*
         * Eliminamos primero el documento.
         *
         * Esto evita dejar un producto visible
         * con una imagen rota si Firestore falla.
         *
         * Si posteriormente falla la limpieza
         * de Storage, solamente quedará un archivo
         * huérfano, pero el catálogo seguirá íntegro.
         */
        await deleteDoc(

            doc(
                mobileDB,
                "productos",
                productoId
            )

        );


        let imagenEliminada =
            false;

        let advertenciaImagen =
            "";


        /*
         * Limpieza de la imagen en Storage.
         * La URL almacenada puede convertirse
         * directamente en una referencia Storage.
         */
        if(urlImagen){

            try{

                const referenciaImagen =
                    ref(
                        mobileStorage,
                        urlImagen
                    );


                await deleteObject(
                    referenciaImagen
                );


                imagenEliminada =
                    true;

            }catch(errorImagen){

                /*
                 * Una imagen inexistente no debe impedir
                 * que la eliminación del producto finalice.
                 */
                if(
                    errorImagen?.code ===
                    "storage/object-not-found"
                ){

                    imagenEliminada =
                        true;

                }else{

                    advertenciaImagen =
                        "El producto fue eliminado, pero no se pudo limpiar su imagen de Storage.";


                    console.warn(
                        "Producto eliminado, pero falló la limpieza de su imagen:",
                        errorImagen
                    );

                }

            }

        }else{

            imagenEliminada =
                true;

        }


        /*
         * No manipulamos manualmente el caché:
         * onSnapshot retirará el producto
         * automáticamente del catálogo.
         */
        return {

            completada:
                true,

            mensaje:
                advertenciaImagen ||
                `${nombreProducto} fue eliminado correctamente.`,

            productoId,

            imagenEliminada,

            advertencia:
                Boolean(
                    advertenciaImagen
                )

        };

    }catch(error){

        console.error(
            "Error eliminando producto Mobile:",
            error
        );


        return {

            completada:
                false,

            mensaje:
                error?.message ||
                "No se pudo eliminar el producto.",

            productoId,

            imagenEliminada:
                false,

            advertencia:
                false,

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

    actualizarProductoMobile,

    eliminarProductoMobile,

    existeCodigoProductoMobile,

    crearProductoMobile

};