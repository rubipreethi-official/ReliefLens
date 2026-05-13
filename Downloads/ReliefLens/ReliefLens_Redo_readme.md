# 🛡 ReliefLens — Full Application Rebuild Prompt


---

## CONTEXT

We have already completed the task list from RELIEFLENS_BUILD_TASKS.md and RELIEFLENS_README.md. The services layer, types, stores, hooks, and backend logic are all built. What we built so far for ARIA was just a test component — ignore it completely.

We are now building the **complete, production-grade UI** of ReliefLens from scratch. Every component must be rebuilt properly. Do not reuse the test files.

---

## WHAT YOU ARE BUILDING

A **single-page futuristic disaster response web application** called **ReliefLens** with:
- A stunning, dark futuristic UI (black/dark grey background, electric glowing text, robotic aesthetic)
- An ARIA AI agent that users can talk to and that talks back
- An incident reporting interface with image upload
- A commander dashboard
- All on one page with smooth navigation between sections

---

## 🎨 DESIGN SYSTEM — FOLLOW THIS EXACTLY

### Theme: "Tactical Futurism"
Think: Iron Man HUD meets military command center meets disaster relief.

### Colors
```css
--bg-primary: #050810        /* near black with blue tint */
--bg-surface: #0D1117        /* card backgrounds */
--bg-elevated: #161B22       /* elevated surfaces */
--border-glow: #1E3A5F       /* subtle blue borders */
--accent-blue: #00D4FF       /* electric cyan — primary glow */
--accent-amber: #F59E0B      /* amber — warnings, CTAs */
--critical: #FF2D55          /* red glow — critical severity */
--high: #FF6B00              /* orange — high severity */
--medium: #FFD60A            /* yellow — medium */
--low: #30D158               /* green — low */
--text-primary: #E8F4FD      /* near white */
--text-secondary: #8BA3C7    /* muted blue-white */
--text-glow: #00D4FF         /* glowing cyan text */
```

### Typography
- Headings: `Orbitron` (Google Font) — futuristic, geometric
- Body: `Exo 2` (Google Font) — clean, technical
- Data/codes: `JetBrains Mono` — monospace for numbers, scores
- All imports via @fontsource

