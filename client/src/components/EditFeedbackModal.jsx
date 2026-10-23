// components/EditFeedbackModal.jsx
// Edit form used by both students (own feedback) and admin.

import { useEffect, useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import { CATEGORIES } from '../utils/constants';

export default function EditFeedbackModal({ feedback, onClose, onSave, showAnonymous = false }) {
  const [form, setForm] = useState({ category: '', rating: 0, comment: '', isAnonymous: false });
  const [saving, setSaving] = useState(false);

  // Fill the form whenever a new feedback is opened
  useEffect(() => {
    if (feedback) {
      setForm({
        category: feedback.category,
        rating: feedback.rating,
        comment: feedback.comment,
        isAnonymous: feedback.isAnonymous,
      });
    }
  }, [feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { category: form.category, rating: form.rating, comment: form.comment.trim() };
    if (showAnonymous) payload.isAnonymous = form.isAnonymous;
    const ok = await onSave(payload);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal open={Boolean(feedback)} title="Edit feedback" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Rating</label>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} size="text-2xl" />
        </div>

        <div>
          <label className="label">Comment</label>
          <textarea
            className="input min-h-24"
            maxLength={500}
            required
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{form.comment.length}/500</p>
        </div>

        {showAnonymous && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
            />
            Post anonymously
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving || !form.comment.trim()}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
