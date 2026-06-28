import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Logo.png';
import { registerPatient } from '../services/patientService';
import { isNetworkError, extractErrorMessage } from '../services/api';
import { fieldCls, labelCls } from '../utils/formatters';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  contactNumber: z.string().regex(
    /^(010|011|012|015)\d{8}$/,
    'Enter a valid Egyptian mobile number (e.g. 01012345678)'
  ),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(0, 'Age must be between 0 and 150')
    .max(150, 'Age must be between 0 and 150'),
  streetAddress: z
    .string()
    .min(3, 'Street address must be at least 3 characters')
    .max(100, 'Street address must be at most 100 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be at most 50 characters'),
  state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be at most 50 characters'),
  country: z.string().min(1, 'Country is required'),
  doctorEmail: z.string().email('Please enter a valid doctor email address'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    setSuccessMsg('');
    try {
      await registerPatient(data);
      navigate('/login');
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setSuccessMsg('Account created successfully! Redirecting you to login…');
        setTimeout(() => navigate('/login'), 2200);
        return;
      }
      setServerError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-2xl">

        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Cardia" className="h-14 w-auto object-contain mb-3" />
          <h2 className="text-xl font-semibold text-gray-800">Create Your Account</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Join Cardia and start monitoring your heart health
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ahmed Hassan"
                autoComplete="name"
                className={fieldCls(!!errors.name)}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Username</label>
              <input
                type="text"
                {...register('userName')}
                placeholder="ahmed.hassan"
                autoComplete="username"
                className={fieldCls(!!errors.userName)}
              />
              {errors.userName && <p className="mt-1.5 text-xs text-red-600">{errors.userName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={fieldCls(!!errors.email)}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                className={fieldCls(!!errors.password)}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Contact Number</label>
              <input
                type="tel"
                {...register('contactNumber')}
                placeholder="01012345678"
                autoComplete="tel"
                className={fieldCls(!!errors.contactNumber)}
              />
              {errors.contactNumber && <p className="mt-1.5 text-xs text-red-600">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Age</label>
              <input
                type="number"
                {...register('age')}
                placeholder="e.g. 25"
                min={0}
                max={150}
                className={fieldCls(!!errors.age)}
              />
              {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Street Address</label>
              <input
                type="text"
                {...register('streetAddress')}
                placeholder="12 Tahrir Square"
                autoComplete="street-address"
                className={fieldCls(!!errors.streetAddress)}
              />
              {errors.streetAddress && <p className="mt-1.5 text-xs text-red-600">{errors.streetAddress.message}</p>}
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="Cairo"
                autoComplete="address-level2"
                className={fieldCls(!!errors.city)}
              />
              {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className={labelCls}>State</label>
              <input
                type="text"
                {...register('state')}
                placeholder="Cairo Governorate"
                autoComplete="address-level1"
                className={fieldCls(!!errors.state)}
              />
              {errors.state && <p className="mt-1.5 text-xs text-red-600">{errors.state.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Country</label>
              <input
                type="text"
                {...register('country')}
                placeholder="Egypt"
                autoComplete="country-name"
                className={fieldCls(!!errors.country)}
              />
              {errors.country && <p className="mt-1.5 text-xs text-red-600">{errors.country.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Assigned Doctor Email</label>
              <input
                type="email"
                {...register('doctorEmail')}
                placeholder="doctor@cardia.health"
                autoComplete="off"
                className={fieldCls(!!errors.doctorEmail)}
              />
              {errors.doctorEmail && <p className="mt-1.5 text-xs text-red-600">{errors.doctorEmail.message}</p>}
            </div>

          </div>

          {successMsg && (
            <div className="mt-5 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-green-700">{successMsg}</p>
            </div>
          )}

          {serverError && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-6 shadow-sm"
          >
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
