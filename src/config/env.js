// Question: Pourquoi est-il important de valider les variables d'environnement au démarrage ?
// Réponse : 
// Question: Que se passe-t-il si une variable requise est manquante ?
// Réponse : 

const dotenv = require('dotenv');
dotenv.config();

 requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'REDIS_URI'
];

// Validation des variables d'environnement
  // Affiche une erreur et arrête le processus si une variable est manquante.
function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(` Erreur : Les variables d'environnement suivantes sont manquantes : ${missingVars.join(', ')}`);
    process.exit(1); // Stoppe l'exécution du programme
  }
}

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME
  },
  redis: {
    uri: process.env.REDIS_URI
  },
  port: process.env.PORT || 3000
};