### Key Visual Effects
```css
/* Glowing text effect — use on headings and labels */
text-shadow: 0 0 10px var(--accent-blue), 0 0 20px var(--accent-blue);

/* Glowing border effect — use on cards and panels */
box-shadow: 0 0 15px rgba(0, 212, 255, 0.15), inset 0 0 15px rgba(0, 212, 255, 0.05);
border: 1px solid rgba(0, 212, 255, 0.2);

/* Scan line animation — subtle, on backgrounds */
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 212, 255, 0.015) 2px,
  rgba(0, 212, 255, 0.015) 4px
);

/* Grid overlay — HUD feel */
background-image: 
  linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

### Animations Required
1. **Typing cursor blink** on ARIA's text output
2. **Pulse ring** on the ARIA avatar when speaking
3. **Scan line sweep** on image upload zone when analyzing
4. **Slide-in from bottom** for incident cards (staggered)
5. **Glow pulse** on Critical severity badges
6. **Corner bracket** animation on cards (the HUD targeting bracket style)
7. **Carousel auto-scroll** with smooth fade transition
8. **Waveform animation** when user is speaking to ARIA

---

## 📐 PAGE LAYOUT — SINGLE PAGE, SECTION-BASED

The entire app is ONE page (`App.tsx`). Navigation scrolls to sections or toggles visibility. No page reloads.

```
┌─────────────────────────────────────────────────┐
│  NAVBAR                                          │
│  [🛡 ReliefLens]  [Report] [ARIA] [Commander]   │
│                            [status: ONLINE/OFF]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  HERO SECTION                                    │
│                                                  │
│  RELIEFLENS                  ← Orbitron, glowing │
│  Disaster Decision System    ← subtitle          │
│  "45 seconds. Not 20 minutes."                   │
│                                                  │
│  [REPORT INCIDENT]  [COMMANDER ACCESS]           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  SUPPORT CAROUSEL (full width, auto-scroll)      │
│                                                  │
│  🆘 Quick Disaster Support  |  📞 NGO Helpline   │
│  🏛 Officials Support       |  🩺 Medical Aid    │
│  🚁 Rescue Operations       |  💧 Relief Camps   │
│  "No need to panic — help is on the way"         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  INCIDENT REPORT SECTION              id="report"│
│                                                  │
│  ┌──────────────────────┐  ┌───────────────────┐ │
│  │   IMAGE UPLOAD ZONE  │  │  TEXT INPUT       │ │
│  │                      │  │  (WhatsApp paste) │ │
│  │  [drag or tap here]  │  │                   │ │
│  │  scan animation when │  │  [🎙 Voice Note]  │ │
│  │  image is dropped    │  │                   │ │
│  └──────────────────────┘  └───────────────────┘ │
│                                                  │
│         [⚡ ANALYZE INCIDENT]                    │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │  [🤖 SPEAK WITH ARIA]  ← button             ││
│  │  Only appears here. When clicked → ARIA      ││
│  │  panel slides up from bottom                 ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  INCIDENT CARDS (slide in after analysis)        │
│  [Card 1] [Card 2] [Card 3]                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  ARIA PANEL (hidden by default)       id="aria"  │
│  Slides up as a full overlay or bottom sheet     │
│  when [SPEAK WITH ARIA] is clicked               │
│                                                  │
│  [ARIA avatar image — centered]                  │
│  Pulse rings when speaking                       │
│  Status: IDLE / LISTENING / ANALYZING / SPEAKING │
│                                                  │
│  ARIA: "Stay calm. I'm here. Tell me what        │
│          happened and I'll help you immediately." │
│  [text types out with cursor blink]              │
│                                                  │
│  [🎙 Hold to Speak]  [🔇 Mute]  [✕ Close]       │
│                                                  │
│  Conversation thread (last 4 exchanges)          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  COMMANDER SECTION            id="commander"     │
│  (password-protected toggle or just a section)  │
│                                                  │
│  [Leaflet Map — 65%] | [Priority Queue — 35%]   │
│                                                  │
│  Priority Queue cards with:                      │
│  - Priority score (JetBrains Mono)               │
│  - Severity glow badge                           │
│  - Time since intake                             │
│  - [✓ ACKNOWLEDGE] button                        │
│  - Conflict flag if resource clash               │
└─────────────────────────────────────────────────┘
```

---

## 🧩 COMPONENTS TO BUILD

Build each as a separate file. All in `src/components/`.

### 1. `Navbar.tsx`
- Fixed top, blur backdrop (`backdrop-blur-md`)
- Logo: shield icon + "ReliefLens" in Orbitron with cyan glow
- Nav links: Report | ARIA | Commander — smooth scroll to sections
- Right side: connectivity status badge (ONLINE/OFFLINE) with pulsing dot
- On mobile: hamburger menu

### 2. `HeroSection.tsx`
- Full viewport height
- "RELIEFLENS" in massive Orbitron — character by character reveal animation on load
- Subtitle: "Disaster Decision Acceleration System"
- Tagline: `"20 minutes → 45 seconds. That difference saves lives."`
- Two CTA buttons with glow hover effects
- Background: dark grid + subtle scan lines + floating particle dots (use CSS only, no canvas)
- Corner bracket decorations (pure CSS, HUD style)

### 3. `SupportCarousel.tsx`
- Full-width horizontal scrolling carousel
- Auto-scrolls every 3 seconds with smooth fade/slide
- Cards with icons for:
  - 🆘 "Quick Disaster Support — Immediate response protocols"
  - 📞 "NGO Helpline — Connect to verified NGOs in your area"  
  - 🏛 "Official Support — Government disaster management"
  - 🩺 "Medical Aid — Emergency medical coordination"
  - 🚁 "Rescue Operations — Search and rescue teams"
  - 💧 "Relief Camps — Food, shelter, and supplies"
  - ⚡ "No need to panic — Help is already on the way"
  - 🌐 "Multilingual Support — 99 languages supported"
- Each card: dark surface, cyan glow border, icon in amber, text in white
- Navigation dots at bottom
- Use Framer Motion for smooth transitions

### 4. `IncidentReportSection.tsx`
Parent component for the report section. Contains:

### 4a. `ImageUploadZone.tsx`
- Large drag-and-drop zone with dashed cyan border
- Center: camera icon with text "Drop disaster photo or tap to capture"
- On image drop: border turns solid cyan, scan line animation sweeps across image
- Shows image preview after upload
- Mobile: triggers camera capture

### 4b. `VoiceNoteCapture.tsx`
- Microphone button with pulse animation when recording
- Shows waveform bars (animated) while recording
- Transcript appears below in real-time (from Whisper)
- Language auto-detected and shown as badge

### 4c. `TextInputPanel.tsx`
- Multi-line text area styled like a terminal
- Placeholder: "Paste WhatsApp message or describe the incident..."
- Monospace font, cyan cursor

### 4d. `AnalyzeButton.tsx`
- Full-width, amber glow CTA
- Text: "⚡ ANALYZE INCIDENT"
- On click: shows loading state with scanning animation
- Disabled until at least one input provided

### 4e. `SpeakWithAriaButton.tsx`
- Separate button below the upload zone
- "🤖 SPEAK WITH ARIA" — cyan outline button
- On click: opens ARIAPanel
- Subtle pulse on the button at all times (inviting)

### 5. `ARIAPanel.tsx` ← THE STAR COMPONENT
This is the full ARIA experience. It slides up as an overlay.

**Structure:**
```
┌─────────────────────────────────────────────┐
│  ✕ (close)              ARIA AGENT  🔴LIVE  │
│                                             │
│         [ARIA avatar image]                 │
│         Pulse rings (3 rings, animated)     │
│         when speaking                       │
│                                             │
│  Status badge: IDLE / LISTENING /           │
│                ANALYZING / SPEAKING         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ARIA: "Stay calm. Don't panic.      │    │
│  │ I'm here with you. Tell me what     │    │
│  │ happened and I'll help immediately."│    │
│  │                          [cursor▌]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [User]: previous message shown             │
│  [ARIA]: previous response shown            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🎙 [Hold to Speak]   🔇 [Mute]    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**ARIA Behavior Flow:**
1. Panel opens → ARIA immediately says (TTS): *"Stay calm. Don't panic. I'm here with you. Tell me what happened and I'll help you immediately."*
2. Text types out with cursor blink effect as ARIA speaks
3. User holds mic button → ARIA status changes to LISTENING, waveform shows
4. User releases → Whisper transcribes
5. Transcription sent to Gemma 4 with ReliefLens system prompt
6. Gemma responds → ARIA speaks response via TTS
7. If incident data extracted → automatically populates incident card in background

