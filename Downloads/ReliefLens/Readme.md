# 🛡 ReliefLens — AI Coding Assistant Master README
> **Read this entire file before writing a single line of code.**
> This is the single source of truth for the entire project.
> Last updated: May 2026 | Google Gemma 4 Hackathon Submission

---

## 🧠 WHO YOU ARE

You are a **Senior Full-Stack Engineer** building a hackathon submission.
Your code must be:
- **Clean** — no spaghetti, no hacks, no shortcuts
- **Typed** — TypeScript everywhere, zero `any` unless genuinely unavoidable
- **Modular** — one responsibility per file, no mega-components
- **Production-grade** — as if this will be used in an actual disaster zone
- **Commented** — explain *why*, not *what*

Before writing any code, ask: *"Would a Google engineer be proud of this?"*

You will pause at every `⛔ STOP CHECKPOINT` and ask the user to complete a setup step before continuing.

---

## 🌍 WHAT WE ARE BUILDING

**ReliefLens** is a Disaster Decision Acceleration System.

### The Problem
Disaster information arrives messy, late, and unstructured. Communities send photos of collapsed buildings, fragmented WhatsApp messages, and voice notes in multiple languages under extreme stress. Local responders have no system to rapidly convert this raw data into actionable, prioritised decisions.

- Manual triage today: **20–30 minutes per incident**
- With ReliefLens: **under 60 seconds**
- That difference = lives saved

### The Solution
ReliefLens sits between chaotic field input and command decision-making. It does the structured thinking so responders don't have to.

### Target Users
- Field responders (NGO volunteers, district officials)
- Disaster commanders (decision-makers with multiple simultaneous incidents)
- Communities in low-connectivity, multilingual environments

### Hackathon Context
- **Competition**: Google Gemma 4 Good Hackathon on Kaggle
- **Deadline**: May 18, 2026
- **Judging**: Impact & Vision (40pts) + Video & Story (30pts) + Technical Depth (30pts)
- **Key requirement**: Use Gemma 4 meaningfully — multimodal, function calling, edge deployment story

---

## 🏗 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    FIELD RESPONDER (Mobile PWA)             │
│                                                             │
│  📷 Photo → 🎙 Voice → 💬 Text (WhatsApp paste)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   OFFLINE LAYER         │
          │                         │
          │  Whisper WASM           │ ← voice → text, on-device
          │  Keyword Heuristics     │ ← provisional severity
          │  IndexedDB (Dexie.js)   │ ← encrypted local store
          │  Label: "Provisional"   │
          └────────────┬────────────┘
                       │ (on connectivity)
          ┌────────────▼────────────┐
          │   AI ENRICHMENT LAYER   │
          │                         │
          │  RAG Query              │ ← MongoDB Atlas Vector Search
          │  → retrieve similar     │   disaster protocols + incidents
          │    incidents/protocols  │
          │                         │
          │  Gemma 4 API            │ ← multimodal vision + NLP
          │  + function calling     │ ← structured JSON output
          │  + RAG context inject   │ ← grounded in disaster knowledge
          │                         │
          │  Label: "AI-Enriched"   │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   PRIORITISATION ENGINE │
          │                         │
          │  Priority Score =       │
          │  (Severity × 0.5) +     │
          │  (Confidence × 0.3) +   │
          │  (TimeDecay × 0.2)      │
          │                         │
          │  Conflict Detection     │ ← same resource, 2 critical cards
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │   COMMANDER DASHBOARD   │
          │                         │
          │  Leaflet Map            │ ← severity heatmap + clusters
          │  Priority Queue         │ ← ranked incident list
          │  Conflict Alerts        │ ← resource conflict flags
          │  One-tap Acknowledge    │ ← logs responder + timestamp
          │  PDF Export             │ ← printable field card (jsPDF)
          └─────────────────────────┘

