// =====================================================
// DIGITAL CENTER M&A
// SUCURSALES MOBILE SERVICE
// FASE M5.3
// =====================================================

import {
    mobileDB,
    collection,
    getDocs
} from "../firebase-mobile.js";


const SUCURSALES_RESPALDO_MOBILE = [

    {
        id:
            "principal",

        nombre:
            "Mercado",

        activa:
            true
    },

    {
        id:
            "sucursal",

        nombre:
            "Peluquería",

        activa:
            true
    }

];


let cacheSucursalesMobile =
    null;

let promesaSucursalesMobile =
    null;


async function consultarSucursalesFirebaseMobile(){

    const snapshot =
        await getDocs(
            collection(
                mobileDB,
                "sucursales"
            )
        );


    const sucursales =
        snapshot.docs
            .map(function(documento){

                const datos =
                    documento.data();


                return {

                    id:
                        documento.id,

                    nombre:
                        String(
                            datos.nombre ||
                            documento.id
                        ).trim(),

                    codigo:
                        String(
                            datos.codigo || ""
                        ).trim(),

                    activa:
                        datos.activa !== false

                };

            })
            .filter(function(sucursal){

                return sucursal.activa;

            })
            .sort(function(a, b){

                return a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

            });


    return sucursales.length > 0
        ? sucursales
        : SUCURSALES_RESPALDO_MOBILE;

}


async function cargarSucursalesMobile(
    opciones = {}
){

    const {
        forzar =
            false
    } = opciones;


    if(
        cacheSucursalesMobile &&
        !forzar
    ){

        return cacheSucursalesMobile;

    }


    if(
        promesaSucursalesMobile &&
        !forzar
    ){

        return promesaSucursalesMobile;

    }


    promesaSucursalesMobile =
        consultarSucursalesFirebaseMobile();


    try{

        cacheSucursalesMobile =
            await promesaSucursalesMobile;


        return cacheSucursalesMobile;

    }finally{

        promesaSucursalesMobile =
            null;

    }

}


function construirMapaSucursalesMobile(
    sucursales = []
){

    const mapa = {};


    sucursales.forEach(
        function(sucursal){

            mapa[sucursal.id] =
                sucursal.nombre;

        }
    );


    if(Object.keys(mapa).length === 0){

        SUCURSALES_RESPALDO_MOBILE
            .forEach(function(sucursal){

                mapa[sucursal.id] =
                    sucursal.nombre;

            });

    }


    return mapa;

}


function limpiarCacheSucursalesMobile(){

    cacheSucursalesMobile =
        null;

    promesaSucursalesMobile =
        null;

}


export {

    cargarSucursalesMobile,

    construirMapaSucursalesMobile,

    limpiarCacheSucursalesMobile

};