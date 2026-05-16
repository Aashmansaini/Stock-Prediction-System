import React from 'react';
import { motion } from 'framer-motion';
import { stats } from '../data/mockData';

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s) => (
        <motion.div 
          key={s.id} 
          whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
          className="bg-transparent backdrop-blur-sm border border-white/10 p-5 rounded-3xl transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-[#888] font-medium">{s.label}</div>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${s.trend.includes('+') ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-white/5 text-[#888]'}`}>{s.trend}</span>
          </div>
          <div className="text-2xl font-semibold text-[#EBEBEB] tracking-tight">{s.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
