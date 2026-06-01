import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
}

export const login = (credentials: LoginCredentials) => api.post('/auth/login', credentials);
export const register = (data: RegisterData) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