EDGE STORY (for judges):
  Gemma 4 E2B runs the full pipeline locally via Ollama
  for truly connectivity-zero disaster zones.
  Same function calling schema, same output format.
  No cloud required.
```

---

## 📁 FILE STRUCTURE

Enforce this **exactly**. Do not create files outside this structure without asking.

```
relieflens/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── config/
│   │   ├── gemma.config.ts        # Gemma API config, model IDs, endpoints
│   │   ├── whisper.config.ts      # Whisper WASM model path + options
│   │   ├── mongodb.config.ts      # MongoDB Atlas connection config
│   │   └── constants.ts           # Priority weights, severity thresholds, etc.
│   │
│   ├── types/
│   │   ├── incident.types.ts      # IncidentCard, Severity, IncidentStatus
│   │   ├── ai.types.ts            # GemmaResponse, WhisperResult, FunctionCallResult
│   │   ├── rag.types.ts           # RAGDocument, EmbeddingResult, VectorSearchResult
│   │   └── commander.types.ts     # PriorityQueue, ResourceConflict, AuditEntry
│   │
│   ├── services/
│   │   ├── gemma/
│   │   │   ├── gemmaClient.ts     # Gemma 4 API wrapper
│   │   │   ├── gemmaPrompts.ts    # All system prompts + few-shot examples
│   │   │   └── functionSchemas.ts # JSON schemas for function calling
│   │   │
│   │   ├── whisper/
│   │   │   ├── whisperService.ts  # Whisper WASM loader + transcription
│   │   │   └── audioUtils.ts      # Mic capture, blob → base64
│   │   │
│   │   ├── rag/
│   │   │   ├── embeddingService.ts  # Text → embedding vectors
│   │   │   ├── vectorStore.ts       # MongoDB Atlas Vector Search queries
│   │   │   └── ragService.ts        # RAG orchestrator: query → context string
│   │   │
│   │   ├── storage/
│   │   │   ├── db.ts                # Dexie.js IndexedDB schema
│   │   │   ├── encryptionService.ts # AES-256 via Web Crypto API
│   │   │   └── syncService.ts       # Offline queue + sync on reconnect
│   │   │
│   │   ├── geo/
│   │   │   ├── exifService.ts       # EXIF lat/lng from image
│   │   │   └── nominatimService.ts  # OpenStreetMap reverse geocoding
│   │   │
│   │   └── prioritisation/
│   │       ├── priorityEngine.ts    # Priority score formula
│   │       └── conflictDetector.ts  # Resource conflict detection
│   │
│   ├── hooks/
│   │   ├── useIncident.ts
│   │   ├── useCamera.ts
│   │   ├── useVoice.ts
│   │   ├── useSync.ts
│   │   ├── useQueue.ts
│   │   └── useGeolocation.ts
│   │
│   ├── store/
│   │   ├── incidentStore.ts       # Zustand: incident CRUD
│   │   ├── commanderStore.ts      # Zustand: priority queue, conflicts
│   │   └── appStore.ts            # Zustand: online status, consent, sync
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── ConfidenceBar.tsx
│   │   │   ├── SeverityPill.tsx
│   │   │   └── OfflineBanner.tsx
│   │   │
│   │   ├── intake/
│   │   │   ├── IntakeFlow.tsx
│   │   │   ├── PhotoCapture.tsx
│   │   │   ├── VoiceCapture.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── ConsentModal.tsx
│   │   │
│   │   ├── incident/
│   │   │   ├── IncidentCard.tsx
│   │   │   ├── IncidentEditor.tsx
│   │   │   ├── FieldRow.tsx
│   │   │   └── ResourcePanel.tsx
│   │   │
│   │   ├── commander/
│   │   │   ├── CommanderDashboard.tsx
│   │   │   ├── PriorityQueue.tsx
│   │   │   ├── IncidentMap.tsx
│   │   │   ├── ConflictAlert.tsx
│   │   │   └── AcknowledgeBar.tsx
│   │   │
│   │   └── export/
│   │       └── PDFExport.tsx
│   │
│   ├── pages/
│   │   ├── IntakePage.tsx
│   │   ├── CommanderPage.tsx
│   │   ├── IncidentDetailPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── data/
│   │   ├── seedIncidents.ts       # 3 demo scenarios for hackathon demo
│   │   └── knowledgeBase/
│   │       ├── ics201Protocol.ts  # ICS 201 Incident Briefing field subset
│   │       ├── severityRules.ts   # Domain rules: what = Critical/High/Medium/Low
│   │       └── resourceMappings.ts # Incident type → suggested resources
│   │
│   └── utils/
│       ├── imageUtils.ts
│       ├── dateUtils.ts
│       ├── heuristics.ts
│       └── validators.ts
│
├── scripts/
│   └── ingestKnowledgeBase.ts     # One-time script: embed + upload to MongoDB Atlas
│
├── .env.example
├── .env.local                     # NEVER COMMIT
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | Strict mode on |
| Build | Vite + vite-plugin-pwa | Mobile-first PWA |
| Styling | Tailwind CSS v3 | Custom design tokens |
| State | Zustand | No Redux complexity |
| Routing | React Router v6 | |
| Offline DB | Dexie.js (IndexedDB) | Typed, encrypted |
| Maps | Leaflet + react-leaflet | Free, no API key |
| PDF | jsPDF | Client-side only |
| AI Vision/NLP | Gemma 4 via Google AI Studio API | Multimodal + function calling |
| Speech-to-Text | Whisper WASM (whisper.wasm) | On-device, offline |
| RAG Vector DB | MongoDB Atlas Vector Search | Same stack as Neuropath |
| Embeddings | `@xenova/transformers` (all-MiniLM-L6-v2) | Runs in browser/Node |
| Geo | exifr + OpenStreetMap Nominatim | Free |
| Encryption | Web Crypto API | Native AES-256 |
| Icons | Lucide React | |
| Animations | Framer Motion | |

