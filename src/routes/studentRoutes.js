const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Routes pour les étudiants
router.post('/', studentController.createStudent);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Route pour inscrire un étudiant à un cours
router.post('/enroll', studentController.enrollStudent);

// Route pour récupérer les cours d'un étudiant
router.get('/:studentId/courses', studentController.getStudentCourses);

module.exports = router;
