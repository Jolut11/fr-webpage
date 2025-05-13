document.addEventListener("DOMContentLoaded", () => {
    const preguntaTxt = document.getElementById("questionTxt");
    const tituloTxt = document.getElementById("titleTxt");
    const containerOpciones = document.getElementById("optionsContainer");
    const ayudaTxt = document.getElementById("ayudaTxt");

    fetch("https://fr-app.onrender.com/get_cuestionary")
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
    })
    .catch(error => {
        preguntaTxt.textContent = "Error al obtener preguntas: " + error.message;
        console.error("Error al obtener preguntas:", error);
    });
});