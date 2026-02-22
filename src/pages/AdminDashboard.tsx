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
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalOrders: 0, totalParcels: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
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
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
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
        fetchUsers();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">管理後台</h1>
            <p className="text-slate-400 text-sm">歡迎，{adminUser?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">用戶總數</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">訂單總數</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">包裹總數</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalParcels}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            概覽
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            用戶管理
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            訂單管理
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">系統狀態</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">API 伺服器狀態</span>
                  <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-sm font-medium">正常</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">數據庫狀態</span>
                  <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-sm font-medium">正常</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                placeholder="搜尋用戶名、手機號或郵箱..."
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                onClick={searchUsers}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                搜尋
              </button>
              <button
                onClick={() => { setSearchQuery(''); fetchUsers(); }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                重置
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">用戶名</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">手機</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">郵箱</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">姓名</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">註冊日期</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                        加載中...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                        沒有用戶
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4 text-slate-200">{user.username}</td>
                        <td className="px-6 py-4 text-slate-200">{user.phone || '-'}</td>
                        <td className="px-6 py-4 text-slate-200">{user.email || '-'}</td>
                        <td className="px-6 py-4 text-slate-200">{user.real_name || '-'}</td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{new Date(user.created_at).toLocaleDateString('zh-TW')}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
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
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">訂單ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">用戶ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">金額</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">狀態</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">建立日期</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                      沒有訂單
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-slate-200">{order.id}</td>
                      <td className="px-6 py-4 text-slate-200">{order.user_id}</td>
                      <td className="px-6 py-4 text-slate-200">${order.total_amount} {order.currency}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                        >
                          <option value="pending">待處理</option>
                          <option value="processing">處理中</option>
                          <option value="shipped">已發貨</option>
                          <option value="delivered">已交付</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{new Date(order.created_at).toLocaleDateString('zh-TW')}</td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                          詳情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
