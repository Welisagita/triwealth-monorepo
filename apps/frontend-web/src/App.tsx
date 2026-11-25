import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Education from './pages/Education';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import EducationDetail from './pages/EducationDetail';
import Market from './pages/Market';
import Community from './pages/Community';

// Fungsi bantuan untuk membaca Role dari Token JWT
const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    return null;
  }
};

function App() {
  const role = getUserRole(); // Ambil role pengguna saat ini

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rute Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        
        {/* Rute Aplikasi */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/education" element={<Education />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/education/:id" element={<EducationDetail />} />
        <Route path="/market" element={<Market />} />
        <Route path="/community" element={<Community />} />

        {/* Rute khusus Admin Panel */}
        <Route 
          path="/admin" 
          element={['ADMIN', 'SUPERADMIN'].includes(role) ? <Admin /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;