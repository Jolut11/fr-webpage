import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { app } from './firebase-config.js';

export const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (window.location.pathname.endsWith("login.html") || window.location.pathname.endsWith("login")) {
            // Si el usuario ya está autenticado y está en la página de login, redirige a la página principal
            window.location.href = "./index.html";
        }
    }
    else {
        if (!window.location.pathname.endsWith("login.html") && !window.location.pathname.endsWith("login")) {
            // Si el usuario no está autenticado y no está en la página de login, redirige a login
            window.location.href = "./login.html";
        }
    }
});

export function onLogoutBtnClic() {
    signOut(auth)
        .then(() => {
            // Logout exitoso, redirigir a login
            //window.location.href = "/fr-webpage/login.html"; // ajusta esta ruta si hace falta
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
            alert("No se pudo cerrar sesión. Intenta de nuevo.");
        });
}