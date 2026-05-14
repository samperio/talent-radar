import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function CandidateLogin() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { loginCandidate, updateCandidate } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const candidate = loginCandidate(name.trim(), key.trim().toUpperCase());
    if (!candidate) {
      setError('Clave no reconocida. Verifica con el administrador.');
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
    // Marcar como en progreso
    if (candidate.status === 'pending') {
      updateCandidate(candidate.id, { status: 'in_progress' });
    }
    navigate('/candidate/evaluation');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <KeyRound size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Evaluación Técnica</h1>
            <p className="text-sm text-gray-500">
              Ingresa con tu nombre y la clave que te asignaron
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Ana Martínez"
              autoFocus
              required
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Clave de acceso
            </label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="ej: TLR-4K9X"
              required
              className="font-mono tracking-widest"
              maxLength={8}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            Iniciar evaluación
          </Button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </button>
      </div>
    </div>
  );
}
