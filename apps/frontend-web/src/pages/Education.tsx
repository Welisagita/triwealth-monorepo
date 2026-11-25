import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, PlayCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { API_URL } from '../config/api';

export default function Education() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<any[]>([]);
  
  // State profil
  const [userData, setUserData] = useState({ 
    name: 'Memuat...', 
    email: '',
    role: 'USER' 
  }); 
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEducationData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 1. Ambil profil singkat beserta role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRes = await axios.get(`${API_URL}/api/v1/users/${payload.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const user = userRes.data.data;
        setUserData({ 
          name: user.name,
          email: user.email,
          role: user.role 
        });

        // 2. Ambil Daftar Materi Edukasi MURNI dari Database
        const eduRes = await axios.get(`${API_URL}/api/v1/education`);
        const fetchedData = eduRes.data.data || [];
        
        // HANYA gunakan data dari backend, tidak ada lagi data dummy!
        setMaterials(fetchedData);

      } catch (error) {
        console.error("Gagal memuat data edukasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducationData();
  }, [navigate]);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA] text-gray-500">Memuat Modul Edukasi...</div>;

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
      <span className="bg-gray-900 text-white px-5 py-2 rounded-full cursor-default">Semua Materi</span>
      <span className="text-gray-500 px-5 py-2 cursor-pointer hover:text-gray-900 transition">Investasi</span>
      <span className="text-gray-500 px-5 py-2 cursor-pointer hover:text-gray-900 transition">Perencanaan Keuangan</span>
    </nav>
  }
/>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Akademi TriWealth</h1>
            <p className="text-gray-500 mt-1">Tingkatkan literasi finansial Anda dengan materi pilihan kami.</p>
          </div>

          {/* MENAMPILKAN DATA EDUKASI ATAU PESAN KOSONG */}
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((item: any) => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {/* Placeholder Gambar Dinamis Berdasarkan Judul */}
                    <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/200`} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-gray-900 shadow-sm">
                      {item.type === 'VIDEO' ? '🎥 Video' : item.type === 'QUIZ' ? '📝 Kuis' : '📄 Artikel'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[#95d636] transition">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">
                      {item.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+{item.xpReward} XP</span>
                      <Link 
                        to={`/education/${item.id}`} 
                        className="flex items-center text-gray-900 font-bold hover:text-[#95d636] transition"
                        >
                        Mulai <PlayCircle size={18} className="ml-1" />
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE JIKA DATABASE KOSONG */
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Materi Edukasi</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Materi edukasi masih kosong. Administrator akan segera menambahkan materi baru untuk Anda.
              </p>
              {userData.role === 'ADMIN' && (
                <Link to="/admin" className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition">
                  Kelola Materi di Admin Panel
                </Link>
              )}
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}