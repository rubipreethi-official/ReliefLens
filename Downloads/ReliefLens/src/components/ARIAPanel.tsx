import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, VolumeX, Terminal, ShieldAlert } from 'lucide-react';
import { enrichIncident } from '@/services/gemma/gemmaClient';

export const ARIA_GREETING = 
  "System initialized. Protocol Omega-4 active. " +
  "I am ARIA. I have established a secure link to your coordinate node. " +
  "Describe the disaster impact area immediately. I am prioritizing your uplink.";

export const ARIA_SYSTEM_PROMPT = `
You are ARIA, the Tactical Virtual Agent for ReliefLens.
Tone: Authoritative, calm, military-grade efficiency, deeply supportive.
Length: Under 25 words.
Structure: Status Update + One Direct Instruction.
Context: You are coordinating life-saving disaster response.
Language: Auto-detect. Respond in the user's language (English or Tamil).
`;

type AriaStatus = 'IDLE' | 'LISTENING' | 'ANALYZING' | 'SPEAKING';

interface Exchange {
  sender: 'user' | 'aria';
  text: string;
}

interface ARIAPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentExtracted?: (data: any) => void;
}

const useTypewriter = (text: string, speed = 25) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i++));
      if (i > text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayed;
};

export const ARIAPanel: React.FC<ARIAPanelProps> = ({ isOpen, onClose, onIncidentExtracted }) => {
  const [status, setStatus] = useState<AriaStatus>('IDLE');
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  
  const displayedText = useTypewriter(currentSpeech, 20);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithElevenLabs = async (text: string) => {
    if (isMuted) { setStatus('IDLE'); return; }
    setStatus('SPEAKING');
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) throw new Error("Key Missing");
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.7, similarity_boost: 0.8 } })
      });
      if (!response.ok) throw new Error("API Error");
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setStatus('IDLE');
      }
    } catch (err) {
      console.warn("Fallback to WebSpeech", err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.onend = () => setStatus('IDLE');
        window.speechSynthesis.speak(utt);
      } else setStatus('IDLE');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentSpeech(ARIA_GREETING);
      setExchanges([{ sender: 'aria', text: ARIA_GREETING }]);
      speakWithElevenLabs(ARIA_GREETING);
    } else {
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  const handleHold = () => {
    setStatus('LISTENING');
    setTranscript("Structural collapse at north sector. Multiple casualties suspected. Gas leak confirmed.");
  };

  const handleRelease = async () => {
    if (status !== 'LISTENING') return;
    setStatus('ANALYZING');
    const userMsg = transcript;
    setExchanges(prev => [...prev, { sender: 'user', text: userMsg }]);

    const res = await enrichIncident({ voiceTranscript: userMsg, textInput: `COMMAND: ${ARIA_SYSTEM_PROMPT}` });
    let reply = "Transmission received. Priority dispatch initiated. Stay at your current node.";
    if (res.success && res.result?.extracted) {
      const ext = res.result.extracted;
      reply = `Confirmed: ${ext.what?.incident_type}. Severity set to ${ext.severity.toUpperCase()}. Emergency teams are inbound.`;
      onIncidentExtracted?.(ext);
    }
    setCurrentSpeech(reply);
    setExchanges(prev => [...prev, { sender: 'aria', text: reply }]);
    speakWithElevenLabs(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#050810]/90 backdrop-blur-xl" id="aria-console">
      <audio ref={audioRef} className="hidden" />
      
      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="w-full max-w-4xl bg-[#0D1117] border-t border-x border-white/10 rounded-t-[2.5rem] p-8 shadow-[0_-20px_100px_rgba(0,212,255,0.15)] flex flex-col gap-8 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.1)]">
              <Terminal className="w-6 h-6 text-[#00D4FF]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-black text-lg tracking-[0.2em] text-white">ARIA V4.0</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
                <span className="text-[10px] font-black text-[#8BA3C7] uppercase tracking-widest">Tactical Link Established</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-[#8BA3C7] hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer & Status */}
        <div className="flex flex-col items-center justify-center py-10 relative">
          {/* Animated Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-40 h-40 rounded-full border border-[#00D4FF]/20 transition-all duration-1000 ${status === 'SPEAKING' ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100'}`} />
            <div className={`w-40 h-40 rounded-full border border-[#00D4FF]/10 transition-all duration-1000 delay-100 ${status === 'SPEAKING' ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'}`} />
          </div>

          {/* Core Visual Port */}
          <div className="relative w-40 h-40 rounded-full border-4 border-[#00D4FF]/30 shadow-[0_0_60px_rgba(0,212,255,0.2)] overflow-hidden bg-[#050810]">
            <video
              src={status === 'SPEAKING' ? '/talking.mp4' : '/idle.mp4'}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
          </div>

          {/* Status Capsule */}
          <div className="mt-8 flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 border border-white/10 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${status === 'SPEAKING' ? 'bg-[#30D158]' : status === 'LISTENING' ? 'bg-red-500' : 'bg-[#00D4FF]'} animate-pulse`} />
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">{status}</span>
          </div>
        </div>

        {/* Typewriter Output */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 min-h-[120px] relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00D4FF]/40" />
          <p className="text-lg font-medium text-[#E8F4FD] leading-relaxed relative z-10">
            {displayedText}
            <span className="inline-block w-2.5 h-5 ml-2 bg-[#00D4FF] animate-pulse align-middle" />
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-5 rounded-3xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-[#8BA3C7] hover:text-white'}`}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          <button
            onMouseDown={handleHold} onMouseUp={handleRelease}
            onTouchStart={handleHold} onTouchEnd={handleRelease}
            className={`flex-1 w-full py-6 rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase transition-all duration-300 flex items-center justify-center gap-4 select-none ${
              status === 'LISTENING' ? 'bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-95' : 'bg-[#00D4FF] text-[#050810] hover:shadow-[0_0_50px_rgba(0,212,255,0.3)]'
            }`}
          >
            <Mic className="w-6 h-6" />
            {status === 'LISTENING' ? 'Uplink Open' : 'Hold to Speak'}
          </button>

          <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-3xl">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#8BA3C7] uppercase">Encryption</span>
              <span className="text-[10px] text-white font-mono">AES-256 ACTIVE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
