import api from './api';
import { isNetworkError } from './api';
import {
  offlineResponse,
  MOCK_DOCTOR_PATIENTS,
  MOCK_PREDICTIONS,
  MOCK_PRESCRIPTION_TEMPLATE,
  MOCK_PATIENT_PROFILE,
} from './mockData';
import type { DoctorPatient, PredictionItem, PrescriptionTemplate } from '../types';

export interface SavePrescriptionPayload {
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  content: string[];
}

export const getDoctorPatients = async () => {
  try {
    return await api.get<DoctorPatient[]>('/doctor/patients');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_DOCTOR_PATIENTS);
    throw err;
  }
};

export const getPatientPredictions = async (patientId: number) => {
  try {
    return await api.get<PredictionItem[]>(`/doctor/patients/${patientId}/predictions`);
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const patient = MOCK_DOCTOR_PATIENTS.find((p) => p.id === patientId);
      const name = patient?.patientName ?? 'Patient';
      return offlineResponse(MOCK_PREDICTIONS.map((p) => ({ ...p, belongsTo: name })));
    }
    throw err;
  }
};

export const getPrescriptionTemplate = async (patientId: number) => {
  try {
    return await api.get<PrescriptionTemplate>(`/doctor/patients/${patientId}/prescription`);
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const patient = MOCK_DOCTOR_PATIENTS.find((p) => p.id === patientId);
      return offlineResponse({
        ...MOCK_PRESCRIPTION_TEMPLATE,
        patientName: patient?.patientName ?? MOCK_PRESCRIPTION_TEMPLATE.patientName,
      });
    }
    throw err;
  }
};

export const getPrescriptionByPrediction = async (patientId: number, predictionId: number) => {
  try {
    return await api.get<PrescriptionTemplate>(
      `/doctor/patients/${patientId}/predictions/${predictionId}/prescription`
    );
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const patient = MOCK_DOCTOR_PATIENTS.find((p) => p.id === patientId);
      const predIndex = MOCK_PREDICTIONS.findIndex((p) => p.id === predictionId);
      const prescriptions = MOCK_PATIENT_PROFILE.prescriptions;
      const fallback = prescriptions[predIndex] ?? MOCK_PRESCRIPTION_TEMPLATE;
      return offlineResponse<PrescriptionTemplate>({
        ...fallback,
        patientName: patient?.patientName ?? fallback.patientName,
      });
    }
    throw err;
  }
};

export const savePrescription = async (payload: SavePrescriptionPayload) => {
  try {
    return await api.post<string>('/doctor/save-prescription', payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Prescription saved successfully.');
    throw err;
  }
};
