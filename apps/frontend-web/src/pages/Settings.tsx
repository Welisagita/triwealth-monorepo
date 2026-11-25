import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { API_URL } from '../config/api';

export default function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');

  // State untuk Profil - Sempurna dan konsisten!
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    riskProfile: 'CONSERVATIVE',
    kycStatus: 'PENDING',
    role: 'USER' // <-- TypeScript sekarang tahu bahwa role ada di sini
  });
  
  const [password, setPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // State untuk KYC
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  // Notifikasi
  const [message, setMessage] = useState({ type: '', text: '' });

  // Ambil Data Profil
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const uid = payload.id;
      setUserId(uid);

      const res = await axios.get(`${API_URL}/api/v1/users/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = res.data.data;
      setUserData({
        name: user.name,
        email: user.email,
        riskProfile: user.riskProfile || 'CONSERVATIVE',
        kycStatus: user.kycStatus || 'PENDING',
        role: user.role || 'USER' // <-- Ditambahkan agar admin panel terdeteksi
      });
    } catch (error) {
      console.error("Gagal memuat profil", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  // [PUT] Update Profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });
    
    const token = localStorage.getItem('token');
    try {
      const payload: any = {
        name: userData.name,
        riskProfile: userData.riskProfile
      };
      if (password) payload.password = password; // Hanya kirim jika diisi

      await axios.put(`${API_URL}/api/v1/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setPassword(''); // Kosongkan field password setelah sukses
      fetchProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal update profil' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // [POST] Upload KYC
  const handleUploadKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploadingKyc(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');

    // Menggunakan FormData karena kita mengirim file fisik
    const formData = new FormData();
    formData.append('document', selectedFile); 

    try {
      await axios.post(`${API_URL}/api/v1/users/kyc`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ type: 'success', text: 'Dokumen KYC berhasil diunggah! Menunggu verifikasi.' });
      setSelectedFile(null);
      fetchProfile(); // Refresh status KYC
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal unggah dokumen KYC' });
    } finally {
      setIsUploadingKyc(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">Memuat Pengaturan...</div>;

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans">
      
      {/* SIDEBAR */}
      <Sidebar userRole={userData.role}/>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER SENTRALISASI */}
        <TopHeader 
        userData={userData} 
        leftContent={
            /* INI ADALAH MENU DINAMIS UNTUK BAGIAN KIRI */
            <nav className="flex space-x-6 text-sm font-medium">
            <span className="bg-gray-900 text-white px-5 py-2 rounded-full cursor-default">Pengaturan Akun</span>
            <span className="text-gray-500 px-5 py-2 cursor-pointer hover:text-gray-900 transition">Activity</span>
            </nav>
        }
        />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* KARTU 1: UPDATE PROFIL */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Informasi Pribadi</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (Tidak bisa diubah)</label>
                  <input type="email" value={userData.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text" required value={userData.name} 
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#B5F54B] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profil Risiko Investasi</label>
                  <select 
                    value={userData.riskProfile}
                    onChange={(e) => setUserData({...userData, riskProfile: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#B5F54B] outline-none"
                  >
                    <option value="CONSERVATIVE">Konservatif (Aman)</option>
                    <option value="MODERATE">Moderat (Seimbang)</option>
                    <option value="AGGRESSIVE">Agresif (Risiko Tinggi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ganti Password (Opsional)</label>
                  <input 
                    type="password" value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#B5F54B] outline-none" 
                  />
                </div>
                <button type="submit" disabled={isUpdatingProfile} className="w-full font-bold py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white transition mt-4">
                  {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </div>

            {/* KARTU 2: VERIFIKASI KYC */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Verifikasi Identitas (KYC)</h3>
              
              {userData.kycStatus === 'VERIFIED' ? (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                  <CheckCircle size={64} className="text-green-500 mb-4" />
                  <h4 className="font-bold text-lg text-gray-900">Akun Terverifikasi</h4>
                  <p className="text-gray-500 mt-2">Dokumen identitas Anda telah disetujui. Anda memiliki akses penuh ke fitur aplikasi.</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start mb-6">
                    <AlertCircle size={20} className="text-yellow-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-800">Status: {userData.kycStatus}</p>
                      <p className="text-xs text-yellow-700 mt-1">Harap unggah KTP/Paspor Anda untuk mematuhi regulasi finansial dan membuka blokir transaksi portofolio.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUploadKyc} className="flex flex-col flex-1">
                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative mb-4">
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={40} className="text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700">
                        {selectedFile ? selectedFile.name : 'Klik atau seret file KTP ke sini'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Maks. 5MB (JPG, PNG, PDF)</p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={!selectedFile || isUploadingKyc}
                      className={`w-full font-bold py-3.5 rounded-xl transition ${
                        !selectedFile ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900'
                      }`}
                    >
                      {isUploadingKyc ? 'Mengunggah...' : 'Unggah Dokumen'}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}