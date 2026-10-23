import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import EditFeedbackModal from '../components/EditFeedbackModal';
import { ConfirmDialog } from '../components/Modal';
import { PageHeader, Avatar } from './StudentsDirectory';
import { CATEGORIES, CATEGORY_COLORS, formatDate, yearLabel, errorMessage } from '../utils/constants';

export default function AdminDashboard() {
  const [tab, setTab] = useState('feedback');
  const [stats, setStats] = useState(null);

  // Stats are reloaded after any edit/delete so the cards stay correct
  const loadStats = useCallback(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => toast.error(errorMessage(err)));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Monitor and moderate all peer feedback" />

      {stats ? <StatsCards stats={stats} /> : <Loader text="Loading dashboard..." />}

      <div className="mb-4 mt-8 flex gap-2 border-b border-slate-200">
        {[
          ['feedback', 'All Feedback'],
          ['students', 'Students'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'feedback' ? <FeedbackTable onChange={loadStats} /> : <StudentsTable onChange={loadStats} />}
    </div>
  );
}

function StatsCards({ stats }) {
  const cards = [
    { label: 'Total students', value: stats.totalStudents, color: 'text-indigo-600' },
    { label: 'Total feedback', value: stats.totalFeedback, color: 'text-sky-600' },
    { label: 'Average rating', value: stats.averageRating || '–', color: 'text-amber-500', stars: true },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card">
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.color}`}>{c.value}</p>
          {c.stars && <StarRating value={stats.averageRating} size="text-sm" />}
        </div>
      ))}

      <div className="card">
        <p className="mb-2 text-sm text-slate-500">Top rated (min. 2 feedback)</p>
        {stats.topRated.length === 0 ? (
          <p className="text-sm text-slate-400">Not enough feedback yet</p>
        ) : (
          <ol className="space-y-1.5">
            {stats.topRated.map((s, i) => (
              <li key={s._id} className="flex items-center justify-between text-sm">
                <span className="truncate">
                  <span className="mr-1">{['🥇', '🥈', '🥉'][i]}</span>
                  {s.name}
                </span>
                <span className="font-semibold text-amber-500">★ {s.avgRating}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function FeedbackTable({ onChange }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', rating: '' });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get('/admin/feedback', { params: filters })
        .then((res) => setFeedbacks(res.data))
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const handleSave = async (changes) => {
    try {
      const res = await api.put(`/admin/feedback/${editing._id}`, changes);
      setFeedbacks(feedbacks.map((f) => (f._id === res.data._id ? res.data : f)));
      toast.success('Feedback updated');
      onChange();
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/feedback/${deleting._id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== deleting._id));
      toast.success('Feedback deleted');
      setDeleting(null);
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_190px_140px]">
        <input
          className="input"
          placeholder="Search by student name or roll no..."
          value={filters.search}
          onChange={setFilter('search')}
        />
        <select className="input" value={filters.category} onChange={setFilter('category')}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="input" value={filters.rating} onChange={setFilter('rating')}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading feedback..." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Given by</th>
                <th className="px-4 py-3">Given to</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No feedback found.
                  </td>
                </tr>
              )}
              {feedbacks.map((f) => (
                <tr key={f._id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {/* Admin always sees the real giver */}
                    <p className="font-medium">{f.givenBy?.name || 'Deleted user'}</p>
                    <p className="text-xs text-slate-500">{f.givenBy?.rollNo}</p>
                    {f.isAnonymous && <span className="badge mt-1 bg-slate-800 text-white">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{f.givenTo?.name || 'Deleted user'}</p>
                    <p className="text-xs text-slate-500">{f.givenTo?.rollNo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${CATEGORY_COLORS[f.category]}`}>{f.category}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StarRating value={f.rating} size="text-sm" />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{f.comment}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(f.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => setEditing(f)} className="mr-3 font-semibold text-indigo-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => setDeleting(f)} className="font-semibold text-rose-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-400">{feedbacks.length} feedback shown</p>

      <EditFeedbackModal feedback={editing} onClose={() => setEditing(null)} onSave={handleSave} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete feedback?"
        message={`Remove ${deleting?.givenBy?.name}'s ${deleting?.category} feedback for ${deleting?.givenTo?.name}? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        busy={busy}
      />
    </div>
  );
}

function StudentsTable({ onChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/admin/students')
      .then((res) => setStudents(res.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    setBusy(true);
    try {
      const res = await api.delete(`/admin/students/${deleting._id}`);
      setStudents(students.filter((s) => s._id !== deleting._id));
      toast.success(res.data.message);
      setDeleting(null);
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const q = search.trim().toLowerCase();
  const shown = students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));

  if (loading) return <Loader text="Loading students..." />;

  return (
    <div>
      <input
        className="input mb-4 max-w-sm"
        placeholder="Search students..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Avg rating</th>
              <th className="px-4 py-3">Received / Given</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="h-9 w-9 text-sm" />
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.rollNo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {s.department}
                  <p className="text-xs text-slate-500">{yearLabel(s.year)}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.email}
                  <p className="text-xs text-slate-500">{s.phone}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-amber-500">{s.avgRating ? `★ ${s.avgRating}` : '–'}</td>
                <td className="px-4 py-3">
                  {s.feedbackReceived} / {s.feedbackGiven}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDeleting(s)} className="font-semibold text-rose-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete student?"
        message={`This permanently deletes ${deleting?.name} and all feedback they gave and received.`}
        confirmText="Delete student"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        busy={busy}
      />
    </div>
  );
}
