import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/users/login`, {
        email: email,
        password: password
      });

      const token = response.data.data.token;
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || "Terjadi kesalahan pada server.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {/* Logo TriWealth */}
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto shadow-sm">
          T
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Masuk ke TriWealth</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Selamat datang kembali! Silakan login ke akun Anda.</p>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition"
              placeholder="Masukkan email Anda"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition"
              placeholder="Masukkan password"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3.5 px-4 rounded-xl transition duration-200 mt-4 flex items-center justify-center ${
              isLoading 
                ? 'bg-[#d6f599] text-gray-500 cursor-not-allowed' 
                : 'bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900'
            }`}
          >
            {isLoading ? 'Memproses...' : 'Masuk ke Akun'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-gray-900 font-bold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}