const express = require("express");
const app = express();
const PORT = 3000;
const characters = require("../../data/personajes.json");
const movies = require("../../data/peliculas.json");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

let databaseObject = {};
let characterCollectionObj = {};
let moviesCollectionObj = {};

const dbConnection = async () => {
  const uri =
    "mongodb+srv://samuelt:syCWuz8p6ocEgdut@cluster0.kjpty.mongodb.net/ejemploDb?retryWrites=true&w=majority";
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    databaseObject = await client.db("ejemploDb");
    characterCollectionObj = databaseObject.collection("personajes");
    moviesCollectionObj = databaseObject.collection("peliculas");
    console.log("Cloud DB Connected - Mongo DB");
  } catch (e) {
    console.log(e);
  }
};

dbConnection().catch(console.error);

// No es necesaria porque las imagenes se sirven desde img hosteadas
//app.use(express.static("public"));

//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

//----- Recurso PERSONAJES ------//

// Get all personajes
// Las funciones pasan a ser async, debido a la consulta que se debe hacer al backend
// Pudiendo generar de que el hilo principal de procesamiento se vea demorado
app.get("/personajes", async (req, res) => {
  try {
    const allPersonajes = await characterCollectionObj.find({}).toArray();
    res.status(200).send(allPersonajes);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// Get by nombre
app.get("/personajes/nombre/:nombre", async (req, res) => {
  try {
    const personaje = await characterCollectionObj.findOne({
      nombre: req.params.nombre,
    });

    if (!personaje) {
      return res.status(404).send({
        message: `No se encontro el personaje llamado ${req.params.nombre}`,
      });
    }
    res.status(200).send(personaje);
  } catch (error) {
    return res.status(500).send({
      message: `Ocurrio algun error durante la solicitud`,
      err: error,
    });
  }
});

// Get by casa
app.get("/personajes/casa/:casa", async (req, res) => {
  try {
    const personajes = await characterCollectionObj
      .find({
        casa: req.params.casa,
      })
      .toArray();

    // {"_events":{},"_eventsCount":0} ==> Ejecutar metodo .toArray()
    // Checkear por length cuando se convierte en array

    if (!personajes.length) {
      return res.status(404).send({
        message: `No se encontraron personajes de la casa ${req.params.casa}`,
      });
    }
    res.status(200).send(personajes);
  } catch (error) {
    return res.status(500).send({
      message: `Ocurrio algun error durante la solicitud`,
      err: error,
    });
  }
});

// Add personaje
app.post("/personajes", async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(404)
        .send(`No pudo actualizarse el personaje porque no existe body`);
    }

    const newPersonaje = { ...req.body };

    await characterCollectionObj.insertOne(newPersonaje);
    res.status(200).send({
      message: "El personaje fue añadido exitosamente",
    });
  } catch (error) {
    return res.status(500).send({
      message: `Ocurrio algun error durante la solicitud`,
      err: error,
    });
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
app.get("/peliculas", async (req, res) => {
  try {
    const allPersonajes = await characterCollectionObj.find({}).toArray();
    res.status(200).send(allPersonajes);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
