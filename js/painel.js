const API_URL = 'https://script.google.com/macros/s/AKfycbwDWyu-3ChcUMAXjdgNV1raEQ9idC7W5mcS2RJASQVwOMp57CeuOSzE9bh7tekheDW8Yg/exec';

let contadorAlunos = 0;
let clubeAtualCard = null;
let clubeAtualId = null; 

const STATUS_STYLE = {
    pendente: { select: ['bg-orange-100', 'text-orange-700', 'border-orange-200'], badge: ['bg-orange-100', 'text-orange-700', 'border-orange-200'], dot: 'bg-orange-500', text: 'Pendente' },
    em_andamento: { select: ['bg-blue-100', 'text-blue-700', 'border-blue-200'], badge: ['bg-blue-100', 'text-blue-700', 'border-blue-200'], dot: 'bg-blue-500', text: 'Em andamento' },
    concluido: { select: ['bg-green-100', 'text-green-700', 'border-green-200'], badge: ['bg-green-100', 'text-green-700', 'border-green-200'], dot: 'bg-green-500', text: 'Concluido' }
};

document.addEventListener('DOMContentLoaded', () => {
    const formClube = document.getElementById('form-clube');
    const formEncontro = document.getElementById('form-encontro');
    const formAluno = document.getElementById('form-aluno');

    if (formClube) formClube.addEventListener('submit', onSubmitNovoClube);
    if (formEncontro) formEncontro.addEventListener('submit', onSubmitEncontro);
    if (formAluno) formAluno.addEventListener('submit', onSubmitAluno);

    navigate('view-dashboard', document.querySelectorAll('.nav-btn')[0]);
    carregarClubes(); 
});

