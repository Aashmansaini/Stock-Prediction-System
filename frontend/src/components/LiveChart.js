import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const LiveChart = ({ ticker }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("1y");

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Best practice: encapsulate the URL or move it to a .env in a real deployment
    fetch(`http://127.0.0.1:8000/predict/${ticker}?period=${period}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) throw new Error(result.error);
        if (!result.dates) throw new Error("Invalid response format from server");
        const formattedData = result.dates.map((date, i) => ({
          date,
          actual: result.actual[i],
          predicted: result.predicted[i]
        }));
        setData(formattedData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticker, period]);

  const timeframes = [
    { label: "1M", value: "1mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" }
  ];

  return (
    <div className="bg-black/10 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]"></span>
            </span>
            <span className="text-[#888] text-[10px] font-bold uppercase tracking-widest">AI Forecast</span>
          </div>
          <h2 className="text-3xl font-bold text-[#EBEBEB] tracking-tight">{ticker}</h2>
        </div>
        
        {/* Minimalist Timeframe Selector */}
        <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-xl border border-white/5 shadow-inner">
          {timeframes.map((tf) => (
            <button 
              key={tf.value}
              onClick={() => setPeriod(tf.value)}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                period === tf.value 
                  ? 'bg-white/10 text-[#EBEBEB] shadow-sm' 
                  : 'text-[#888] hover:text-[#EBEBEB]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[#EBEBEB] rounded-full animate-spin"></div>
            <div className="text-[#888] text-sm font-medium">Loading model data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="px-5 py-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl text-[#FF3B30] text-sm font-medium">
              {error}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                tick={{ fill: "#666", fontSize: 11 }} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30} 
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: "#666", fontSize: 11 }} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val}`} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', padding: '12px 16px' }}
                itemStyle={{ fontSize: '13px', fontWeight: '600', padding: '2px 0' }}
                labelStyle={{ color: '#888', marginBottom: '6px', fontSize: '12px', fontWeight: '500' }}
              />
              <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '13px', color: '#888', fontWeight: '500' }} />
              <Line type="monotone" dataKey="actual" name="Actual Price" stroke="#007AFF" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#007AFF' }} />
              <Line type="monotone" dataKey="predicted" name="AI Prediction" stroke="#FF3B30" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#FF3B30' }} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LiveChart;
