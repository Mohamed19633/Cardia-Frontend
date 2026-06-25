import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type RiskLevel = 'Low' | 'Moderate' | 'High';

interface PredictionResult {
  probability: number;
  riskLevel: RiskLevel;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  contact: string;
  initials: string;
  avatarClass: string;
}

const predictionSchema = z.object({
  age:      z.coerce.number().int('Age must be a whole number').min(1, 'Age must be between 1 and 120').max(120, 'Must be at most 120'),
  sex:      z.string().min(1, 'Please select a sex'),
  cp:       z.string().min(1, 'Please select a chest pain type'),
  trestbps: z.coerce.number().min(50, 'Must be between 50 and 300 mm Hg').max(300, 'Must be at most 300 mm Hg'),
  chol:     z.coerce.number().min(50, 'Must be between 50 and 600 mg/dl').max(600, 'Must be at most 600 mg/dl'),
  fbs:      z.string().min(1, 'Please select a value'),
  restecg:  z.string().min(1, 'Please select a result'),
  thalch:   z.coerce.number().min(50, 'Must be between 50 and 250 bpm').max(250, 'Must be at most 250 bpm'),
  exang:    z.string().min(1, 'Please select an option'),
  oldpeak:  z.coerce.number().min(0, 'Must be 0 or greater'),
  slope:    z.string().min(1, 'Please select a slope'),
  ca:       z.string().min(1, 'Please select a count'),
  thal:     z.string().min(1, 'Please select a type'),
});

type PredictionFormData = z.infer<typeof predictionSchema>;

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Ahmed El-Sayed',
    specialization: 'Interventional Cardiologist',
    contact: '+20 100 123 4567',
    initials: 'AE',
    avatarClass: 'bg-blue-100 text-blue-700',
  },
  {
    id: 2,
    name: 'Dr. Sara Hassan',
    specialization: 'Cardiac Electrophysiologist',
    contact: '+20 101 987 6543',
    initials: 'SH',
    avatarClass: 'bg-purple-100 text-purple-700',
  },
  {
    id: 3,
    name: 'Dr. Khaled Mansour',
    specialization: 'Preventive Cardiologist',
    contact: '+20 102 555 0011',
    initials: 'KM',
    avatarClass: 'bg-teal-100 text-teal-700',
  },
];

const RISK_CONFIG: Record<RiskLevel, {
  badge: string;
  icon: string;
  ring: string;
  description: string;
}> = {
  Low: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: '✅',
    ring: '#22c55e',
    description:
      'Your results suggest a low probability of heart disease. Keep up your healthy lifestyle and schedule regular check-ups.',
  },
  Moderate: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: '⚡',
    ring: '#eab308',
    description:
      'Your results indicate a moderate risk. We recommend consulting a cardiologist for a thorough evaluation and lifestyle guidance.',
  },
  High: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: '⚠️',
    ring: '#ef4444',
    description:
      'Your results indicate a high probability of heart disease. Please consult one of our recommended cardiologists as soon as possible.',
  },
};

const RING_RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

const fieldCls = (hasError: boolean) =>
  `w-full border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-400' : 'focus:ring-blue-600'} focus:border-transparent transition`;

