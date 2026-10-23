// components/Loader.jsx
// Spinner; after a few seconds explains that the free server may be waking up.

import { useEffect, useState } from 'react';

export default function Loader({ text = 'Loading...' }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-sm">{text}</p>
      {slow && (
        <p className="max-w-xs text-center text-xs text-slate-400">
          The server may be waking up (free hosting). This can take up to a minute the first time.
        </p>
      )}
    </div>
  );
}
