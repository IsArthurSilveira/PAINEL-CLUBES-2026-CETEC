import {
  ArcElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { statusKey } from '../utils/clubes';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FILTERS = {
  all: (c) => c,
  pendente: (c) => statusKey(c.status) === 'pendente',
  em_andamento: (c) => statusKey(c.status) === 'em_andamento',
  concluido: (c) => statusKey(c.status) === 'concluido',
  iniciais: (c) => c.categoria.toLowerCase().includes('iniciais'),
  mistos: (c) => c.categoria.toLowerCase().includes('mistos'),
  finais: (c) => c.categoria.toLowerCase().includes('finais'),
};

export function DashboardView({ clubes, statusFilter, setStatusFilter, onSelectClub }) {
  const filteredClubes = clubes.filter(FILTERS[statusFilter] || FILTERS.all);

  const byCategoria = buildCategoria(filteredClubes);
  const byUtec = buildUtec(filteredClubes);

  const kpis = {
    totalClubes: clubes.length,
    totalAlunos: clubes.reduce((sum, c) => sum + (c.alunos || 0), 0),
    pendentes: clubes.filter((c) => statusKey(c.status) === 'pendente').length,
    andamento: clubes.filter((c) => statusKey(c.status) === 'em_andamento').length,
    concluidos: clubes.filter((c) => statusKey(c.status) === 'concluido').length,
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pr-2">
      <section className="dashboard-shell space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <Kpi title="Total de clubes" value={kpis.totalClubes} icon="dashboard" iconClass="dashboard-kpi-icon-blue" />
          <Kpi title="Total de alunos" value={kpis.totalAlunos} icon="groups" iconClass="dashboard-kpi-icon-indigo" />
          <Kpi title="Pendentes" value={kpis.pendentes} icon="hourglass_top" iconClass="dashboard-kpi-icon-orange" />
          <Kpi title="Em andamento" value={kpis.andamento} icon="progress_activity" iconClass="dashboard-kpi-icon-blue-soft" />
          <Kpi title="Concluídos" value={kpis.concluidos} icon="task_alt" iconClass="dashboard-kpi-icon-green" />
        </div>

        <div className="dashboard-filter-row ui-surface-card ui-surface-card--pad">
          <div>
            <p className="dashboard-panel-kicker">Filtros rápidos</p>
            <h4 className="dashboard-panel-title">Refinar a visão</h4>
            <p className="dashboard-filter-note">Mostrando {filteredClubes.length} de {clubes.length} clubes no filtro atual.</p>
          </div>
          <div className="dashboard-filter-bar">
            <FilterChip label="Todos" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} icon="dashboard" />
            <FilterChip label="Pendentes" active={statusFilter === 'pendente'} onClick={() => setStatusFilter('pendente')} icon="hourglass_top" />
            <FilterChip label="Andamento" active={statusFilter === 'em_andamento'} onClick={() => setStatusFilter('em_andamento')} icon="progress_activity" />
            <FilterChip label="Concluídos" active={statusFilter === 'concluido'} onClick={() => setStatusFilter('concluido')} icon="task_alt" />
            <FilterChip label="Iniciais" active={statusFilter === 'iniciais'} onClick={() => setStatusFilter('iniciais')} icon="school" />
            <FilterChip label="Mistos" active={statusFilter === 'mistos'} onClick={() => setStatusFilter('mistos')} icon="groups" />
            <FilterChip label="Finais" active={statusFilter === 'finais'} onClick={() => setStatusFilter('finais')} icon="category" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          <section className="dashboard-panel ui-surface-card ui-surface-card--pad">
            <div className="dashboard-panel-head ui-section-head">
              <div>
                <p className="dashboard-panel-kicker ui-section-kicker">Estrutura da base</p>
                <h4 className="dashboard-panel-title ui-section-title">Clubes por categoria</h4>
              </div>
              <span className="dashboard-panel-badge ui-section-badge">Leitura geral</span>
            </div>
            <div className="dashboard-chart-wrap">
              <Doughnut
                data={{
                  labels: ['Iniciais', 'Mistos', 'Finais'],
                  datasets: [{
                    data: [byCategoria.iniciais, byCategoria.mistos, byCategoria.finais],
                    backgroundColor: ['rgba(73,132,255,0.35)', 'rgba(118,92,196,0.35)', 'rgba(110,190,68,0.35)'],
                    borderColor: ['rgba(73,132,255,0.8)', 'rgba(118,92,196,0.8)', 'rgba(110,190,68,0.8)'],
                    borderWidth: 1,
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  cutout: '68%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#475569',
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 16,
                        boxWidth: 10,
                        boxHeight: 10,
                        font: { size: 11, weight: '600' },
                      },
                    },
                  },
                }}
              />
            </div>
          </section>

          <section className="dashboard-panel ui-surface-card ui-surface-card--pad">
            <div className="dashboard-panel-head ui-section-head">
              <div>
                <p className="dashboard-panel-kicker ui-section-kicker">Distribuição territorial</p>
                <h4 className="dashboard-panel-title ui-section-title">Clubes por UTEC</h4>
              </div>
              <span className="dashboard-panel-badge ui-section-badge">Resumo</span>
            </div>
            <div className="dashboard-chart-wrap dashboard-chart-wrap-small">
              <Bar
                data={{
                  labels: byUtec.labels,
                  datasets: [{
                    label: 'Clubes',
                    data: byUtec.values,
                    backgroundColor: 'rgba(73,132,255,0.72)',
                    borderColor: 'rgba(73,132,255,1)',
                    borderWidth: 1,
                    borderRadius: 10,
                    maxBarThickness: 42,
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        title: (items) => items[0]?.label || '',
                        label: (item) => ` ${item.parsed.y} clubes`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: '#475569',
                        font: { size: 11, weight: '600' },
                        maxRotation: 30,
                        minRotation: 0,
                        autoSkip: false,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0, color: '#475569', font: { size: 11, weight: '600' } },
                      grid: { color: 'rgba(148,163,184,0.16)' },
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>

        <section className="dashboard-panel dashboard-club-list-panel ui-surface-card ui-surface-card--pad">
          <div className="dashboard-panel-head ui-section-head">
            <div>
              <p className="dashboard-panel-kicker ui-section-kicker">Seleção ativa</p>
              <h4 className="dashboard-panel-title ui-section-title">Clubes filtrados</h4>
            </div>
            <span className="dashboard-panel-badge ui-section-badge">{filterLabel(statusFilter)}</span>
          </div>

          <div className="dashboard-list-grid dashboard-list-grid-two dashboard-list-scroll dashboard-list-scroll-tall ui-card-grid ui-card-grid--two ui-card-grid--scroll ui-card-grid--tall">
            {filteredClubes.length === 0 && <div className="dashboard-empty-state ui-state-panel ui-state-panel--empty">Nenhum clube encontrado para este filtro.</div>}
            {filteredClubes.map((clube) => (
              <button className="dashboard-club-card ui-card-tile ui-card-tile--clickable" key={clube.id} type="button" onClick={() => onSelectClub(clube)}>
                <span className="dashboard-club-card-title ui-card-title">{clube.nome}</span>
                <span className="dashboard-club-card-meta ui-card-meta">{clube.escola}</span>
                <span className={`dashboard-club-card-status ui-card-pill ${statusClass(clube.status)}`}>{labelStatus(clube.status)}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function Kpi({ title, value, icon, iconClass }) {
  return (
    <article className="dashboard-kpi-card ui-surface-card">
      <div className={`dashboard-kpi-icon ${iconClass}`}>
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <div>
        <p className="dashboard-kpi-label">{title}</p>
        <p className="dashboard-kpi-value">{value}</p>
      </div>
    </article>
  );
}

function FilterChip({ label, active, onClick, icon }) {
  return (
    <button type="button" className={`dashboard-filter-chip ${active ? 'is-active' : ''}`} onClick={onClick}>
      <span className="material-symbols-rounded">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function statusClass(status) {
  const key = statusKey(status);
  if (key === 'concluido') return 'bg-green-100 text-green-700 border border-green-200';
  if (key === 'em_andamento') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-orange-100 text-orange-700 border border-orange-200';
}

function filterLabel(key) {
  if (key === 'pendente') return 'Pendentes';
  if (key === 'em_andamento') return 'Em andamento';
  if (key === 'concluido') return 'Concluídos';
  if (key === 'iniciais') return 'Clubes iniciais';
  if (key === 'mistos') return 'Clubes mistos';
  if (key === 'finais') return 'Clubes finais';
  return 'Todos os clubes';
}

function buildCategoria(clubes) {
  return clubes.reduce(
    (acc, clube) => {
      const cat = clube.categoria.toLowerCase();
      if (cat.includes('iniciais')) acc.iniciais += 1;
      else if (cat.includes('mistos')) acc.mistos += 1;
      else acc.finais += 1;
      return acc;
    },
    { iniciais: 0, mistos: 0, finais: 0 },
  );
}

function buildUtec(clubes) {
  const counts = clubes.reduce((acc, clube) => {
    const key = normalizeUtecKey(clube.utec);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topItems = ordered.slice(0, 6);
  const restTotal = ordered.slice(6).reduce((sum, [, value]) => sum + value, 0);

  if (restTotal > 0) {
    topItems.push(['Outras', restTotal]);
  }

  return {
    labels: topItems.map(([label]) => label),
    values: topItems.map(([, value]) => value),
  };
}

function normalizeUtecKey(value) {
  const text = String(value || '').trim();
  if (!text) return 'Sem UTEC';
  return text;
}

function labelStatus(status) {
  if (status === 'concluido') return 'Concluído';
  if (status === 'em_andamento') return 'Em andamento';
  return 'Pendente';
}

