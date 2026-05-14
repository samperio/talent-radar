export interface Domain {
  id: string;
  name: string;
  fullName: string;
  description: string;
  color: string;
  weight: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  questions: Question[];
}

export interface Question {
  id: string;
  topicId: string;
  domainId: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'boolean';
  options?: string[];
  weight: number;
  level: 'all' | 'senior' | 'architect';
}

export interface IdealProfile {
  id: string;
  name: string;
  createdAt: string;
  domainTargets: {
    domainId: string;
    targetScore: number;
  }[];
  description?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  accessKey: string;
  targetLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'architect';
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
  evaluationResult?: EvaluationResult;
}

export interface EvaluationResult {
  candidateId: string;
  completedAt: string;
  domainScores: DomainResult[];
  overallScore: number;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  answers: Answer[];
  recommendation: RecommendationLevel;
}

export type RecommendationLevel =
  | 'excellent_match'
  | 'good_match'
  | 'partial_match'
  | 'weak_match'
  | 'not_a_match';

export interface DomainResult {
  domainId: string;
  score: number;
  topicScores: { topicId: string; score: number }[];
}

export interface Answer {
  questionId: string;
  domainId: string;
  topicId: string;
  value: number | string | boolean;
  normalizedScore: number;
}

export interface AppConfig {
  adminPassword: string;
  organizationName: string;
  activeProfileId: string | null;
}
