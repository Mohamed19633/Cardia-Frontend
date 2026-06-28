import { useState, useEffect, ChangeEvent, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminPredictions, deleteAdminPrediction } from '../../services/adminService';
import type { AdminPrediction } from '../../types';
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

function isPositiveResult(result: string) {
  return result?.toLowerCase().includes('heart disease') && !result?.toLowerCase().includes('no');
}

const CP_LABELS: Record<string, string> = { '0': 'Typical Angina', '1': 'Atypical Angina', '2': 'Non-anginal Pain', '3': 'Asymptomatic' };
const SLOPE_LABELS: Record<string, string> = { '0': 'Upsloping', '1': 'Flat', '2': 'Downsloping' };
const THAL_LABELS: Record<string, string> = { '1': 'Normal', '2': 'Fixed Defect', '3': 'Reversible Defect' };
const RESTECG_LABELS: Record<string, string> = { '0': 'Normal', '1': 'ST-T Abnormality', '2': 'LV Hypertrophy' };

function ClinicalParamsGrid({ p }: { p: AdminPrediction }) {
  if (p.age === undefined) {
    return <p className="text-xs text-gray-400 italic py-2">Clinical parameters not recorded for this entry.</p>;
  }
  const params = [
    { label: 'Age',                value: String(p.age) },
    { label: 'Sex',                value: p.sex === '1' ? 'Male' : 'Female' },
    { label: 'Chest Pain (cp)',    value: CP_LABELS[p.cp ?? ''] ?? p.cp ?? '—' },
    { label: 'Rest BP (trestbps)', value: `${p.trestbps} mm Hg` },
    { label: 'Cholesterol (chol)', value: `${p.chol} mg/dl` },
    { label: 'Fasting BS (fbs)',   value: p.fbs === '1' ? '> 120 mg/dl' : '≤ 120 mg/dl' },
    { label: 'Rest ECG',           value: RESTECG_LABELS[p.restecg ?? ''] ?? p.restecg ?? '—' },
    { label: 'Max HR (thalach)',   value: `${p.thalch} bpm` },
    { label: 'Ex. Angina (exang)', value: p.exang === '1' ? 'Yes' : 'No' },
    { label: 'ST Dep. (oldpeak)',  value: String(p.oldpeak) },
    { label: 'Slope',              value: SLOPE_LABELS[p.slope ?? ''] ?? p.slope ?? '—' },
    { label: 'Vessels (ca)',       value: String(p.ca) },
    { label: 'Thalassemia (thal)', value: THAL_LABELS[p.thal ?? ''] ?? p.thal ?? '—' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {params.map(({ label, value }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminTests() {
  const navigate = useNavigate();
  const [preds, setPreds] = useState<AdminPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fetchPredictions = () => {
    setLoading(true);
    setError('');
    getAdminPredictions()
      .then((res) => setPreds(res.data))
      .catch(() => setError('Failed to load predictions. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPredictions, []);

  const filtered = preds.filter((p) => {
    const q = search.toLowerCase();
    return p.belongsTo?.toLowerCase().includes(q) || p.result?.toLowerCase().includes(q);
  });

  const confirmDelete = async () => {
    if (deleteIdx === null) return;
    setDeleteError('');
    const target = preds[deleteIdx];
    if (target.id === undefined) {
      setPreds((prev) => prev.filter((_, i) => i !== deleteIdx));
      setDeleteIdx(null);
      return;
    }
    try {
      await deleteAdminPrediction(target.id);
      setPreds((prev) => prev.filter((_, i) => i !== deleteIdx));
      setDeleteIdx(null);
    } catch {
      setDeleteError('Delete failed. Please try again.');
    }
  };

  const handlePatientClick = (name: string) => {
    navigate('/admin/users', { state: { searchFor: name } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="w-6 h-6 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <button onClick={fetchPredictions} className="mt-3 text-sm font-semibold text-red-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">ML Predictions Log</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patient or result…"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white w-56"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium self-center">{filtered.length} records</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {filtered.filter((p) => isPositiveResult(p.result)).length} positive
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {filtered.filter((p) => !isPositiveResult(p.result)).length} negative
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Patient', 'Date & Time', 'Risk Score', 'Result', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No predictions match your filters.</td></tr>
              ) : filtered.map((p, idx) => (
                <Fragment key={p.id ?? `pred-${idx}`}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePatientClick(p.belongsTo)}
                        className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline whitespace-nowrap text-left"
                      >
                        {p.belongsTo}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{p.DateAndTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(p.riskScore)}`}>
                        {p.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isPositiveResult(p.result)
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Positive</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Negative</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${expandedIdx === idx ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'}`}
                        >
                          {expandedIdx === idx ? 'Hide' : 'Details'}
                        </button>
                        <button
                          onClick={() => { setDeleteIdx(idx); setDeleteError(''); }}
                          className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedIdx === idx && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-slate-50 border-b border-gray-100">
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Clinical Parameters — {p.belongsTo}</p>
                          <ClinicalParamsGrid p={p} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-gray-100">
          {filtered.map((p, idx) => (
            <div key={p.id ?? `pred-${idx}`} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => handlePatientClick(p.belongsTo)}
                    className="font-medium text-indigo-700 hover:underline text-sm text-left"
                  >
                    {p.belongsTo}
                  </button>
                  <p className="text-xs font-mono text-gray-400">{p.DateAndTime}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(p.riskScore)}`}>
                  {p.riskScore}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                {isPositiveResult(p.result)
                  ? <span className="text-xs font-semibold text-red-700">Positive</span>
                  : <span className="text-xs font-semibold text-green-700">Negative</span>
                }
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${expandedIdx === idx ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
                  >
                    {expandedIdx === idx ? 'Hide' : 'Details'}
                  </button>
                  <button
                    onClick={() => { setDeleteIdx(idx); setDeleteError(''); }}
                    className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-semibold px-2.5 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {expandedIdx === idx && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Clinical Parameters</p>
                  <ClinicalParamsGrid p={p} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {deleteIdx !== null && (
        <Backdrop onClose={() => setDeleteIdx(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 pt-7 pb-5 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 text-center">
                Delete prediction record for{' '}
                <span className="font-semibold">{preds[deleteIdx]?.belongsTo}</span>? This cannot be undone.
              </p>
              {deleteError && <p className="mt-3 text-xs text-red-600 text-center">{deleteError}</p>}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setDeleteIdx(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm">Confirm Delete</button>
            </div>
          </div>
        </Backdrop>
      )}
    </div>
  );
}
