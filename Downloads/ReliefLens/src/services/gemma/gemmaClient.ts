/**
 * gemmaClient.ts
 *
 * Gemma 4 API wrapper for ReliefLens.
 * Handles multimodal requests (image + text), function calling,
 * and RAG context injection.
 *
 * All API calls fail gracefully — network errors are caught and returned
 * as typed error results, never thrown to the UI layer.
 */

import { GEMMA_CONFIG } from '@/config/gemma.config'
import type {
  GemmaRequest,
  GemmaRawResponse,
  GemmaEnrichmentResult,
  ExtractedIncidentData,
  FunctionCallResult,
} from '@/types/ai.types'
import type { DraftIncident } from '@/types/incident.types'
import { RELIEFLENS_SYSTEM_PROMPT, buildAnalysisPrompt } from './gemmaPrompts'
import { EXTRACT_INCIDENT_SCHEMA } from './functionSchemas'
import { extractBase64Data, getMimeTypeFromDataUri } from '@/utils/imageUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('gemmaClient')

// ─── API Endpoint ─────────────────────────────────────────────────────────────

function buildEndpointUrl(): string {
  const { endpoint, model, apiKey } = GEMMA_CONFIG
  return `${endpoint}/models/${model}:generateContent?key=${apiKey}`
}

// ─── Request Builder ──────────────────────────────────────────────────────────

/**
 * Build a Gemma API request from draft incident data + optional RAG context.
 * Composes a multimodal user message: image (if any) + text prompt.
 */
function buildRequest(draft: DraftIncident, ragContext?: string): GemmaRequest {
  const textContent = [draft.voiceTranscript, draft.textInput].filter(Boolean).join('\n')
  const prompt = buildAnalysisPrompt(textContent || 'No text input provided', ragContext)

  const userParts: GemmaRequest['contents'][0]['parts'] = []

  // Attach image if available
  if (draft.photoBase64) {
    userParts.push({
      inline_data: {
        mime_type: getMimeTypeFromDataUri(draft.photoBase64),
        data: extractBase64Data(draft.photoBase64),
      },
    })
  }

  // Always include text prompt
  userParts.push({ text: prompt })

  return {
    contents: [{ role: 'user', parts: userParts }],
    tools: [EXTRACT_INCIDENT_SCHEMA],
    systemInstruction: {
      parts: [{ text: RELIEFLENS_SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: GEMMA_CONFIG.temperature,
      topP: GEMMA_CONFIG.topP,
      maxOutputTokens: GEMMA_CONFIG.maxOutputTokens,
    },
  }
}

// ─── Response Parser ──────────────────────────────────────────────────────────

/**
 * Parse the raw Gemma API response and extract the function call arguments.
 * Returns a typed FunctionCallResult — never throws.
 */
function parseResponse(raw: GemmaRawResponse): FunctionCallResult<ExtractedIncidentData> {
  const candidate = raw.candidates?.[0]
  if (!candidate) {
    return { success: false, error: 'No candidates in Gemma response' }
  }

  if (candidate.finishReason === 'SAFETY') {
    return { success: false, error: 'Response blocked by safety filters' }
  }

  // Look for a function call part in the response
  const functionCallPart = candidate.content.parts.find(p => p.functionCall)
  if (!functionCallPart?.functionCall) {
    const textPart = candidate.content.parts.find(p => p.text)
    logger.warn('Gemma responded with text instead of function call:', textPart?.text)
    return { success: false, error: 'Gemma did not return a function call — check system prompt' }
  }

  const { name, args } = functionCallPart.functionCall
  if (name !== 'extract_incident_data') {
    return { success: false, error: `Unexpected function call: ${name}` }
  }

  // Validate required fields
  if (!args.severity || args.confidence === undefined || !args.what) {
    return {
      success: false,
      rawArgs: args,
      error: 'Function call missing required fields: severity, confidence, or what',
    }
  }

  return {
    success: true,
    data: args as unknown as ExtractedIncidentData,
    rawArgs: args,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a draft incident to Gemma for AI enrichment.
 * Returns extracted structured data with timing and token usage.
 *
 * @throws Never — all errors are returned in the result object
 */
export async function enrichIncident(
  draft: DraftIncident,
  ragContext?: string
): Promise<{ success: true; result: GemmaEnrichmentResult } | { success: false; error: string }> {
  if (!GEMMA_CONFIG.apiKey) {
    return { success: false, error: 'Google AI API key not configured. Check VITE_GOOGLE_AI_API_KEY in .env.local' }
  }

  const startTime = Date.now()
  const request = buildRequest(draft, ragContext)

  logger.info('Sending incident to Gemma for enrichment...')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMMA_CONFIG.timeoutMs)

    const response = await fetch(buildEndpointUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Gemma API error:', response.status, errorText)
      return { success: false, error: `Gemma API returned ${response.status}: ${errorText.slice(0, 200)}` }
    }

    const raw: GemmaRawResponse = await response.json()
    const parsed = parseResponse(raw)

    if (!parsed.success || !parsed.data) {
      return { success: false, error: parsed.error ?? 'Failed to parse Gemma response' }
    }

    const latencyMs = Date.now() - startTime
    logger.info(`Gemma enrichment complete in ${latencyMs}ms`)

    return {
      success: true,
      result: {
        extracted: parsed.data,
        tokenUsage: raw.usageMetadata
          ? {
              prompt: raw.usageMetadata.promptTokenCount,
              completion: raw.usageMetadata.candidatesTokenCount,
              total: raw.usageMetadata.totalTokenCount,
            }
          : undefined,
        latencyMs,
      },
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: `Gemma request timed out after ${GEMMA_CONFIG.timeoutMs}ms` }
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Gemma client error:', message)
    return { success: false, error: `Network error: ${message}` }
  }
}
