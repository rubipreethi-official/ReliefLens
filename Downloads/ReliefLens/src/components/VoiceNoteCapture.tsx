import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Waves } from 'lucide-react';

interface VoiceNoteCaptureProps {
  onTranscriptUpdate: (transcript: string) => void;
  transcript: string;
}

export const VoiceNoteCapture: React.FC<VoiceNoteCaptureProps> = ({ onTranscriptUpdate, transcript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [waves, setWaves] = useState([20, 40, 60, 40, 20]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setWaves(waves.map(() => Math.floor(Math.random() * 80) + 20));
      }, 100);
      const timer = setTimeout(() => { if (!transcript) onTranscriptUpdate("Unit 7 reporting structural damage. Perimeter breached."); }, 2000);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }
  }, [isRecording]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Waves className="w-4 h-4 text-[#00D4FF]" />
        <span className="text-[10px] font-black tracking-[0.3em] text-[#8BA3C7] uppercase">Acoustic Uplink</span>
      </div>
      
      <div className="bg-[#161B22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-[#0D1117] border border-[#00D4FF]/30 text-[#00D4FF] hover:border-[#00D4FF]'}`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <div className="flex-1 h-16 bg-[#0D1117] rounded-2xl border border-white/5 flex items-center justify-center gap-1.5 px-6">
            {waves.map((h, i) => (
              <div key={i} className={`w-1.5 rounded-full transition-all duration-100 ${isRecording ? 'bg-[#00D4FF]' : 'bg-white/10'}`} style={{ height: isRecording ? `${h}%` : '20%' }} />
            ))}
          </div>
        </div>

        <div className="bg-[#050810] rounded-2xl p-4 border border-white/5 min-h-[80px]">
          {transcript ? (
            <p className="text-sm text-white/90 leading-relaxed font-medium">{transcript}</p>
          ) : (
            <p className="text-xs text-[#8BA3C7]/40 uppercase tracking-[0.1em] italic">Awaiting transmission...</p>
          )}
        </div>
      </div>
    </div>
  );
};
