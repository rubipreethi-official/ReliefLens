import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Radio, Cpu, Sparkles } from 'lucide-react';
import { logger } from '../../utils/logger';

interface AvatarSpeakerProps {
  /** The text for the avatar to read aloud */
  textToSpeak: string;
  /** Force the avatar to stop speaking and go idle */
  isMuted?: boolean;
  /** Callback when speech finishes */
  onSpeechEnd?: () => void;
}

export const AvatarSpeaker: React.FC<AvatarSpeakerProps> = ({
  textToSpeak,
  isMuted = false,
  onSpeechEnd
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setHasError] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoicesLoaded(true);
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  // Handle speech
  useEffect(() => {
    if (!textToSpeak || isMuted || !voicesLoaded) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      // Pick a premium or clear default voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.05; // Slightly elevated pitch for clean robotic assistant articulation

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onSpeechEnd) onSpeechEnd();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          logger.error('Speech synthesis error:', e);
          setHasError(true);
          setIsSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      logger.error('Failed to initialize speech synthesis:', err);
      setHasError(true);
      setIsSpeaking(false);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [textToSpeak, isMuted, voicesLoaded, onSpeechEnd]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl border border-enriched/30 bg-surface group">
      {/* Holographic glowing borders */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none border-2 ${isSpeaking && !isMuted ? 'border-enriched shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-transparent'}`} />

      {/* Top Banner Status Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 text-xs font-mono font-bold tracking-wider backdrop-blur-md border border-border">
          <Cpu size={13} className="text-accent animate-spin-slow" />
          <span className="bg-gradient-to-r from-enriched to-accent bg-clip-text text-transparent">ARIA AGENT</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Active status pulse pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide ${isSpeaking && !isMuted ? 'bg-enriched/20 text-enriched border border-enriched/40 animate-pulse' : 'bg-background/80 text-muted'}`}>
            <Radio size={10} className={isSpeaking && !isMuted ? 'animate-bounce' : ''} />
            <span>{isSpeaking && !isMuted ? 'TRANSMITTING' : 'IDLE'}</span>
          </div>

          {isMuted ? (
            <div className="p-1.5 rounded-full bg-background/80 text-muted backdrop-blur-sm border border-border">
              <VolumeX size={14} />
            </div>
          ) : (
            <div className={`p-1.5 rounded-full backdrop-blur-sm shadow-md transition-all ${isSpeaking ? 'bg-enriched text-white shadow-enriched/50' : 'bg-surface border border-border text-text'}`}>
              <Volume2 size={14} className={isSpeaking ? 'animate-pulse' : ''} />
            </div>
          )}
        </div>
      </div>

      {/* Avatar Viewport Container */}
      <div className="aspect-[3/4] relative bg-background flex items-center justify-center overflow-hidden">
        {/* Background Visualizer Rings */}
        {isSpeaking && !isMuted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="absolute w-48 h-48 rounded-full border border-enriched/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute w-64 h-64 rounded-full border border-accent/10 animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {isSpeaking && !isMuted ? (
            <motion.video
              key="talking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full object-cover z-10"
              src="/talking.mp4"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <motion.video
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover z-10"
              src="/idle.mp4"
              autoPlay
              loop
              muted
              playsInline
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
              }}
            />
          )}
        </AnimatePresence>

        {/* Dynamic audio equalizer waveform bars overlaid at the bottom of the viewport */}
        {isSpeaking && !isMuted && (
          <div className="absolute bottom-20 left-0 right-0 flex items-end justify-center gap-1 h-8 z-20 pointer-events-none px-4 opacity-80">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-enriched to-accent"
                animate={{
                  height: ['20%', '80%', '30%', '100%', '40%', '15%'],
                }}
                transition={{
                  duration: 0.5 + (i % 3) * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Fallback Viewport overlay when native video isn't placed yet */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-background via-surface to-background">
          <div className="relative w-28 h-28 rounded-full bg-surface border-2 border-dashed border-enriched/40 flex items-center justify-center mb-4 shadow-inner">
            <Sparkles size={32} className="text-enriched animate-pulse" />
            {isSpeaking && !isMuted && (
              <div className="absolute inset-0 rounded-full border-2 border-enriched animate-spin-slow" />
            )}
          </div>
          <p className="font-syne text-sm text-text font-bold tracking-wide mb-1">ARIA HOLO-CORE</p>
          <p className="text-xs text-muted/80 max-w-[200px] leading-relaxed">
            Place <code className="text-accent font-mono">idle.mp4</code> and <code className="text-accent font-mono">talking.mp4</code> in <code className="text-accent font-mono">public/</code> to initialize neural visualization.
          </p>
        </div>
      </div>
      
      {/* Dynamic Subtitle Viewport Footer */}
      {textToSpeak && !isMuted && isSpeaking && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-30 border-t border-border/40 backdrop-blur-sm"
        >
          <p className="text-text text-xs leading-relaxed drop-shadow-md font-inter font-medium text-center line-clamp-3">
            {textToSpeak}
          </p>
        </motion.div>
      )}
    </div>
  );
};
