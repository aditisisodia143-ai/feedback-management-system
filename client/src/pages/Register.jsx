import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './Login';
import {
  DEPARTMENTS,
  YEARS,
  ROLL_NO_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX,
  errorMessage,
} from '../utils/constants';

const emptyForm = {
  name: '',
  email: '',
  rollNo: '',
  department: '',
  year: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

// Frontend validation (the backend checks all of this again)
const validate = (f) => {
  const errors = {};
  if (!f.name.trim()) errors.name = 'Name is required';
  if (!EMAIL_REGEX.test(f.email.trim())) errors.email = 'Enter a valid email';
  if (!ROLL_NO_REGEX.test(f.rollNo.trim().toUpperCase())) errors.rollNo = 'Format must be like 23BCS1042';
  if (!f.department) errors.department = 'Select your department';
  if (!f.year) errors.year = 'Select your year';
  if (!PHONE_REGEX.test(f.phone)) errors.phone = 'Phone must be exactly 10 digits';
  if (f.password.length < 6) errors.password = 'At least 6 characters';
  if (f.confirmPassword !== f.password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined }); // clear error as the user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await register({ ...form, rollNo: form.rollNo.trim().toUpperCase(), email: form.email.trim() });
      toast.success('Account created!');
      navigate('/students');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Small helper to render one input with its label and error
  const field = (name, label, props = {}) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={form[name]} onChange={update(name)} {...props} />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create your account" subtitle="Join your batch and start sharing feedback">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {field('name', 'Full name', { placeholder: 'Aarav Sharma' })}
        {field('email', 'Email', { type: 'email', placeholder: 'aarav.sharma@student.college.edu' })}

        <div className="grid grid-cols-2 gap-3">
          {field('rollNo', 'Roll number', { placeholder: '23BCS1042', className: 'input uppercase' })}
          {field('phone', 'Phone', { placeholder: '9876543210', inputMode: 'numeric', maxLength: 10 })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={update('department')}>
              <option value="">Select</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            {errors.department && <p className="error-text">{errors.department}</p>}
          </div>
          <div>
            <label className="label">Year</label>
            <select className="input" value={form.year} onChange={update('year')}>
              <option value="">Select</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
            {errors.year && <p className="error-text">{errors.year}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('password', 'Password', { type: 'password' })}
          {field('confirmPassword', 'Confirm password', { type: 'password' })}
        </div>

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
