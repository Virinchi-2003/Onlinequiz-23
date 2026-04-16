const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    createExam,
    getExams,
    updateExam,
    deleteExam,
    publishExam,
    addQuestions,
    uploadQuestions,
    getExamQuestions,
    deleteQuestion,
    getExamResults,
    getStudents,
    createStudent,
    deleteStudent,
    getStudentHistory,
    getAnalytics
} = require('../controllers/adminController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// All admin routes are protected and require ADMIN role
router.use(verifyToken, isAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.post('/exams', createExam);
router.get('/exams', getExams);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);
router.post('/exams/:id/publish', publishExam);
router.post('/questions', addQuestions);
router.get('/exams/:examId/questions', getExamQuestions);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/upload', upload.single('file'), uploadQuestions);
router.get('/exams/:examId/results', getExamResults);
router.get('/students', getStudents);
router.post('/students', createStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/:studentId/history', getStudentHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
