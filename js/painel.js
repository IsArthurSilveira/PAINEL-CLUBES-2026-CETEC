let contadorAlunos = 0;
let clubeAtualCard = null;

const STATUS_STYLE = {
    pendente: {
        select: ['bg-orange-100', 'text-orange-700', 'border-orange-200'],
        badge: ['bg-orange-100', 'text-orange-700', 'border-orange-200'],
        dot: 'bg-orange-500',
        text: 'Pendente'
    },
    em_andamento: {
        select: ['bg-blue-100', 'text-blue-700', 'border-blue-200'],
        badge: ['bg-blue-100', 'text-blue-700', 'border-blue-200'],
        dot: 'bg-blue-500',
        text: 'Em andamento'
    },
    concluido: {
        select: ['bg-green-100', 'text-green-700', 'border-green-200'],
        badge: ['bg-green-100', 'text-green-700', 'border-green-200'],
        dot: 'bg-green-500',
        text: 'Concluido'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formClube = document.getElementById('form-clube');
    const formEncontro = document.getElementById('form-encontro');
    const formAluno = document.getElementById('form-aluno');

    if (formClube) {
        formClube.addEventListener('submit', onSubmitNovoClube);
    }

    if (formEncontro) {
        formEncontro.addEventListener('submit', onSubmitEncontro);
    }

    if (formAluno) {
        formAluno.addEventListener('submit', onSubmitAluno);
    }

    updateDashboardStats();
    navigate('view-dashboard', document.querySelectorAll('.nav-btn')[0]);
});

function logout() {
    window.location.href = 'index.html';
}

function setActiveNav(btnElement) {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.classList.remove('bg-white/20', 'border-white/30');
        btn.classList.add('bg-white/10', 'border-transparent');
    });

    if (btnElement) {
        btnElement.classList.remove('bg-white/10', 'border-transparent');
        btnElement.classList.add('bg-white/20', 'border-white/30');
    }
}

function navigate(viewId, btnElement) {
    ['view-dashboard', 'view-clubes', 'view-clube-detalhes'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) {
            return;
        }
        el.classList.add('hidden');
        el.style.display = 'none';
    });

    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden');
        view.style.display = viewId === 'view-clube-detalhes' ? 'flex' : 'block';
    }

    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const btnAddClube = document.getElementById('btn-add-clube');

    if (viewId === 'view-dashboard') {
        pageTitle.innerText = 'Visao Geral';
        pageSubtitle.style.display = 'block';
        pageSubtitle.innerText = 'Resumo operacional dos clubes';
        btnAddClube.classList.add('hidden');
        btnAddClube.style.display = 'none';
    } else if (viewId === 'view-clubes') {
        pageTitle.innerText = 'Clubes Ativos';
        pageSubtitle.style.display = 'block';
        pageSubtitle.innerText = 'Gerenciamento das turmas de robotica';
        btnAddClube.classList.remove('hidden');
        btnAddClube.style.display = 'flex';
    } else {
        pageTitle.innerText = 'Painel da Trilha';
        pageSubtitle.style.display = 'none';
        btnAddClube.classList.add('hidden');
        btnAddClube.style.display = 'none';
    }

    if (btnElement) {
        setActiveNav(btnElement);
    }
}

