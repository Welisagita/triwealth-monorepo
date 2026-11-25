import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trophy, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { API_URL } from '../config/api';

export default function EducationDetail() {
  const { id } = useParams(); // Mengambil ID dari URL (/education/123)
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<any>(null);
  const [userData, setUserData] = useState({ role: 'USER' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        // Ambil role pengguna (untuk Sidebar)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRes = await axios.get(`${API_URL}/api/v1/users/${payload.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData({ role: userRes.data.data.role });

        // Ambil data spesifik artikel berdasarkan ID
        const articleRes = await axios.get(`${API_URL}/api/v1/education/${id}`);
        setArticle(articleRes.data.data);
      } catch (error) {
        console.error("Gagal memuat artikel:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">Memuat materi...</div>;
  if (!article) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">Materi tidak ditemukan.</div>;

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans">
      
      <Sidebar userRole={userData.role} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Sederhana */}
        <header className="h-20 bg-white px-8 flex items-center border-b border-gray-100">
          <button onClick={() => navigate('/education')} className="flex items-center text-gray-500 hover:text-gray-900 transition font-medium">
            <ArrowLeft size={20} className="mr-2" /> Kembali ke Akademi
          </button>
        </header>

        {/* Area Membaca */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-3xl mx-auto bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-100">
            
            {/* Meta Info */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-bold">
                {article.type}
              </span>
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-md text-sm font-bold">
                <Trophy size={16} className="mr-1"/> +{article.xpReward} XP
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {article.title}
            </h1>

            {/* Gambar Ilustrasi */}
            <div className="w-full h-64 md:h-80 bg-gray-200 rounded-2xl mb-10 overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${encodeURIComponent(article.title)}/400/200`} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
            </div>

            {/* Konten Utama (whitespace-pre-wrap agar enter/paragraf dari database terbaca) */}
            <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
              {article.content}
            </div>

            {/* Tombol Selesai */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => {
                  alert(`Selamat! Anda menyelesaikan materi dan mendapatkan ${article.xpReward} XP!`);
                  navigate('/education');
                }} 
                className="bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900 font-bold py-3.5 px-8 rounded-xl flex items-center transition"
              >
                <CheckCircle size={20} className="mr-2"/> Tandai Selesai
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}