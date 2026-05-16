import React, { useMemo } from 'react';
import { portfolio } from '../data/mockData';

const PortfolioSummary = () => {
  // Memoize the total value calculation for performance optimization
  const totalValue = useMemo(() => {
    return portfolio.reduce((sum, p) => sum + p.shares * p.current, 0);
  }, []);

  return (
    <div className="bg-transparent backdrop-blur-sm border border-white/10 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="text-sm font-semibold text-[#EBEBEB] mb-2">Portfolio</div>
      <div className="text-3xl font-bold text-[#EBEBEB] mb-6 tracking-tight">
        {`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </div>
      <div className="space-y-4">
        {portfolio.map((p) => (
          <div key={p.symbol} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#EBEBEB] text-sm">{p.symbol}</div>
              <div className="text-xs text-[#888] font-medium">{p.shares} shares @ ${p.avg.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-[#EBEBEB] text-sm">${(p.current * p.shares).toFixed(2)}</div>
              <div className="text-xs text-[#888] font-medium">${p.current.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSummary;
