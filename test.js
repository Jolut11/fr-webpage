// VERIFICAMOS QUE SE TENGA UN TEST ID EL CUAL SE GENERAL AL DAR CLIC AL BOTON DE CREAR TEST, SI NO SE TIENE RETORNAMOS A INICIO
if (sessionStorage.getItem("test_id") === null) {
  window.location.href = "./index.html";
}

import { auth, db } from './auth.js'; // ya están inicializados en auth.js
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let spinnerContainer;
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
let quizRef;

// ID DEL CUESTIONARIO, SE OBTIENE AL DAR CLIC AL BOTON DE CREAR TEST
const test_id = sessionStorage.getItem("test_id");
const curren_test_number_questions = sessionStorage.getItem("number_questions")
const current_test_areas = sessionStorage.getItem("test_areas")

document.addEventListener("DOMContentLoaded", () => {
  spinnerContainer = document.getElementById("spinner-container");
  content = document.getElementById("content");

  // MOSTRAMOS SPINNER CARGANDO
  spinnerContainer.style.display = "flex";
  content.style.display = "none";

  tituloTxt = document.getElementById("titleTxt");
  preguntaTxt = document.getElementById("questionTxt");
  preguntaImg = document.getElementById("questionImg");
  formOpciones = document.getElementById("formOptions");
  ayudaTxt = document.getElementById("helpTxt");
  ayudaImg = document.getElementById("helpImg");
});

onAuthStateChanged(auth, (user) => {
  // SE VERIFICA QUE EL USUARIO ESTÉ LOGEADO ANTES DE INICIALIZAR EL TEST
  if (user) {
    initializeQuestionary()
  } else {
    alert("Se ha cerrado la sesion de usuario.")
    window.location.href = "./index.html";
  }
});

async function initializeQuestionary() {
  const user = auth.currentUser;
  if (!user) {
    console.error("Usuario no autenticado");
    alert("Debes iniciar sesión para iniciar cuestionarios.");
    window.location.href = "./index.html";
    return;
  }

  // VERIFICAMOS SI EL TEST EXISTE EN EL HISTORIAL DEL USUARIO
  const userId = user.uid;
  quizRef = doc(db, "users", userId, "quizzes", test_id);
  const docSnap = await getDoc(quizRef);

  // SI EL TEST EXISTE EN EL HISTORIAL CARGAMOS LAS PREGUNTAS USANDO LOS ID DE FIRESTORE
  if (docSnap.exists()) {
    // TODO MOSTRAR LAS PREGUNTAS GUARDADAS EN FIRESTORE SI EL CUESTIONARIO EXISTE EN EL HISTORIAL
    currentTestQuestions = await getSavedQuestioanry(test_id);

  }
  // SI NO EXISTE EN EL HISTORIAL CARGAMOS PREGUNTAS AL AZAR
  else {
    currentTestQuestions = await getQuestionary(parseInt(curren_test_number_questions), current_test_areas);

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

  renderQuestion(0);

  // MOSTRAMOS EL CONTENIDO DEL TEST
  content.style.display = "block";
  spinnerContainer.style.display = "none";
}

async function getQuestionary(number_questions, test_areas) {
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

    return await response.json();
  } catch (error) {
    console.error("Error al cargar el cuestionario:", error);
    alert(
      "Error al cargar el cuestionario. Por favor, inténtalo de nuevo más tarde." +
      error
    );
  }
}

async function getSavedQuestioanry(savedQuestionaryId) {
  try {
    let questionsIds = []

    const quizRef = doc(db, "users", auth.currentUser.uid, "quizzes", savedQuestionaryId);
    const quizSnap = await getDoc(quizRef);

    if (quizSnap.exists()) {
      const data = quizSnap.data();
      const questionsMap = data.questions;

      if (!questionsMap || typeof questionsMap !== "object") {
        console.warn("El campo 'questions' no está presente o no es un objeto.");
        alert("El campo 'questions' no está presente o no es un objeto.")
      }

      Object.entries(questionsMap).forEach(([questionId, question]) => {
        if (question.selectedAnswer != null) {
          currentTestAnswers[questionId] = question.selectedAnswer;
        }
      });

      const questionIds = Object.keys(questionsMap);

      questionsIds = questionIds;
    } else {
      console.warn("No se encontró el quiz con id:", quizId);
      alert("No se encontró el quiz con id:", quizId)
    }

    const payload = {
      question_ids: questionsIds,
    };

    const response = await fetch(
      "https://fr-app.onrender.com/load_questionary",
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

    return await response.json();
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

  ayudaImg.src = currentTestQuestions[questionIndex].ji.length > 0 ? currentTestQuestions[questionIndex].ji[0].replace("https://app.cursofuturosresidentes.com/wp-content/uploads/simulations/Imagen ", "images/") : "";
  ayudaImg.style.display = ayudaImg.src && ayudaImg.src.trim() !== "" ? "block" : "none";

  renderAnswerOptions(questionIndex);
}

function renderAnswerOptions(questionIndex) {
  const currentQuestionId = currentTestQuestions[questionIndex].qid;
  const respuestas = currentTestQuestions[questionIndex].o.filter(opcion => opcion.t.trim() !== "");
  formOpciones.innerHTML = "";

  respuestas.forEach((option, index) => {
    const div = document.createElement("div");

    div.classList = "option";

    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "respuesta";
    input.addEventListener("click", () => onAnswerOptionClic(currentTestQuestions[questionIndex].qid, option.id, option.v, currentTestQuestions[questionIndex].sp));

    label.appendChild(input);
    label.append(option.t);

    div.appendChild(label);

    // ACTIVAMOS LOS CLICS
    div.style.pointerEvents = "auto";
    input.disabled = false;

    // LA PREGUNTA HA SIDO CONTESTADA
    if (currentQuestionId in currentTestAnswers) {
      // DESACTIVAMOS LOS CLICS YA QUE LA PREGUNTA FUE CONTESTADA
      div.style.pointerEvents = "none";
      input.disabled = true;

      if (option.id == currentTestAnswers[currentQuestionId]) {
        if (option.v === 1) {
          div.classList.add("correcta");
        } else {
          div.classList.add("incorrecta");
        }
      }
      // SI NO FUE LA SELECCIONADA PERO ES CORRECTA
      else {
        if (option.v === 1) {
          div.classList.add("correcta");
        }
        else {
          div.classList.add("deshabilitada");
        }
      }
    }

    formOpciones.appendChild(div);
  })
}

async function onAnswerOptionClic(questionId, selectedAnswerId, isCorrect, area) {
  const user = auth.currentUser;
  if (!user) {
    console.error("Usuario no autenticado");
    alert("Debes iniciar sesión para guardar tus respuestas.");
    return;
  }

  // ACTUALIZAMOS LA RESPUESTA EN PANTALLA Y EN LOCAL
  currentTestAnswers[questionId] = selectedAnswerId;
  //updateOptionsState(currentQuestionIndex);
  renderAnswerOptions(currentQuestionIndex);

  // Actualizar respuesta con updateDoc
  try {
    await updateDoc(quizRef, {
      [`questions.${questionId}.selectedAnswer`]: selectedAnswerId,
      [`questions.${questionId}.isCorrect`]: isCorrect,
      [`questions.${questionId}.area`]: area,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    alert("Error al guardar la respuesta: " + error);
    delete currentTestAnswers[questionId];
    renderQuestion(currentQuestionIndex);
  }

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