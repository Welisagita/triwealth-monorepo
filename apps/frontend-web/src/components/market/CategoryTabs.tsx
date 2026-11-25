import type { RefObject } from 'react';
import { Star, Coins, Globe, MapPin, Briefcase, Shield, Landmark, ChevronLeft, ChevronRight } from 'lucide-react';

export const MARKET_CATEGORIES = [
  { id: 'watchlist', label: 'Watchlist Saya', icon: Star, color: 'text-yellow-500' },
  { id: 'crypto', label: 'Kripto', icon: Coins, color: 'text-orange-500' },
  { id: 'us_stock', label: 'Saham AS', icon: Globe, color: 'text-blue-500' },
  { id: 'id_stock', label: 'Saham Lokal', icon: MapPin, color: 'text-red-500' },
  { id: 'mutual_fund', label: 'Reksadana', icon: Briefcase, color: 'text-purple-500' },
  { id: 'sbn', label: 'SBN Retail', icon: Shield, color: 'text-emerald-500' },
  { id: 'bonds', label: 'Obligasi FR', icon: Landmark, color: 'text-indigo-500' },
];

interface Props {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: (direction: 'left' | 'right') => void;
}

export default function CategoryTabs({ activeCategory, onCategoryChange, scrollRef, onScroll }: Props) {
  return (
    <div className="relative flex items-center group">
      <button onClick={() => onScroll('left')} className="absolute left-0 z-10 p-1.5 bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 rounded-full text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 hidden md:block">
        <ChevronLeft size={18} />
      </button>
      
      <div ref={scrollRef} className="flex flex-nowrap overflow-x-auto gap-3 w-full py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {MARKET_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 flex items-center px-4 py-2.5 rounded-xl border transition-all ${
                isActive ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={`mr-2 ${isActive ? 'text-white' : cat.color}`} />
              <span className="font-bold text-sm">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <button onClick={() => onScroll('right')} className="absolute right-0 z-10 p-1.5 bg-white/90 backdrop-blur-sm shadow-md border border-gray-100 rounded-full text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity -mr-3 hidden md:block">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}