import { auth, db, onLogoutBtnClic } from './auth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const profileImage = document.getElementById("profileImage");
    const userName = document.getElementById("userName");
    const rangeInput = document.getElementById("numQuestions");
    const rangeValue = document.getElementById("rangeValue");

    // Escuchar cuando se haya cargado el estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userName.textContent = user.displayName || user.email;
            profileImage.src = user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

            cargarCuestionariosGuardados(user);
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

async function cargarCuestionariosGuardados(user) {
    const userId = user.uid;
    const quizzesCol = collection(db, "users", userId, "quizzes");

    try {
        const querySnapshot = await getDocs(quizzesCol);
        const container = document.getElementById("quizList");
        container.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const quizId = docSnap.id;
            const data = docSnap.data();

            // Obtener preguntas desde el campo tipo mapa
            const preguntasMap = data.questions || {};
            const preguntasArray = Object.values(preguntasMap);

            const total = preguntasArray.length;
            const respondidas = preguntasArray.filter(p =>
                typeof p.selectedAnswer === "string" && p.selectedAnswer.trim() !== ""
            ).length;

            console.log(`Quiz ${quizId}: ${respondidas}/${total} respondidas`);

            // Crear botón contenedor de todo (excepto el botón de borrar)
            const quizBtn = document.createElement("button");
            quizBtn.style.display = "flex";
            quizBtn.style.justifyContent = "space-between";
            quizBtn.style.alignItems = "center";
            quizBtn.style.width = "100%";
            quizBtn.style.border = "1px solid #ccc";
            quizBtn.style.borderRadius = "8px";
            quizBtn.style.padding = "10px";
            quizBtn.style.marginBottom = "10px";
            quizBtn.style.cursor = "pointer";
            quizBtn.style.background = "white";
            quizBtn.onmouseover = () => quizBtn.style.background = "#f9f9f9";
            quizBtn.onmouseout = () => quizBtn.style.background = "white";
            quizBtn.onclick = () => cargarCuestionario(quizId);

            // Izquierda: fecha
            const fecha = new Date(parseInt(quizId));
            const fechaLegible = fecha.toLocaleString();
            const fechaDiv = document.createElement("div");
            fechaDiv.textContent = fechaLegible;

            // Derecha: info de preguntas
            const preguntasInfo = document.createElement("div");
            preguntasInfo.textContent = `📋 ${respondidas}/${total}`;
            preguntasInfo.style.fontSize = "0.9em";
            preguntasInfo.style.color = "#555";

            quizBtn.appendChild(fechaDiv);
            quizBtn.appendChild(preguntasInfo);

            // Contenedor de línea con el botón de borrar al lado derecho
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "space-between";
            wrapper.appendChild(quizBtn);

            // Botón de borrar
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.style.backgroundColor = "#f44336";
            deleteBtn.style.color = "white";
            deleteBtn.style.border = "none";
            deleteBtn.style.borderRadius = "4px";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.style.padding = "6px 10px";
            deleteBtn.onclick = async (e) => {
                e.stopPropagation(); // Evitar que se dispare el clic de cargar
                if (confirm(`¿Eliminar quiz ${quizId}?`)) {
                    await deleteDoc(doc(db, "users", userId, "quizzes", quizId));
                    wrapper.remove();
                }
            };

            wrapper.appendChild(deleteBtn);
            container.appendChild(wrapper);
        });

    } catch (error) {
        console.error("Error al cargar quizzes:", error);
        alert("Error al obtener los quizzes");
    }
}

async function cargarAreas() {
    try {
        const response = await fetch("https://fr-app.onrender.com/get_areas"); // Ajusta URL si es otra
        const data = await response.json();

        const contenedor = document.getElementById("areaCheckboxList");

        contenedor.innerHTML = "";

        data.forEach(area => {
            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.marginBottom = "8px";
            div.style.gap = "8px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `area-${area}`;
            checkbox.value = area;
            checkbox.name = "area";

            const label = document.createElement("label");
            label.setAttribute("for", `area-${area}`);
            label.textContent = area;

            div.appendChild(checkbox);
            div.appendChild(label);
            contenedor.appendChild(div);

            // Si es el checkbox "Todas las áreas", añadirle el evento aquí
            if (area === "Todas") {
                checkbox.addEventListener("change", () => {
                    const otherCheckboxes = contenedor.querySelectorAll('input[name="area"]:not(#area-Todas)');
                    otherCheckboxes.forEach(cb => {
                        cb.checked = checkbox.checked;
                    });
                });
            }
            else {
                checkbox.addEventListener("change", () => {
                    const allCheckbox = contenedor.querySelector('#area-Todas');
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
    if (getSelectedAreas().length === 0) {
        alert("Selecciona al menos un área");
        return;
    }

    sessionStorage.setItem("test_id", Date.now().toString());
    sessionStorage.setItem("number_questions", document.getElementById("numQuestions").value);
    sessionStorage.setItem("test_areas", JSON.stringify(getSelectedAreas()));

    // Aquí puedes usar los valores seleccionados
    //alert(`Crear cuestionario con ${numQuestions} preguntas en áreas: ${getSelectedAreas().join(", ")}`);
    window.location.href = "./test.html";
};

window.cargarCuestionario = function (testId) {
    sessionStorage.setItem("test_id", testId);
    window.location.href = "./test.html";
}

window.onLogoutBtnClic = onLogoutBtnClic;