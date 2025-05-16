document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://fr-app.onrender.com/create_cuestionary";

    let cuestionarios = [];
    let currentIndex = 0;
    let seleccionadas = []; // Guarda la selección de cada pregunta

    function renderCard(idx) {
        const container = document.querySelector(".container");
        container.innerHTML = ""; // Limpiar el contenedor

        const cuestionario = cuestionarios[idx];
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
    <div class="question" id="${idx}">
      <div class="title"><h1>Pregunta ${idx + 1} de ${cuestionarios.length
            }</h1></div>
      <div class="question-text" id="${idx}">
        <p>${cuestionario.s || "Sin pregunta"}</p>
      </div>
    </div>
    <div class="options">
      ${(cuestionario.o || [])
                .filter((opcion) => opcion.t && opcion.t.trim() !== "")
                .map(
                    (opcion, i) => `
        <div class="btn" id="option-${idx + 1}-${i + 1}" data-idx="${i}">${opcion.t
                        }</div>
      `
                )
                .join("")}
    </div>
    <div class="help-container">
      <button class="btn-ayuda" id="btn-ayuda">Ver ayuda</button>
    </div>
    <div class="pagination">
      <button id="prev-btn" ${idx === 0 ? "disabled" : ""}>Anterior</button>
      <button id="next-btn">
        ${idx === cuestionarios.length - 1 ? "Finalizar" : "Siguiente"}
      </button>
    </div>
  `;

        container.appendChild(card);

        // Manejar selección de opción y restaurar selección previa
        const optionButtons = card.querySelectorAll(".options .btn");
        optionButtons.forEach((btn, i) => {
            btn.addEventListener("click", function () {
                optionButtons.forEach((b) => b.classList.remove("selected"));
                this.classList.add("selected");
                seleccionadas[idx] = i; // Guardar selección
            });
        });
        // Restaurar selección si existe
        if (typeof seleccionadas[idx] !== "undefined") {
            optionButtons[seleccionadas[idx]]?.classList.add("selected");
        }

        // Eventos de paginación
        document.getElementById("prev-btn").onclick = () => {
            if (currentIndex > 0) {
                currentIndex--;
                renderCard(currentIndex);
            }
        };
        document.getElementById("next-btn").onclick = () => {
            if (currentIndex < cuestionarios.length - 1) {
                currentIndex++;
                renderCard(currentIndex);
            } else {
                // Mostrar resumen con clases según valor v y puntaje
                let puntos = 0;
                let resumen = "<ol style='list-style: none; padding: 0;'>";
                cuestionarios.forEach((q, idx) => {
                    const seleccion = seleccionadas[idx];
                    let texto = "<em>No respondida</em>";
                    let clase = "respuesta-no-seleccionada";
                    if (
                        q.o &&
                        typeof seleccion !== "undefined" &&
                        q.o[seleccion] &&
                        q.o[seleccion].t
                    ) {
                        texto = q.o[seleccion].t;
                        if (q.o[seleccion].v === 1) {
                            clase = "respuesta-correcta";
                            puntos++;
                        } else {
                            clase = "respuesta-incorrecta";
                        }
                    }
                    resumen += `<li style="margin-bottom:1rem;"><span class="${clase}">${texto}</span></li>`;
                });
                resumen += "</ol>";
                resumen =
                    `<div style="font-size:1.2rem;font-weight:bold;margin-bottom:1rem;">Puntaje: ${puntos} / ${cuestionarios.length}</div>` +
                    resumen;
                document.getElementById("modal-resumen-text").innerHTML = resumen;
                document.getElementById("modal-resumen").style.display = "block";
            }
        };
    }

    async function getData() {
        const payload = {
            number_questions: 5
        };

        try {
            fetch("https://fr-app.onrender.com/create_cuestionary", {
                method: "POST", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Respuesta de red no fue ok");
                    }
                    return response.json();
                })
                .then(data => {
                    const results = data
                    cuestionarios = Array.isArray(results) ? results : [results];
                    currentIndex = 0;
                    seleccionadas = new Array(cuestionarios.length); // Inicializar array de selecciones
                    renderCard(currentIndex);
                })
        } catch (error) {
            console.error(error);
        }
    }

    getData();

    // Modal de ayuda y resumen
    document.body.addEventListener("click", function (e) {
        // Modal de ayuda
        if (e.target && e.target.id === "btn-ayuda") {
            const ayuda = cuestionarios[currentIndex]?.j || "Sin ayuda";
            document.getElementById("modal-ayuda-text").innerHTML = ayuda;
            document.getElementById("modal-ayuda").style.display = "block";
        }
        // Cerrar modal de ayuda
        if (
            e.target &&
            (e.target.classList.contains("close-ayuda") ||
                e.target.id === "modal-ayuda")
        ) {
            document.getElementById("modal-ayuda").style.display = "none";
        }
        // Cerrar modal de resumen
        if (
            e.target &&
            (e.target.classList.contains("close-ayuda") ||
                e.target.id === "modal-resumen")
        ) {
            document.getElementById("modal-resumen").style.display = "none";
        }
    });
});


/*

document.addEventListener("DOMContentLoaded", () => {
    const spinner = document.getElementById("spinner");
    const content = document.getElementById("content");

    const preguntaTxt = document.getElementById("questionTxt");
    const tituloTxt = document.getElementById("titleTxt");
    const formOpciones = document.getElementById("formOptions");
    const ayudaTxt = document.getElementById("helpTxt");

    spinner.style.display = "block";
    content.style.display = "none";

    const payload = {
        number_questions: 1
    };

    fetch("https://fr-app.onrender.com/create_cuestionary", {
        method: "POST", headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            content.style.display = "block";
            spinner.style.display = "none";

            if (!response.ok) {
                preguntaTxt.textContent = "Respuesta de red no fue ok";
                throw new Error("Respuesta de red no fue ok");
            }
            return response.json();
        })
        .then(data => {
            tituloTxt.textContent = "Pregunta " + 1 + " de " + data.length;
            preguntaTxt.textContent = data[0].s;
            ayudaTxt.textContent = data[0].j;

            const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            data[0].o.forEach((opcion, index) => {
                if (JSON.stringify(opcion.t) == "\"\"") {
                    return;
                }

                const valor = letras[index]; // A, B, C, ...

                const div = document.createElement("div");
                div.className = "option";

                const label = document.createElement("label");

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "respuesta";
                input.value = valor;

                label.appendChild(input);
                label.append(opcion.t);

                div.appendChild(label);
                formOpciones.appendChild(div);
            });
        })
        .catch(error => {
            preguntaTxt.textContent = "Error al obtener preguntas: " + error.message;
            console.error("Error al obtener preguntas:", error);
        });
});

function onHelpBtnClic() {
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}*/