async function carregarClubes() {
    const grid = document.getElementById('grid-clubes');
    grid.innerHTML = '<p class="text-gray-500 font-bold p-4">A sincronizar com a base de dados...</p>';
    
    try {
        const response = await fetch(API_URL + "?acao=listar_clubes");
        const clubes = await response.json();
        
        grid.innerHTML = ''; 
        
        clubes.forEach(clube => {
            const infoCategoria = categoriaInfo(clube.Categoria);
            const statusExibicao = clube.Status === 'em_andamento' ? '🔵 Em andamento' : (clube.Status === 'pendente' ? '🟠 Pendente' : '🟢 Concluído');

            const cardHTML = `
                <div onclick="openClubeDetails(this, '${clube.ID}', '${escapeHtml(clube.Nome)}')" 
                    data-status="${clube.Status}" 
                    data-categoria="${infoCategoria.nome}"
                    data-categoria-estilo="${infoCategoria.estilo}"
                    data-escola="${escapeHtml(clube.Escola)}"
                    data-utec="${escapeHtml(clube.UTEC)}"
                    data-prof="${escapeHtml(clube.Prof)}"
                    data-estag="${escapeHtml(clube.Estag)}"
                    data-dias="${escapeHtml(clube.Dias)}"
                    data-horario="${escapeHtml(clube.Horario)}"
                    class="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-cetecGreen cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between gap-4 min-h-[240px] animate-[fadeIn_0.3s_ease-in-out]">
                    <div>
                        <h3 class="text-lg font-black text-cetecBlue group-hover:text-cetecGreen transition-colors truncate">${escapeHtml(clube.Nome)}</h3>
                        <div class="flex flex-wrap gap-2 mt-2">
                            <span class="bg-indigo-50 text-indigo-700 font-extrabold text-xs px-3 py-1 rounded-lg border border-indigo-100 inline-block truncate max-w-full">🏫 ${escapeHtml(clube.Escola)}</span>
                            <span class="badge-categoria ${infoCategoria.estilo} font-extrabold text-xs px-3 py-1 rounded-lg border">${infoCategoria.nome}</span>
                        </div>
                    </div>
                    <div class="mt-1 space-y-2">
                        <span class="text-gray-600 font-extrabold text-sm block truncate">👩‍🏫 Prof: ${escapeHtml(clube.Prof)}</span>
                        <span class="text-purple-600 font-extrabold text-sm block truncate">👨‍💻 Estag: ${escapeHtml(clube.Estag)}</span>
                    </div>
                    <div class="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                        <span class="card-alunos-count text-cetecBlue font-black text-sm">Ver Alunos</span>
                        <span class="status-badge bg-gray-100 text-gray-700 font-black text-xs px-3 py-1.5 rounded-lg flex items-center shrink-0 border border-gray-200">
                           ${statusExibicao}
                        </span>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        
        document.querySelectorAll('#grid-clubes > div').forEach(card => {
            atualizarBadgeStatusCard(card, card.dataset.status);
        });

        updateDashboardStats();
    } catch (erro) {
        grid.innerHTML = '<p class="text-red-500 font-bold p-4">Erro ao carregar dados.</p>';
        console.error(erro);
    }
}

async function openClubeDetails(cardElement, idClube, nomeClube) {
    clubeAtualCard = cardElement;
    clubeAtualId = idClube; 

    document.getElementById('detalhes-titulo').innerText = nomeClube;
    const categoria = cardElement.dataset.categoria || 'Clubes Iniciais';
    const categoriaEstilo = cardElement.dataset.categoriaEstilo || 'bg-sky-100 text-sky-700 border-sky-200';
    aplicarBadgeCategoriaDetalhes(categoria, categoriaEstilo);

    document.getElementById('detalhes-escola').innerText = `🏫 ${cardElement.dataset.escola || '-'}`;
    document.getElementById('detalhes-utec').innerText = cardElement.dataset.utec || '-';
    document.getElementById('detalhes-prof').innerText = `👩‍🏫 Profª ${cardElement.dataset.prof || '-'}`;
    document.getElementById('detalhes-estag').innerText = `👨‍💻 ${cardElement.dataset.estag || '-'} (Estag)`;
    document.getElementById('detalhes-dias').innerText = cardElement.dataset.dias || '-';
    document.getElementById('detalhes-horario').innerText = cardElement.dataset.horario || '-';
    
    document.getElementById('status-clube').value = cardElement.dataset.status || 'em_andamento';
    
    // Atualiza apenas a interface inicialmente, sem enviar o comando de salvar pro backend
    const valorStatus = document.getElementById('status-clube').value;
    document.getElementById('status-clube').className = `font-black text-xs px-3 py-1.5 rounded-lg mt-1 border outline-none cursor-pointer w-fit appearance-none text-center ${STATUS_STYLE[valorStatus].select.join(' ')}`;

    navigate('view-clube-detalhes');
    document.getElementById('lista-alunos-clube').innerHTML = '<p class="p-3 text-sm font-bold text-gray-500">A sincronizar alunos...</p>';
    
    ['lista-scratch', 'lista-ev3', 'lista-maker', 'lista-python'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });

    try {
        const [resEncontros, resAlunos] = await Promise.all([
            fetch(`${API_URL}?acao=listar_encontros&id_clube=${idClube}`).then(r => r.json()),
            fetch(`${API_URL}?acao=listar_alunos&id_clube=${idClube}`).then(r => r.json())
        ]);

        const listaAlunos = document.getElementById('lista-alunos-clube');
        listaAlunos.innerHTML = '';
        contadorAlunos = resAlunos.length;
        atualizarContadorAlunoDoCardAtual();

        if(resAlunos.length === 0) {
             listaAlunos.innerHTML = '<p class="p-3 text-sm font-bold text-gray-400">Nenhum aluno vinculado ainda.</p>';
        } else {
            resAlunos.forEach(aluno => {
                listaAlunos.insertAdjacentHTML('beforeend', gerarHTMLAluno(aluno.Nome, aluno.Matricula));
            });
        }

        // AGORA PASSAMOS O ID DO ENCONTRO PARA O HTML
        resEncontros.forEach(encontro => {
            const listaDestino = document.getElementById(encontro.Modulo);
            if(listaDestino) {
                listaDestino.insertAdjacentHTML('beforeend', gerarHTMLEncontro(encontro.ID_Encontro, encontro.Assunto, encontro.Data, encontro.Status));
            }
        });

    } catch (erro) {
        console.error("Erro ao carregar detalhes do clube:", erro);
        document.getElementById('lista-alunos-clube').innerHTML = '<p class="p-3 text-sm font-bold text-red-500">Erro ao transferir dados da folha.</p>';
    }
}

async function onSubmitNovoClube(e) {
    e.preventDefault();
    
    const btn = document.querySelector('#form-clube button[type="submit"]');
    const txtOriginal = btn.innerText;
    btn.innerText = 'A guardar...';
    btn.disabled = true;

    const nome = document.getElementById('input-clube-nome').value.trim();
    const escola = document.getElementById('input-clube-escola').value.trim();
    const utec = document.getElementById('input-clube-utec').value.trim();
    const prof = document.getElementById('input-clube-prof').value.trim();
    const estag = document.getElementById('input-clube-estag').value.trim();
    const dias = document.getElementById('input-clube-dias').value.trim();
    const horario = document.getElementById('input-clube-horario').value.trim();
    const categoria = document.getElementById('input-clube-categoria').value;

    try {
        const payload = {
            acao: 'salvar_clube',
            nome: nome, escola: escola, utec: utec, prof: prof, estag: estag,
            dias: dias, horario: horario, categoria: categoria, status: 'pendente'
        };

        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const resposta = await res.json();

        if(resposta.sucesso) {
            closeModal('modal-clube', 'modal-clube-content');
            document.getElementById('form-clube').reset();
            carregarClubes(); 
        }
    } catch (err) {
        console.error("Erro ao guardar clube:", err);
        alert('Falha na ligação com a base de dados.');
    } finally {
        btn.innerText = txtOriginal;
        btn.disabled = false;
    }
}

async function onSubmitEncontro(e) {
    e.preventDefault();
    if (!clubeAtualId) return alert('Nenhum clube selecionado.');

    const btn = document.querySelector('#form-encontro button[type="submit"]');
    const txtOriginal = btn.innerText;
    btn.innerText = 'A guardar...';

    const moduloId = document.getElementById('input-modulo').value;
    const titulo = document.getElementById('input-titulo').value;
    const dataBruta = document.getElementById('input-data').value;
    const dataFormatada = formatarData(dataBruta);

    try {
        const payload = {
            acao: 'salvar_encontro',
            id_clube: clubeAtualId,
            modulo: moduloId,
            assunto: titulo,
            data: dataFormatada
        };

        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const resposta = await res.json();

        if (resposta.sucesso) {
            const listaDestino = document.getElementById(moduloId);
            // Passamos o NOVO ID gerado na planilha para a tela
            listaDestino.insertAdjacentHTML('beforeend', gerarHTMLEncontro(resposta.id, titulo, dataFormatada, 'A FAZER'));
            listaDestino.parentElement.open = true;
            closeModal('modal-encontro', 'modal-encontro-content');
        }
    } catch (err) {
        console.error("Erro ao guardar encontro:", err);
        alert('Falha na ligação com a base de dados.');
    } finally {
        btn.innerText = txtOriginal;
    }
}

async function onSubmitAluno(e) {
    e.preventDefault();
    if (!clubeAtualId) return alert('Nenhum clube selecionado.');

    const btn = document.querySelector('#form-aluno button[type="submit"]');
    const txtOriginal = btn.innerText;
    btn.innerText = 'A guardar...';

    const matricula = document.getElementById('input-aluno-matricula').value || 'S/ Matrícula';
    const nome = document.getElementById('input-aluno-nome').value;

    try {
        const payload = { acao: 'salvar_aluno', id_clube: clubeAtualId, matricula: matricula, nome: nome };
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const resposta = await res.json();

        if (resposta.sucesso) {
            if(contadorAlunos === 0) document.getElementById('lista-alunos-clube').innerHTML = '';
            
            document.getElementById('lista-alunos-clube').insertAdjacentHTML('beforeend', gerarHTMLAluno(nome, matricula));
            contadorAlunos++;
            atualizarContadorAlunoDoCardAtual();
            closeModal('modal-aluno', 'modal-aluno-content');
        }
    } catch (err) {
        console.error("Erro ao guardar aluno:", err);
        alert('Falha na ligação com a base de dados.');
    } finally {
        btn.innerText = txtOriginal;
    }
}

function logout() { window.location.href = 'index.html'; }

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
        if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
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
        pageTitle.innerText = 'Visão Geral';
        pageSubtitle.style.display = 'block';
        pageSubtitle.innerText = 'Resumo operacional dos clubes';
        btnAddClube.classList.add('hidden');
        btnAddClube.style.display = 'none';
    } else if (viewId === 'view-clubes') {
        pageTitle.innerText = 'Clubes Ativos';
        pageSubtitle.style.display = 'block';
        pageSubtitle.innerText = 'Gestão das turmas de robótica';
        btnAddClube.classList.remove('hidden');
        btnAddClube.style.display = 'flex';
    } else {
        pageTitle.innerText = 'Painel da Trilha';
        pageSubtitle.style.display = 'none';
        btnAddClube.classList.add('hidden');
        btnAddClube.style.display = 'none';
    }

    if (btnElement) setActiveNav(btnElement);
}

function aplicarBadgeCategoriaDetalhes(nomeCategoria, estiloCategoria) {
    const badge = document.getElementById('detalhes-categoria-badge');
    badge.innerText = nomeCategoria;
    badge.className = `font-extrabold text-xs px-3 py-1 rounded-lg border w-fit ${estiloCategoria}`;
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

// --- FUNÇÕES DE ATUALIZAÇÃO DE STATUS NO BANCO DE DADOS ---

async function toggleStatus(btn, idEncontro) {
    const novoStatus = btn.innerText.trim() === 'A FAZER' ? 'FEITO' : 'A FAZER';
    const txtOriginal = btn.innerText;

    btn.innerText = '...';
    btn.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                acao: 'atualizar_status_encontro',
                id_encontro: idEncontro,
                status: novoStatus
            })
        });
        
        const resposta = await res.json();

        if (resposta.sucesso) {
            if (novoStatus === 'FEITO') {
                btn.innerText = 'FEITO';
                btn.className = 'btn-3d status-btn bg-green-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] border-green-700 transition-colors';
            } else {
                btn.innerText = 'A FAZER';
                btn.className = 'btn-3d status-btn bg-red-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] border-red-700 transition-colors';
            }
        } else {
            btn.innerText = txtOriginal;
            alert('Falha ao atualizar status.');
        }
    } catch (err) {
        console.error('Erro:', err);
        btn.innerText = txtOriginal;
    } finally {
        btn.disabled = false;
    }
}

async function changeClubStatus(selectElement, syncCard = true) {
    const valor = selectElement.value;
    const style = STATUS_STYLE[valor] || STATUS_STYLE.em_andamento;
    
    selectElement.className = `font-black text-xs px-3 py-1.5 rounded-lg mt-1 border outline-none cursor-pointer w-fit appearance-none text-center ${style.select.join(' ')}`;

    if (syncCard && clubeAtualCard) {
        clubeAtualCard.dataset.status = valor;
        atualizarBadgeStatusCard(clubeAtualCard, valor);
        updateDashboardStats();

        // Envia atualização para a base de dados se um clube estiver aberto
        if (clubeAtualId) {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        acao: 'atualizar_status_clube',
                        id_clube: clubeAtualId,
                        status: valor
                    })
                });
            } catch (err) {
                console.error("Erro ao atualizar status do clube:", err);
            }
        }
    }
}

// --- FUNÇÕES DE INTERFACE HTML ---

function atualizarBadgeStatusCard(cardElement, status) {
    const badge = cardElement.querySelector('.status-badge');
    const style = STATUS_STYLE[status] || STATUS_STYLE.em_andamento;
    if (badge) {
        badge.className = `status-badge font-black text-xs px-3 py-1.5 rounded-lg flex items-center shrink-0 border ${style.badge.join(' ')}`;
        badge.innerHTML = `<div class="status-dot w-2 h-2 ${style.dot} rounded-full mr-2"></div> ${style.text}`;
    }
}

function formatarData(dataISO) {
    if (!dataISO) return '';
    const partes = dataISO.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHtml(texto) {
    return String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function categoriaInfo(valor) {
    if (valor === 'mistos' || valor === 'Clubes Mistos') return { nome: 'Clubes Mistos', estilo: 'bg-violet-100 text-violet-700 border-violet-200' };
    if (valor === 'finais' || valor === 'Clubes Finais') return { nome: 'Clubes Finais', estilo: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    return { nome: 'Clubes Iniciais', estilo: 'bg-sky-100 text-sky-700 border-sky-200' };
}

function atualizarContadorAlunoDoCardAtual() {
    if (!clubeAtualCard) return;
    const span = clubeAtualCard.querySelector('.card-alunos-count');
    if (span) span.innerText = `${contadorAlunos} Alunos`;
}

function updateDashboardStats() {
    const cards = Array.from(document.querySelectorAll('#grid-clubes > div'));
    const stats = { total: cards.length, iniciais: 0, mistos: 0, finais: 0, pendente: 0, em_andamento: 0, concluido: 0 };

    cards.forEach((card) => {
        const categoria = card.dataset.categoria || '';
        const status = card.dataset.status || 'em_andamento';

        if (categoria === 'Clubes Iniciais') stats.iniciais++;
        if (categoria === 'Clubes Mistos') stats.mistos++;
        if (categoria === 'Clubes Finais') stats.finais++;

        if (status === 'pendente') stats.pendente++;
        if (status === 'em_andamento') stats.em_andamento++;
        if (status === 'concluido') stats.concluido++;
    });

    document.getElementById('stat-total-clubes').innerText = String(stats.total);
    document.getElementById('stat-iniciais').innerText = String(stats.iniciais);
    document.getElementById('stat-mistos').innerText = String(stats.mistos);
    document.getElementById('stat-finais').innerText = String(stats.finais);
    document.getElementById('stat-pendentes').innerText = String(stats.pendente);
    document.getElementById('stat-andamento').innerText = String(stats.em_andamento);
    document.getElementById('stat-concluidos').innerText = String(stats.concluido);
}

function gerarHTMLAluno(nome, matricula) {
    return `
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
}

function gerarHTMLEncontro(idEncontro, titulo, data, status) {
    const isFeito = status === 'FEITO';
    const classBtn = isFeito 
        ? 'bg-green-500 text-white border-green-700' 
        : 'bg-red-500 text-white border-red-700';

    // Repare que o idEncontro é passado para dentro da função toggleStatus aqui
    return `
        <div class="item-encontro flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm animate-[fadeIn_0.3s_ease-in-out]">
            <div class="flex-1">
                <p class="font-black text-gray-800 text-sm leading-tight pr-2">${escapeHtml(titulo)}</p>
                <span class="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md mt-1.5 inline-block">📅 ${escapeHtml(data)}</span>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="toggleStatus(this, '${idEncontro}')" class="btn-3d status-btn ${classBtn} font-black text-[10px] px-2.5 py-1.5 rounded-md border-b-[3px] transition-colors">${isFeito ? 'FEITO' : 'A FAZER'}</button>
                <button type="button" onclick="removerItem(this)" class="text-gray-300 hover:text-red-500 font-black text-base transition" title="Remover">×</button>
            </div>
        </div>
    `;
}