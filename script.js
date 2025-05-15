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
}