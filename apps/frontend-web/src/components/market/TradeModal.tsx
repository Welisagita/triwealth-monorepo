import { useState } from 'react';
import { X, ArrowRightLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: { id: string };
  quote: any;
  activeCategory: string; // Untuk menentukan assetType
}

export default function TradeModal({ isOpen, onClose, userData, quote, activeCategory }: Props) {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !quote) return null;

  const totalValue = (Number(amount) || 0) * quote.price;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const endpoint = tradeType === 'BUY' ? '/api/v1/trading/buy' : '/api/v1/trading/sell';
      await axios.post(`${API_URL}${endpoint}`, {
        userId: userData.id,
        ticker: quote.ticker,
        name: quote.name,
        assetType: activeCategory,
        amount: Number(amount),
        price: quote.price
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        onClose();
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Terjadi kesalahan saat memproses transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Trade {quote.ticker}</h3>
            <p className="text-sm text-gray-500">{quote.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-gray-100 rounded-full transition shadow-sm border border-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Transaksi Berhasil!</h3>
            <p className="text-gray-500 text-sm">Portofolio Anda telah diperbarui.</p>
          </div>
        ) : (
          <form onSubmit={handleTrade} className="p-6">
            
            {/* Tab Buy/Sell */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button type="button" onClick={() => setTradeType('BUY')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${tradeType === 'BUY' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Beli (Buy)</button>
              <button type="button" onClick={() => setTradeType('SELL')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${tradeType === 'SELL' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Jual (Sell)</button>
            </div>

            {/* Harga Saat Ini */}
            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-sm font-medium text-gray-500">Harga Pasar</span>
              <span className="font-bold text-gray-900 text-lg">{quote.currency === 'USD' ? '$' : 'Rp'}{quote.price.toLocaleString('en-US')}</span>
            </div>

            {/* Input Jumlah */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah (Lembar/Koin)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition text-lg font-bold"
                />
                <ArrowRightLeft size={20} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Estimasi Total */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold text-gray-500">Total Estimasi</span>
              <span className={`text-2xl font-black ${tradeType === 'BUY' ? 'text-green-600' : 'text-blue-600'}`}>
                {quote.currency === 'USD' ? '$' : 'Rp'}{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {errorMsg && <p className="text-red-500 text-sm font-medium mb-4 text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>}

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={isLoading || !amount || Number(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center transition shadow-lg ${
                isLoading || !amount || Number(amount) <= 0 ? 'bg-gray-400 cursor-not-allowed' : tradeType === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : `Konfirmasi ${tradeType === 'BUY' ? 'Beli' : 'Jual'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}