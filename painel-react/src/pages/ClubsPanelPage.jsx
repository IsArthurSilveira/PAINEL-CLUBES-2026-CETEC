import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { statusKey } from '../utils/clubes';

export function ClubsPanelPage({ userName, onLogout, onOpenNewClubModal, clubes, loading, error }) {
  const navigate = useNavigate();

  return (
    <div id="main-app" className="flex h-screen w-screen overflow-hidden">
      <AppSidebar
        activeView="clubs"
        userName={userName}
        onLogout={onLogout}
        onOpenDashboard={() => navigate('/dashboard')}
        onOpenClubs={() => navigate('/clubes')}
        onOpenNewClub={onOpenNewClubModal}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-bgDashboard">
        <header className="pt-6 pb-4 px-8 shrink-0 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-cetecBlue tracking-tight">Painel de Clubes</h2>
            <p className="text-gray-500 font-bold text-xs mt-1">Gestão completa dos clubes cadastrados</p>
          </div>
          <button type="button" onClick={onOpenNewClubModal} className="btn-3d bg-cetecGreen text-white font-black py-2.5 px-5 rounded-xl border-b-[4px] border-cetecGreenDark hover:bg-[#7ed152] text-xs items-center shadow-sm transition">
            + Novo Clube
          </button>
        </header>

        <div className="px-8 pb-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          {loading && <div className="ui-state-panel ui-state-panel--loading">A sincronizar com a base de dados...</div>}
          {error && <div className="ui-state-panel ui-state-panel--empty text-red-500">{error}</div>}

          {!loading && !error && (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 ui-card-grid ui-card-grid--three" id="grid-clubes-react">
                {clubes.map((clube) => (
                  <button
                    key={clube.id}
                    type="button"
                    onClick={() => navigate(`/clubes/${clube.id}`, { state: { from: '/clubes' } })}
                    data-status={clube.status}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-cetecGreen cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between gap-4 min-h-[240px] text-left ui-card-tile ui-card-tile--clickable"
                  >
                    <div>
                      <h3 className="text-lg font-black text-cetecBlue group-hover:text-cetecGreen transition-colors truncate ui-card-title">{clube.nome}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-indigo-50 text-indigo-700 font-extrabold text-xs px-3 py-1 rounded-lg border border-indigo-100 inline-block truncate max-w-full ui-card-pill">🏫 {clube.escola}</span>
                        <span className={`badge-categoria ${categoriaClass(clube.categoria)} font-extrabold text-xs px-3 py-1 rounded-lg border ui-card-pill`}>{normalizeCategoriaLabel(clube.categoria)}</span>
                      </div>
                    </div>

                    <div className="mt-1 space-y-2 ui-card-meta">
                      <span className="text-gray-600 font-extrabold text-sm block truncate">👩‍🏫 Prof: {clube.prof}</span>
                      <span className="text-purple-600 font-extrabold text-sm block truncate">👨‍💻 Estag: {clube.estag}</span>
                    </div>

                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50 ui-card-footer">
                      <span className="card-alunos-count text-cetecBlue font-black text-sm">{clube.alunos || 0} Alunos</span>
                      <span className={`status-badge ${statusClass(clube.status)} ui-card-pill font-black text-xs px-3 py-1.5 rounded-lg flex items-center shrink-0 border`}>{statusText(clube.status)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function normalizeCategoriaLabel(categoria) {
  const current = String(categoria || '').toLowerCase();
  if (current.includes('mist')) return 'Clubes Mistos';
  if (current.includes('fina')) return 'Clubes Finais';
  return 'Clubes Iniciais';
}

function categoriaClass(categoria) {
  const current = String(categoria || '').toLowerCase();
  if (current.includes('mist')) return 'bg-violet-100 text-violet-700 border-violet-200';
  if (current.includes('fina')) return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-sky-100 text-sky-700 border-sky-200';
}

function statusClass(status) {
  const key = statusKey(status);
  if (key === 'concluido') return 'bg-green-100 text-green-700 border-green-200';
  if (key === 'em_andamento') return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-orange-100 text-orange-700 border-orange-200';
}

function statusText(status) {
  const key = statusKey(status);
  if (key === 'concluido') return 'CONCLUÍDO';
  if (key === 'em_andamento') return 'EM ANDAMENTO';
  return 'PENDENTE';
}
