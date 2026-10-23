// components/StarRating.jsx
// Shows 5 stars. If onChange is given, the stars are clickable (for forms);
// otherwise they're just a picture of the rating.

import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'text-xl' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const color = (star) => (star <= Math.round(shown) ? 'text-amber-400' : 'text-slate-300');

  // Read-only version
  if (!onChange) {
    return (
      <span className={`inline-flex gap-0.5 leading-none ${size}`} aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={color(star)}>
            ★
          </span>
        ))}
      </span>
    );
  }

  // Clickable version
  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className={`${size} cursor-pointer leading-none transition hover:scale-110 ${color(star)}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
