import { useState } from 'react';
import { toUpperText } from '../utils/clubes';

const EMPTY_FORM = {
  nome: '',
  escola: '',
  utec: '',
  prof: '',
  estag: '',
  dias: '',
  horario: '',
  categoria: 'Clubes Iniciais',
};

export function ClubFormModal({ open, title, initialValues, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...initialValues }));

  if (!open) return null;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="ui-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="ui-modal-head">
          <h3 className="ui-modal-title">{title}</h3>
          <button type="button" onClick={onClose} className="ui-modal-close" aria-label="Fechar">X</button>
        </div>

        <form className="ui-modal-body space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome" placeholder="Ex: UTEC GREGORIO 01" value={form.nome} onChange={(value) => updateField('nome', value)} required />
            <Field label="Escola" placeholder="Ex: E.M. João Cabral" value={form.escola} onChange={(value) => updateField('escola', value)} required />
            <Field label="UTEC" placeholder="Ex: Alto Santa Terezinha" value={form.utec} onChange={(value) => updateField('utec', value)} required />
            <Field label="Professor" placeholder="Ex: Maria Silva" value={form.prof} onChange={(value) => updateField('prof', value)} required />
            <Field label="Estagiário" placeholder="Ex: Arthur Silveira" value={form.estag} onChange={(value) => updateField('estag', value)} required />
            <Field label="Dias" placeholder="Ex: Quinta e Sexta" value={form.dias} onChange={(value) => updateField('dias', value)} required />
            <Field label="Horário" placeholder="Ex: 14:30 às 16:00" value={form.horario} onChange={(value) => updateField('horario', value)} required />
            <SelectField label="Categoria" value={form.categoria} onChange={(value) => updateField('categoria', value)} options={['Clubes Iniciais', 'Clubes Mistos', 'Clubes Finais']} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl">Cancelar</button>
            <button className="btn-3d bg-cetecGreen text-white font-black px-5 py-2.5 rounded-xl border-b-[4px] border-cetecGreenDark hover:bg-[#7ed152]" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Clube'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, placeholder = '', value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1 block">{label}</span>
      <input className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cetecGreen font-bold text-sm text-gray-700" placeholder={placeholder} value={value} autoCapitalize="characters" onChange={(event) => onChange(toUpperText(event.target.value, ''))} required={required} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1 block">{label}</span>
      <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cetecGreen font-bold text-sm text-gray-700" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
