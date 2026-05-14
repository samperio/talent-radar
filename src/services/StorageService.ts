import type { Answer, AppConfig, Candidate, Domain, IdealProfile } from '../types';
import { STORAGE_KEYS, DEFAULT_CONFIG } from '../config';
import { SEED_DOMAINS, DEFAULT_IDEAL_PROFILE } from '../data/SEED_DATA';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
    alert('Error al guardar datos. Verifica el almacenamiento del navegador.');
  }
}

export function loadConfig(): AppConfig {
  return safeGet(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
}

export function saveConfig(config: AppConfig): void {
  safeSet(STORAGE_KEYS.CONFIG, config);
}

export function loadDomains(): Domain[] {
  return safeGet(STORAGE_KEYS.DOMAINS, SEED_DOMAINS);
}

export function saveDomains(domains: Domain[]): void {
  safeSet(STORAGE_KEYS.DOMAINS, domains);
}

export function loadProfiles(): IdealProfile[] {
  return safeGet(STORAGE_KEYS.PROFILES, [DEFAULT_IDEAL_PROFILE]);
}

export function saveProfiles(profiles: IdealProfile[]): void {
  safeSet(STORAGE_KEYS.PROFILES, profiles);
}

export function loadCandidates(): Candidate[] {
  return safeGet(STORAGE_KEYS.CANDIDATES, []);
}

export function saveCandidates(candidates: Candidate[]): void {
  safeSet(STORAGE_KEYS.CANDIDATES, candidates);
}

export function loadSession(candidateId: string): Answer[] {
  return safeGet(STORAGE_KEYS.SESSION(candidateId), []);
}

export function saveSession(candidateId: string, answers: Answer[]): void {
  safeSet(STORAGE_KEYS.SESSION(candidateId), answers);
}

export function clearSession(candidateId: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION(candidateId));
  } catch {
    // ignore
  }
}

export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    safeSet(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOMAINS)) {
    safeSet(STORAGE_KEYS.DOMAINS, SEED_DOMAINS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    safeSet(STORAGE_KEYS.PROFILES, [DEFAULT_IDEAL_PROFILE]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    safeSet(STORAGE_KEYS.CANDIDATES, []);
  }
}

export function generateAccessKey(existingKeys: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key: string;
  do {
    const suffix = Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    key = `TLR-${suffix}`;
  } while (existingKeys.includes(key));
  return key;
}
