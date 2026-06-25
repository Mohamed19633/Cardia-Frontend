import api from './api';
import { isNetworkError } from './api';
import { offlineResponse, MOCK_PATIENT_PROFILE, MOCK_DOCTORS } from './mockData';
import type { PatientProfile, ApiDoctor } from '../types';

export interface RegisterPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  age: number;
  doctorEmail: string;
}

export interface UpdatePatientPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  age: number;
  doctorEmail: string;
}

export const registerPatient = (payload: RegisterPayload) =>
  api.post<{ message: string }>('/patient/register', payload);

export const getPatientProfile = async () => {
  try {
    return await api.get<PatientProfile>('/patient/me');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_PATIENT_PROFILE);
    throw err;
  }
};

export const updatePatient = async (payload: UpdatePatientPayload) => {
  try {
    return await api.put<{ Message: string }>('/patient/update', payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse({ Message: 'Profile updated successfully.' });
    throw err;
  }
};

export const getDoctors = async () => {
  try {
    return await api.get<ApiDoctor[]>('/patient/doctors');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_DOCTORS);
    throw err;
  }
};

export const bookAppointment = async (doctorId: number) => {
  try {
    return await api.post<string>(`/patient/book-appointment/${doctorId}`, { id: doctorId });
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Appointment booked successfully.');
    throw err;
  }
};
