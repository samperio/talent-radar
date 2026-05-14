import { create } from 'zustand';
import type { Answer, AppConfig, Candidate, Domain, IdealProfile } from '../types';
import {
  loadConfig,
  loadCandidates,
  loadDomains,
  loadProfiles,
  saveConfig,
  saveCandidates,
  saveProfiles,
  initializeStorage,
  generateAccessKey,
} from '../services/StorageService';
import { computeEvaluationResult } from '../services/ScoringService';

interface AppState {
  config: AppConfig;
  domains: Domain[];
  profiles: IdealProfile[];
  candidates: Candidate[];
  adminAuthenticated: boolean;
  currentCandidate: Candidate | null;

  initialize: () => void;

  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  loginCandidate: (name: string, key: string) => Candidate | null;
  logoutCandidate: () => void;

  updateConfig: (config: Partial<AppConfig>) => void;

  addProfile: (profile: Omit<IdealProfile, 'id' | 'createdAt'>) => IdealProfile;
  updateProfile: (id: string, data: Partial<IdealProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  getActiveProfile: () => IdealProfile | null;

  addCandidate: (data: Pick<Candidate, 'name' | 'email' | 'targetLevel'>) => Candidate;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  regenerateCandidateKey: (id: string) => string;
  completeEvaluation: (candidateId: string, answers: Answer[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  config: { adminPassword: 'admin2024', organizationName: 'TalentRadar', activeProfileId: null },
  domains: [],
  profiles: [],
  candidates: [],
  adminAuthenticated: false,
  currentCandidate: null,

  initialize: () => {
    initializeStorage();
    set({
      config: loadConfig(),
      domains: loadDomains(),
      profiles: loadProfiles(),
      candidates: loadCandidates(),
    });
  },

  loginAdmin: (password) => {
    const { config } = get();
    if (password === config.adminPassword) {
      set({ adminAuthenticated: true });
      return true;
    }
    return false;
  },

  logoutAdmin: () => set({ adminAuthenticated: false }),

  loginCandidate: (name, key) => {
    const { candidates } = get();
    const found = candidates.find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.accessKey === key.toUpperCase()
    );
    if (found) {
      set({ currentCandidate: found });
      return found;
    }
    return null;
  },

  logoutCandidate: () => set({ currentCandidate: null }),

  updateConfig: (data) => {
    const newConfig = { ...get().config, ...data };
    saveConfig(newConfig);
    set({ config: newConfig });
  },

  addProfile: (data) => {
    const profile: IdealProfile = {
      ...data,
      id: `profile-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const profiles = [...get().profiles, profile];
    saveProfiles(profiles);
    set({ profiles });
    return profile;
  },

  updateProfile: (id, data) => {
    const profiles = get().profiles.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveProfiles(profiles);
    set({ profiles });
  },

  deleteProfile: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id);
    saveProfiles(profiles);
    const config = get().config;
    if (config.activeProfileId === id) {
      const newConfig = { ...config, activeProfileId: profiles[0]?.id ?? null };
      saveConfig(newConfig);
      set({ profiles, config: newConfig });
    } else {
      set({ profiles });
    }
  },

  setActiveProfile: (id) => {
    const newConfig = { ...get().config, activeProfileId: id };
    saveConfig(newConfig);
    set({ config: newConfig });
  },

  getActiveProfile: () => {
    const { config, profiles } = get();
    if (!config.activeProfileId) return profiles[0] ?? null;
    return profiles.find((p) => p.id === config.activeProfileId) ?? profiles[0] ?? null;
  },

  addCandidate: (data) => {
    const { candidates } = get();
    const accessKey = generateAccessKey(candidates.map((c) => c.accessKey));
    const candidate: Candidate = {
      ...data,
      id: `cand-${Date.now()}`,
      accessKey,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [...candidates, candidate];
    saveCandidates(updated);
    set({ candidates: updated });
    return candidate;
  },

  updateCandidate: (id, data) => {
    const candidates = get().candidates.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveCandidates(candidates);
    const current = get().currentCandidate;
    set({
      candidates,
      currentCandidate: current?.id === id ? { ...current, ...data } : current,
    });
  },

  deleteCandidate: (id) => {
    const candidates = get().candidates.filter((c) => c.id !== id);
    saveCandidates(candidates);
    set({ candidates });
  },

  regenerateCandidateKey: (id) => {
    const { candidates } = get();
    const newKey = generateAccessKey(
      candidates.filter((c) => c.id !== id).map((c) => c.accessKey)
    );
    const updated = candidates.map((c) => (c.id === id ? { ...c, accessKey: newKey } : c));
    saveCandidates(updated);
    set({ candidates: updated });
    return newKey;
  },

  completeEvaluation: (candidateId, answers) => {
    const { candidates, domains, getActiveProfile } = get();
    const candidate = candidates.find((c) => c.id === candidateId);
    const profile = getActiveProfile();
    if (!candidate || !profile) return;

    const result = computeEvaluationResult(candidate, answers, domains, profile);
    const updated = candidates.map((c) =>
      c.id === candidateId
        ? { ...c, status: 'completed' as const, completedAt: result.completedAt, evaluationResult: result }
        : c
    );
    saveCandidates(updated);
    const updatedCandidate = updated.find((c) => c.id === candidateId)!;
    set({ candidates: updated, currentCandidate: updatedCandidate });
  },
}));
