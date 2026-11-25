import React, { useState, useEffect, useMemo } from 'react'; // <-- PERBAIKAN 1: Tambahkan 'React' di sini
import { useNavigate } from 'react-router-dom'; // <-- PERBAIKAN 2: Hapus 'Link' yang tidak terpakai
import axios from 'axios';
import { 
  Wallet, ArrowDownToLine, ArrowUpFromLine, Activity,
  TrendingUp, ArrowRightLeft, X, Loader2
} from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { API_URL } from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State Data Portofolio
  const [userData, setUserData] = useState({ id: '', name: 'Memuat...', email: '', role: 'USER' });
  const [portfolioData, setPortfolioData] = useState<{ portfolio: any, positions: any[] } | null>(null);
  const [usdRate, setUsdRate] = useState<number>(15500);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Kas (Deposit / Withdraw)
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashAction, setCashAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [cashAmount, setCashAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Live Market
  const [liveMarket, setLiveMarket] = useState<any[]>([]);
  const [isMarketLoading, setIsMarketLoading] = useState(true);

  // Fetch Data Utama
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const [userRes, rateRes, portRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/users/${payload.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://open.er-api.com/v6/latest/USD').catch(() => null),
        axios.get(`${API_URL}/api/v1/portfolios/full-data`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setUserData({ id: payload.id, ...userRes.data.data });
      if (rateRes?.data?.rates?.IDR) setUsdRate(rateRes.data.rates.IDR);
      setPortfolioData(portRes.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Live Market
  useEffect(() => {
    fetchData();
    const fetchMarketData = async () => {
      try {
        const tickers = ['BTC-USD', 'AAPL', 'BBCA.JK'];
        const promises = tickers.map(ticker => axios.get(`http://localhost:8000/api/v1/market/quote/${ticker}`));
        const results = await Promise.all(promises);
        setLiveMarket(results.map(res => res.data));
      } catch (error) {
        console.error("Gagal mengambil data pasar", error);
      } finally {
        setIsMarketLoading(false);
      }
    };
    fetchMarketData();
  }, [navigate]);

  // Handle Transaksi Kas
  const handleCashTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashAmount || cashAmount <= 0) return;

    const token = localStorage.getItem('token');
    setIsSubmitting(true);
    
    try {
      const endpoint = cashAction === 'DEPOSIT' ? 'topup' : 'withdraw';
      await axios.post(`${API_URL}/api/v1/portfolios/${endpoint}`, 
        { amount: Number(cashAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsCashModalOpen(false);
      setCashAmount('');
      fetchData(); // Refresh data saldo
    } catch (error: any) {
      alert(error.response?.data?.message || "Transaksi gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCashModal = (action: 'DEPOSIT' | 'WITHDRAW') => {
    setCashAction(action);
    setCashAmount('');
    setIsCashModalOpen(true);
  };

  // Kalkulasi Kekayaan
  const getExchangeRate = (ticker: string) => (ticker.includes('-USD') || (!ticker.includes('.JK') && ticker.length <= 5)) ? usdRate : 1;
  
  const totalAssetValueIDR = useMemo(() => {
    if (!portfolioData) return 0;
    return portfolioData.positions.reduce((acc, pos) => acc + (pos.amount * pos.averagePrice * getExchangeRate(pos.ticker)), 0);
  }, [portfolioData, usdRate]);

  const balance = portfolioData?.portfolio?.balance || 0;
  const totalWealth = balance + totalAssetValueIDR;

  // Data Pie Chart
  const pieData = useMemo(() => {
    if (!portfolioData) return [];
    const data = portfolioData.positions.map(pos => ({
      name: pos.ticker,
      value: pos.amount * pos.averagePrice * getExchangeRate(pos.ticker)
    }));
    // Tambahkan Kas ke dalam Pie Chart
    if (balance > 0) data.push({ name: 'Kas (IDR)', value: balance });
    return data;
  }, [portfolioData, balance, usdRate]);

  const COLORS = ['#B5F54B', '#111827', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA] text-gray-500">Memuat Dashboard...</div>;

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans relative">
      
      {/* MODAL KELOLA KAS */}
      {isCashModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsCashModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Kelola Saldo Kas</h2>
            
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button type="button" onClick={() => setCashAction('DEPOSIT')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${cashAction === 'DEPOSIT' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Deposit</button>
              <button type="button" onClick={() => setCashAction('WITHDRAW')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${cashAction === 'WITHDRAW' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tarik Dana</button>
            </div>

            <form onSubmit={handleCashTransaction} className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                  <span className="text-xs text-gray-500 font-medium">Saldo: Rp {balance.toLocaleString('id-ID')}</span>
                </div>
                <input 
                  type="number" required min="10000" value={cashAmount} onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                  placeholder="0"
                />
              </div>
              <button disabled={isSubmitting || (cashAction === 'WITHDRAW' && Number(cashAmount) > balance)} type="submit" className={`w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition text-white ${cashAction === 'DEPOSIT' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-400 disabled:cursor-not-allowed`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Konfirmasi ${cashAction === 'DEPOSIT' ? 'Deposit' : 'Penarikan'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      <Sidebar userRole={userData.role}/>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader userData={userData} leftContent={<span className="font-bold text-gray-400">Dashboard Utama</span>} />

        <main className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Selamat datang, {userData.name.split(' ')[0]}</h1>
            <p className="text-gray-500 mt-1">Ini adalah ringkasan eksekutif dari seluruh portofolio investasi Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: HERO WEALTH SUMMARY */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
                <div className="relative z-10">
                  <span className="text-gray-400 font-medium mb-2 block">Total Kekayaan Bersih</span>
                  <h2 className="text-4xl md:text-5xl font-black mb-8">Rp {totalWealth.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</h2>
                  
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Kas (Buying Power)</p>
                      <p className="text-xl font-bold text-green-400">Rp {balance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Aset Terinvestasi</p>
                      <p className="text-xl font-bold text-blue-400">Rp {totalAssetValueIDR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => openCashModal('DEPOSIT')} className="flex-1 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition shadow-sm">
                      <ArrowDownToLine size={18} className="mr-2" /> Deposit Kas
                    </button>
                    <button onClick={() => openCashModal('WITHDRAW')} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition border border-gray-700">
                      <ArrowUpFromLine size={18} className="mr-2" /> Tarik Dana
                    </button>
                  </div>
                </div>
              </div>

              {/* PIE CHART ALOKASI ASET */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Alokasi Portofolio</h3>
                  <p className="text-sm text-gray-500 mb-4">Distribusi kekayaan Anda di berbagai instrumen dan kas.</p>
                  
                  {pieData.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Belum ada data untuk ditampilkan.</p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData.map((item, index) => ({
                              ...item,
                              fill: COLORS[index % COLORS.length],
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          />
                          <Tooltip
                            formatter={(value) =>
                              typeof value === 'number'
                                ? `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
                                : String(value ?? '')
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: QUICK ACTION & LIVE MARKET */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* TOMBOL TRADING */}
              <div className="bg-linear-to-br from-[#B5F54B] to-[#98d438] p-6 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition transform hover:-translate-y-1" onClick={() => navigate('/market')}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/30 rounded-2xl"><TrendingUp size={24} className="text-gray-900" /></div>
                  <ArrowRightLeft size={20} className="text-gray-800" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Mulai Trading</h3>
                <p className="text-sm text-gray-800 font-medium">Beli/Jual saham & kripto di Pasar Finansial.</p>
              </div>

              {/* WIDGET LIVE MARKET */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                  <Activity className="text-blue-500 mr-2" size={20} />
                  <h3 className="font-bold text-gray-900">Pasar Hari Ini</h3>
                </div>
                
                {isMarketLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-gray-100 rounded-xl"></div>)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveMarket.map((asset, index) => (
                      <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition cursor-default border border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{asset.ticker}</p>
                          <p className="text-xs text-gray-500 truncate max-w-25" title={asset.name}>{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{asset.currency === 'USD' ? '$' : 'Rp'}{asset.price.toLocaleString('en-US')}</p>
                          <p className={`text-xs font-bold ${asset.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button onClick={() => navigate('/market')} className="w-full mt-4 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition">
                  Lihat Semua Market
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}