export default function PatientDashboard() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: PredictionFormData) => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const exangBoost = data.exang === '1' ? 0.14 : 0;
      const cpBoost    = data.cp    === '0' ? 0.08 : data.cp === '3' ? -0.04 : 0;
      const thalBoost  = data.thal  === '3' ? 0.12 : data.thal === '2' ? 0.06 : 0;
      const base       = data.age > 55 ? 0.60 : 0.26;
      const prob       = Math.min(0.97, Math.max(0.04, base + exangBoost + cpBoost + thalBoost + (Math.random() * 0.1 - 0.05)));
      const probability = Math.round(prob * 100) / 100;
      const riskLevel: RiskLevel = probability >= 0.65 ? 'High' : probability >= 0.35 ? 'Moderate' : 'Low';
      setResult({ probability, riskLevel });
      setLoading(false);
    }, 1800);
  };

  const strokeOffset = result
    ? CIRCUMFERENCE * (1 - result.probability)
    : CIRCUMFERENCE;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, <span className="text-blue-700">Ahmed</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here is your heart health overview.</p>
          </div>
          <span className="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            AI Model Ready
          </span>
        </div>

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
                <p className="text-blue-100 text-xs mt-0.5">
                  Enter your clinical measurements for an AI-powered assessment
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

              <div>
                <label className={labelCls}>Age</label>
                <input
                  type="number"
                  {...register('age')}
                  placeholder="e.g. 52"
                  min={1}
                  max={120}
                  className={fieldCls(!!errors.age)}
                />
                {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Sex</label>
                <select {...register('sex')} className={fieldCls(!!errors.sex)}>
                  <option value="">Select sex</option>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
                {errors.sex && <p className="mt-1.5 text-xs text-red-600">{errors.sex.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Chest Pain Type (cp)</label>
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
                <label className={labelCls}>
                  Resting Blood Pressure
                  <span className="ml-1 normal-case font-normal text-gray-400">(mm Hg)</span>
                </label>
                <input
                  type="number"
                  {...register('trestbps')}
                  placeholder="e.g. 130"
                  min={50}
                  max={300}
                  className={fieldCls(!!errors.trestbps)}
                />
                {errors.trestbps && <p className="mt-1.5 text-xs text-red-600">{errors.trestbps.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  Serum Cholesterol
                  <span className="ml-1 normal-case font-normal text-gray-400">(mg/dl)</span>
                </label>
                <input
                  type="number"
                  {...register('chol')}
                  placeholder="e.g. 245"
                  min={50}
                  max={600}
                  className={fieldCls(!!errors.chol)}
                />
                {errors.chol && <p className="mt-1.5 text-xs text-red-600">{errors.chol.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Fasting Blood Sugar (fbs)</label>
                <select {...register('fbs')} className={fieldCls(!!errors.fbs)}>
                  <option value="">Select level</option>
                  <option value="1">{'>'} 120 mg/dl</option>
                  <option value="0">{'≤'} 120 mg/dl</option>
                </select>
                {errors.fbs && <p className="mt-1.5 text-xs text-red-600">{errors.fbs.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Resting ECG Results</label>
                <select {...register('restecg')} className={fieldCls(!!errors.restecg)}>
                  <option value="">Select result</option>
                  <option value="0">Normal</option>
                  <option value="1">ST-T Wave Abnormality</option>
                  <option value="2">Left Ventricular Hypertrophy</option>
                </select>
                {errors.restecg && <p className="mt-1.5 text-xs text-red-600">{errors.restecg.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  Max Heart Rate
                  <span className="ml-1 normal-case font-normal text-gray-400">(bpm)</span>
                </label>
                <input
                  type="number"
                  {...register('thalch')}
                  placeholder="e.g. 150"
                  min={50}
                  max={250}
                  className={fieldCls(!!errors.thalch)}
                />
                {errors.thalch && <p className="mt-1.5 text-xs text-red-600">{errors.thalch.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Exercise Induced Angina (exang)</label>
                <select {...register('exang')} className={fieldCls(!!errors.exang)}>
                  <option value="">Select option</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
                {errors.exang && <p className="mt-1.5 text-xs text-red-600">{errors.exang.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  ST Depression
                  <span className="ml-1 normal-case font-normal text-gray-400">(oldpeak)</span>
                </label>
                <input
                  type="number"
                  {...register('oldpeak')}
                  placeholder="e.g. 1.5"
                  min={0}
                  step={0.1}
                  className={fieldCls(!!errors.oldpeak)}
                />
                {errors.oldpeak && <p className="mt-1.5 text-xs text-red-600">{errors.oldpeak.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Slope of Peak ST Segment</label>
                <select {...register('slope')} className={fieldCls(!!errors.slope)}>
                  <option value="">Select slope</option>
                  <option value="0">Upsloping</option>
                  <option value="1">Flat</option>
                  <option value="2">Downsloping</option>
                </select>
                {errors.slope && <p className="mt-1.5 text-xs text-red-600">{errors.slope.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  Major Vessels Colored
                  <span className="ml-1 normal-case font-normal text-gray-400">(ca)</span>
                </label>
                <select {...register('ca')} className={fieldCls(!!errors.ca)}>
                  <option value="">Select count</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                {errors.ca && <p className="mt-1.5 text-xs text-red-600">{errors.ca.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Thalassemia (thal)</label>
                <select {...register('thal')} className={fieldCls(!!errors.thal)}>
                  <option value="">Select type</option>
                  <option value="1">Normal</option>
                  <option value="2">Fixed Defect</option>
                  <option value="3">Reversible Defect</option>
                </select>
                {errors.thal && <p className="mt-1.5 text-xs text-red-600">{errors.thal.message}</p>}
              </div>

            </div>

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

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-base font-bold text-gray-800">Prediction Results</h3>
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-center gap-8">

              <div className="relative flex-shrink-0">
                <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
                  <circle cx="74" cy="74" r={RING_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  <circle
                    cx="74" cy="74" r={RING_RADIUS}
                    fill="none"
                    stroke={RISK_CONFIG[result.riskLevel].ring}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeOffset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900 leading-none">
                    {Math.round(result.probability * 100)}%
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 font-medium">Probability</span>
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">

                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${RISK_CONFIG[result.riskLevel].badge} mb-3`}>
                  <span>{RISK_CONFIG[result.riskLevel].icon}</span>
                  {result.riskLevel} Risk
                </span>

                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  {RISK_CONFIG[result.riskLevel].description}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Probability Score</p>
                    <p className="text-2xl font-extrabold text-gray-900">{result.probability.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Risk Category</p>
                    <p className={`text-2xl font-extrabold ${
                      result.riskLevel === 'High' ? 'text-red-600'
                      : result.riskLevel === 'Moderate' ? 'text-yellow-600'
                      : 'text-green-600'
                    }`}>
                      {result.riskLevel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Suggested Cardiologists</h3>
              <span className="text-xs text-gray-400 font-medium">Based on your risk profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {MOCK_DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${doc.avatarClass}`}>
                      {doc.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {doc.contact}
                  </div>

                  <button className="mt-auto w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2.5 rounded-lg transition-colors border border-blue-200 active:bg-blue-200">
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
