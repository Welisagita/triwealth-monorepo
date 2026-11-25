import { UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminsTableProps {
  adminsList: any[];
  currentUserRole: string;
  onOpenCreateAdmin: () => void;
}

export default function AdminsTable({ adminsList, currentUserRole, onOpenCreateAdmin }: AdminsTableProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center">
          <ShieldAlert className="mr-2 text-gray-400" size={20}/> Manajemen Admin & Staf
        </h3>
        
        {/* Tombol Tambah Admin hanya muncul jika user yang login adalah SUPERADMIN */}
        {currentUserRole === 'SUPERADMIN' && (
          <button 
            onClick={onOpenCreateAdmin} 
            className="bg-gray-900 hover:bg-black text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center transition shadow-sm"
          >
            <UserPlus size={18} className="mr-2"/> Tambah Admin Baru
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 bg-gray-50/50">
            <tr>
              <th className="px-4 py-3 font-medium">Nama & Email</th>
              <th className="px-4 py-3 font-medium">Role (Kasta)</th>
              <th className="px-4 py-3 font-medium">Tanggal Diangkat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {adminsList.length > 0 ? (
              adminsList.map((admin: any) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900">{admin.name}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold flex items-center w-max ${
                      admin.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <ShieldCheck size={14} className="mr-1"/> {admin.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 font-medium">
                    {new Date(admin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="py-8 text-center text-gray-500">Belum ada data admin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}