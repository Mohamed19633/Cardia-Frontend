import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPatientProfile } from '../services/patientService';
import type { PatientProfile } from '../types';

interface PatientContextValue {
  profile: PatientProfile | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

const PatientContext = createContext<PatientContextValue>({
  profile: null,
  loading: true,
  error: '',
  refetch: () => {},
});

export function PatientProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = () => {
    setLoading(true);
    setError('');
    getPatientProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setError('Failed to load your profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProfile, []);

  return (
    <PatientContext.Provider value={{ profile, loading, error, refetch: fetchProfile }}>
      {children}
    </PatientContext.Provider>
  );
}

export const usePatient = () => useContext(PatientContext);
