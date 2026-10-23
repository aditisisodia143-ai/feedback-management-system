// components/Navbar.jsx

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { homeFor } from './ProtectedRoute';

const studentLinks = [
  { to: '/students', label: 'Students' },
  { to: '/feedback/received', label: 'Received' },
  { to: '/feedback/given', label: 'Given' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const links = user.role === 'admin' ? [{ to: '/admin', label: 'Dashboard' }] : studentLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={homeFor(user)} className="flex items-center gap-2 font-bold text-indigo-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">★</span>
          PeerPulse
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role === 'admin' ? 'Administrator' : user.rollNo}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="text-2xl md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <p className="mb-2 text-sm font-semibold">{user.name}</p>
          <nav className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} className="btn-secondary mt-3 w-full">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
