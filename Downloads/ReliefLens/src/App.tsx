import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SupportCarousel } from './components/SupportCarousel';
import { IncidentReportSection } from './components/IncidentReportSection';
import { IncidentCardList } from './components/IncidentCardList';
import { CommanderSection } from './components/CommanderSection';
import { AriaPanel } from './components/AriaPanel';
import { getCurrentPosition, getRegionalLanguages, scrapeContactsForLocation } from './services/location/locationService';
import { RecentDisastersSection } from './components/RecentDisastersSection';
import { useIncidentStore } from './store/incidentStore';
import type { IncidentCard } from './types/incident.types';
import type { ExtractedIncidentData } from './types/ai.types';

const INITIAL_INCIDENTS: IncidentCard[] = [
  {
    id: 'inc-seed-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    severity: 'critical',
    confidence: 0.96,
    status: 'ai-enriched',
    priorityScore: 98,
    requiresReview: false,
    what: { incident_type: 'Structural Collapse', damage_scale: 'catastrophic', hazards: ['Gas Leak', 'Fire'], confidence: 0.95 },
    where: { description: 'Chennai IT Corridor Sector 7', lat: 13.06, lng: 80.26, confidence: 0.98 },
    who: { count: 12, condition: 'Trapped', confidence: 0.92 },
    urgency_flags: ['IMMEDIATE EVAC', 'HAZMAT'],
    suggested_resources: ['USAR Team', 'Trauma Unit'],
    contacts: [{ name: 'TN Fire Dept', roleOrOrganization: 'HQ', phone: '101', email: 'tnfire@gov.in', category: 'Official Support' }],
    auditLog: [{ timestamp: new Date().toISOString(), action: 'enriched', actor: 'ARIA_CORE' }]
  }
];

export const App: React.FC = () => {
  const [ariaOpen, setAriaOpen] = useState(false);
  
  const { 
    incidents, 
    setIncidents, 
    userLocation,
    setUserLocation, 
    setAvailableLanguages,
    deleteIncident,
    acknowledgeIncident
  } = useIncidentStore();

  React.useEffect(() => {
    // Initial data load or seed
    if (incidents.length === 0) {
      setIncidents(INITIAL_INCIDENTS);
    }

    const initLocation = async () => {
      try {
        const loc = await getCurrentPosition();
        setUserLocation(loc);
        const langs = await getRegionalLanguages(loc.lat, loc.lng);
        setAvailableLanguages(langs);
        scrapeContactsForLocation(loc).catch(() => {});
      } catch (err) {
        console.error('Failed to initialize location:', err);
      }
    };
    initLocation();
  }, [setUserLocation, setAvailableLanguages, setIncidents]);

  const handleIncidentExtracted = (ext: ExtractedIncidentData) => {
    const newInc: IncidentCard = {
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      severity: ext.severity || 'high',
      confidence: ext.confidence || 0.88,
      status: 'ai-enriched',
      priorityScore: 85,
      requiresReview: false,
      what: ext.what,
      where: {
        description: ext.where?.description || userLocation?.address || 'Unknown location',
        lat: ext.where?.lat ?? userLocation?.lat,
        lng: ext.where?.lng ?? userLocation?.lng,
        confidence: ext.where?.confidence ?? (userLocation ? 0.85 : 0),
      },
      who: ext.who || { count: 0, condition: 'Unknown', confidence: 0 },
      urgency_flags: ext.urgency_flags || [],
      suggested_resources: ext.suggested_resources || [],
      contacts: ext.contacts || [],
      auditLog: [{ timestamp: new Date().toISOString(), action: 'enriched', actor: 'ARIA_CORE' }]
    };
    setIncidents([newInc, ...incidents]);
    setTimeout(() => document.getElementById('assessed-cards')?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-[#E8F4FD] relative font-['Exo 2']">
      
      {/* Tactical HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] border-[20px] border-white/[0.02] border-double" />

      <Navbar onOpenAria={() => setAriaOpen(true)} />
      
      <main className="relative">
        <HeroSection onReportClick={() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })} onCommanderClick={() => document.getElementById('commander')?.scrollIntoView({ behavior: 'smooth' })} />
        <SupportCarousel />
        <IncidentReportSection onOpenAria={() => setAriaOpen(true)} onIncidentExtracted={handleIncidentExtracted} />
        <RecentDisastersSection />

        <div id="assessed-cards" className="scroll-mt-24">
          <IncidentCardList incidents={incidents} onDelete={deleteIncident} />
        </div>

        <CommanderSection incidents={incidents} onAcknowledge={(id) => acknowledgeIncident(id, 'CMDR_PRITHVI')} />
      </main>

      <AriaPanel 
        isOpen={ariaOpen} 
        onClose={() => setAriaOpen(false)} 
        onIncidentExtracted={handleIncidentExtracted} 
      />

      <footer className="w-full border-t border-white/5 bg-[#0D1117] py-12 px-8 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse shadow-[0_0_10px_#00D4FF]" />
            <span className="text-sm font-black tracking-[0.1em] text-white font-['Orbitron']">RELIEFLENS TACTICAL</span>
          </div>
          <span className="text-[10px] font-black text-[#8BA3C7] tracking-[0.1em] uppercase opacity-40">
            © {new Date().getFullYear()} Disaster Decision Acceleration Node
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;
