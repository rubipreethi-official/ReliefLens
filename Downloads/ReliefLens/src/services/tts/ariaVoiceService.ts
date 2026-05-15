/**
 * ariaVoiceService.ts — single-voice playback (Gemini TTS OR Web Speech, never both).
 */

const TTS_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro']

const VOICE_ALIASES: Record<string, string> = {
  Charis: 'Aoede',
  Charon: 'Charon',
}

let speechGeneration = 0
let activeAudioContext: AudioContext | null = null
let activeSource: AudioBufferSourceNode | null = null
let activeUtterance: SpeechSynthesisUtterance | null = null

export const cancelAriaSpeech = (): void => {
  speechGeneration += 1

  if (activeSource) {
    try {
      activeSource.stop()
    } catch {
      /* already stopped */
    }
    activeSource = null
  }
  if (activeAudioContext) {
    activeAudioContext.close().catch(() => {})
    activeAudioContext = null
  }
  if (activeUtterance) {
    activeUtterance.onend = null
    activeUtterance.onerror = null
    activeUtterance = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export const speakAsARIA = async (
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  const gen = speechGeneration + 1
  speechGeneration = gen
  cancelAriaSpeech()
  speechGeneration = gen

  // Clean the text to ensure no technical headers or punctuations are read out literally
  let sanitized = text.trim()
    // Remove reasoning artifacts
    .replace(/^(The user|According to|Plan:|Thinking:|Step \d:|TRIAGE FLOW:)[\s\S]*?(\.|\?|!)\s*/i, '')
    // Remove common symbols that might cause issues
    .replace(/[*_#\[\]()<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) {
    onEnd?.()
    return
  }

  const geminiPlayed = await tryGeminiTTS(sanitized, onStart, onEnd, gen)
  if (gen !== speechGeneration) return
  
  if (!geminiPlayed) {
    console.warn('[ARIA] Gemini TTS failed, and Web Speech is disabled for quality reasons.')
    onEnd?.()
  }
}

const tryGeminiTTS = async (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  gen?: number,
  modelIndex = 0
): Promise<boolean> => {
  if (gen !== undefined && gen !== speechGeneration) return false

  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY
  const rawVoice = import.meta.env.VITE_ARIA_VOICE_NAME || 'Aoede'
  const voiceName = VOICE_ALIASES[rawVoice] || rawVoice

  if (!apiKey || modelIndex >= TTS_MODELS.length) return false

  const modelName = TTS_MODELS[modelIndex]

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Say in a calm, steady, reassuring female emergency-response tone:\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        }),
      }
    )

    if (!response.ok) {
      return tryGeminiTTS(text, onStart, onEnd, gen, modelIndex + 1)
    }

    const data = await response.json()
    const audioPart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data?: string } }) => p.inlineData
    )
    const audioData = audioPart?.inlineData?.data

    if (!audioData) {
      return tryGeminiTTS(text, onStart, onEnd, gen, modelIndex + 1)
    }

    if (gen !== undefined && gen !== speechGeneration) return false

    const binaryStr = atob(audioData)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioCtx()
    const wavBuffer = addWAVHeader(bytes, 24000, 1, 16)

    let audioBuffer: AudioBuffer
    try {
      audioBuffer = await audioContext.decodeAudioData(wavBuffer.slice(0))
    } catch {
      audioContext.close().catch(() => {})
      return tryGeminiTTS(text, onStart, onEnd, gen, modelIndex + 1)
    }

    if (gen !== undefined && gen !== speechGeneration) {
      audioContext.close().catch(() => {})
      return false
    }

    activeAudioContext = audioContext
    const source = audioContext.createBufferSource()
    activeSource = source
    source.buffer = audioBuffer
    source.connect(audioContext.destination)

    return new Promise<boolean>((resolve) => {
      source.onended = () => {
        if (gen === undefined || gen === speechGeneration) {
          onEnd?.()
        }
        activeSource = null
        audioContext.close().catch(() => {})
        if (activeAudioContext === audioContext) activeAudioContext = null
        resolve(true)
      }
      try {
        source.start(0)
        onStart?.()
        resolve(true)
      } catch {
        resolve(false)
      }
    })
  } catch {
    return tryGeminiTTS(text, onStart, onEnd, gen, modelIndex + 1)
  }
}

const addWAVHeader = (
  pcmData: Uint8Array,
  sampleRate: number,
  channels: number,
  bitDepth: number
): ArrayBuffer => {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)
  const dataLength = pcmData.length

  view.setUint32(0, 0x52494646, false)
  view.setUint32(4, 36 + dataLength, true)
  view.setUint32(8, 0x57415645, false)
  view.setUint32(12, 0x666d7420, false)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, (sampleRate * channels * bitDepth) / 8, true)
  view.setUint16(32, (channels * bitDepth) / 8, true)
  view.setUint16(34, bitDepth, true)
  view.setUint32(36, 0x64617461, false)
  view.setUint32(40, dataLength, true)

  const wav = new Uint8Array(44 + dataLength)
  wav.set(new Uint8Array(header))
  wav.set(pcmData, 44)
  return wav.buffer
}
