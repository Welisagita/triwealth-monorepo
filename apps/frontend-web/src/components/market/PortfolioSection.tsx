import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Wallet, History, ArrowDownRight, ArrowUpRight, Search, Filter } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Props {
  onTradeAsset: (ticker: string, name: string) => void;
}

export default function PortfolioSection({ onTradeAsset }: Props) {
  const [data, setData] = useState<{ portfolio: any, positions: any[], transactions: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usdRate, setUsdRate] = useState<number>(15500);

  // STATE UNTUK FILTER RIWAYAT
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPortfolioAndRate = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [rateRes, portRes] = await Promise.all([
        axios.get('https://open.er-api.com/v6/latest/USD').catch(() => null),
        axios.get(`${API_URL}/api/v1/portfolios/full-data`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (rateRes && rateRes.data?.rates?.IDR) {
        setUsdRate(rateRes.data.rates.IDR);
      }
      
      setData(portRes.data.data);
    } catch (error) {
      console.error("Gagal memuat data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioAndRate();
  }, []);

  

  // LOGIKA FILTER RIWAYAT TRANSAKSI
  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter(trx => {
      const matchSearch = trx.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'ALL' ? true : trx.type === filterType;
      
      const trxDate = new Date(trx.createdAt).getTime();
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      const matchStart = start ? trxDate >= start : true;
      const matchEnd = end ? trxDate <= end : true;

      return matchSearch && matchType && matchStart && matchEnd;
    });
  }, [data, searchQuery, filterType, startDate, endDate]);


  if (isLoading || !data) {
    return <div className="flex justify-center py-20 text-gray-400">Memuat Portofolio...</div>;
  }

  const { portfolio, positions } = data;
  
  const isUSDAsset = (ticker: string) => ticker.includes('-USD') || (!ticker.includes('.JK') && ticker.length <= 5);
  const getExchangeRate = (ticker: string) => isUSDAsset(ticker) ? usdRate : 1;

  const totalAssetValueIDR = positions.reduce((acc, pos) => {
    return acc + (pos.amount * pos.averagePrice * getExchangeRate(pos.ticker));
  }, 0);
  const totalWealth = portfolio.balance + totalAssetValueIDR;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-300">
      
      {/* KARTU SALDO & KEKAYAAN */}
      <div className="bg-linear-to-br from-gray-900 to-black p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-gray-400 font-medium mb-1">Total Nilai Portofolio</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Rp {totalWealth.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</h2>
          <div className="flex gap-6">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Kas Tersedia</p>
              <p className="text-xl font-bold text-green-400">Rp {portfolio.balance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Nilai Aset Diinvestasikan</p>
              <p className="text-xl font-bold text-blue-400">Rp {totalAssetValueIDR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 1: DAFTAR ASET DIMILIKI (Full Width) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center mb-6">
          <Wallet className="text-blue-500 mr-2" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Aset Dimiliki</h3>
        </div>
        
        {positions.length === 0 ? (
          <p className="text-gray-400 text-sm italic py-4">Belum ada aset. Mulai berinvestasi di menu Eksplorasi Pasar.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((pos) => {
              const isUSD = isUSDAsset(pos.ticker);
              return (
                <div key={pos.id} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900 truncate max-w-30">{pos.name}</h4>
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded mt-1 inline-block">{pos.ticker}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{pos.amount} Unit</p>
                      <p className="text-xs text-gray-500">
                        Avg: {isUSD ? '$' : 'Rp'} {pos.averagePrice.toLocaleString(isUSD ? 'en-US' : 'id-ID', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    {/* TOMBOL TRADE LANGSUNG DI CARD ASET */}
                    <button 
                      onClick={() => onTradeAsset(pos.ticker, pos.name)}
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition shadow-sm"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ROW 2: RIWAYAT TRANSAKSI DENGAN FILTER (Full Width) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <History className="text-purple-500 mr-2" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Riwayat Transaksi</h3>
          </div>
          
          {/* FILTER CONTROLS */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari Ticker..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="BUY">Beli (Buy)</option>
              <option value="SELL">Jual (Sell)</option>
            </select>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-sm py-2 focus:outline-none text-gray-600" />
              <span className="text-gray-400">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-sm py-2 focus:outline-none text-gray-600" />
            </div>
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
            <Filter size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Tidak ada riwayat transaksi yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            {filteredTransactions.map((trx) => {
              const isUSD = isUSDAsset(trx.ticker);
              return (
                <div key={trx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl mr-4 ${trx.type === 'BUY' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {trx.type === 'BUY' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{trx.ticker}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(trx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trx.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                      {trx.type === 'BUY' ? '-' : '+'} {isUSD ? '$' : 'Rp'} {trx.totalValue.toLocaleString(isUSD ? 'en-US' : 'id-ID', { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{trx.amount} unit @ {trx.price.toLocaleString(isUSD ? 'en-US' : 'id-ID')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}