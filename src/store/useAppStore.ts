import { create } from 'zustand';
import type { Answer, AppConfig, Candidate, Domain, IdealProfile } from '../types';
import { DEFAULT_CONFIG } from '../config';
import { SEED_DOMAINS, DEFAULT_IDEAL_PROFILE } from '../data/SEED_DATA';
import { generateAccessKey } from '../services/StorageService';
import { computeEvaluationResult } from '../services/ScoringService';
import {
  loadConfig,
  saveConfig,
  loadProfiles,
  insertProfile,
  patchProfile,
  removeProfile,
  loadCandidates,
  insertCandidate,
  patchCandidate,
  removeCandidate,
  clearSession,
} from '../services/DataService';

interface AppState {
  config: AppConfig;
  domains: Domain[];
  profiles: IdealProfile[];
  candidates: Candidate[];
  adminAuthenticated: boolean;
  currentCandidate: Candidate | null;
  isLoading: boolean;
  dbError: string | null;

  initialize: () => Promise<void>;

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
  completeEvaluation: (candidateId: string, answers: Answer[]) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  config: DEFAULT_CONFIG,
  domains: SEED_DOMAINS,
  profiles: [DEFAULT_IDEAL_PROFILE],
  candidates: [],
  adminAuthenticated: false,
  currentCandidate: null,
  isLoading: true,
  dbError: null,

  initialize: async () => {
    set({ isLoading: true, dbError: null });
    try {
      const [config, profiles, candidates] = await Promise.all([
        loadConfig(),
        loadProfiles(),
        loadCandidates(),
      ]);
      set({
        config,
        domains: SEED_DOMAINS,
        profiles,
        candidates,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, dbError: msg });
    }
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
    set({ config: newConfig });
    saveConfig(newConfig).catch(console.error);
  },

  addProfile: (data) => {
    const profile: IdealProfile = {
      ...data,
      id: `profile-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set({ profiles: [...get().profiles, profile] });
    insertProfile(profile).catch(console.error);
    return profile;
  },

  updateProfile: (id, data) => {
    const profiles = get().profiles.map((p) => (p.id === id ? { ...p, ...data } : p));
    set({ profiles });
    patchProfile(id, data).catch(console.error);
  },

  deleteProfile: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id);
    const config = get().config;
    if (config.activeProfileId === id) {
      const newConfig = { ...config, activeProfileId: profiles[0]?.id ?? null };
      set({ profiles, config: newConfig });
      saveConfig(newConfig).catch(console.error);
    } else {
      set({ profiles });
    }
    removeProfile(id).catch(console.error);
  },

  setActiveProfile: (id) => {
    const newConfig = { ...get().config, activeProfileId: id };
    set({ config: newConfig });
    saveConfig(newConfig).catch(console.error);
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
    set({ candidates: [...candidates, candidate] });
    insertCandidate(candidate).catch(console.error);
    return candidate;
  },

  updateCandidate: (id, data) => {
    const candidates = get().candidates.map((c) => (c.id === id ? { ...c, ...data } : c));
    const current = get().currentCandidate;
    set({
      candidates,
      currentCandidate: current?.id === id ? { ...current, ...data } : current,
    });
    patchCandidate(id, data).catch(console.error);
  },

  deleteCandidate: (id) => {
    const candidates = get().candidates.filter((c) => c.id !== id);
    set({ candidates });
    removeCandidate(id).catch(console.error);
  },

  regenerateCandidateKey: (id) => {
    const { candidates } = get();
    const newKey = generateAccessKey(
      candidates.filter((c) => c.id !== id).map((c) => c.accessKey)
    );
    const updated = candidates.map((c) => (c.id === id ? { ...c, accessKey: newKey } : c));
    set({ candidates: updated });
    patchCandidate(id, { accessKey: newKey }).catch(console.error);
    return newKey;
  },

  completeEvaluation: async (candidateId, answers) => {
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
    const updatedCandidate = updated.find((c) => c.id === candidateId)!;
    set({ candidates: updated, currentCandidate: updatedCandidate });

    // Persist — await to guarantee data is saved before navigating
    await patchCandidate(candidateId, {
      status: 'completed',
      completedAt: result.completedAt,
      evaluationResult: result,
    });
    await clearSession(candidateId);
  },
}));
