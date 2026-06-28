import { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import type { PredictionItem } from '../../types';
import Spinner from '../../components/Spinner';
import Backdrop from '../../components/Backdrop';

const RISK_BADGE: Record<string, string> = {
  High:     'bg-red-100 text-red-700 border-red-200',
  Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:      'bg-green-100 text-green-700 border-green-200',
};

function getRiskBadge(riskScore: string) {
  return RISK_BADGE[riskScore] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

const CP_LABELS: Record<string, string> = { '0': 'Typical Angina', '1': 'Atypical Angina', '2': 'Non-anginal Pain', '3': 'Asymptomatic' };
const SLOPE_LABELS: Record<string, string> = { '0': 'Upsloping', '1': 'Flat', '2': 'Downsloping' };
const THAL_LABELS: Record<string, string> = { '1': 'Normal', '2': 'Fixed Defect', '3': 'Reversible Defect' };
const RESTECG_LABELS: Record<string, string> = { '0': 'Normal', '1': 'ST-T Abnormality', '2': 'LV Hypertrophy' };

function ClinicalParamsDetail({ pred }: { pred: PredictionItem }) {
  if (pred.age === undefined) {
    return <p className="text-sm text-gray-400 italic text-center py-4">Clinical parameters were not recorded for this test.</p>;
  }

  const params = [
    { label: 'Age',                       value: String(pred.age) },
    { label: 'Sex',                        value: pred.sex === '1' ? 'Male (1)' : 'Female (0)' },
    { label: 'Chest Pain Type (cp)',        value: `${CP_LABELS[pred.cp ?? ''] ?? pred.cp} (${pred.cp})` },
    { label: 'Resting BP (trestbps)',       value: `${pred.trestbps} mm Hg` },
    { label: 'Cholesterol (chol)',          value: `${pred.chol} mg/dl` },
    { label: 'Fasting Blood Sugar (fbs)',   value: pred.fbs === '1' ? '> 120 mg/dl (1)' : '≤ 120 mg/dl (0)' },
    { label: 'Resting ECG (restecg)',       value: `${RESTECG_LABELS[pred.restecg ?? ''] ?? pred.restecg} (${pred.restecg})` },
    { label: 'Max Heart Rate (thalach)',    value: `${pred.thalch} bpm` },
    { label: 'Exercise Angina (exang)',     value: pred.exang === '1' ? 'Yes (1)' : 'No (0)' },
    { label: 'ST Depression (oldpeak)',     value: String(pred.oldpeak) },
    { label: 'Slope',                       value: `${SLOPE_LABELS[pred.slope ?? ''] ?? pred.slope} (${pred.slope})` },
    { label: 'Major Vessels (ca)',          value: String(pred.ca) },
    { label: 'Thalassemia (thal)',          value: `${THAL_LABELS[pred.thal ?? ''] ?? pred.thal} (${pred.thal})` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {params.map(({ label, value }) => (
        <div key={label} className="bg-slate-50 border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function PatientTests() {
  const { profile, loading, error, refetch } = usePatient();
  const [detailPred, setDetailPred] = useState<PredictionItem | null>(null);
  const [localPreds, setLocalPreds] = useState<PredictionItem[]>([]);

  useEffect(() => {
    const read = () => {
      try {
        const stored: PredictionItem[] = JSON.parse(localStorage.getItem('cardia_predictions') ?? '[]');
        setLocalPreds(stored);
      } catch {
        setLocalPreds([]);
      }
    };

    read();
    window.addEventListener('storage', read);
    window.addEventListener('cardia:predictions-updated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('cardia:predictions-updated', read);
    };
  }, []);

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

  const serverPreds = profile?.predictions ?? [];
  const serverIds = new Set(serverPreds.map((p) => p.id).filter(Boolean));
  const uniqueLocalPreds = localPreds.filter((p) => !p.id || !serverIds.has(p.id));
  const allPreds = [...uniqueLocalPreds, ...serverPreds];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">My Medical Tests</h2>
        <span className="text-xs text-gray-400 font-medium">{allPreds.length} test{allPreds.length !== 1 ? 's' : ''} on record</span>
      </div>

      {allPreds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No prediction records found. Use Risk Prediction to run your first test.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-left">
                  {['#', 'Date & Time', 'Diagnosis', 'Risk Category', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allPreds.map((pred, i) => (
                  <tr key={pred.id ?? i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-400 bg-slate-100 px-2 py-0.5 rounded">#{i + 1}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{pred.DateAndTime}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{pred.result}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(pred.riskScore)}`}>
                        {pred.riskScore} Risk
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDetailPred(pred)}
                        className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {allPreds.map((pred, i) => (
              <div key={pred.id ?? i} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded">#{i + 1}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(pred.riskScore)}`}>
                        {pred.riskScore} Risk
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{pred.result}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pred.DateAndTime}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailPred(pred)}
                  className="w-full text-center text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {detailPred && (
        <Backdrop onClose={() => setDetailPred(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500">
              <div>
                <h3 className="text-base font-bold text-white">Test Details</h3>
                <p className="text-blue-100 text-xs mt-0.5">{detailPred.DateAndTime}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(detailPred.riskScore)}`}>
                  {detailPred.riskScore} Risk
                </span>
                <button onClick={() => setDetailPred(null)} aria-label="Close" className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Diagnosis</p>
                  <p className="text-sm font-semibold text-gray-800">{detailPred.result}</p>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Patient</p>
                  <p className="text-sm font-semibold text-gray-800">{detailPred.belongsTo}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">13 Clinical Parameters</p>
                <ClinicalParamsDetail pred={detailPred} />
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              <button onClick={() => setDetailPred(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">Close</button>
            </div>
          </div>
        </Backdrop>
      )}
    </div>
  );
}
