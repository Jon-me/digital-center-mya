// =====================================================
// DIGITAL CENTER M&A
// MOBILE AUTH
// FASE M3.5
// =====================================================

import {
    mobileDB,
    collection,
    getDocs
} from "./firebase-mobile.js";

import {
    MobileState,
    guardarSesionMobile,
    obtenerSesionMobile,
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
            usuario.value.trim();

        const passwordIngresado =
            password.value.trim();

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

            const usuariosSnap =
    await getDocs(
        collection(
            mobileDB,
            "usuarios"
        )
    );

const usuarioNormalizado =
    usuarioIngresado
        .toLowerCase();

let usuarioData =
    null;

usuariosSnap.forEach(function(documento){

    const datos =
        documento.data();

    const usuarioDocumento =
        String(
            datos.usuario ||
            documento.id ||
            ""
        )
        .trim()
        .toLowerCase();

    if(
        usuarioDocumento ===
        usuarioNormalizado
    ){

        usuarioData =
            datos;

    }

});

if(!usuarioData){

    mostrarErrorLoginMobile(
        "Usuario o contraseña incorrectos."
    );

    return;

}

            if(
                String(
                    usuarioData.password || ""
                ) !== passwordIngresado
            ){

                mostrarErrorLoginMobile(
                    "Usuario o contraseña incorrectos."
                );

                return;

            }

            const usuarioCompleto = {

                usuario:
                    usuarioData.usuario ||
                    usuarioIngresado,

                nombreCompleto:
                    usuarioData.nombreCompleto ||
                    usuarioIngresado,

                rol:
                    usuarioData.rol ||
                    "vendedor",

                sucursalId:
                    usuarioData.sucursalId ||
                    "principal"

            };

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
                "Error iniciando sesión móvil:",
                error
            );

            mostrarErrorLoginMobile(
                "No se pudo conectar con el sistema."
            );

        }finally{

            MobileState.autenticando =
                false;

            actualizarEstadoSubmit(
                false
            );

        }

    }


    function cerrarSesionMobile(){

        limpiarSesionMobile();

        if(
            typeof alCerrarSesion ===
            "function"
        ){

            alCerrarSesion();

            return;

        }

        window.location.reload();

    }


    function restaurarSesionMobile(){

        return obtenerSesionMobile();

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