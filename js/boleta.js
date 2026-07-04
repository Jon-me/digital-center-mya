// =====================================================
// DIGITAL CENTER M&A
// BOLETA TEMPLATE
// FASE 5
// =====================================================

export function construirHTMLBoleta(datos){

    const {
        numeroVenta,
        fecha,
        hora,
        vendedor,
        clienteNombre,
        clienteDni,
        detallePagos,
        carrito,
        total,
        descuento,
        totalFinal
    } = datos;

    let productosHTML = "";

    carrito.forEach(function(item){

        productosHTML += `
        <div class="producto">
            <div class="producto-nombre">
                ${item.nombreBoleta || item.producto}
            </div>
            <div class="producto-detalle">
                <span>${item.cantidad} x S/ ${Number(item.precio || 0).toFixed(2)}</span>
                <span>S/ ${Number(item.subtotal || 0).toFixed(2)}</span>
            </div>
        </div>
        `;

    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Boleta Digital Center M&A</title>
<style>
*{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body{
    font-family: Arial, sans-serif;
    background: #e2e8f0;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    padding:30px;
}

.boleta{
    width:260px;
    margin:auto;
    background:white;
    padding:20px;
    border-radius:18px;
    box-shadow:0 10px 30px rgba(0,0,0,0.25);
    position:relative;
    overflow:hidden;
}

.marca-agua{
    position:absolute;
    top:45%;
    left:50%;
    transform:translate(-50%, -50%) rotate(-25deg);
    font-size:46px;
    font-weight:bold;
    color:rgba(37,99,235,0.08);
    white-space:nowrap;
    z-index:0;
}

.contenido{ position:relative; z-index:1; }

.logo-container{
    text-align:center;
    margin-bottom:15px;
    overflow:visible;
}

.logo-boleta{
    width:220px;
    max-width:100%;
    height:auto;
    display:block;
    margin:0 auto 10px auto;
    object-fit:contain;
}

h2{
    text-align:center;
    margin:10px 0 5px;
    font-size:22px;
    color:#0f172a;
}

.subtitulo{
    text-align:center;
    font-size:12px;
    color:#475569;
    margin-bottom:12px;
}

.linea{
    border-top:1px dashed #334155;
    margin:12px 0;
}

.datos{
    font-size:12px;
    color:#334155;
    line-height:1.6;
}

.producto{
    margin-bottom:10px;
    font-size:13px;
}

.producto-nombre{
    font-weight:bold;
    color:#0f172a;
}

.producto-detalle{
    display:flex;
    justify-content:space-between;
    color:#334155;
    margin-top:3px;
}

.total{
    background:#0f172a;
    color:white;
    padding:12px;
    border-radius:12px;
    text-align:center;
    font-size:20px;
    font-weight:bold;
    margin-top:15px;
}

.gracias{
    text-align:center;
    font-size:13px;
    margin-top:14px;
    font-weight:bold;
    color:#0f172a;
}

.footer{
    text-align:center;
    font-size:11px;
    color:#64748b;
    margin-top:8px;
}

.qr-container{
    text-align:center;
    margin-top:20px;
}

.qr-container img{
    border-radius:10px;
}

.qr-container p{
    font-size:11px;
    color:#475569;
    margin-top:5px;
    font-weight:bold;
}

@media print{
    body{
        background:white;
        padding:0;
    }

    .boleta{
        box-shadow:none;
        border-radius:0;
        width:280px;
    }
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

        <div style="text-align:center;font-size:18px;font-weight:bold;letter-spacing:2px;margin-bottom:10px;">
            BOLETA DE VENTA
        </div>

        <div class="subtitulo">
            <strong>RUC:</strong> 10027914077<br>
            <strong>Dirección:</strong><br>
            Calle Chepa Santos 601<br>
            Frente al Banco de la Nación<br>
            <strong>WhatsApp:</strong> +51 913267246<br>
            Celulares • Accesorios • Servicio Técnico
        </div>

        <div class="linea"></div>

        <div class="datos">
            <strong>BOLETA N°:</strong> B001-${numeroVenta}<br>
            <strong>Fecha:</strong> ${fecha}<br>
            <strong>Hora:</strong> ${hora}<br>
            <strong>Atendido por:</strong> ${vendedor}<br>
            <strong>Cliente:</strong> ${clienteNombre}<br>
            <strong>DNI:</strong> ${clienteDni}<br>
            <strong>Método de Pago:</strong><br>
            ${detallePagos}
        </div>

        <div class="linea"></div>

        ${productosHTML}

        <div class="linea"></div>

        <div class="datos">
            <strong>Subtotal:</strong> S/ ${Number(total || 0).toFixed(2)}
            ${
                descuento > 0
                ? `<br><strong>Descuento:</strong> S/ ${Number(descuento || 0).toFixed(2)}`
                : ""
            }
        </div>

        <div class="total">
            TOTAL: S/ ${Number(totalFinal || 0).toFixed(2)}
        </div>

        <div class="gracias">
            ¡Gracias por su compra!
        </div>

        <div class="qr-container">
            <img src="qr-whatsapp.png" width="160">
            <p>📲 Soporte, garantías y consultas aquí</p>
        </div>

        <div class="footer">
            Gracias por confiar en nosotros ❤️
            <br><br>
            📍 Calle Chepa Santos 601<br>
            Frente al Banco de la Nación<br>
            📱 WhatsApp: +51 913267246
            <br><br>
            Conserve esta boleta para cualquier garantía.
        </div>
    </div>
</div>
</body>
</html>
`;
}