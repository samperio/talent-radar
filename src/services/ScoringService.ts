import type {
  Answer,
  Candidate,
  Domain,
  DomainResult,
  EvaluationResult,
  IdealProfile,
  RecommendationLevel,
  Topic,
} from '../types';

function normalizeScore(value: number): number {
  return ((value - 1) / 3) * 100;
}

function calculateTopicScore(answers: Answer[], topic: Topic): number {
  const topicAnswers = answers.filter((a) => a.topicId === topic.id);
  if (topicAnswers.length === 0) return 0;
  const totalWeight = topic.questions.reduce((s, q) => s + q.weight, 0);
  const weightedSum = topicAnswers.reduce((s, a) => {
    const q = topic.questions.find((q) => q.id === a.questionId);
    return s + normalizeScore(a.value as number) * (q?.weight ?? 1);
  }, 0);
  return Math.round(weightedSum / totalWeight);
}

function calculateDomainScore(answers: Answer[], domain: Domain): DomainResult {
  const topicScores = domain.topics.map((t) => ({
    topicId: t.id,
    score: calculateTopicScore(answers, t),
  }));
  const avg = Math.round(
    topicScores.reduce((s, ts) => s + ts.score, 0) / topicScores.length
  );
  return { domainId: domain.id, score: avg, topicScores };
}

function calculateOverallScore(domainScores: DomainResult[], domains: Domain[]): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const ds of domainScores) {
    const domain = domains.find((d) => d.id === ds.domainId);
    if (!domain) continue;
    weightedSum += ds.score * domain.weight;
    totalWeight += domain.weight;
  }
  return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
}

function calculateMatchScore(domainScores: DomainResult[], idealProfile: IdealProfile): number {
  let totalDiff = 0;
  let count = 0;
  for (const target of idealProfile.domainTargets) {
    const actual = domainScores.find((ds) => ds.domainId === target.domainId);
    if (!actual) continue;
    const diff =
      actual.score >= target.targetScore
        ? (actual.score - target.targetScore) * 0.3
        : (target.targetScore - actual.score) * 1.0;
    totalDiff += Math.min(diff, 100);
    count++;
  }
  if (count === 0) return 0;
  return Math.round(Math.max(0, 100 - totalDiff / count));
}

export function getRecommendation(matchScore: number): RecommendationLevel {
  if (matchScore >= 85) return 'excellent_match';
  if (matchScore >= 70) return 'good_match';
  if (matchScore >= 55) return 'partial_match';
  if (matchScore >= 40) return 'weak_match';
  return 'not_a_match';
}

function identifyStrengthsWeaknesses(
  domainScores: DomainResult[],
  domains: Domain[]
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  for (const ds of domainScores) {
    const domain = domains.find((d) => d.id === ds.domainId);
    if (!domain) continue;
    if (ds.score >= 75) strengths.push(domain.fullName);
    else if (ds.score < 50) weaknesses.push(domain.fullName);
    for (const ts of ds.topicScores) {
      const topic = domain.topics.find((t) => t.id === ts.topicId);
      if (!topic) continue;
      if (ts.score >= 80) strengths.push(`${domain.name}: ${topic.name}`);
      else if (ts.score < 40) weaknesses.push(`${domain.name}: ${topic.name}`);
    }
  }
  return { strengths, weaknesses };
}

export function computeEvaluationResult(
  candidate: Candidate,
  answers: Answer[],
  domains: Domain[],
  idealProfile: IdealProfile
): EvaluationResult {
  const domainScores = domains.map((d) => calculateDomainScore(answers, d));
  const overallScore = calculateOverallScore(domainScores, domains);
  const matchScore = calculateMatchScore(domainScores, idealProfile);
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(domainScores, domains);

  return {
    candidateId: candidate.id,
    completedAt: new Date().toISOString(),
    domainScores,
    overallScore,
    matchScore,
    strengths,
    weaknesses,
    answers,
    recommendation: getRecommendation(matchScore),
  };
}

export const RECOMMENDATION_LABELS: Record<RecommendationLevel, string> = {
  excellent_match: 'Perfil Excelente',
  good_match: 'Buen Perfil',
  partial_match: 'Perfil Parcial',
  weak_match: 'Perfil Débil',
  not_a_match: 'No Califica',
};

export const RECOMMENDATION_COLORS: Record<
  RecommendationLevel,
  { bg: string; text: string; badge: string }
> = {
  excellent_match: { bg: 'bg-green-100', text: 'text-green-800', badge: 'border-green-300' },
  good_match: { bg: 'bg-teal-100', text: 'text-teal-800', badge: 'border-teal-300' },
  partial_match: { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'border-yellow-300' },
  weak_match: { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'border-orange-300' },
  not_a_match: { bg: 'bg-red-100', text: 'text-red-800', badge: 'border-red-300' },
};

export function generateSummary(
  candidateName: string,
  matchScore: number,
  strengths: string[],
  weaknesses: string[],
  recommendation: RecommendationLevel
): string {
  const recLabel = RECOMMENDATION_LABELS[recommendation];
  const strengthText =
    strengths.length > 0
      ? strengths.slice(0, 3).join(', ')
      : 'ninguna área destacada por encima del umbral';
  const weakText =
    weaknesses.length > 0
      ? weaknesses.slice(0, 3).join(', ')
      : 'ninguna área crítica identificada';

  return `${candidateName} obtuvo un match de ${matchScore}% con el perfil ideal. Sus principales fortalezas están en ${strengthText}. Presenta áreas de desarrollo en ${weakText}. Recomendación: ${recLabel}.`;
}
