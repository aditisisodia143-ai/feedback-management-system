import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import { Avatar } from './StudentsDirectory';
import { CATEGORIES, yearLabel, errorMessage } from '../utils/constants';

const emptyForm = { category: '', rating: 0, comment: '', isAnonymous: false };

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadStudent = useCallback(() => {
    return api
      .get(`/students/${id}`)
      .then((res) => setStudent(res.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  if (loading) return <Loader text="Loading profile..." />;
  if (!student) return <p className="text-center text-slate-500">Student not found.</p>;

  const isSelf = student._id === user._id; // frontend block for self-feedback
  const remaining = CATEGORIES.filter((c) => !student.alreadyGivenCategories.includes(c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error('Choose a category');
    if (!form.rating) return toast.error('Give a star rating');
    if (!form.comment.trim()) return toast.error('Write a comment');

    setSubmitting(true);
    try {
      await api.post('/feedback', { ...form, comment: form.comment.trim(), givenTo: student._id });
      toast.success(`Feedback sent to ${student.name.split(' ')[0]}!`);
      setForm(emptyForm);
      await loadStudent(); // refresh average + used categories
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/students" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        ← Back to students
      </Link>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Profile card */}
        <div className="card h-fit text-center">
          <Avatar name={student.name} size="mx-auto h-20 w-20 text-2xl" />
          <h1 className="mt-3 text-xl font-bold">{student.name}</h1>
          <p className="text-slate-500">{student.rollNo}</p>
          <p className="mt-1 text-sm text-slate-500">
            {student.department} · {yearLabel(student.year)}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-3xl font-bold text-slate-800">{student.avgRating || '–'}</p>
            <StarRating value={student.avgRating} />
            <p className="text-xs text-slate-500">
              Average from {student.feedbackCount} feedback{student.feedbackCount === 1 ? '' : 's'}
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-500">{student.email}</p>
        </div>

        {/* Give feedback form */}
        <div className="card">
          <h2 className="mb-1 text-lg font-semibold">Give feedback</h2>
          <p className="mb-5 text-sm text-slate-500">
            Be honest and kind. You can give one feedback per category.
          </p>

          {isSelf ? (
            <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">You can't give feedback to yourself.</p>
          ) : remaining.length === 0 ? (
            <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              You've given feedback in every category to {student.name}. You can edit it from{' '}
              <Link to="/feedback/given" className="font-semibold underline">
                Feedback Given
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const used = !remaining.includes(c);
                    const active = form.category === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        disabled={used}
                        title={used ? 'Already given' : ''}
                        onClick={() => setForm({ ...form, category: c })}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          active
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : used
                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                              : 'border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">Rating</label>
                <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} size="text-3xl" />
              </div>

              <div>
                <label className="label">Comment</label>
                <textarea
                  className="input min-h-28"
                  maxLength={500}
                  placeholder="What did they do well? What could they improve?"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.comment.length}/500</p>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                />
                Post anonymously (the student won't see your name)
              </label>

              <button className="btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Submit feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
