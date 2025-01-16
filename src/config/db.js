// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse : 
// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse : 
const { MongoClient } = require('mongodb');
const redis = require('redis');
const config = require('./env');

let mongoClient, redisClient, db;


 // Connexion à MongoDB avec gestion des erreurs et des retries.
 
async function connectMongo(retries = 5, delay = 5000) {
    if (mongoClient) return db; // Retourne l'instance si déjà connectée

    try {
        mongoClient = new MongoClient(config.mongodb.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await mongoClient.connect();
        console.log(' Connexion à MongoDB réussie');

        db = mongoClient.db(config.mongodb.dbName);
        return db;
    } catch (error) {
        console.error(` Erreur de connexion à MongoDB : ${error.message}`);

        if (retries > 0) {
            console.log(` Nouvelle tentative dans ${delay / 1000} secondes... (${retries} essais restants)`);
            setTimeout(() => connectMongo(retries - 1, delay), delay);
        } else {
            console.error(' Impossible de se connecter à MongoDB après plusieurs tentatives');
            process.exit(1);
        }
    }
}


 // Connexion à Redis avec gestion des erreurs et des retries.
 
async function connectRedis(retries = 5, delay = 5000) {
    if (redisClient) return redisClient;

    return new Promise((resolve, reject) => {
        redisClient = redis.createClient({ url: config.redis.uri });

        redisClient.on('connect', () => {
            console.log(' Connexion à Redis réussie');
            resolve(redisClient);
        });

        redisClient.on('error', async (error) => {
            console.error(` Erreur de connexion à Redis : ${error.message}`);

            if (retries > 0) {
                console.log(` Nouvelle tentative dans ${delay / 1000} secondes... (${retries} essais restants)`);
                setTimeout(() => connectRedis(retries - 1, delay).then(resolve).catch(reject), delay);
            } else {
                console.error(' Impossible de se connecter à Redis après plusieurs tentatives');
                process.exit(1);
            }
        });

        redisClient.connect();
    });
}
/*
********** Remarque :
L'utilisation des Promises pour connecter Redis offre plusieurs avantages :

    - Attendre que la connexion soit prête 
        Sans Promise, le code peut essayer d'utiliser Redis avant que la connexion ne soit établie, causant des erreurs.

    - Utilisation facile avec async/await 
        Permet d'écrire du code plus propre et lisible, évitant les callbacks imbriqués.

    - Gestion propre des erreurs et des retries 
        On peut capturer les erreurs et réessayer la connexion automatiquement en cas d’échec.

    - Réutilisation du client Redis 
        On s'assure qu'une seule connexion est créée et réutilisée au lieu d'ouvrir plusieurs connexions inutiles.
*/


// * Fermeture propre des connexions MongoDB et Redis.
 
async function closeConnections() {
    if (mongoClient) {
        await mongoClient.close();
        console.log(' Connexion MongoDB fermée');
    }
    if (redisClient) {
        await redisClient.quit();
        console.log(' Connexion Redis fermée');
    }
}

// Écoute des signaux pour fermer proprement les connexions avant l'arrêt
process.on('SIGINT', async () => {
    console.log('\n Fermeture propre des connexions...');
    await closeConnections();
    process.exit(0);
});

module.exports = {
    connectMongo,
    connectRedis,
    closeConnections,
    getMongoDB: () => db,
    getRedisClient: () => redisClient
};
