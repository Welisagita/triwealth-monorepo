import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, PieChart, Users, ShieldAlert, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // KUNCI PRESISI: Semua ikon menggunakan 1 variabel class yang sama persis
  const baseIconClass = "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200";
  const activeClass = "bg-gray-900 text-white shadow-md";
  const inactiveClass = "text-gray-400 hover:bg-gray-100 hover:text-gray-900";

  return (
    <aside className="w-24 h-screen bg-white border-r border-gray-100 flex flex-col items-center py-6 shrink-0 z-10 md:flex">
      
      {/* Logo */}
      <Link to="/dashboard" className="w-12 h-12 bg-[#21C55D] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-8 shadow-sm hover:opacity-90 transition">
        T
      </Link>

      {/* Navigasi Utama (Jarak antar ikon diatur seragam menggunakan gap-3) */}
      <nav className="flex flex-col gap-5 flex-1 w-full items-center">
        <Link to="/dashboard" className={`${baseIconClass} ${currentPath.startsWith('/dashboard') ? activeClass : inactiveClass}`}>
          <Home size={22} />
        </Link>
        
        <Link to="/education" className={`${baseIconClass} ${currentPath.startsWith('/education') ? activeClass : inactiveClass}`}>
          <BookOpen size={22} />
        </Link>
        
        <Link to="/market" className={`${baseIconClass} ${currentPath.startsWith('/market') ? activeClass : inactiveClass}`}>
          <PieChart size={22} />
        </Link>

        {/* Ikon Komunitas / Users (Sesuai urutan di gambar Anda) */}
        <Link to="/community" className={`${baseIconClass} ${currentPath.startsWith('/community') ? activeClass : inactiveClass}`}>
          <Users size={22} />
        </Link>

        {/* Icon Admin Panel Khusus Admin & SuperAdmin */}
        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
          <Link to="/admin" className={`${baseIconClass} ${currentPath.startsWith('/admin') ? activeClass : inactiveClass}`}>
            <ShieldAlert size={22} />
          </Link>
        )}

        <Link to="/settings" className={`${baseIconClass} ${currentPath.startsWith('/settings') ? activeClass : inactiveClass}`}>
          <Settings size={22} />
        </Link>
      </nav>

      {/* Tombol Logout */}
      <button 
        onClick={handleLogout} 
        className="flex items-center justify-center w-12 h-12 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all mt-auto"
        title="Keluar"
      >
        <LogOut size={22} />
      </button>

    </aside>
  );
}