// =====================================================
// DIGITAL CENTER M&A
// HTML LOADER MODULE
// FASE 26
// =====================================================

export function crearHTMLLoader(){

    async function obtenerFragmento(ruta){

        const respuesta = await fetch(ruta, {
            method: "GET",
            cache: "no-store"
        });

        if(!respuesta.ok){

            throw new Error(
                `No se pudo cargar el fragmento HTML: ${ruta}. ` +
                `Código HTTP: ${respuesta.status}`
            );

        }

        const html = await respuesta.text();

        if(!html.trim()){

            throw new Error(
                `El fragmento HTML está vacío: ${ruta}`
            );

        }

        return html;

    }

    function obtenerContenedor(selector){

        const contenedor =
            document.querySelector(selector);

        if(!contenedor){

            throw new Error(
                `No existe el contenedor HTML: ${selector}`
            );

        }

        return contenedor;

    }

    async function cargarFragmento(configuracion){

        const {
            nombre,
            ruta,
            selector,
            modo = "replace"
        } = configuracion;

        if(!nombre){

            throw new Error(
                "El fragmento HTML no tiene nombre."
            );

        }

        if(!ruta){

            throw new Error(
                `El fragmento "${nombre}" no tiene ruta.`
            );

        }

        if(!selector){

            throw new Error(
                `El fragmento "${nombre}" no tiene selector de montaje.`
            );

        }

        const contenedor =
            obtenerContenedor(selector);

        const html =
            await obtenerFragmento(ruta);

        switch(modo){

            case "beforebegin":

                contenedor.insertAdjacentHTML(
                    "beforebegin",
                    html
                );

                break;

            case "afterbegin":

                contenedor.insertAdjacentHTML(
                    "afterbegin",
                    html
                );

                break;

            case "beforeend":

                contenedor.insertAdjacentHTML(
                    "beforeend",
                    html
                );

                break;

            case "afterend":

                contenedor.insertAdjacentHTML(
                    "afterend",
                    html
                );

                break;

case "replace":

    contenedor.innerHTML = html;

    break;

case "replace-element":

    contenedor.insertAdjacentHTML(
        "beforebegin",
        html
    );

    contenedor.remove();

    break;

default:

                throw new Error(
                    `Modo de montaje inválido en "${nombre}": ${modo}`
                );

        }

        return {
            nombre,
            ruta,
            selector,
            modo
        };

    }

    async function cargarFragmentos(fragmentos = []){

        if(!Array.isArray(fragmentos)){

            throw new TypeError(
                "La configuración de fragmentos debe ser un arreglo."
            );

        }

        if(fragmentos.length === 0){

            return [];

        }

        const nombresRegistrados =
            new Set();

        fragmentos.forEach(function(fragmento){

            if(
                !fragmento ||
                typeof fragmento !== "object"
            ){

                throw new TypeError(
                    "Existe una configuración de fragmento inválida."
                );

            }

            if(nombresRegistrados.has(fragmento.nombre)){

                throw new Error(
                    `Fragmento HTML duplicado: ${fragmento.nombre}`
                );

            }

            nombresRegistrados.add(
                fragmento.nombre
            );

        });

        const resultados = [];

        /*
         * La carga es secuencial deliberadamente.
         *
         * Así se conserva el orden arquitectónico del DOM
         * cuando un fragmento depende de otro.
         */

        for(const fragmento of fragmentos){

            const resultado =
                await cargarFragmento(fragmento);

            resultados.push(resultado);

        }

        return resultados;

    }

    function validarElementosCriticos(selectores = []){

        if(!Array.isArray(selectores)){

            throw new TypeError(
                "Los selectores críticos deben enviarse como arreglo."
            );

        }

        const faltantes =
            selectores.filter(function(selector){

                return !document.querySelector(selector);

            });

        if(faltantes.length > 0){

            throw new Error(
                "El DOM crítico está incompleto. Faltan: " +
                faltantes.join(", ")
            );

        }

        return true;

    }

    return {

        obtenerFragmento,
        obtenerContenedor,
        cargarFragmento,
        cargarFragmentos,
        validarElementosCriticos

    };

}