// =====================================================
// DIGITAL CENTER M&A
// NOTIFICATIONS MODULE
// FASE 16
// =====================================================

export function crearNotifications(deps){

    const {

        messaging,
        vapidKey,

        db,
        doc,
        setDoc,
        getToken,
        onMessage,

        localStorage

    } = deps;

    async function activarNotificaciones(){

    if(!("Notification" in window)){
        alert("Este navegador no soporta notificaciones");
        return;
    }

    if(!("serviceWorker" in navigator)){
        alert("Este navegador no soporta service workers");
        return;
    }

    try{

        const permiso = await Notification.requestPermission();

        if(permiso !== "granted"){
            alert("Permiso de notificaciones denegado");
            return;
        }

        const registration =
            await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
                scope: "/"
            });

        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
        });

        await setDoc(
            doc(db, "tokensNotificaciones", token),
            {
                token: token,
                usuario: localStorage.getItem("nombreActivo") || "Sin usuario",
                fecha: new Date().toISOString()
            }
        );

        alert("🔔 Notificaciones activadas correctamente");

    }catch(error){

        console.error("Error activando notificaciones:", error);

        alert(
            "ERROR REAL\n\n" +
            (error.code || "sin-code") +
            "\n\n" +
            (error.message || error)
        );

    }

}

function inicializarOnMessage(){

    onMessage(messaging, function(payload){

        let titulo =
            payload.notification?.title || "Nueva notificación";

        let cuerpo =
            payload.notification?.body || "Tienes una actualización";

        alert(
            "🔔 " + titulo + "\n\n" + cuerpo
        );

    });

}

async function toggleSonido(){

    const video = document.getElementById("videoFondoLaptop");
    const boton = document.getElementById("btnSonido");

    if(!video || !boton){
        alert("No se encontró el video o el botón de sonido");
        return;
    }

    try{

        if(video.muted){

            video.muted = false;
            video.volume = 0.6;

            await video.play();

            boton.textContent = "🔇 Silenciar";

        }else{

            video.muted = true;

            boton.textContent = "🔊 Activar sonido";

        }

    }catch(error){

        console.error("Error activando sonido:", error);

        alert(
            "El navegador bloqueó el sonido. Toca otra vez el botón."
        );

    }

}
    return{

    activarNotificaciones,
    inicializarOnMessage,
    toggleSonido

};

}