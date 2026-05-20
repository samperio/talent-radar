import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../talent-radar-data.json');
const PORT = process.env.PORT || 3001;

// ── JSON file DB ──────────────────────────────────────────────────────────────

function read() {
  if (!existsSync(DATA_FILE)) return { config: null, profiles: [], candidates: [], sessions: {} };
  try { return JSON.parse(readFileSync(DATA_FILE, 'utf-8')); }
  catch { return { config: null, profiles: [], candidates: [], sessions: {} }; }
}

function write(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Server ────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// Config
app.get('/api/config', (_, res) => {
  res.json(read().config);
});
app.put('/api/config', (req, res) => {
  const d = read(); d.config = req.body; write(d);
  res.json({ ok: true });
});

// Profiles
app.get('/api/profiles', (_, res) => {
  res.json(read().profiles);
});
app.post('/api/profiles', (req, res) => {
  const d = read(); d.profiles.push(req.body); write(d);
  res.json({ ok: true });
});
app.put('/api/profiles/:id', (req, res) => {
  const d = read();
  d.profiles = d.profiles.map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  write(d);
  res.json({ ok: true });
});
app.delete('/api/profiles/:id', (req, res) => {
  const d = read();
  d.profiles = d.profiles.filter(p => p.id !== req.params.id);
  write(d);
  res.json({ ok: true });
});

// Candidates
app.get('/api/candidates', (_, res) => {
  res.json(read().candidates);
});
app.post('/api/candidates', (req, res) => {
  const d = read(); d.candidates.push(req.body); write(d);
  res.json({ ok: true });
});
app.patch('/api/candidates/:id', (req, res) => {
  const d = read();
  d.candidates = d.candidates.map(c => c.id === req.params.id ? { ...c, ...req.body } : c);
  write(d);
  res.json({ ok: true });
});
app.delete('/api/candidates/:id', (req, res) => {
  const d = read();
  d.candidates = d.candidates.filter(c => c.id !== req.params.id);
  delete d.sessions[req.params.id];
  write(d);
  res.json({ ok: true });
});

// Sessions
app.get('/api/sessions/:candidateId', (req, res) => {
  res.json(read().sessions[req.params.candidateId] ?? []);
});
app.put('/api/sessions/:candidateId', (req, res) => {
  const d = read();
  d.sessions[req.params.candidateId] = req.body.answers;
  write(d);
  res.json({ ok: true });
});
app.delete('/api/sessions/:candidateId', (req, res) => {
  const d = read();
  delete d.sessions[req.params.candidateId];
  write(d);
  res.json({ ok: true });
});

// Serve frontend build in production
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
if (process.env.NODE_ENV === 'production') {
  const { default: serveStatic } = await import('serve-static');
  const distPath = join(__dirname, '../dist');
  app.use(serveStatic(distPath));
  app.get('*', (_, res) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n  TalentRadar API → http://localhost:${PORT}/api`);
  console.log(`  Datos guardados en: ${DATA_FILE}\n`);
});
