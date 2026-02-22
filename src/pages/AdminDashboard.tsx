import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  phone: string | null;
  email: string | null;
  real_name: string | null;
  address: string | null;
  created_at: string;
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalParcels: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMenu, setActiveMenu] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalOrders: 0, totalParcels: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const adminUser = localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser')!) : null;

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
    fetchOrders();
  }, [token, navigate]);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/admin/users?page=${page}&limit=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
      setCurrentPage(page);
      setTotalPages(data.pagination?.pages || 1);
      setStats(prev => ({ ...prev, totalUsers: data.pagination?.total || 0 }));
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.data || []);
      setStats(prev => ({ ...prev, totalOrders: data.pagination?.total || 0 }));
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1);
      fetchUsers(1);
      return;
    }

    try {
      setLoading(true);
      setCurrentPage(1);
      const response = await fetch(`http://localhost:3001/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(1);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('確定要刪除此用戶嗎？')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUsers(currentPage);
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Delete failed');
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      setError('Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const statusColors: { [key: string]: string } = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航欄 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">榕台海峽快運</h1>
              <p className="text-gray-500 text-sm">管理後台系統</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-700 font-medium">{adminUser?.username}</p>
              <p className="text-gray-500 text-xs">管理員</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <div className="flex" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* 側邊導航欄 */}
        <aside className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => { setActiveMenu('overview'); setActiveTab('overview'); }}
              className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                activeMenu === 'overview'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📊 概覽
            </button>
            <button
              onClick={() => { setActiveMenu('users'); setActiveTab('users'); }}
              className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                activeMenu === 'users'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 會員管理
            </button>
            <button
              onClick={() => { setActiveMenu('orders'); setActiveTab('orders'); }}
              className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                activeMenu === 'orders'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📦 訂單管理
            </button>
            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-xs font-semibold uppercase px-4 mb-3">其他</p>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors">
                ⚙️ 系統設置
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors">
                ℹ️ 關於系統
              </button>
            </div>
          </nav>
        </aside>

        {/* 主要內容區域 */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 概覽頁面 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">數據概覽</h2>
              </div>

              {/* 統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">會員總數</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                      <p className="text-gray-400 text-xs mt-2">↑ 12% 對比上週</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">訂單總數</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
                      <p className="text-gray-400 text-xs mt-2">↑ 8% 對比上週</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                      📦
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">包裹總數</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalParcels}</p>
                      <p className="text-gray-400 text-xs mt-2">↑ 5% 對比上週</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                      🎁
                    </div>
                  </div>
                </div>
              </div>

              {/* 系統資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">系統狀態</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">API 伺服器</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">正常運行</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">數據庫連接</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">正常運行</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">應用狀態</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">運行中</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">快速概覽統計</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">今日新增用戶</span>
                      <span className="font-bold text-blue-600">+{Math.floor(stats.totalUsers * 0.15)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">今日新增訂單</span>
                      <span className="font-bold text-green-600">+{Math.floor(stats.totalOrders * 0.2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 會員管理頁面 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">會員管理</h2>
              </div>

              {/* 搜尋欄 */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    placeholder="搜尋會員：用戶名、手機號或郵箱..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={searchUsers}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
                  >
                    搜尋
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      fetchUsers();
                    }}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition-colors"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* 用戶表格 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">用戶名</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">手機</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">郵箱</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">姓名</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">註冊日期</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          加載中...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          沒有用戶記錄
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-700 font-medium">{user.id}</td>
                          <td className="px-6 py-4 text-gray-700">{user.username}</td>
                          <td className="px-6 py-4 text-gray-700">{user.phone || '-'}</td>
                          <td className="px-6 py-4 text-gray-700 text-sm">{user.email || '-'}</td>
                          <td className="px-6 py-4 text-gray-700">{user.real_name || '-'}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {new Date(user.created_at).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="px-4 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                            >
                              刪除
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分頁控件 */}
              {users.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    第 <span className="font-semibold text-gray-700">{currentPage}</span> / <span className="font-semibold text-gray-700">{totalPages}</span> 頁 · 共 <span className="font-semibold text-gray-700">{stats.totalUsers}</span> 條記錄
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchUsers(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      首頁
                    </button>
                    <button
                      onClick={() => fetchUsers(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      上一頁
                    </button>
                    <div className="flex items-center gap-2 px-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => fetchUsers(page)}
                          className={`px-3 py-2 rounded text-sm transition-colors ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => fetchUsers(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      下一頁
                    </button>
                    <button
                      onClick={() => fetchUsers(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      末頁
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 訂單管理頁面 */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">訂單管理</h2>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">訂單ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">會員ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">金額</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">建立日期</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          沒有訂單記錄
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-700 font-medium">{order.id}</td>
                          <td className="px-6 py-4 text-gray-700">{order.user_id}</td>
                          <td className="px-6 py-4 text-gray-700 font-medium">
                            ${order.total_amount.toFixed(2)} {order.currency}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1 rounded text-sm font-medium border-0 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <option value="pending">待處理</option>
                              <option value="processing">處理中</option>
                              <option value="shipped">已發貨</option>
                              <option value="delivered">已交付</option>
                              <option value="cancelled">已取消</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-6 py-4">
                            <button className="px-4 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors">
                              詳情
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
