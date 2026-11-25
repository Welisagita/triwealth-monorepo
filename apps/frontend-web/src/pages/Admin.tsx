import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, BookCheck, AlertCircle, Wallet, Activity, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';

// Import Komponen
import UsersTable from '../components/admin/UsersTable';
import EducationTable from '../components/admin/EducationTable';
import UserDetail from '../components/admin/UserDetail'; 
import EducationForm from '../components/admin/EducationForm'; 
import AdminsTable from '../components/admin/AdminsTable'; // <-- Import komponen baru
import { API_URL } from '../config/api';

export default function Admin() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ name: 'Memuat...', email: 'memuat...', role: 'USER' });
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [statsData, setStatsData] = useState({ totalUsers: 0, totalEducation: 0, kycPending: 0, totalAum: 0, recentTransactions: [] });
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);

  // State Tab & Sub-View (Tambah ADMINS)
  const [activeTab, setActiveTab] = useState<'PANEL' | 'USERS' | 'EDUCATION' | 'ADMINS'>('PANEL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // State Mode CMS Edukasi ('NONE' | 'CREATE' | 'EDIT')
  const [educationFormMode, setEducationFormMode] = useState<'NONE' | 'CREATE' | 'EDIT'>('NONE');
  const [selectedEducation, setSelectedEducation] = useState<any>(null); 
  const [isSubmittingEdu, setIsSubmittingEdu] = useState(false);

  // State Modal Tambah Admin
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // State Filter Data Pengguna
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // State Filter Edukasi
  const [eduSearchTerm, setEduSearchTerm] = useState('');
  const [eduTypeFilter, setEduTypeFilter] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduPage, setEduPage] = useState(1);
  const [eduLimit, setEduLimit] = useState(10);
  const [eduTotalPages, setEduTotalPages] = useState(1);
  const [eduTotalCount, setEduTotalCount] = useState(0);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userRes = await axios.get(`${API_URL}/api/v1/users/${payload.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const currentUser = userRes.data.data;
      setUserData({ name: currentUser.name, email: currentUser.email, role: currentUser.role });

      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        alert("Akses Ditolak. Halaman ini khusus Administrator.");
        navigate('/dashboard');
        return;
      }

      // Bangun parameter query untuk tabel Pengguna
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // Bangun parameter query untuk tabel Edukasi
      const eduParams = new URLSearchParams();
      eduParams.append('page', eduPage.toString());
      eduParams.append('limit', eduLimit.toString());
      if (eduSearchTerm) eduParams.append('search', eduSearchTerm);
      if (eduTypeFilter) eduParams.append('type', eduTypeFilter);
      if (eduStartDate) eduParams.append('startDate', eduStartDate);
      if (eduEndDate) eduParams.append('endDate', eduEndDate);

      // Fetch Data Paralel
      const apiCalls = [
        axios.get(`${API_URL}/api/v1/users?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/education?${eduParams.toString()}`),
        axios.get(`${API_URL}/api/v1/users/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ];

      // Jika SUPERADMIN, ambil juga daftar Admin
      if (currentUser.role === 'SUPERADMIN') {
        apiCalls.push(axios.get(`${API_URL}/api/v1/users/admins`, { headers: { Authorization: `Bearer ${token}` } }));
      }

      const responses = await Promise.all(apiCalls);
      
      const allUsersRes = responses[0];
      const eduRes = responses[1];
      const statsRes = responses[2];

      setUsersList(allUsersRes.data.data || []);
      setTotalPages(allUsersRes.data.meta.totalPages);
      setTotalUsersCount(allUsersRes.data.meta.total);
      
      setEducations(eduRes.data.data || []);
      setEduTotalPages(eduRes.data.meta?.totalPages || 1);
      setEduTotalCount(eduRes.data.meta?.total || (eduRes.data.data || []).length);

      // Set Statistik Baru
      setStatsData(statsRes.data.data);

      if (currentUser.role === 'SUPERADMIN' && responses[3]) {
        setAdminsList(responses[3].data.data || []);
      }

    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    navigate, page, limit, searchTerm, statusFilter, startDate, endDate,
    eduPage, eduLimit, eduSearchTerm, eduTypeFilter, eduStartDate, eduEndDate
  ]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchData(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  // --- FUNGSI ADMIN ---
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    try {
      await axios.post(`${API_URL}/api/v1/users/register`, adminFormData, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setIsAdminModalOpen(false);
      setAdminFormData({ name: '', email: '', password: '', role: 'ADMIN' });
      fetchData();
      alert("Admin berhasil ditambahkan!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambahkan admin");
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Hapus pengguna ini secara permanen?")) return;
    try { 
      await axios.delete(`${API_URL}/api/v1/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); 
      fetchData(); 
    } catch (error) { alert("Gagal menghapus pengguna."); }
  };

  // --- FUNGSI EDUKASI ---
  const handleOpenEduForm = (item?: any) => {
    if (item) { setSelectedEducation(item); setEducationFormMode('EDIT'); } 
    else { setSelectedEducation(null); setEducationFormMode('CREATE'); }
  };
  const handleCloseEduForm = () => { setEducationFormMode('NONE'); setSelectedEducation(null); };

  const handleSaveEducation = async (payload: any) => {
    setIsSubmittingEdu(true);
    try {
      const token = localStorage.getItem('token');
      if (educationFormMode === 'CREATE') await axios.post(`${API_URL}/api/v1/education`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.put(`${API_URL}/api/v1/education/${selectedEducation.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      handleCloseEduForm(); fetchData(); 
    } catch (error) { alert("Terjadi kesalahan saat menyimpan materi edukasi."); } 
    finally { setIsSubmittingEdu(false); }
  };
  const handleDeleteEducation = async (id: string) => {
    if (!window.confirm("Hapus materi edukasi ini permanen?")) return;
    try { await axios.delete(`${API_URL}/api/v1/education/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); fetchData(); } 
    catch (error) { console.error(error); }
  };

  if (isLoading && activeTab === 'PANEL') return <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">Memuat Admin Panel...</div>;

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans relative">
      
      {/* Modal Tambah Admin */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Tambah Admin / Staf</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input type="text" required value={adminFormData.name} onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Akses</label>
                <input type="email" required value={adminFormData.email} onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Default</label>
                <input type="password" required minLength={6} value={adminFormData.password} onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role (Kasta)</label>
                <select value={adminFormData.role} onChange={(e) => setAdminFormData({...adminFormData, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none">
                  <option value="ADMIN">Admin (Akses Standar)</option>
                  <option value="SUPERADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>
              <button disabled={isSubmittingAdmin} type="submit" className="w-full font-bold py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white transition mt-4">
                {isSubmittingAdmin ? 'Menambahkan...' : 'Simpan Admin Baru'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Sidebar userRole={userData.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <TopHeader 
          userData={userData} 
          leftContent={
            <nav className="flex space-x-2 text-sm font-medium bg-gray-100 p-1 rounded-full overflow-x-auto">
              <button onClick={() => {setActiveTab('PANEL'); setSelectedUserId(null); handleCloseEduForm();}} className={`px-5 py-2 rounded-full whitespace-nowrap transition ${activeTab === 'PANEL' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Admin Panel</button>
              <button onClick={() => {setActiveTab('USERS'); setSelectedUserId(null); handleCloseEduForm();}} className={`px-5 py-2 rounded-full whitespace-nowrap transition ${activeTab === 'USERS' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Data Pengguna</button>
              <button onClick={() => {setActiveTab('EDUCATION'); setSelectedUserId(null); handleCloseEduForm();}} className={`px-5 py-2 rounded-full whitespace-nowrap transition ${activeTab === 'EDUCATION' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Manajemen Modul</button>
              {/* Tab Khusus Super Admin */}
              {userData.role === 'SUPERADMIN' && (
                <button onClick={() => {setActiveTab('ADMINS'); setSelectedUserId(null); handleCloseEduForm();}} className={`px-5 py-2 rounded-full whitespace-nowrap transition ${activeTab === 'ADMINS' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Tim Admin</button>
              )}
            </nav>
          }
        />

        <main className="flex-1 overflow-y-auto px-8 py-8">
          
          {!selectedUserId && educationFormMode === 'NONE' && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">Pusat Kendali Sistem</h1>
              <p className="text-gray-500 mt-1">Pantau performa, pengguna, dan aktivitas secara real-time.</p>
            </div>
          )}

          <div className="space-y-8">
            
            {/* TAB PANEL (STATISTIK 4 KARTU + AKTIVITAS) */}
            {activeTab === 'PANEL' && !selectedUserId && educationFormMode === 'NONE' && (
              <div className="animate-in fade-in duration-300 space-y-8">
                
                {/* 4 Kartu Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center text-gray-500 text-sm font-medium mb-3"><Users size={18} className="mr-2"/> Total Pengguna</div>
                    <h3 className="text-3xl font-bold text-gray-900">{statsData.totalUsers} User</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center text-gray-500 text-sm font-medium mb-3"><BookCheck size={18} className="mr-2"/> Modul Edukasi</div>
                    <h3 className="text-3xl font-bold text-gray-900">{statsData.totalEducation} Materi</h3>
                  </div>
                  <div className={`p-6 rounded-3xl shadow-sm border flex flex-col justify-center transition-colors ${statsData.kycPending > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                    <div className={`flex items-center text-sm font-medium mb-3 ${statsData.kycPending > 0 ? 'text-red-500' : 'text-gray-500'}`}><AlertCircle size={18} className="mr-2"/> Antrean Verifikasi KYC</div>
                    <h3 className={`text-3xl font-bold ${statsData.kycPending > 0 ? 'text-red-700' : 'text-gray-900'}`}>{statsData.kycPending} Akun</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center bg-linear-to-br from-[#B5F54B]/10 to-transparent">
                    <div className="flex items-center text-gray-700 text-sm font-medium mb-3"><Wallet size={18} className="mr-2"/> Total Kas (AUM)</div>
                    <h3 className="text-2xl font-bold text-gray-900">Rp {statsData.totalAum.toLocaleString('id-ID')}</h3>
                  </div>
                </div>

                {/* Tabel Aktivitas Live */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center mb-6 border-b border-gray-50 pb-4">
                    <Activity className="mr-2 text-blue-500" size={20}/> Aktivitas Transaksi Terbaru
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-gray-500 bg-gray-50/50">
                        <tr>
                          <th className="px-4 py-3 font-medium">Pengguna</th>
                          <th className="px-4 py-3 font-medium">Tipe</th>
                          <th className="px-4 py-3 font-medium">Aset (Ticker)</th>
                          <th className="px-4 py-3 font-medium">Nilai Transaksi</th>
                          <th className="px-4 py-3 font-medium text-right">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {statsData.recentTransactions && statsData.recentTransactions.length > 0 ? (
                          statsData.recentTransactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-4 font-bold text-gray-900">{tx.userName}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${tx.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-medium text-gray-700">{tx.ticker}</td>
                              <td className="px-4 py-4 font-bold text-gray-900">Rp {tx.totalValue.toLocaleString('id-ID')}</td>
                              <td className="px-4 py-4 text-gray-500 text-right text-xs">
                                {new Date(tx.createdAt).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} className="py-6 text-center text-gray-500">Belum ada aktivitas transaksi.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB LAINNYA */}
            {activeTab === 'USERS' && !selectedUserId && (
              <UsersTable usersList={usersList} onViewDetail={(id) => setSelectedUserId(id)} onDeleteUser={handleDeleteUser} searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} page={page} setPage={setPage} limit={limit} setLimit={setLimit} totalPages={totalPages} totalUsers={totalUsersCount} />
            )}

            {selectedUserId && (
              <UserDetail userId={selectedUserId} onBack={() => { setSelectedUserId(null); fetchData(); }} />
            )}

            {activeTab === 'EDUCATION' && educationFormMode === 'NONE' && (
              <EducationTable educations={educations} onOpenForm={handleOpenEduForm} onDelete={handleDeleteEducation} searchTerm={eduSearchTerm} setSearchTerm={setEduSearchTerm} typeFilter={eduTypeFilter} setTypeFilter={setEduTypeFilter} startDate={eduStartDate} setStartDate={setEduStartDate} endDate={eduEndDate} setEndDate={setEduEndDate} page={eduPage} setPage={setEduPage} limit={eduLimit} setLimit={setEduLimit} totalPages={eduTotalPages} totalItems={eduTotalCount} />
            )}

            {activeTab === 'EDUCATION' && educationFormMode !== 'NONE' && (
              <EducationForm initialData={selectedEducation} currentUser={userData} onSave={handleSaveEducation} onCancel={handleCloseEduForm} isSubmitting={isSubmittingEdu} />
            )}

            {activeTab === 'ADMINS' && userData.role === 'SUPERADMIN' && (
              <AdminsTable adminsList={adminsList} currentUserRole={userData.role} onOpenCreateAdmin={() => setIsAdminModalOpen(true)} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}