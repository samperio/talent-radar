import { useState } from 'react';
import { Plus, Check, Star, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TalentRadar } from '../../components/RadarChart/TalentRadar';
import { Slider } from '../../components/ui/slider';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../../components/ui/dialog';
import type { IdealProfile } from '../../types';

export function IdealProfilePage() {
  const { profiles, config, domains, addProfile, updateProfile, deleteProfile, setActiveProfile } =
    useAppStore();

  const activeId = config.activeProfileId ?? profiles[0]?.id;
  const activeProfile = profiles.find((p) => p.id === activeId) ?? profiles[0];

  const [editId, setEditId] = useState<string | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [draftTargets, setDraftTargets] = useState<Record<string, number>>({});

  const startEdit = (profile: IdealProfile) => {
    setEditId(profile.id);
    const targets: Record<string, number> = {};
    profile.domainTargets.forEach((t) => { targets[t.domainId] = t.targetScore; });
    setDraftTargets(targets);
  };

  const cancelEdit = () => { setEditId(null); setDraftTargets({}); };

  const saveEdit = () => {
    if (!editId) return;
    const profile = profiles.find((p) => p.id === editId);
    if (!profile) return;
    updateProfile(editId, {
      domainTargets: domains.map((d) => ({
        domainId: d.id,
        targetScore: draftTargets[d.id] ?? 0,
      })),
    });
    cancelEdit();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const targets = domains.map((d) => ({
      domainId: d.id,
      targetScore: draftTargets[d.id] ?? 70,
    }));
    const created = addProfile({ name: newName.trim(), domainTargets: targets });
    setActiveProfile(created.id);
    setShowNewDialog(false);
    setNewName('');
    setDraftTargets({});
  };

  const openNew = () => {
    const init: Record<string, number> = {};
    domains.forEach((d) => { init[d.id] = 70; });
    setDraftTargets(init);
    setShowNewDialog(true);
  };

  const previewProfile = (profileId: string | null) => {
    if (editId === profileId) {
      const p = profiles.find((p) => p.id === editId)!;
      return {
        ...p,
        domainTargets: domains.map((d) => ({
          domainId: d.id,
          targetScore: draftTargets[d.id] ?? 0,
        })),
      };
    }
    return profiles.find((p) => p.id === profileId) ?? activeProfile;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Perfiles Ideales</h1>
          <p className="text-sm text-gray-500">
            Define el perfil de referencia para evaluar candidatos
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus size={16} /> Nuevo perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Lista de perfiles */}
        <div className="space-y-4">
          {profiles.map((profile) => {
            const isActive = profile.id === activeId;
            const isEditing = editId === profile.id;
            return (
              <Card
                key={profile.id}
                className={isActive ? 'border-blue-400 ring-2 ring-blue-200' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Star size={14} className="fill-blue-500 text-blue-500" />
                      )}
                      <CardTitle>{profile.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveProfile(profile.id)}
                          className="text-xs"
                        >
                          Activar
                        </Button>
                      )}
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(profile)}
                          className="text-xs"
                        >
                          Editar
                        </Button>
                      )}
                      {profiles.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteProfile(profile.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Creado: {new Date(profile.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      {domains.map((d) => (
                        <Slider
                          key={d.id}
                          label={d.fullName}
                          value={draftTargets[d.id] ?? 0}
                          onChange={(v) => setDraftTargets((prev) => ({ ...prev, [d.id]: v }))}
                          color={d.color}
                        />
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Button onClick={saveEdit} className="gap-2">
                          <Check size={14} /> Guardar
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {domains.map((d) => {
                        const t = profile.domainTargets.find((t) => t.domainId === d.id);
                        return (
                          <div key={d.id} className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="flex-1 text-xs text-gray-600">{d.fullName}</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {t?.targetScore ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Radar preview */}
        <Card className="sticky top-6 self-start">
          <CardHeader>
            <CardTitle>Vista previa del radar</CardTitle>
            <p className="text-xs text-gray-400">
              {editId
                ? 'Actualizando en tiempo real mientras editas'
                : activeProfile?.name ?? 'Sin perfil activo'}
            </p>
          </CardHeader>
          <CardContent>
            {activeProfile && (
              <TalentRadar
                idealProfile={previewProfile(editId ?? activeId) ?? activeProfile}
                domains={domains}
                size="md"
                showLegend={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog nuevo perfil */}
      <Dialog open={showNewDialog} onClose={() => setShowNewDialog(false)}>
        <DialogHeader onClose={() => setShowNewDialog(false)}>
          Nuevo perfil ideal
        </DialogHeader>
        <DialogBody>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nombre del perfil
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ej: Arquitecto de Integración Senior"
              autoFocus
            />
          </div>
          <div className="space-y-4">
            {domains.map((d) => (
              <Slider
                key={d.id}
                label={d.fullName}
                value={draftTargets[d.id] ?? 70}
                onChange={(v) => setDraftTargets((prev) => ({ ...prev, [d.id]: v }))}
                color={d.color}
              />
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!newName.trim()}>
            Crear perfil
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
