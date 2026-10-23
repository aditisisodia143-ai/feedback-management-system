import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../components/ProtectedRoute';
import { errorMessage } from '../utils/constants';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.dismiss(); // clear any old "invalid password" message
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate(homeFor(user)); // admin -> /admin, student -> /students
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to give and view peer feedback">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            placeholder="you@student.college.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Demo logins</p>
        <p>Admin: admin@college.edu / admin123</p>
        <p>Student: aarav.sharma@student.college.edu / student123</p>
      </div>
    </AuthLayout>
  );
}

// Shared layout for Login and Register
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-2xl text-white">
            ★
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  );
}
