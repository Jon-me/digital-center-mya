// =====================================================
// DIGITAL CENTER M&A
// SUCURSALES MODULE
// FASE 24.1
// =====================================================

export function crearSucursales(deps){

    const {
    db,
    collection,
    addDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot
} = deps;

    let sucursales = [];

    let listenerSucursales = null;
    
    let callbacksCarga = [];

    function obtenerSucursales(){
        return sucursales;
    }

    function obtenerSucursal(id){

        return sucursales.find(function(s){

            return s.id === id;

        });

    }

    function obtenerNombreSucursal(id){

    let sucursal = obtenerSucursal(id);

    if(sucursal){
        return sucursal.nombre;
    }

    // Compatibilidad con la arquitectura actual
    if(id === "principal"){
        return "Mercado";
    }

    if(id === "sucursal"){
        return "Peluquería";
    }

    return "Sin sucursal";

}

function obtenerOpcionesHTML(){

    if(sucursales.length === 0){

        return `
            <option value="principal">Mercado</option>
            <option value="sucursal">Peluquería</option>
        `;

    }

    return sucursales.map(function(sucursal){

        return `
            <option value="${sucursal.id}">
                ${sucursal.nombre}
            </option>
        `;

    }).join("");

}

function cargarOpcionesEnSelect(select, valorSeleccionado = ""){

    if(!select){
        return;
    }

    const opciones = obtenerOpcionesHTML();

    select.innerHTML = opciones;

    if(valorSeleccionado){
        select.value = valorSeleccionado;
    }

}

function obtenerMapaSucursales(){

    const mapa = {};

    sucursales.forEach(function(sucursal){

        mapa[sucursal.id] = sucursal.nombre;

    });

    if(Object.keys(mapa).length === 0){

        mapa.principal = "Mercado";
        mapa.sucursal = "Peluquería";

    }

    return mapa;

}

function renderizarStockHTML(stockTiendas){

    const mapa = obtenerMapaSucursales();

    let html = "";

    Object.entries(stockTiendas).forEach(function([id, stock]){

        html += `
            <div class="stock-sucursal-item">
                <span>${mapa[id] || id}</span>
                <strong>${stock}</strong>
            </div>
        `;

    });

    return html;

}

function renderizarFormularioStock(stockActual = {}){

    const listaSucursales =
        sucursales.length > 0
            ? sucursales.filter(function(sucursal){
                return sucursal.activa !== false;
            })
            : [
                {
                    id: "principal",
                    nombre: "Mercado"
                },
                {
                    id: "sucursal",
                    nombre: "Peluquería"
                }
            ];

    return listaSucursales.map(function(sucursal){

        const cantidad =
            Number(stockActual[sucursal.id] || 0);

        return `
            <div class="stock-sucursal-form-item">

                <label for="stockSucursal_${sucursal.id}">
                    🏪 ${sucursal.nombre}
                </label>

                <input
                    id="stockSucursal_${sucursal.id}"
                    class="stock-sucursal-input"
                    data-sucursal-id="${sucursal.id}"
                    type="number"
                    min="0"
                    step="1"
                    value="${cantidad}"
                    placeholder="Stock ${sucursal.nombre}"
                >

            </div>
        `;

    }).join("");

}

function alCargar(callback){

    callbacksCarga.push(callback);

}

   async function crearSucursal(datos){

    if(!datos || !datos.nombre){
        throw new Error("El nombre de la sucursal es obligatorio");
    }

    const idSucursal =
        datos.id ||
        datos.codigo
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    await setDoc(
        doc(db, "sucursales", idSucursal),
        {
            nombre: datos.nombre,
            codigo: datos.codigo || idSucursal.toUpperCase(),
            activa: datos.activa !== false,
            creadaEn: datos.creadaEn || new Date().toISOString(),
            creadaPor:
                datos.creadaPor ||
                localStorage.getItem("nombreActivo") ||
                "Sistema"
        },
        { merge: true }
    );

    return idSucursal;
}

async function crearSucursalesIniciales(){

    if(sucursales.length > 0){
        return;
    }

    await crearSucursal({
        id: "principal",
        nombre: "Mercado",
        codigo: "MERCADO"
    });

    await crearSucursal({
        id: "sucursal",
        nombre: "Peluquería",
        codigo: "PELUQUERIA"
    });
}

    function editarSucursal(){

    }

    function eliminarSucursal(){

    }

    function iniciarListener(){

    if(listenerSucursales){
        listenerSucursales();
    }

    listenerSucursales = onSnapshot(

        collection(db, "sucursales"),

        function(snapshot){

            sucursales = snapshot.docs.map(function(documento){

                return {
                    id: documento.id,
                    ...documento.data()
                };

            });

            sucursales.sort(function(a, b){

                return (a.nombre || "")
                    .localeCompare(b.nombre || "");

            });

            console.log(
                "🏪 Sucursales cargadas:",
                sucursales.length
            );

            if(sucursales.length === 0){

    crearSucursalesIniciales();

}

            callbacksCarga.forEach(function(callback){

    callback(sucursales);

});

        },

        function(error){

            console.error(
                "Error cargando sucursales:",
                error
            );

        }

    );

}

    return {

    obtenerSucursales,
    obtenerSucursal,
    obtenerNombreSucursal,
    obtenerMapaSucursales,
    obtenerOpcionesHTML,

    cargarOpcionesEnSelect,

    renderizarStockHTML,
    renderizarFormularioStock,

    alCargar,

    crearSucursal,
    crearSucursalesIniciales,
    editarSucursal,
    eliminarSucursal,

    iniciarListener

};

}