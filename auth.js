import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const basePath = location.pathname.split('/').slice(0, -1).join('/') + '/';

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("login")) {
            // Si el usuario ya está autenticado y está en la página de login, redirige a la página principal
            window.location.href = basePath + "index.html";
        }
    }
    else {
        if (!window.location.pathname.endsWith("login.html") && !window.location.pathname.endsWith("login")) {
            // Si el usuario no está autenticado y no está en la página de login, redirige a login
            window.location.href = basePath + "login.html";
        }
    }
});