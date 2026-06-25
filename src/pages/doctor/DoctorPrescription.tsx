import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPrescriptionTemplate, savePrescription } from '../../services/doctorService';

interface LocationState {
  patientId?: number;
  patientName?: string;
}

const prescriptionSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  prescriptionDate: z.string().min(1, 'Date is required'),
  medication: z.string().min(1, 'Medication is required'),
  dosage: z.string().min(1, 'Dosage instructions are required'),
  duration: z.string().min(1, 'Duration is required'),
  summary: z.string().min(1, 'Diagnosis summary is required'),
  warnings: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';
const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

export default function DoctorPrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as LocationState;

  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientName: state.patientName ?? '',
      doctorName: '',
      prescriptionDate: new Date().toISOString().slice(0, 10),
      medication: '',
      dosage: '',
      duration: '',
      summary: '',
      warnings: '',
    },
  });

  useEffect(() => {
    if (!state.patientId) return;
    setTemplateLoading(true);
    getPrescriptionTemplate(state.patientId)
      .then((res) => {
        const tpl = res.data;
        reset({
          patientName: tpl.patientName,
          doctorName: tpl.doctorName,
          prescriptionDate: tpl.prescriptionDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          medication: '',
          dosage: '',
          duration: '',
          summary: tpl.content?.join('\n') ?? '',
          warnings: '',
        });
      })
      .catch(() => {})
      .finally(() => setTemplateLoading(false));
  }, [state.patientId, reset]);

  const buildContent = (data: PrescriptionFormData): string[] => {
    const lines: string[] = [
      `Medication: ${data.medication}`,
      `Dosage: ${data.dosage}`,
      `Duration: ${data.duration}`,
      `Diagnosis: ${data.summary}`,
    ];
    if (data.warnings?.trim()) {
      lines.push(`Warnings: ${data.warnings}`);
    }
    return lines;
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    setServerError('');
    try {
      await savePrescription({
        patientName: data.patientName,
        doctorName: data.doctorName,
        prescriptionDate: `${data.prescriptionDate} 00:00:00`,
        content: buildContent(data),
      });
      setSaved(true);
    } catch {
      setServerError('Failed to save prescription. Please try again.');
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setSaved(false);
    setServerError('');
    reset({
      patientName: state.patientName ?? '',
      doctorName: '',
      prescriptionDate: new Date().toISOString().slice(0, 10),
      medication: '',
      dosage: '',
      duration: '',
      summary: '',
      warnings: '',
    });
  };

  if (saved) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">Prescription Saved</p>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              The prescription for{' '}
              <span className="font-semibold text-gray-700">{getValues('patientName')}</span>{' '}
              has been saved successfully.
            </p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-slate-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              New Prescription
            </button>
          </div>
          <button
            onClick={() => navigate('../appointments')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Write a Prescription</h2>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Medical Prescription</h3>
            <p className="text-blue-100 text-xs mt-0.5">
              {templateLoading ? 'Loading patient template…' : 'Cardia Health System'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Patient Name</label>
              <input
                type="text"
                {...register('patientName')}
                placeholder="Patient full name"
                className={inputCls}
              />
              {errors.patientName && <p className="mt-1.5 text-xs text-red-600">{errors.patientName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Doctor Name</label>
              <input
                type="text"
                {...register('doctorName')}
                placeholder="Dr. Full Name"
                className={inputCls}
              />
              {errors.doctorName && <p className="mt-1.5 text-xs text-red-600">{errors.doctorName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Prescription Date</label>
              <input
                type="date"
                {...register('prescriptionDate')}
                className={inputCls}
              />
              {errors.prescriptionDate && <p className="mt-1.5 text-xs text-red-600">{errors.prescriptionDate.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Treatment Duration</label>
              <input
                type="text"
                {...register('duration')}
                placeholder="e.g. 3 months"
                className={inputCls}
              />
              {errors.duration && <p className="mt-1.5 text-xs text-red-600">{errors.duration.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Medication</label>
            <input
              type="text"
              {...register('medication')}
              placeholder="e.g. Aspirin 75 mg, Atorvastatin 40 mg"
              className={inputCls}
            />
            {errors.medication && <p className="mt-1.5 text-xs text-red-600">{errors.medication.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Dosage Instructions</label>
            <input
              type="text"
              {...register('dosage')}
              placeholder="e.g. Once daily after meals; Atorvastatin at night"
              className={inputCls}
            />
            {errors.dosage && <p className="mt-1.5 text-xs text-red-600">{errors.dosage.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Prescription Content / Diagnosis Summary</label>
            <textarea
              {...register('summary')}
              placeholder="Summarize clinical findings, working diagnosis, and management plan…"
              rows={4}
              className={`${inputCls} resize-none`}
            />
            {errors.summary && <p className="mt-1.5 text-xs text-red-600">{errors.summary.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Warnings &amp; Notes</label>
            <textarea
              {...register('warnings')}
              placeholder="Contraindications, dietary restrictions, follow-up schedule, emergency signs…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-slate-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? 'Saving…' : 'Save & Send to Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
