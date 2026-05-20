import { useNavigate } from 'react-router-dom';
import { Shield, User, ChevronRight, Radar, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Landing() {
  const navigate = useNavigate();
  const { config } = useAppStore();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute left-1/3 top-2/3 h-64 w-64 rounded-full bg-cyan-500/5 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
          <Radar size={30} className="text-white" />
        </div>

        <div className="mb-1 mt-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {config.organizationName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Evaluación de Arquitectura de Integración de Sistemas
          </p>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-slate-800" />

        {/* Cards */}
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => navigate('/admin/login')}
            className="group flex items-center gap-4 rounded-xl border border-blue-500/20 bg-blue-600/10 p-4 text-left transition-all hover:border-blue-500/40 hover:bg-blue-600/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 transition-colors group-hover:bg-blue-600/40">
              <Shield size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">Administrador</p>
              <p className="truncate text-xs text-slate-400">
                Candidatos · Perfiles · Resultados
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate('/candidate/login')}
            className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:border-slate-600 hover:bg-slate-800"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300 transition-colors group-hover:bg-slate-600">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">Candidato</p>
              <p className="truncate text-xs text-slate-400">
                Inicia tu evaluación con tu clave de acceso
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-1.5 text-xs text-slate-600">
          <Zap size={11} />
          <span>Telecomunicaciones · Arquitectura de Integración</span>
        </div>
      </div>
    </div>
  );
}
