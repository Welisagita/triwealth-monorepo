import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from 'recharts';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

const TIME_PERIODS = [
  { label: '1H', value: '1d' },
  { label: '1M', value: '5d' },
  { label: '1B', value: '1mo' },
  { label: '3B', value: '3mo' },
  { label: '1T', value: '1y' },
];

interface Props {
  isLoading: boolean;
  quote: any;
  chartData: any[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isFaved: boolean;
  onToggleWatchlist: () => void;
  onOpenTrade: () => void;
}

export default function MarketChart({ isLoading, quote, chartData, selectedPeriod, onPeriodChange, isFaved, onToggleWatchlist, onOpenTrade }: Props) {
  const isPositive = quote?.changePercent >= 0;
  const chartColor = isPositive ? '#22c55e' : '#ef4444'; 

  return (
    <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-112.5">
      {isLoading ? (
        <div className="flex h-87.5 items-center justify-center text-gray-400 font-medium animate-pulse">
          Menganalisis pergerakan pasar...
        </div>
      ) : quote ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {quote.name} 
                <span className="text-gray-400 text-lg ml-2 mr-3 font-medium">{quote.ticker}</span>
                {/* Tombol Bintang */}
                <button onClick={onToggleWatchlist} className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${isFaved ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 bg-gray-50'}`}>
                  <Star size={22} fill={isFaved ? "currentColor" : "none"} strokeWidth={isFaved ? 0 : 2} />
                </button>
                {/* TOMBOL TRADE BARU */}
                <button 
                  onClick={onOpenTrade}
                  className="ml-4 px-5 py-1.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-all shadow-md transform hover:scale-105"
                >
                  Trade
                </button>
              </h2>
              
              <div className="flex items-center mt-2">
                <h3 className="text-4xl font-bold text-gray-900 mr-4">
                  {quote.currency === 'USD' ? '$' : 'Rp'}{quote.price.toLocaleString('en-US')}
                </h3>
                <div className={`flex items-center px-3 py-1.5 rounded-lg font-bold text-sm ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {isPositive ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
                  {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-xl self-start">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition ${selectedPeriod === period.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString('en-US')} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${quote.currency === 'USD' ? '$' : 'Rp'}${value.toLocaleString('en-US')}`, 'Harga']}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-gray-400 py-10">
          <p>Tidak dapat memuat instrumen ini.</p>
        </div>
      )}
    </div>
  );
}