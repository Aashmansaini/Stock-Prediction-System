import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset
from yahooquery import Ticker
from sklearn.preprocessing import MinMaxScaler

def load_data_yahooquery(ticker, period="5y"):
    try:
        t = Ticker(ticker)
        df = t.history(period=period)
        if df is None or len(df) == 0:
            return None
        if isinstance(df.index, pd.MultiIndex):
            df = df.reset_index()
        if "symbol" in df.columns:
            df = df[df["symbol"] == ticker]
        
        # Rename columns properly if they exist in lowercase
        rename_map = {"open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"}
        df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
        
        if "Close" not in df.columns:
            return None
            
        if all(col in df.columns for col in ["date", "Open", "High", "Low", "Close", "Volume"]):
            df = df[["date", "Open", "High", "Low", "Close", "Volume"]] 
        else:
            df = df[["date", "Close"]]
            
        df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.tz_localize(None)
        df = df.dropna(subset=["date", "Close"]).sort_values("date").reset_index(drop=True)
        return df
    except Exception as e:
        print(f"Error downloading {ticker}: {e}")
        return None

class WindowedStockDataset(Dataset):
    """
    Applies MinMax scaling independently to each sequence window to prevent data leakage.
    """
    def __init__(self, df, seq_len=60):
        self.seq_len = seq_len
        prices = df["Close"].astype(float).values
        
        self.x = []
        self.y = []
        self.scalers = [] # Store scalers for inverse transformation later if needed
        
        for i in range(len(prices) - seq_len):
            window = prices[i:i + seq_len + 1].reshape(-1, 1)
            scaler = MinMaxScaler()
            scaled_window = scaler.fit_transform(window).flatten()
            
            self.x.append(scaled_window[:-1])
            self.y.append(scaled_window[-1])
            self.scalers.append(scaler)
            
        self.x = torch.tensor(np.array(self.x), dtype=torch.float32).unsqueeze(-1) # Add feature dimension (N, seq_len, 1)
        self.y = torch.tensor(np.array(self.y), dtype=torch.float32).unsqueeze(-1) # (N, 1)

    def __len__(self):
        return len(self.x)

    def __getitem__(self, idx):
        return self.x[idx], self.y[idx]

def generate_signals(predicted, actual):
    signals = ["hold"]
    for i in range(1, len(predicted)):
        if predicted[i] > predicted[i - 1] and actual[i] < actual[i - 1]:
            signals.append("buy")
        elif predicted[i] < predicted[i - 1] and actual[i] > actual[i - 1]:
            signals.append("sell")
        else:
            signals.append("hold")
    return signals
