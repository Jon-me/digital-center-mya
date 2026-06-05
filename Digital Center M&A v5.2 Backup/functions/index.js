const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

exports.notificarNuevaVenta = onDocumentCreated("ventas/{ventaId}", async (event) => {
    const venta = event.data.data();

    const total = Number(venta.total || 0).toFixed(2);
    const vendedor = venta.vendedor || "Sin vendedor";

    const tokensSnapshot = await admin
        .firestore()
        .collection("tokensNotificaciones")
        .get();

    const tokens = [];

    tokensSnapshot.forEach((doc) => {
        const data = doc.data();

        if(data.token){
            tokens.push(data.token);
        }
    });

    if(tokens.length === 0){
        console.log("No hay tokens registrados");
        return;
    }

    const message = {
        notification: {
            title: "💰 Nueva venta realizada",
            body: `Total: S/ ${total} | Atendido por: ${vendedor}`
        },
        tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Notificaciones enviadas:", response.successCount);
    console.log("Errores:", response.failureCount);
});