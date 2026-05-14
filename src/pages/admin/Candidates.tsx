import { useState } from 'react';
import { Plus, Copy, RefreshCw, Trash2, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../../components/ui/dialog';
import type { Candidate } from '../../types';

const STATUS_LABELS: Record<Candidate['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  expired: 'Expirado',
};

const STATUS_COLORS: Record<Candidate['status'], string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
};

const LEVEL_LABELS: Record<Candidate['targetLevel'], string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
  architect: 'Arquitecto',
};

export function CandidatesPage() {
  const { candidates, addCandidate, deleteCandidate, regenerateCandidateKey } = useAppStore();
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<Candidate['targetLevel']>('senior');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newCandidateKey, setNewCandidateKey] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    const cand = addCandidate({ name: name.trim(), email: email.trim() || undefined, targetLevel: level });
    setNewCandidateKey(cand.accessKey);
    setName('');
    setEmail('');
    setLevel('senior');
    setShowDialog(false);
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenKey = (id: string) => {
    const newKey = regenerateCandidateKey(id);
    setCopiedKey(null);
    setNewCandidateKey(newKey);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-sm text-gray-500">
            {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} registrado{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus size={16} /> Agregar candidato
        </Button>
      </div>

      {/* Nueva clave banner */}
      {newCandidateKey && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3">
          <Check size={16} className="text-green-600" />
          <p className="text-sm text-green-700">
            Candidato creado. Clave de acceso:
          </p>
          <span className="rounded-md bg-green-100 px-2 py-0.5 font-mono text-sm font-bold text-green-900">
            {newCandidateKey}
          </span>
          <button
            onClick={() => copyKey(newCandidateKey)}
            className="ml-auto flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900"
          >
            <Copy size={14} /> Copiar
          </button>
          <button
            onClick={() => setNewCandidateKey(null)}
            className="text-green-500 hover:text-green-700 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabla */}
      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 mb-2">No hay candidatos aún</p>
          <p className="text-sm text-gray-400">
            Agrega candidatos para enviarles su clave de evaluación
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nivel</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Clave</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Completado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{LEVEL_LABELS[c.targetLevel]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">
                        {c.accessKey}
                      </span>
                      <button
                        onClick={() => copyKey(c.accessKey)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar clave"
                      >
                        {copiedKey === c.accessKey ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[c.status]}>
                      {STATUS_LABELS[c.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {c.completedAt
                      ? new Date(c.completedAt).toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {c.status !== 'completed' && (
                        <button
                          onClick={() => handleRegenKey(c.id)}
                          className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Regenerar clave"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCandidate(c.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Eliminar candidato"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog agregar */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogHeader onClose={() => setShowDialog(false)}>
          Agregar candidato
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Ana Martínez"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Email <span className="text-gray-400">(opcional)</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@empresa.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nivel objetivo
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Candidate['targetLevel'])}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            Se generará una clave de acceso automáticamente con formato TLR-XXXX
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Crear candidato
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
