const mongoService = require('../services/mongoService');
const mongoose = require('mongoose');

async function createStudent(req, res) {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: "Nom et email requis" });
        }

        const newStudent = { name, email, createdAt: new Date() };
        const result = await mongoService.insertOne('students', newStudent);
        res.status(201).json({ message: "Étudiant créé", id: result.insertedId });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function getStudent(req, res) {
    try {
        const { id } = req.params;
        const student = await mongoService.findOne('students', { _id: mongoService.toObjectId(id) });

        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validation de l'ID
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ 
        message: "ID étudiant invalide",
        details: "L'ID fourni n'est pas un ObjectId MongoDB valide"
      });
    }

    if (!name && !email) {
      return res.status(400).json({ message: "Nom ou email requis" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    const result = await mongoService.updateOne(
      'students',
      { _id: new mongoose.Types.ObjectId(id) }, 
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        message: "Étudiant non trouvé ou aucune modification appliquée" 
      });
    }

    res.status(200).json({ message: "Étudiant mis à jour" });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur interne", 
      error: error.message 
    });
  }
}

async function deleteStudent(req, res) {
    try {
        const id = String(req.params.id);

        if (!mongoService.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID non valide" });
        }

        const cacheKey = `student:${id}`;
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
            console.log(" Récupéré depuis le cache");
            return res.status(200).json(JSON.parse(cachedData));
        }

        const objectId = mongoService.toObjectId(id);
        const student = await mongoService.findOne('students', { _id: objectId });

        if (!student) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
        }

        await redisService.set(cacheKey, JSON.stringify(student), 3600);

        res.status(200).json({ message: "Étudiant supprimé avec succès" });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

// Inscrire un étudiant à un cours
async function enrollStudent(req, res) {
    try {
        const { studentId, courseId } = req.body;

        // Vérifier si l'étudiant et le cours existent
        const student = await mongoService.findOne('students', { _id: mongoService.toObjectId(studentId) });
        const course = await mongoService.findOne('courses', { _id: mongoService.toObjectId(courseId) });

        if (!student || !course) {
            return res.status(404).json({ message: "Étudiant ou cours non trouvé" });
        }

        const enrollment = { studentId, courseId, enrolledAt: new Date() };
        await mongoService.insertOne('enrollments', enrollment);

        // Effacer le cache pour l'étudiant concerné
        await redisService.del(`studentCourses:${studentId}`);

        res.status(201).json({ message: "Inscription réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

// Récupérer les cours d'un étudiant
async function getStudentCourses(req, res) {
    try {
        const { studentId } = req.params;

        const cacheKey = `studentCourses:${studentId}`;
        const cachedData = await redisService.get(cacheKey);

        if (cachedData) {
            console.log(" Récupéré depuis le cache");
            return res.status(200).json(JSON.parse(cachedData));
        }

        const enrollments = await mongoService.find('enrollments', { studentId });

        if (!enrollments.length) {
            return res.status(404).json({ message: "Aucun cours trouvé pour cet étudiant" });
        }

        const courseIds = enrollments.map(enrollment => mongoService.toObjectId(enrollment.courseId));

        const courses = await mongoService.find('courses', { _id: { $in: courseIds } });

        await redisService.set(cacheKey, JSON.stringify(courses), 3600); // Cache pendant 1h

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne", error: error.message });
    }
}

module.exports = { createStudent, getStudent, updateStudent, deleteStudent, enrollStudent, getStudentCourses };
