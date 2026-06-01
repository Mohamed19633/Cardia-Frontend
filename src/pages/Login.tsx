import { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-4xl leading-none">❤️</span>
            <span className="text-3xl font-bold text-blue-700">Cardia</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Sign in to access your health dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors mt-1 shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-700 hover:underline font-medium">
              Create Account
            </Link>
          </p>
          <a
            href="mailto:support@cardia.health"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Need help? Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
