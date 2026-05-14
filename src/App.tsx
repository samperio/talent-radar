import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

import { AdminLayout } from './components/Layout/AdminLayout';
import { CandidateLayout } from './components/Layout/CandidateLayout';
import { AdminGuard, CandidateGuard } from './components/AuthGuard';

import { Landing } from './pages/Landing';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { IdealProfilePage } from './pages/admin/IdealProfile';
import { CandidatesPage } from './pages/admin/Candidates';
import { ResultsPage } from './pages/admin/Results';
import { ResultDetail } from './pages/admin/ResultDetail';
import { CandidateLogin } from './pages/candidate/Login';
import { Evaluation } from './pages/candidate/Evaluation';
import { Done } from './pages/candidate/Done';

export default function App() {
  const { initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="ideal-profile" element={<IdealProfilePage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="results/:id" element={<ResultDetail />} />
        </Route>

        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route
            path="evaluation"
            element={
              <CandidateGuard>
                <Evaluation />
              </CandidateGuard>
            }
          />
          <Route path="done" element={<Done />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
