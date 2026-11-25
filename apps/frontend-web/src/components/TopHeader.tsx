import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Info, ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react';

interface TopHeaderProps {
  leftContent?: React.ReactNode; // Untuk menerima menu yang dinamis (kiri)
  userData: { 
    name: string; 
    email?: string; 
    role?: string; 
  };
}

export default function TopHeader({ leftContent, userData }: TopHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Menutup dropdown otomatis saat user mengklik area di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus sesi
    navigate('/login'); // Lempar ke halaman login
  };

  return (
    <header className="h-20 bg-[#F7F8FA] px-8 flex items-center justify-between relative z-20">
      
      {/* KOLOM KIRI (Dinamis, disuntik dari luar) */}
      <div className="flex items-center">
        {leftContent}
      </div>

      {/* KOLOM KANAN (Statis & Konsisten) */}
      <div className="flex items-center space-x-6">
        
        {/* Ikon Aksi */}
        <div className="flex space-x-4 text-gray-500">
          <Search size={20} className="cursor-pointer hover:text-gray-900 transition" />
          <Bell size={20} className="cursor-pointer hover:text-gray-900 transition" />
          <Info size={20} className="cursor-pointer hover:text-gray-900 transition" />
        </div>

        {/* Pemisah Garis Vertikal */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Profil & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-red-500 ring-2 ring-transparent group-hover:ring-red-200 transition-all">
              {/* Jika ingin warna dinamis berdasarkan nama, hapus backgroundColor=ef4444 */}
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}&backgroundColor=ef4444`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            {/* Teks Nama & Info Tambahan (Sesuai Gambar) */}
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-red-500 transition">{userData.name}</p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                {userData.email || 'Email belum diatur'} | Role: {userData.role || 'USER'}
              </p>
            </div>
            
            {/* Ikon Panah Turun (Berputar jika diklik) */}
            <ChevronDown size={16} className={`text-gray-500 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* MENU DROPDOWN */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-4 z-50">
              <Link to="/settings" className="flex items-center px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <User size={18} className="mr-3 text-gray-400" />
                Profil Saya
              </Link>
              <Link to="/settings" className="flex items-center px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                <SettingsIcon size={18} className="mr-3 text-gray-400" />
                Pengaturan
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={18} className="mr-3 text-red-500" />
                Keluar
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}