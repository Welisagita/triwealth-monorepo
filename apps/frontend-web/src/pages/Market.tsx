import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { API_URL } from '../config/api';

// Impor 6 Komponen yang sudah dipecah
import CategoryTabs from '../components/market/CategoryTabs';
import AssetSelector from '../components/market/AssetSelector';
import MarketChart from '../components/market/MarketChart';
import TrendingSection from '../components/market/TrendingSection';
import PlaylistSection from '../components/market/PlaylistSection';
import ResearchSection from '../components/market/ResearchSection';
import TradeModal from '../components/market/TradeModal';
import PortfolioSection from '../components/market/PortfolioSection';

const ASSETS_DATA: Record<string, { ticker: string, name: string }[]> = {
  crypto: [
    { ticker: 'BTC-USD', name: 'Bitcoin' }, { ticker: 'ETH-USD', name: 'Ethereum' },
    { ticker: 'USDT-USD', name: 'Tether' }, { ticker: 'BNB-USD', name: 'Binance Coin' },
    { ticker: 'SOL-USD', name: 'Solana' }, { ticker: 'USDC-USD', name: 'USDC' },
    { ticker: 'XRP-USD', name: 'Ripple' }, { ticker: 'DOGE-USD', name: 'Dogecoin' }
  ],
  us_stock: [
    { ticker: 'AAPL', name: 'Apple' }, { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'NVDA', name: 'NVIDIA' }, { ticker: 'TSLA', name: 'Tesla' },
    { ticker: 'GOOGL', name: 'Alphabet' }, { ticker: 'AMZN', name: 'Amazon' }
  ],
  id_stock: [
    { ticker: 'BBCA.JK', name: 'BCA' }, { ticker: 'BBRI.JK', name: 'BRI' },
    { ticker: 'BMRI.JK', name: 'Mandiri' }, { ticker: 'BBNI.JK', name: 'BNI' },
    { ticker: 'TLKM.JK', name: 'Telkom' }, { ticker: 'ASII.JK', name: 'Astra Int.' }
  ],
  mutual_fund: [
    { ticker: 'SPY', name: 'SPDR S&P 500' }, { ticker: 'QQQ', name: 'Invesco QQQ' },
    { ticker: 'XIIT.JK', name: 'ETF Indo Premier' }, { ticker: 'XBNI.JK', name: 'BNI-AM ETF' }
  ],
  sbn: [
    { ticker: 'SR019', name: 'Sukuk Ritel 019' }, { ticker: 'SR018', name: 'Sukuk Ritel 018' }
  ],
  bonds: [
    { ticker: 'FR0091', name: 'FR0091' }, { ticker: 'FR0096', name: 'FR0096' }
  ]
};

