const assert = require('assert');
const { connectMongo, closeConnections } = require('../config/db');
const { insertOne, find, deleteOne } = require('../services/mongoService');

async function testCourses() {
    try {
        // Connexion à MongoDB
        await connectMongo();
        console.log('Test de création et suppression de cours...');

        const collectionName = 'courses';

        // Création de trois cours
        const courses = [
            {
                title: 'JavaScript Avancé',
                description: 'Cours sur les concepts avancés de JavaScript',
                price: 299
            },
            {
                title: 'Node.js pour Débutants',
                description: 'Introduction à Node.js',
                price: 199
            },
            {
                title: 'MongoDB Mastery',
                description: 'Maîtrisez MongoDB',
                price: 249
            }
        ];

        console.log('Création des cours...');
        const insertResults = await Promise.all(
            courses.map(course => insertOne(collectionName, course))
        );
        console.log('3 cours créés avec succès');

        // Récupération de tous les cours pour vérification
        const allCourses = await find(collectionName);
        console.log('Cours stockés:', allCourses);

        // Suppression du premier cours
        const courseToDelete = allCourses[0];
        await deleteOne(collectionName, courseToDelete._id);
        console.log('Premier cours supprimé');

        // Vérification finale
        const remainingCourses = await find(collectionName);
        console.log('Cours restants:', remainingCourses);

        console.log('Test terminé avec succès!');
    } catch (error) {
        console.error('Erreur pendant le test:', error);
    } finally {
        await closeConnections();
    }
}

// Exécution du test
testCourses();