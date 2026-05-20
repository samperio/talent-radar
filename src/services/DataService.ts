import type { Answer, AppConfig, Candidate, IdealProfile } from '../types';
import { DEFAULT_CONFIG } from '../config';
import { DEFAULT_IDEAL_PROFILE } from '../data/SEED_DATA';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ---- Config ----

export async function loadConfig(): Promise<AppConfig> {
  const data = await api<AppConfig | null>('/config');
  return data ?? DEFAULT_CONFIG;
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await api('/config', { method: 'PUT', body: JSON.stringify(config) });
}

// ---- Profiles ----

export async function loadProfiles(): Promise<IdealProfile[]> {
  const data = await api<IdealProfile[]>('/profiles');
  return data.length > 0 ? data : [DEFAULT_IDEAL_PROFILE];
}

export async function insertProfile(profile: IdealProfile): Promise<void> {
  await api('/profiles', { method: 'POST', body: JSON.stringify(profile) });
}

export async function patchProfile(id: string, data: Partial<IdealProfile>): Promise<void> {
  await api(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function removeProfile(id: string): Promise<void> {
  await api(`/profiles/${id}`, { method: 'DELETE' });
}

// ---- Candidates ----

export async function loadCandidates(): Promise<Candidate[]> {
  return api<Candidate[]>('/candidates');
}

export async function insertCandidate(candidate: Candidate): Promise<void> {
  await api('/candidates', { method: 'POST', body: JSON.stringify(candidate) });
}

export async function patchCandidate(id: string, data: Partial<Candidate>): Promise<void> {
  await api(`/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function removeCandidate(id: string): Promise<void> {
  await api(`/candidates/${id}`, { method: 'DELETE' });
}

// ---- Sessions ----

export async function loadSession(candidateId: string): Promise<Answer[]> {
  return api<Answer[]>(`/sessions/${candidateId}`);
}

export async function saveSession(candidateId: string, answers: Answer[]): Promise<void> {
  await api(`/sessions/${candidateId}`, { method: 'PUT', body: JSON.stringify({ answers }) });
}

export async function clearSession(candidateId: string): Promise<void> {
  await api(`/sessions/${candidateId}`, { method: 'DELETE' });
}
