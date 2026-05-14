import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { adminAuthenticated } = useAppStore();
  if (!adminAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export function CandidateGuard({ children }: { children: React.ReactNode }) {
  const { currentCandidate } = useAppStore();
  if (!currentCandidate) return <Navigate to="/candidate/login" replace />;
  return <>{children}</>;
}
