import { auth } from './auth.js';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

window.loginWithGoogle = function () {
    signInWithPopup(auth, provider)
        .then(result => {
            const user = result.user;
            document.getElementById("user-info").innerText = `Conectado como: ${user.displayName} (${user.email})`;
        })
        .catch(error => {
            alert("Error al iniciar sesión: " + error.message);
        });
}
window.logout = function () {
    signOut(auth).then(() => {
        document.getElementById("user-info").innerText = "Sesión cerrada.";
    })
}

onAuthStateChanged(auth, user => {
    const info = document.getElementById("user-info");
    if (user) {
        info.innerText = `Conectado como: ${user.displayName || user.email}`;
    } else {
        info.innerText = "No hay usuario conectado.";
    }
});