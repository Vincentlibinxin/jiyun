import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-200">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white text-center tracking-tight">管理後台</h1>
              <p className="text-slate-400 text-center mt-2 text-sm">榕台海峽快運管理系統</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">管理員用戶名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">密碼</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? '登入中...' : '登入'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-xs text-center">
                演示帳號: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
