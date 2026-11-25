import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, User, ShieldCheck, FileText, Save, Loader2, 
  ExternalLink, Activity, Wallet, History, TrendingUp, TrendingDown 
} from 'lucide-react';
import { API_URL } from '../../config/api';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
}

export default function UserDetail({ userId, onBack }: UserDetailProps) {
  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State (Hanya status KYC dan Admin Note yang bisa diedit)
  const [formData, setFormData] = useState({ kycStatus: '', adminNote: '' });

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        // Tambahkan timestamp untuk mencegah caching pada browser/Vite
        const res = await axios.get(`${API_URL}/api/v1/users/${userId}?t=${new Date().getTime()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data;
        
        // Letakkan log di SINI (di dalam kode, BUKAN di inspect element Chrome)
        console.log("DATA USER DARI BACKEND:", data); 

        setDetail(data);
        
        setFormData({ 
          kycStatus: data.kycStatus || 'PENDING', 
          adminNote: data.adminNote || '' 
        });
      } catch (error) {
        alert("Gagal memuat detail pengguna.");
        onBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetail();
  }, [userId, onBack]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Perhatikan kita hanya mengirim data yang relevan (kycStatus dan adminNote)
      await axios.put(`${API_URL}/api/v1/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Data pengguna berhasil diperbarui!");
      onBack();
    } catch (error) {
      alert("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  // Kalkulasi Saldo (Mencegah error jika portfolios kosong)
  const totalBalance = useMemo(() => {
    if (!detail?.portfolios) return 0;
    return detail.portfolios.reduce((sum: number, p: any) => sum + (p.balance || 0), 0);
  }, [detail]);

  if (isLoading || !detail) {
    return <div className="p-8 flex justify-center text-gray-400"><Loader2 className="animate-spin mr-2"/> Memuat detail komprehensif...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 mr-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detail Pengguna</h2>
            <p className="text-sm text-gray-500">Kelola profil, verifikasi, dan audit finansial.</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center justify-center transition shadow-sm disabled:opacity-50">
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save className="mr-2" size={18}/>} 
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: INFO PROFIL & RINGKASAN FINANSIAL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Kartu Profil Dasar */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4 shadow-inner">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${detail.name}`} alt="avatar"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{detail.name}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded mt-1 inline-block">
                  ID: {detail.id.substring(0, 8)}...
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Email</p>
                <p className="font-medium text-gray-900 flex items-center"><User size={16} className="mr-2 text-gray-400"/> {detail.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Bergabung</p>
                <p className="font-medium text-gray-900">{new Date(detail.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              </div>
            </div>
          </div>

          {/* Kartu Ringkasan Finansial (Dark Mode) */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <Wallet size={80} className="absolute -bottom-4 -right-4 text-white opacity-5" />
            <h4 className="font-bold mb-6 flex items-center text-gray-100"><Wallet size={18} className="mr-2 text-[#B5F54B]"/> Kas & Portofolio</h4>
            
            <div className="space-y-5 relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Kas (Buying Power)</p>
                <p className="text-3xl font-black text-[#B5F54B]">Rp {totalBalance.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="pt-5 border-t border-gray-800">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Aset Terinvestasi Aktif</p>
                {detail.positions && detail.positions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.positions.map((pos: any) => (
                      <span key={pos.ticker} className="bg-gray-800 border border-gray-700 text-gray-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
                        {pos.ticker} <span className="ml-2 text-gray-400">({pos.amount})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada aset.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: VERIFIKASI, CATATAN & HISTORI TRANSAKSI */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center"><ShieldCheck size={18} className="mr-2 text-blue-500"/> Otorisasi & Verifikasi</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Profil Risiko Pengguna</label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 flex items-center">
                  <Activity size={18} className="mr-2 text-gray-400"/> {detail.riskProfile}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status Verifikasi KYC</label>
                <select 
                  value={formData.kycStatus} 
                  onChange={(e) => setFormData({...formData, kycStatus: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none font-medium ${
                    formData.kycStatus === 'VERIFIED' ? 'bg-green-50 border-green-200 text-green-700 focus:ring-green-500' :
                    formData.kycStatus === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700 focus:ring-red-500' :
                    'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-500'
                  }`}
                >
                  <option value="PENDING">Pending (Belum Upload)</option>
                  <option value="PENDING_VERIFICATION">Menunggu Verifikasi (Sudah Upload)</option>
                  <option value="VERIFIED">Terverifikasi (Lolos)</option>
                  <option value="REJECTED">Ditolak (Data Tidak Valid)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900">Dokumen KYC (KTP / Identitas)</p>
                <p className="text-xs text-gray-500 mt-1">
                  {detail.kycDocumentUrl ? "Pengguna telah mengunggah dokumen identitas." : "Pengguna belum mengunggah dokumen."}
                </p>
              </div>
              {detail.kycDocumentUrl ? (
                <a href={detail.kycDocumentUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold flex items-center hover:bg-blue-200 transition whitespace-nowrap">
                  <ExternalLink size={16} className="mr-2"/> Lihat Dokumen
                </a>
              ) : (
                <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-bold whitespace-nowrap">Tidak Tersedia</span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center"><FileText size={18} className="mr-2 text-purple-500"/> Catatan Internal Admin</h4>
            <textarea 
              rows={3}
              value={formData.adminNote}
              onChange={(e) => setFormData({...formData, adminNote: e.target.value})}
              placeholder="Tambahkan catatan khusus untuk pengguna ini (Alasan tolak KYC, perilaku, dll)..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none resize-none"
            ></textarea>
          </div>

          {/* HISTORI TRANSAKSI */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center"><History size={18} className="mr-2 text-orange-500"/> 5 Transaksi Terakhir</h4>
            
            {detail.transactions && detail.transactions.length > 0 ? (
              <div className="space-y-3">
                {detail.transactions.map((trx: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${trx.type === 'BUY' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trx.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{trx.ticker}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {trx.type} • {trx.amount} Unit • {new Date(trx.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        {trx.type === 'BUY' ? '-' : '+'} {trx.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-sm text-gray-500 font-medium">Belum ada riwayat transaksi yang tercatat.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}