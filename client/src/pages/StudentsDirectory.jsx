import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import { DEPARTMENTS, YEARS, yearLabel, errorMessage } from '../utils/constants';

export default function StudentsDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', department: '', year: '' });

  // Re-fetch whenever filters change (small delay so we don't call on every keystroke)
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/students', { params: filters })
        .then((res) => setStudents(res.data))
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  return (
    <div>
      <PageHeader title="Students" subtitle="Find a classmate and share your feedback" />

      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_180px_150px]">
        <input
          className="input"
          placeholder="Search by name or roll number..."
          value={filters.search}
          onChange={setFilter('search')}
        />
        <select className="input" value={filters.department} onChange={setFilter('department')}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select className="input" value={filters.year} onChange={setFilter('year')}>
          <option value="">All years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {yearLabel(y)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading students..." />
      ) : students.length === 0 ? (
        <EmptyState text="No students match your search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Link
              key={s._id}
              to={`/students/${s._id}`}
              className="card group transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Avatar name={s.name} />
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-indigo-700">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.rollNo}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="badge bg-slate-100 text-slate-600">
                  {s.department} · {yearLabel(s.year)}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <StarRating value={s.avgRating} size="text-sm" />
                  <span className="text-xs">({s.feedbackCount})</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Small shared UI pieces (used by other pages too)
export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Avatar({ name, size = 'h-11 w-11 text-base' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700 ${size}`}>
      {initials}
    </div>
  );
}

export function EmptyState({ text }) {
  return <div className="card py-12 text-center text-sm text-slate-500">{text}</div>;
}
