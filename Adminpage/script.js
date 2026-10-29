const sidebar = document.getElementById('sidebar');
const contenido = document.querySelector('.contenido');
const menuBtn = document.getElementById('menu-btn');
const icon = menuBtn.querySelector("i");
const loader = document.getElementById("loader");

menuBtn.addEventListener('click',()=>{
    sidebar.classList.toggle('minimize');
    contenido.classList.toggle('minimize');
    

    if(icon.classList.contains("bx-chevron-left")){
        icon.classList.remove("bx-chevron-left");;
        icon.classList.add("bx-chevron-right");
    }
    else{
        icon.classList.remove("bx-chevron-right");
        icon.classList.add("bx-chevron-left");
    }

});
