import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

type RiskLevel = 'Low' | 'Moderate' | 'High';

interface Vitals {
  bloodPressure: string;
  heartRate: number;
  cholesterol: number;
  bloodSugar: number;
}

interface MLResult {
  probability: number;
  riskLevel: RiskLevel;
  keyFactors: string[];
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bookingDate: string;
  initials: string;
  avatarClass: string;
  vitals: Vitals;
  mlResult: MLResult;
}

interface PrescriptionForm {
  diagnosisNotes: string;
  medicationDetails: string;
  dosageInstructions: string;
  treatmentDuration: string;
  warningsNotes: string;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: 1, name: 'Ahmed Hassan', age: 54, gender: 'Male',
    bookingDate: 'May 10, 2026', initials: 'AH',
    avatarClass: 'bg-blue-100 text-blue-700',
    vitals: { bloodPressure: '145/92', heartRate: 88, cholesterol: 245, bloodSugar: 130 },
    mlResult: {
      probability: 0.82, riskLevel: 'High',
      keyFactors: ['Exercise-induced angina', 'ST depression: 2.3', 'Reversible thalassemia defect'],
    },
  },
  {
    id: 2, name: 'Sara Mohamed', age: 42, gender: 'Female',
    bookingDate: 'May 11, 2026', initials: 'SM',
    avatarClass: 'bg-purple-100 text-purple-700',
    vitals: { bloodPressure: '128/82', heartRate: 76, cholesterol: 198, bloodSugar: 105 },
    mlResult: {
      probability: 0.47, riskLevel: 'Moderate',
      keyFactors: ['Atypical angina pattern', 'Flat ST slope', 'Cholesterol: 198 mg/dl'],
    },
  },
  {
    id: 3, name: 'Khaled Ali', age: 67, gender: 'Male',
    bookingDate: 'May 12, 2026', initials: 'KA',
    avatarClass: 'bg-teal-100 text-teal-700',
    vitals: { bloodPressure: '118/76', heartRate: 72, cholesterol: 178, bloodSugar: 98 },
    mlResult: {
      probability: 0.21, riskLevel: 'Low',
      keyFactors: ['Normal resting ECG', 'No exercise-induced angina', 'Normal thalassemia'],
    },
  },
  {
    id: 4, name: 'Nour El-Din', age: 38, gender: 'Female',
    bookingDate: 'May 13, 2026', initials: 'NE',
    avatarClass: 'bg-orange-100 text-orange-700',
    vitals: { bloodPressure: '155/98', heartRate: 94, cholesterol: 267, bloodSugar: 145 },
    mlResult: {
      probability: 0.76, riskLevel: 'High',
      keyFactors: ['High cholesterol: 267 mg/dl', 'Hypertension: 155/98', 'Fasting blood sugar > 120'],
    },
  },
  {
    id: 5, name: 'Omar Farouk', age: 59, gender: 'Male',
    bookingDate: 'May 14, 2026', initials: 'OF',
    avatarClass: 'bg-pink-100 text-pink-700',
    vitals: { bloodPressure: '132/85', heartRate: 81, cholesterol: 215, bloodSugar: 112 },
    mlResult: {
      probability: 0.53, riskLevel: 'Moderate',
      keyFactors: ['Fixed thalassemia defect', 'ST depression: 1.1', 'Age factor: 59'],
    },
  },
];

const RISK_CFG: Record<RiskLevel, { badge: string; ring: string }> = {
  Low:      { badge: 'bg-green-100 text-green-700 border-green-200',    ring: '#22c55e' },
  Moderate: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', ring: '#eab308' },
  High:     { badge: 'bg-red-100 text-red-700 border-red-200',          ring: '#ef4444' },
};

const STAT_CARDS = [
  { label: "Today's Appointments", value: '3',  icon: '📅', color: 'text-blue-700'   },
  { label: 'Active Patients',       value: '12', icon: '👥', color: 'text-teal-700'   },
  { label: 'High Risk Cases',       value: '2',  icon: '⚠️', color: 'text-red-600'   },
  { label: 'Pending Reports',       value: '5',  icon: '📋', color: 'text-purple-700' },
];

const BLANK_RX: PrescriptionForm = {
  diagnosisNotes: '', medicationDetails: '',
  dosageInstructions: '', treatmentDuration: '', warningsNotes: '',
};

const RING_R = 36;
const CIRC   = 2 * Math.PI * RING_R;

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';

const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

