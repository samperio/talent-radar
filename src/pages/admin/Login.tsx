import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin, config } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (loginAdmin(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Contraseña incorrecta. Verifica e inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Radar size={24} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{config.organizationName}</h1>
            <p className="text-sm text-gray-500">Acceso de Administrador</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Contraseña de administrador
            </label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoFocus
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Ingresar
          </Button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
