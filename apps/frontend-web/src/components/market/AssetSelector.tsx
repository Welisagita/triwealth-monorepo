import type { RefObject, SyntheticEvent } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: SyntheticEvent) => void;
  displayAssets: { ticker: string, name: string }[];
  selectedAsset: { ticker: string, name: string };
  onAssetSelect: (ticker: string, name: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: (direction: 'left' | 'right') => void;
}

export default function AssetSelector({
  searchInput, onSearchChange, onSearchSubmit, displayAssets, selectedAsset, onAssetSelect, scrollRef, onScroll
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-white p-2 pl-4 rounded-2xl border border-gray-100 shadow-sm relative group">
      
      <form onSubmit={onSearchSubmit} className="flex relative w-full lg:w-64 lg:border-r border-gray-100 lg:pr-4">
        <input 
          type="text" 
          placeholder="Cari ticker spesifik..." 
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-2 pr-10 py-2 bg-transparent focus:outline-none text-sm font-medium"
        />
        <button type="submit" className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-900 transition">
          <Search size={18} />
        </button>
      </form>

      <div className="flex-1 w-full relative flex items-center overflow-hidden">
        <button onClick={() => onScroll('left')} className="absolute left-0 z-10 p-1 bg-white/90 backdrop-blur-sm shadow-md rounded-full text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-2 w-full py-1 lg:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {displayAssets.length === 0 ? (
            <span className="text-sm text-gray-400 py-2 px-2 italic">Belum ada aset di kategori ini.</span>
          ) : (
            displayAssets.map((asset) => (
              <button
                key={asset.ticker}
                onClick={() => onAssetSelect(asset.ticker, asset.name)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedAsset?.ticker === asset.ticker ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {asset.name} <span className={`ml-1.5 text-xs font-normal ${selectedAsset?.ticker === asset.ticker ? 'text-blue-500' : 'text-gray-400'}`}>{asset.ticker}</span>
              </button>
            ))
          )}
        </div>

        <button onClick={() => onScroll('right')} className="absolute right-0 z-10 p-1 bg-white/90 backdrop-blur-sm shadow-md rounded-full text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}