export default function DoctorDashboard() {
  const [selected, setSelected] = useState<Patient | null>(null);
  const [rx, setRx]             = useState<PrescriptionForm>(BLANK_RX);
  const [saved, setSaved]       = useState(false);

  const highRiskCount = MOCK_PATIENTS.filter((p) => p.mlResult.riskLevel === 'High').length;

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    if (selected) { setRx(BLANK_RX); setSaved(false); }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const handleRxChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setRx((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, <span className="text-blue-700">Dr. Karim</span> 👨‍⚕️
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              You have{' '}
              <span className="font-semibold text-blue-700">3 appointments</span> today
              {' '}and{' '}
              <span className="font-semibold text-red-600">{highRiskCount} high-risk cases</span>{' '}
              requiring attention.
            </p>
          </div>
          <span className="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            On Duty
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className={`text-2xl font-extrabold mt-2 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-base font-bold text-gray-800">Patient Appointments</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">{MOCK_PATIENTS.length} patients</span>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-left">
                  {['Patient', 'Age / Gender', 'Booking Date', 'Risk Level', 'Action'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.avatarClass}`}>
                          {p.initials}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">{p.age} · {p.gender}</td>

                    <td className="px-6 py-4 text-gray-600">{p.bookingDate}</td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${RISK_CFG[p.mlResult.riskLevel].badge}`}>
                        {p.mlResult.riskLevel}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(p)}
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Medical Tests
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {MOCK_PATIENTS.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.avatarClass}`}>
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.bookingDate}</p>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${RISK_CFG[p.mlResult.riskLevel].badge}`}>
                      {p.mlResult.riskLevel} Risk
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(p)}
                  className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-white/25 text-white">
                  {selected.initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selected.name}</h3>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {selected.age} yrs · {selected.gender} · Booked {selected.bookingDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="space-y-5">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Medical Overview</h4>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Blood Pressure', value: selected.vitals.bloodPressure,
                        unit: 'mm Hg', icon: '🩺',
                        warn: parseInt(selected.vitals.bloodPressure) > 140,
                      },
                      {
                        label: 'Heart Rate', value: `${selected.vitals.heartRate}`,
                        unit: 'bpm', icon: '❤️',
                        warn: selected.vitals.heartRate > 90,
                      },
                      {
                        label: 'Cholesterol', value: `${selected.vitals.cholesterol}`,
                        unit: 'mg/dl', icon: '🔬',
                        warn: selected.vitals.cholesterol > 240,
                      },
                      {
                        label: 'Blood Sugar', value: `${selected.vitals.bloodSugar}`,
                        unit: 'mg/dl', icon: '💉',
                        warn: selected.vitals.bloodSugar > 125,
                      },
                    ].map((v) => (
                      <div
                        key={v.label}
                        className={`rounded-xl border p-3.5 ${v.warn ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl leading-none">{v.icon}</span>
                          {v.warn && (
                            <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full border border-red-200">
                              High
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-extrabold text-gray-900 leading-none">{v.value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{v.unit}</p>
                        <p className="text-xs text-gray-600 mt-1.5 font-medium">{v.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-gray-200">
                      <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">AI Prediction Result</p>
                    </div>
                    <div className="p-4 flex items-center gap-5">

                      <div className="relative flex-shrink-0">
                        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                          <circle cx="48" cy="48" r={RING_R} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                          <circle
                            cx="48" cy="48" r={RING_R}
                            fill="none"
                            stroke={RISK_CFG[selected.mlResult.riskLevel].ring}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={CIRC}
                            strokeDashoffset={CIRC * (1 - selected.mlResult.probability)}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold text-gray-900 leading-none">
                            {Math.round(selected.mlResult.probability * 100)}%
                          </span>
                          <span className="text-[9px] text-gray-500 mt-0.5">risk</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${RISK_CFG[selected.mlResult.riskLevel].badge} mb-2.5`}>
                          {selected.mlResult.riskLevel} Risk
                        </span>
                        <ul className="space-y-1.5">
                          {selected.mlResult.keyFactors.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-blue-500 mt-0.5 flex-shrink-0 font-bold">›</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Prescription</h4>

                  {saved ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-base">Prescription Sent!</p>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                          The prescription has been saved and delivered to{' '}
                          <span className="font-semibold text-gray-700">{selected.name}</span>.
                        </p>
                      </div>
                      <button
                        onClick={() => setSaved(false)}
                        className="text-xs text-blue-700 hover:underline font-medium mt-1"
                      >
                        Edit prescription
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-4">

                      <div>
                        <label className={labelCls}>Diagnosis Notes</label>
                        <textarea
                          name="diagnosisNotes"
                          value={rx.diagnosisNotes}
                          onChange={handleRxChange}
                          placeholder="Summarize clinical findings and the working diagnosis..."
                          required
                          rows={3}
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Medication Details</label>
                        <textarea
                          name="medicationDetails"
                          value={rx.medicationDetails}
                          onChange={handleRxChange}
                          placeholder="e.g. Aspirin 75 mg, Atorvastatin 40 mg, Bisoprolol 5 mg..."
                          required
                          rows={2}
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Dosage Instructions</label>
                          <input
                            type="text"
                            name="dosageInstructions"
                            value={rx.dosageInstructions}
                            onChange={handleRxChange}
                            placeholder="e.g. Once daily after meals"
                            required
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Treatment Duration</label>
                          <input
                            type="text"
                            name="treatmentDuration"
                            value={rx.treatmentDuration}
                            onChange={handleRxChange}
                            placeholder="e.g. 3 months"
                            required
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Warnings & Notes</label>
                        <textarea
                          name="warningsNotes"
                          value={rx.warningsNotes}
                          onChange={handleRxChange}
                          placeholder="Contraindications, dietary restrictions, follow-up schedule..."
                          rows={2}
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm mt-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Save &amp; Send to Patient
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
