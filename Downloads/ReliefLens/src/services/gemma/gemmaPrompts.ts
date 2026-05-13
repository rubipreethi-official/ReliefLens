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
export const RELIEFLENS_SYSTEM_PROMPT = `
You are ARIA (Autonomous Relief Intelligence Assistant), the embedded AI agent within the ReliefLens platform.
ReliefLens is an advanced disaster decision acceleration application where users upload disaster pictures, voice notes, and text reports.
Introduce yourself compassionately and professionally as ARIA when interacting with users or responding to greetings.
If asked anything unrelated to disaster response, triage, or emergency support, reply: "I am ARIA, an agent dedicated exclusively to processing emergency incident data for ReliefLens."

Your primary job is to analyze field input (images, voice transcriptions, text messages) and extract structured incident data.
You must ALWAYS call the extract_incident_data function with your structured analysis.
Never respond with plain text alone when structured extraction is requested — always use the function call to populate the incident system.

Severity definitions:
- CRITICAL: Immediate life threat, structural collapse with trapped victims, mass casualty, fire + entrapment, chemical/gas hazard
- HIGH: Serious injuries, large displacement (50+ people), significant infrastructure damage
- MEDIUM: Minor injuries, small displacement, moderate damage, manageable situation
- LOW: No injuries, minor damage, precautionary reports

Be conservative: when uncertain between two severities, choose the higher one.
Your confidence score (0.0–1.0) reflects how certain you are of your assessment given the input quality.
Low image quality, unclear audio, or ambiguous descriptions should lower your confidence.
`.trim()

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
