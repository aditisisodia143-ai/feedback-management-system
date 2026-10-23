// App.jsx
// All pages and who is allowed to open them.

import { Navigate, Route, Routes, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentsDirectory from './pages/StudentsDirectory';
import StudentProfile from './pages/StudentProfile';
import FeedbackReceived from './pages/FeedbackReceived';
import FeedbackGiven from './pages/FeedbackGiven';
import AdminDashboard from './pages/AdminDashboard';

// Wraps a page: role check + navbar + page width
const page = (element, role) => (
  <ProtectedRoute role={role}>
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-8">{element}</main>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      {/* Guests only (logged-in users get redirected home) */}
      <Route path="/login" element={<ProtectedRoute guestOnly><Login /></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute guestOnly><Register /></ProtectedRoute>} />

      {/* Students only */}
      <Route path="/students" element={page(<StudentsDirectory />, 'student')} />
      <Route path="/students/:id" element={page(<StudentProfile />, 'student')} />
      <Route path="/feedback/received" element={page(<FeedbackReceived />, 'student')} />
      <Route path="/feedback/given" element={page(<FeedbackGiven />, 'student')} />

      {/* Admin only */}
      <Route path="/admin" element={page(<AdminDashboard />, 'admin')} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="*"
        element={
          <div className="grid min-h-screen place-items-center text-center">
            <div>
              <p className="text-5xl font-bold text-indigo-600">404</p>
              <p className="mb-4 text-slate-500">Page not found</p>
              <Link to="/" className="btn-primary">Go home</Link>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
