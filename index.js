import { auth, onLogoutBtnClic } from './auth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = auth.currentUser;

    const profileImage = document.getElementById("profileImage");
    const userName = document.getElementById("userName");
    const rangeInput = document.getElementById("numQuestions");
    const rangeValue = document.getElementById("rangeValue");

    // Escuchar cuando se haya cargado el estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userName.textContent = user.displayName || user.email;
            profileImage.src = user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
        } else {
            userName.textContent = "Usuario no autenticado";
            profileImage.src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
        }
    });

    rangeInput.addEventListener("input", () => {
        rangeValue.textContent = rangeInput.value;
    });

    cargarAreas();
});

async function cargarAreas() {
    try {
        //const response = await fetch("https://fr-app.onrender.com/get_areas"); // Ajusta URL si es otra
        //const data = await response.json();

        const contenedor = document.getElementById("areaCheckboxList");

        const data = [
            { id: "all", name: "Todas las áreas" },
            { id: 2, name: "Medicina interna" },
            { id: 2, name: "Radiología" }
        ]

        contenedor.innerHTML = "";

        data.forEach(area => {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.marginBottom = "8px";
            div.style.gap = "8px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `area-${area.id}`;
            checkbox.value = area.name;
            checkbox.name = "area";

            const label = document.createElement("label");
            label.setAttribute("for", `area-${area.id}`);
            label.textContent = area.name;

            div.appendChild(checkbox);
            div.appendChild(label);
            contenedor.appendChild(div);

            // Si es el checkbox "Todas las áreas", añadirle el evento aquí
            if (area.id === "all") {
                checkbox.addEventListener("change", () => {
                    const otherCheckboxes = contenedor.querySelectorAll('input[name="area"]:not(#area-all)');
                    otherCheckboxes.forEach(cb => {
                        cb.checked = checkbox.checked;
                    });
                });
            }
            else {
                checkbox.addEventListener("change", () => {
                    const allCheckbox = contenedor.querySelector('#area-all');
                    allCheckbox.checked = false;
                });
            }
        });
    } catch (error) {
        alert("Error al cargar áreas" + error);
        console.error("Error al cargar áreas:", error);
    }
}

function getSelectedAreas() {
    const checkboxes = document.querySelectorAll('input[name="area"]:checked');
    //hacer array con los valores de los checkboxes seleccionados menos el de "todas las áreas"
    let selected = Array.from(checkboxes).filter(cb => cb.id !== "area-all").map(cb => cb.value);
    return selected;
}

window.crearCuestionario = function () {
    const numQuestions = document.getElementById("numQuestions").value;

    if (getSelectedAreas().length === 0) {
        alert("Selecciona al menos un área");
        return;
    }

    // Aquí puedes usar los valores seleccionados
    //alert(`Crear cuestionario con ${numQuestions} preguntas en áreas: ${getSelectedAreas().join(", ")}`);
    //redirigir a la pagina test.html con el numero de preguntas y las áreas seleccionadas
    window.location.href = "./test.html";
};

window.onLogoutBtnClic = onLogoutBtnClic;