import React, { useState } from 'react';
import { ImageUploadZone } from './ImageUploadZone';
import { VoiceNoteCapture } from './VoiceNoteCapture';
import { TextInputPanel } from './TextInputPanel';
import { AnalyzeButton } from './AnalyzeButton';
import { SpeakWithAriaButton } from './SpeakWithAriaButton';
import type { DraftIncident } from '@/types/incident.types';

interface IncidentReportSectionProps {
  onOpenAria: () => void;
  onAnalyze: (draft: DraftIncident) => void;
  isAnalyzing: boolean;
}

export const IncidentReportSection: React.FC<IncidentReportSectionProps> = ({
  onOpenAria,
  onAnalyze,
  isAnalyzing
}) => {
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');

  const isInputEmpty = !photoBase64 && !voiceTranscript.trim() && !textInput.trim();

  const handleAnalyzeClick = () => {
    onAnalyze({
      photoBase64,
      voiceTranscript,
      textInput
    });
  };

  return (
    <section id="report" className="w-full max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col gap-2 mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-wider">
          Report an Incident
        </h2>
        <p className="text-sm text-[#8BA3C7] max-w-lg mx-auto">
          Capture disaster data via photo, voice, or text. Our AI processes multi-modal inputs for instant triage.
        </p>
      </div>

      {/* Main Intakes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* Left Column: Image Drop */}
        <div className="flex flex-col">
          <ImageUploadZone 
            onImageSelected={(b64) => setPhotoBase64(b64)}
            previewUrl={photoBase64 || null}
            onClearImage={() => setPhotoBase64(undefined)}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right Column: Voice + Text */}
        <div className="flex flex-col gap-5 justify-between">
          <VoiceNoteCapture 
            onTranscriptUpdate={(transcript) => setVoiceTranscript(transcript)}
            transcript={voiceTranscript}
          />

          <TextInputPanel 
            value={textInput}
            onChange={(val) => setTextInput(val)}
          />
        </div>

      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
        <AnalyzeButton 
          onClick={handleAnalyzeClick}
          disabled={isInputEmpty}
          isAnalyzing={isAnalyzing}
        />

        <SpeakWithAriaButton onClick={onOpenAria} />
      </div>

    </section>
  );
};
