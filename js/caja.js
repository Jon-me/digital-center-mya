// =====================================================
// DIGITAL CENTER M&A
// CAJA MODULE
// FASE 6
// =====================================================

export function crearCaja(deps){

    const {

    state,

    db,
    collection,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    runTransaction,

    obtenerFechaISO,
    obtenerSucursalCajaActiva,
    obtenerIdCajaActiva,
    obtenerNombreSucursal,
    pedirAutorizacionAdmin,

} = deps;

    async function abrirCaja(){

    state.montoInicialCaja = Number(
        document.getElementById("montoInicialCaja").value
    );

    if(state.montoInicialCaja <= 0){
        alert("Ingrese un monto válido");
        return;
    }

    const fechaCaja =
    obtenerFechaISO();

    const sucursalId =
        obtenerSucursalCajaActiva();

    const cajaId =
        obtenerIdCajaActiva();

    const cajaRef =
        doc(db, "cajas", cajaId);

    try{

        await runTransaction(db, async function(transaction){

            let cajaDoc = await transaction.get(cajaRef);

            if(cajaDoc.exists()){
                throw new Error("CAJA_EXISTENTE");
            }

            transaction.set(cajaRef,{

    fecha: fechaCaja,

    sucursalId: sucursalId,

    sucursalNombre:
        obtenerNombreSucursal(sucursalId),

    montoInicial:
        state.montoInicialCaja,

    abierta: true,

    abiertaPor:
        localStorage.getItem("nombreActivo") ||
        "Sin usuario",

    horaApertura:
        new Date().toLocaleTimeString()

});

        });

        alert("✅ Caja abierta correctamente");

    }catch(error){

        if(error.message === "CAJA_EXISTENTE"){
            alert("⚠️ La caja del día ya fue abierta.");
            return;
        }

        console.error(error);
        alert("Error al abrir la caja.");
    }
}

async function registrarGasto(){

    let descripcion =
        document.getElementById("descripcionGasto").value.trim();

    let monto =
        Number(document.getElementById("montoGasto").value);

    if(descripcion === "" || monto <= 0){
        alert("Complete los datos");
        return;
    }

const fechaCaja =
    obtenerFechaISO();

const sucursalId =
    obtenerSucursalCajaActiva();

const cajaId =
    obtenerIdCajaActiva();

await addDoc(
    collection(db, "cajas", cajaId, "gastos"),
    {

        descripcion: descripcion,

        monto: monto,

        fecha: new Date().toLocaleDateString(),

        fechaISO: fechaCaja,

        sucursalId: sucursalId,

        sucursalNombre:
            obtenerNombreSucursal(sucursalId),

        hora: new Date().toLocaleTimeString(),

        registradoPor:
            localStorage.getItem("nombreActivo")

    }
);

    document.getElementById("descripcionGasto").value = "";
    document.getElementById("montoGasto").value = "";

    alert("✅ Gasto registrado correctamente");
}

function mostrarGastosCaja(){

    let tabla = document.getElementById("tablaGastosCaja");

    if(!tabla){
        return;
    }

    let html = "";

    state.gastosCaja.forEach(function(gasto){

        html += `
        <tr>
            <td>${gasto.hora}</td>
            <td>${gasto.descripcion}</td>
            <td>S/ ${Number(gasto.monto || 0).toFixed(2)}</td>
            <td>
                <button onclick="window.anularGastoCaja('${gasto.id}')">
                    ↩️ Anular
                </button>
            </td>
        </tr>
        `;

    });

    tabla.innerHTML = html;
}

function actualizarCajaDiaria(){

    const fechaActual =
        obtenerFechaISO();

    const sucursalActiva =
        obtenerSucursalCajaActiva();

    let ventasHoy = 0;

    let cajaEfectivo = 0;
    let cajaYape = 0;
    let cajaPlin = 0;
    let cajaTarjeta = 0;
    let cajaTransferencia = 0;

    state.historialVentas.forEach(function(venta){

        const perteneceFecha =
            venta.fechaISO === fechaActual;

        const perteneceSucursal =
            (venta.tiendaVenta || "principal") === sucursalActiva;

        if(!perteneceFecha || !perteneceSucursal){
            return;
        }

        ventasHoy += Number(venta.total || 0);

        if(venta.pagos){

            cajaEfectivo +=
                Number(venta.pagos.efectivo || 0);

            cajaYape +=
                Number(venta.pagos.yape || 0);

            cajaPlin +=
                Number(venta.pagos.plin || 0);

            cajaTarjeta +=
                Number(venta.pagos.tarjeta || 0);

            cajaTransferencia +=
                Number(venta.pagos.transferencia || 0);

        }else{

            const metodo =
                venta.metodoPago || "No registrado";

            if(metodo === "Efectivo"){
                cajaEfectivo += Number(venta.total || 0);
            }

            if(metodo === "Yape"){
                cajaYape += Number(venta.total || 0);
            }

            if(metodo === "Plin"){
                cajaPlin += Number(venta.total || 0);
            }

            if(metodo === "Tarjeta"){
                cajaTarjeta += Number(venta.total || 0);
            }

            if(metodo === "Transferencia"){
                cajaTransferencia += Number(venta.total || 0);
            }

        }

    });

    const gastos =
        state.gastosCaja.reduce(function(total, gasto){

            return total + Number(gasto.monto || 0);

        }, 0);

    const esperado =
        Number(state.montoInicialCaja || 0) +
        ventasHoy -
        gastos;

    document.getElementById("cajaVentas").innerHTML =
        "S/ " + ventasHoy.toFixed(2);

    document.getElementById("cajaEfectivo").innerHTML =
        "S/ " + cajaEfectivo.toFixed(2);

    document.getElementById("cajaYape").innerHTML =
        "S/ " + cajaYape.toFixed(2);

    document.getElementById("cajaPlin").innerHTML =
        "S/ " + cajaPlin.toFixed(2);

    document.getElementById("cajaTarjeta").innerHTML =
        "S/ " + cajaTarjeta.toFixed(2);

    document.getElementById("cajaTransferencia").innerHTML =
        "S/ " + cajaTransferencia.toFixed(2);

    document.getElementById("cajaGastos").innerHTML =
        "S/ " + gastos.toFixed(2);

    document.getElementById("cajaEsperada").innerHTML =
        "S/ " + esperado.toFixed(2);

}

function mostrarHistorialCajas(){

    const tabla =
        document.getElementById("historialCajasTabla");

    if(!tabla){
        return;
    }

    const sucursalActiva =
        obtenerSucursalCajaActiva();

    const cierresSucursal =
        state.historialCajas.filter(function(caja){

            return (
                (caja.sucursalId || "principal") ===
                sucursalActiva
            );

        });

    let html = "";

    cierresSucursal.forEach(function(caja){

        html += `
        <tr>
            <td>${caja.fecha || "-"}</td>
            <td>${caja.cerradaPor || "-"}</td>
            <td>S/ ${Number(caja.ventasDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.efectivoDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.yapeDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.plinDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.tarjetaDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.transferenciaDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.gastosDia || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.cajaEsperada || 0).toFixed(2)}</td>
            <td>S/ ${Number(caja.dineroReal || 0).toFixed(2)}</td>
            <td>${caja.resultadoCuadre || "-"}</td>
        </tr>
        `;

    });

    if(html === ""){

        html = `
        <tr>
            <td colspan="12" style="text-align:center;">
                No hay cierres registrados para esta sucursal.
            </td>
        </tr>
        `;

    }

    tabla.innerHTML = html;

}

async function cerrarCaja(){

    let fechaCaja = obtenerFechaISO();

    let ventasHoy = 0;
    let gastos = 0;

    let efectivoDia = 0;
    let yapeDia = 0;
    let plinDia = 0;
    let tarjetaDia = 0;
    let transferenciaDia = 0;

    state.historialVentas.forEach(function(venta){

        if(
    venta.fechaISO === fechaCaja &&
    (venta.tiendaVenta || "principal") ===
        obtenerSucursalCajaActiva()
){

            ventasHoy += Number(venta.total || 0);

            if(venta.pagos){

                efectivoDia += Number(venta.pagos.efectivo || 0);
                yapeDia += Number(venta.pagos.yape || 0);
                plinDia += Number(venta.pagos.plin || 0);
                tarjetaDia += Number(venta.pagos.tarjeta || 0);
                transferenciaDia += Number(venta.pagos.transferencia || 0);

            } else {

                let metodo = venta.metodoPago || "No registrado";

                if(metodo === "Efectivo"){ efectivoDia += Number(venta.total || 0); }
                if(metodo === "Yape"){ yapeDia += Number(venta.total || 0); }
                if(metodo === "Plin"){ plinDia += Number(venta.total || 0); }
                if(metodo === "Tarjeta"){ tarjetaDia += Number(venta.total || 0); }
                if(metodo === "Transferencia"){ transferenciaDia += Number(venta.total || 0); }

            }
        }
    });

    state.gastosCaja.forEach(function(gasto){
        gastos += Number(gasto.monto || 0);
    });

    let esperado =
        state.montoInicialCaja +
        ventasHoy -
        gastos;

    let dineroReal =
        Number(document.getElementById("dineroRealCaja").value);

    if(isNaN(dineroReal) || dineroReal < 0){
        alert("Ingrese el dinero físico contado antes de cerrar caja");
        return;
    }

    let diferencia = dineroReal - esperado;

    let resultadoCuadre = "";

    if(Math.abs(diferencia) < 0.01){
        resultadoCuadre = "Caja exacta";
    } else if(diferencia > 0){
        resultadoCuadre = "Sobrante S/ " + diferencia.toFixed(2);
    } else {
        resultadoCuadre = "Faltante S/ " + Math.abs(diferencia).toFixed(2);
    }

    let cierre = {

        fecha: fechaCaja,

        sucursalId:
    obtenerSucursalCajaActiva(),

sucursalNombre:
    obtenerNombreSucursal(
        obtenerSucursalCajaActiva()
    ),

        cerradaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
        horaCierre: new Date().toLocaleTimeString(),

        ventasDia: ventasHoy,
        efectivoDia,
        yapeDia,
        plinDia,
        tarjetaDia,
        transferenciaDia,

        gastosDia: gastos,
        cajaEsperada: esperado,
        dineroReal,
        resultadoCuadre
    };

    await setDoc(
        doc(
    db,
    "cajas",
    obtenerIdCajaActiva()
),
        {
            abierta: false,
            ...cierre
        },
        { merge: true }
    );

    await addDoc(
        collection(db, "cierresCaja"),
        cierre
    );

    state.historialCajas.unshift(cierre);
    mostrarHistorialCajas();

    alert(
`💰 CAJA CERRADA

Ventas:
S/ ${ventasHoy.toFixed(2)}

💵 Efectivo:
S/ ${efectivoDia.toFixed(2)}

📱 Yape:
S/ ${yapeDia.toFixed(2)}

🟢 Plin:
S/ ${plinDia.toFixed(2)}

💳 Tarjeta:
S/ ${tarjetaDia.toFixed(2)}

🏦 Transferencia:
S/ ${transferenciaDia.toFixed(2)}

${resultadoCuadre}`
    );

}

function cuadrarCaja(){

    let dineroReal =
        Number(document.getElementById("dineroRealCaja").value);

    if(isNaN(dineroReal) || dineroReal < 0){
        alert("Ingrese un monto válido");
        return;
    }

    let ventasHoy = 0;

    const fechaActual =
    obtenerFechaISO();

const sucursalActiva =
    obtenerSucursalCajaActiva();

state.historialVentas.forEach(function(venta){

    if(
        venta.fechaISO === fechaActual &&
        (venta.tiendaVenta || "principal") === sucursalActiva
    ){
        ventasHoy += Number(venta.total || 0);
    }

});

    let gastos = 0;

    state.gastosCaja.forEach(function(gasto){
        gastos += Number(gasto.monto || 0);
    });

    let esperado =
        state.montoInicialCaja +
        ventasHoy -
        gastos;

    let diferencia =
        dineroReal - esperado;

    let resultado =
        document.getElementById("resultadoCuadreCaja");

    if(Math.abs(diferencia) < 0.01){
        resultado.innerHTML = "✅ Caja exacta";
    } else if(diferencia > 0){
        resultado.innerHTML =
            "🟢 Sobrante: S/ " + diferencia.toFixed(2);
    } else {
        resultado.innerHTML =
            "🔴 Faltante: S/ " + Math.abs(diferencia).toFixed(2);
    }
}

async function anularGastoCaja(idGasto, autorizado = false){

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor" && autorizado === false){

        pedirAutorizacionAdmin(async function(){
            await anularGastoCaja(idGasto, true);
        });

        return;
    }

    if(!confirm("¿Anular este gasto?")){
        return;
    }
    
    await deleteDoc(
        doc(
            db,
            "cajas",
            obtenerIdCajaActiva(),
            "gastos",
            idGasto
        )
    );

    alert("✅ Gasto anulado correctamente");
}

