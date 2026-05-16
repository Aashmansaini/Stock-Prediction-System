import os
import sys
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, ConcatDataset
import numpy as np

# Ensure Backend is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Backend.ml.models import CustomTFT
from Backend.ml.data_loader import load_data_yahooquery, WindowedStockDataset

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TICKERS = ["AAPL", "GOOG", "MSFT", "TSLA"]
SEQ_LEN = 60
BATCH_SIZE = 128
LR = 1e-3
EPOCHS = 10
MODEL_DIR = "Backend/models"
CHECKPOINT_PATH = os.path.join(MODEL_DIR, "custom_tft_checkpoint.pth")

def main():
    os.makedirs(MODEL_DIR, exist_ok=True)
    print("=== Training CustomTFT Model ===")
    
    datasets = []
    for ticker in TICKERS:
        print(f"Loading data for {ticker}...")
        df = load_data_yahooquery(ticker, "5y") # Shorter duration for quicker retraining
        if df is not None and len(df) > SEQ_LEN + 10:
            datasets.append(WindowedStockDataset(df, seq_len=SEQ_LEN))
            
    if not datasets:
        print("❌ No data available for training.")
        return
        
    loader = DataLoader(ConcatDataset(datasets), batch_size=BATCH_SIZE, shuffle=True)
    
    model = CustomTFT(seq_len=SEQ_LEN).to(DEVICE)
    opt = torch.optim.Adam(model.parameters(), lr=LR)
    loss_fn = nn.MSELoss()
    
    print("Starting training...")
    model.train()
    for epoch in range(1, EPOCHS + 1):
        losses = []
        for xb, yb in loader:
            xb, yb = xb.to(DEVICE), yb.to(DEVICE)
            opt.zero_grad()
            pred = model(xb)
            loss = loss_fn(pred, yb)
            loss.backward()
            opt.step()
            losses.append(loss.item())
            
        print(f"Epoch {epoch}/{EPOCHS} - Loss: {np.mean(losses):.6f}")
        
    torch.save({"model": model.state_dict(), "opt": opt.state_dict()}, CHECKPOINT_PATH)
    print(f"✅ Training complete. Model saved to {CHECKPOINT_PATH}")

if __name__ == "__main__":
    main()
