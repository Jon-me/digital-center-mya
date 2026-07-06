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
    pedirAutorizacionAdmin

} = deps;

    async function abrirCaja(){

    state.montoInicialCaja = Number(
        document.getElementById("montoInicialCaja").value
    );

    if(state.montoInicialCaja <= 0){
        alert("Ingrese un monto válido");
        return;
    }

    let fechaCaja = obtenerFechaISO();

    let cajaRef = doc(db, "cajas", fechaCaja);

    try{

        await runTransaction(db, async function(transaction){

            let cajaDoc = await transaction.get(cajaRef);

            if(cajaDoc.exists()){
                throw new Error("CAJA_EXISTENTE");
            }

            transaction.set(cajaRef,{
                fecha: fechaCaja,
                montoInicial: state.montoInicialCaja,
                abierta: true,
                abiertaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
                horaApertura: new Date().toLocaleTimeString()
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

    let fechaCaja = obtenerFechaISO();

    await addDoc(
        collection(db, "cajas", fechaCaja, "gastos"),
        {
            hora: new Date().toLocaleTimeString(),
            descripcion: descripcion,
            monto: monto,
            registradoPor: localStorage.getItem("nombreActivo") || "Sin usuario"
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

    let ventasHoy = 0;

    let cajaEfectivo = 0;
    let cajaYape = 0;
    let cajaPlin = 0;
    let cajaTarjeta = 0;
    let cajaTransferencia = 0;

    state.historialVentas.forEach(function(venta){

        if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += Number(venta.total || 0);

            if(venta.pagos){

                cajaEfectivo += Number(venta.pagos.efectivo || 0);
                cajaYape += Number(venta.pagos.yape || 0);
                cajaPlin += Number(venta.pagos.plin || 0);
                cajaTarjeta += Number(venta.pagos.tarjeta || 0);
                cajaTransferencia += Number(venta.pagos.transferencia || 0);

            } else {

                let metodo = venta.metodoPago || "No registrado";

                if(metodo === "Efectivo"){ cajaEfectivo += Number(venta.total || 0); }
                if(metodo === "Yape"){ cajaYape += Number(venta.total || 0); }
                if(metodo === "Plin"){ cajaPlin += Number(venta.total || 0); }
                if(metodo === "Tarjeta"){ cajaTarjeta += Number(venta.total || 0); }
                if(metodo === "Transferencia"){ cajaTransferencia += Number(venta.total || 0); }

            }
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

    document.getElementById("cajaVentas").innerHTML = "S/ " + ventasHoy.toFixed(2);
    document.getElementById("cajaEfectivo").innerHTML = "S/ " + cajaEfectivo.toFixed(2);
    document.getElementById("cajaYape").innerHTML = "S/ " + cajaYape.toFixed(2);
    document.getElementById("cajaPlin").innerHTML = "S/ " + cajaPlin.toFixed(2);
    document.getElementById("cajaTarjeta").innerHTML = "S/ " + cajaTarjeta.toFixed(2);
    document.getElementById("cajaTransferencia").innerHTML = "S/ " + cajaTransferencia.toFixed(2);
    document.getElementById("cajaGastos").innerHTML = "S/ " + gastos.toFixed(2);
    document.getElementById("cajaEsperada").innerHTML = "S/ " + esperado.toFixed(2);

}

function mostrarHistorialCajas(){

    let tabla = document.getElementById("historialCajasTabla");

    if(!tabla){
        return;
    }

    let html = "";

    state.historialCajas.forEach(function(caja){

        html += `
        <tr>
            <td>${caja.fecha || "-"}</td>
            <td>${caja.cerradaPor || "-"}</td>
            <td>S/ ${(caja.ventasDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.efectivoDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.yapeDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.plinDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.tarjetaDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.transferenciaDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.gastosDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.cajaEsperada || 0).toFixed(2)}</td>
            <td>S/ ${(caja.dineroReal || 0).toFixed(2)}</td>
            <td>${caja.resultadoCuadre || "-"}</td>
        </tr>
        `;

    });

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

        if(venta.fechaISO === fechaCaja){

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
        doc(db, "cajas", fechaCaja),
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

    state.historialVentas.forEach(function(venta){
        if(venta.fechaISO === obtenerFechaISO()){
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

    let fechaCaja = obtenerFechaISO();

    await deleteDoc(
        doc(
            db,
            "cajas",
            fechaCaja,
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

    for(let caja of state.historialCajas){

        if(caja.id){

            await deleteDoc(
                doc(db, "cierresCaja", caja.id)
            );

        }
    }

    state.historialCajas = [];

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
                    fechaCaja,
                    "gastos",
                    gasto.id
                )
            );

        }
    }

    await setDoc(
        doc(db, "cajas", fechaCaja),
        {
            fecha: fechaCaja,
            montoInicial: 0,
            abierta: false,
            anulada: true,
            anuladaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
            horaAnulacion: new Date().toLocaleTimeString()
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