async function borrarHistorialCierres(){

    let rol = localStorage.getItem("rolActivo");

    if(rol !== "admin"){
        alert("Solo el administrador puede borrar este historial");
        return;
    }

    if(!confirm("¿Borrar todo el historial de cierres?")){
        return;
    }

    const sucursalActiva =
    obtenerSucursalCajaActiva();

const cierresSucursal =
    state.historialCajas.filter(function(caja){

        return (
            (caja.sucursalId || "principal") ===
            sucursalActiva
        );

    });

for(const caja of cierresSucursal){

        if(caja.id){

            await deleteDoc(
                doc(db, "cierresCaja", caja.id)
            );

        }
    }

    state.historialCajas =
    state.historialCajas.filter(function(caja){

        return (
            (caja.sucursalId || "principal") !==
            sucursalActiva
        );

    });

    mostrarHistorialCajas();

    alert("✅ Historial de cierres borrado");
}

async function anularCajaDelDia(autorizado = false){

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor" && autorizado === false){

        pedirAutorizacionAdmin(async function(){
            await anularCajaDelDia(true);
        });

        return;
    }

    if(!confirm("¿Anular toda la caja del día? Se borrará la apertura y los gastos.")){
        return;
    }

    let fechaCaja = obtenerFechaISO();

    for(let gasto of state.gastosCaja){

        if(gasto.id){

            await deleteDoc(
                doc(
                    db,
                    "cajas",
                    obtenerIdCajaActiva(),
                    "gastos",
                    gasto.id
                )
            );

        }
    }

