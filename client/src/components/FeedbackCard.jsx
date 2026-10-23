// components/FeedbackCard.jsx
// One feedback shown as a card. `person` is who to show (giver or receiver).

import StarRating from './StarRating';
import { CATEGORY_COLORS, formatDate } from '../utils/constants';

export default function FeedbackCard({ feedback, personLabel, person, actions }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{personLabel}</p>
          {person ? (
            <p className="font-semibold">
              {person.name} <span className="text-sm font-normal text-slate-500">· {person.rollNo}</span>
            </p>
          ) : (
            <p className="font-semibold italic text-slate-500">Anonymous</p>
          )}
        </div>
        <span className={`badge ${CATEGORY_COLORS[feedback.category]}`}>{feedback.category}</span>
      </div>

      <StarRating value={feedback.rating} size="text-lg" />
      <p className="text-sm leading-relaxed text-slate-700">{feedback.comment}</p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>
          {formatDate(feedback.createdAt)}
          {feedback.isAnonymous && person && ' · posted anonymously'}
        </span>
        {actions}
      </div>
    </div>
  );
}
