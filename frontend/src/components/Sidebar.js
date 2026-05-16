import React from 'react';
import { Bell, Settings, LayoutDashboard, LineChart as ChartIcon, Briefcase, Plus } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-transparent border-r border-white/5 text-[#EBEBEB] flex flex-col h-full py-6 pr-6">
      <div className="flex items-center gap-3 mb-12 px-4">
        <div className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-black font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          TF
        </div>
        <div className="font-semibold text-lg tracking-tight text-white">TradeFlow</div>
      </div>

      <nav className="space-y-1 flex-1">
        <a className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] text-white font-medium cursor-pointer shadow-sm border border-white/5 backdrop-blur-md">
          <LayoutDashboard size={18} /> Dashboard
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.04] text-[#888] hover:text-[#EBEBEB] transition-colors cursor-pointer">
          <ChartIcon size={18} /> Watchlist
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.04] text-[#888] hover:text-[#EBEBEB] transition-colors cursor-pointer">
          <Briefcase size={18} /> Portfolio
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.04] text-[#888] hover:text-[#EBEBEB] transition-colors cursor-pointer">
          <Bell size={18} /> Alerts
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.04] text-[#888] hover:text-[#EBEBEB] transition-colors cursor-pointer">
          <Settings size={18} /> Settings
        </a>
      </nav>

      <div className="mt-auto px-4">
        <button className="flex justify-center items-center gap-2 w-full text-center font-medium bg-white/5 hover:bg-white/10 text-[#EBEBEB] border border-white/5 shadow-lg backdrop-blur-md px-4 py-2.5 rounded-2xl transition-all text-sm">
          <Plus size={16} /> New Alert
        </button>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
