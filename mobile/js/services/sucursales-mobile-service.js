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

import {
    normalizarTiendaVentaMobile
} from "../state-mobile.js";


const SUCURSALES_RESPALDO_MOBILE = [

    {
        id:
            "mercado",

        nombre:
            "Mercado",

        activa:
            true
    },

    {
        id:
            "peluqueria",

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

                const idNormalizado =
                    normalizarTiendaVentaMobile(
                        documento.id
                    );

                return {

                    id:
                        idNormalizado,

                    nombre:
                        idNormalizado ===
                        "peluqueria"
                            ? "Peluquería"
                            : "Mercado",

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

const sucursalesUnicas =
    Array.from(
        new Map(
            sucursales.map(
                function(sucursal){

                    return [
                        sucursal.id,
                        sucursal
                    ];

                }
            )
        ).values()
    );


    return sucursalesUnicas.length > 0
        ? sucursalesUnicas
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