import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TalentRadar } from '../../components/RadarChart/TalentRadar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_COLORS,
  generateSummary,
} from '../../services/ScoringService';
import type { RecommendationLevel } from '../../types';

export function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidates, domains, getActiveProfile } = useAppStore();
  const [openDomain, setOpenDomain] = useState<string | null>(null);

  const candidate = candidates.find((c) => c.id === id);
  const activeProfile = getActiveProfile();

  if (!candidate || !candidate.evaluationResult) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Volver
        </button>
        <p className="text-gray-500">Candidato no encontrado o sin evaluación.</p>
      </div>
    );
  }

  const result = candidate.evaluationResult;
  const rec = result.recommendation as RecommendationLevel;
  const colors = RECOMMENDATION_COLORS[rec];

  const radarCandidate = {
    name: candidate.name,
    color: '#F97316',
    scores: result.domainScores,
    matchScore: result.matchScore,
  };

  const summary = generateSummary(
    candidate.name,
    result.matchScore,
    result.strengths,
    result.weaknesses,
    result.recommendation
  );

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/results')}
        className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Volver a resultados
      </button>

      {/* Header candidato */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-sm text-gray-500">
            Nivel: {candidate.targetLevel} · Completado:{' '}
            {candidate.completedAt
              ? new Date(candidate.completedAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{result.matchScore}%</p>
            <p className="text-xs text-gray-500">Match con perfil ideal</p>
          </div>
          <Badge className={`${colors.bg} ${colors.text} px-3 py-1.5 text-sm font-medium`}>
            {RECOMMENDATION_LABELS[rec]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Radar de competencias</CardTitle>
            <p className="text-xs text-gray-400">
              Candidato (naranja) vs Perfil ideal (azul)
            </p>
          </CardHeader>
          <CardContent>
            {activeProfile && (
              <TalentRadar
                idealProfile={activeProfile}
                candidates={[radarCandidate]}
                domains={domains}
                size="lg"
                showLegend
              />
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del evaluador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
            </CardContent>
          </Card>

          {/* Scores por dominio */}
          <Card>
            <CardHeader>
              <CardTitle>Puntuaciones por dominio</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left font-medium text-gray-600">Dominio</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Score</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Ideal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {domains.map((d) => {
                    const ds = result.domainScores.find((s) => s.domainId === d.id);
                    const target = activeProfile?.domainTargets.find(
                      (t) => t.domainId === d.id
                    );
                    const score = ds?.score ?? 0;
                    const ideal = target?.targetScore ?? 0;
                    const ok = score >= ideal;
                    return (
                      <tr key={d.id}>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="text-gray-700">{d.name}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`font-bold ${
                              score >= 75
                                ? 'text-green-600'
                                : score >= 50
                                ? 'text-yellow-600'
                                : 'text-red-500'
                            }`}
                          >
                            {score}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-400">
                          {ideal}
                          {!ok && (
                            <span className="ml-1 text-xs text-red-400">
                              (−{ideal - score})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Fortalezas y debilidades */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={15} /> Fortalezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strengths.length === 0 ? (
                  <p className="text-sm text-gray-400">Ninguna identificada</p>
                ) : (
                  <ul className="space-y-1">
                    {result.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle size={15} /> Áreas de desarrollo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.weaknesses.length === 0 ? (
                  <p className="text-sm text-gray-400">Ninguna identificada</p>
                ) : (
                  <ul className="space-y-1">
                    {result.weaknesses.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Respuestas detalladas */}
      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Respuestas por dominio</h2>
        <div className="space-y-3">
          {domains.map((d) => {
            const isOpen = openDomain === d.id;
            const domainAnswers = result.answers.filter((a) => a.domainId === d.id);
            return (
              <div
                key={d.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <button
                  onClick={() => setOpenDomain(isOpen ? null : d.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="font-medium text-gray-900">{d.fullName}</span>
                    <Badge className="bg-gray-100 text-gray-600">
                      {result.domainScores.find((s) => s.domainId === d.id)?.score ?? 0} pts
                    </Badge>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {d.topics.map((topic) => {
                      const topicAnswers = domainAnswers.filter(
                        (a) => a.topicId === topic.id
                      );
                      return (
                        <div key={topic.id} className="mt-4">
                          <p className="mb-2 text-sm font-semibold text-gray-700">
                            {topic.name}
                          </p>
                          {topic.questions.map((q) => {
                            const ans = topicAnswers.find((a) => a.questionId === q.id);
                            const val = typeof ans?.value === 'number' ? ans.value : 0;
                            const selectedOption = q.options?.[val - 1];
                            return (
                              <div
                                key={q.id}
                                className="mb-3 rounded-lg bg-gray-50 p-3"
                              >
                                <p className="mb-2 text-sm text-gray-700">{q.text}</p>
                                <div className="flex items-start gap-2">
                                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                    Opción {String.fromCharCode(64 + val)}
                                  </span>
                                  <p className="text-xs text-gray-600">{selectedOption}</p>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">
                                  Score normalizado:{' '}
                                  <strong>{Math.round((ans?.normalizedScore ?? 0))}%</strong>
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate('/admin/results')} className="gap-2">
          <ArrowLeft size={14} /> Volver a resultados
        </Button>
      </div>
    </div>
  );
}