function openClubeDetails(cardElement, nomeClube) {
    clubeAtualCard = cardElement;
    document.getElementById('detalhes-titulo').innerText = nomeClube;

    const textoAlunos = cardElement.querySelector('.card-alunos-count')?.innerText || '0 Alunos';
    const total = parseInt(textoAlunos, 10);
    contadorAlunos = Number.isNaN(total) ? 0 : total;

    const categoria = cardElement?.dataset?.categoria || 'Clubes Iniciais';
    const categoriaEstilo = cardElement?.dataset?.categoriaEstilo || 'bg-sky-100 text-sky-700 border-sky-200';
    aplicarBadgeCategoriaDetalhes(categoria, categoriaEstilo);

    document.getElementById('detalhes-escola').innerText = `🏫 ${cardElement?.dataset?.escola || '-'}`;
    document.getElementById('detalhes-utec').innerText = cardElement?.dataset?.utec || '-';
    document.getElementById('detalhes-prof').innerText = `👩‍🏫 Profª ${cardElement?.dataset?.prof || '-'}`;
    document.getElementById('detalhes-estag').innerText = `👨‍💻 ${cardElement?.dataset?.estag || '-'} (Estag)`;
    document.getElementById('detalhes-dias').innerText = cardElement?.dataset?.dias || '-';
    document.getElementById('detalhes-horario').innerText = cardElement?.dataset?.horario || '-';

    const statusClube = document.getElementById('status-clube');
    statusClube.value = cardElement?.dataset?.status || 'em_andamento';
    changeClubStatus(statusClube, false);

    navigate('view-clube-detalhes');
}

function aplicarBadgeCategoriaDetalhes(nomeCategoria, estiloCategoria) {
    const badge = document.getElementById('detalhes-categoria-badge');
    badge.innerText = nomeCategoria;
    badge.classList.remove(
        'bg-sky-100', 'text-sky-700', 'border-sky-200',
        'bg-violet-100', 'text-violet-700', 'border-violet-200',
        'bg-emerald-100', 'text-emerald-700', 'border-emerald-200'
    );

    estiloCategoria.split(' ').forEach((classe) => badge.classList.add(classe));
}

function openModal(modalId, contentId) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeModal(modalId, contentId) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    content.classList.remove('scale-100');
    content.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        if (modalId === 'modal-encontro') document.getElementById('form-encontro').reset();
        if (modalId === 'modal-aluno') document.getElementById('form-aluno').reset();
        if (modalId === 'modal-clube') document.getElementById('form-clube').reset();
    }, 200);
}

function openEncontroModal() { openModal('modal-encontro', 'modal-encontro-content'); }
function openAlunoModal() { openModal('modal-aluno', 'modal-aluno-content'); }
function openClubeModal() { openModal('modal-clube', 'modal-clube-content'); }

function removerItem(botao) {
    const item = botao.closest('li, .item-encontro');

    if (item.tagName.toLowerCase() === 'li') {
        contadorAlunos = Math.max(0, contadorAlunos - 1);
        atualizarContadorAlunoDoCardAtual();
    }

    item.remove();
}

function toggleStatus(btn) {
    if (btn.innerText.trim() === 'A FAZER') {
        btn.innerText = 'FEITO';
        btn.className = 'btn-3d status-btn bg-green-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] border-green-700';
    } else {
        btn.innerText = 'A FAZER';
        btn.className = 'btn-3d status-btn bg-red-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] border-red-700';
    }
}

function changeClubStatus(selectElement, syncCard = true) {
    const valor = selectElement.value;

    selectElement.classList.remove(
        'bg-blue-100', 'text-blue-700', 'border-blue-200',
        'bg-orange-100', 'text-orange-700', 'border-orange-200',
        'bg-green-100', 'text-green-700', 'border-green-200'
    );

    const style = STATUS_STYLE[valor] || STATUS_STYLE.em_andamento;
    style.select.forEach((cls) => selectElement.classList.add(cls));

    if (syncCard && clubeAtualCard) {
        clubeAtualCard.dataset.status = valor;
        atualizarBadgeStatusCard(clubeAtualCard, valor);
        updateDashboardStats();
    }
}

function atualizarBadgeStatusCard(cardElement, status) {
    const badge = cardElement.querySelector('.status-badge');
    const dot = cardElement.querySelector('.status-dot');
    const style = STATUS_STYLE[status] || STATUS_STYLE.em_andamento;

    if (!badge || !dot) {
        return;
    }

    badge.classList.remove(
        'bg-blue-100', 'text-blue-700', 'border-blue-200',
        'bg-orange-100', 'text-orange-700', 'border-orange-200',
        'bg-green-100', 'text-green-700', 'border-green-200'
    );

    style.badge.forEach((cls) => badge.classList.add(cls));
    dot.classList.remove('bg-blue-500', 'bg-orange-500', 'bg-green-500');
    dot.classList.add(style.dot);

    badge.innerHTML = `<div class="status-dot w-2 h-2 ${style.dot} rounded-full mr-2"></div> ${style.text}`;
}

