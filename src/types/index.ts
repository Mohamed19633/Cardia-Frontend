export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';
export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface PredictionItem {
  id?: number;
  DateAndTime: string;
  riskScore: string;
  result: string;
  belongsTo: string;
  age?: number;
  sex?: string;
  cp?: string;
  trestbps?: number;
  chol?: number;
  fbs?: string;
  restecg?: string;
  thalch?: number;
  exang?: string;
  oldpeak?: number;
  slope?: string;
  ca?: string;
  thal?: string;
}

export interface PrescriptionItem {
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  content: string[];
}

export interface PatientProfile {
  id: number;
  name: string;
  userName: string;
  email: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  age: number;
  doctorEmail: string;
  prescriptions: PrescriptionItem[];
  predictions: PredictionItem[];
}

export interface ApiDoctor {
  id: number;
  name: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  specialization: string;
  workTime: string;
}

export interface DoctorPatient {
  id: number;
  patientName: string;
  BookingDateAndTime: string;
}

export interface PrescriptionTemplate {
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  content: string[];
}

export interface AdminUser {
  id: number;
  userName: string;
  email: string;
  contactNumber: string;
  age: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  roleName: string;
}

export interface AdminPrediction {
  id?: number;
  DateAndTime: string;
  riskScore: string;
  result: string;
  belongsTo: string;
  age?: number;
  sex?: string;
  cp?: string;
  trestbps?: number;
  chol?: number;
  fbs?: string;
  restecg?: string;
  thalch?: number;
  exang?: string;
  oldpeak?: number;
  slope?: string;
  ca?: string;
  thal?: string;
}

export interface ClinicalFeatures {
  age: number;
  sex: string;
  cp: string;
  trestbps: number;
  chol: number;
  fbs: string;
  restecg: string;
  thalch: number;
  exang: string;
  oldpeak: number;
  slope: string;
  ca: string;
  thal: string;
}

export interface Appointment {
  id: number;
  patientName: string;
  patientContact: string;
  patientInitials: string;
  avatarClass: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}
