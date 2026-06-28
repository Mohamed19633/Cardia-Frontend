import { usePatient } from '../../context/PatientContext';
import type { PrescriptionItem } from '../../types';
import Spinner from '../../components/Spinner';

function PrescriptionCard({ rx, index }: { rx: PrescriptionItem; index: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Prescription #{index + 1}</p>
            <p className="text-xs text-gray-400 mt-0.5">{rx.prescriptionDate}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500 font-medium">{rx.doctorName}</p>
          <p className="text-xs text-gray-400">{rx.patientName}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-2">
            Prescription Details
          </p>
          <ul className="space-y-1.5">
            {rx.content.map((line, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PatientPrescriptions() {
  const { profile, loading, error, refetch } = usePatient();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button onClick={refetch} className="text-xs font-semibold text-red-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const prescriptions = profile?.prescriptions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Prescriptions</h2>
        <span className="text-xs text-gray-400 font-medium">{prescriptions.length} records</span>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No prescriptions on record yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx, i) => (
            <PrescriptionCard key={i} rx={rx} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
