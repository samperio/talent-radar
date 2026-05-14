import { useNavigate } from 'react-router-dom';
import { Download, Eye, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TalentRadar } from '../../components/RadarChart/TalentRadar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_COLORS,
} from '../../services/ScoringService';
import { exportResultsJSON, exportResultsCSV } from '../../services/ExportService';
import { CANDIDATE_COLORS } from '../../config';
import type { RecommendationLevel } from '../../types';

export function ResultsPage() {
  const { candidates, domains, config, getActiveProfile } = useAppStore();
  const navigate = useNavigate();
  const activeProfile = getActiveProfile();

  const completed = [...candidates.filter((c) => c.status === 'completed')].sort(
    (a, b) => (b.evaluationResult?.matchScore ?? 0) - (a.evaluationResult?.matchScore ?? 0)
  );

  const radarCandidates = completed.map((c, i) => ({
    name: c.name.split(' ')[0],
    color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
    scores: c.evaluationResult?.domainScores ?? [],
    matchScore: c.evaluationResult?.matchScore,
  }));

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resultados</h1>
          <p className="text-sm text-gray-500">
            {completed.length} evaluación{completed.length !== 1 ? 'es' : ''} completada{completed.length !== 1 ? 's' : ''}
          </p>
        </div>
        {completed.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => exportResultsJSON(candidates, config)}
            >
              <Download size={14} /> JSON
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => exportResultsCSV(candidates, domains)}
            >
              <Download size={14} /> CSV
            </Button>
          </div>
        )}
      </div>

      {completed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <AlertCircle size={40} className="mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">Sin resultados aún</p>
          <p className="text-sm text-gray-400">
            Los resultados aparecerán cuando los candidatos completen su evaluación
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Ranking */}
          <div className="xl:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Ranking por match
            </h2>
            {completed.map((c, idx) => {
              const rec = c.evaluationResult?.recommendation as RecommendationLevel;
              const colors = RECOMMENDATION_COLORS[rec];
              const color = CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length];
              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                          <span className="text-lg font-bold text-gray-900 shrink-0">
                            {c.evaluationResult?.matchScore}%
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">{c.targetLevel}</span>
                          <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                            {RECOMMENDATION_LABELS[rec]}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Score total: {c.evaluationResult?.overallScore}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/results/${c.id}`)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      <Eye size={12} /> Ver detalle
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Radar comparativo */}
          <div className="xl:col-span-3">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Comparativa de candidatos</CardTitle>
                <p className="text-xs text-gray-400">Todos vs perfil ideal (azul)</p>
              </CardHeader>
              <CardContent>
                {activeProfile ? (
                  <TalentRadar
                    idealProfile={activeProfile}
                    candidates={radarCandidates}
                    domains={domains}
                    size="lg"
                    showLegend
                  />
                ) : (
                  <p className="text-center text-sm text-gray-400 py-16">
                    Sin perfil ideal activo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
