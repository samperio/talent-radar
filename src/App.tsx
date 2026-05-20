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
  const { initialize, isLoading, dbError } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (dbError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md rounded-xl border border-red-500/30 bg-slate-900 p-6">
          <h1 className="mb-2 text-lg font-bold text-red-400">Servidor no disponible</h1>
          <p className="mb-4 text-sm text-slate-300">
            No se pudo conectar al servidor local. Asegúrate de que esté corriendo:
          </p>
          <pre className="mb-4 rounded-lg bg-slate-800 px-4 py-3 text-sm text-emerald-400">
            npm run start
          </pre>
          <button
            onClick={() => initialize()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