---

## 🎨 DESIGN SYSTEM

**Aesthetic: "Crisis Command"**
Industrial precision meets emergency urgency. Every pixel earns its place.

### Colors (CSS variables in tailwind.config.js)
```js
colors: {
  background:  '#0A0E1A',   // deep slate — primary background
  surface:     '#111827',   // card backgrounds
  border:      '#1F2937',   // subtle dividers
  text:        '#F8FAFC',   // primary text
  muted:       '#6B7280',   // secondary text, labels
  accent:      '#F59E0B',   // amber — primary accent, CTAs
  critical:    '#EF4444',   // red — Critical severity
  high:        '#F97316',   // orange — High severity
  medium:      '#EAB308',   // yellow — Medium severity
  low:         '#22C55E',   // green — Low severity
  provisional: '#8B5CF6',   // purple — heuristic/offline label
  enriched:    '#06B6D4',   // cyan — AI-enriched label
}
```

### Typography
- Headings: `Syne` (Google Fonts) — bold, geometric authority
- Data/codes/scores: `JetBrains Mono` — technical precision
- Body: `Inter` — clean readability

### Severity Colors Rule
Every severity label, marker, and card border must use the correct severity color. No exceptions.

### Layout Rules
- **Intake view**: Full-screen mobile, one step at a time, large touch targets
- **Commander view**: 65/35 split — map left, queue right. Collapses to tabs on mobile
- **Cards**: Dark surface, colored left border = severity color, confidence bar inline

### Motion
- Card slide-in on new incident: `framer-motion` `y: 20 → 0, opacity: 0 → 1`
- Critical severity: subtle pulse animation on the severity pill
- Priority queue reorder: animated list with layout transitions
- Offline banner: slide down from top

---

## 🤖 GEMMA 4 INTEGRATION

