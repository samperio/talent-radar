import type { AppConfig, Candidate, Domain } from '../types';
import { RECOMMENDATION_LABELS } from './ScoringService';
import type { RecommendationLevel } from '../types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    )
    .join('\n');
}

export function exportResultsJSON(candidates: Candidate[], config: AppConfig): void {
  const data = {
    exportDate: new Date().toISOString(),
    organizationName: config.organizationName,
    activeProfileId: config.activeProfileId,
    candidates: candidates
      .filter((c) => c.status === 'completed')
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        targetLevel: c.targetLevel,
        completedAt: c.completedAt,
        overallScore: c.evaluationResult?.overallScore,
        matchScore: c.evaluationResult?.matchScore,
        recommendation: c.evaluationResult?.recommendation,
        domainScores: c.evaluationResult?.domainScores,
        strengths: c.evaluationResult?.strengths,
        weaknesses: c.evaluationResult?.weaknesses,
      })),
  };
  downloadFile(
    JSON.stringify(data, null, 2),
    `talent-radar-results-${today()}.json`,
    'application/json'
  );
}

export function exportResultsCSV(candidates: Candidate[], domains: Domain[]): void {
  const headers: string[] = [
    'Nombre',
    'Email',
    'Nivel',
    'Fecha',
    'Score Total',
    'Match %',
    'Recomendación',
    ...domains.map((d) => d.name),
    'Fortalezas',
    'Debilidades',
  ];

  const rows = candidates
    .filter((c) => c.status === 'completed')
    .sort(
      (a, b) =>
        (b.evaluationResult?.matchScore ?? 0) - (a.evaluationResult?.matchScore ?? 0)
    )
    .map((c) => [
      c.name,
      c.email ?? '',
      c.targetLevel,
      c.completedAt ?? '',
      c.evaluationResult?.overallScore ?? '',
      c.evaluationResult?.matchScore ?? '',
      RECOMMENDATION_LABELS[c.evaluationResult?.recommendation as RecommendationLevel] ?? '',
      ...domains.map(
        (d) =>
          c.evaluationResult?.domainScores.find((ds) => ds.domainId === d.id)?.score ?? ''
      ),
      c.evaluationResult?.strengths?.join('; ') ?? '',
      c.evaluationResult?.weaknesses?.join('; ') ?? '',
    ]);

  downloadFile(
    toCSV([headers, ...rows]),
    `talent-radar-results-${today()}.csv`,
    'text/csv;charset=utf-8;'
  );
}
