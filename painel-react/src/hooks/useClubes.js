import { useCallback, useState } from 'react';
import { apiGet, apiPost } from '../services/api';
import { normalizeAluno, normalizeClube, normalizeEncontro } from '../utils/clubes';

export function useClubes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clubes, setClubes] = useState([]);
  const [details, setDetails] = useState({ alunos: [], encontros: [] });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const loadClubes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const clubesRaw = await apiGet({ acao: 'listar_clubes', _t: Date.now() });
      const clubesNorm = Array.isArray(clubesRaw) ? clubesRaw.map(normalizeClube) : [];

      const clubesComAlunos = await Promise.all(
        clubesNorm.map(async (clube) => {
          if (!clube?.id) return { ...clube, alunos: 0 };

          try {
            const alunosRaw = await apiGet({ acao: 'listar_alunos', id_clube: clube.id, _t: Date.now() });
            return {
              ...clube,
              alunos: extractRows(alunosRaw).length,
            };
          } catch {
            return {
              ...clube,
              alunos: 0,
            };
          }
        }),
      );

      setClubes(clubesComAlunos);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar os clubes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClubDetails = useCallback(async (clubId) => {
    if (!clubId) return null;

    setDetailsLoading(true);
    setDetailsError('');
    setDetails({ alunos: [], encontros: [] });

    try {
      const [alunosRaw, encontrosRaw] = await Promise.all([
        apiGet({ acao: 'listar_alunos', id_clube: clubId, _t: Date.now() }),
        apiGet({ acao: 'listar_encontros', id_clube: clubId, _t: Date.now() }),
      ]);

      const nextDetails = {
        alunos: Array.isArray(alunosRaw) ? alunosRaw.map(normalizeAluno) : [],
        encontros: Array.isArray(encontrosRaw) ? encontrosRaw.map(normalizeEncontro) : [],
      };
      setDetails(nextDetails);
      return nextDetails;
    } catch (err) {
      console.error(err);
      setDetailsError('Erro ao carregar detalhes do clube.');
      return null;
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const saveClub = useCallback(async (payload) => {
    return apiPost(payload);
  }, []);

  const saveAluno = useCallback(async (payload) => apiPost(payload), []);
  const deleteAluno = useCallback(async (payload) => apiPost(payload), []);
  const saveEncontro = useCallback(async (payload) => apiPost(payload), []);
  const deleteEncontro = useCallback(async (payload) => apiPost(payload), []);
  const updateStatus = useCallback(async (payload) => apiPost(payload), []);

  return {
    loading,
    error,
    clubes,
    details,
    detailsLoading,
    detailsError,
    loadClubes,
    loadClubDetails,
    saveClub,
    saveAluno,
    deleteAluno,
    saveEncontro,
    deleteEncontro,
    updateStatus,
  };
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.dados)) return payload.dados;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.itens)) return payload.itens;
  return [];
}
