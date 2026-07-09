// =====================================================
// DIGITAL CENTER M&A
// INDEXEDDB MODULE
// FASE 15
// =====================================================

export function crearIndexedDB(deps){

    function abrirDBProductos(){

        return new Promise(function(resolve, reject){

            let request = indexedDB.open(
                "DigitalCenterMYA_DB",
                1
            );

            request.onupgradeneeded = function(event){

                let dbLocal = event.target.result;

                if(!dbLocal.objectStoreNames.contains("productos")){

                    dbLocal.createObjectStore(
                        "productos",
                        { keyPath: "id" }
                    );

                }

            };

            request.onsuccess = function(event){

                resolve(event.target.result);

            };

            request.onerror = function(){

                reject("No se pudo abrir IndexedDB");

            };

        });

    }

    async function guardarProductosIndexedDB(productos){

    try{

        let dbLocal = await abrirDBProductos();
        let transaction = dbLocal.transaction(["productos"], "readwrite");
        let store = transaction.objectStore("productos");

        store.clear();

        productos.forEach(function(producto){
            store.put(producto);
        });

        transaction.oncomplete = function(){
            dbLocal.close();
        };

    }catch(error){
        console.warn("No se pudo guardar productos en IndexedDB:", error);
    }

}

async function cargarProductosIndexedDB(){

    try{

        let dbLocal = await abrirDBProductos();

        return new Promise(function(resolve, reject){

            let transaction =
                dbLocal.transaction(
                    ["productos"],
                    "readonly"
                );

            let store =
                transaction.objectStore("productos");

            let request = store.getAll();

            request.onsuccess = function(){

                dbLocal.close();

                resolve(request.result || []);

            };

            request.onerror = function(){

                dbLocal.close();

                reject(
                    "No se pudo leer productos desde IndexedDB"
                );

            };

        });

    }catch(error){

        console.warn(
            "No se pudo cargar productos desde IndexedDB:",
            error
        );

        return [];

    }

}

    return{

    abrirDBProductos,
    guardarProductosIndexedDB,
    cargarProductosIndexedDB

};

}