await setDoc(
    doc(
        db,
        "cajas",
        obtenerIdCajaActiva()
    ),
    {
        fecha: fechaCaja,

        sucursalId:
            obtenerSucursalCajaActiva(),

        sucursalNombre:
            obtenerNombreSucursal(
                obtenerSucursalCajaActiva()
            ),

        montoInicial: 0,
        abierta: false,
        anulada: true,

        anuladaPor:
            localStorage.getItem("nombreActivo") ||
            "Sin usuario",

        horaAnulacion:
            new Date().toLocaleTimeString()
    }
);

    state.montoInicialCaja = 0;
    state.gastosCaja = [];

    document.getElementById("montoInicialCaja").value = "";
    document.getElementById("cajaInicial").innerHTML = "S/ 0.00";
    document.getElementById("cajaVentas").innerHTML = "S/ 0.00";
    document.getElementById("cajaGastos").innerHTML = "S/ 0.00";
    document.getElementById("cajaEsperada").innerHTML = "S/ 0.00";

    mostrarGastosCaja();
    actualizarCajaDiaria();

    alert("✅ Caja del día anulada correctamente");
}

    return {
    abrirCaja,
    registrarGasto,
    mostrarGastosCaja,
    actualizarCajaDiaria,
    mostrarHistorialCajas,
    cerrarCaja,
    cuadrarCaja,
    anularGastoCaja,
    borrarHistorialCierres,
    anularCajaDelDia
};

}