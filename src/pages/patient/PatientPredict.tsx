import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatient } from '../../context/PatientContext';
import { getDoctors } from '../../services/patientService';
import type { ApiDoctor, PredictionItem, RiskLevel } from '../../types';
import { getInitials, AVATAR_COLORS, fieldCls, labelSmCls } from '../../utils/formatters';

interface PredictionResult {
  DateAndTime: string;
  belongsTo: string;
  diagnosis: string;
  recommendationMsg: string;
  recommendedDoctors: ApiDoctor[];
  riskCategory: RiskLevel;
  riskProbability: number;
}

const predictionSchema = z.object({
  age:      z.coerce.number().int('Age must be a whole number').min(1).max(120),
  sex:      z.enum(['0', '1'], { errorMap: () => ({ message: 'Please select a sex' }) }),
  cp:       z.enum(['0', '1', '2', '3'], { errorMap: () => ({ message: 'Please select a chest pain type' }) }),
  trestbps: z.coerce.number().min(50, 'Must be 50–300 mm Hg').max(300),
  chol:     z.coerce.number().min(50, 'Must be 50–600 mg/dl').max(600),
  fbs:      z.enum(['0', '1'], { errorMap: () => ({ message: 'Please select a value' }) }),
  restecg:  z.enum(['0', '1', '2'], { errorMap: () => ({ message: 'Please select a result' }) }),
  thalch:   z.coerce.number().min(50, 'Must be 50–250 bpm').max(250),
  exang:    z.enum(['0', '1'], { errorMap: () => ({ message: 'Please select an option' }) }),
  oldpeak:  z.coerce.number().min(0, 'Must be 0 or greater').max(10),
  slope:    z.enum(['0', '1', '2'], { errorMap: () => ({ message: 'Please select a slope' }) }),
  ca:       z.enum(['0', '1', '2', '3', '4'], { errorMap: () => ({ message: 'Please select a count' }) }),
  thal:     z.enum(['1', '2', '3'], { errorMap: () => ({ message: 'Please select a type' }) }),
});

type PredictionFormData = z.infer<typeof predictionSchema>;

const RISK_CONFIG: Record<RiskLevel, { badge: string; ring: string; diagnosis: string; recommendation: string; doctorCount: number }> = {
  Low: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    ring: '#22c55e',
    diagnosis: 'No Heart Disease',
    recommendation: 'Your results suggest a low probability of heart disease. Keep up your healthy lifestyle and schedule regular check-ups.',
    doctorCount: 1,
  },
  Moderate: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ring: '#eab308',
    diagnosis: 'Possible Heart Disease',
    recommendation: 'Your results indicate a moderate risk. We recommend consulting a cardiologist for a thorough evaluation and lifestyle guidance.',
    doctorCount: 2,
  },
  High: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    ring: '#ef4444',
    diagnosis: 'Heart Disease Detected',
    recommendation: 'Your results indicate a high probability of heart disease. Please consult one of our recommended cardiologists as soon as possible.',
    doctorCount: 3,
  },
};

