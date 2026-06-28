import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorPatients } from '../../services/doctorService';
import type { DoctorPatient } from '../../types';
import { getInitials, AVATAR_COLORS } from '../../utils/formatters';
import Spinner from '../../components/Spinner';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoctorPatients()
      .then((res) => setPatients(res.data))
      .catch(() => setError('Failed to load patient list. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleViewFile = (patient: DoctorPatient, colorIdx: number) => {
    navigate('../patient-tests', {
      state: {
        patientId: patient.id,
        patientName: patient.patientName,
        patientInitials: getInitials(patient.patientName),
        avatarClass: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
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
        <h2 className="text-lg font-bold text-gray-900">Active Patients</h2>
        <span className="text-xs text-gray-400 font-medium">{patients.length} patients</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Patient', 'Booking Date & Time', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400">
                    No patients assigned yet.
                  </td>
                </tr>
              ) : patients.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {getInitials(p.patientName)}
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{p.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{p.BookingDateAndTime}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewFile(p, idx)}
                      className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Medical File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {patients.map((p, idx) => (
            <div key={p.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {getInitials(p.patientName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{p.patientName}</p>
                  <p className="text-xs text-gray-500">{p.BookingDateAndTime}</p>
                </div>
              </div>
              <button
                onClick={() => handleViewFile(p, idx)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                View Medical File
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