export default function Market() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ id: '', name: 'Memuat...', email: '', role: 'USER' });
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
  
  const [activeCategory, setActiveCategory] = useState('crypto');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(ASSETS_DATA.crypto[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('1mo');
  
  const [quote, setQuote] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<{ticker: string, name: string}[]>([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const assetScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    axios.get(`${API_URL}/api/v1/users/${payload.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserData({ id: payload.id, name: res.data.data.name, email: res.data.data.email, role: res.data.data.role }))
      .catch(() => navigate('/login'));

    axios.get(`${API_URL}/api/v1/watchlist/${payload.id}`)
      .then(res => setWatchlist(res.data.data.map((item: any) => ({ ticker: item.ticker, name: item.name }))))
      .catch(err => console.error("Gagal memuat watchlist", err));
  }, [navigate]);

  useEffect(() => {
    if (!selectedAsset?.ticker) return; 
    const fetchMarketData = async () => {
      setIsLoading(true);
      try {
        const [quoteRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/market/quote/${selectedAsset.ticker}`),
          axios.get(`http://localhost:8000/api/v1/market/history/${selectedAsset.ticker}?period=${selectedPeriod}`)
        ]);
        setQuote(quoteRes.data);
        setChartData(historyRes.data.data);
      } catch (error) {
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMarketData();
  }, [selectedAsset.ticker, selectedPeriod]);

  useEffect(() => {
    const catElem = categoryScrollRef.current;
    const assetElem = assetScrollRef.current;

    const handleCatWheel = (e: globalThis.WheelEvent) => {
      if (catElem && e.deltaY !== 0) { e.preventDefault(); catElem.scrollLeft += e.deltaY; }
    };
    const handleAssetWheel = (e: globalThis.WheelEvent) => {
      if (assetElem && e.deltaY !== 0) { e.preventDefault(); assetElem.scrollLeft += e.deltaY; }
    };

    if (catElem) catElem.addEventListener('wheel', handleCatWheel, { passive: false });
    if (assetElem) assetElem.addEventListener('wheel', handleAssetWheel, { passive: false });

    return () => {
      if (catElem) catElem.removeEventListener('wheel', handleCatWheel);
      if (assetElem) assetElem.removeEventListener('wheel', handleAssetWheel);
    };
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const firstAsset = categoryId === 'watchlist' ? watchlist[0] : ASSETS_DATA[categoryId]?.[0];
    if (firstAsset) setSelectedAsset(firstAsset);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSelectedAsset({ ticker: searchInput.toUpperCase(), name: searchInput.toUpperCase() });
    setSearchInput('');
  };

  const toggleWatchlist = async () => {
    if (!userData.id || !quote) return;
    const isFaved = watchlist.some(item => item.ticker === quote.ticker);

    try {
      if (isFaved) {
        await axios.delete(`${API_URL}/api/v1/watchlist/${userData.id}/${quote.ticker}`);
        setWatchlist(prev => prev.filter(t => t.ticker !== quote.ticker));
      } else {
        await axios.post(`${API_URL}/api/v1/watchlist`, { userId: userData.id, ticker: quote.ticker, name: quote.name });
        setWatchlist(prev => [...prev, { ticker: quote.ticker, name: quote.name }]);
      }
    } catch (error) {
      console.error("Gagal mengupdate watchlist", error);
    }
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    const container = ref.current;
    if (!container) return; 
    container.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const isFaved = quote ? watchlist.some(item => item.ticker === quote.ticker) : false;
  const displayAssets = activeCategory === 'watchlist' ? watchlist : ASSETS_DATA[activeCategory];

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans">
      <Sidebar userRole={userData.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          userData={userData}
          leftContent={
            <nav className="flex space-x-2 text-sm font-medium bg-gray-100 p-1 rounded-full">
              <button 
                onClick={() => setActiveTab('market')}
                className={`px-5 py-2 rounded-full transition ${activeTab === 'market' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Eksplorasi Pasar
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`px-5 py-2 rounded-full transition ${activeTab === 'portfolio' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Portofolio Saya
              </button>
            </nav>
          }
        />

        <main className="flex-1 overflow-y-auto px-8 py-8">
          {activeTab === 'market' ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pasar Finansial</h1>
                <p className="text-gray-500 mt-1">Jelajahi dan analisis berbagai instrumen investasi di satu tempat.</p>
              </div>

              <div className="flex flex-col space-y-5">
                <CategoryTabs 
                  activeCategory={activeCategory} 
                  onCategoryChange={handleCategoryChange} 
                  scrollRef={categoryScrollRef} 
                  onScroll={(dir) => scrollContainer(categoryScrollRef, dir)} 
                />

                <AssetSelector 
                  searchInput={searchInput} 
                  onSearchChange={setSearchInput} 
                  onSearchSubmit={handleSearchSubmit} 
                  displayAssets={displayAssets} 
                  selectedAsset={selectedAsset} 
                  onAssetSelect={(ticker, name) => setSelectedAsset({ ticker, name })} 
                  scrollRef={assetScrollRef} 
                  onScroll={(dir) => scrollContainer(assetScrollRef, dir)} 
                />

                <MarketChart 
                  isLoading={isLoading} 
                  quote={quote} 
                  chartData={chartData} 
                  selectedPeriod={selectedPeriod} 
                  onPeriodChange={setSelectedPeriod} 
                  isFaved={isFaved} 
                  onToggleWatchlist={toggleWatchlist} 
                  onOpenTrade={() => setIsTradeModalOpen(true)}
                />

                <TrendingSection onAssetClick={(ticker, name) => setSelectedAsset({ ticker, name })} />
                <PlaylistSection onAssetClick={(ticker, name) => setSelectedAsset({ ticker, name })} />
                <ResearchSection />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Portofolio Saya</h1>
                <p className="text-gray-500 mt-1">Pantau perkembangan kekayaan dan riwayat transaksi simulasi Anda.</p>
              </div>
              
              {/* PENAMBAHAN PROP onTradeAsset DI SINI */}
              <PortfolioSection 
                onTradeAsset={(ticker, name) => {
                  setSelectedAsset({ ticker, name }); // Ubah aset aktif di background
                  setIsTradeModalOpen(true);          // Munculkan Modal Trade
                }} 
              />
            </div>
          )}

          {/* TRADE MODAL DITARUH DI LUAR KONDISIONAL TAB AGAR BISA DIAKSES DARI KEDUANYA */}
          <TradeModal 
            isOpen={isTradeModalOpen} 
            onClose={() => setIsTradeModalOpen(false)} 
            userData={userData} 
            quote={quote}
            activeCategory={activeCategory === 'watchlist' ? 'crypto' : activeCategory} 
          />
        </main>
      </div>
    </div>
  );
}