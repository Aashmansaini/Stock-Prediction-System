import React from 'react';
import { Search, Activity } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="flex items-center justify-between py-6 mb-2 border-b border-white/5">
      <div className="flex flex-col">
        <h1 className="text-[#EBEBEB] font-semibold text-xl tracking-tight flex items-center gap-2">
          <Activity size={20} className="text-[#007AFF]" />
          Overview
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl focus-within:border-white/30 transition-all shadow-inner">
          <Search size={16} className="text-[#666]" />
          <input className="bg-transparent outline-none text-[#EBEBEB] text-sm w-48 placeholder-[#666]" placeholder="Search symbol..." />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#EBEBEB] font-medium cursor-pointer hover:bg-white/10 transition-colors text-xs shadow-lg">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(TopBar);
