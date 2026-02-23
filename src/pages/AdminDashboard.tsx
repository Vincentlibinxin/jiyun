import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

interface User {
  id: number;
  username: string;
  phone: string | null;
  email: string | null;
  real_name: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
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
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(50);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotalItems, setOrderTotalItems] = useState(0);
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

  const fetchUsers = async (page: number = 1, size: number = pageSize) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/admin/users?page=${page}&limit=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
      setCurrentPage(page);
      setPageSize(size);
      setTotalPages(data.pagination?.pages || 1);
      setStats(prev => ({ ...prev, totalUsers: data.pagination?.total || 0 }));
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchUsers(1, newSize);
  };

  const fetchOrders = async (page: number = 1, size: number = orderPageSize) => {
    try {
      setOrdersLoading(true);
      const response = await fetch(`http://localhost:3001/api/admin/orders?page=${page}&limit=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.data || []);
      setOrderPage(page);
      setOrderPageSize(size);
      setOrderTotalPages(data.pagination?.pages || 1);
      setOrderTotalItems(data.pagination?.total || 0);
      setStats(prev => ({ ...prev, totalOrders: data.pagination?.total || 0 }));
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderPageSizeChange = (newSize: number) => {
    setOrderPageSize(newSize);
    setOrderPage(1);
    fetchOrders(1, newSize);
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

  const filteredOrders = orderSearchQuery.trim()
    ? orders.filter(order => {
        const query = orderSearchQuery.trim().toLowerCase();
        return (
          order.id.toString().includes(query) ||
          order.user_id.toString().includes(query) ||
          order.status.toLowerCase().includes(query)
        );
      })
    : orders;

  return (
    <div className="min-h-screen bg-gray-100 text-sm">
      {/* 頂部導航欄 */}
      <header className="fixed top-0 left-0 right-0 z-50 overflow-hidden h-14 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] text-white shadow-sm border-b border-white/10">
         <div className="absolute inset-0 opacity-40 bg-[size:40px_40px] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>
         <div className="absolute w-[150%] h-[150%] rounded-[40%] border border-white/5 top-[-25%] left-[-25%] animate-[spin_60s_linear_infinite] pointer-events-none"></div>

        <div className="relative max-w-full px-3 h-full flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide drop-shadow-md">物流管理系统</h1>
              <p className="text-slate-400 text-xs tracking-wider">RongTai</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-slate-200 text-sm font-medium">{adminUser?.username}</p>
              <p className="text-slate-500 text-xs">管理員</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors backdrop-blur-sm border border-red-500/30"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* 側邊導航欄 */}
        <aside className="fixed top-14 left-0 bottom-0 w-28 bg-[#FCFCFC] border-r border-gray-200 overflow-y-auto">
          <nav className="py-3 space-y-0.5">
            <button
              onClick={() => { setActiveMenu('overview'); setActiveTab('overview'); }}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                activeMenu === 'overview'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              首頁
            </button>
            <button
              onClick={() => { setActiveMenu('users'); setActiveTab('users'); }}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                activeMenu === 'users'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              會員管理
            </button>
            <button
              onClick={() => { setActiveMenu('orders'); setActiveTab('orders'); }}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                activeMenu === 'orders'
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              訂單管理
            </button>
            <div className="pt-3 mt-1.5 border-t border-gray-200">
              <p className="text-gray-500 text-xs font-semibold uppercase px-3 mb-1.5">其他</p>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent">
                系統設置
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent">
                關於系統
              </button>
            </div>
          </nav>
        </aside>

        {/* 主要內容區域 */}
        <main className="flex-1 ml-28 min-h-[calc(100vh-56px)] overflow-y-auto bg-gray-100 p-1.5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4">
              {error}
            </div>
          )}

          {/* 概覽頁面 */}
          {activeTab === 'overview' && (
            <div className="space-y-3 px-1.5">
              {/* 統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">會員總數</p>
                      <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.totalUsers}</p>
                      <p className="text-gray-400 text-xs mt-1.5">↑ 12% 對比上週</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">訂單總數</p>
                      <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.totalOrders}</p>
                      <p className="text-gray-400 text-xs mt-1.5">↑ 8% 對比上週</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                      📦
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">包裹總數</p>
                      <p className="text-2xl font-bold text-gray-800 mt-0.5">{stats.totalParcels}</p>
                      <p className="text-gray-400 text-xs mt-1.5">↑ 5% 對比上週</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                      🎁
                    </div>
                  </div>
                </div>
              </div>

              {/* 系統資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">系統狀態</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">API 伺服器</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">正常運行</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">數據庫連接</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">正常運行</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">應用狀態</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">運行中</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">快速概覽統計</h3>
                  <div className="space-y-1.5">
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
            <div>
              {/* 搜尋欄 */}
              <div className="fixed top-14 left-28 right-0 z-40 px-1.5 bg-gray-100/95 backdrop-blur-sm min-h-[60px] flex items-end pb-0.5">
                <div className="w-full bg-white p-2.5 border border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                      placeholder="搜尋會員：用戶名、手機號或郵箱..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={searchUsers}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      搜尋
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        fetchUsers();
                      }}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      重置
                    </button>
                  </div>
                </div>
              </div>

              {/* 用戶表格 */}
              <div className="bg-white border border-gray-200 overflow-hidden pb-0" style={{marginTop: '54px'}}>
                <div className="max-h-[calc(100vh-183px)] overflow-y-auto">
                  <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">用戶名</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">手機</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">郵箱</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">姓名</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">地址</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">註冊日期</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">更新日期</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-2.5 text-center text-gray-500">
                          加載中...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-2.5 text-center text-gray-500">
                          沒有用戶記錄
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2.5 text-gray-700 font-medium text-sm">{user.id}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-sm">{user.username}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-sm">{user.phone || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-xs">{user.email || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-sm">{user.real_name || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-xs">{user.address || '-'}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">
                            {new Date(user.created_at).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">
                            {new Date(user.updated_at).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors"
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

              {/* 分頁控件 */}
              {users.length > 0 && (
                <div className="fixed bottom-0 left-28 right-0 z-40 px-1.5 bg-gray-100/95 backdrop-blur-sm min-h-[54px] flex items-start">
                  <div className="w-full">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={stats.totalUsers}
                      pageSize={pageSize}
                      pageSizeOptions={[10, 20, 30, 50]}
                      onPageChange={fetchUsers}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 訂單管理頁面 */}
          {activeTab === 'orders' && (
            <div>
              <div className="fixed top-14 left-28 right-0 z-40 px-1.5 bg-gray-100/95 backdrop-blur-sm min-h-[60px] flex items-end pb-0.5">
                <div className="w-full bg-white p-2.5 border border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="搜尋訂單：訂單ID、會員ID或狀態..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 overflow-hidden pb-0" style={{marginTop: '54px'}}>
                <div className="max-h-[calc(100vh-183px)] overflow-y-auto">
                  <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">訂單ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">會員ID</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">金額</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">狀態</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">建立日期</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-2.5 text-center text-gray-500">
                          加載中...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-2.5 text-center text-gray-500">
                          沒有訂單記錄
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2.5 text-gray-700 font-medium text-sm">{order.id}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-sm">{order.user_id}</td>
                          <td className="px-3 py-2.5 text-gray-700 font-medium text-sm">
                            ${order.total_amount.toFixed(2)} {order.currency}
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-2.5 py-1 rounded text-xs font-medium border-0 focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer ${
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
                          <td className="px-3 py-2.5 text-gray-500 text-xs">
                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                          </td>
                          <td className="px-3 py-2.5">
                            <button className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors">
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

              {orders.length > 0 && (
                <div className="fixed bottom-0 left-28 right-0 z-40 px-1.5 bg-gray-100/95 backdrop-blur-sm min-h-[54px] flex items-start">
                  <div className="w-full">
                    <Pagination
                      currentPage={orderPage}
                      totalPages={orderTotalPages}
                      totalItems={orderTotalItems}
                      pageSize={orderPageSize}
                      pageSizeOptions={[10, 20, 30, 50]}
                      onPageChange={fetchOrders}
                      onPageSizeChange={handleOrderPageSizeChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
