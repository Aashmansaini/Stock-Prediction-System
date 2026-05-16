import React, { useState } from 'react';
import { motion } from 'framer-motion';

import MouseGlow from '../components/MouseGlow';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatsGrid from '../components/StatsGrid';
import LiveChart from '../components/LiveChart';
import Watchlist from '../components/Watchlist';
import PortfolioSummary from '../components/PortfolioSummary';

// ---------------------------------------------------------------------------
// TradeFlow Dashboard - Optimized Componentized UI
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function TradeFlowDashboard() {
  const [ticker, setTicker] = useState("AAPL");

  return (
    <div className="min-h-screen bg-transparent font-sans text-[#EBEBEB] selection:bg-[#007AFF]/30 relative">
      <MouseGlow />
      
      <div className="w-full mx-auto px-4 sm:px-8 h-screen flex flex-col md:flex-row gap-8 relative z-10">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-10">
          <TopBar />
          <motion.div 
            className="space-y-6 mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}><StatsGrid /></motion.div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div className="xl:col-span-2" variants={itemVariants}>
                <LiveChart ticker={ticker} />
              </motion.div>
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Watchlist currentTicker={ticker} onSelectTicker={setTicker} />
                </motion.div>
                <motion.div variants={itemVariants}><PortfolioSummary /></motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
