let questionsData = [];
let currentQuestionIndex = 0;

let spinner;
let content;

let tituloTxt;
let preguntaTxt;
let preguntaImg;
let formOpciones;
let ayudaTxt;
let ayudaImg;

document.addEventListener("DOMContentLoaded", () => {
  spinner = document.getElementById("spinner");
  content = document.getElementById("content");

  tituloTxt = document.getElementById("titleTxt");
  preguntaTxt = document.getElementById("questionTxt");
  preguntaImg = document.getElementById("questionImg");
  formOpciones = document.getElementById("formOptions");
  ayudaTxt = document.getElementById("helpTxt");
  ayudaImg = document.getElementById("helpImg");

  spinner.style.display = "block";
  content.style.display = "none";

  loadQuestionary(parseInt(sessionStorage.getItem("number_questions")), sessionStorage.getItem("test_areas"));
});

async function loadQuestionary(number_questions, test_areas) {
  try {
    const payload = {
      number_questions: number_questions,
      test_areas: test_areas ? JSON.parse(test_areas) : [],
    };

    const response = await fetch(
      "https://fr-app.onrender.com/create_cuestionary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      alert("Respuesta de red no fue ok");
      throw new Error("Respuesta de red no fue ok");
    }

    content.style.display = "block";
    spinner.style.display = "none";

    const data = await response.json();
    questionsData = data;

    renderQuestion(currentQuestionIndex);
  } catch (error) {
    console.error("Error al cargar el cuestionario:", error);
    alert(
      "Error al cargar el cuestionario. Por favor, inténtalo de nuevo más tarde." +
      error
    );
  }
}

function renderQuestion(questionIndex) {
  if (questionIndex > questionsData.length) {
    return;
  }

  formOpciones.innerHTML = "";

  tituloTxt.textContent =
    "Pregunta " + (1 + questionIndex) + " de " + questionsData.length;
  preguntaTxt.textContent = questionsData[questionIndex].s;
  ayudaTxt.textContent = questionsData[questionIndex].j;

  //cargamos las imágenes
  preguntaImg.onerror = function () {
    preguntaImg.style.display = "none";
  };
  // si el length de la imagen es undefined quiere decir que el objeto contenido no es una lista sino un diccionario por tanto hay imagen
  preguntaImg.src = typeof questionsData[questionIndex].i[0].length === "undefined" ? questionsData[questionIndex].i[0].src.replace("https://app.cursofuturosresidentes.com/wp-content/uploads/simulations/Imagen ", "images/") : "";
  preguntaImg.style.display = preguntaImg.src && preguntaImg.src.trim() !== "" ? "block" : "none";


  ayudaImg.onerror = function () {
    ayudaImg.style.display = "none";
  };
  console.log(questionsData[questionIndex].ji);
  ayudaImg.src = questionsData[questionIndex].ji.length > 0 ? questionsData[questionIndex].ji[0].replace("https://app.cursofuturosresidentes.com/wp-content/uploads/simulations/Imagen ", "images/") : "";
  ayudaImg.style.display = ayudaImg.src && ayudaImg.src.trim() !== "" ? "block" : "none";

  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  questionsData[questionIndex].o.forEach((opcion, index) => {
    if (JSON.stringify(opcion.t) == '""') {
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
  document.getElementById("modal").style.display = "flex";
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
  document.getElementById("modal").style.display = "none";
}

function onCloseTestBtnClic() {
  window.location.href = "index.html";
}

window.onCloseTestBtnClic = onCloseTestBtnClic;
window.onHelpBtnClic = onHelpBtnClic;
window.onNextQuestionBtnClic = onNextQuestionBtnClic;
window.onPreviousQuestionBtnClic = onPreviousQuestionBtnClic;
window.cerrarModal = cerrarModal;
