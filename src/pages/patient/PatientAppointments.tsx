import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInitials, AVATAR_COLORS } from '../../utils/formatters';
import Spinner from '../../components/Spinner';

interface StoredAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: string;
}

const STATUS_BADGE: Record<string, string> = {
  upcoming:  'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
}

export default function PatientAppointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const justBooked = location.state?.justBooked as boolean | undefined;
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);

  useEffect(() => {
    try {
      const stored: StoredAppointment[] = JSON.parse(localStorage.getItem('cardia_appointments') ?? '[]');
      setAppointments(stored);
    } catch {
      setAppointments([]);
    }
  }, [justBooked]);

  if (appointments === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Appointments</h2>
        <span className="text-xs text-gray-400 font-medium">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</span>
      </div>

      {justBooked && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-semibold text-green-700">
            Your appointment has been booked successfully.
          </p>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-sm">No appointments booked yet.</p>
          <p className="text-gray-400 text-xs mt-1.5 mb-4">
            Use Find a Doctor to book your first appointment.
          </p>
          <button
            onClick={() => navigate('../doctors')}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-left">
                  {['Doctor', 'Specialization', 'Date', 'Time', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt, idx) => (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {getInitials(appt.doctorName)}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{appt.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{appt.specialization}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{appt.date}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{appt.time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {appointments.map((appt, idx) => (
              <div key={appt.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {getInitials(appt.doctorName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{appt.doctorName}</p>
                      <p className="text-xs text-gray-400">{appt.specialization}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{appt.date} at {appt.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
