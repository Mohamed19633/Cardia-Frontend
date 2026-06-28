import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoctor } from '../../services/adminService';
import { extractErrorMessage } from '../../services/api';
import { fieldCls, labelSmCls } from '../../utils/formatters';

const addDoctorSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters'),
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
    .min(24, 'Age must be at least 24')
    .max(80, 'Age must be at most 80'),
  specialization: z.string().min(3, 'Specialization must be at least 3 characters'),
  workTime: z.string().min(1, 'Work hours are required'),
  streetAddress: z.string().min(3, 'Street address must be at least 3 characters').max(100),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  country: z.string().min(1, 'Country is required'),
});

type AddDoctorFormData = z.infer<typeof addDoctorSchema>;

export default function AdminAddDoctor() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<AddDoctorFormData>({
    resolver: zodResolver(addDoctorSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: AddDoctorFormData) => {
    try {
      await addDoctor(data);
      navigate('/admin');
    } catch (err: unknown) {
      setError('root', {
        message: extractErrorMessage(err, 'Failed to register doctor. Please try again.'),
      });
    }
  };

  if (isSubmitSuccessful) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Add New Doctor</h2>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Doctor Registration Form</h3>
            <p className="text-teal-100 text-xs mt-0.5">Fill in all required fields to register a new doctor</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

            <div>
              <label className={labelSmCls}>Full Name *</label>
              <input type="text" {...register('name')} placeholder="Dr. Janna Mostafa" className={fieldCls(!!errors.name, 'indigo')} />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Username *</label>
              <input type="text" {...register('userName')} placeholder="dr.janna.mostafa" className={fieldCls(!!errors.userName, 'indigo')} />
              {errors.userName && <p className="mt-1.5 text-xs text-red-600">{errors.userName.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Email Address *</label>
              <input type="email" {...register('email')} placeholder="doctor@cardia.health" className={fieldCls(!!errors.email, 'indigo')} />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Password *</label>
              <input type="password" {...register('password')} placeholder="••••••••" className={fieldCls(!!errors.password, 'indigo')} />
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Contact Number *</label>
              <input type="tel" {...register('contactNumber')} placeholder="01012345678" className={fieldCls(!!errors.contactNumber, 'indigo')} />
              {errors.contactNumber && <p className="mt-1.5 text-xs text-red-600">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Age *</label>
              <input type="number" {...register('age')} placeholder="e.g. 38" min={24} max={80} className={fieldCls(!!errors.age, 'indigo')} />
              {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Specialization *</label>
              <input type="text" {...register('specialization')} placeholder="e.g. Interventional Cardiologist" className={fieldCls(!!errors.specialization, 'indigo')} />
              {errors.specialization && <p className="mt-1.5 text-xs text-red-600">{errors.specialization.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Work Hours *</label>
              <input type="text" {...register('workTime')} placeholder="e.g. 9:00 AM – 4:00 PM" className={fieldCls(!!errors.workTime, 'indigo')} />
              {errors.workTime && <p className="mt-1.5 text-xs text-red-600">{errors.workTime.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className={labelSmCls}>Street Address *</label>
              <input type="text" {...register('streetAddress')} placeholder="5 Al-Nil Street, Maadi" className={fieldCls(!!errors.streetAddress, 'indigo')} />
              {errors.streetAddress && <p className="mt-1.5 text-xs text-red-600">{errors.streetAddress.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>City *</label>
              <input type="text" {...register('city')} placeholder="Cairo" className={fieldCls(!!errors.city, 'indigo')} />
              {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>State / Governorate *</label>
              <input type="text" {...register('state')} placeholder="Cairo Governorate" className={fieldCls(!!errors.state, 'indigo')} />
              {errors.state && <p className="mt-1.5 text-xs text-red-600">{errors.state.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Country *</label>
              <input type="text" {...register('country')} placeholder="Egypt" className={fieldCls(!!errors.country, 'indigo')} />
              {errors.country && <p className="mt-1.5 text-xs text-red-600">{errors.country.message}</p>}
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
              onClick={() => reset()}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? 'Saving…' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
