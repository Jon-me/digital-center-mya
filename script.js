import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    runTransaction

} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD_vUmAunFhTZH24SfCZMST5PVRBcAMMNI",
    authDomain: "digital-center-mya.firebaseapp.com",
    projectId: "digital-center-mya",
    storageBucket: "digital-center-mya.firebasestorage.app",
    messagingSenderId: "52765537655",
    appId: "1:52765537655:web:c0d0f6f5449e3cdc339d72",
    measurementId: "G-NLS4F507HM"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

let usuarios = [

    {
        usuario: "Karina",
        password: "1234",
        rol: "vendedor",
        nombreCompleto: "Karina A."
    },

    {
        usuario: "Judith",
        password: "1234",
        rol: "vendedor",
        nombreCompleto: "Judith N."
    }

];

let productos = [];

let indiceEditar = null;

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let historialVentas = [];

let codigoAnulacion = "DCMYA2811";

let ventaPendienteAnular = null;

let accionAdminPendiente = null;

let cajaAbierta = false;

let montoInicialCaja = 0;

let gastosCaja = [];

let historialCajas = [];

let tabla = document.getElementById("tablaProductos");

function obtenerFechaISO(){
    let fecha = new Date();

    let año = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

function mostrarProductos(){

     let html = "";

     productos.sort(function(a, b){
        return a.codigo.localeCompare(b.codigo);
     });

     productos.forEach(function(producto, index){

        html += `

     <div class="producto-card">

     <img loading="lazy" src="${producto.imagen || 'https://via.placeholder.com/300x180?text=Sin+Imagen'}">

     <h3>${producto.producto}</h3>

     <p>Código: ${producto.codigo}</p>

     <p>Categoría: ${producto.categoria}</p>

     <p>Stock: ${producto.stock}</p>

     ${localStorage.getItem("rolActivo") === "admin" ? `
     <p>Compra: S/ ${producto.precioCompra || 0}</p>
     <p>Venta: S/ ${producto.precio}</p>
     ` : `
     <p>Precio: S/ ${producto.precio}</p>
`}
     <button class="btn-agregar" onclick="agregarDirecto(${index})">
        🛒 Agregar
     </button>
 
     ${localStorage.getItem("rolActivo") === "admin" ? `
     <button onclick="editarProducto(${index})">
        ✏️ Editar
     </button>

     <button onclick="eliminarProducto(${index})">
        🗑️ Eliminar
     </button>
     ` : ""}

     </div>

     `;

     });

     tabla.innerHTML = html;
 
     actualizarDashboard();

}

function guardarProducto(){

     let codigo = document.getElementById("codigo").value;

     let producto = document.getElementById("producto").value;

     let categoria = document.getElementById("categoria").value;

     let stock = document.getElementById("stock").value;

     let precioCompra = document.getElementById("precioCompra").value;

     let precio = document.getElementById("precio").value;

     let archivo =
        document.getElementById("imagen")
        .files[0];

     // SI HAY IMAGEN
     if(archivo){

     let lector = new FileReader();

         lector.onload = function(e){

            guardarConImagen(e.target.result);

        };

        lector.readAsDataURL(archivo);

     } else {

        // SI NO HAY IMAGEN
        guardarConImagen("");

}

async function guardarConImagen(imagenBase64){

        if(
     indiceEditar !== null &&
     imagenBase64 === ""
     ){

     imagenBase64 =
        productos[indiceEditar].imagen;

}

     let nuevoProducto = {

    codigo: codigo,
    producto: producto,
    categoria: categoria,
    stock: Number(stock),
    precioCompra: Number(precioCompra),
    precio: Number(precio),
    imagen: imagenBase64

};

// EDITAR O GUARDAR NUEVO
if(indiceEditar !== null){

    let productoEditar = productos[indiceEditar];

    await updateDoc(
        doc(db, "productos", productoEditar.id),
        nuevoProducto
    );

    alert("✅ Producto editado correctamente");

    indiceEditar = null;

} else {

    await addDoc(collection(db, "productos"), nuevoProducto);

    alert("✅ Producto guardado correctamente");

}

         let posicion = localStorage.getItem("scrollEditar");

if(posicion){

    window.scrollTo({
        top: Number(posicion),
        behavior: "smooth"
    });

    localStorage.removeItem("scrollEditar");

}

         // LIMPIAR
         document.getElementById("codigo").value = "";

         document.getElementById("producto").value = "";

         document.getElementById("categoria").value = "";

         document.getElementById("stock").value = "";

        document.getElementById("precioCompra").value = "";

         document.getElementById("precio").value = "";

         document.getElementById("imagen").value = "";

    }

}

function editarProducto(index){

    localStorage.setItem(
    "scrollEditar",
    window.scrollY
 );

    let productoEditar = productos[index];

    document.getElementById("codigo").value = productoEditar.codigo;

    document.getElementById("producto").value = productoEditar.producto;

    document.getElementById("categoria").value = productoEditar.categoria;

    document.getElementById("stock").value = productoEditar.stock;

    document.getElementById("precioCompra").value = productoEditar.precioCompra || 0;

    document.getElementById("precio").value = productoEditar.precio;

    // GUARDAMOS EL ÍNDICE
indiceEditar = index;

document.getElementById("zonaAdmin").scrollIntoView({
    behavior: "smooth"
});

}

async function eliminarProducto(index){

    let productoEliminar = productos[index];

    if(!productoEliminar || !productoEliminar.id){
        alert("Error: este producto no tiene ID de Firebase");
        return;
    }

    if(confirm("¿Eliminar producto?")){

        try{

            await deleteDoc(
                doc(db, "productos", productoEliminar.id)
            );

            productos = productos.filter(function(p){
                return p.id !== productoEliminar.id;
            });

            mostrarProductos();
            actualizarDashboard();

            localStorage.removeItem("productos");

            alert("Producto eliminado correctamente");

        } catch(error){

            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar. Revisa la consola.");

        }

    }

}

function buscarProducto(){

    let input = document
        .getElementById("buscador")
        .value
        .toLowerCase()
        .trim();

    let tarjetas =
        document.querySelectorAll(".producto-card");

    tarjetas.forEach(function(tarjeta){

        let texto =
            tarjeta.innerText.toLowerCase();

        if(texto.includes(input)){

            tarjeta.style.display = "block";

        } else {

            tarjeta.style.display = "none";

        }

    });

}

function mostrarCarrito(){

    let tablaCarrito = document.getElementById("carritoTabla");

    tablaCarrito.innerHTML = "";

    let total = 0;

    limpiarDescuentoSiCarritoVacio();

    carrito.forEach(function(item, index){

       total += Number(item.subtotal);

        tablaCarrito.innerHTML += `

    <tr>

        <td>${item.producto}</td>

        <td>${item.cantidad}</td>

        <td>S/ ${item.precio.toFixed(2)}</td>

        <td>S/ ${item.subtotal.toFixed(2)}</td>

        <td>

            <button onclick="eliminarDelCarrito(${index})">
                X
            </button>

        </td>

    </tr>

`;

    });

    let descuento = obtenerDescuento();

let totalFinal = total - descuento;

if(totalFinal < 0){
    totalFinal = 0;
}

document.getElementById("totalVenta").innerHTML =
  "Total: S/ " + totalFinal.toFixed(2);
}

function eliminarDelCarrito(index){

    let item = carrito[index];

    let producto = productos.find(function(p){

        return p.id === item.id;

    });

    if(producto){

        producto.stock =
            parseInt(producto.stock) + item.cantidad;

    }

    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

    mostrarProductos();

}

function agregarDirecto(index){

    let producto = productos[index];

    let stockActual = Number(producto.stock);

    if(stockActual <= 0 || isNaN(stockActual)){

        alert("Sin stock");

        return;

    }

    // BUSCAR SI YA EXISTE EN EL CARRITO
    let itemExistente = carrito.find(function(item){

       return item.id === producto.id;

    });

    // SI YA EXISTE
    if(itemExistente){

        itemExistente.cantidad += 1;

        itemExistente.subtotal =
            itemExistente.cantidad * itemExistente.precio;

    } else {

        // SI NO EXISTE
        carrito.push({

    id: producto.id,
    producto: producto.producto,
    cantidad: 1,
    precioCompra: Number(producto.precioCompra || 0),
    precio: Number(producto.precio),
    subtotal: Number(producto.precio)

});

    }

    // DESCONTAR STOCK
    producto.stock = stockActual - 1;

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();

    mostrarProductos();

}

function cancelarVenta(){

    carrito.forEach(function(item){

        let producto = productos.find(function(p){

          return p.id === item.id;

        });

        if(producto){

            producto.stock =
                parseInt(producto.stock) + item.cantidad;

        }

    });

    carrito = [];

    localStorage.removeItem("carrito");

    mostrarCarrito();

    mostrarProductos();

}

async function finalizarVenta(){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let total = 0;
    let ganancia = 0;
    let descuento = obtenerDescuento();

carrito.forEach(function(item){

    total += item.subtotal;

    ganancia +=
        (item.precio - item.precioCompra) * item.cantidad;

});

  let venta = {
    fecha: new Date().toLocaleDateString(),
    fechaISO: obtenerFechaISO(),
    hora: new Date().toLocaleTimeString(),
    vendedor: localStorage.getItem("nombreActivo") || "Sin vendedor",
    productos: JSON.parse(JSON.stringify(carrito)),
    descuento: descuento,
    total: total - descuento,
    ganancia: ganancia - descuento
};

try{

    await runTransaction(db, async function(transaction){

        for(let item of carrito){

            let productoRef = doc(db, "productos", item.id);
            let productoSnap = await transaction.get(productoRef);

            if(!productoSnap.exists()){
                throw new Error("Producto no encontrado");
            }

            let productoData = productoSnap.data();
            let stockActual = Number(productoData.stock || 0);

            if(stockActual < item.cantidad){
                throw new Error("Stock insuficiente para: " + item.producto);
            }

            transaction.update(productoRef, {
                stock: stockActual - Number(item.cantidad)
            });

        }

        let ventaRef = doc(collection(db, "ventas"));
        transaction.set(ventaRef, venta);

    });

} catch(error){

    alert(error.message);
    return;

}

    alert("Venta realizada correctamente");

    carrito = [];

    localStorage.removeItem("carrito");

document.getElementById("descuentoVenta").value = "";
    
    mostrarCarrito();
    mostrarProductos();
    mostrarHistorialVentas();
    controlarColumnaGanancia();
    actualizarReportes();
    mostrarReporteVendedores();
    actualizarCajaDiaria();
    actualizarDashboardEjecutivo();

}

function desbloquearSistema(){

    let fondo = document.getElementById("fondoModal");
    let modal = document.getElementById("modalCodigo");

    if(fondo){
        fondo.style.display = "none";
        fondo.style.visibility = "hidden";
        fondo.style.pointerEvents = "none";
    }

    if(modal){
        modal.style.display = "none";
        modal.style.visibility = "hidden";
        modal.style.pointerEvents = "none";
    }

    document.body.style.pointerEvents = "auto";
    document.documentElement.style.pointerEvents = "auto";

    document.querySelectorAll("input, button, select, textarea").forEach(function(elemento){
        elemento.disabled = false;
        elemento.style.pointerEvents = "auto";
    });

}

async function iniciarSesion(){

    let usuarioInput =
        document.getElementById("usuario").value.trim();

    let passwordInput =
        document.getElementById("password").value.trim();

    let usuarioEncontrado = null;

    // 1. Buscar primero en Firebase
    let usuarioRef = doc(db, "usuarios", usuarioInput);
    let usuarioSnap = await getDoc(usuarioRef);

    if(usuarioSnap.exists()){

        let usuarioFirebase = usuarioSnap.data();

        if(usuarioFirebase.password === passwordInput){
            usuarioEncontrado = usuarioFirebase;
        }

    }

    // 2. Si no está en Firebase, buscar vendedores locales
    if(!usuarioEncontrado){

        usuarioEncontrado = usuarios.find(function(user){
            return (
                user.usuario === usuarioInput &&
                user.password === passwordInput
            );
        });

    }

    if(!usuarioEncontrado){
        alert("Usuario o contraseña incorrectos");
        return;
    }

    localStorage.setItem("sesion", "activa");
    localStorage.setItem("usuarioActivo", usuarioEncontrado.usuario);
    localStorage.setItem("nombreActivo", usuarioEncontrado.nombreCompleto);
    localStorage.setItem("rolActivo", usuarioEncontrado.rol);

    document.body.classList.remove("rol-admin", "rol-vendedor");
    document.body.classList.add("rol-" + usuarioEncontrado.rol);

    document.getElementById("login").style.display = "none";
    document.getElementById("sistema").style.display = "block";

    if(usuarioEncontrado.rol === "vendedor"){
        document.getElementById("dashboardAdmin").style.display = "none";
    } else {
        document.getElementById("dashboardAdmin").style.display = "grid";
    }

    desbloquearSistema();

    setTimeout(function(){

        mostrarProductos();
        mostrarCarrito();
        mostrarHistorialVentas();
        controlarColumnaGanancia();
        actualizarReportes();
        mostrarReporteVendedores();
        aplicarPermisos();

    }, 100);

}

function aplicarPermisos(){

    let rol = localStorage.getItem("rolActivo");

    if(rol === "vendedor"){

        document.getElementById("dashboardAdmin").style.display = "none";
        document.getElementById("dashboardReportes").style.display = "none";
        document.getElementById("panelReporteVendedores").style.display = "none";
        document.getElementById("zonaAdmin").style.display = "none";
        document.getElementById("tituloReportes").style.display = "none";
        document.getElementById("tituloDashboardEjecutivo").style.display = "none";
        document.getElementById("dashboardEjecutivo").style.display = "none";

let btnBorrarHistorial =
    document.getElementById("btnBorrarHistorialCajas");

if(btnBorrarHistorial){
    btnBorrarHistorial.style.display = "none";
}

        let columnaGanancia = document.getElementById("columnaGanancia");
        if(columnaGanancia){
            columnaGanancia.style.display = "none";
        }

        document.querySelectorAll(".btn-toggle-producto").forEach(function(btn){

    if(btn.innerText.includes("Caja Diaria")){
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }

});
        document.querySelectorAll('button[onclick^="editarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

        document.querySelectorAll('button[onclick^="eliminarProducto"]').forEach(function(btn){
            btn.style.display = "none";
        });

    } else {

    document.getElementById("dashboardAdmin").style.display = "grid";
    document.getElementById("tituloReportes").style.display = "block";
    document.getElementById("dashboardReportes").style.display = "grid";
    document.getElementById("tituloDashboardEjecutivo").style.display = "block";
    document.getElementById("dashboardEjecutivo").style.display = "grid";
    
    let btnBorrarHistorial =
        document.getElementById("btnBorrarHistorialCajas");

    if(btnBorrarHistorial){
        btnBorrarHistorial.style.display = "inline-block";
    }

    document.querySelectorAll(".btn-toggle-producto").forEach(function(btn){
        btn.style.display = "inline-block";
    });

}

}

function cerrarSesion(){

    localStorage.removeItem("sesion");
    localStorage.removeItem("usuarioActivo");
    localStorage.removeItem("nombreActivo");
    localStorage.removeItem("rolActivo");

    location.reload();

}

// VERIFICAR SESIÓN ACTIVA AL RECARGAR
if(localStorage.getItem("sesion") === "activa"){

    document.getElementById("login").style.display = "none";

    document.getElementById("sistema").style.display = "block";

    document.body.classList.remove("rol-admin", "rol-vendedor");
document.body.classList.add("rol-" + localStorage.getItem("rolActivo"));

    if(localStorage.getItem("rolActivo") === "vendedor"){
        document.getElementById("dashboardAdmin").style.display = "none";
    } else {
        document.getElementById("dashboardAdmin").style.display = "grid";
    }

            mostrarProductos();

            mostrarCarrito();

            mostrarHistorialVentas();

            controlarColumnaGanancia();

            actualizarReportes();

            mostrarReporteVendedores();

            aplicarPermisos();

            desbloquearSistema();

} else {

    document.getElementById("login").style.display = "block";

    document.getElementById("sistema").style.display = "none";

    desbloquearSistema();

}

// ENTER SOLO PARA LOGIN
document.addEventListener("DOMContentLoaded", function(){

    let descuentoInput = document.getElementById("descuentoVenta");

    limpiarDescuentoSiCarritoVacio();

    setTimeout(limpiarDescuentoSiCarritoVacio, 100);
    setTimeout(limpiarDescuentoSiCarritoVacio, 500);

    if(descuentoInput){
        descuentoInput.addEventListener("input", function(){
            mostrarCarrito();
            actualizarDashboard();
        });
    }

    document.getElementById("usuario").addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });

    document.getElementById("password").addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });

});

