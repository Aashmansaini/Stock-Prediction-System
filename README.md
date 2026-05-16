# TradeFlow AI Dashboard

TradeFlow is a professional-grade AI-powered stock forecasting dashboard. It utilizes a **Temporal Fusion Transformer (TFT)** model to predict stock price movements based on historical market data. The interface is designed with a premium, minimalist "enterprise" aesthetic featuring interactive glassmorphism and real-time data visualization.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=TradeFlow+AI+Dashboard+Preview)

## 🚀 Features

- **AI Price Forecasting**: Multi-ticker predictions using advanced deep learning (TFT).
- **Interactive UI**: Buttery-smooth glassmorphism with dynamic mouse-tracking spotlight.
- **Dynamic Timeframes**: Switch between 1M, 6M, and 1Y prediction views.
- **Enterprise Design**: Built with React, Tailwind CSS, and Framer Motion for a high-end feel.
- **FastAPI Backend**: High-performance Python backend for model inference and data ingestion.

## 🛠️ Technology Stack

- **Frontend**: React, Recharts, Framer Motion, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, PyTorch, YahooQuery, Pandas, NumPy.
- **Model**: Temporal Fusion Transformer (TFT).

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js & npm

### Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The dashboard will be available at `http://localhost:3000`.

## 🧠 Machine Learning Model
The dashboard uses a custom implementation of the **Temporal Fusion Transformer**, trained on 5 years of historical stock data. The model architecture is optimized for time-series forecasting, capturing both long-term patterns and short-term volatility.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
