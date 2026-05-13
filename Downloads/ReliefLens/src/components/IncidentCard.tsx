import React from 'react';
import { AlertTriangle, MapPin, Users, Activity, Layers, Crosshair } from 'lucide-react';
import type { IncidentCard as IncidentCardType } from '@/types/incident.types';

interface IncidentCardProps {
  incident: IncidentCardType;
  onReview?: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onReview }) => {
  const getSeverityConfig = () => {
    switch (incident.severity) {
      case 'critical':
        return {
          border: 'severity-border-critical',
          badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
          color: 'text-red-400',
          progress: 'bg-red-500',
          pulse: true
        };
      case 'high':
        return {
          border: 'severity-border-high',
          badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          color: 'text-orange-400',
          progress: 'bg-orange-500',
          pulse: false
        };
      case 'medium':
        return {
          border: 'severity-border-medium',
          badgeBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
          color: 'text-yellow-400',
          progress: 'bg-yellow-500',
          pulse: false
        };
      case 'low':
      default:
        return {
          border: 'severity-border-low',
          badgeBg: 'bg-green-500/15 text-green-400 border-green-500/30',
          color: 'text-green-400',
          progress: 'bg-green-500',
          pulse: false
        };
    }
  };

  const config = getSeverityConfig();
  const confidencePct = Math.round(incident.confidence * 100);

  return (
    <div 
      className={`w-full bg-[#161B22] rounded-2xl ${config.border} flex flex-col overflow-hidden transition-all duration-300 hover:shadow-glow-cyan relative group`}
      id={`incident-card-${incident.id}`}
    >
      {/* Tactical Corner Crosshairs */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20 rounded-tl-sm pointer-events-none group-hover:border-[#00D4FF]/40 transition-colors" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20 rounded-tr-sm pointer-events-none group-hover:border-[#00D4FF]/40 transition-colors" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20 rounded-bl-sm pointer-events-none group-hover:border-[#00D4FF]/40 transition-colors" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20 rounded-br-sm pointer-events-none group-hover:border-[#00D4FF]/40 transition-colors" />

      {/* Top Header */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-[#0D1117] border border-white/5`}>
            <AlertTriangle className={`w-4 h-4 ${config.color}`} />
          </div>
          <span className="font-bold tracking-wide text-sm text-[#E8F4FD] font-['Orbitron']">
            {incident.what?.incident_type || 'Unspecified Hazard'}
          </span>
        </div>

        {/* Severity Badge */}
        <span className={`text-[10px] uppercase px-3 py-1 rounded-full border font-black tracking-widest ${config.badgeBg} ${config.pulse ? 'animate-pulse' : ''}`}>
          {incident.severity}
        </span>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-5 flex flex-col gap-4 flex-1 relative z-10">
        
        {/* WHO */}
        <div className="flex items-start gap-3 text-xs text-[#E8F4FD]">
          <div className="w-8 h-8 rounded-lg bg-[#0D1117] flex items-center justify-center shrink-0 border border-white/5">
            <Users className="w-4 h-4 text-[#8BA3C7]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-[#8BA3C7] uppercase tracking-widest">AFFECTED PERSONNEL</span>
            <span className="text-sm font-medium">
              <strong className="text-[#00D4FF] font-black text-base">{incident.who?.count ?? 'Unknown'}</strong> INDIVIDUALS
            </span>
            <span className="text-[#8BA3C7]/80 italic text-[11px]">{incident.who?.condition || 'Status assessment pending'}</span>
          </div>
        </div>

        {/* WHERE */}
        <div className="flex items-start gap-3 text-xs text-[#E8F4FD]">
          <div className="w-8 h-8 rounded-lg bg-[#0D1117] flex items-center justify-center shrink-0 border border-white/5">
            <MapPin className="w-4 h-4 text-[#8BA3C7]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-[#8BA3C7] uppercase tracking-widest">GEOSPATIAL TARGET</span>
            <span className="text-sm font-medium">{incident.where?.description || 'GPS COORDINATES PENDING'}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-black tracking-tighter">
                SCALE: {incident.what?.damage_scale?.toUpperCase() || 'UNVERIFIED'}
              </span>
              <span className="text-[10px] text-[#8BA3C7]/60 flex items-center gap-1">
                <Crosshair className="w-2.5 h-2.5" />
                {incident.where?.lat?.toFixed(4)}, {incident.where?.lng?.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Urgency Flags */}
        {incident.urgency_flags && incident.urgency_flags.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <span className="text-[9px] font-black text-red-400/80 uppercase tracking-widest">CRITICAL HAZARDS</span>
            <div className="flex flex-wrap gap-1.5">
              {incident.urgency_flags.map((flag, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-bold uppercase"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {incident.suggested_resources && incident.suggested_resources.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <span className="text-[9px] font-black text-[#00D4FF]/80 uppercase tracking-widest flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              PRIORITY DISPATCH
            </span>
            <div className="flex flex-col gap-1">
              {incident.suggested_resources.map((res, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] text-[#8BA3C7]">
                  <div className="w-1 h-1 rounded-full bg-[#00D4FF]/40" />
                  <span className="truncate">{res}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Confidence Footer Bar */}
      <div className="p-4 bg-[#0D1117]/80 border-t border-white/5 flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#00D4FF]" />
            <span className="text-[10px] font-black text-[#8BA3C7] uppercase tracking-widest">Inference Confidence</span>
          </div>
          <span className={`text-[11px] font-black ${confidencePct < 70 ? 'text-amber-400' : 'text-[#00D4FF]'}`}>
            {confidencePct}%
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${config.progress} shadow-[0_0_10px_rgba(0,212,255,0.3)]`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>

        {/* Review prompt */}
        {incident.requiresReview && onReview && (
          <button
            onClick={() => onReview(incident.id)}
            className="mt-2 w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm hover:shadow-amber-500/10"
            id={`review-btn-${incident.id}`}
          >
            ⚠️ Verify Intake Details
          </button>
        )}
      </div>

    </div>
  );
};
