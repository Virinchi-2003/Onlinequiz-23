const express = require('express');
const router = express.Router();
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const {
    getAvailableExams,
    startAttempt,
    saveAnswer,
    submitAttempt,
    getResult,
    getLeaderboard,
    getPersonalRankHistory,
    getHistory,
    getDashboardSummaries,
    getPlanner,
    addPlannerTask,
    updateTaskStatus,
    deletePlannerTask
} = require('../controllers/studentController');

// All student routes are protected and require STUDENT role
router.use(verifyToken, isStudent);

router.get('/exams/available', getAvailableExams);
router.get('/dashboard/stats', getDashboardSummaries);
router.get('/history', getHistory);
router.get('/planner', getPlanner);
router.post('/planner', addPlannerTask);
router.patch('/planner/:id', updateTaskStatus);
router.delete('/planner/:id', deletePlannerTask);
router.post('/attempts/start', startAttempt);
router.post('/answers/save', saveAnswer);
router.post('/attempts/submit', submitAttempt);
router.get('/attempts/:attemptId/result', getResult);
router.get('/leaderboard/:examId', getLeaderboard);
router.get('/leaderboard/:examId/personal', getPersonalRankHistory);

module.exports = router;