function formatarData(dataISO) {
    if (!dataISO) {
        return '';
    }

    const partes = dataISO.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHtml(texto) {
    return texto
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function categoriaInfo(valor) {
    if (valor === 'mistos') {
        return {
            nome: 'Clubes Mistos',
            estilo: 'bg-violet-100 text-violet-700 border-violet-200'
        };
    }

    if (valor === 'finais') {
        return {
            nome: 'Clubes Finais',
            estilo: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
    }

    return {
        nome: 'Clubes Iniciais',
        estilo: 'bg-sky-100 text-sky-700 border-sky-200'
    };
}

function onSubmitNovoClube(e) {
    e.preventDefault();

    const nome = document.getElementById('input-clube-nome').value.trim();
    const escola = document.getElementById('input-clube-escola').value.trim();
    const utec = document.getElementById('input-clube-utec').value.trim();
    const prof = document.getElementById('input-clube-prof').value.trim();
    const estag = document.getElementById('input-clube-estag').value.trim();
    const dias = document.getElementById('input-clube-dias').value.trim();
    const horario = document.getElementById('input-clube-horario').value.trim();
    const categoria = document.getElementById('input-clube-categoria').value;

    const infoCategoria = categoriaInfo(categoria);

    const cardHTML = `
        <div
            onclick="openClubeDetails(this, this.dataset.nome)"
            data-nome="${escapeHtml(nome)}"
            data-categoria="${infoCategoria.nome}"
            data-categoria-estilo="${infoCategoria.estilo}"
            data-escola="${escapeHtml(escola)}"
            data-utec="${escapeHtml(utec)}"
            data-prof="${escapeHtml(prof)}"
            data-estag="${escapeHtml(estag)}"
            data-dias="${escapeHtml(dias)}"
            data-horario="${escapeHtml(horario)}"
            data-status="pendente"
            class="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-cetecGreen cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between gap-4 min-h-[240px] animate-[fadeIn_0.3s_ease-in-out]"
        >
            <div>
                <h3 class="text-lg font-black text-cetecBlue group-hover:text-cetecGreen transition-colors truncate">${escapeHtml(nome)}</h3>
                <div class="flex flex-wrap gap-2 mt-2">
                    <span class="bg-indigo-50 text-indigo-700 font-extrabold text-xs px-3 py-1 rounded-lg border border-indigo-100 inline-block truncate max-w-full">🏫 ${escapeHtml(escola)}</span>
                    <span class="badge-categoria ${infoCategoria.estilo} font-extrabold text-xs px-3 py-1 rounded-lg border">${infoCategoria.nome}</span>
                </div>
            </div>
            <div class="mt-1 space-y-2">
                <span class="text-gray-600 font-extrabold text-sm block truncate">👩‍🏫 Prof: ${escapeHtml(prof)}</span>
                <span class="text-purple-600 font-extrabold text-sm block truncate">👨‍💻 Estag: ${escapeHtml(estag)}</span>
            </div>
            <div class="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                <span class="card-alunos-count text-cetecBlue font-black text-sm">0 Alunos</span>
                <span class="status-badge bg-orange-100 text-orange-700 font-black text-xs px-3 py-1.5 rounded-lg flex items-center shrink-0 border border-orange-200"><div class="status-dot w-2 h-2 bg-orange-500 rounded-full mr-2"></div> Pendente</span>
            </div>
        </div>
    `;

    document.getElementById('grid-clubes').insertAdjacentHTML('beforeend', cardHTML);
    updateDashboardStats();
    closeModal('modal-clube', 'modal-clube-content');
}

function onSubmitEncontro(e) {
    e.preventDefault();

    const moduloId = document.getElementById('input-modulo').value;
    const titulo = document.getElementById('input-titulo').value;
    const dataBruta = document.getElementById('input-data').value;
    const dataFormatada = formatarData(dataBruta);

    const encontroHTML = `
        <div class="item-encontro flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm animate-[fadeIn_0.3s_ease-in-out]">
            <div class="flex-1">
                <p class="font-black text-gray-800 text-sm leading-tight pr-2">${escapeHtml(titulo)}</p>
                <span class="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md mt-1.5 inline-block">📅 ${dataFormatada}</span>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="toggleStatus(this)" class="btn-3d status-btn bg-red-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] border-red-700">A FAZER</button>
                <button type="button" onclick="removerItem(this)" class="text-gray-300 hover:text-red-500 font-black text-base transition" title="Remover">×</button>
            </div>
        </div>
    `;

    const listaDestino = document.getElementById(moduloId);
    listaDestino.insertAdjacentHTML('beforeend', encontroHTML);
    listaDestino.parentElement.open = true;
    closeModal('modal-encontro', 'modal-encontro-content');
}

function onSubmitAluno(e) {
    e.preventDefault();

    const matricula = document.getElementById('input-aluno-matricula').value || 'S/ Matricula';
    const nome = document.getElementById('input-aluno-nome').value;

    const alunoHTML = `
        <li class="p-3.5 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-between items-center group animate-[fadeIn_0.3s_ease-in-out]">
            <div class="flex items-center w-full">
                <div class="w-9 h-9 bg-blue-50 text-cetecBlue rounded-full flex items-center justify-center mr-3 shrink-0">
                    <span class="text-sm">👤</span>
                </div>
                <div class="flex-1 min-w-0 pr-2">
                    <span class="block text-gray-800 font-black leading-tight text-sm truncate">${escapeHtml(nome)}</span>
                    <span class="block text-xs font-bold text-gray-400 truncate mt-0.5">Mat: ${escapeHtml(matricula)}</span>
                </div>
            </div>
            <button type="button" onclick="removerItem(this)" class="text-red-400 hover:text-red-600 font-black text-xs opacity-0 group-hover:opacity-100 transition px-2 py-1 rounded hover:bg-red-50 shrink-0">Remover</button>
        </li>
    `;

    document.getElementById('lista-alunos-clube').insertAdjacentHTML('beforeend', alunoHTML);
    contadorAlunos += 1;
    atualizarContadorAlunoDoCardAtual();
    closeModal('modal-aluno', 'modal-aluno-content');
}

function atualizarContadorAlunoDoCardAtual() {
    if (!clubeAtualCard) {
        return;
    }

    const span = clubeAtualCard.querySelector('.card-alunos-count');
    if (span) {
        span.innerText = `${contadorAlunos} Alunos`;
    }
}

function updateDashboardStats() {
    const cards = Array.from(document.querySelectorAll('#grid-clubes > div'));

    const stats = {
        total: cards.length,
        iniciais: 0,
        mistos: 0,
        finais: 0,
        pendente: 0,
        em_andamento: 0,
        concluido: 0
    };

    cards.forEach((card) => {
        const categoria = card.dataset.categoria || '';
        const status = card.dataset.status || 'em_andamento';

        if (categoria === 'Clubes Iniciais') stats.iniciais += 1;
        if (categoria === 'Clubes Mistos') stats.mistos += 1;
        if (categoria === 'Clubes Finais') stats.finais += 1;

        if (status === 'pendente') stats.pendente += 1;
        if (status === 'em_andamento') stats.em_andamento += 1;
        if (status === 'concluido') stats.concluido += 1;
    });

    document.getElementById('stat-total-clubes').innerText = String(stats.total);
    document.getElementById('stat-iniciais').innerText = String(stats.iniciais);
    document.getElementById('stat-mistos').innerText = String(stats.mistos);
    document.getElementById('stat-finais').innerText = String(stats.finais);
    document.getElementById('stat-pendentes').innerText = String(stats.pendente);
    document.getElementById('stat-andamento').innerText = String(stats.em_andamento);
    document.getElementById('stat-concluidos').innerText = String(stats.concluido);
}
