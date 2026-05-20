import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, Radar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { decodeCandidateToken } from '../../services/StorageService';

export function CandidateLogin() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { loginCandidate, updateCandidate } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    const decoded = decodeCandidateToken(token);
    if (!decoded?.name || !decoded?.accessKey) return;
    setName(decoded.name);
    setKey(decoded.accessKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const candidate = loginCandidate(name.trim(), key.trim().toUpperCase());
    if (!candidate) {
      setError('Clave no reconocida. Verifica tu nombre y clave con el administrador.');
      return;
    }
    if (candidate.status === 'completed') {
      setError('Ya completaste tu evaluación. Gracias por participar.');
      return;
    }
    if (candidate.status === 'expired') {
      setError('Tu acceso ha expirado. Contacta al administrador.');
      return;
    }
    if (candidate.status === 'pending') {
      updateCandidate(candidate.id, { status: 'in_progress' });
    }
    navigate('/candidate/evaluation');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
            <Radar size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Evaluación Técnica</h1>
            <p className="mt-1 text-sm text-slate-400">
              Ingresa con tu nombre y la clave que te asignaron
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-700/60 bg-slate-900 p-6"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Nombre completo
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Ana Martínez"
              autoFocus
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Clave de acceso
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="TLR-XXXX"
                required
                maxLength={8}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 py-2.5 pl-9 pr-3 font-mono text-sm tracking-widest text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            Iniciar evaluación
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-5 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </button>
      </div>
    </div>
  );
}
