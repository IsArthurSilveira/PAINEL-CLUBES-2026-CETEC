export function AppSidebar({ activeView, userName, onLogout, onOpenDashboard, onOpenClubs, onOpenNewClub }) {
  return (
    <aside className="w-64 bg-cetecBlue text-white flex flex-col rounded-r-[2rem] shadow-xl z-10 border-r-4 border-cetecBlueDark shrink-0">
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-black font-mono tracking-widest text-cetecGreen">EDUCA<span className="text-white">/CODE</span></h2>
        <div className="h-1.5 w-12 bg-cetecOrange rounded-full mt-2"></div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-2">
        <button
          type="button"
          onClick={onOpenDashboard}
          className={`nav-btn w-full text-left px-5 py-3 rounded-2xl font-bold transition flex items-center border-b-4 text-sm ${
            activeView === 'dashboard'
              ? 'bg-white/20 border-white/30'
              : 'bg-white/10 hover:bg-white/20 border-transparent hover:border-white/20'
          }`}
        >
          <span className="mr-3 material-symbols-rounded text-[20px]">dashboard</span> Visão Geral
        </button>

        <button
          type="button"
          onClick={onOpenClubs}
          className={`nav-btn w-full text-left px-5 py-3 rounded-2xl font-bold transition flex items-center border-b-4 text-sm ${
            activeView === 'clubs'
              ? 'bg-white/20 border-white/30'
              : 'bg-white/10 hover:bg-white/20 border-transparent hover:border-white/20'
          }`}
        >
          <span className="mr-3 material-symbols-rounded text-[20px]">groups</span> Painel de Clubes
        </button>

        <button
          type="button"
          onClick={onOpenNewClub}
          className="nav-btn w-full text-left px-5 py-3 rounded-2xl bg-white/10 font-bold hover:bg-white/20 transition flex items-center border-b-4 border-transparent hover:border-white/20 text-sm"
        >
          <span className="mr-3 material-symbols-rounded text-[20px]">add_circle</span> Novo Clube
        </button>
      </nav>

      <div className="p-6 space-y-2 text-xs text-white/75 font-bold">
        <p>Usuário: {userName}</p>
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-center px-4 py-3 bg-red-500/20 text-red-200 font-bold rounded-xl hover:bg-red-500 hover:text-white transition text-sm inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-rounded text-[18px]">logout</span>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
