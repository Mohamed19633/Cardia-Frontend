import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { determineRole } from '../services/authService';
import { isNetworkError } from '../services/api';
import type { UserRole } from '../types';
import Spinner from './Spinner';

interface Props {
  allowed: UserRole;
}

export default function ProtectedRoute({ allowed }: Props) {
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    determineRole()
      .then((r) => setRole(r))
      .catch((err) => {
        if (isNetworkError(err))
          setRole(
            import.meta.env.DEV
              ? (import.meta.env.VITE_OFFLINE_ROLE as UserRole)
              : allowed,
          );
      })
      .finally(() => setChecking(false));
  }, [allowed]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (role === null) return <Navigate to="/login" replace />;

  if (role !== allowed) {
    const dest =
      role === 'patient' ? '/patient' : role === 'doctor' ? '/doctor' : '/admin';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
