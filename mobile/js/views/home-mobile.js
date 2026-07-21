// =====================================================
// DIGITAL CENTER M&A
// MOBILE HOME VIEW
// FASE M4.1
// =====================================================

import {
    cargarFragmentoMobile
} from "../html-loader-mobile.js";


let cargada =
    false;


export async function renderHomeMobile(
    contexto
){

    const {

        contenedor,

        usuario

    } = contexto;


    if(!cargada){

        await cargarFragmentoMobile(
            "./html/home-mobile.html?v=M4-1",
            "#mobileViewInicio"
        );

        cargada =
            true;

    }


    const primerNombre =
        String(
            usuario?.nombreCompleto ||
            usuario?.usuario ||
            "Usuario"
        )
            .trim()
            .split(/\s+/)[0];


    const saludo =
        contenedor.querySelector(
            ".mobile-card-title"
        );

    if(saludo){

        saludo.textContent =
            "Hola, " +
            primerNombre;

    }


    const badge =
        contenedor.querySelector(
            ".mobile-badge"
        );

    if(badge){

        badge.textContent =
            usuario?.rol === "admin"
                ? "Administrador"
                : "Vendedor";

    }

}


export function reiniciarHomeMobile(){

    cargada =
        false;

}