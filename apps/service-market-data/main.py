from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI(title="TriWealth Market Data Service")

# Buka gerbang CORS agar bisa diakses oleh React atau Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Market Data Service is running 🟢"}

# [RUTE 1] Mengambil harga saat ini (yang sudah Anda buat sebelumnya)
@app.get("/api/v1/market/quote/{ticker}")
def get_quote(ticker: str):
    try:
        asset = yf.Ticker(ticker)
        info = asset.info
        
        current_price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("navPrice")
        
        if current_price is None:
            raise ValueError("Harga tidak ditemukan. Pastikan ticker valid (misal: BBCA.JK, AAPL, BTC-USD).")

        return {
            "ticker": ticker.upper(),
            "name": info.get("shortName") or info.get("longName") or ticker,
            "price": current_price,
            "currency": info.get("currency", "USD"),
            "changePercent": info.get("regularMarketChangePercent", 0),
            "type": info.get("quoteType", "UNKNOWN")
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Gagal mengambil data {ticker}: {str(e)}")

# [RUTE 2] BARU: Mengambil riwayat harga untuk membuat Grafik visual
@app.get("/api/v1/market/history/{ticker}")
def get_history(ticker: str, period: str = "1mo"):
    try:
        asset = yf.Ticker(ticker)
        # Ambil data historis (default: 1mo = 1 bulan)
        # Opsi period lain di yfinance: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max
        hist = asset.history(period=period)
        
        if hist.empty:
            raise ValueError("Data historis tidak ditemukan.")
            
        # Format data menjadi daftar/list yang mudah dibaca oleh grafik React (Recharts)
        chart_data = []
        for date, row in hist.iterrows():
            chart_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(row["Close"], 2) # Mengambil harga penutupan di hari itu
            })
            
        return {
            "ticker": ticker.upper(), 
            "period": period,
            "data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Gagal memuat history {ticker}: {str(e)}")