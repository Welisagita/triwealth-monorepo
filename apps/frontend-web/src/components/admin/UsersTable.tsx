import { ShieldAlert, Eye, Trash2, Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersTableProps {
  usersList: any[];
  onViewDetail: (id: string) => void;
  onDeleteUser: (id: string) => void;
  // Kontrol Filter & Pagination
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  page: number;
  setPage: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
  totalPages: number;
  totalUsers: number;
}

export default function UsersTable({ 
  usersList, onViewDetail, onDeleteUser,
  searchTerm, setSearchTerm, statusFilter, setStatusFilter,
  startDate, setStartDate, endDate, setEndDate,
  page, setPage, limit, setLimit, totalPages, totalUsers
}: UsersTableProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
      
      {/* HEADER TAbel & KONTROL FILTER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b border-gray-50 pb-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center min-w-max">
          <ShieldAlert className="mr-2 text-gray-400" size={20}/> Basis Data Pengguna
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          {/* Pencarian */}
          <div className="relative grow sm:grow-0 min-w-50">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama pengguna..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none text-sm"
            />
          </div>
          
          {/* Filter Status KYC */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
              <option value="PENDING">Pending (Belum Upload)</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          {/* Filter Tanggal */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="text-gray-400" size={16} />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-600"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* ISI TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="px-4 py-3 font-medium">Nama & Email</th>
              <th className="px-4 py-3 font-medium">Tanggal Gabung</th>
              <th className="px-4 py-3 font-medium">Profil Risiko</th>
              <th className="px-4 py-3 font-medium">Kas (Buying Power)</th>
              <th className="px-4 py-3 font-medium">Status KYC</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersList.length > 0 ? (
              usersList.map((user: any) => {
                // BACA LANGSUNG DARI totalBalance YANG DIKIRIM BACKEND
                const balance = user.totalBalance !== undefined ? user.totalBalance : 0;
                
                return (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden mr-3">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="avatar"/>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      {user.riskProfile}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900">
                      Rp {balance.toLocaleString('id-ID')}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                      user.kycStatus === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' : 
                      user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.kycStatus ? user.kycStatus.replace('_', ' ') : 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => onViewDetail(user.id)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition shadow-sm" title="Lihat Detail">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition shadow-sm" title="Hapus Akun">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})
            ) : (
              <tr><td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada data pengguna yang sesuai filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER TABEL: LIMIT & PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-100 gap-4">
        
        {/* Limit Dropdown */}
        <div className="flex items-center text-sm text-gray-500">
          Tampilkan
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="mx-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#B5F54B]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          data. (Total: {totalUsers})
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm font-medium text-gray-700 px-2">
            Halaman {page} dari {totalPages || 1}
          </span>
          
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}