import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, FileText, User, Calendar, Award } from 'lucide-react';

interface EducationFormProps {
  initialData?: any; // Jika ada isinya, berarti mode EDIT. Jika null, mode CREATE.
  currentUser: any;  // Untuk mengisi default nama penulis
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EducationForm({ initialData, currentUser, onSave, onCancel, isSubmitting }: EducationFormProps) {
  // Inisialisasi State Form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'ARTICLE',
    xpReward: 10,
    authorName: currentUser?.name || '',
    publishedAt: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  });

  // Jika ada initialData (Mode Edit), isi form dengan data tersebut
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        type: initialData.type || 'ARTICLE',
        xpReward: initialData.xpReward || 10,
        authorName: initialData.authorName || currentUser?.name || '',
        publishedAt: initialData.publishedAt 
          ? new Date(initialData.publishedAt).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pastikan publishedAt diubah kembali ke format ISO DateTime yang utuh untuk database
    const payload = {
      ...formData,
      xpReward: Number(formData.xpReward),
      publishedAt: new Date(`${formData.publishedAt}T00:00:00.000Z`).toISOString()
    };
    await onSave(payload);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER CMS */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
        <div className="flex items-center">
          <button onClick={onCancel} className="p-2 mr-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Materi Edukasi' : 'Tulis Materi Baru'}
            </h2>
            <p className="text-sm text-gray-500">Content Management System (CMS)</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="bg-[#B5F54B] hover:bg-[#a3e03e] text-gray-900 font-bold px-6 py-3 rounded-xl flex items-center justify-center transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save className="mr-2" size={18}/>} 
          {initialData ? 'Simpan Perubahan' : 'Publish Materi'}
        </button>
      </div>

      {/* AREA FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: KONTEN UTAMA */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Materi</label>
            <input 
              type="text" 
              required 
              placeholder="Contoh: Cara Membaca Prospektus Reksadana..."
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#B5F54B] outline-none text-lg font-medium transition" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Isi / Konten Artikel</label>
            <textarea 
              required 
              rows={15}
              placeholder="Tulis isi materi di sini... Anda bisa memisahkan paragraf dengan Enter."
              value={formData.content} 
              onChange={(e) => setFormData({...formData, content: e.target.value})} 
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#B5F54B] outline-none resize-y leading-relaxed transition"
            ></textarea>
          </div>
        </div>

        {/* KOLOM KANAN: PENGATURAN METADATA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <FileText size={18} className="mr-2 text-blue-500"/> Pengaturan Atribut
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipe Konten</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})} 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none font-medium"
              >
                <option value="ARTICLE">Artikel Tulisan</option>
                <option value="VIDEO">Video Materi</option>
                <option value="QUIZ">Kuis Interaktif</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 items-center">
                Reward XP <Award size={14} className="ml-1 text-yellow-500"/>
              </label>
              <input 
                type="number" 
                required 
                min="0" 
                value={formData.xpReward} 
                onChange={(e) => setFormData({...formData, xpReward: Number(e.target.value)})} 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none font-bold text-green-600" 
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Calendar size={18} className="mr-2 text-orange-500"/> Publikasi
            </h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Admin / Penulis</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.authorName} 
                  onChange={(e) => setFormData({...formData, authorName: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Publish</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  value={formData.publishedAt} 
                  onChange={(e) => setFormData({...formData, publishedAt: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B5F54B] outline-none font-medium text-gray-700" 
                />
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}