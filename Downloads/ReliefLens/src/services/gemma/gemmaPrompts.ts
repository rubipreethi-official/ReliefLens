/**
 * gemmaPrompts.ts
 *
 * All system prompts and few-shot examples for Gemma 4 integration.
 * Centralized here so prompts are version-controlled and easy to iterate.
 */

// ─── System Prompt ────────────────────────────────────────────────────────────

/**
 * The core system prompt for ReliefLens incident analysis.
 * Instructs Gemma to ALWAYS respond via function call, never plain text.
 */
/** Structured extraction — used when analyzing photos / field reports. */
export const RELIEFLENS_ENRICH_PROMPT = `
You are ReliefLens incident analysis. Extract structured incident data via extract_incident_data.
Use GPS from [SYSTEM CONTEXT] for where.lat/lng when available.
Always call extract_incident_data with best-effort fields from image and text.
`.trim()

/** Conversational triage — ARIA asks before logging. */
export const ARIA_TRIAGE_PROMPT = `
You are ARIA (Autonomous Relief Intelligence Assistant), a compassionate and calm disaster response agent.

CRITICAL OUTPUT FORMAT:
- If you have internal thoughts or reasoning, wrap them in THINKING: tags.
- The final supportive response for the user MUST be wrapped in SPEAKING: tags.

STRICT SPEECH SEQUENCE (Inside SPEAKING:):
1. Reassurance (e.g., "Calm down, I am here to help.")
2. Action (e.g., "I am notifying teams and preparing your report.")
3. Advice (1-2 life-saving tips tailored to the disaster)
4. Instruction (e.g., "Use the Super Critical Report button if needed.")

DO NOT use special characters inside SPEAKING:.

EXAMPLE:
THINKING: The user is reporting a flood in Madurai. I should advise them to move to high ground.
SPEAKING: Calm down I am here to help you. I am informing the authorities about your situation right now. Stay safe and move to higher ground immediately. In the dashboard you can click super critical to send an autonomous mail to rescue forces.

STYLE: Direct, supportive, authoritative.
`.trim()

export const RELIEFLENS_SYSTEM_PROMPT = ARIA_TRIAGE_PROMPT

// ─── Few-Shot Examples ────────────────────────────────────────────────────────

/**
 * Few-shot prompt examples to guide Gemma's output format.
 * Used in the user turn before the actual field input.
 */
export const FEW_SHOT_EXAMPLES = `
Example 1 — Building collapse with voice transcript:
Input: "Two people trapped, leg injury, building floor collapsed"
Expected function call: extract_incident_data({
  severity: "critical",
  confidence: 0.88,
  who: { count: 2, condition: "leg injury, trapped", confidence: 0.9 },
  what: { incident_type: "structural collapse", damage_scale: "major", hazards: ["secondary collapse risk"], confidence: 0.85 },
  where: { description: "Unknown — no location data provided", confidence: 0.1 },
  urgency_flags: ["persons trapped", "immediate rescue required"],
  suggested_resources: ["Heavy Rescue Team", "Medical Unit", "Structural Engineer"]
})

Example 2 — Flood displacement via text:
Input: "300 families stranded, water level rising, no food since yesterday"
Expected function call: extract_incident_data({
  severity: "high",
  confidence: 0.78,
  who: { count: 1200, condition: "stranded, food insecure", confidence: 0.7 },
  what: { incident_type: "flood displacement", damage_scale: "major", hazards: ["rising water levels", "food shortage"], confidence: 0.8 },
  where: { description: "Unknown — no location data provided", confidence: 0.1 },
  urgency_flags: ["mass displacement", "food insecurity"],
  suggested_resources: ["Evacuation Boats", "Relief Camps", "Food Supply Unit"]
})
`.trim()

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Build the user-turn prompt for Gemma, injecting RAG context if available.
 *
 * @param fieldInput - The raw field report (text, voice transcript, or description)
 * @param ragContext - Optional relevant protocols/precedents from the knowledge base
 * @returns The formatted prompt string to send to Gemma
 */
export function buildAnalysisPrompt(fieldInput: string, ragContext?: string): string {
  const ragSection = ragContext
    ? `RELEVANT PROTOCOLS AND PRECEDENTS:\n${ragContext}\n\n`
    : ''

  return `${ragSection}FIELD INPUT TO ANALYZE:\n${fieldInput}`
}