### System Prompt (paste this in `gemmaPrompts.ts`)
```typescript
export const RELIEFLENS_SYSTEM_PROMPT = `
You are ReliefLens, a disaster incident analysis system used by emergency responders.
You are NOT a general-purpose AI assistant.
You ONLY analyze disaster and emergency incident information.
If asked anything unrelated to disaster response, reply: "ReliefLens only processes emergency incident data."

Your job is to analyze field input (images, voice transcriptions, text messages) and extract structured incident data.
You must ALWAYS call the extract_incident_data function with your analysis.
Never respond with plain text — always use the function call.

Severity definitions:
- CRITICAL: Immediate life threat, structural collapse with trapped victims, mass casualty, fire + entrapment, chemical/gas hazard
- HIGH: Serious injuries, large displacement (50+ people), significant infrastructure damage
- MEDIUM: Minor injuries, small displacement, moderate damage, manageable situation
- LOW: No injuries, minor damage, precautionary reports

Be conservative: when uncertain between two severities, choose the higher one.
Your confidence score (0.0–1.0) reflects how certain you are of your assessment given the input quality.
Low image quality, unclear audio, or ambiguous descriptions should lower your confidence.
`.trim()
```

### Function Calling Schema (`functionSchemas.ts`)
```typescript
export const EXTRACT_INCIDENT_SCHEMA = {
  name: "extract_incident_data",
  description: "Extract structured incident data from disaster field input",
  parameters: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        enum: ["critical", "high", "medium", "low"]
      },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      who: {
        type: "object",
        properties: {
          count: { type: "number" },
          condition: { type: "string" },
          confidence: { type: "number" }
        }
      },
      what: {
        type: "object",
        properties: {
          incident_type: { type: "string" },
          damage_scale: { type: "string", enum: ["none","minor","moderate","major","catastrophic"] },
          hazards: { type: "array", items: { type: "string" } },
          confidence: { type: "number" }
        }
      },
      where: {
        type: "object",
        properties: {
          description: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          confidence: { type: "number" }
        }
      },
      urgency_flags: { type: "array", items: { type: "string" } },
      suggested_resources: { type: "array", items: { type: "string" } },
      image_quality: { type: "string", enum: ["good","poor","unusable"] },
      failure_notes: { type: "string" }
    },
    required: ["severity", "confidence", "what"]
  }
}
```

### RAG Context Injection Pattern
```typescript
// In gemmaClient.ts — always inject RAG context before sending to Gemma
const ragContext = await ragService.getRelevantContext(userInput)

const prompt = `
${ragContext ? `RELEVANT PROTOCOLS AND PRECEDENTS:\n${ragContext}\n\n` : ''}
FIELD INPUT TO ANALYZE:
${userInput}
`
```

---

## 📊 RAG KNOWLEDGE BASE

### What Goes In
Stored in MongoDB Atlas as embedded vector documents:

| Document Type | Source | Purpose |
|---|---|---|
| ICS 201 protocol fields | ICS documentation | Incident card schema alignment |
| Severity rules | Curated domain rules | Ground model in correct severity logic |
| Resource mappings | NDMA India + GDACS | Suggest correct resources per incident type |
| Historical incidents | ReliefWeb, NDMA reports | Precedents for similar situations |
| Hazard classifications | WHO, UNDRR | Standard hazard taxonomy |

### Ingestion Script (`scripts/ingestKnowledgeBase.ts`)
Run once to embed and upload:
```bash
npx ts-node scripts/ingestKnowledgeBase.ts
```

### Vector Search Query
```typescript
// vectorStore.ts
export async function searchSimilarIncidents(query: string, limit = 3) {
  const embedding = await getEmbedding(query)
  return collection.aggregate([
    {
      $vectorSearch: {
        index: "relieflens_vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 50,
        limit
      }
    },
    { $project: { content: 1, source: 1, score: { $meta: "vectorSearchScore" } } }
  ])
}
```

---

## 📐 PRIORITY ENGINE

