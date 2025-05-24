if (sessionStorage.getItem("test_id") === null) {
  window.location.href = "./index.html";
}

import { auth, db } from './auth.js'; // ya están inicializados en auth.js
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let spinner;
let content;

let tituloTxt;
let preguntaTxt;
let preguntaImg;
let formOpciones;
let ayudaTxt;
let ayudaImg;

// CUESTIONARIO LOCAL
let currentTestQuestions = [];
let currentQuestionIndex = 0;
let currentTestAnswers = {};

// ID DEL CUESTIONARIO, SOLO SE OBTIENE SI YA SE HA CONTESTADO POR LO MENOS UNA PREGUNTA
let test_id = sessionStorage.getItem("test_id");

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
    currentTestQuestions = data;

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
  if (questionIndex > currentTestQuestions.length) {
    return;
  }

  formOpciones.innerHTML = "";

  tituloTxt.textContent =
    "Pregunta " + (1 + questionIndex) + " de " + currentTestQuestions.length;
  preguntaTxt.textContent = currentTestQuestions[questionIndex].s;
  ayudaTxt.textContent = currentTestQuestions[questionIndex].j;

  //cargamos las imágenes
  preguntaImg.onerror = function () {
    preguntaImg.style.display = "none";
  };
  // si el length de la imagen es undefined quiere decir que el objeto contenido no es una lista sino un diccionario por tanto hay imagen
  preguntaImg.src = typeof currentTestQuestions[questionIndex].i[0].length === "undefined" ? currentTestQuestions[questionIndex].i[0].src.replace("https://app.cursofuturosresidentes.com/wp-content/uploads/simulations/Imagen ", "images/") : "";
  preguntaImg.style.display = preguntaImg.src && preguntaImg.src.trim() !== "" ? "block" : "none";


  ayudaImg.onerror = function () {
    ayudaImg.style.display = "none";
  };
  console.log(currentTestQuestions[questionIndex].ji);
  ayudaImg.src = currentTestQuestions[questionIndex].ji.length > 0 ? currentTestQuestions[questionIndex].ji[0].replace("https://app.cursofuturosresidentes.com/wp-content/uploads/simulations/Imagen ", "images/") : "";
  ayudaImg.style.display = ayudaImg.src && ayudaImg.src.trim() !== "" ? "block" : "none";

  //RENDERIZADO DE OPCIONES
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  currentTestQuestions[questionIndex].o.forEach((opcion, index) => {
    if (JSON.stringify(opcion.t) == '""') {
      return;
    }

    const valor = letras[index]; // A, B, C, ...

    const div = document.createElement("div");

    div.className = "option";
    div.style.pointerEvents = "auto";

    const currentQuestionId = currentTestQuestions[questionIndex].qid;
    // LA PREGUNTA ACTUAL ESTÁ EN LA LISTA DE PREGUNTAS RESPONDIDAS?
    if (currentQuestionId in currentTestAnswers) {
      div.className = "deshabilitada";
      div.style.pointerEvents = "none";

      // SI LA OPCION ACTUAL FUE LA SELECCIONADA
      if (opcion.id == currentTestAnswers[currentQuestionId]) {
        if (opcion.v == 1) {
          div.className = "correcta";
        }
        else {
          div.className = "incorrecta";
        }
      }
      // SI NO FUE LA SELECCIONADA PERO ES LA CORRECTA, MOSTRARLA
      else {
        if (opcion.v == 1) {
          div.className = "correcta";
        }
      }
    }

    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "respuesta";
    input.value = valor;

    label.appendChild(input);
    label.append(opcion.t);

    div.appendChild(label);

    div.addEventListener("click", () => onAnswerOptionClic(currentTestQuestions[questionIndex].qid, opcion.id, opcion.v, currentTestQuestions[questionIndex].sp));

    formOpciones.appendChild(div);
  });
}

async function onAnswerOptionClic(questionId, selectedAnswerId, isCorrect, area) {
  const user = auth.currentUser;
  if (!user) {
    console.error("Usuario no autenticado");
    alert("Debes iniciar sesión para guardar tus respuestas.");
    return;
  }

  const userId = user.uid;
  const quizRef = doc(db, "users", userId, "quizzes", test_id);
  const docSnap = await getDoc(quizRef);

  // Si no existe, guardar todas las preguntas sin respuestas
  if (!docSnap.exists()) {
    const questionsMap = {};
    currentTestQuestions.forEach(q => {
      questionsMap[q.qid] = { selectedAnswer: null };
    });

    await setDoc(quizRef, {
      startedAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      completed: false,
      questions: questionsMap
    });
  }

  // Actualizar respuesta con updateDoc
  await updateDoc(quizRef, {
    [`questions.${questionId}.selectedAnswer`]: selectedAnswerId,
    [`questions.${questionId}.isCorrect`]: isCorrect,
    [`questions.${questionId}.area`]: area,
    lastUpdated: serverTimestamp()
  });

  currentTestAnswers[questionId] = selectedAnswerId;

  renderQuestion(currentQuestionIndex);

  console.log("Respuesta guardada para la pregunta:", questionId);
}

function onHelpBtnClic() {
  document.getElementById("modal").style.display = "flex";
}

function onNextQuestionBtnClic() {
  if (currentQuestionIndex >= currentTestQuestions.length - 1) {
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

window.onAnswerOptionClic = onAnswerOptionClic;
window.onCloseTestBtnClic = onCloseTestBtnClic;
window.onHelpBtnClic = onHelpBtnClic;
window.onNextQuestionBtnClic = onNextQuestionBtnClic;
window.onPreviousQuestionBtnClic = onPreviousQuestionBtnClic;
window.cerrarModal = cerrarModal;

//BORRAR SESSION STORAGE AL RECARGAR LA PÁGINA
window.addEventListener("beforeunload", () => {
  sessionStorage.clear();
});