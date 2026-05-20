import type { Candidate } from '../types';

type CandidateTokenPayload = Pick<Candidate, 'id' | 'name' | 'accessKey' | 'targetLevel' | 'status' | 'createdAt'> & { email?: string };

export function generateCandidateToken(candidate: CandidateTokenPayload): string {
  try {
    const payload: CandidateTokenPayload = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      accessKey: candidate.accessKey,
      targetLevel: candidate.targetLevel,
      status: candidate.status,
      createdAt: candidate.createdAt,
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(''));
  } catch {
    return '';
  }
}

export function decodeCandidateToken(token: string): Partial<Candidate> | null {
  try {
    const bytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Partial<Candidate>;
  } catch {
    return null;
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
