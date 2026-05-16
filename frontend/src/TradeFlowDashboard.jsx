import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function TradeFlowDashboard() {
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const watchlist = ["AAPL", "TSLA", "MSFT", "GOOG"];

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://127.0.0.1:8000/predict/${ticker}`);
        const json = await response.json();
        console.log("API Response:", json);

        if (json.error) {
          setError(json.error);
          setData([]);
          return;
        }

        if (!Array.isArray(json.dates) || !Array.isArray(json.actual)) {
          throw new Error("Invalid data structure from API");
        }

        const formatted = json.dates.map((date, i) => ({
          date,
          actual: json.actual[i],
          predicted: json.predicted[i],
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load prediction data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [ticker]); // 👈 Re-fetch every time ticker changes

  return (
    <div className="flex gap-6 text-slate-200">
      {/* MAIN CONTENT */}
      <div className="flex-1 bg-slate-800/40 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {ticker} · Transformer Model Prediction
            </h2>
            <p className="text-sm text-slate-400">AI-driven 1-year forecast</p>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading {ticker} prediction...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : data.length === 0 ? (
          <div className="text-slate-400">No prediction data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#60a5fa" dot={false} name="Actual" />
              <Line type="monotone" dataKey="predicted" stroke="#fbbf24" dot={false} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* SIDEBAR — WATCHLIST */}
      <div className="w-64 bg-slate-800/50 p-4 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3 text-slate-100">Watchlist</h3>
        <ul className="space-y-2">
          {watchlist.map((symbol) => (
            <li
              key={symbol}
              onClick={() => setTicker(symbol)}
              className={`cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition ${
                ticker === symbol ? "bg-slate-700" : ""
              }`}
            >
              {symbol}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
