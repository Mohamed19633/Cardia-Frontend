import { useState, ReactNode } from 'react';
import type { Appointment, AppointmentStatus } from '../../types';

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1,  patientName: 'Ahmed Hassan', patientContact: '+20 100 123 4567', patientInitials: 'AH', avatarClass: 'bg-blue-100 text-blue-700',    doctorName: 'Dr. Karim Nour',     date: 'Jun 30, 2026', time: '10:00 AM', status: 'upcoming'   },
  { id: 2,  patientName: 'Sara Mohamed', patientContact: '+20 101 987 6543', patientInitials: 'SM', avatarClass: 'bg-purple-100 text-purple-700', doctorName: 'Dr. Karim Nour',     date: 'Jun 30, 2026', time: '11:30 AM', status: 'upcoming'   },
  { id: 3,  patientName: 'Khaled Ali',   patientContact: '+20 105 876 5432', patientInitials: 'KA', avatarClass: 'bg-teal-100 text-teal-700',    doctorName: 'Dr. Sara Hassan',    date: 'Jun 28, 2026', time: '09:00 AM', status: 'completed'  },
  { id: 4,  patientName: 'Nour El-Din',  patientContact: '+20 103 444 9988', patientInitials: 'NE', avatarClass: 'bg-orange-100 text-orange-700', doctorName: 'Dr. Sara Hassan',    date: 'Jun 27, 2026', time: '02:00 PM', status: 'completed'  },
  { id: 5,  patientName: 'Omar Farouk',  patientContact: '+20 104 321 7654', patientInitials: 'OF', avatarClass: 'bg-pink-100 text-pink-700',    doctorName: 'Dr. Khaled Mansour', date: 'Jun 25, 2026', time: '03:30 PM', status: 'upcoming'   },
  { id: 6,  patientName: 'Ahmed Hassan', patientContact: '+20 100 123 4567', patientInitials: 'AH', avatarClass: 'bg-blue-100 text-blue-700',    doctorName: 'Dr. Karim Nour',     date: 'Jun 20, 2026', time: '10:00 AM', status: 'cancelled'  },
  { id: 7,  patientName: 'Sara Mohamed', patientContact: '+20 101 987 6543', patientInitials: 'SM', avatarClass: 'bg-purple-100 text-purple-700', doctorName: 'Dr. Khaled Mansour', date: 'Jul 3, 2026',  time: '01:00 PM', status: 'upcoming'   },
];

const STATUS_CFG: Record<AppointmentStatus, { label: string; cls: string }> = {
  upcoming:  { label: 'Upcoming',  cls: 'bg-blue-100 text-blue-700 border-blue-200'    },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 border-red-200'       },
};

function Backdrop({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filter, setFilter]    = useState<'all' | AppointmentStatus>('all');

  const filtered = appointments.filter((a) => filter === 'all' || a.status === filter);

  const confirmDelete = () => {
    if (deleteId === null) return;
    setAppointments((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Appointments</h2>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="text-xs text-gray-400 font-medium self-center">{filtered.length} records</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Patient', 'Contact', 'Doctor', 'Date', 'Time', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No appointments match this filter.</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${a.avatarClass}`}>{a.patientInitials}</div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{a.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{a.patientContact}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{a.doctorName}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{a.date}</td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{a.time}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CFG[a.status].cls}`}>{STATUS_CFG[a.status].label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((a) => (
            <div key={a.id} className="p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${a.avatarClass}`}>{a.patientInitials}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{a.patientName}</p>
                  <p className="text-xs text-gray-500">{a.doctorName}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CFG[a.status].cls}`}>{STATUS_CFG[a.status].label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{a.date} at {a.time}</p>
                <button onClick={() => setDeleteId(a.id)} className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteId !== null && (
        <Backdrop onClose={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 pt-7 pb-5 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Appointment</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 text-center">Are you sure you want to delete this appointment? This action cannot be undone.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm">Confirm Delete</button>
            </div>
          </div>
        </Backdrop>
      )}
    </div>
  );
}
