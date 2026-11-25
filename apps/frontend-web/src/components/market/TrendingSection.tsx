import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  onAssetClick: (ticker: string, name: string) => void;
}

export default function TrendingSection({ onAssetClick }: Props) {
  // Data statis untuk ilustrasi (nantinya bisa disambung ke API)
  const gainers = [
    { ticker: 'GOTO.JK', name: 'GoTo Gojek', change: '+12.4%', price: 'Rp 72' },
    { ticker: 'ARTO.JK', name: 'Bank Jago', change: '+8.2%', price: 'Rp 2,850' },
    { ticker: 'AMMN.JK', name: 'Amman Mineral', change: '+5.1%', price: 'Rp 8,400' },
  ];
  
  const losers = [
    { ticker: 'BREN.JK', name: 'Barito Renewables', change: '-6.5%', price: 'Rp 7,200' },
    { ticker: 'TSLA', name: 'Tesla Inc.', change: '-4.1%', price: '$ 175.2' },
    { ticker: 'PGAS.JK', name: 'Perusahaan Gas', change: '-3.8%', price: 'Rp 1,120' },
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Trending Hari Ini</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TOP GAINERS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4 text-green-500">
            <TrendingUp size={20} className="mr-2" />
            <h3 className="font-bold text-gray-900">Top Gainers</h3>
          </div>
          <div className="flex flex-col space-y-3">
            {gainers.map(asset => (
              <button key={asset.ticker} onClick={() => onAssetClick(asset.ticker, asset.name)} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition text-left">
                <div>
                  <p className="font-bold text-sm text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-500">{asset.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">{asset.price}</p>
                  <p className="text-xs font-bold text-green-500">{asset.change}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TOP LOSERS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4 text-red-500">
            <TrendingDown size={20} className="mr-2" />
            <h3 className="font-bold text-gray-900">Top Losers</h3>
          </div>
          <div className="flex flex-col space-y-3">
            {losers.map(asset => (
              <button key={asset.ticker} onClick={() => onAssetClick(asset.ticker, asset.name)} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition text-left">
                <div>
                  <p className="font-bold text-sm text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-500">{asset.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">{asset.price}</p>
                  <p className="text-xs font-bold text-red-500">{asset.change}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}