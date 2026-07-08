// =====================================================
// DIGITAL CENTER M&A
// LISTENERS MODULE
// FASE 12
// =====================================================

export function crearListeners(deps){

    const {
        state,

        db,
        collection,
        doc,
        onSnapshot,

        obtenerFechaISO,

        actualizarCajaDiaria,
        mostrarGastosCaja,
        mostrarHistorialCajas,
        actualizarReportes,
        actualizarDashboardEjecutivo,
        mostrarReporteVendedores,
        guardarProductosIndexedDB,
        
        reiniciarRenderCatalogo,
        mostrarProductos,

        mostrarHistorialVentas,
        ordenarProductosPorCodigo,
    } = deps;

    function escucharConfiguracion(){

        state.listenersFirebaseActivos.push(
            onSnapshot(
                doc(db, "configuracion", "sistema"),
                function(documento){

                    if(documento.exists()){
                        state.codigoAnulacion =
                            documento.data().codigoAnulacion || "9999";
                    }

                }
            )
        );

    }

    function escucharCaja(){

        state.listenersFirebaseActivos.push(
            onSnapshot(
                doc(db, "cajas", obtenerFechaISO()),
                function(documento){

                    if(!documento.exists()){
                        return;
                    }

                    let datos = documento.data();

                    state.montoInicialCaja =
                        datos.montoInicial || 0;

                    if(localStorage.getItem("sesion") === "activa"){

                        document.getElementById("cajaInicial").innerHTML =
                            "S/ " + state.montoInicialCaja.toFixed(2);

                        actualizarCajaDiaria();

                    }

                }
            )
        );

    }

    function escucharGastos(){

        state.listenersFirebaseActivos.push(
            onSnapshot(
                collection(
                    db,
                    "cajas",
                    obtenerFechaISO(),
                    "gastos"
                ),
                function(snapshot){

                    state.gastosCaja = [];

                    snapshot.forEach(function(documento){

                        state.gastosCaja.push({
                            id: documento.id,
                            ...documento.data()
                        });

                    });

                    if(localStorage.getItem("sesion") === "activa"){
                        mostrarGastosCaja();
                        actualizarCajaDiaria();
                    }

                }
            )
        );

    }

    function escucharHistorialCierres(){

        state.listenersFirebaseActivos.push(
            onSnapshot(
                collection(db, "cierresCaja"),
                function(snapshot){

                    state.historialCajas = [];

                    snapshot.forEach(function(documento){

                        state.historialCajas.push({
                            id: documento.id,
                            ...documento.data()
                        });

                    });

                    state.historialCajas.sort(function(a, b){
                        return (b.fecha || "").localeCompare(a.fecha || "");
                    });

                    if(localStorage.getItem("sesion") === "activa"){
                        mostrarHistorialCajas();
                    }

                }
            )
        );

    }

    function escucharVentas(){

    state.listenersFirebaseActivos.push(
        onSnapshot(
            collection(db, "ventas"),
            function(snapshot){

                state.historialVentas = [];

                snapshot.forEach(function(documento){

                    state.historialVentas.push({
                        id: documento.id,
                        ...documento.data()
                    });

                });

                state.historialVentas.sort(function(a, b){
                    return String(b.fechaISO || "").localeCompare(String(a.fechaISO || ""));
                });

                if(localStorage.getItem("sesion") === "activa"){

                    mostrarHistorialVentas();
                    actualizarReportes();
                    actualizarDashboardEjecutivo();
                    mostrarReporteVendedores();
                    actualizarCajaDiaria();

                }

            },
            function(error){
                console.error("Error cargando ventas:", error);
            }
        )
    );

}

function escucharProductos(){

    state.listenersFirebaseActivos.push(

        onSnapshot(

            collection(db, "productos"),

            function(snapshot){

                state.productos = snapshot.docs.map(function(documento){

                    return {
                        id: documento.id,
                        ...documento.data()
                    };

                });

                ordenarProductosPorCodigo();

                state.catalogoVersion++;

                state.ultimaFirmaCatalogo = "";

                guardarProductosIndexedDB();

                if(localStorage.getItem("sesion") === "activa"){

                    reiniciarRenderCatalogo();
                    mostrarProductos();

                }

            },

            function(error){

                console.error(
                    "Error en tiempo real productos:",
                    error
                );

            }

        )

    );

}

    return {

    escucharConfiguracion,
    escucharCaja,
    escucharGastos,
    escucharHistorialCierres,
    escucharVentas,
    escucharProductos

};

}