window.addEventListener("pageshow", function(){
    limpiarDescuentoSiCarritoVacio();
});

function actualizarDashboard(){

    document.getElementById(
        "totalProductos"
    ).innerHTML =
    productos.length;

    let valorTotal = 0;

    productos.forEach(function(producto){

        valorTotal +=
            producto.stock *
            producto.precio;

    });

    document.getElementById(
        "valorInventario"
    ).innerHTML =
    "S/ " + valorTotal.toFixed(2);

    let cantidadCarrito = 0;

    carrito.forEach(function(item){

        cantidadCarrito +=
            item.cantidad;

    });

    document.getElementById(
        "productosCarrito"
    ).innerHTML =
    cantidadCarrito;

    let ventaActual = 0;

    carrito.forEach(function(item){

        ventaActual +=
            item.subtotal;

    });

    ventaActual = ventaActual - obtenerDescuento();

if(ventaActual < 0){
    ventaActual = 0;
}

document.getElementById(
    "ventaActual"
).innerHTML =
"S/ " + ventaActual.toFixed(2);

}

mostrarProductos();
mostrarCarrito();
actualizarReportes();


function imprimirBoleta(){

    if(carrito.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let fecha = new Date().toLocaleDateString();
    let hora = new Date().toLocaleTimeString();

    let numeroVenta =
        String(historialVentas.length + 1).padStart(6, "0");

    let total = 0;

    let descuento = obtenerDescuento();

    let clienteNombre =
    document.getElementById("clienteNombre").value || "CLIENTE GENERAL";

let clienteDni =
    document.getElementById("clienteDni").value || "-";

    let contenido = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Boleta Digital Center M&A</title>

<style>

*{
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

    body{
    font-family: Arial, sans-serif;
    background: #e2e8f0;

    display:flex;
    justify-content:center;
    align-items:flex-start;

    padding:30px;
}

    .boleta{
        width: 260px;
        margin: auto;
        background: white;
        padding: 20px;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        position: relative;
        overflow: hidden;

    }

    .marca-agua{
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-25deg);
        font-size: 46px;
        font-weight: bold;
        color: rgba(37,99,235,0.08);
        white-space: nowrap;
        z-index: 0;
    }

    .contenido{
        position: relative;
        z-index: 1;
    }

    .logo-container{
    text-align: center;
    margin-bottom: 10px;
}

.logo-boleta{
    width: 220px;
    max-width: 100%;
}

    h2{
        text-align: center;
        margin: 10px 0 5px;
        font-size: 22px;
        color: #0f172a;
    }

    .subtitulo{
        text-align: center;
        font-size: 12px;
        color: #475569;
        margin-bottom: 12px;
    }

    .linea{
        border-top: 1px dashed #334155;
        margin: 12px 0;
    }

    .datos{
        font-size: 12px;
        color: #334155;
        line-height: 1.6;
    }

    .producto{
        margin-bottom: 10px;
        font-size: 13px;
    }

    .producto-nombre{
        font-weight: bold;
        color: #0f172a;
    }

    .producto-detalle{
        display: flex;
        justify-content: space-between;
        color: #334155;
        margin-top: 3px;
    }

    .total{
        background: #0f172a;
        color: white;
        padding: 12px;
        border-radius: 12px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-top: 15px;
    }

    .gracias{
        text-align: center;
        font-size: 13px;
        margin-top: 14px;
        font-weight: bold;
        color: #0f172a;
    }

    .footer{
        text-align: center;
        font-size: 11px;
        color: #64748b;
        margin-top: 8px;
    }

    @media print{
        body{
            background: white;
            padding: 0;
        }

        .boleta{
            box-shadow: none;
            border-radius: 0;
            width: 280px;
        }
    }

    .qr-container{

    text-align: center;

    margin-top: 20px;

}

.qr-container img{

    border-radius: 10px;

}

.qr-container p{

    font-size: 11px;

    color: #475569;

    margin-top: 5px;

    font-weight: bold;

}

</style>
</head>

<body>

<div class="boleta">
    <div class="marca-agua">DIGITAL CENTER M&A</div>

    <div class="contenido">

        <div class="logo-container">
        <img src="logo-boleta.png" class="logo-boleta">
        </div>
        <h2>DIGITAL CENTER M&A</h2>
        <div style="
        text-align:center;
        font-size:18px;
        font-weight:bold;
        letter-spacing:2px;
        margin-bottom:10px;
        ">
        BOLETA DE VENTA
        
        </div>

       <div class="subtitulo">

    <strong>RUC:</strong> 10027914077<br>

    <strong>Dirección:</strong><br>
    Calle Chepa Santos 601<br>
    Frente al Banco de la Nación<br>

    <strong>WhatsApp:</strong>
    +51 913267246<br>

    Celulares • Accesorios • Servicio Técnico

</div>

        <div class="linea"></div>

        <div class="datos">
            <strong>BOLETA N°:</strong>
            B001-${numeroVenta}
            <br>
            <strong>Fecha:</strong> ${fecha}
            <br>
            <strong>Hora:</strong> ${hora}
            <br>
            <strong>Atendido por:</strong> ${localStorage.getItem("nombreActivo") || "Vendedor"}
            <br>
            <strong>Cliente:</strong> ${clienteNombre}<br>
            <strong>DNI:</strong> ${clienteDni}
            </div>

        <div class="linea"></div>
`;

    carrito.forEach(function(item){

        total += Number(item.subtotal);

        contenido += `
        <div class="producto">
            <div class="producto-nombre">${item.producto}</div>
            <div class="producto-detalle">
                <span>${item.cantidad} x S/ ${item.precio.toFixed(2)}</span>
                <span>S/ ${item.subtotal.toFixed(2)}</span>
            </div>
        </div>
`;

    });

    contenido += `
        <div class="linea"></div>

        <div class="linea"></div>

<div class="datos">
    <strong>Subtotal:</strong> S/ ${total.toFixed(2)}<br>
    <strong>Descuento:</strong> S/ ${descuento.toFixed(2)}
</div>

<div class="total">
    TOTAL: S/ ${(total - descuento).toFixed(2)}
</div>

        <div class="gracias">
            ¡Gracias por su compra!
        </div>
        <div class="qr-container">

       <img
src="qr-whatsapp.png"
width="160"
>

        <p>
        📲 Soporte, garantías y consultas aquí
        </p>
        </div>

       <div class="footer">

    Gracias por confiar en nosotros ❤️

    <br><br>

    📍 Calle Chepa Santos 601
    <br>

    Frente al Banco de la Nación
    <br>

    📱 WhatsApp:
    +51 913267246

    <br><br>

    Conserve esta boleta para cualquier garantía.

</div>

    </div>
</div>

</body>
</html>
`;

    let iframe = document.createElement("iframe");

iframe.style.position = "fixed";
iframe.style.right = "0";
iframe.style.bottom = "0";
iframe.style.width = "0";
iframe.style.height = "0";
iframe.style.border = "0";

document.body.appendChild(iframe);

let documento = iframe.contentWindow.document;

documento.open();
documento.write(contenido);
documento.close();

setTimeout(function(){

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(function(){
        document.body.removeChild(iframe);

        document.getElementById("clienteNombre").disabled = false;
        document.getElementById("clienteDni").disabled = false;

        document.getElementById("clienteNombre").focus();

    }, 1000);

}, 700);

}

function mostrarHistorialVentas(){

    let tabla = document.getElementById("historialVentasTabla");

    if(!tabla){
        return;
    }

    tabla.innerHTML = "";

    let rol = localStorage.getItem("rolActivo");

    historialVentas.forEach(function(venta, index){

        tabla.innerHTML += `
<tr>
    <td>${venta.fecha}</td>
    <td>${venta.hora}</td>
    <td>S/ ${venta.total.toFixed(2)}</td>

    ${
        rol === "admin"
        ? `<td>S/ ${venta.ganancia.toFixed(2)}</td>`
        : ""
    }

    <td>
        <button onclick="anularVenta(${index})">
            ↩️ Anular
        </button>
    </td>
</tr>
`;

    });

}


function anularVenta(index){

    console.log("PRUEBA JONATAN 123");

    let rol = localStorage.getItem("rolActivo");

    ventaPendienteAnular = index;

    if(rol === "vendedor"){

        document.getElementById("codigoAdminInput").value = "";
        let modal = document.getElementById("modalCodigo");
let fondo = document.getElementById("fondoModal");

modal.style.display = "block";
modal.style.visibility = "visible";
modal.style.pointerEvents = "auto";

fondo.style.display = "block";
fondo.style.visibility = "visible";
fondo.style.pointerEvents = "auto";
        
        document.getElementById("codigoAdminInput").focus();

        return;
    }

    ejecutarAnulacion(index);
}

function abrirConfiguracion(){

    document.getElementById("panelConfiguracion").style.display = "block";

    document.getElementById("nuevoCodigoAnulacion").value = codigoAnulacion;

}

async function guardarConfiguracion(){

    codigoAnulacion =
        document.getElementById("nuevoCodigoAnulacion").value;

    await setDoc(
    doc(db, "configuracion", "sistema"),
    {
        codigoAnulacion: codigoAnulacion
    }
);

    alert("Configuración guardada correctamente");

    document.getElementById("panelConfiguracion").style.display = "none";

}

function controlarColumnaGanancia(){

    let columnaGanancia =
        document.getElementById("columnaGanancia");

    if(!columnaGanancia){
        return;
    }

    if(localStorage.getItem("rolActivo") === "vendedor"){
        columnaGanancia.style.display = "none";
    } else {
        columnaGanancia.style.display = "table-cell";
    }

}

async function validarCodigoAdmin(){

    let codigoIngresado =
        document.getElementById("codigoAdminInput").value;

    if(codigoIngresado !== codigoAnulacion){
        alert("Código incorrecto");
        return;
    }

    cerrarModalCodigo();

    if(accionAdminPendiente){
        await accionAdminPendiente();
        accionAdminPendiente = null;
        return;
    }

    if(ventaPendienteAnular !== null){
        await ejecutarAnulacion(ventaPendienteAnular);
        ventaPendienteAnular = null;
    }

}

function cerrarModalCodigo(){

    let modal = document.getElementById("modalCodigo");
    let fondo = document.getElementById("fondoModal");

    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.pointerEvents = "none";

    fondo.style.display = "none";
    fondo.style.visibility = "hidden";
    fondo.style.pointerEvents = "none";

    document.getElementById("codigoAdminInput").value = "";

}

function pedirAutorizacionAdmin(accion){

    accionAdminPendiente = accion;

    document.getElementById("codigoAdminInput").value = "";

    let modal = document.getElementById("modalCodigo");
    let fondo = document.getElementById("fondoModal");

    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";

    fondo.style.display = "block";
    fondo.style.visibility = "visible";
    fondo.style.pointerEvents = "auto";

    document.getElementById("codigoAdminInput").focus();

}

async function ejecutarAnulacion(index){

    if(index === null || index === undefined){
        alert("Error: no hay venta seleccionada");
        return;
    }

    if(!confirm("¿Anular esta venta?")){
        return;
    }

    let venta = historialVentas[index];

    if(!venta || !venta.id){
        alert("Error: esta venta no tiene ID de Firebase");
        return;
    }

    try{

        for(let item of venta.productos){

            let producto = productos.find(function(p){
                return p.id === item.id;
            });

            if(producto && producto.id){

                await updateDoc(
                    doc(db, "productos", producto.id),
                    {
                        stock: Number(producto.stock) + Number(item.cantidad)
                    }
                );

            }

        }

        await deleteDoc(
            doc(db, "ventas", venta.id)
        );

        ventaPendienteAnular = null;

        alert("Venta anulada correctamente");

    } catch(error){

        console.error("Error al anular:", error);
        alert("No se pudo anular. Revisa la consola.");

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

function filtrarCategoria(categoria){

    let tarjetas =
        document.querySelectorAll(".producto-card");

    tarjetas.forEach(function(tarjeta){

        let texto =
            tarjeta.innerText.toLowerCase();

        if(categoria === "todos"){
            tarjeta.style.display = "block";
        } else if(texto.includes(categoria.toLowerCase())){
            tarjeta.style.display = "block";
        } else {
            tarjeta.style.display = "none";
        }

    });

}

function actualizarReportes(){

    let hoy =
        new Date().toLocaleDateString();

    let mesActual =
        new Date().getMonth();

    let anioActual =
        new Date().getFullYear();

    let ventasHoy = 0;
    let gananciaHoy = 0;

    let ventasMes = 0;
    let gananciaMes = 0;

    historialVentas.forEach(function(venta){

        if(venta.fecha === hoy){

            ventasHoy += venta.total;
            gananciaHoy += venta.ganancia;

        }

        let fechaVenta = venta.fechaISO
    ? new Date(venta.fechaISO + "T00:00:00")
    : new Date(venta.fecha);

        if(
            fechaVenta.getMonth() === mesActual &&
            fechaVenta.getFullYear() === anioActual
        ){

            ventasMes += venta.total;
            gananciaMes += venta.ganancia;

        }

    });

    document.getElementById("ventasHoy").innerHTML =
        "S/ " + ventasHoy.toFixed(2);

    document.getElementById("gananciaHoy").innerHTML =
        "S/ " + gananciaHoy.toFixed(2);

    document.getElementById("ventasMes").innerHTML =
        "S/ " + ventasMes.toFixed(2);

    document.getElementById("gananciaMes").innerHTML =
"S/ " + gananciaMes.toFixed(2);

}

function actualizarDashboardEjecutivo(){

    let hoy = new Date().toLocaleDateString();

    let productosVendidos = {};
    let vendedores = {};

    let gananciaDia = 0;
    let gananciaMes = 0;
    let totalVentasDia = 0;
    let cantidadVentasDia = 0;

    historialVentas.forEach(function(venta){

       let fechaVenta = venta.fechaISO
    ? new Date(venta.fechaISO + "T00:00:00")
    : new Date(venta.fecha);

let hoyFecha = new Date();

if(
    fechaVenta.getMonth() === hoyFecha.getMonth() &&
    fechaVenta.getFullYear() === hoyFecha.getFullYear()
){
    gananciaMes += Number(venta.ganancia || 0);
}

        if(venta.fecha === hoy){

            gananciaDia += Number(venta.ganancia || 0);
            totalVentasDia += Number(venta.total || 0);
            cantidadVentasDia++;

            let vendedor = venta.vendedor || "Sin vendedor";

            if(!vendedores[vendedor]){
                vendedores[vendedor] = 0;
            }

            vendedores[vendedor] += Number(venta.total || 0);

            if(venta.productos){

                venta.productos.forEach(function(item){

                    let producto = item.producto || "Sin producto";

                    if(!productosVendidos[producto]){
                        productosVendidos[producto] = 0;
                    }

                    productosVendidos[producto] += Number(item.cantidad || 0);

                });

            }

        }

    });

    let productoTop = "-";
    let cantidadTop = 0;

    for(let producto in productosVendidos){
        if(productosVendidos[producto] > cantidadTop){
            productoTop = producto;
            cantidadTop = productosVendidos[producto];
        }
    }

    let vendedorTop = "-";
    let montoTop = 0;

    for(let vendedor in vendedores){
        if(vendedores[vendedor] > montoTop){
            vendedorTop = vendedor;
            montoTop = vendedores[vendedor];
        }
    }

    let ticketPromedio =
        cantidadVentasDia > 0
        ? totalVentasDia / cantidadVentasDia
        : 0;

    let nombreCorto =
    productoTop.length > 15
    ? productoTop.substring(0, 15) + "..."
    : productoTop;

document.getElementById("productoMasVendido").innerHTML =
    productoTop === "-"
    ? "-"
    : nombreCorto + "<br><small>Vendidos: " + cantidadTop + "</small>";

    document.getElementById("mejorVendedor").innerHTML =
        vendedorTop === "-"
        ? "-"
        : vendedorTop + "<br><small>S/ " + montoTop.toFixed(2) + "</small>";

    document.getElementById("gananciaRealDia").innerHTML =
        "S/ " + gananciaDia.toFixed(2);

    document.getElementById("ticketPromedio").innerHTML =
        "S/ " + ticketPromedio.toFixed(2);

       document.getElementById("gananciaMesEjecutiva").innerHTML =
"S/ " + gananciaMes.toFixed(2);

}

function mostrarReporteVendedores(){

    let tabla =
        document.getElementById("reporteVendedoresTabla");

    if(!tabla){
        return;
    }

    tabla.innerHTML = "";

    let vendedores = {};

    historialVentas.forEach(function(venta){

        let nombre =
            venta.vendedor || "Sin vendedor";

        if(!vendedores[nombre]){

            vendedores[nombre] = {
                ventas: 0,
                total: 0,
                ganancia: 0
            };

        }

        vendedores[nombre].ventas += 1;
        vendedores[nombre].total += venta.total;
        vendedores[nombre].ganancia += venta.ganancia;

    });

    for(let nombre in vendedores){

        tabla.innerHTML += `
        <tr>
            <td>${nombre}</td>
            <td>${vendedores[nombre].ventas}</td>
            <td>S/ ${vendedores[nombre].total.toFixed(2)}</td>
            <td>S/ ${vendedores[nombre].ganancia.toFixed(2)}</td>
        </tr>
        `;
    }

}

function toggleAgregarProducto(){

    let zona =
        document.getElementById("zonaAdmin");

    if(zona.style.display === "none"){

        zona.style.display = "grid";

    } else {

        zona.style.display = "none";

    }

}

function toggleReporteVendedores(){

    let panel =
        document.getElementById("panelReporteVendedores");

    if(panel.style.display === "none"){
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }

}

function obtenerDescuento(){

    let input = document.getElementById("descuentoVenta");

    if(!input || input.value.trim() === ""){
        return 0;
    }

    let descuento = Number(input.value);

   if(isNaN(descuento) || descuento < 0){
    return 0;
}

let totalVenta = 0;

carrito.forEach(function(item){
    totalVenta += Number(item.subtotal || 0);
});

if(descuento > totalVenta){
    descuento = totalVenta;
}

document.getElementById("descuentoVenta").value =
    descuento;

return descuento;

}

function limpiarDescuentoSiCarritoVacio(){

    let input = document.getElementById("descuentoVenta");

    if(input && carrito.length === 0){
        input.value = "";
        input.defaultValue = "";
        input.removeAttribute("value");
    }

}

onSnapshot(collection(db, "productos"), function(snapshot){

    productos = [];

    snapshot.forEach(function(documento){
        productos.push({
            id: documento.id,
            ...documento.data()
        });
    });

    mostrarProductos();
    actualizarDashboard();

});

onSnapshot(collection(db, "ventas"), function(snapshot){

    historialVentas = [];

    snapshot.forEach(function(documento){

        historialVentas.push({
            id: documento.id,
            ...documento.data()
        });

    });

    mostrarHistorialVentas();
    actualizarReportes();
    mostrarReporteVendedores();
    actualizarDashboardEjecutivo();

});

onSnapshot(doc(db, "configuracion", "sistema"), function(documento){

    if(documento.exists()){

        codigoAnulacion =
            documento.data().codigoAnulacion || "9999";

    }

});

onSnapshot(
    doc(
        db,
        "cajas",
        obtenerFechaISO()
    ),
    function(documento){

        if(!documento.exists()){
            return;
        }

        let datos = documento.data();

        montoInicialCaja = datos.montoInicial || 0;

        document.getElementById("cajaInicial").innerHTML =
            "S/ " + montoInicialCaja.toFixed(2);

        actualizarCajaDiaria();

    }
);

onSnapshot(
    collection(
        db,
        "cajas",
        obtenerFechaISO(),
        "gastos"
    ),
    function(snapshot){

        gastosCaja = [];

        snapshot.forEach(function(documento){

            gastosCaja.push({
                id: documento.id,
                ...documento.data()
            });

        });

        mostrarGastosCaja();
        actualizarCajaDiaria();

    }
);

onSnapshot(
    collection(db, "cierresCaja"),

    function(snapshot){

        historialCajas = [];

        snapshot.forEach(function(documento){

            let caja = {
                id: documento.id,
                ...documento.data()
            };

            historialCajas.push(caja);

        });

        historialCajas.sort(function(a, b){
            return (b.fecha || "").localeCompare(a.fecha || "");
        });

        mostrarHistorialCajas();

    }
);

function toggleCajaDiaria(){

    let panel =
        document.getElementById("panelCajaDiaria");

    if(panel.style.display === "none"){

    panel.style.display = "block";
    mostrarHistorialCajas();

} else {

        panel.style.display = "none";

    }

}

async function abrirCaja(){

    montoInicialCaja =
        Number(
            document.getElementById("montoInicialCaja").value
        );

    if(montoInicialCaja <= 0){
        alert("Ingrese un monto válido");
        return;
    }

    let fechaCaja = obtenerFechaISO();

    await setDoc(
        doc(db, "cajas", fechaCaja),
        {
            fecha: fechaCaja,
            montoInicial: montoInicialCaja,
            abierta: true,
            abiertaPor: localStorage.getItem("nombreActivo") || "Sin usuario",
            horaApertura: new Date().toLocaleTimeString()
        }
    );

    alert("✅ Caja abierta correctamente");

}

async function registrarGasto(){

    let descripcion =
        document.getElementById("descripcionGasto").value;

    let monto =
        Number(
            document.getElementById("montoGasto").value
        );

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

    let tabla =
        document.getElementById("tablaGastosCaja");

    tabla.innerHTML = "";

    gastosCaja.forEach(function(gasto){

        tabla.innerHTML += `
        <tr>
    <td>${gasto.hora}</td>
    <td>${gasto.descripcion}</td>
    <td>S/ ${gasto.monto.toFixed(2)}</td>
    <td>
        <button onclick="anularGastoCaja('${gasto.id}')">
            ↩️ Anular
        </button>
    </td>
</tr>
        `;
    });

}

function actualizarCajaDiaria(){

    let ventasHoy = 0;

    historialVentas.forEach(function(venta){

        if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += venta.total;

        }

    });

    let gastos = 0;

    gastosCaja.forEach(function(gasto){

        gastos += gasto.monto;

    });

    let esperado =
        montoInicialCaja +
        ventasHoy -
        gastos;

    document.getElementById("cajaVentas").innerHTML =
        "S/ " + ventasHoy.toFixed(2);

    document.getElementById("cajaGastos").innerHTML =
        "S/ " + gastos.toFixed(2);

    document.getElementById("cajaEsperada").innerHTML =
        "S/ " + esperado.toFixed(2);

}

function cuadrarCaja(){

    let dineroReal =
        Number(
            document.getElementById("dineroRealCaja").value
        );

    if(isNaN(dineroReal) || dineroReal < 0){

        alert("Ingrese un monto válido");

        return;

    }

    let ventasHoy = 0;

    historialVentas.forEach(function(venta){

       if(venta.fechaISO === obtenerFechaISO()){

            ventasHoy += venta.total;

        }

    });

    let gastos = 0;

    gastosCaja.forEach(function(gasto){

        gastos += gasto.monto;

    });

    let esperado =
        montoInicialCaja +
        ventasHoy -
        gastos;

    let diferencia =
        dineroReal - esperado;

    let resultado =
        document.getElementById("resultadoCuadreCaja");

    if(diferencia === 0){

        resultado.innerHTML =
            "✅ Caja exacta";

    } else if(diferencia > 0){

        resultado.innerHTML =
            "🟢 Sobrante: S/ " +
            diferencia.toFixed(2);

    } else {

        resultado.innerHTML =
            "🔴 Faltante: S/ " +
            Math.abs(diferencia).toFixed(2);

    }

}

function mostrarHistorialCajas(){

    let tabla =
        document.getElementById("historialCajasTabla");

    if(!tabla){
        return;
    }

    tabla.innerHTML = "";

    historialCajas.forEach(function(caja){

        tabla.innerHTML += `
        <tr>
            <td>${caja.fecha || "-"}</td>
            <td>${caja.cerradaPor || "-"}</td>
            <td>S/ ${(caja.ventasDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.gastosDia || 0).toFixed(2)}</td>
            <td>S/ ${(caja.cajaEsperada || 0).toFixed(2)}</td>
            <td>S/ ${(caja.dineroReal || 0).toFixed(2)}</td>
            <td>${caja.resultadoCuadre || "-"}</td>
        </tr>
        `;
    });

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

    for(let caja of historialCajas){

        if(caja.id){

            await deleteDoc(
                doc(db, "cierresCaja", caja.id)
            );

        }

    }

    historialCajas = [];
    mostrarHistorialCajas();

    alert("✅ Historial de cierres borrado");

}

async function cerrarCaja(){

    let fechaCaja = obtenerFechaISO();

    let ventasHoy = 0;
    let gastos = 0;

    historialVentas.forEach(function(venta){
      if(venta.fechaISO === fechaCaja){
            ventasHoy += Number(venta.total || 0);
        }
    });

    gastosCaja.forEach(function(gasto){
        gastos += Number(gasto.monto || 0);
    });

    let esperado =
        montoInicialCaja + ventasHoy - gastos;

    let dineroReal =
        Number(document.getElementById("dineroRealCaja").value);

    if(isNaN(dineroReal) || dineroReal < 0){
        alert("Ingrese el dinero físico contado antes de cerrar caja");
        return;
    }

    let diferencia = dineroReal - esperado;

    let resultadoCuadre = "";

    if(diferencia === 0){
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
        gastosDia: gastos,
        cajaEsperada: esperado,
        dineroReal: dineroReal,
        resultadoCuadre: resultadoCuadre
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

    historialCajas.unshift(cierre);
    mostrarHistorialCajas();

    alert("💰 Caja cerrada correctamente");

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

    for(let gasto of gastosCaja){

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

    montoInicialCaja = 0;
    gastosCaja = [];

    document.getElementById("montoInicialCaja").value = "";
    document.getElementById("cajaInicial").innerHTML = "S/ 0.00";
    document.getElementById("cajaVentas").innerHTML = "S/ 0.00";
    document.getElementById("cajaGastos").innerHTML = "S/ 0.00";
    document.getElementById("cajaEsperada").innerHTML = "S/ 0.00";

    mostrarGastosCaja();
    actualizarCajaDiaria();

    alert("✅ Caja del día anulada correctamente");

}

window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.buscarProducto = buscarProducto;
window.filtrarCategoria = filtrarCategoria;
window.guardarProducto = guardarProducto;
window.agregarDirecto = agregarDirecto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.cancelarVenta = cancelarVenta;
window.finalizarVenta = finalizarVenta;
window.imprimirBoleta = imprimirBoleta;
window.toggleAgregarProducto = toggleAgregarProducto;
window.toggleReporteVendedores = toggleReporteVendedores;
window.abrirConfiguracion = abrirConfiguracion;
window.guardarConfiguracion = guardarConfiguracion;
window.validarCodigoAdmin = validarCodigoAdmin;
window.cerrarModalCodigo = cerrarModalCodigo;
window.anularVenta = anularVenta;
window.ejecutarAnulacion = ejecutarAnulacion;
window.mostrarCarrito = mostrarCarrito;
window.actualizarDashboard = actualizarDashboard;
window.toggleCajaDiaria = toggleCajaDiaria;
window.abrirCaja = abrirCaja;
window.registrarGasto = registrarGasto;
window.cerrarCaja = cerrarCaja;
window.anularGastoCaja = anularGastoCaja;
window.anularCajaDelDia = anularCajaDelDia;
window.cuadrarCaja = cuadrarCaja;
window.mostrarHistorialCajas = mostrarHistorialCajas;
window.borrarHistorialCierres = borrarHistorialCierres;
window.actualizarDashboardEjecutivo = actualizarDashboardEjecutivo;

document.addEventListener("DOMContentLoaded", function(){

    let descuentoInput = document.getElementById("descuentoVenta");

    limpiarDescuentoSiCarritoVacio();

    setTimeout(limpiarDescuentoSiCarritoVacio, 100);
    setTimeout(limpiarDescuentoSiCarritoVacio, 500);

    if(descuentoInput){
        descuentoInput.addEventListener("input", function(){
            mostrarCarrito();
            actualizarDashboard();
        });
    }

    document.getElementById("usuario").addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });

    document.getElementById("password").addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            iniciarSesion();
        }
    });

});

window.addEventListener("pageshow", function(){
    limpiarDescuentoSiCarritoVacio();
});

window.migrarProductosAFirebase = async function(){

    let productosLocales =
        JSON.parse(localStorage.getItem("productos")) || [];

    if(productosLocales.length === 0){
        alert("No hay productos antiguos en esta laptop");
        return;
    }

    if(!confirm("¿Migrar " + productosLocales.length + " productos a Firebase? Hazlo SOLO UNA VEZ.")){
        return;
    }

    for(let producto of productosLocales){

        delete producto.id;

        await addDoc(collection(db, "productos"), producto);

    }

    alert("Migración completada: " + productosLocales.length + " productos enviados a Firebase");

};