let questionsData = [];
let currentQuestionIndex = 0;

spinner = HTMLElement;
content = HTMLElement;

preguntaTxt = HTMLElement;
tituloTxt = HTMLElement;
formOpciones = HTMLElement;
ayudaTxt = HTMLElement;

document.addEventListener("DOMContentLoaded", () => {
    spinner = document.getElementById("spinner");
    content = document.getElementById("content");

    preguntaTxt = document.getElementById("questionTxt");
    tituloTxt = document.getElementById("titleTxt");
    formOpciones = document.getElementById("formOptions");
    ayudaTxt = document.getElementById("helpTxt");

    spinner.style.display = "block";
    content.style.display = "none";

    loadQuestionary(3);
});

async function loadQuestionary(number_questions) {
    try {
        const payload = {
            number_questions: number_questions
        };

        const response = await fetch("https://fr-app.onrender.com/create_cuestionary", {
            method: "POST", headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Respuesta de red no fue ok");
        }

        content.style.display = "block";
        spinner.style.display = "none";

        const data = await response.json();
        questionsData = data;

        renderQuestion(currentQuestionIndex);
    } catch (error) {
        console.error("Error al cargar el cuestionario:", error);
        alert("Error al cargar el cuestionario. Por favor, inténtalo de nuevo más tarde." + error);
    }
}

function renderQuestion(questionIndex) {
    if (questionIndex > questionsData.length) {
        return;
    }

    formOpciones.innerHTML = "";

    tituloTxt.textContent = "Pregunta " + (1 + questionIndex) + " de " + questionsData.length;
    preguntaTxt.textContent = questionsData[questionIndex].s;
    ayudaTxt.textContent = questionsData[questionIndex].j;

    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    questionsData[questionIndex].o.forEach((opcion, index) => {
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
}

function onHelpBtnClic() {
    document.getElementById('modal').style.display = 'flex';
}

function onNextQuestionBtnClic() {
    if (currentQuestionIndex >= questionsData.length - 1) {
        return;
    }
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
}

function onPreviousQuestionBtnClic() {
    if (currentQuestionIndex <= 0) {
        return;
    }
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}