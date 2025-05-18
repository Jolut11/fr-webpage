// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCS02oO4Q_WCQaWqYFUTioaHE6MrxufMSM",
    authDomain: "fr-webpage-5d512.firebaseapp.com",
    projectId: "fr-webpage-5d512",
    storageBucket: "fr-webpage-5d512.firebasestorage.app",
    messagingSenderId: "832827801804",
    appId: "1:832827801804:web:5452f46c8b6dcb12a9c269",
    measurementId: "G-5QJ5FR39MS"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

function loginWithGoogle() {
    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            document.getElementById("user-info").innerText = `Conectado como: ${user.displayName} (${user.email})`;
        })
        .catch(error => {
            alert("Error al iniciar sesión: " + error.message);
        });
}

function logout() {
    auth.signOut().then(() => {
        document.getElementById("user-info").innerText = "Sesión cerrada.";
    });
}

auth.onAuthStateChanged(user => {
    const info = document.getElementById("user-info");
    if (user) {
        info.innerText = `Conectado como: ${user.displayName || user.email}`;
    } else {
        info.innerText = "No hay usuario conectado.";
    }
});