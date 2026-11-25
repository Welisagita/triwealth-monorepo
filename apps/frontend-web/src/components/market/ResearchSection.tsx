export default function ResearchSection() {
  const news = [
    { id: 1, category: 'Makro Ekonomi', time: '2 jam yang lalu', title: 'The Fed Menahan Suku Bunga, Sektor Teknologi Merespon Positif' },
    { id: 2, category: 'Laporan Keuangan', time: '5 jam yang lalu', title: 'Laba Bersih Perbankan Big 4 Catat Rekor Tertinggi Kuartal Ini' },
    { id: 3, category: 'Kripto', time: '12 jam yang lalu', title: 'Bitcoin Halving Tinggal Menghitung Hari, Ini Proyeksi Analis' },
    { id: 4, category: 'Komoditas', time: '1 hari yang lalu', title: 'Harga Emas Antam Meroket Tembus Rp 1,2 Juta per Gram' },
  ];

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Riset & Berita Pasar</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {news.map(item => (
          <div key={item.id} className="shrink-0 w-72 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{item.category}</span>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}