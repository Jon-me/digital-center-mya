// =====================================================
// DIGITAL CENTER M&A
// FIREBASE AUTH SERVICE
// M13.3 ENTERPRISE AUTHENTICATION LAYER
// =====================================================

export function crearFirebaseAuthService(deps){

    const {
        auth,
        signInWithEmailAndPassword,
        signOut
    } = deps;


    function normalizarUsuario(usuario){

        return String(usuario || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");

    }


    function construirCorreoTecnico(usuario){

        const usuarioNormalizado =
            normalizarUsuario(usuario);

        if(!usuarioNormalizado){

            throw new Error(
                "El nombre de usuario es obligatorio."
            );

        }

        return (
            usuarioNormalizado +
            "@digitalcentermya.app"
        );

    }


    async function iniciarSesion(
        usuario,
        password
    ){

        const passwordNormalizado =
            String(password || "").trim();

        if(!passwordNormalizado){

            return {
                completada: false,
                codigo: "auth/password-required",
                mensaje: "Ingrese la contraseña.",
                usuarioFirebase: null,
                uid: null,
                correo: null
            };

        }

        let correoTecnico;

        try{

            correoTecnico =
                construirCorreoTecnico(usuario);

        }catch(error){

            return {
                completada: false,
                codigo: "auth/user-required",
                mensaje: error.message,
                usuarioFirebase: null,
                uid: null,
                correo: null
            };

        }


        try{

            const credencial =
                await signInWithEmailAndPassword(
                    auth,
                    correoTecnico,
                    passwordNormalizado
                );

            return {
                completada: true,
                codigo: null,
                mensaje: "Sesión iniciada correctamente.",
                usuarioFirebase:
                    credencial.user,
                uid:
                    credencial.user.uid,
                correo:
                    credencial.user.email
            };

        }catch(error){

            console.error(
                "FirebaseAuthService.iniciarSesion:",
                error
            );

            return {
                completada: false,
                codigo:
                    error?.code ||
                    "auth/unknown-error",
                mensaje:
                    obtenerMensajeError(error),
                usuarioFirebase: null,
                uid: null,
                correo:
                    correoTecnico
            };

        }

    }


    async function cerrarSesion(){

        try{

            await signOut(auth);

            return {
                completada: true,
                mensaje:
                    "Sesión cerrada correctamente."
            };

        }catch(error){

            console.error(
                "FirebaseAuthService.cerrarSesion:",
                error
            );

            return {
                completada: false,
                mensaje:
                    "No se pudo cerrar la sesión de Firebase.",
                error
            };

        }

    }


    function obtenerUsuarioActual(){

        return auth.currentUser || null;

    }


    function obtenerUIDActual(){

        return auth.currentUser?.uid || null;

    }


    function estaAutenticado(){

        return Boolean(auth.currentUser);

    }

    function esperarUsuarioAutenticado(){

    return new Promise(function(resolve){

        const unsubscribe =
            auth.onAuthStateChanged(function(usuario){

                unsubscribe();

                resolve(usuario || null);

            });

        });

    }


    function obtenerMensajeError(error){

        switch(error?.code){

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":

                return "Usuario o contraseña incorrectos.";


            case "auth/too-many-requests":

                return (
                    "Demasiados intentos. " +
                    "Espere unos minutos e inténtelo nuevamente."
                );


            case "auth/network-request-failed":

                return (
                    "No se pudo conectar con Firebase. " +
                    "Revise su conexión a Internet."
                );


            case "auth/user-disabled":

                return "Esta cuenta está deshabilitada.";


            case "auth/invalid-email":

                return "El usuario ingresado no es válido.";


            default:

                return "No se pudo iniciar sesión.";

        }

    }


return {

    normalizarUsuario,
    construirCorreoTecnico,

    iniciarSesion,
    cerrarSesion,

    obtenerUsuarioActual,
    obtenerUIDActual,
    estaAutenticado,

    esperarUsuarioAutenticado

};

}