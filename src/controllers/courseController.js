// Question: Quelle est la différence entre un contrôleur et une route ?
// Réponse:
// Question : Pourquoi séparer la logique métier des routes ?
// Réponse :

const mongoService = require('../services/mongoService');

async function createCourse(req, res) {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Titre et description requis" });
        }

        const newCourse = { title, description, createdAt: new Date() };
        const result = await mongoService.insertOne('courses', newCourse);
        res.status(201).json({ message: "Cours créé", id: result.insertedId });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function getCourses(req, res) {
    try {
        const cacheKey = 'courses:all';
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
            console.log(" Récupéré depuis le cache");
            return res.status(200).json(JSON.parse(cachedData));
        }

        const courses = await mongoService.find('courses', {});

        if (!courses.length) {
            return res.status(404).json({ message: "Aucun cours trouvé" });
        }

        await redisService.set(cacheKey, JSON.stringify(courses), 3600); // Cache pendant 1h
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function getCourse(req, res) {
    try {
        const id = String(req.params.id);

        if (!mongoService.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID non valide" });
        }

        const cacheKey = `course:${id}`;
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
            console.log(" Récupéré depuis le cache");
            return res.status(200).json(JSON.parse(cachedData));  // Convertir en objet JS
        }

        const objectId = mongoService.toObjectId(id);
        const course = await mongoService.findOne('courses', { _id: objectId });

        if (!course) {
            return res.status(404).json({ message: "Cours non trouvé" });
        }

        await redisService.set(cacheKey, JSON.stringify(course), 3600); // Cache pendant 1 heure

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function updateCourse(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title && !description) {
            return res.status(400).json({ message: "Titre ou description requis" });
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;

        const result = await mongoService.updateOne('courses', { _id: mongoService.toObjectId(id) }, { $set: updateFields });

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Cours non trouvé ou aucune modification appliquée" });
        }

         // Mettre à jour le cache
         await redisService.set(`course:${id}`, JSON.stringify(updatedCourse), 3600);

        res.status(200).json({ message: "Cours mis à jour" });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function deleteCourse(req, res) {
    try {
        const { id } = req.params;
        const result = await mongoService.deleteOne('courses', { _id: mongoService.toObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Cours non trouvé" });
        }

        res.status(200).json({ message: "Cours supprimé avec succès" });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function getCourseStats(req, res) {
  try {
      const totalCourses = await mongoService.countDocuments('courses', {});
      const latestCourse = await mongoService.findOne('courses', {}, { sort: { createdAt: -1 } });

      res.status(200).json({
          totalCourses,
          latestCourse
      });

  } catch (error) {
      res.status(500).json({ message: "Erreur interne", error: error.message });
  }
}

// Export des contrôleurs

module.exports = { createCourse, getCourses, getCourse, updateCourse, deleteCourse, getCourseStats };