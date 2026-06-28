import axios from 'axios';
import api, { isNetworkError } from './api';
import { offlineResponse } from './mockData';
import type { PatientProfile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = (payload: LoginPayload) =>
  api.post<{ message: string }>('/auth/login', payload);

const STORED_EMAIL_KEY = 'cardia_user_email';

export const logout = async () => {
  localStorage.removeItem(STORED_EMAIL_KEY);
  try {
    return await api.get('/auth/logout');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse({ message: 'Logged out.' });
    throw err;
  }
};

const isAuthFailure = (err: unknown): boolean =>
  axios.isAxiosError(err) &&
  (err.response?.status === 401 || err.response?.status === 403);

const offlineRole = (): 'patient' | 'doctor' | 'admin' => {
  if (!import.meta.env.DEV) return 'patient';
  const stored = localStorage.getItem(STORED_EMAIL_KEY);
  if (stored) {
    const e = stored.toLowerCase();
    if (e.includes('admin')) return 'admin';
    if (e.includes('doctor') || e.includes('dr')) return 'doctor';
    return 'patient';
  }
  return (import.meta.env.VITE_OFFLINE_ROLE as 'patient' | 'doctor' | 'admin') ?? 'patient';
};

export const determineRole = async (): Promise<'patient' | 'doctor' | 'admin'> => {
  try {
    await api.get<PatientProfile>('/patient/me');
    return 'patient';
  } catch (err) {
    if (isNetworkError(err)) return offlineRole();
    if (!isAuthFailure(err)) throw err;
  }

  try {
    await api.get('/doctor/patients');
    return 'doctor';
  } catch (err) {
    if (isNetworkError(err)) return offlineRole();
    if (!isAuthFailure(err)) throw err;
  }

  return 'admin';
};
