import api from './api';
import { isNetworkError } from './api';
import { offlineResponse, MOCK_ADMIN_USERS, MOCK_ADMIN_PREDICTIONS } from './mockData';
import type { AdminUser, AdminPrediction } from '../types';

export interface AddDoctorPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  age: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  specialization: string;
  workTime: string;
}

export const getAdminUsers = async () => {
  try {
    return await api.get<AdminUser[]>('/admin/users');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_ADMIN_USERS);
    throw err;
  }
};

export const getAdminUserById = async (id: number) => {
  try {
    return await api.get<AdminUser>(`/admin/users/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const user = MOCK_ADMIN_USERS.find((u) => u.id === id) ?? MOCK_ADMIN_USERS[0];
      return offlineResponse(user);
    }
    throw err;
  }
};

export interface UpdateUserPayload {
  userName: string;
  email: string;
  contactNumber: string;
  age: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
}

export const updateAdminUser = async (id: number, payload: UpdateUserPayload) => {
  try {
    return await api.put<AdminUser>(`/admin/users/${id}`, payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const existing = MOCK_ADMIN_USERS.find((u) => u.id === id) ?? MOCK_ADMIN_USERS[0];
      return offlineResponse({ ...existing, ...payload } as AdminUser);
    }
    throw err;
  }
};

export const deleteAdminUser = async (id: number) => {
  try {
    return await api.delete<string>(`/admin/users/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('User deleted successfully.');
    throw err;
  }
};

export const getAdminPredictions = async () => {
  try {
    return await api.get<AdminPrediction[]>('/admin/predictions');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_ADMIN_PREDICTIONS);
    throw err;
  }
};

export const deleteAdminPrediction = async (id: number) => {
  try {
    return await api.delete<string>(`/admin/predictions/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Prediction deleted successfully.');
    throw err;
  }
};

export const addDoctor = async (payload: AddDoctorPayload) => {
  try {
    return await api.post<{ message: string }>('/admin/doctors', payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse({ message: 'Doctor registered successfully.' });
    throw err;
  }
};
