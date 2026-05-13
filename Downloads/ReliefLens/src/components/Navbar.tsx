import React from 'react';
import { Shield, Activity } from 'lucide-react';
import { StatusBadge, type ConnectionStatus } from './StatusBadge';

interface NavbarProps {
  onOpenAria: () => void;
  status?: ConnectionStatus;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAria, status = 'ONLINE' }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-white/10 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00D4FF] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-[0.2em] text-white font-['Orbitron']">RELIEFLENS</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <button onClick={() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black tracking-[0.3em] text-[#8BA3C7] hover:text-[#00D4FF] transition-colors uppercase">Intake</button>
            <button onClick={() => document.getElementById('commander')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black tracking-[0.3em] text-[#8BA3C7] hover:text-[#00D4FF] transition-colors uppercase">Tactical</button>
            <button onClick={onOpenAria} className="text-[10px] font-black tracking-[0.3em] text-[#00D4FF] hover:text-white transition-colors uppercase">Aria Link</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-xl">
            <Activity className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="text-[9px] font-black text-[#8BA3C7] tracking-[0.2em] uppercase">Freq: 2.4GHz Secure</span>
          </div>
          <StatusBadge status={status} />
        </div>

      </div>
    </nav>
  );
};