**TTS Implementation (IMPORTANT — fix Tamil):**
```typescript
// Use this priority order:
// 1. ElevenLabs API (best quality, free tier 10k chars/month)
// 2. Google Cloud TTS (ta-IN voice for Tamil)  
// 3. Web Speech API fallback (English only)

// For ElevenLabs:
const speakWithElevenLabs = async (text: string) => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2', // supports Tamil
      voice_settings: { stability: 0.75, similarity_boost: 0.85 }
    })
  })
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)
  audio.play()
}

// Fallback to Web Speech API:
const speakFallback = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = detectedLanguage === 'tamil' ? 'ta-IN' : 'en-US'
  utterance.rate = 0.9
  speechSynthesis.speak(utterance)
}
```

**Add to `.env.example`:**
```
VITE_ELEVENLABS_API_KEY=
```

**ARIA's Opening Lines (hardcoded, always plays first):**
```typescript
export const ARIA_GREETING = 
  "Stay calm. Don't panic. I'm here with you. " +
  "My name is ARIA — I'm ReliefLens's emergency response agent. " +
  "Tell me what happened and I'll help coordinate immediate support."

export const ARIA_SYSTEM_PROMPT = `
You are ARIA, the voice assistant for ReliefLens disaster response system.
You speak directly to disaster victims or field responders who may be scared or under stress.
Your tone is: calm, authoritative, reassuring, clear.
Keep responses SHORT — maximum 3 sentences.
Always acknowledge their situation first, then give one clear action.
If they describe a disaster, extract key details and confirm back to them.
Never say you cannot help. Always provide next steps.
If they speak Tamil, respond in Tamil.
Examples:
- User: "building collapsed 2 people trapped" → ARIA: "I've received your report. Two people trapped — rescue team has been alerted. Stay on the line and move to a safe distance from the structure."
- User: "flood water rising fast 300 families" → ARIA: "Evacuation alert sent for your area. Move to the nearest high ground immediately. Relief teams are being coordinated now."
`
```

### 6. `IncidentCard.tsx`
Already defined in README. Rebuild with the futuristic theme:
- Dark surface card with colored left border (severity color)
- Glowing severity badge with pulse on Critical
- Corner bracket decorations (HUD targeting style)
- Confidence bar with cyan fill
- All fields with individual confidence dots
- "AI-ENRICHED" or "PROVISIONAL" status badge top-right
- Slide in from bottom with staggered delay

