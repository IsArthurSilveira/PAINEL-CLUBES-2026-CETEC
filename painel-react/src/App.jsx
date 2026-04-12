import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ClubFormModal } from './components/ClubFormModal';
import { useClubes } from './hooks/useClubes';
import { DashboardPage } from './pages/DashboardPage';
import { ClubsPanelPage } from './pages/ClubsPanelPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { ClubFormPage } from './pages/ClubFormPage';
import { LoginPageRoute } from './pages/LoginPageRoute';
import { AUTH_EXPIRED_EVENT, clearSessionToken, getSessionToken, logoutSession, validateSession } from './services/api';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const [userName, setUserName] = useState(localStorage.getItem('usuarioLogado') || '');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newClubModalOpen, setNewClubModalOpen] = useState(false);
  const [newClubSaving, setNewClubSaving] = useState(false);
  const {
    clubes,
    loading,
    error,
    details,
    detailsLoading,
    detailsError,
    loadClubes,
    loadClubDetails,
    saveClub,
    saveAluno,
    saveEncontro,
    updateStatus,
  } = useClubes();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = getSessionToken();
      if (!userName || !token) {
        if (!cancelled) setSessionChecked(true);
        return;
      }

      const ok = await validateSession();
      if (cancelled) return;

      if (!ok) {
        clearSessionToken();
        localStorage.removeItem('usuarioLogado');
        setUserName('');
        navigate('/login', { replace: true });
      }

      setSessionChecked(true);
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [navigate, userName]);

  useEffect(() => {
    function handleAuthExpired() {
      localStorage.removeItem('usuarioLogado');
      setUserName('');
      navigate('/login', { replace: true });
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [navigate]);

  useEffect(() => {
    if (userName && sessionChecked) {
      loadClubes();
    }
  }, [userName, sessionChecked, loadClubes]);

  const auth = useMemo(() => ({
    userName,
    login: ({ name }) => {
      localStorage.setItem('usuarioLogado', name);
      setUserName(name);
      setSessionChecked(true);
      navigate('/dashboard', { replace: true });
    },
    logout: async () => {
      await logoutSession();
      localStorage.removeItem('usuarioLogado');
      setUserName('');
      setSessionChecked(true);
      navigate('/login', { replace: true });
    },
  }), [navigate, userName]);

  async function handleCreateClub(form) {
    setNewClubSaving(true);
    try {
      const result = await saveClub({ acao: 'salvar_clube', ...form, status: 'pendente' });
      if (result?.sucesso) {
        setNewClubModalOpen(false);
        await loadClubes();
      }
    } finally {
      setNewClubSaving(false);
    }
  }

  if (!sessionChecked && userName) {
    return null;
  }

  if (!userName) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPageRoute userName={userName} onLogin={auth.login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={(
            <DashboardPage
              userName={auth.userName}
              onLogout={auth.logout}
              onOpenNewClubModal={() => setNewClubModalOpen(true)}
              clubes={clubes}
              loading={loading}
              error={error}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
        />
        <Route
          path="/clubes"
          element={(
            <ClubsPanelPage
              userName={auth.userName}
              onLogout={auth.logout}
              onOpenNewClubModal={() => setNewClubModalOpen(true)}
              clubes={clubes}
              loading={loading}
              error={error}
            />
          )}
        />
        <Route path="/clubes/novo" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/clubes/:clubId/editar"
          element={(
            <ClubFormPage
              clubes={clubes}
              onSaveClub={saveClub}
            />
          )}
        />
        <Route
          path="/clubes/:clubId"
          element={(
            <ClubDetailPage
              userName={auth.userName}
              onLogout={auth.logout}
              onOpenNewClubModal={() => setNewClubModalOpen(true)}
              clubes={clubes}
              details={details}
              detailsLoading={detailsLoading}
              detailsError={detailsError}
              onLoadDetails={loadClubDetails}
              onRefresh={loadClubes}
              onSaveAluno={saveAluno}
              onSaveEncontro={saveEncontro}
              onUpdateStatus={updateStatus}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ClubFormModal
        key={newClubModalOpen ? 'new-open' : 'new-closed'}
        open={newClubModalOpen}
        title="Adicionar Novo Clube"
        onClose={() => setNewClubModalOpen(false)}
        onSubmit={handleCreateClub}
        saving={newClubSaving}
      />
    </>
  );
}

export default App;
