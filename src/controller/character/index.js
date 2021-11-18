const express = require("express");
const app = express();
const PORT = 3000;
const characters = require("../../data/personajes.json");
const movies = require("../../data/peliculas.json");
const bodyParser = require("body-parser");

const mappedCharacters = characters.map((character) => {
  return {
    ...character,
    img: `http://localhost:${PORT}/${character.img}`,
  };
});

app.use(express.static("public"));

//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

//----- Recurso PERSONAJES ------//

// Get all personajes
app.get("/personajes", (req, res) => {
  res.status(200).send(mappedCharacters);
});

// Get by nombre
app.get("/personajes/nombre/:nombre", (req, res) => {
  // Se utliza find porque devuelve undifined en caso de no encontrar coincidencia
  // Si se utilizara filter, en caso de no encontrar nada, devuelve un array vacio
  // y la condicion a evaluar seria diferente => verificando la length del array
  // Ademas, sabemos que el nombre es único para cada personaje, por eso el metodo find
  // es util
  const character = mappedCharacters.find(
    (character) => character.nombre === req.params.nombre
  );
  if (character) {
    res.status(200).send(character);
  } else {
    res
      .status(404)
      .send(`No pudo encontrarse el personaje llamado ${req.params.nombre}`);
  }
});

// Get by casa
app.get("/personajes/casa/:casa", (req, res) => {
  const character = mappedCharacters.filter(
    (character) => character.casa === req.params.casa
  );
  if (character.length) {
    res.status(200).send(character);
  } else {
    res
      .status(404)
      .send(
        `No pudo encontrarse el/los personaje/s de la casa ${req.params.casa}`
      );
  }
});

// Delete by id
app.delete("/personajes/:id", (req, res) => {
  const doesItExists = mappedCharacters.some(
    (character) => character.id === req.params.id
  );
  if (doesItExists) {
    const character = mappedCharacters.filter(
      (character) => character.id !== req.params.id
    );
    res.status(200).send(character);
  } else {
    res
      .status(404)
      .send(
        `No pudo eliminarse el personaje con ID ${req.params.id} porque no existe`
      );
  }
});

// Update un personaje
app.put("/personajes/:id", (req, res) => {
  const doesItExists = mappedCharacters.some(
    (character) => character.id === req.params.id
  );
  if (!doesItExists) {
    res
      .status(404)
      .send(
        `No pudo actualizarse el personaje porque no existe el ID ${req.params.id} en la BD`
      );
  } else if (!req.body) {
    res
      .status(404)
      .send(`No pudo actualizarse el personaje porque no existe body`);
  } else {
    const character = mappedCharacters.map((character) => {
      return character.id === req.params.id ? req.body : character;
    });
    res.status(200).send(character);
  }
});

//----- Recurso PELICULAS ------//

// Get all peliculas
app.get("/peliculas", (req, res) => {
  res.status(200).send(movies);
});

//----- Combinacion de Recursos ------//

app.get("/detalles/:nombre", (req, res) => {
  const character = mappedCharacters.find(
    (character) => character.nombre === req.params.nombre
  );
  if (!character) {
    res
      .status(404)
      .send(`No pudo encontrarse el personaje llamado ${req.params.nombre}`);
  } else {
    const peliculas = movies.filter(
      (movie) => movie.idPersonaje === character.id
    );

    peliculas.length
      ? res.status(200).send({
          ...character,
          peliculas,
        })
      : res
          .status(400)
          .send(
            `No existen peliculas asociadas al personaje ${character.nombre}`
          );
  }
});
