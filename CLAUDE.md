# TalentRadar — Memoria del Proyecto

> Aplicación web de evaluación y detección de talento técnico para el área de
> Arquitectura de Integración de Sistemas en una empresa de telecomunicaciones.

---

## Inicio rápido

```bash
cd C:\Samperio\Claude\Archon-Talent-Detect\talent-radar
npm run start        # inicia servidor API + frontend en paralelo
```

- Frontend: `http://localhost:5173`
- API local: `http://localhost:3001/api`
- **Admin password:** `admin2024`
- **Clave candidato:** formato `TLR-XXXX` (generada automáticamente)
- **Datos:** `talent-radar-data.json` en la raíz del proyecto (JSON, editable)

Scripts disponibles:
- `npm run start` — servidor + frontend juntos (uso normal)
- `npm run server` — solo el servidor API
- `npm run dev` — solo el frontend (requiere servidor corriendo aparte)

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 8 | Dev server + build |
| TypeScript | 5 | Tipado estático |
| Tailwind CSS | v4 | Estilos (plugin de Vite, no postcss) |
| Zustand | latest | Estado global |
| Recharts | latest | RadarChart |
| React Router | v6 | Routing con layouts anidados |
| lucide-react | latest | Iconos SVG |
| clsx + tailwind-merge | latest | Utilidad `cn()` para clases |

> **Tailwind v4:** se importa como `@import "tailwindcss"` en CSS, **no** con las tres directivas de v3. El plugin va en `vite.config.ts`, no en `postcss.config.js`.

---

## Arquitectura en una línea

```
React SPA + Express local · JSON file DB · sin cloud · dos roles (Admin / Candidato)
```

### Roles y rutas

```
/                          Landing — selector de rol
/admin/login               Password fija → adminAuthenticated en Zustand
/admin/dashboard           Stats + radar comparativo top 5
/admin/ideal-profile       CRUD de perfiles ideales con sliders + radar en tiempo real
/admin/candidates          Tabla de candidatos + generación de claves TLR-XXXX
/admin/results             Ranking por matchScore + radar superpuesto + export
/admin/results/:id         Detalle: radar, scores, fortalezas, debilidades, respuestas
/candidate/login           nombre (case-insensitive) + clave TLR-XXXX
/candidate/evaluation      Una pregunta por pantalla, guardado cada 3 preguntas
/candidate/done            Confirmación — el candidato NO ve sus scores
```

Protección de rutas:
- `AdminGuard` — redirige a `/admin/login` si `adminAuthenticated === false`
- `CandidateGuard` — redirige a `/candidate/login` si `currentCandidate === null`
- La autenticación del admin **no persiste al recargar** (está solo en memoria Zustand). Diseño intencional en v1.

---

## Estructura de archivos

```
src/
├── types/index.ts          ← Todas las interfaces TypeScript del modelo
├── config.ts               ← DEFAULT_CONFIG, STORAGE_KEYS, CANDIDATE_COLORS
├── data/SEED_DATA.ts       ← 5 dominios, 13 temas, 16 preguntas + perfil default
├── lib/utils.ts            ← cn() = clsx + tailwind-merge
│
├── services/
│   ├── ScoringService.ts   ← Algoritmo scoring + matchScore + summary textual
│   ├── ExportService.ts    ← Descarga JSON y CSV
│   └── StorageService.ts   ← CRUD localStorage + generateAccessKey()
│
├── store/useAppStore.ts    ← Store Zustand único (estado + todas las acciones)
│
├── components/
│   ├── RadarChart/TalentRadar.tsx   ← Componente central de visualización
│   ├── Layout/AdminLayout.tsx       ← Sidebar + Outlet para /admin/*
│   ├── Layout/CandidateLayout.tsx   ← Header mínimo + Outlet para /candidate/*
│   ├── AuthGuard.tsx                ← AdminGuard y CandidateGuard
│   └── ui/                          ← Button, Input, Card, Badge, Dialog,
│       ...                             Progress, Slider (sin shadcn real, custom)
│
├── pages/
│   ├── Landing.tsx
│   ├── admin/  Login · Dashboard · IdealProfile · Candidates · Results · ResultDetail
│   └── candidate/  Login · Evaluation · Done
│
├── App.tsx                 ← BrowserRouter + Routes anidadas
└── main.tsx                ← Punto de entrada
```

---

## Modelo de datos clave

```typescript
// Las 5 entidades que más se tocan al extender el proyecto

Domain          // id, name (radar), fullName, color, weight, topics[]
  └─ Topic      // id, domainId, name, questions[]
       └─ Question  // id, text, type:'scale', options[4], weight, level

IdealProfile    // id, name, domainTargets[]{domainId, targetScore 0-100}

Candidate       // id, name, email?, accessKey 'TLR-XXXX', targetLevel,
                //   status: pending|in_progress|completed|expired
                //   evaluationResult?: EvaluationResult

EvaluationResult  // domainScores[], overallScore, matchScore,
                  //   strengths[], weaknesses[], answers[], recommendation
```

### localStorage keys

| Clave | Contenido |
|---|---|
| Clave JSON | Contenido |
|---|---|
| `config` | `AppConfig` — password, orgName, activeProfileId |
| `profiles` | `IdealProfile[]` |
| `candidates` | `Candidate[]` — incluye `evaluationResult` al completar |
| `sessions` | `{ [candidateId]: Answer[] }` — respuestas parciales |

