import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IncidentCard } from './IncidentCard';
import { Layers } from 'lucide-react';
import type { IncidentCard as IncidentCardType } from '@/types/incident.types';

interface IncidentCardListProps {
  incidents: IncidentCardType[];
  onReview?: (id: string) => void;
}

export const IncidentCardList: React.FC<IncidentCardListProps> = ({
  incidents,
  onReview
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (!incidents || incidents.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-4 mb-12" id="incident-card-list">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-[#00D4FF]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-[#E8F4FD]">
            Assessed Incidents
          </span>
          <span className="text-[11px] text-[#8BA3C7]">
            {incidents.length} active {incidents.length === 1 ? 'report' : 'reports'}
          </span>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence>
          {incidents.map((incident) => (
            <motion.div
              key={incident.id}
              variants={cardVariants}
              layout
              className="flex"
            >
              <IncidentCard incident={incident} onReview={onReview} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
