import React from 'react';
import { motion } from 'framer-motion';
import ChangeBadge from './ChangeBadge';
import { watchlist } from '../data/mockData';

const Watchlist = ({ currentTicker, onSelectTicker }) => {
  return (
    <div className="bg-transparent backdrop-blur-sm border border-white/10 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="text-sm font-semibold text-[#EBEBEB] mb-4">Watchlist</div>
      <div className="space-y-2">
        {watchlist.map((w) => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            key={w.symbol} 
            onClick={() => onSelectTicker(w.symbol)}
            className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors ${
              currentTicker === w.symbol 
                ? "bg-white/[0.06] border border-white/10 shadow-sm" 
                : "border border-transparent hover:bg-white/[0.04]"
            }`}
          >
            <div>
              <div className="font-bold text-[#EBEBEB] text-sm tracking-tight">{w.symbol}</div>
              <div className="text-xs text-[#888] font-medium">{w.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-[#EBEBEB] tracking-tight">${w.price.toFixed(2)}</div>
              <ChangeBadge value={w.change} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
