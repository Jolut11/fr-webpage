document.addEventListener("DOMContentLoaded", () => {
    const preguntaTxt = document.getElementById("questionTxt");

    fetch("https://fr-app.onrender.com/get_cuestionary")
    .then(response => {
        if (!response.ok) {
            preguntaTxt.textContent = "Respuesta de red no fue ok";
            throw new Error("Respuesta de red no fue ok");
        }
        return response.json();
        })
    .then(data => {
        preguntaTxt.textContent = data[0].s; // Cambia el texto
        /*if (data.questions && data.questions.length > 0) {
            preguntaTxt.textContent = data.questions[0].s; // Cambia el texto
        } else {
            preguntaTxt.textContent = "No se encontraron preguntas.";
        }*/
    })
    .catch(error => {
        preguntaTxt.textContent = "Error al obtener preguntas: " + error.message;
        console.error("Error al obtener preguntas:", error);
    });
});