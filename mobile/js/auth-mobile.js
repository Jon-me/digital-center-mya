// =====================================================
// DIGITAL CENTER M&A
// MOBILE AUTH
// FASE M3.5
// =====================================================

import {
    mobileDB,
    doc,
    getDoc
} from "./firebase-mobile.js";

import {
    iniciarSesionFirebase,
    cerrarSesionFirebase,
    observarSesionFirebase
} from "./services/firebase-auth-mobile-service.js";

import {
    obtenerIdentidadEnterpriseMobile
} from "./services/enterprise-auth-mobile.js";

import {
    MobileState,
    guardarSesionMobile,
    limpiarSesionMobile
} from "./state-mobile.js";


export function crearAuthMobile(
    deps = {}
){

    const {
        alIniciarSesion,
        alCerrarSesion
    } = deps;


    function obtenerElementosLogin(){

        return {

            form:
                document.getElementById(
                    "mobileLoginForm"
                ),

            usuario:
                document.getElementById(
                    "mobileUsuario"
                ),

            password:
                document.getElementById(
                    "mobilePassword"
                ),

            submit:
                document.getElementById(
                    "mobileLoginSubmit"
                ),

            submitText:
                document.getElementById(
                    "mobileLoginSubmitText"
                ),

            error:
                document.getElementById(
                    "mobileLoginError"
                ),

            togglePassword:
                document.getElementById(
                    "mobileTogglePassword"
                )

        };

    }


    function mostrarErrorLoginMobile(
        mensaje
    ){

        const {
            error
        } = obtenerElementosLogin();

        if(!error){

            return;

        }

        error.textContent =
            mensaje;

        error.hidden =
            false;

    }


    function limpiarErrorLoginMobile(){

        const {
            error
        } = obtenerElementosLogin();

        if(!error){

            return;

        }

        error.textContent =
            "";

        error.hidden =
            true;

    }


    function actualizarEstadoSubmit(
        cargando
    ){

        const {
            submit,
            submitText
        } = obtenerElementosLogin();

        if(submit){

            submit.disabled =
                cargando;

        }

        if(submitText){

            submitText.textContent =
                cargando
                    ? "Ingresando..."
                    : "Iniciar sesión";

        }

    }

async function cargarPerfilUsuarioMobile(
    usuarioFirebase
){

    if(
        !usuarioFirebase ||
        !usuarioFirebase.uid ||
        !usuarioFirebase.email
    ){

        return null;

    }


    // jonatan@digitalcentermya.app
    // ↓
    // Jonatan

    const usuarioDocumento =
        usuarioFirebase.email
            .split("@")[0]
            .trim();


    const nombreDocumento =
        usuarioDocumento
            .charAt(0)
            .toUpperCase() +
        usuarioDocumento.slice(1);


    const usuarioRef =
        doc(
            mobileDB,
            "usuarios",
            nombreDocumento
        );


    const usuarioSnap =
        await getDoc(
            usuarioRef
        );


    if(!usuarioSnap.exists()){

        console.error(
            "No existe el perfil Firestore Mobile:",
            nombreDocumento
        );

        return null;

    }


const usuarioData =
    usuarioSnap.data();


if(
    !usuarioData.uid ||
    usuarioData.uid !== usuarioFirebase.uid
){

    console.error(
        "UID incompatible en Mobile:",
        {
            uidAuthentication:
                usuarioFirebase.uid,

            uidFirestore:
                usuarioData.uid
        }
    );

    return null;

}


if(usuarioData.activo === false){

    return null;

}


const identidadEnterprise =
    await obtenerIdentidadEnterpriseMobile();


if(!identidadEnterprise){

    console.error(
        "No se pudo obtener la identidad Enterprise Mobile:",
        usuarioFirebase.uid
    );

    return null;

}


if(
    identidadEnterprise.uid !==
    usuarioFirebase.uid
){

    console.error(
        "UID Enterprise incompatible en Mobile:",
        {
            uidAuthentication:
                usuarioFirebase.uid,

            uidEnterprise:
                identidadEnterprise.uid
        }
    );

    return null;

}


return {

    uid:
        usuarioFirebase.uid,

    email:
        usuarioFirebase.email,

    correo:
        usuarioFirebase.email,

    usuario:
        usuarioData.usuario ||
        nombreDocumento,

    nombreCompleto:
        usuarioData.nombreCompleto ||
        usuarioData.nombre ||
        usuarioData.usuario ||
        nombreDocumento,

    admin:
        identidadEnterprise.admin ===
        true,

    rol:
        identidadEnterprise.rol,

    claimsVersion:
        identidadEnterprise.version,

    sucursalId:
        usuarioData.sucursalId ||
        "principal",

    activo:
        usuarioData.activo !== false

};

}


async function iniciarSesionMobile(){

    if(MobileState.autenticando){

        return;

    }

    const {
        usuario,
        password
    } = obtenerElementosLogin();


    if(
        !usuario ||
        !password
    ){

        mostrarErrorLoginMobile(
            "No se encontró el formulario de acceso."
        );

        return;

    }


const usuarioIngresado =
    usuario.value
        .trim();

    const passwordIngresado =
        password.value;


    limpiarErrorLoginMobile();


    if(!usuarioIngresado){

        mostrarErrorLoginMobile(
            "Ingrese su usuario."
        );

        usuario.focus();

        return;

    }


    if(!passwordIngresado){

        mostrarErrorLoginMobile(
            "Ingrese su contraseña."
        );

        password.focus();

        return;

    }


    MobileState.autenticando =
        true;

    actualizarEstadoSubmit(
        true
    );


    try{

        // =============================================
        // 1. AUTENTICACIÓN REAL EN FIREBASE AUTH
        // =============================================

    const usuarioFirebase =
            await iniciarSesionFirebase(
                usuarioIngresado,
                passwordIngresado
        );


        if(
            !usuarioFirebase ||
            !usuarioFirebase.uid
        ){

            throw new Error(
                "Firebase Authentication no devolvió un UID válido."
            );

        }


        // =============================================
        // 2. PERFIL Y PERMISOS DESDE FIRESTORE
        // Documento: usuarios/{uid}
        // =============================================

const usuarioCompleto =
    await cargarPerfilUsuarioMobile(
        usuarioFirebase
    );


if(!usuarioCompleto){

    await cerrarSesionFirebase();

    mostrarErrorLoginMobile(
        "El usuario no tiene un perfil autorizado."
    );

    return;

}


guardarSesionMobile(
    usuarioCompleto
);


if(
    typeof alIniciarSesion ===
    "function"
){

    await alIniciarSesion(
        usuarioCompleto
    );

}

    }catch(error){

        console.error(
            "Error iniciando sesión móvil Enterprise:",
            error
        );

        const codigo =
            String(
                error?.code ||
                ""
            );


        if(
            codigo === "auth/invalid-credential" ||
            codigo === "auth/wrong-password" ||
            codigo === "auth/user-not-found"
        ){

            mostrarErrorLoginMobile(
                "Usuario o contraseña incorrectos."
            );

        }else if(
            codigo === "auth/invalid-email"
        ){

            mostrarErrorLoginMobile(
                "El usuario ingresado no es válido."
            );

        }else if(
            codigo === "auth/user-disabled"
        ){

            mostrarErrorLoginMobile(
                "Este usuario fue desactivado."
            );

        }else if(
            codigo === "auth/too-many-requests"
        ){

            mostrarErrorLoginMobile(
                "Demasiados intentos. Intente nuevamente más tarde."
            );

        }else if(
            codigo === "auth/network-request-failed"
        ){

            mostrarErrorLoginMobile(
                "No se pudo conectar. Verifique su conexión a internet."
            );

        }else{

            mostrarErrorLoginMobile(
                "No se pudo iniciar sesión en el sistema."
            );

        }

    }finally{

        MobileState.autenticando =
            false;

        actualizarEstadoSubmit(
            false
        );

    }

}


async function cerrarSesionMobile(){

    try{

        await cerrarSesionFirebase();

    }catch(error){

        console.error(
            "Error cerrando Firebase Authentication:",
            error
        );

    }finally{

        limpiarSesionMobile();

        if(
            typeof alCerrarSesion ===
            "function"
        ){

            await alCerrarSesion();

            return;

        }

        window.location.reload();

    }

}


async function restaurarSesionMobile(){

    return new Promise(
        function(resolve){

            let cancelarObservador =
                null;


            cancelarObservador =
                observarSesionFirebase(
                    async function(usuarioFirebase){

                        if(
                            typeof cancelarObservador ===
                            "function"
                        ){

                            cancelarObservador();

                        }


                        if(!usuarioFirebase){

                            limpiarSesionMobile();

                            resolve(
                                null
                            );

                            return;

                        }


                        try{

                            const usuarioCompleto =
                                await cargarPerfilUsuarioMobile(
                                    usuarioFirebase
                                );


                            if(!usuarioCompleto){

                                await cerrarSesionFirebase();

                                limpiarSesionMobile();

                                resolve(
                                    null
                                );

                                return;

                            }


                            guardarSesionMobile(
                                usuarioCompleto
                            );


                            resolve(
                                usuarioCompleto
                            );

                        }catch(error){

                            console.error(
                                "Error restaurando sesión Mobile Enterprise:",
                                error
                            );


                            limpiarSesionMobile();


                            resolve(
                                null
                            );

                        }

                    }
                );

        }
    );

}


    function inicializarFormularioLoginMobile(){

        const {
            form,
            togglePassword,
            password
        } = obtenerElementosLogin();

        if(
            !form ||
            form.dataset.inicializado ===
            "true"
        ){

            return;

        }

        form.dataset.inicializado =
            "true";

        form.addEventListener(
            "submit",
            function(evento){

                evento.preventDefault();

                iniciarSesionMobile();

            }
        );

        if(
            togglePassword &&
            password
        ){

            togglePassword.addEventListener(
                "click",
                function(){

                    const visible =
                        password.type ===
                        "text";

                    password.type =
                        visible
                            ? "password"
                            : "text";

                    togglePassword.textContent =
                        visible
                            ? "👁"
                            : "🙈";

                    togglePassword.setAttribute(
                        "aria-label",
                        visible
                            ? "Mostrar contraseña"
                            : "Ocultar contraseña"
                    );

                }
            );

        }

        const inputUsuario =
            document.getElementById(
                "mobileUsuario"
            );

        if(inputUsuario){

            inputUsuario.focus();

        }

    }


    return {

        iniciarSesionMobile,

        cerrarSesionMobile,

        restaurarSesionMobile,

        inicializarFormularioLoginMobile,

        mostrarErrorLoginMobile,

        limpiarErrorLoginMobile

    };

}