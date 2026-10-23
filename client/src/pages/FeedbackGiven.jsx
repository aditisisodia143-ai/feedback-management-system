import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import FeedbackCard from '../components/FeedbackCard';
import EditFeedbackModal from '../components/EditFeedbackModal';
import { ConfirmDialog } from '../components/Modal';
import { PageHeader, EmptyState } from './StudentsDirectory';
import { errorMessage } from '../utils/constants';

export default function FeedbackGiven() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // feedback being edited
  const [deleting, setDeleting] = useState(null); // feedback being deleted
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/feedback/given')
      .then((res) => setFeedbacks(res.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (changes) => {
    try {
      const res = await api.put(`/feedback/${editing._id}`, changes);
      setFeedbacks(feedbacks.map((f) => (f._id === res.data._id ? res.data : f)));
      toast.success('Feedback updated');
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/feedback/${deleting._id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== deleting._id));
      toast.success('Feedback deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader text="Loading feedback you gave..." />;

  return (
    <div>
      <PageHeader title="Feedback Given" subtitle="Feedback you've written for classmates" />

      {feedbacks.length === 0 ? (
        <EmptyState
          text={
            <>
              You haven't given any feedback yet.{' '}
              <Link to="/students" className="font-semibold text-indigo-600">
                Find a classmate →
              </Link>
            </>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {feedbacks.map((f) => (
            <FeedbackCard
              key={f._id}
              feedback={f}
              personLabel="To"
              person={f.givenTo}
              actions={
                <div className="flex gap-3">
                  <button onClick={() => setEditing(f)} className="font-semibold text-indigo-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => setDeleting(f)} className="font-semibold text-rose-600 hover:underline">
                    Delete
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <EditFeedbackModal feedback={editing} onClose={() => setEditing(null)} onSave={handleSave} showAnonymous />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete feedback?"
        message={`This will permanently remove your ${deleting?.category} feedback for ${deleting?.givenTo?.name}.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        busy={busy}
      />
    </div>
  );
}
