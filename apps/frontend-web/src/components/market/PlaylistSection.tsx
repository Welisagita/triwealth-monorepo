import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface Props {
  onAssetClick: (ticker: string, name: string) => void;
}

const PLAYLISTS = [
  { id: 'dividen', title: 'Top Dividen', bg: 'bg-orange-100', icon: '💰', colSpan: 'col-span-2 row-span-2', desc: 'Perusahaan mapan yang rutin membagikan sebagian besar keuntungannya kepada pemegang saham.', stocks: [{t: 'ITMG.JK', n: 'Indo Tambangraya'}, {t: 'PTBA.JK', n: 'Bukit Asam'}, {t: 'ADRO.JK', n: 'Adaro Energy'}] },
  { id: 'buffett', title: 'Metode Buffett', bg: 'bg-stone-100', icon: '👴', colSpan: 'col-span-2', desc: 'Saham dengan fundamental kuat dan keunggulan kompetitif jangka panjang ala Warren Buffett.', stocks: [{t: 'BBCA.JK', n: 'Bank BCA'}, {t: 'ASII.JK', n: 'Astra International'}] },
  { id: 'cashrich', title: 'Cash Rich', bg: 'bg-green-100', icon: '🏢', colSpan: 'col-span-2 row-span-2', desc: 'Perusahaan dengan tumpukan uang kas melimpah, siap menghadapi krisis ekonomi.', stocks: [{t: 'SIDO.JK', n: 'Sido Muncul'}, {t: 'HMSP.JK', n: 'HM Sampoerna'}] },
  { id: 'greenblatt', title: 'Metode Greenblatt', bg: 'bg-teal-50', icon: '🎩', colSpan: 'col-span-2', desc: 'Kombinasi saham murah namun memiliki tingkat pengembalian modal (ROIC) yang tinggi.', stocks: [{t: 'UNTR.JK', n: 'United Tractors'}, {t: 'INDF.JK', n: 'Indofood'}] },
  { id: 'growth', title: 'Pertumbuhan Pesat', bg: 'bg-pink-100', icon: '🚀', colSpan: 'col-span-2', desc: 'Saham dari sektor inovatif dengan target pertumbuhan pendapatan dua digit per tahun.', stocks: [{t: 'AMMN.JK', n: 'Amman Mineral'}, {t: 'NVDA', n: 'NVIDIA'}] },
  { id: 'timeless', title: 'Timeless Stock', bg: 'bg-blue-50', icon: '🕰️', colSpan: 'col-span-2 row-span-2', desc: 'Produknya akan selalu digunakan masyarakat sampai puluhan tahun ke depan.', stocks: [{t: 'ICBP.JK', n: 'Indofood CBP'}, {t: 'MYOR.JK', n: 'Mayora'}] },
];

export default function PlaylistSection({ onAssetClick }: Props) {
  const [activeModal, setActiveModal] = useState<any>(null);

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Playlist Investasi</h2>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {PLAYLISTS.map((list) => (
          <button 
            key={list.id} 
            onClick={() => setActiveModal(list)}
            className={`${list.bg} ${list.colSpan} p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:shadow-md transition-all transform hover:-translate-y-1 border border-black/5`}
          >
            <span className="text-4xl mb-3">{list.icon}</span>
            <span className="font-bold text-gray-800 text-sm">{list.title}</span>
          </button>
        ))}
      </div>

      {/* Modal Pop-up */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className={`${activeModal.bg} p-6 flex justify-between items-start`}>
              <div>
                <span className="text-4xl">{activeModal.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{activeModal.title}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 bg-white/50 hover:bg-white rounded-full transition">
                <X size={20} className="text-gray-700" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{activeModal.desc}</p>
              <h4 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider">Daftar Aset</h4>
              
              <div className="flex flex-col space-y-2">
                {activeModal.stocks.map((stock: any) => (
                  <button 
                    key={stock.t}
                    onClick={() => {
                      onAssetClick(stock.t, stock.n);
                      setActiveModal(null); // Tutup modal saat aset dipilih
                    }}
                    className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-left group"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{stock.n}</p>
                      <p className="text-xs text-gray-500">{stock.t}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-900 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}