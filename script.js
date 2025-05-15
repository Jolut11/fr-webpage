document.addEventListener("DOMContentLoaded", () => {
    const preguntaTxt = document.getElementById("questionTxt");
    const tituloTxt = document.getElementById("titleTxt");
    const formOpciones = document.getElementById("formOptions");
    const ayudaTxt = document.getElementById("helpTxt");

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
            if (!response.ok) {
                preguntaTxt.textContent = "Respuesta de red no fue ok";
                throw new Error("Respuesta de red no fue ok");
            }
            return response.json();
        })
        .then(data => {
            tituloTxt.textContent = "Pregunta " + 1 + " de " + data[0].o.length;
            preguntaTxt.textContent = data[0].s;
            ayudaTxt.textContent = data[0].j;

            const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            data[0].o.forEach((opcion, index) => {
                const valor = letras[index]; // A, B, C, ...

                const div = document.createElement("div");
                div.className = "option";

                const label = document.createElement("label");

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "respuesta";
                input.value = valor;

                label.appendChild(input);
                label.append(` ${JSON.stringify(opcion.t)}`);

                div.appendChild(label);
                formOpciones.appendChild(div);
            });


            /*for (const opcion of data[0].o) {
                const optionDiv = document.createElement("div");
                optionDiv.className = "question-text";
                const optionText = document.createElement("p");
                optionText.className = "question-text";
                optionText.textContent = JSON.stringify(opcion.id) + " - " + JSON.stringify(opcion.t);
                optionDiv.appendChild(optionText);
                containerOpciones.appendChild(optionDiv);
            }*/
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