### 7. `CommanderSection.tsx`
- Section heading: "COMMANDER CONTROL" in Orbitron
- Access indicator (just visual — no real auth needed for demo)
- 65/35 split: Leaflet map left, priority queue right
- Map: dark tile layer (`CartoDB.DarkMatter` — free, no API key)
  ```typescript
  // Use this tile URL for dark map:
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  ```
- Severity-colored markers with glow
- Priority queue cards with score, severity, time, acknowledge button
- Conflict alert banner when resource clash detected

### 8. `StatusBadge.tsx`
Reusable — shows ONLINE/OFFLINE/SYNCING with colored dot

### 9. `IncidentCardList.tsx`
Wrapper that renders cards with staggered Framer Motion animation

---

## 🗺 ROUTING / NAVIGATION

No React Router needed. Single page. Use this pattern:

```typescript
// In App.tsx
const [activeSection, setActiveSection] = useState<'report' | 'aria' | 'commander'>('report')
const [ariaOpen, setAriaOpen] = useState(false)

// Navbar links scroll to section IDs:
// Report → scrollTo('#report')
// ARIA → setAriaOpen(true)
// Commander → scrollTo('#commander')
```

---

## 📦 ADDITIONAL DEPENDENCIES TO INSTALL

```bash
# Fonts
npm install @fontsource/orbitron @fontsource/exo-2

# Already installed but confirm:
npm install framer-motion lucide-react
```

---

## 🔧 SPECIFIC IMPLEMENTATION NOTES

### CartoDB Dark Map (no API key needed)
```typescript
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  attribution='© OpenStreetMap contributors © CARTO'
/>
```

### ARIA Avatar
Use the ARIA image already in the project (`public/aria-avatar.png` or wherever it is).
If not present, use a placeholder with initials "AR" in a glowing circle.
Do NOT use video files. Use the static image + CSS animations for the talking effect:

```css
/* Pulse rings when speaking */
.aria-speaking .pulse-ring {
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}
```

### Typewriter Effect for ARIA text
```typescript
// Custom hook
const useTypewriter = (text: string, speed = 30) => {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i++))
      if (i > text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text])
  return displayed
}
```

### Corner Bracket Decoration (HUD style)
```css
.hud-card {
  position: relative;
}
.hud-card::before,
.hud-card::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--accent-blue);
  border-style: solid;
  opacity: 0.6;
}
.hud-card::before {
  top: 4px; left: 4px;
  border-width: 2px 0 0 2px;
}
.hud-card::after {
  bottom: 4px; right: 4px;
  border-width: 0 2px 2px 0;
}
```

---

## ✅ WHAT TO BUILD IN THIS SESSION

Build in this exact order:

1. **Install Orbitron and Exo 2 fonts**
2. **Update `tailwind.config.js`** with the full color system above
3. **Create `src/styles/globals.css`** with all CSS variables, scan line effect, grid overlay, glow utilities
4. **`Navbar.tsx`** — fixed, blur, logo, nav links, connectivity badge
5. **`HeroSection.tsx`** — full viewport, character reveal, CTA buttons, grid background
6. **`SupportCarousel.tsx`** — auto-scroll, 8 cards, Framer Motion
7. **`ImageUploadZone.tsx`** — drag/drop, scan animation, preview
8. **`VoiceNoteCapture.tsx`** — mic button, waveform, transcript
9. **`TextInputPanel.tsx`** — terminal style textarea
10. **`AnalyzeButton.tsx`** — amber glow, loading state
11. **`SpeakWithAriaButton.tsx`** — cyan pulse button
12. **`ARIAPanel.tsx`** — full panel with avatar, TTS (ElevenLabs + fallback), Whisper STT, typewriter, conversation thread
13. **`IncidentCard.tsx`** — futuristic reskin with HUD brackets, glow badges
14. **`IncidentCardList.tsx`** — staggered animation wrapper
15. **`CommanderSection.tsx`** — dark map, priority queue, conflict alerts
16. **`App.tsx`** — assemble everything in correct section order

---

## 🚫 DO NOT DO

- Do not use white or light backgrounds anywhere
- Do not use the old Avatar TTS test component
- Do not use plain Web Speech API as the primary TTS — use ElevenLabs first
- Do not use React Router — this is a single-page section-based layout
- Do not make ARIA open automatically — only when the button is clicked
- Do not use video files for the avatar — use static image + CSS animations
- Do not skip the typewriter effect — it is essential to the ARIA experience
- Do not use generic card styles — every card must have the HUD corner brackets

---

*ReliefLens | Full UI Rebuild | Futuristic Crisis Command Aesthetic*
*"The missing layer between chaotic field input and decisive command action."*