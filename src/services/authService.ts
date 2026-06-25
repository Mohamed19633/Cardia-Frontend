import api from './api';
import type { PatientProfile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = (payload: LoginPayload) =>
  api.post<{ message: string }>('/auth/login', payload);

export const logout = () => api.get('/auth/logout');

export const determineRole = async (): Promise<'patient' | 'doctor' | 'admin'> => {
  try {
    await api.get<PatientProfile>('/patient/me');
    return 'patient';
  } catch {
    try {
      await api.get('/doctor/patients');
      return 'doctor';
    } catch {
      return 'admin';
    }
  }
};
