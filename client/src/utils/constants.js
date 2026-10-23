// Same lists as the backend models, so dropdowns always match

export const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'CSE-AI/ML', 'ME'];
export const YEARS = [1, 2, 3, 4];
export const CATEGORIES = [
  'Technical Skills',
  'Communication',
  'Teamwork',
  'Behaviour',
  'Leadership',
  'Punctuality',
];

export const ROLL_NO_REGEX = /^\d{2}B[A-Z]{2}\d{4}$/; // e.g. 23BCS1042
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const PHONE_REGEX = /^\d{10}$/;

// Color for each category badge
export const CATEGORY_COLORS = {
  'Technical Skills': 'bg-indigo-50 text-indigo-700',
  Communication: 'bg-sky-50 text-sky-700',
  Teamwork: 'bg-emerald-50 text-emerald-700',
  Behaviour: 'bg-amber-50 text-amber-700',
  Leadership: 'bg-violet-50 text-violet-700',
  Punctuality: 'bg-rose-50 text-rose-700',
};

export const yearLabel = (y) => ['1st', '2nd', '3rd', '4th'][y - 1] + ' year';

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Pull a readable message out of an axios error
export const errorMessage = (err) =>
  err.response?.data?.message ||
  (err.code === 'ECONNABORTED' ? 'Server is taking too long. Please try again.' : 'Something went wrong');
