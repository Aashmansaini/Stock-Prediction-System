import os
import sys
import torch
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from torch.utils.data import DataLoader
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure Backend is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Backend.ml.models import CustomTFT
from Backend.ml.data_loader import load_data_yahooquery, WindowedStockDataset

app = FastAPI(
    title="TradeFlow AI Trading Bot API",
    description="Backend service for predicting stock prices using Temporal Fusion Transformers.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SEQ_LEN = 60
MODEL_PATH = "Backend/models/custom_tft_checkpoint.pth"

# Initialize model
model = CustomTFT(seq_len=SEQ_LEN).to(DEVICE)

# Try to load model on startup
if os.path.exists(MODEL_PATH):
    try:
        ckpt = torch.load(MODEL_PATH, map_location=DEVICE)
        if "model" in ckpt:
            model.load_state_dict(ckpt["model"])
        else:
            model.load_state_dict(ckpt)
        print("✅ CustomTFT Model loaded successfully.")
    except Exception as e:
        print(f"⚠️ Failed to load model: {e}")
else:
    print(f"⚠️ No trained model found at {MODEL_PATH}")


@app.get("/")
def home() -> Dict[str, str]:
    """Health check endpoint to verify API status."""
    return {"message": "TradeFlow AI Trading Bot API is running."}


@app.get("/predict/{ticker}", response_model=Dict[str, Any])
def get_prediction(ticker: str, period: str = "1y") -> Dict[str, Any]:
    """
    Fetches historical stock data and runs the TFT model to predict future prices.
    
    Args:
        ticker (str): The stock ticker symbol (e.g. AAPL)
        period (str): The display timeframe ("1mo", "6mo", "1y")
        
    Returns:
        Dict: JSON object containing dates, actual prices, predicted prices, and trade signals.
    """
    ticker = ticker.upper()
    
    # ALWAYS fetch at least 2y of data so we have enough sequence length (60) + history to show
    df = load_data_yahooquery(ticker, period="2y")
    
    if df is None or len(df) < SEQ_LEN + 1:
        raise HTTPException(status_code=404, detail=f"Not enough data found for {ticker}")
        
    dataset = WindowedStockDataset(df, seq_len=SEQ_LEN)
    data_loader = DataLoader(dataset, batch_size=32, shuffle=False)
    
    preds: List[float] = []
    model.eval()
    with torch.no_grad():
        for batch_x, _ in data_loader:
            out = model(batch_x.to(DEVICE))
            preds.extend(out.squeeze(-1).cpu().numpy())
            
    pred_inverse: List[float] = []
    actual_inverse: List[float] = []
    
    for i, p in enumerate(preds):
        scaler = dataset.scalers[i]
        
        dummy_pred = np.zeros((SEQ_LEN + 1, 1))
        dummy_pred[-1] = p
        inv_p = scaler.inverse_transform(dummy_pred)[-1][0]
        pred_inverse.append(float(inv_p))
        
        dummy_actual = np.zeros((SEQ_LEN + 1, 1))
        dummy_actual[-1] = dataset.y[i].numpy()[0]
        inv_a = scaler.inverse_transform(dummy_actual)[-1][0]
        actual_inverse.append(float(inv_a))
        
    dates: List[str] = df["date"].dt.strftime("%Y-%m-%d").tolist()[SEQ_LEN:]
    signals: List[str] = ["BUY" if p > a else "SELL" for p, a in zip(pred_inverse, actual_inverse)]
    
    # Filter the output lists based on the requested period
    slice_len = len(dates)
    if period == "1mo":
        slice_len = 21 # Approx 21 trading days in a month
    elif period == "6mo":
        slice_len = 126 # Approx 126 trading days in 6 months
    elif period == "1y":
        slice_len = 252 # Approx 252 trading days in a year
        
    dates = dates[-slice_len:]
    pred_inverse = pred_inverse[-slice_len:]
    actual_inverse = actual_inverse[-slice_len:]
    signals = signals[-slice_len:]
    
    return {
        "ticker": ticker,
        "dates": dates,
        "predicted": pred_inverse,
        "actual": actual_inverse,
        "signals": signals
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("Backend.main:app", host="127.0.0.1", port=8000, reload=True)
