// =====================================================
// DIGITAL CENTER M&A
// HTML LOADER MODULE
// FASE 26
// =====================================================

export function crearHTMLLoader(configuracion = {}){

    const {
        directorioBase = "html",
        version = "",
        modoPredeterminado = "replace-element"
    } = configuracion;

    const fragmentosRegistrados = [];

    function construirRuta(nombre, rutaPersonalizada = ""){

        const rutaBase =
            rutaPersonalizada ||
            `${directorioBase}/${nombre}.html`;

        if(!version){
            return rutaBase;
        }

        const separador =
            rutaBase.includes("?")
                ? "&"
                : "?";

        return (
            rutaBase +
            separador +
            "v=" +
            encodeURIComponent(version)
        );

    }

    function registrarFragmento(
        nombre,
        selector,
        opciones = {}
    ){

        if(
            typeof nombre !== "string" ||
            !nombre.trim()
        ){

            throw new TypeError(
                "El fragmento HTML debe tener un nombre válido."
            );

        }

        if(
            typeof selector !== "string" ||
            !selector.trim()
        ){

            throw new TypeError(
                `El fragmento "${nombre}" debe tener un selector válido.`
            );

        }

        const nombreNormalizado =
            nombre.trim();

        const selectorNormalizado =
            selector.trim();

        const nombreDuplicado =
            fragmentosRegistrados.some(
                function(fragmento){

                    return (
                        fragmento.nombre ===
                        nombreNormalizado
                    );

                }
            );

        if(nombreDuplicado){

            throw new Error(
                `Fragmento HTML duplicado: ${nombreNormalizado}`
            );

        }

        const selectorDuplicado =
            fragmentosRegistrados.some(
                function(fragmento){

                    return (
                        fragmento.selector ===
                        selectorNormalizado
                    );

                }
            );

        if(selectorDuplicado){

            throw new Error(
                `Contenedor HTML duplicado: ${selectorNormalizado}`
            );

        }

        const fragmento = {

            nombre: nombreNormalizado,

            ruta: construirRuta(
                nombreNormalizado,
                opciones.ruta
            ),

            selector: selectorNormalizado,

            modo:
                opciones.modo ||
                modoPredeterminado

        };

        fragmentosRegistrados.push(
            fragmento
        );

        return fragmento;

    }

    function obtenerFragmentosRegistrados(){

        return fragmentosRegistrados.map(
            function(fragmento){

                return {
                    ...fragmento
                };

            }
        );

    }

    async function obtenerFragmento(ruta){

        const respuesta = await fetch(
            ruta,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if(!respuesta.ok){

            throw new Error(
                `No se pudo cargar el fragmento HTML: ${ruta}. ` +
                `Código HTTP: ${respuesta.status}`
            );

        }

        const html =
            await respuesta.text();

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

    function montarFragmento(
        contenedor,
        html,
        modo,
        nombre
    ){

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

    }

    async function cargarFragmento(configuracionFragmento){

        if(
            !configuracionFragmento ||
            typeof configuracionFragmento !== "object"
        ){

            throw new TypeError(
                "La configuración del fragmento HTML es inválida."
            );

        }

        const {
            nombre,
            ruta,
            selector,
            modo = modoPredeterminado
        } = configuracionFragmento;

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

        montarFragmento(
            contenedor,
            html,
            modo,
            nombre
        );

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

        const resultados = [];

        /*
         * La carga se mantiene secuencial.
         *
         * Esto garantiza el orden del DOM cuando un
         * fragmento depende estructuralmente de otro.
         */

        for(const fragmento of fragmentos){

            const resultado =
                await cargarFragmento(fragmento);

            resultados.push(resultado);

        }

        return resultados;

    }

    async function cargarFragmentosRegistrados(){

        return await cargarFragmentos(
            obtenerFragmentosRegistrados()
        );

    }

    function validarElementosCriticos(selectores = []){

        if(!Array.isArray(selectores)){

            throw new TypeError(
                "Los selectores críticos deben enviarse como arreglo."
            );

        }

        const faltantes =
            selectores.filter(
                function(selector){

                    return !document.querySelector(
                        selector
                    );

                }
            );

        if(faltantes.length > 0){

            throw new Error(
                "El DOM crítico está incompleto. Faltan: " +
                faltantes.join(", ")
            );

        }

        return true;

    }

    return {

        registrarFragmento,
        obtenerFragmentosRegistrados,

        obtenerFragmento,
        obtenerContenedor,

        cargarFragmento,
        cargarFragmentos,
        cargarFragmentosRegistrados,

        validarElementosCriticos

    };

}