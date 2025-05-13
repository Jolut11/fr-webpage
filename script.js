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
        preguntaTxt.textContent = data[0].s;
    })
    .catch(error => {
        preguntaTxt.textContent = "Error al obtener preguntas: " + error.message;
        console.error("Error al obtener preguntas:", error);
    });
});