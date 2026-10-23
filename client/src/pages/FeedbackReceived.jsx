import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import FeedbackCard from '../components/FeedbackCard';
import StarRating from '../components/StarRating';
import { PageHeader, EmptyState } from './StudentsDirectory';
import { errorMessage } from '../utils/constants';

export default function FeedbackReceived() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/feedback/received')
      .then((res) => setFeedbacks(res.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading your feedback..." />;

  const avg = feedbacks.length
    ? Math.round((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length) * 10) / 10
    : 0;

  return (
    <div>
      <PageHeader title="Feedback Received" subtitle="What your classmates think about you" />

      {feedbacks.length === 0 ? (
        <EmptyState text="No feedback yet. It'll show up here when classmates rate you." />
      ) : (
        <>
          <div className="card mb-6 flex items-center gap-4">
            <p className="text-4xl font-bold">{avg}</p>
            <div>
              <StarRating value={avg} />
              <p className="text-sm text-slate-500">
                Average from {feedbacks.length} feedback{feedbacks.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {feedbacks.map((f) => (
              // givenBy is null when anonymous -> card shows "Anonymous"
              <FeedbackCard key={f._id} feedback={f} personLabel="From" person={f.givenBy} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
