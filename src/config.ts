import type { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  adminPassword: 'admin2024',
  organizationName: 'TalentRadar',
  activeProfileId: null,
};

export const STORAGE_KEYS = {
  CONFIG: 'talent-radar:config',
  DOMAINS: 'talent-radar:domains',
  PROFILES: 'talent-radar:profiles',
  CANDIDATES: 'talent-radar:candidates',
  SESSION: (id: string) => `talent-radar:session:${id}`,
} as const;

export const CANDIDATE_COLORS = [
  '#F97316',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#EC4899',
  '#0EA5E9',
  '#84CC16',
  '#F59E0B',
];
