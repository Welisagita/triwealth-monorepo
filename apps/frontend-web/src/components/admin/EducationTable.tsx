import { Plus, Edit2, Trash2, BookOpen, Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface EducationTableProps {
  educations: any[];
  onOpenForm: (item?: any) => void;
  onDelete: (id: string) => void;
  // State Filter & Pagination
  searchTerm: string; setSearchTerm: (val: string) => void;
  typeFilter: string; setTypeFilter: (val: string) => void;
  startDate: string; setStartDate: (val: string) => void;
  endDate: string; setEndDate: (val: string) => void;
  page: number; setPage: (val: number) => void;
  limit: number; setLimit: (val: number) => void;
  totalPages: number; totalItems: number;
}

export default function EducationTable({ 
  educations, onOpenForm, onDelete,
  searchTerm, setSearchTerm, typeFilter, setTypeFilter,
  startDate, setStartDate, endDate, setEndDate,
  page, setPage, limit, setLimit, totalPages, totalItems
}: EducationTableProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
      
      {/* HEADER & KONTROL FILTER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b border-gray-50 pb-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center min-w-max">
          <BookOpen className="mr-2 text-gray-400" size={20}/> Manajemen Modul Edukasi
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          {/* Pencarian */}
          <div className="relative grow sm:grow-0 min-w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari judul atau penulis..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none text-sm"
            />
          </div>
          
          {/* Filter Tipe */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="ARTICLE">Artikel</option>
              <option value="VIDEO">Video</option>
              <option value="QUIZ">Kuis</option>
            </select>
          </div>

          {/* Filter Tanggal Publish */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="text-gray-400" size={16} />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-600"/>
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-sm text-gray-600"/>
          </div>

          <button onClick={() => onOpenForm()} className="bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl flex items-center transition shadow-sm ml-2">
            <Plus size={18} className="mr-2"/> Tambah Materi CMS
          </button>
        </div>
      </div>
      
      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 bg-gray-50/50">
            <tr>
              <th className="px-4 py-3 font-medium">Judul Materi</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">XP Reward</th>
              <th className="px-4 py-3 font-medium">Penulis</th>
              <th className="px-4 py-3 font-medium">Tgl Publish</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {educations.length > 0 ? (
              educations.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition group">
                  <td className="px-4 py-4 font-bold text-gray-900 max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">{item.type}</span></td>
                  <td className="px-4 py-4"><span className="text-green-700 font-bold bg-green-50 px-2 py-1 rounded-md">+{item.xpReward} XP</span></td>
                  <td className="px-4 py-4 text-gray-600 font-medium">{item.authorName || 'Sistem Admin'}</td>
                  <td className="px-4 py-4 text-gray-500 text-xs">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => onOpenForm(item)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition shadow-sm"><Edit2 size={16}/></button>
                      <button onClick={() => onDelete(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada materi yang sesuai filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-100 gap-4">
        <div className="flex items-center text-sm text-gray-500">
          Tampilkan
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="mx-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#B5F54B]">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          data. (Total: {totalItems})
        </div>

        <div className="flex items-center space-x-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-700 px-2">Halaman {page} dari {totalPages || 1}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}