// components/ProtectedRoute.jsx
// Decides who may open a page:
//  - not logged in        -> go to /login
//  - wrong role           -> go to your own home page
//  - guestOnly (login/register) while logged in -> go to your home page

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/students');

export default function ProtectedRoute({ children, role, guestOnly = false }) {
  const { user, checking } = useAuth();

  if (checking) return <Loader text="Checking your session..." />;

  if (guestOnly) return user ? <Navigate to={homeFor(user)} replace /> : children;

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;

  return children;
}