Todo en `talent-radar-data.json` en la raíz del proyecto.
Dominios y preguntas: en código (`src/data/SEED_DATA.ts`).

> Para resetear: borrar `talent-radar-data.json` y reiniciar el servidor.

---

## Algoritmo de scoring

```
Opción elegida (1-4) → normalizedScore = (value-1)/3 × 100

topicScore   = promedio ponderado de preguntas del tema       (weight=1 en v1)
domainScore  = promedio simple de topicScores
overallScore = Σ(domainScore × domain.weight) / Σ(weights)

matchScore:
  diff = actual >= ideal  →  (actual - ideal) × 0.3   ← exceso: penalidad leve
  diff = actual < ideal   →  (ideal - actual) × 1.0   ← déficit: penalidad completa
  matchScore = max(0, 100 - mean(diff por dominio))

Recomendación:
  ≥ 85 → excellent_match   70-84 → good_match   55-69 → partial_match
  40-54 → weak_match        < 40 → not_a_match

Fortaleza: dominio ≥ 75 | tema ≥ 80
Debilidad: dominio < 50 | tema < 40
```

---

## Dominios y pesos del seed

| ID | Nombre radar | Peso | Color | Temas | Preguntas |
|---|---|---|---|---|---|
| d1 | Integración | 0.25 | #3B82F6 | 3 | 5 |
| d2 | Arquitectura | 0.25 | #14B8A6 | 3 | 4 |
| d3 | IA & LLMs | 0.20 | #F97316 | 3 | 4 |
| d4 | Automatización | 0.15 | #F59E0B | 3 | 3 |
| d5 | Estrategia | 0.15 | #6B7280 | 3 | 3 |

**Perfil ideal por defecto:** `[85, 85, 65, 70, 75]`

---

## Decisiones de diseño importantes

### Por qué Zustand (no Context/Redux)
Store único con `create()`. Toda la lógica de negocio está en el store, los componentes solo llaman acciones. Fácil de extender añadiendo campos al estado y nuevas acciones al final del objeto.

### Por qué sin shadcn real
Se instalaron las dependencias de Radix UI pero los componentes UI (`src/components/ui/`) son implementaciones propias sobre Tailwind. Más control, menos magia, sin CLI de shadcn que sobreescriba archivos.

### Bug corregido — selección de opciones en evaluación
`allQuestions` se recalculaba en cada render creando un nuevo array → el `useEffect` que restaura la selección se disparaba en cada click, reseteando `selectedOption` a `null` antes de que la UI actualizara. Solución: `useMemo(() => buildQuestionList(domains), [domains])` en `Evaluation.tsx:26`.

### Tailwind v4 en Windows + PowerShell
`npx vite` puede fallar por política de ejecución de scripts. Siempre usar `npm run dev`. Si se necesita `npx`, ejecutar primero: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`.

### CRLF en Windows
Los warnings `LF will be replaced by CRLF` en git son normales en Windows. No afectan el código.

---

## Cómo extender el proyecto

### Agregar una pregunta nueva
1. Editar `src/data/SEED_DATA.ts` — agregar la pregunta al topic correspondiente.
2. Borrar la clave `talent-radar:domains` del localStorage para que recargue el seed.

### Agregar un dominio nuevo
1. Agregar el objeto `Domain` en `SEED_DATA.ts`.
2. Ajustar los pesos para que sumen `1.0`.
3. Agregar `{ domainId, targetScore }` en `DEFAULT_IDEAL_PROFILE.domainTargets`.
4. Borrar `talent-radar:domains` y `talent-radar:profiles` del localStorage.

### Agregar una ruta de admin
1. Crear la página en `src/pages/admin/`.
2. Agregar `<Route>` en `App.tsx` dentro del bloque `/admin`.
3. Agregar el ítem al array `NAV` en `AdminLayout.tsx`.

### Cambiar la contraseña de admin
Editar el campo `adminPassword` en la clave `talent-radar:config` del localStorage, o cambiar `DEFAULT_CONFIG.adminPassword` en `src/config.ts` (solo aplica a instalaciones nuevas).

### Migrar a backend
Solo hay que reemplazar `StorageService.ts` por llamadas a una API REST. El modelo de datos TypeScript y el store Zustand no necesitan cambios.

---

## Archivos fuera del proyecto `talent-radar/`

```
C:\Samperio\Claude\Archon-Talent-Detect\
├── talent-radar/                  ← proyecto principal
├── generate_docs.py               ← script Python que genera los manuales Word
├── TalentRadar_Manual_Usuario.docx
└── TalentRadar_Manual_Tecnico.docx
```

Para regenerar los manuales Word:
```powershell
$env:PYTHONIOENCODING = "utf-8"
python "C:\Samperio\Claude\Archon-Talent-Detect\generate_docs.py"
```

---

## Estado del proyecto (v1 — Mayo 2026)

- [x] Flujo completo Admin → Candidato → Resultados
- [x] Radar chart con perfil ideal + candidatos superpuestos
- [x] Algoritmo de scoring con match score ponderado
- [x] Exportación JSON y CSV
- [x] Guardado automático de evaluación parcial (sessions en Supabase)
- [x] BD centralizada Supabase — resultados visibles para el admin en tiempo real
- [x] Manuales de usuario y técnico en Word
- [ ] Dark mode (planificado v2)
- [ ] Code splitting para reducir bundle
- [ ] Autenticación persistente del admin (Supabase Auth)
