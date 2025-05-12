document.addEventListener("DOMContentLoaded", () => {
  const titulo = document.getElementById("titleTxt");
  const preguntaTxt = document.getElementById("questionTxt");
  const contenedorOpciones = document.getElementById("optionsContainer");
  const ayudaTxt = document.getElementById("ayudaTxt");

  fetch("https://fr-app.onrender.com/get_cuestionary")
    .then(res => res.json())
    .then(data => {
        titulo.textContent = data[0].s;
    })
    .catch(error => {
      console.error("Error al obtener usuario:", error);
    });
});

// Función para renderizar las preguntas y opciones
/*function renderQuestions(questions) {
  const container = document.getElementById("preguntas-container");
  questions.forEach(question => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("pregunta");

    // Agregar la pregunta
    const pregunta = document.createElement("h3");
    pregunta.textContent = question.s;
    questionElement.appendChild(pregunta);

    // Agregar las opciones
    question.o.forEach(option => {
      const optionElement = document.createElement("p");
      optionElement.textContent = `${option.id}: ${option.t}`;
      questionElement.appendChild(optionElement);
    });

    // Agregar la pregunta renderizada al contenedor
    container.appendChild(questionElement);
  });
}*/