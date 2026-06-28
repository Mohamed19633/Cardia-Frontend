import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatient } from '../../context/PatientContext';
import { updatePatient } from '../../services/patientService';
import { extractErrorMessage } from '../../services/api';
import { fieldCls, labelCls } from '../../utils/formatters';
import Spinner from '../../components/Spinner';

const updateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  contactNumber: z.string().regex(
    /^(010|011|012|015)\d{8}$/,
    'Enter a valid Egyptian mobile number'
  ),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .int()
    .min(0)
    .max(150, 'Age must be between 0 and 150'),
  streetAddress: z
    .string()
    .min(3, 'Street address must be at least 3 characters')
    .max(100, 'Street address must be at most 100 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50),
  state: z.string().min(2, 'State must be at least 2 characters').max(50),
  country: z.string().min(1, 'Country is required'),
  doctorEmail: z.string().email('Please enter a valid doctor email address'),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function PatientPersonalDetails() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refetch } = usePatient();

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        userName: profile.userName,
        email: profile.email,
        password: '',
        contactNumber: profile.contactNumber,
        age: profile.age,
        streetAddress: profile.streetAddress,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        doctorEmail: profile.doctorEmail,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateFormData) => {
    try {
      await updatePatient(data);
      refetch();
      navigate('/patient');
    } catch (err: unknown) {
      setFieldError('root', {
        message: extractErrorMessage(err, 'Update failed. Please try again.'),
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Update Your Information</h3>
            <p className="text-blue-100 text-xs mt-0.5">Changes are saved immediately to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" {...register('name')} placeholder="Ahmed Hassan" className={fieldCls(!!errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Username</label>
              <input type="text" {...register('userName')} placeholder="ahmed.hassan" className={fieldCls(!!errors.userName)} />
              {errors.userName && <p className="mt-1.5 text-xs text-red-600">{errors.userName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" {...register('email')} placeholder="you@example.com" className={fieldCls(!!errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelCls}>New Password</label>
              <input type="password" {...register('password')} placeholder="••••••••" autoComplete="new-password" className={fieldCls(!!errors.password)} />
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Contact Number</label>
              <input type="tel" {...register('contactNumber')} placeholder="01012345678" className={fieldCls(!!errors.contactNumber)} />
              {errors.contactNumber && <p className="mt-1.5 text-xs text-red-600">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Age</label>
              <input type="number" {...register('age')} min={0} max={150} className={fieldCls(!!errors.age)} />
              {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Street Address</label>
              <input type="text" {...register('streetAddress')} placeholder="12 Tahrir Square" className={fieldCls(!!errors.streetAddress)} />
              {errors.streetAddress && <p className="mt-1.5 text-xs text-red-600">{errors.streetAddress.message}</p>}
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input type="text" {...register('city')} placeholder="Cairo" className={fieldCls(!!errors.city)} />
              {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className={labelCls}>State</label>
              <input type="text" {...register('state')} placeholder="Cairo Governorate" className={fieldCls(!!errors.state)} />
              {errors.state && <p className="mt-1.5 text-xs text-red-600">{errors.state.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Country</label>
              <input type="text" {...register('country')} placeholder="Egypt" className={fieldCls(!!errors.country)} />
              {errors.country && <p className="mt-1.5 text-xs text-red-600">{errors.country.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Assigned Doctor Email</label>
              <input type="email" {...register('doctorEmail')} placeholder="doctor@cardia.health" className={fieldCls(!!errors.doctorEmail)} />
              {errors.doctorEmail && <p className="mt-1.5 text-xs text-red-600">{errors.doctorEmail.message}</p>}
            </div>

          </div>

          {errors.root && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
