import { useNavigate } from 'react-router-dom';
import { Shield, User, Radar, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Landing() {
  const navigate = useNavigate();
  const { config } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/40">
          <Radar size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {config.organizationName}
          </h1>
          <p className="mt-1 text-sm text-blue-300">
            Evaluación de Talento en Arquitectura de Integración de Sistemas
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex w-full max-w-md flex-col gap-4">
        <button
          onClick={() => navigate('/admin/login')}
          className="group flex items-center gap-4 rounded-xl border border-blue-500/30 bg-blue-600/10 p-5 text-left transition-all hover:bg-blue-600/20 hover:border-blue-500/60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600/40">
            <Shield size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Modo Administrador</p>
            <p className="text-sm text-blue-300">
              Gestionar candidatos, perfiles ideales y resultados
            </p>
          </div>
          <ChevronRight size={18} className="text-blue-400 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => navigate('/candidate/login')}
          className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:bg-white/10 hover:border-white/20"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300 group-hover:bg-white/20">
            <User size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Modo Candidato</p>
            <p className="text-sm text-gray-400">
              Realizar evaluación con tu clave de acceso
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <p className="mt-10 text-xs text-blue-900/60 text-gray-600">
        Evaluación Técnica · Arquitectura de Integración de Sistemas · Telecomunicaciones
      </p>
    </div>
  );
}
