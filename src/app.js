require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectMongo } = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { config } = require('dotenv');
const { port } = require ('./config/env')

const app = express();

// Middleware CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion à MongoDB
connectMongo().then(() => {
    console.log(' Connecté à MongoDB');
}).catch(err => {
    console.error(' Erreur de connexion MongoDB:', err);
});

// Définition des routes
app.use('/courses', courseRoutes);
app.use('/students', studentRoutes);

// Route d’accueil
app.get('/', (req, res) => {
    res.send('***** API de gestion des cours fonctionne !');
});

// Port et démarrage du serveur
app.listen(port, () => {
    console.log(`***** Serveur lancé sur http://localhost:${port}`);
});
