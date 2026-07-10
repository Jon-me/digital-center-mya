// =====================================================
// DIGITAL CENTER M&A
// TRANSFERENCIAS MODULE
// FASE 9
// =====================================================

export function crearTransferencias(deps){

    const {

        state,

        db,
        doc,
        collection,
        runTransaction,

        obtenerStockTiendas,
        obtenerNombreSucursal,
        obtenerFechaISO

    } = deps;

    function abrirTransferenciaStock(idProducto){

    let producto = state.productos.find(function(p){
        return p.id === idProducto;
    });

    if(!producto){
        alert("Producto no encontrado");
        return;
    }

    state.productoTransferenciaActual = producto;

    let stockTiendas = obtenerStockTiendas(producto);

    document.getElementById("transferenciaProductoNombre").innerHTML =
        producto.producto;

    document.getElementById("stockTransferPrincipal").innerHTML =
        stockTiendas.principal;

    document.getElementById("stockTransferSucursal").innerHTML =
        stockTiendas.sucursal;

    const sucursalesActivas =
    Array.from(
        document.getElementById("transferenciaOrigen").options
    ).map(function(opcion){
        return opcion.value;
    });

document.getElementById("transferenciaOrigen").value =
    sucursalesActivas[0] || "";

document.getElementById("transferenciaDestino").value =
    sucursalesActivas[1] || sucursalesActivas[0] || "";
    document.getElementById("transferenciaCantidad").value = "";

    document.getElementById("modalTransferenciaStock").style.display = "flex";

}

function cerrarTransferenciaStock(){

    document.getElementById("modalTransferenciaStock").style.display = "none";

    state.productoTransferenciaActual = null;

}

async function confirmarTransferenciaStock(){

    if(!state.productoTransferenciaActual){
        alert("No hay producto seleccionado");
        return;
    }

    const origen =
        document.getElementById("transferenciaOrigen").value;

    const destino =
        document.getElementById("transferenciaDestino").value;

    const cantidad =
        Number(document.getElementById("transferenciaCantidad").value);

    if(origen === destino){
        alert("Origen y destino no pueden ser iguales");
        return;
    }

    if(!Number.isInteger(cantidad) || cantidad <= 0){
        alert("Ingrese una cantidad válida");
        return;
    }

    const productoRef =
        doc(db, "productos", state.productoTransferenciaActual.id);

    try{

        await runTransaction(db, async function(transaction){

            const productoSnap = await transaction.get(productoRef);

            if(!productoSnap.exists()){
                throw new Error("Producto no encontrado");
            }

            const productoData = productoSnap.data();

           const stockTiendas =
    obtenerStockTiendas(productoData);

stockTiendas[origen] =
    Number(stockTiendas[origen] || 0);

stockTiendas[destino] =
    Number(stockTiendas[destino] || 0);

if(stockTiendas[origen] < cantidad){
                throw new Error(
    "Stock insuficiente en " +
    obtenerNombreSucursal(origen)
);
            }

            stockTiendas[origen] -= cantidad;
stockTiendas[destino] += cantidad;

const stockTotal = Object.values(stockTiendas)
    .reduce(function(total, stockSucursal){
        return total + Number(stockSucursal || 0);
    }, 0);

transaction.update(productoRef, {
    stock: stockTotal,
    stockTiendas
});

            transaction.set(
                doc(collection(db,"transferenciasStock")),
                {
                    productoId: state.productoTransferenciaActual.id,
                    codigo: state.productoTransferenciaActual.codigo || "",
                    producto: state.productoTransferenciaActual.producto || "",
                    cantidad,
                    origenId: origen,
origen: obtenerNombreSucursal(origen),

destinoId: destino,
destino: obtenerNombreSucursal(destino),
                    fecha: new Date().toLocaleDateString(),
                    fechaISO: obtenerFechaISO(),
                    hora: new Date().toLocaleTimeString(),
                    usuario:
                        localStorage.getItem("nombreActivo") ||
                        "Sin usuario"
                }
            );

        });

        alert("✅ Stock transferido correctamente");

        cerrarTransferenciaStock();

    }catch(error){

        console.error(error);

        alert(
            error.message ||
            "No se pudo transferir stock"
        );

    }

}

    return {

    abrirTransferenciaStock,
    cerrarTransferenciaStock,
    confirmarTransferenciaStock

};

}