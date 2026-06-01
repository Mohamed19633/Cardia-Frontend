import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

interface RegisterForm {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: string;
  photo: File | null;
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    userName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    photo: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files, value } = e.target;
    if (name === 'photo' && files) {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-2xl">

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-4xl leading-none">❤️</span>
            <span className="text-3xl font-bold text-blue-700">Cardia</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Create Your Account</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Join Cardia and start monitoring your heart health
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="johndoe123"
                required
                autoComplete="username"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="+20 1XX XXXX XXXX"
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Cairo, Egypt"
                autoComplete="street-address"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Profile Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="photo"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">
                    {form.photo ? form.photo.name : 'Click to upload a photo'}
                  </span>
                  <span className="text-xs text-gray-400">PNG, JPG up to 5 MB</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors mt-6 shadow-sm"
          >
            Create Account
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
