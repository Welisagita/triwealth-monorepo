import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Flame, TrendingUp, ShieldAlert, Send, X, Megaphone, Trash2, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { API_URL } from '../config/api';

export default function Community() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({ id: '', name: 'Memuat...', email: '', role: 'USER', riskProfile: 'CONSERVATIVE' });
  const [isLoading, setIsLoading] = useState(true);

  // State Utama
  const [posts, setPosts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeCircle, setActiveCircle] = useState<'ALL' | 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'>('ALL');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Fitur Baru: Paginasi & Tagging
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // State Modal Komentar
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Helper: Cashtag Generator (Sekarang di dalam agar bisa akses setPage & setActiveTag)
  const renderContentWithCashtags = (content: string) => {
    const parts = content.split(/(\$[A-Za-z0-9]+)/g);
    return parts.map((part, index) => {
      if (part.match(/^\$[A-Za-z0-9]+$/)) {
        return (
          <span 
            key={index} 
            onClick={(e) => {
              e.stopPropagation(); // Mencegah klik tembus ke elemen bawahnya
              setActiveTag(part);
              setPage(1); 
            }}
            className="text-[#B5F54B] font-bold bg-gray-900 px-1.5 py-0.5 rounded-md text-sm cursor-pointer hover:bg-gray-800 transition shadow-sm"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUser = async () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const res = await axios.get(`${API_URL}/api/v1/users/${payload.id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setUserData(res.data.data);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchCommunityData = useCallback(async (isLoadMore = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '10' });
      if (activeCircle !== 'ALL') params.append('circle', activeCircle);
      if (activeTag) params.append('tag', activeTag);

      const [feedRes, leaderRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/community?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/community/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...feedRes.data.data]);
        setPage(currentPage);
      } else {
        setPosts(feedRes.data.data);
        setPage(1);
      }
      setHasMore(feedRes.data.data.length === 10);
      setLeaderboard(leaderRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil data komunitas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCircle, activeTag, page]);

  useEffect(() => {
    fetchCommunityData(false);
  }, [activeCircle, activeTag]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/community`, 
        { content: newPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPostContent('');
      fetchCommunityData(false); 
    } catch (error) {
      alert("Gagal membuat postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    setPosts(posts.map(p => p.id === postId ? {
      ...p,
      isLikedByMe: !isCurrentlyLiked,
      likesCount: isCurrentlyLiked ? p.likesCount - 1 : p.likesCount + 1
    } : p));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/community/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      fetchCommunityData(false); 
    }
  };

  // FITUR BARU: Hapus Postingan
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Yakin ingin menghapus diskusi ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/community/${postId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) { 
      alert("Gagal menghapus postingan"); 
    }
  };

  // FITUR BARU: Hapus Komentar
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Hapus komentar ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/v1/community/comments/${commentId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setComments(comments.filter(c => c.id !== commentId));
      fetchCommunityData(false); // Update angka komentar di feed utama
    } catch (error) { 
      alert("Gagal menghapus komentar"); 
    }
  };

  const openCommentModal = async (post: any) => {
    setSelectedPost(post);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/community/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data.data);
    } catch(err) {
      console.error("Gagal mengambil komentar", err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    setIsCommenting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/v1/community/${selectedPost.id}/comments`, 
        { content: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      openCommentModal(selectedPost); 
      fetchCommunityData(false); 
    } catch (err) {
      alert('Gagal mengirim komentar');
    } finally {
      setIsCommenting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">Memuat Komunitas...</div>;

  const pinnedAdminPost = !activeTag ? posts.find(p => p.user.role === 'ADMIN' || p.user.role === 'SUPERADMIN') : null;
  const regularPosts = pinnedAdminPost ? posts.filter(p => p.id !== pinnedAdminPost.id) : posts;

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-800 font-sans">
      <Sidebar userRole={userData.role} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopHeader userData={userData} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">Triwealth Community</h1>
              <p className="text-gray-500 mt-1">Diskusikan portofolio, sentimen pasar, dan temukan insight dari investor lain.</p>
            </div>
            
            {/* INDIKATOR FILTER TAG */}
            {activeTag && (
              <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2 rounded-full shadow-md">
                <Filter size={16} className="text-[#B5F54B]"/>
                <span className="text-sm font-medium">Menampilkan tag: <span className="text-[#B5F54B]">{activeTag}</span></span>
                <button onClick={() => setActiveTag(null)} className="ml-2 text-gray-400 hover:text-white"><X size={16}/></button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <form onSubmit={handleCreatePost}>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`Ada insight pasar apa hari ini, ${userData.name}? (Gunakan $ untuk tag aset, cth: $BMRI)`}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-800 outline-none focus:ring-2 focus:ring-[#B5F54B] resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !newPostContent.trim()}
                      className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold py-2.5 px-6 rounded-xl flex items-center transition"
                    >
                      {isSubmitting ? 'Mengirim...' : <><Send size={18} className="mr-2"/> Posting</>}
                    </button>
                  </div>
                </form>
              </div>

              {/* POJOK PAKAR */}
              {pinnedAdminPost && (
                <div className="bg-blue-50/50 p-6 rounded-3xl shadow-sm border border-blue-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-blue-700">
                        <Megaphone size={20} />
                        <h2 className="font-bold text-sm tracking-wide uppercase">Pojok Pakar (Market Insight)</h2>
                      </div>
                      <p className="font-bold text-gray-900 flex items-center">
                        {pinnedAdminPost.user.name} <ShieldAlert size={14} className="text-blue-500 ml-1" />
                      </p>
                      <p className="text-xs text-gray-500">{new Date(pinnedAdminPost.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {/* Tombol Hapus Post (Hanya Admin/Pemilik) */}
                    {(userData.role === 'ADMIN' || userData.role === 'SUPERADMIN' || userData.id === pinnedAdminPost.userId) && (
                      <button onClick={() => handleDeletePost(pinnedAdminPost.id)} className="text-gray-400 hover:text-red-500 transition p-2 bg-white rounded-full shadow-sm"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{renderContentWithCashtags(pinnedAdminPost.content)}</p>
                  
                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-6 text-sm text-gray-500 font-medium">
                    <button onClick={() => handleLike(pinnedAdminPost.id, pinnedAdminPost.isLikedByMe)} className={`flex items-center gap-1.5 hover:text-red-500 transition ${pinnedAdminPost.isLikedByMe ? 'text-red-500' : ''}`}><Flame size={18} className={pinnedAdminPost.isLikedByMe ? 'fill-current' : ''} /> {pinnedAdminPost.likesCount}</button>
                    <button onClick={() => openCommentModal(pinnedAdminPost)} className="flex items-center gap-1.5 hover:text-blue-500 transition"><MessageSquare size={18} /> {pinnedAdminPost.commentsCount}</button>
                  </div>
                </div>
              )}

              {/* Tab Filter Circle */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {['ALL', 'CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].map((circle) => (
                  <button
                    key={circle}
                    onClick={() => setActiveCircle(circle as any)}
                    className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition ${
                      activeCircle === circle 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {circle === 'ALL' ? 'Semua Diskusi' : circle === 'CONSERVATIVE' ? '🌱 Konservatif' : circle === 'MODERATE' ? '⚖️ Moderat' : '🔥 Agresif'}
                  </button>
                ))}
              </div>

              {/* REGULAR FEED */}
              <div className="space-y-4">
                {regularPosts.length > 0 ? (
                  regularPosts.map((post) => (
                    <div key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900 flex items-center">
                            {post.user.name}
                            {(post.user.role === 'ADMIN' || post.user.role === 'SUPERADMIN') && (
                              <span title="Official Admin" className="flex items-center"><ShieldAlert size={14} className="text-blue-500 ml-1" /></span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {post.user.riskProfile}
                          </p>
                        </div>
                        {/* Tombol Hapus Post */}
                        {(userData.role === 'SUPERADMIN' || userData.role === 'ADMIN' || userData.id === post.userId) && (
                          <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 hover:bg-red-50 rounded-full">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {renderContentWithCashtags(post.content)}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-6 text-sm text-gray-500 font-medium">
                        <button 
                          onClick={() => handleLike(post.id, post.isLikedByMe)}
                          className={`flex items-center gap-1.5 hover:text-red-500 transition ${post.isLikedByMe ? 'text-red-500' : ''}`}
                        >
                          <Flame size={18} className={post.isLikedByMe ? 'fill-current' : ''} /> {post.likesCount}
                        </button>
                        <button 
                          onClick={() => openCommentModal(post)}
                          className="flex items-center gap-1.5 hover:text-blue-500 transition"
                        >
                          <MessageSquare size={18} /> {post.commentsCount}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-10 rounded-3xl text-center text-gray-500 border border-gray-100">
                    {activeTag ? `Belum ada diskusi yang membahas ${activeTag}.` : 'Belum ada diskusi di lingkaran ini.'}
                  </div>
                )}

                {/* Tombol Load More */}
                {hasMore && regularPosts.length > 0 && (
                  <button onClick={() => fetchCommunityData(true)} className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-2xl transition border border-gray-100 dashed">
                    Muat Lebih Banyak Diskusi
                  </button>
                )}
              </div>
            </div>

            {/* LEADERBOARD (Tetap) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-md text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center">
                    <TrendingUp className="mr-2 text-[#B5F54B]" size={20} /> Top Investor (XP)
                  </h3>
                </div>
                <div className="space-y-4">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-gray-300 text-gray-800' : index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm truncate w-24">{user.name}</p>
                            <p className="text-[10px] text-gray-300">{user.riskProfile}</p>
                          </div>
                        </div>
                        <div className="font-bold text-[#B5F54B] text-sm">{user.xp} XP</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Belum ada data peringkat.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL KOMENTAR */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">Utas Diskusi</h2>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-800 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 shadow-sm">
                <div className="flex items-center mb-2">
                  <p className="font-bold text-sm text-gray-900 flex items-center">
                    {selectedPost.user.name}
                    {(selectedPost.user.role === 'ADMIN' || selectedPost.user.role === 'SUPERADMIN') && (
                      <ShieldAlert size={14} className="text-blue-500 ml-1" />
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-800">{renderContentWithCashtags(selectedPost.content)}</p>
              </div>

              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ml-6 relative group">
                    <div className="absolute -left-4 top-4 w-4 h-px bg-gray-300"></div>
                    <div className="absolute -left-4 -top-8 w-px h-12 bg-gray-300"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{comment.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {/* Tombol Hapus Komentar */}
                      {(userData.role === 'SUPERADMIN' || userData.role === 'ADMIN' || userData.id === comment.userId) && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{renderContentWithCashtags(comment.content)}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">Belum ada balasan. Jadilah yang pertama berkomentar!</p>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
              <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis balasan atau insight Anda..." 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#B5F54B] text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isCommenting || !newComment.trim()}
                  className="bg-gray-900 text-[#B5F54B] p-3 rounded-xl hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 transition shadow-sm"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}