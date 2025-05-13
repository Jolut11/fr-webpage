fetch("https://fr-app.onrender.com/get_cuestionary")
    .then(response => {
        if (!response.ok) {
            throw new Error("Respuesta de red no fue ok");
        }
        return response.json();
        })
    .then(data => {
        console.log("Datos obtenidos: " + data[0].o.length + "!");
        for (const opcion of data[0].o) {
            console.log("Opción: " + opcion.id + " - " + opcion.t);
        }
    })
    .catch(error => {
        console.error("Error al obtener preguntas:", error);
    });