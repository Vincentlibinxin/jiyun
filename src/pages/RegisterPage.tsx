import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-slate-200 relative font-display overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-orange-900/10 rounded-full blur-[60px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,140,37,0.05)_0%,transparent_40%)]"></div>
      </div>

      <main className="flex-1 px-6 py-8 relative z-10 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">創建賬戶</h1>
          <p className="text-xs text-slate-400 mt-1">加入榕台海峽快運，開啟無縫跨境物流體驗</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              用戶名
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </span>
              <input className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" placeholder="設置您的登錄用戶名" type="text"/>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              手機號碼
            </label>
            <div className="flex gap-2">
              <button type="button" className="flex items-center gap-1 px-3 py-3 bg-white text-slate-700 rounded-lg shadow-sm shrink-0 border border-slate-200">
                <span className="text-sm font-bold">+86</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
              </button>
              <div className="relative flex-1 group">
                <input className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" placeholder="請輸入手機號碼" type="tel"/>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              驗證碼
            </label>
            <div className="relative group">
              <input className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" maxLength={6} placeholder="請輸入6位驗證碼" type="text"/>
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-[#f48c25] bg-orange-50 rounded hover:bg-orange-100 active:scale-95 transition-all border border-orange-100 z-10">
                獲取驗證碼
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              登錄密碼
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input className="w-full pl-9 pr-9 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" placeholder="設置至少8位字符密碼" type="password"/>
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#f48c25]"></span>
              確認密碼
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f48c25] transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input className="w-full pl-9 pr-9 py-3 bg-white text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-[#f48c25]/50 transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm" placeholder="請再次輸入您的密碼" type="password"/>
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10">
                <span className="material-symbols-outlined text-[18px]">visibility_off</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2 px-1">
            <label className="flex items-center cursor-pointer relative mt-0.5 group">
              <input className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-600 bg-slate-800/50 checked:bg-[#f48c25] checked:border-[#f48c25] transition-all" type="checkbox"/>
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-[12px] font-bold">check</span>
              </span>
            </label>
            <p className="text-[10px] leading-snug text-slate-500">
              我已閱讀並同意 <a className="text-slate-400 font-medium hover:text-[#f48c25] transition-colors underline decoration-slate-600 underline-offset-2" href="#">《用戶服務協議》</a> 與 <a className="text-slate-400 font-medium hover:text-[#f48c25] transition-colors underline decoration-slate-600 underline-offset-2" href="#">《隱私權政策》</a>
            </p>
          </div>

          <div className="pt-4">
            <button 
              type="button"
              onClick={() => navigate('/register-success')}
              className="group w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#f48c25] text-white text-sm font-bold rounded-xl shadow-[0_4px_20px_-4px_rgba(244,140,37,0.4)] hover:shadow-[0_6px_25px_-4px_rgba(244,140,37,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <span className="relative z-10 tracking-widest">立即註冊</span>
              <span className="material-symbols-outlined text-lg relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-500">
              已有賬號？<button onClick={() => navigate('/login')} className="text-[#f48c25] font-bold hover:text-orange-400 transition-colors ml-1">立即登錄</button>
            </p>
          </div>
        </form>
      </main>

      <footer className="mt-auto pb-6 text-center px-6 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4 opacity-30">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-400"></div>
          <div className="w-1 h-1 rounded-full bg-slate-500"></div>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-400"></div>
        </div>
        <div className="flex items-center justify-center gap-4 text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[10px] text-[#f48c25]">verified_user</span> 安全加密
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[10px] text-blue-400">language</span> 跨境直達
          </span>
        </div>
        <p className="text-[9px] text-slate-600 mt-3 uppercase tracking-wider font-medium font-mono">© RONGTAI STRAIT EXPRESS</p>
      </footer>
    </div>
  );
}
