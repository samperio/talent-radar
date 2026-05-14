import { useNavigate } from 'react-router-dom';
import { Users, Target, BarChart2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TalentRadar } from '../../components/RadarChart/TalentRadar';
import { CANDIDATE_COLORS } from '../../config';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { candidates, domains, getActiveProfile } = useAppStore();
  const activeProfile = getActiveProfile();

  const completed = candidates.filter((c) => c.status === 'completed');
  const pending = candidates.filter((c) => c.status === 'pending');
  const inProgress = candidates.filter((c) => c.status === 'in_progress');

  const avgMatch =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, c) => s + (c.evaluationResult?.matchScore ?? 0), 0) /
            completed.length
        )
      : null;

  const radarCandidates = completed
    .sort((a, b) => (b.evaluationResult?.matchScore ?? 0) - (a.evaluationResult?.matchScore ?? 0))
    .slice(0, 5)
    .map((c, i) => ({
      name: c.name.split(' ')[0],
      color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
      scores: c.evaluationResult?.domainScores ?? [],
      matchScore: c.evaluationResult?.matchScore,
    }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-sm text-gray-500">
          Resumen de evaluaciones y estado del proceso de selección
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total candidatos"
          value={candidates.length}
          icon={<Users size={18} className="text-blue-600" />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Completados"
          value={completed.length}
          icon={<CheckCircle size={18} className="text-green-600" />}
          bg="bg-green-50"
        />
        <StatCard
          label="Pendientes"
          value={pending.length + inProgress.length}
          icon={<Clock size={18} className="text-yellow-600" />}
          bg="bg-yellow-50"
        />
        <StatCard
          label="Match promedio"
          value={avgMatch !== null ? `${avgMatch}%` : '—'}
          icon={<Target size={18} className="text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Radar + acciones rápidas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar overview */}
        <Card>
          <CardHeader>
            <CardTitle>Radar Comparativo</CardTitle>
            <p className="text-xs text-gray-500">Top 5 candidatos vs perfil ideal</p>
          </CardHeader>
          <CardContent>
            {activeProfile && completed.length > 0 ? (
              <TalentRadar
                idealProfile={activeProfile}
                candidates={radarCandidates}
                domains={domains}
                size="md"
                showLegend
              />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-sm text-gray-400">
                <AlertCircle size={32} className="text-gray-300" />
                <p>
                  {!activeProfile
                    ? 'Define un perfil ideal primero'
                    : 'Aún no hay evaluaciones completadas'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="space-y-4">
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/ideal-profile')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Target size={22} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Perfil Ideal</p>
                <p className="text-sm text-gray-500">
                  {activeProfile ? `Activo: ${activeProfile.name}` : 'Sin perfil configurado'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/candidates')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gestionar Candidatos</p>
                <p className="text-sm text-gray-500">
                  {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} registrado{candidates.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/results')}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <BarChart2 size={22} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Resultados</p>
                <p className="text-sm text-gray-500">
                  {completed.length} evaluación{completed.length !== 1 ? 'es' : ''} completada{completed.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
