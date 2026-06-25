import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, bookAppointment } from '../../services/patientService';
import { usePatient } from '../../context/PatientContext';
import type { ApiDoctor } from '../../types';

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function PatientDoctors() {
  const navigate = useNavigate();
  const { profile } = usePatient();
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookError, setBookError] = useState('');

  useEffect(() => {
    getDoctors()
      .then((res) => setDoctors(res.data))
      .catch(() => setError('Failed to load doctors. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const saveAppointmentLocally = (doc: ApiDoctor) => {
    const appointment = {
      id: Date.now(),
      patientName: profile?.name ?? 'Patient',
      doctorName: doc.name,
      specialization: doc.specialization,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'upcoming',
    };
    try {
      const existing = JSON.parse(localStorage.getItem('cardia_appointments') || '[]');
      localStorage.setItem('cardia_appointments', JSON.stringify([appointment, ...existing]));
    } catch (_) { }
  };

  const handleBook = async (doc: ApiDoctor) => {
    setBookingId(doc.id);
    setBookError('');
    try {
      await bookAppointment(doc.id);
      saveAppointmentLocally(doc);
      navigate('../appointments', { state: { justBooked: true } });
    } catch {
      setBookError('Booking failed. Please try again.');
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Find a Doctor</h2>
        <span className="text-xs text-gray-400 font-medium">{doctors.length} cardiologists</span>
      </div>

      {bookError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{bookError}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Doctor', 'Specialization', 'Contact', 'Location', 'Work Hours', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {getInitials(doc.name)}
                      </div>
                      <p className="font-medium text-gray-900 whitespace-nowrap">{doc.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.specialization}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.contactNumber}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {[doc.city, doc.state].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.workTime}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleBook(doc)}
                      disabled={bookingId === doc.id}
                      className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {bookingId === doc.id ? 'Booking…' : 'Book'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {doctors.map((doc, idx) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {getInitials(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.specialization}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>{doc.contactNumber}</p>
                <p>{[doc.city, doc.state].filter(Boolean).join(', ')} · {doc.workTime}</p>
              </div>
              <button
                onClick={() => handleBook(doc)}
                disabled={bookingId === doc.id}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                {bookingId === doc.id ? 'Booking…' : 'Book Appointment'}
              </button>
            </div>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No doctors available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