```typescript
// priorityEngine.ts

const SEVERITY_WEIGHTS = {
  critical: 1.0,
  high: 0.75,
  medium: 0.50,
  low: 0.25
}

const CONFIDENCE_MODIFIER = (score: number): number => {
  if (score >= 0.85) return 1.0
  if (score >= 0.65) return 0.85
  return 0  // flagged for human review — excluded from auto-queue
}

const TIME_DECAY = (minutesOld: number): number => {
  // Each 10 minutes without response adds 0.05 urgency
  return Math.min(minutesOld / 10 * 0.05, 0.3)
}

export function calculatePriorityScore(incident: IncidentCard): number {
  const s = SEVERITY_WEIGHTS[incident.severity]
  const c = CONFIDENCE_MODIFIER(incident.confidence)
  const t = TIME_DECAY(incident.minutesSinceIntake)
  return (s * 0.5) + (c * 0.3) + (t * 0.2)
}
```

---

## 🔐 ENVIRONMENT VARIABLES

**`.env.example`** — commit this file:
```env
# Google AI Studio (Gemma 4)
VITE_GOOGLE_AI_API_KEY=

# MongoDB Atlas (RAG Vector Search)
VITE_MONGODB_URI=
VITE_MONGODB_DB=relieflens
VITE_MONGODB_COLLECTION=knowledge_base

# App Config
VITE_APP_NAME=ReliefLens
VITE_AUTO_DELETE_DAYS=30
VITE_CONFIDENCE_REVIEW_THRESHOLD=0.65

# Gemma Model
VITE_GEMMA_MODEL=gemma-2.0-flash-exp
```

**`.env.local`** — NEVER commit. User fills this in.

---

## 📦 INSTALL COMMANDS

```bash
# 1. Create project
npm create vite@latest relieflens -- --template react-ts
cd relieflens

# 2. Core dependencies
npm install react-router-dom zustand framer-motion lucide-react

# 3. Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Maps
npm install leaflet react-leaflet
npm install -D @types/leaflet

# 5. Storage + encryption
npm install dexie

# 6. PDF
npm install jspdf
npm install -D @types/jspdf

# 7. Geo / EXIF
npm install exifr

# 8. RAG embeddings (runs in browser via WASM)
npm install @xenova/transformers

# 9. MongoDB (backend/script only)
npm install mongodb

# 10. PWA
npm install -D vite-plugin-pwa workbox-window

# 11. Fonts
npm install @fontsource/syne @fontsource/jetbrains-mono @fontsource/inter

# 12. Whisper WASM — see CP-3 below for special setup
```

---

## ⛔ STOP CHECKPOINTS

At each checkpoint, STOP coding and guide the user through setup before continuing.

---

### ⛔ CP-1 — After project scaffold (TASK-001)
**Say this to the user:**

> Before we continue, make sure you have Node.js 20+ installed.
> Check by running: `node --version`
> If it shows v20.x.x or higher, you're good. If not:
> - Go to https://nodejs.org
> - Download "LTS" version → install it
> - Restart your terminal
> - Run `node --version` again

---

### ⛔ CP-2 — After types are done (TASK-008)
**Say this to the user:**

