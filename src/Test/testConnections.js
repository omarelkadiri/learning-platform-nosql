const { connectMongo, connectRedis, closeConnections, getMongoDB, getRedisClient } = require('../config/db'); // Importation du module
const config = require('../config/env');

async function testConnections() {
    try {
        console.log(' Test de la connexion à MongoDB...');
        const db = await connectMongo();
        console.log(` Base de données MongoDB connectée : ${config.mongodb.dbName}`);

        //  Test MongoDB : Création d'une collection temporaire et insertion d'un document
        console.log(' Insertion d\'un document test dans MongoDB...');
        const collection = db.collection('test_collection');
        const result = await collection.insertOne({ message: 'Hello MongoDB' });
        console.log(' Document inséré avec l\'ID :', result.insertedId);

        console.log(' Test de la connexion à Redis...');
        const redisClient = await connectRedis();
        console.log(' Redis connecté');

        //  Test Redis : Stockage et récupération d'une valeur
        console.log(' Stockage d\'une clé test dans Redis...');
        await redisClient.set('test_key', 'Hello Redis');
        const redisValue = await redisClient.get('test_key');
        console.log(' Valeur récupérée depuis Redis :', redisValue);

    } catch (error) {
        console.error(' Une erreur est survenue :', error.message);
    } finally {
        console.log(' Fermeture des connexions...');
        await closeConnections();
        console.log(' Connexions fermées proprement.');
    }
}

// Exécution du test
testConnections();