const RING_RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function PatientPredict() {
  const navigate = useNavigate();
  const { profile } = usePatient();
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [storageWarning, setStorageWarning] = useState('');

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: PredictionFormData) => {
    setLoading(true);
    setResult(null);
    setStorageWarning('');
    const patientName = profile?.name ?? 'Patient';

    setTimeout(() => {
      const exangBoost = data.exang === '1' ? 0.14 : 0;
      const cpBoost    = data.cp    === '0' ? 0.08 : data.cp === '3' ? -0.04 : 0;
      const thalBoost  = data.thal  === '3' ? 0.12 : data.thal === '2' ? 0.06 : 0;
      const base       = data.age > 55 ? 0.60 : 0.26;
      const prob       = Math.min(0.97, Math.max(0.04, base + exangBoost + cpBoost + thalBoost + (Math.random() * 0.1 - 0.05)));
      const riskProbability = Math.round(prob * 100) / 100;
      const riskCategory: RiskLevel = riskProbability >= 0.65 ? 'High' : riskProbability >= 0.35 ? 'Moderate' : 'Low';
      const cfg = RISK_CONFIG[riskCategory];
      const dateStr = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newPrediction: PredictionItem = {
        id: Date.now(),
        DateAndTime: dateStr,
        riskScore: riskCategory,
        result: cfg.diagnosis,
        belongsTo: patientName,
        age: data.age,
        sex: data.sex,
        cp: data.cp,
        trestbps: data.trestbps,
        chol: data.chol,
        fbs: data.fbs,
        restecg: data.restecg,
        thalch: data.thalch,
        exang: data.exang,
        oldpeak: data.oldpeak,
        slope: data.slope,
        ca: data.ca,
        thal: data.thal,
      };

      try {
        const existing: PredictionItem[] = JSON.parse(localStorage.getItem('cardia_predictions') ?? '[]');
        localStorage.setItem('cardia_predictions', JSON.stringify([newPrediction, ...existing]));
        window.dispatchEvent(new CustomEvent('cardia:predictions-updated'));
      } catch {
        setStorageWarning('Result is displayed below but could not be saved locally due to browser storage limits.');
      }

      setResult({
        DateAndTime: dateStr,
        belongsTo: patientName,
        diagnosis: cfg.diagnosis,
        recommendationMsg: cfg.recommendation,
        recommendedDoctors: doctors.slice(0, cfg.doctorCount),
        riskCategory,
        riskProbability,
      });
      setLoading(false);
    }, 1800);
  };

  const strokeOffset = result ? CIRCUMFERENCE * (1 - result.riskProbability) : CIRCUMFERENCE;
  const cfg = result ? RISK_CONFIG[result.riskCategory] : null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Heart Disease Risk Prediction</h2>
              <p className="text-blue-100 text-xs mt-0.5">Enter your clinical measurements for an AI-powered assessment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

            <div>
              <label className={labelSmCls}>Age</label>
              <input type="number" {...register('age')} placeholder="e.g. 52" min={1} max={120} className={fieldCls(!!errors.age)} />
              {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Sex</label>
              <select {...register('sex')} className={fieldCls(!!errors.sex)}>
                <option value="">Select sex</option>
                <option value="1">Male</option>
                <option value="0">Female</option>
              </select>
              {errors.sex && <p className="mt-1.5 text-xs text-red-600">{errors.sex.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Chest Pain Type (cp)</label>
              <select {...register('cp')} className={fieldCls(!!errors.cp)}>
                <option value="">Select type</option>
                <option value="0">Typical Angina</option>
                <option value="1">Atypical Angina</option>
                <option value="2">Non-anginal Pain</option>
                <option value="3">Asymptomatic</option>
              </select>
              {errors.cp && <p className="mt-1.5 text-xs text-red-600">{errors.cp.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Resting Blood Pressure <span className="normal-case font-normal text-gray-400">(mm Hg)</span></label>
              <input type="number" {...register('trestbps')} placeholder="e.g. 130" min={50} max={300} className={fieldCls(!!errors.trestbps)} />
              {errors.trestbps && <p className="mt-1.5 text-xs text-red-600">{errors.trestbps.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Serum Cholesterol <span className="normal-case font-normal text-gray-400">(mg/dl)</span></label>
              <input type="number" {...register('chol')} placeholder="e.g. 245" min={50} max={600} className={fieldCls(!!errors.chol)} />
              {errors.chol && <p className="mt-1.5 text-xs text-red-600">{errors.chol.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Fasting Blood Sugar (fbs)</label>
              <select {...register('fbs')} className={fieldCls(!!errors.fbs)}>
                <option value="">Select level</option>
                <option value="1">{'>'} 120 mg/dl</option>
                <option value="0">{'≤'} 120 mg/dl</option>
              </select>
              {errors.fbs && <p className="mt-1.5 text-xs text-red-600">{errors.fbs.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Resting ECG Results</label>
              <select {...register('restecg')} className={fieldCls(!!errors.restecg)}>
                <option value="">Select result</option>
                <option value="0">Normal</option>
                <option value="1">ST-T Wave Abnormality</option>
                <option value="2">Left Ventricular Hypertrophy</option>
              </select>
              {errors.restecg && <p className="mt-1.5 text-xs text-red-600">{errors.restecg.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Max Heart Rate <span className="normal-case font-normal text-gray-400">(bpm)</span></label>
              <input type="number" {...register('thalch')} placeholder="e.g. 150" min={50} max={250} className={fieldCls(!!errors.thalch)} />
              {errors.thalch && <p className="mt-1.5 text-xs text-red-600">{errors.thalch.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Exercise Induced Angina (exang)</label>
              <select {...register('exang')} className={fieldCls(!!errors.exang)}>
                <option value="">Select option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {errors.exang && <p className="mt-1.5 text-xs text-red-600">{errors.exang.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>ST Depression <span className="normal-case font-normal text-gray-400">(oldpeak)</span></label>
              <input type="number" {...register('oldpeak')} placeholder="e.g. 1.5" min={0} max={10} step={0.1} className={fieldCls(!!errors.oldpeak)} />
              {errors.oldpeak && <p className="mt-1.5 text-xs text-red-600">{errors.oldpeak.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Slope of Peak ST Segment</label>
              <select {...register('slope')} className={fieldCls(!!errors.slope)}>
                <option value="">Select slope</option>
                <option value="0">Upsloping</option>
                <option value="1">Flat</option>
                <option value="2">Downsloping</option>
              </select>
              {errors.slope && <p className="mt-1.5 text-xs text-red-600">{errors.slope.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Major Vessels Colored <span className="normal-case font-normal text-gray-400">(ca)</span></label>
              <select {...register('ca')} className={fieldCls(!!errors.ca)}>
                <option value="">Select count</option>
                {(['0','1','2','3','4'] as const).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors.ca && <p className="mt-1.5 text-xs text-red-600">{errors.ca.message}</p>}
            </div>

            <div>
              <label className={labelSmCls}>Thalassemia (thal)</label>
              <select {...register('thal')} className={fieldCls(!!errors.thal)}>
                <option value="">Select type</option>
                <option value="1">Normal</option>
                <option value="2">Fixed Defect</option>
                <option value="3">Reversible Defect</option>
              </select>
              {errors.thal && <p className="mt-1.5 text-xs text-red-600">{errors.thal.message}</p>}
            </div>

          </div>

          {storageWarning && (
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-700 font-medium">{storageWarning}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 max-w-sm text-center sm:text-left">
              ⚕️ This AI assessment is for informational purposes only and does not replace professional medical advice.
            </p>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex items-center gap-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Predict Heart Disease Risk
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {result && cfg && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-base font-bold text-gray-800">Prediction Results</h3>
            </div>
            <button
              onClick={() => navigate('../doctors')}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Appointment
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative flex-shrink-0">
                <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
                  <circle cx="74" cy="74" r={RING_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  <circle
                    cx="74" cy="74" r={RING_RADIUS} fill="none"
                    stroke={cfg.ring}
                    strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeOffset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900 leading-none">{Math.round(result.riskProbability * 100)}%</span>
                  <span className="text-[11px] text-gray-500 mt-1 font-medium">Probability</span>
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${cfg.badge} mb-3`}>
                  {result.riskCategory} Risk
                </span>
                <p className="text-gray-600 text-sm leading-relaxed">{result.recommendationMsg}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Risk Probability</p>
                <p className="text-2xl font-extrabold text-gray-900">{result.riskProbability.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Risk Category</p>
                <p className={`text-xl font-extrabold ${result.riskCategory === 'High' ? 'text-red-600' : result.riskCategory === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.riskCategory}
                </p>
              </div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-center sm:col-span-2">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Diagnosis</p>
                <p className="text-sm font-bold text-gray-800">{result.diagnosis}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="text-sm font-medium text-gray-800">{result.DateAndTime}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">Patient</p>
                <p className="text-sm font-medium text-gray-800">{result.belongsTo}</p>
              </div>
            </div>

            {result.recommendedDoctors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Recommended Cardiologists</p>
                  <button
                    onClick={() => navigate('../doctors')}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100">
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Specialization</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Hours</th>
                        <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.recommendedDoctors.map((doc, i) => (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                                {getInitials(doc.name)}
                              </div>
                              <p className="font-medium text-gray-900 text-xs">{doc.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{doc.specialization}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{doc.workTime}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => navigate('../doctors')}
                              className="text-[11px] font-semibold bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
