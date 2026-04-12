import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { DashboardView } from '../components/DashboardView';

export function DashboardPage({ userName, onLogout, onOpenNewClubModal, clubes, loading, error, statusFilter, setStatusFilter }) {
  const navigate = useNavigate();

  return (
    <div id="main-app" className="flex h-screen w-screen overflow-hidden">
      <AppSidebar
        activeView="dashboard"
        userName={userName}
        onLogout={onLogout}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenClubs={() => navigate('/clubes')}
        onOpenNewClub={onOpenNewClubModal}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-bgDashboard">
        <header className="pt-6 pb-4 px-8 shrink-0 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-cetecBlue tracking-tight">Visão Geral</h2>
            <p className="text-gray-500 font-bold text-xs mt-1">Resumo operacional dos clubes</p>
          </div>
          <button type="button" onClick={onOpenNewClubModal} className="btn-3d bg-cetecGreen text-white font-black py-2.5 px-5 rounded-xl border-b-[4px] border-cetecGreenDark hover:bg-[#7ed152] text-xs items-center shadow-sm transition">
            + Novo Clube
          </button>
        </header>

        <div className="px-8 pb-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          {loading && <div className="ui-state-panel ui-state-panel--loading">A sincronizar com a base de dados...</div>}
          {error && <div className="ui-state-panel ui-state-panel--empty text-red-500">{error}</div>}

          {!loading && !error && (
            <DashboardView
              clubes={clubes}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectClub={(clube) => navigate(`/clubes/${clube.id}`, { state: { from: '/dashboard' } })}
            />
          )}
        </div>
      </main>
    </div>
  );
}
