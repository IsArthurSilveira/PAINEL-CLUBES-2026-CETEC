import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClubFormModal } from '../components/ClubFormModal';

export function ClubFormPage({ clubes, onSaveClub }) {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const editingClub = useMemo(() => clubes.find((item) => item.id === clubId) || null, [clubes, clubId]);

  async function handleSubmit(form) {
    setSaving(true);
    try {
      const payload = editingClub
        ? { acao: 'atualizar_clube', id_clube: editingClub.id, ...form, status: editingClub.status || 'pendente' }
        : { acao: 'salvar_clube', ...form, status: 'pendente' };

      const result = await onSaveClub(payload);
      if (result?.sucesso) navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ClubFormModal
      key={clubId || 'new'}
      open
      title={editingClub ? 'Editar clube' : 'Novo clube'}
      initialValues={editingClub || undefined}
      onClose={() => navigate('/dashboard')}
      onSubmit={handleSubmit}
      saving={saving}
    />
  );
}
