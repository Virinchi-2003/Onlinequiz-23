import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { ProtectedRoute } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageExams from './pages/admin/ManageExams';
import ExamResults from './pages/admin/ExamResults';
import AdminStudents from './pages/admin/Students';
import AdminAnalytics from './pages/admin/Analytics';
import QuestionManagement from './pages/admin/QuestionManagement';

// Common Pages
import Settings from './pages/Settings';
import HelpCenter from './pages/Help';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import AvailableExams from './pages/student/AvailableExams';
import TakeExam from './pages/student/TakeExam';
import ExamResultDetail from './pages/student/ResultDetail';
import GlobalLeaderboard from './pages/student/Leaderboards';
import StudentHistory from './pages/student/History';
import StudyPlanner from './pages/student/StudyPlanner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/exams" element={<ManageExams />} />
            <Route path="/admin/exams/:id/results" element={<ExamResults />} />
            <Route path="/admin/exams/:examId/questions" element={<QuestionManagement />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Protected Common Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpCenter />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/available-exams" element={<AvailableExams />} />
            <Route path="/student/take-exam/:examId" element={<TakeExam />} />
            <Route path="/student/results/:attemptId" element={<ExamResultDetail />} />
            <Route path="/student/history" element={<StudentHistory />} />
            <Route path="/student/leaderboards" element={<GlobalLeaderboard />} />
            <Route path="/student/planner" element={<StudyPlanner />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
