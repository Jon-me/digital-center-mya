// =====================================================
// DIGITAL CENTER M&A
// MOBILE CATALOG SEARCH ENGINE
// FASE M5.2
// =====================================================
const CATEGORIAS_COMERCIALES_MOBILE = [

    "Todos",

    "Celulares",

    "Cargadores",

    "Audífonos",

    "Pantallas",

    "Vidrios",

    "Case"

];

function normalizarTextoCatalogoMobile(
    valor
){

    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9\s]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}

function obtenerCategoriaComercialMobile(
    categoriaOriginal
){

    const categoria =
        normalizarTextoCatalogoMobile(
            categoriaOriginal
        );


    if(!categoria){

        return "Otros";

    }


    if(
        categoria.includes("celular") ||
        categoria.includes("telefono") ||
        categoria.includes("smartphone")
    ){

        return "Celulares";

    }


    if(
        categoria.includes("cargador") ||
        categoria.includes("cable") ||
        categoria.includes("adaptador") ||
        categoria.includes("fuente")
    ){

        return "Cargadores";

    }


    if(
        categoria.includes("audifono") ||
        categoria.includes("auricular") ||
        categoria.includes("audio") ||
        categoria.includes("parlante") ||
        categoria.includes("bluetooth")
    ){

        return "Audífonos";

    }


    if(
        categoria.includes("pantalla") ||
        categoria.includes("display") ||
        categoria.includes("lcd") ||
        categoria.includes("oled") ||
        categoria.includes("incell") ||
        categoria.includes("amoled") ||
        categoria.includes("pikachu")
    ){

        return "Pantallas";

    }


    if(
        categoria.includes("vidrio") ||
        categoria.includes("mica") ||
        categoria.includes("templado") ||
        categoria.includes("protector")
    ){

        return "Vidrios";

    }


    if(
        categoria.includes("case") ||
        categoria.includes("funda") ||
        categoria.includes("protector") ||
        categoria.includes("carcasa")
    ){

        return "Case";

    }


    return "Otros";

}


function construirTextoBusquedaMobile(
    producto
){

    return normalizarTextoCatalogoMobile(
        [
            producto?.producto,
            producto?.codigo,
            producto?.categoria
        ]
            .filter(Boolean)
            .join(" ")
    );

}


function prepararProductosBusquedaMobile(
    productos = []
){

    return productos.map(
        function(producto){

            return {

                ...producto,

                categoriaComercialMobile:
                    obtenerCategoriaComercialMobile(
                        producto?.categoria
                    ),

                textoBusquedaMobile:
                    construirTextoBusquedaMobile(
                        producto
                    )

            };

        }
    );

}


function obtenerCategoriasMobile(){

    return [
        ...CATEGORIAS_COMERCIALES_MOBILE
    ];

}


function coincideBusquedaMobile(
    producto,
    consulta
){

    const textoConsulta =
        normalizarTextoCatalogoMobile(
            consulta
        );

    if(!textoConsulta){

        return true;

    }

    const tokens =
        textoConsulta
            .split(" ")
            .filter(Boolean);

    const textoProducto =
        producto.textoBusquedaMobile ||
        construirTextoBusquedaMobile(
            producto
        );

    return tokens.every(
        function(token){

            return textoProducto.includes(
                token
            );

        }
    );

}


function coincideCategoriaMobile(
    producto,
    categoria
){

    if(
        !categoria ||
        categoria === "Todos"
    ){

        return true;

    }


    return (
        producto
            ?.categoriaComercialMobile ===
        categoria
    );

}


function filtrarProductosMobile(
    productos = [],
    filtros = {}
){

    const {

        busqueda =
            "",

        categoria =
            "Todas"

    } = filtros;

    return productos.filter(
        function(producto){

            return (
                coincideBusquedaMobile(
                    producto,
                    busqueda
                ) &&
                coincideCategoriaMobile(
                    producto,
                    categoria
                )
            );

        }
    );

}


export {

    CATEGORIAS_COMERCIALES_MOBILE,

    normalizarTextoCatalogoMobile,

    obtenerCategoriaComercialMobile,

    construirTextoBusquedaMobile,

    prepararProductosBusquedaMobile,

    obtenerCategoriasMobile,

    coincideBusquedaMobile,

    coincideCategoriaMobile,

    filtrarProductosMobile

};