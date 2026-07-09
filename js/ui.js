// =====================================================
// DIGITAL CENTER M&A
// UI MODULE
// FASE 14
// =====================================================

export function crearUI(deps){

    const {

    localStorage,

    state

} = deps;

function abrirModalPanel(idPanel){

    const rol = localStorage.getItem("rolActivo");

    const panelesSoloAdmin = [
        "panelReportes",
        "panelDashboardEjecutivo",
        "panelReporteVendedores",
        "zonaAdmin",
        "panelGarantias"
    ];

    if(
        rol === "vendedor" &&
        panelesSoloAdmin.includes(idPanel)
    ){
        return;
    }

    let panel = document.getElementById(idPanel);
    let modal = document.getElementById("modalPanel");
    let contenido = document.getElementById("contenidoModalPanel");
    let modalContenido = document.querySelector(".modal-contenido");

    if(!panel || !modal || !contenido){
        alert("Error abriendo panel");
        return;
    }

    if(idPanel === "zonaAdmin"){

        modalContenido.classList.add("modal-admin");

        setTimeout(function(){

            document.getElementById("codigo")?.focus();

        },100);

    }else{

        modalContenido.classList.remove("modal-admin");

    }

    state.placeholderModal =
        document.createComment("placeholder-" + idPanel);

    panel.parentNode.insertBefore(
        state.placeholderModal,
        panel
    );

    contenido.innerHTML = "";

    contenido.appendChild(panel);

    panel.style.display = "block";

    modal.style.display = "flex";

    state.panelActivoModal = panel;

}

function cerrarModalPanel(){

    let modal =
        document.getElementById("modalPanel");

    if(
        state.panelActivoModal &&
        state.placeholderModal
    ){

        state.placeholderModal.parentNode.insertBefore(

            state.panelActivoModal,

            state.placeholderModal

        );

        state.placeholderModal.remove();

        state.panelActivoModal.style.display = "none";

    }

    state.panelActivoModal = null;

    state.placeholderModal = null;

    modal.style.display = "none";

}

function abrirPanelSeguro(ids){

    for(let id of ids){

        let panel = document.getElementById(id);

        if(panel){
            abrirModalPanel(id);
            return;
        }

    }

    alert("No se encontró el panel");

}

function abrirSeccion(ids){

    abrirPanelSeguro(ids);

}

function toggleCategoriasMenu(){

    document.body.classList.toggle(
        "categorias-menu-abierto"
    );

}

function cerrarCategoriasMenu(){

    document.body.classList.remove(
        "categorias-menu-abierto"
    );

}

function inicializarMenuCategorias(){

    document.addEventListener(

        "click",

        function(evento){

            const menu =
                document.getElementById("categoriasMenu");

            const boton =
                document.querySelector(".btn-categorias-menu");

            if(
                !menu ||
                !boton ||
                !document.body.classList.contains("categorias-menu-abierto")
            ){
                return;
            }

            if(
                !menu.contains(evento.target) &&
                !boton.contains(evento.target)
            ){

                cerrarCategoriasMenu();

            }

        }

    );

    document.addEventListener(

        "keydown",

        function(evento){

            if(evento.key === "Escape"){

                cerrarCategoriasMenu();

            }

        }

    );

}

    return{

    abrirModalPanel,
    cerrarModalPanel,
    abrirPanelSeguro,
    abrirSeccion,

    toggleCategoriasMenu,
    cerrarCategoriasMenu,
    inicializarMenuCategorias

};

}