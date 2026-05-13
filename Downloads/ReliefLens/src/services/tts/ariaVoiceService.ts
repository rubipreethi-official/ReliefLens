/**
 * ariaVoiceService.ts
 *
 * Primary TTS service using Gemini 3.1 Flash TTS.
 * Fallback to Web Speech API with female voice logic.
 *
 * Supported Languages: English, Tamil.
 */

/**
 * Primary voice function called by UI components.
 */
export const speakAsARIA = async (
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  // Try Gemini TTS first
  const success = await tryGeminiTTS(text, onStart, onEnd);
  if (!success) {
    console.warn('Gemini TTS failed — using Web Speech API fallback');
    speakFallback(text, onStart, onEnd);
  }
};

/**
 * Cancel any ongoing speech
 */
export const cancelAriaSpeech = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  // AudioContext doesn't have a global cancel easily, 
  // but this covers the Web Speech fallback and 
  // Gemini's fetch would have finished or be handled.
};

/**
 * Primary: Gemini TTS (Multilingual Female)
 */
const tryGeminiTTS = async (
  text: string, 
  onStart?: () => void,
  onEnd?: () => void,
  attempt = 1
): Promise<boolean> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const voiceName = import.meta.env.VITE_ARIA_VOICE_NAME || 'Aoede';

    if (!apiKey) {
      console.error('VITE_GOOGLE_AI_API_KEY is missing');
      return false;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are ARIA, a calm and authoritative female emergency response AI. Speak in a steady, reassuring tone. If the text is in Tamil, speak in Tamil naturally. Text: ${text}`
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
              }
            }
          }
        })
      }
    );

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    // No audio returned — retry once then give up
    if (!audioData) {
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return tryGeminiTTS(text, onStart, onEnd, attempt + 1);
      }
      return false; // triggers fallback
    }

    // Convert base64 PCM → playable audio
    const binaryStr = atob(audioData);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // PCM 24kHz via AudioContext
    const audioContext = new AudioContext();
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      if (onStart) onStart();
      source.onended = onEnd || null;
      source.start();
      return true;
    } catch {
      // decodeAudioData failed — PCM might need WAV header
      const wavBuffer = addWAVHeader(bytes, 24000, 1, 16);
      const audioBuffer = await audioContext.decodeAudioData(wavBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      if (onStart) onStart();
      source.onended = onEnd || null;
      source.start();
      return true;
    }

  } catch (error) {
    console.error('Gemini TTS Error:', error);
    if (attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return tryGeminiTTS(text, onStart, onEnd, attempt + 1);
    }
    return false; // triggers fallback
  }
};

/**
 * Fallback: Web Speech API (Female Voice)
 */
const speakFallback = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): void => {
  // Cancel any ongoing speech first
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    
    // Wait for voices to load then pick best female voice
    const setFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      const isTamil = /[\u0B80-\u0BFF]/.test(text);
      let selectedVoice = null;
      
      if (isTamil) {
        selectedVoice = voices.find(v => 
          v.lang === 'ta-IN' && v.name.toLowerCase().includes('female')
        ) || voices.find(v => v.lang === 'ta-IN');
      }
      
      if (!selectedVoice) {
        selectedVoice = 
          voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
          voices.find(v => v.lang === 'en-IN') ||
          voices.find(v => v.lang.startsWith('en') && 
            (v.name.includes('Female') || 
             v.name.includes('Samantha') || 
             v.name.includes('Victoria') ||
             v.name.includes('Karen') ||
             v.name.includes('Moira'))) ||
          voices.find(v => v.lang.startsWith('en'));
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = isTamil ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.9;   // slightly slower = calmer
      utterance.pitch = 1.1;  // slightly higher = more female
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet on first call
    if (window.speechSynthesis.getVoices().length > 0) {
      setFemaleVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setFemaleVoice;
    }
  }
};

/**
 * Gemini returns raw PCM — sometimes needs WAV header to decode
 */
const addWAVHeader = (
  pcmData: Uint8Array,
  sampleRate: number,
  channels: number,
  bitDepth: number
): ArrayBuffer => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const dataLength = pcmData.length;

  // RIFF header
  view.setUint32(0, 0x52494646, false);          // "RIFF"
  view.setUint32(4, 36 + dataLength, true);       // file size
  view.setUint32(8, 0x57415645, false);           // "WAVE"
  view.setUint32(12, 0x666d7420, false);          // "fmt "
  view.setUint32(16, 16, true);                   // chunk size
  view.setUint16(20, 1, true);                    // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bitDepth / 8, true);
  view.setUint16(32, (channels * bitDepth) / 8, true);
  view.setUint16(34, bitDepth, true);
  view.setUint32(36, 0x64617461, false);          // "data"
  view.setUint32(40, dataLength, true);

  const wav = new Uint8Array(44 + dataLength);
  wav.set(new Uint8Array(header));
  wav.set(pcmData, 44);
  return wav.buffer;
};
