import { Outlet } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function CandidateLayout() {
  const { config } = useAppStore();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
            <Radar size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{config.organizationName}</span>
          <span className="ml-auto text-xs text-gray-500">Evaluación de candidato</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