> You need two API keys now. Let's get them:
>
> **1. Google AI Studio (Gemma 4):**
> - Go to https://aistudio.google.com
> - Sign in with Google
> - Click "Get API Key" → "Create API key in new project"
> - Copy the key
>
> **2. MongoDB Atlas (for RAG):**
> - Go to https://cloud.mongodb.com
> - Create free account → "Build a Database" → M0 Free tier
> - Create a cluster → click "Connect" → "Drivers"
> - Copy the connection string (looks like: mongodb+srv://...)
> - Go to "Database Access" → add a user with password
> - Go to "Network Access" → "Add IP Address" → "Allow access from anywhere"
>
> Now create a file called `.env.local` in your project root and paste:
> ```
> VITE_GOOGLE_AI_API_KEY=your_gemma_key_here
> VITE_MONGODB_URI=your_mongodb_uri_here
> ```
> Tell me when done.

---

### ⛔ CP-3 — Before Whisper WASM (TASK-014)
**Say this to the user:**

> Whisper WASM needs its model files downloaded separately.
> Run these commands:
> ```bash
> # Create the folder
> mkdir -p public/whisper
>
> # Download Whisper tiny model (multilingual, ~75MB)
> # Go to: https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin
> # Download that file and place it in: public/whisper/ggml-tiny.bin
> ```
> Also install the WASM package:
> ```bash
> npm install @nicolo-ribaudo/whisper-web
> ```
> Tell me when the model file is in `public/whisper/`. This enables offline voice transcription in 99 languages.

---

### ⛔ CP-4 — Before Commander Map (TASK-043)
**Say this to the user:**

> Leaflet needs its CSS imported or the map will look broken.
> Open `src/main.tsx` and add this line at the very top:
> ```typescript
> import 'leaflet/dist/leaflet.css'
> ```
> Also, Leaflet has a known icon bug in Vite. Add this to your `src/main.tsx`:
> ```typescript
> import L from 'leaflet'
> import iconUrl from 'leaflet/dist/images/marker-icon.png'
> import iconShadow from 'leaflet/dist/images/marker-shadow.png'
> L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl: iconShadow })
> ```
> Tell me when done.

---

### ⛔ CP-5 — Before RAG ingestion (TASK-RAG)
**Say this to the user:**

> We need to create a Vector Search Index in MongoDB Atlas.
> 1. Go to your MongoDB Atlas dashboard
> 2. Click your cluster → "Atlas Search" tab
> 3. Click "Create Search Index"
> 4. Choose "Atlas Vector Search" → JSON editor
> 5. Paste this config:
> ```json
> {
>   "fields": [{
>     "type": "vector",
>     "path": "embedding",
>     "numDimensions": 384,
>     "similarity": "cosine"
>   }]
> }
> ```
> 6. Index name: `relieflens_vector_index`
> 7. Collection: `knowledge_base`
> 8. Click Create → wait 2-3 minutes for it to build
> Then run: `npx ts-node scripts/ingestKnowledgeBase.ts`
> Tell me when the index shows "Active" status.

---

### ⛔ CP-6 — Before deployment (TASK-DEPLOY)
**Say this to the user:**

> Deployment plan:
> - **Frontend**: Vercel (free) — runs your React PWA
> - **Backend/API**: Not needed — all AI calls go from browser to Gemma API directly
> - **MongoDB Atlas**: Already in the cloud — free M0 tier
>
> To deploy frontend:
> 1. Push your code to GitHub
> 2. Go to https://vercel.com → "New Project" → import your repo
> 3. Add all your `.env.local` variables in Vercel's "Environment Variables" section
> 4. Click Deploy
>
> Your live URL will be something like: `https://relieflens.vercel.app`
> This is your hackathon demo link.

---

## 🎬 THREE DEMO SCENARIOS (Seed Data)

These must work on the first click for judges. Pre-seed them in `src/data/seedIncidents.ts`.

### Scenario 1 — Building Collapse (Multilingual Tamil)
- Input: Photo of collapsed structure + Tamil voice: *"Rendu per sirikkinaanga, kaal moodi iruku"*
- Whisper transcribes: *"Two people trapped, leg injury"*
- Gemma output: Critical, 0.91 confidence
- Priority Score: 0.87 → ranked #1
- Resources suggested: Heavy Rescue Team, Medical Unit

### Scenario 2 — Flood Mass Displacement
- Input: Text message: *"300 families stranded, water level rising, no food since yesterday"*
- Gemma output: High, 0.78 confidence
- Priority Score: 0.71 → ranked #2
- Resources: Evacuation Boats, Relief Camps, Food Supply

### Scenario 3 — Multi-Incident Commander View
- All 3 incidents arrive simultaneously
- Incidents 1 and 2 competing for same rescue team → Conflict Flag raised
- Commander sees ranked queue, conflict alert, one-tap acknowledge
- Total demo time: under 90 seconds

---

## 🚨 CODING RULES — NON-NEGOTIABLE

1. **No `any` types** — if you don't know the type, define it in `src/types/`
2. **No hardcoded API keys** — always `import.meta.env.VITE_*`
3. **No `console.log`** — create `src/utils/logger.ts` and use that
4. **No bare API calls** — every async operation has loading state + error boundary
5. **No automated dispatch** — all AI outputs are advisory, labelled "Suggested — verify"
6. **No confidence hiding** — every AI-generated field shows its confidence score
7. **No skipping checkpoints** — always pause and guide the user at ⛔ markers
8. **Mobile first** — all Tailwind starts mobile, then `md:` overrides
9. **One file, one responsibility** — if a file exceeds 200 lines, split it
10. **Commit-ready at every task** — each completed task should be clean enough to push

---

## 📋 TASK EXECUTION ORDER

Complete tasks in this exact order. Do not skip ahead.

### PHASE 0 — Bootstrap (Day 1 Morning)
- [ ] TASK-001: Scaffold Vite + React + TypeScript
- [ ] TASK-002: Install all dependencies
- [ ] TASK-003: Configure Tailwind with design tokens
- [ ] TASK-004: Configure path aliases (`@/` → `src/`)
- [ ] TASK-005: Create `.env.example`
- [ ] TASK-006: Create `constants.ts` (priority weights, thresholds, severity rules)
- [ ] TASK-007: Create `tailwind.config.js` with full design system
- [ ] TASK-008: Create all TypeScript type files

`⛔ CP-2: Get API keys, create .env.local`

### PHASE 1 — Services Layer (Day 1 Afternoon + Day 2)
- [ ] TASK-009: `db.ts` — Dexie.js schema (tables: incidents, syncQueue, auditLog)
- [ ] TASK-010: `encryptionService.ts` — AES-256
- [ ] TASK-011: `gemmaClient.ts` — Gemma 4 API wrapper
- [ ] TASK-012: `gemmaPrompts.ts` — system prompt + few-shot examples
- [ ] TASK-013: `functionSchemas.ts` — function calling schema
- [ ] TASK-014: `embeddingService.ts` — text → vectors using @xenova/transformers
- [ ] TASK-015: `vectorStore.ts` — MongoDB Atlas Vector Search queries
- [ ] TASK-016: `ragService.ts` — RAG orchestrator
- [ ] TASK-017: `heuristics.ts` — offline keyword severity rules
- [ ] TASK-018: `priorityEngine.ts` — priority score formula
- [ ] TASK-019: `conflictDetector.ts` — resource conflict detection
- [ ] TASK-020: `syncService.ts` — offline queue + enrich on reconnect

`⛔ CP-3: Whisper WASM setup`

- [ ] TASK-021: `whisperService.ts` — Whisper WASM loader + transcription
- [ ] TASK-022: `audioUtils.ts` — mic capture + audio blob handling
- [ ] TASK-023: `exifService.ts` — EXIF geo extraction
- [ ] TASK-024: `nominatimService.ts` — reverse geocoding

### PHASE 2 — State + Hooks (Day 2)
- [ ] TASK-025: Zustand stores (incidentStore, commanderStore, appStore)
- [ ] TASK-026: All custom hooks

### PHASE 3 — UI Components (Day 3)
- [ ] TASK-027: Design system base components (Button, Badge, Card, Modal, Spinner)
- [ ] TASK-028: `ConfidenceBar.tsx`
- [ ] TASK-029: `SeverityPill.tsx`
- [ ] TASK-030: `OfflineBanner.tsx`

### PHASE 4 — Intake Flow (Day 3)
- [ ] TASK-031: `PhotoCapture.tsx`
- [ ] TASK-032: `VoiceCapture.tsx`
- [ ] TASK-033: `TextInput.tsx`
- [ ] TASK-034: `ConsentModal.tsx`
- [ ] TASK-035: `IntakeFlow.tsx` — wire all 3 inputs together
- [ ] TASK-036: Offline capture path (IndexedDB + heuristic label)

### PHASE 5 — Incident Card (Day 4 Morning)
- [ ] TASK-037: `IncidentCard.tsx`
- [ ] TASK-038: `IncidentEditor.tsx`
- [ ] TASK-039: `FieldRow.tsx`
- [ ] TASK-040: `ResourcePanel.tsx`
- [ ] TASK-041: `PDFExport.tsx`

`⛔ CP-4: Leaflet CSS fix`

### PHASE 6 — Commander Dashboard (Day 4 Afternoon)
- [ ] TASK-042: `PriorityQueue.tsx`
- [ ] TASK-043: `IncidentMap.tsx`
- [ ] TASK-044: `ConflictAlert.tsx`
- [ ] TASK-045: `AcknowledgeBar.tsx`
- [ ] TASK-046: `CommanderDashboard.tsx` — assemble all

### PHASE 7 — Pages + Router (Day 4 Evening)
- [ ] TASK-047: All pages + React Router setup

`⛔ CP-5: MongoDB Vector Index + knowledge base ingestion`

### PHASE 8 — RAG Knowledge Base (Day 5)
- [ ] TASK-048: Write knowledge base documents (severityRules, resourceMappings, protocols)
- [ ] TASK-049: `ingestKnowledgeBase.ts` script
- [ ] TASK-050: Run ingestion, verify in Atlas dashboard
- [ ] TASK-051: Wire RAG into Gemma client (inject context before each API call)

### PHASE 9 — PWA + Polish (Day 6)
- [ ] TASK-052: PWA config + service worker
- [ ] TASK-053: Seed 3 demo scenarios
- [ ] TASK-054: Framer Motion animations
- [ ] TASK-055: Loading states + skeleton screens
- [ ] TASK-056: Error boundaries
- [ ] TASK-057: Mobile responsive QA

`⛔ CP-6: Deploy to Vercel`

### PHASE 10 — Submission (Day 7)
- [ ] TASK-058: Record 2-minute demo video
- [ ] TASK-059: Write Kaggle writeup
- [ ] TASK-060: Push code to public GitHub repo
- [ ] TASK-061: Submit on Kaggle before May 18

---

## 🏆 JUDGING CRITERIA MAPPING

| Criterion | Points | How ReliefLens Wins |
|---|---|---|
| Impact & Vision | 40 | "45 seconds vs 20 minutes = lives saved" — Tamil demo makes it real |
| Video & Story | 30 | 3-inject demo narrative, show the before/after |
| Technical Depth | 30 | Function calling + multimodal + RAG + offline-first + edge story |

---

## 📝 KAGGLE WRITEUP OUTLINE

Write this after the project is finally completed 

1. **The Problem** — 1 paragraph, the human cost of slow triage
2. **The Solution** — What ReliefLens does, in plain English
3. **How Gemma 4 is Used** — Multimodal vision, function calling, multilingual (be specific)
4. **Architecture** — Include the architecture diagram from this README
5. **RAG Pipeline** — How the knowledge base grounds the model
6. **Edge Deployment Story** — Gemma 4 E2B for offline disaster zones
7. **Human-in-the-Loop Safeguards** — Confidence scores, review flags, editable fields
8. **Demo Scenarios** — Describe all 3 scenarios
9. **Limitations & Next Steps** — Be honest, judges respect this
10. **Live Demo Link** — Your Vercel URL

---

*ReliefLens | Google Gemma 4 Good Hackathon | May 2026*
*"The missing layer between chaotic field input and decisive command action."*