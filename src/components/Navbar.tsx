import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-red-600 font-bold text-xl">
        <span>❤️</span> Cardia
      </Link>
      <div className="flex gap-4 text-sm">
        <Link to="/patient" className="text-gray-600 hover:text-red-600">Patient</Link>
        <Link to="/doctor" className="text-gray-600 hover:text-red-600">Doctor</Link>
        <Link to="/admin" className="text-gray-600 hover:text-red-600">Admin</Link>
        <Link to="/login" className="text-gray-600 hover:text-red-600">Login</Link>
        <Link to="/register" className="text-gray-600 hover:text-red-600">Register</Link>
      </div>
    </nav>
  );
}
