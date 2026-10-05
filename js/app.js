/**
 * Fut de Domingo - Sistema de Estatísticas e Partidas entre Amigos
 * 100% puro (HTML, CSS, JS), LocalStorage, totalmente gerenciável pelo usuário.
 */

// ==========================================
// ESTADO GLOBAL DO SISTEMA
// ==========================================
const AppState = {
  players: [],      // [{ id, name, pos, games, goals, assists }]
  teams: [],        // [{ id, name, playerIds: [] }]
  matches: [],      // [{ id, date, teamA: { id, name, score, playerIds: [] }, teamB: { id, name, score, playerIds: [] }, events: [] }]
  activeMatch: null,// Partida em andamento no momento
  activeTab: 'home',
  rankingFilter: 'overall',
  playerSearchQuery: '',
  playerPosFilter: 'all',
  playerSortBy: 'name',
  statsSearchQuery: '',
  statsPosFilter: 'all'
};

const STORAGE_KEYS = {
  PLAYERS: 'futebol_fc_players',
  TEAMS: 'futebol_fc_teams',
  MATCHES: 'futebol_fc_matches',
  ACTIVE_MATCH: 'futebol_fc_active_match'
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
function initApp() {
  loadFromStorage();
  setupEventListeners();
  renderAllViews();
}

function loadFromStorage() {
  // Inicializa completamente vazio se o usuário nunca cadastrou nada
  const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const storedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
  const storedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
  const storedActiveMatch = localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH);

  AppState.players = storedPlayers ? JSON.parse(storedPlayers) : [];
  AppState.teams = storedTeams ? JSON.parse(storedTeams) : [];
  AppState.matches = storedMatches ? JSON.parse(storedMatches) : [];
  AppState.activeMatch = storedActiveMatch ? JSON.parse(storedActiveMatch) : null;
}

function savePlayers() {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(AppState.players));
}

function saveTeams() {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(AppState.teams));
}

function saveMatches() {
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(AppState.matches));
}

function saveActiveMatch() {
  if (AppState.activeMatch) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH, JSON.stringify(AppState.activeMatch));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH);
  }
}

// Helpers
function getPlayerById(id) {
  return AppState.players.find(p => p.id === id);
}

function getTeamById(id) {
  return AppState.teams.find(t => t.id === id);
}

function calculateScore(player) {
  return ((player.goals || 0) * 3) + ((player.assists || 0) * 2) + ((player.games || 0) * 1);
}

// ==========================================
// NAVEGAÇÃO ENTRE AS 6 ABAS
// ==========================================
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Atualiza botões no Desktop
  document.querySelectorAll('.desktop-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Atualiza botões no Mobile
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Atualiza views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${tabId}`);
  });

  // Renderiza a view ativa
  if (tabId === 'home') renderHomeView();
  if (tabId === 'players') renderPlayersView();
  if (tabId === 'teams') renderTeamsView();
  if (tabId === 'matches') renderMatchesView();
  if (tabId === 'stats') renderStatsView();
  if (tabId === 'ranking') renderRankingView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 1. ABA INÍCIO
// ==========================================
function renderHomeView() {
  const totalPlayers = AppState.players.length;
  const totalTeams = AppState.teams.length;
  const totalMatches = AppState.matches.length;
  const totalGoals = AppState.players.reduce((sum, p) => sum + (p.goals || 0), 0);

  document.getElementById('home-count-players').textContent = totalPlayers;
  document.getElementById('home-count-teams').textContent = totalTeams;
  document.getElementById('home-count-matches').textContent = totalMatches;
  document.getElementById('home-count-goals').textContent = totalGoals;

  // Destaque Artilheiro
  const sortedGoals = [...AppState.players].sort((a, b) => b.goals - a.goals);
  const topScorer = sortedGoals[0];
  const scorerBox = document.getElementById('home-top-scorer-box');

  if (topScorer && topScorer.goals > 0) {
    scorerBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="player-avatar">${topScorer.name.substring(0, 2).toUpperCase()}</div>
        <div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-white);">${escapeHtml(topScorer.name)}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            <strong style="color: var(--blue-light); font-size: 1.1rem;">${topScorer.goals}</strong> gols marcados
          </div>
        </div>
      </div>
    `;
  } else {
    scorerBox.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.88rem;">
        Nenhum gol registrado ainda. Comece criando times e partidas!
      </p>
    `;
  }

  // Destaque Assistências
  const sortedAssists = [...AppState.players].sort((a, b) => b.assists - a.assists);
  const topAssister = sortedAssists[0];
  const assisterBox = document.getElementById('home-top-assister-box');

  if (topAssister && topAssister.assists > 0) {
    assisterBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="player-avatar">${topAssister.name.substring(0, 2).toUpperCase()}</div>
        <div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-white);">${escapeHtml(topAssister.name)}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            <strong style="color: var(--blue-bright); font-size: 1.1rem;">${topAssister.assists}</strong> assistências realizadas
          </div>
        </div>
      </div>
    `;
  } else {
    assisterBox.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.88rem;">
        Nenhuma assistência registrada ainda.
      </p>
    `;
  }

  // Partidas Recentes no Início
  const recentList = document.getElementById('home-recent-matches-list');
  if (AppState.matches.length === 0) {
    recentList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚽</div>
        <div class="empty-title">Nenhuma partida finalizada</div>
        <div class="empty-desc">Cadastre jogadores, crie seus times e registre sua primeira partida para ver o histórico.</div>
        <button class="btn btn-primary btn-sm" onclick="switchTab('matches')">Criar Partida</button>
      </div>
    `;
  } else {
    recentList.innerHTML = AppState.matches.slice(0, 3).map(m => renderMatchCard(m, false)).join('');
  }
}

// ==========================================
// 2. ABA JOGADORES (CADASTRO, EDIÇÃO & EXCLUSÃO)
// ==========================================
function renderPlayersView() {
  const container = document.getElementById('players-list-grid');
  let list = [...AppState.players];

  // Busca por nome
  if (AppState.playerSearchQuery) {
    const q = AppState.playerSearchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  // Filtro por posição
  if (AppState.playerPosFilter !== 'all') {
    list = list.filter(p => p.pos === AppState.playerPosFilter);
  }

  // Ordenação
  list.sort((a, b) => {
    if (AppState.playerSortBy === 'name') return a.name.localeCompare(b.name);
    if (AppState.playerSortBy === 'goals') return b.goals - a.goals || calculateScore(b) - calculateScore(a);
    if (AppState.playerSortBy === 'assists') return b.assists - a.assists || calculateScore(b) - calculateScore(a);
    if (AppState.playerSortBy === 'games') return b.games - a.games || b.goals - a.goals;
    return 0;
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">👥</div>
        <div class="empty-title">Nenhum jogador encontrado</div>
        <div class="empty-desc">
          ${AppState.players.length === 0 
            ? 'O sistema está pronto. Cadastre os jogadores da sua pelada para começar!' 
            : 'Nenhum jogador corresponde ao filtro de busca.'}
        </div>
        <button class="btn btn-primary" onclick="openPlayerModal()">➕ Cadastrar Jogador</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(player => {
    const initials = player.name.substring(0, 2).toUpperCase();
    const score = calculateScore(player);
    const avgGoals = player.games > 0 ? (player.goals / player.games).toFixed(1) : '0.0';

    return `
      <div class="player-card">
        <div class="player-card-header">
          <div class="player-avatar">${initials}</div>
          <div class="player-info">
            <div class="player-name" title="${escapeHtml(player.name)}">${escapeHtml(player.name)}</div>
            <span class="player-pos-badge">${escapeHtml(player.pos || 'Linha')}</span>
          </div>
          <div class="player-actions-menu">
            <button class="btn-card-action" onclick="openPlayerModal('${player.id}')" title="Editar Jogador">✏️</button>
            <button class="btn-card-action delete" onclick="deletePlayer('${player.id}')" title="Excluir Jogador">🗑️</button>
          </div>
        </div>

        <div class="player-stats-row">
          <div class="player-stat-col">
            <span class="pstat-label">🏟️ Jogos</span>
            <span class="pstat-val">${player.games || 0}</span>
          </div>
          <div class="player-stat-col">
            <span class="pstat-label">⚽ Gols</span>
            <span class="pstat-val" style="color: var(--blue-light);">${player.goals || 0}</span>
          </div>
          <div class="player-stat-col">
            <span class="pstat-label">🎯 Assist.</span>
            <span class="pstat-val" style="color: var(--blue-bright);">${player.assists || 0}</span>
          </div>
        </div>

        <div class="player-card-footer">
          <span>Média: <strong>${avgGoals}</strong> gols/jogo</span>
          <span class="player-score-tag">🏆 ${score} pts</span>
        </div>
      </div>
    `;
  }).join('');
}

function openPlayerModal(playerId = null) {
  const modal = document.getElementById('modal-player');
  const title = document.getElementById('modal-player-title');
  const idInput = document.getElementById('input-player-id');
  const nameInput = document.getElementById('input-player-name');
  const posInput = document.getElementById('input-player-pos');
  const gamesInput = document.getElementById('input-player-games');
  const goalsInput = document.getElementById('input-player-goals');
  const assistsInput = document.getElementById('input-player-assists');

  if (playerId) {
    const p = getPlayerById(playerId);
    if (!p) return;
    title.textContent = '✏️ Editar Jogador';
    idInput.value = p.id;
    nameInput.value = p.name;
    posInput.value = p.pos || 'Linha';
    gamesInput.value = p.games || 0;
    goalsInput.value = p.goals || 0;
    assistsInput.value = p.assists || 0;
  } else {
    title.textContent = '➕ Adicionar Jogador';
    idInput.value = '';
    nameInput.value = '';
    posInput.value = 'Linha';
    gamesInput.value = 0;
    goalsInput.value = 0;
    assistsInput.value = 0;
  }

  openModal('modal-player');
  setTimeout(() => nameInput.focus(), 100);
}

function handlePlayerFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('input-player-id').value;
  const name = document.getElementById('input-player-name').value.trim();
  const pos = document.getElementById('input-player-pos').value;
  const games = parseInt(document.getElementById('input-player-games').value) || 0;
  const goals = parseInt(document.getElementById('input-player-goals').value) || 0;
  const assists = parseInt(document.getElementById('input-player-assists').value) || 0;

  if (!name) return;

  if (id) {
    // Editar
    const p = getPlayerById(id);
    if (p) {
      p.name = name;
      p.pos = pos;
      p.games = games;
      p.goals = goals;
      p.assists = assists;
    }
  } else {
    // Novo
    const newPlayer = {
      id: 'p_' + Date.now(),
      name,
      pos,
      games,
      goals,
      assists
    };
    AppState.players.push(newPlayer);
  }

  savePlayers();
  closeModal('modal-player');
  renderAllViews();
}

function deletePlayer(playerId) {
  const p = getPlayerById(playerId);
  if (!p) return;

  if (confirm(`Deseja realmente excluir o jogador "${p.name}"?`)) {
    // Remove da lista
    AppState.players = AppState.players.filter(item => item.id !== playerId);
    
    // Remove de times
    AppState.teams.forEach(t => {
      t.playerIds = t.playerIds.filter(id => id !== playerId);
    });

    savePlayers();
    saveTeams();
    renderAllViews();
  }
}

// ==========================================
// 3. ABA TIMES (CRIAÇÃO, ESCALAÇÃO & SORTEIO POR POSIÇÕES)
// ==========================================
function renderTeamsView() {
  const container = document.getElementById('teams-grid-container');
  const benchContainer = document.getElementById('bench-players-list');
  const benchCountEl = document.getElementById('bench-players-count');

  // Jogadores já escalados em algum time
  const assignedIds = new Set();
  AppState.teams.forEach(t => t.playerIds.forEach(id => assignedIds.add(id)));

  if (AppState.teams.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⚽</div>
        <div class="empty-title">Nenhum time criado ainda</div>
        <div class="empty-desc">Crie dois ou mais times (ex: Time Azul e Time Branco) para escalar seus jogadores.</div>
        <button class="btn btn-primary" onclick="openTeamModal()">➕ Criar Primeiro Time</button>
      </div>
    `;
  } else {
    container.innerHTML = AppState.teams.map((team, index) => {
      const count = team.playerIds.length;

      const playersListHtml = team.playerIds.map(pid => {
        const p = getPlayerById(pid);
        if (!p) return '';
        return `
          <div class="team-player-item">
            <div class="tp-name">
              <span>👤</span>
              <span>${escapeHtml(p.name)}</span>
              <span class="tp-pos-tag">${escapeHtml(p.pos || 'Linha')}</span>
            </div>
            <button class="tp-remove" onclick="removePlayerFromTeam('${team.id}', '${p.id}')" title="Mover para os disponíveis">✖</button>
          </div>
        `;
      }).join('');

      return `
        <div class="team-builder-card">
          <div class="team-header">
            <div class="team-title-wrap">
              <div class="team-color-indicator"></div>
              <input type="text" class="team-name-input" value="${escapeHtml(team.name)}" onchange="updateTeamName('${team.id}', this.value)" title="Clique para editar o nome do time">
            </div>
            <div class="team-header-actions">
              <span class="team-count-badge">${count} ${count === 1 ? 'jogador' : 'jogadores'}</span>
              <button class="btn-card-action delete" onclick="deleteTeam('${team.id}')" title="Excluir Time">🗑️</button>
            </div>
          </div>
          <div class="team-players-list">
            ${playersListHtml || `<div class="empty-state" style="padding: 20px 0;"><p style="font-size: 0.85rem;">Nenhum jogador escalado neste time</p></div>`}
          </div>
        </div>
      `;
    }).join('');
  }

  // Jogadores Disponíveis no Banco
  const availablePlayers = AppState.players.filter(p => !assignedIds.has(p.id));
  benchCountEl.textContent = availablePlayers.length;

  if (availablePlayers.length === 0) {
    benchContainer.innerHTML = `
      <span style="color: var(--text-muted); font-size: 0.88rem; padding: 6px;">
        ${AppState.players.length === 0 ? 'Cadastre jogadores na aba "Jogadores" para escalá-los aqui.' : 'Todos os jogadores cadastrados já estão escalados em algum time!'}
      </span>
    `;
  } else {
    benchContainer.innerHTML = availablePlayers.map(p => {
      // Botões para adicionar em cada um dos times existentes
      const assignButtons = AppState.teams.map((t, idx) => {
        const teamNumber = idx + 1;
        return `
          <button class="chip-assign-btn" onclick="addPlayerToTeam('${t.id}', '${p.id}')" title="Adicionar ao ${t.name}">
            +${teamNumber}
          </button>
        `;
      }).join('');

      return `
        <div class="bench-player-chip">
          <span>${escapeHtml(p.name)} (${escapeHtml(p.pos || 'Linha')})</span>
          <div class="chip-assign-buttons">
            ${assignButtons}
          </div>
        </div>
      `;
    }).join('');
  }
}

function openTeamModal(teamId = null) {
  const title = document.getElementById('modal-team-title');
  const idInput = document.getElementById('input-team-id');
  const nameInput = document.getElementById('input-team-name');

  if (teamId) {
    const t = getTeamById(teamId);
    if (!t) return;
    title.textContent = '✏️ Editar Time';
    idInput.value = t.id;
    nameInput.value = t.name;
  } else {
    title.textContent = '⚽ Criar Novo Time';
    idInput.value = '';
    nameInput.value = `Time ${AppState.teams.length + 1}`;
  }

  openModal('modal-team');
  setTimeout(() => nameInput.focus(), 100);
}

function handleTeamFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('input-team-id').value;
  const name = document.getElementById('input-team-name').value.trim();

  if (!name) return;

  if (id) {
    const t = getTeamById(id);
    if (t) t.name = name;
  } else {
    AppState.teams.push({
      id: 't_' + Date.now(),
      name,
      playerIds: []
    });
  }

  saveTeams();
  closeModal('modal-team');
  renderTeamsView();
}

function updateTeamName(teamId, newName) {
  const team = getTeamById(teamId);
  if (team && newName.trim()) {
    team.name = newName.trim();
    saveTeams();
  }
}

function deleteTeam(teamId) {
  const team = getTeamById(teamId);
  if (!team) return;

  if (confirm(`Deseja excluir o time "${team.name}"? Os jogadores voltarão para a lista de disponíveis.`)) {
    AppState.teams = AppState.teams.filter(t => t.id !== teamId);
    saveTeams();
    renderTeamsView();
  }
}

function addPlayerToTeam(teamId, playerId) {
  const team = getTeamById(teamId);
  if (!team) return;

  // Remove de qualquer outro time
  AppState.teams.forEach(t => {
    t.playerIds = t.playerIds.filter(id => id !== playerId);
  });

  team.playerIds.push(playerId);
  saveTeams();
  renderTeamsView();
}

function removePlayerFromTeam(teamId, playerId) {
  const team = getTeamById(teamId);
  if (!team) return;

  team.playerIds = team.playerIds.filter(id => id !== playerId);
  saveTeams();
  renderTeamsView();
}

function clearAllTeams() {
  if (AppState.teams.length === 0) return;
  if (confirm('Deseja mover todos os jogadores de volta para o banco de disponíveis?')) {
    AppState.teams.forEach(t => t.playerIds = []);
    saveTeams();
    renderTeamsView();
  }
}

// Sorteio Inteligente de Acordo com as Posições Corretas
function shuffleTeamsByPositions() {
  if (AppState.teams.length < 2) {
    alert('Você precisa criar pelo menos 2 times para realizar o sorteio.');
    return;
  }

  if (AppState.players.length === 0) {
    alert('Cadastre os jogadores antes de realizar o sorteio.');
    return;
  }

  if (confirm('Deseja sortear e dividir todos os jogadores entre os times de acordo com suas posições?')) {
    // 1. Limpa as escalações atuais
    AppState.teams.forEach(t => t.playerIds = []);

    // 2. Agrupa jogadores por posição
    const posGroups = {
      goleiros: AppState.players.filter(p => p.pos === 'Goleiro'),
      zagueiros: AppState.players.filter(p => p.pos === 'Zagueiro'),
      meias: AppState.players.filter(p => p.pos === 'Meia'),
      atacantes: AppState.players.filter(p => p.pos === 'Atacante'),
      outros: AppState.players.filter(p => !['Goleiro', 'Zagueiro', 'Meia', 'Atacante'].includes(p.pos))
    };

    // Função auxiliar para embaralhar um array aleatoriamente
    const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

    let currentTeamIdx = 0;
    const numTeams = AppState.teams.length;

    // 3. Distribui cada categoria de posição equilibradamente
    ['goleiros', 'zagueiros', 'meias', 'atacantes', 'outros'].forEach(cat => {
      const playersInCat = shuffleArray([...posGroups[cat]]);
      playersInCat.forEach(p => {
        AppState.teams[currentTeamIdx].playerIds.push(p.id);
        currentTeamIdx = (currentTeamIdx + 1) % numTeams;
      });
    });

    saveTeams();
    renderTeamsView();
    showToast('🎲 Times sorteados e equilibrados por posição com sucesso!');
  }
}

// ==========================================
// 4. ABA PARTIDAS (CRIAR, PLACAR, GOLS & FINALIZAR)
// ==========================================
function renderMatchesView() {
  const activeContainer = document.getElementById('active-match-container');
  const historyContainer = document.getElementById('matches-history-list');
  const historyBadge = document.getElementById('history-matches-badge');

  historyBadge.textContent = `${AppState.matches.length} ${AppState.matches.length === 1 ? 'partida registrada' : 'partidas registradas'}`;

  // Se houver partida ativa
  if (AppState.activeMatch) {
    const m = AppState.activeMatch;
    const rosterA = m.teamA.playerIds.map(id => {
      const p = getPlayerById(id);
      return p ? p.name : '';
    }).filter(Boolean).join(', ') || 'Nenhum jogador escalado';

    const rosterB = m.teamB.playerIds.map(id => {
      const p = getPlayerById(id);
      return p ? p.name : '';
    }).filter(Boolean).join(', ') || 'Nenhum jogador escalado';

    activeContainer.innerHTML = `
      <div class="match-arena-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span class="hero-badge">⚽ PARTIDA EM ANDAMENTO</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Data: ${m.date || 'Hoje'}</span>
        </div>

        <div class="scoreboard-vs-grid">
          <!-- Time A -->
          <div class="team-score-column">
            <div class="team-score-name">${escapeHtml(m.teamA.name)}</div>
            <div class="team-players-count-pill">👥 ${m.teamA.playerIds.length} jogadores</div>
            <div class="team-score-num" id="active-score-a">${m.teamA.score}</div>
            <button class="btn btn-primary" onclick="openGoalModal('teamA')">
              ⚽ + Gol ${escapeHtml(m.teamA.name)}
            </button>
          </div>

          <div class="vs-separator">
            <span class="vs-text">VS</span>
            <button class="btn btn-secondary btn-sm" onclick="openEditScoreModal()" title="Editar placar manualmente">✏️ Ajustar</button>
          </div>

          <!-- Time B -->
          <div class="team-score-column">
            <div class="team-score-name">${escapeHtml(m.teamB.name)}</div>
            <div class="team-players-count-pill">👥 ${m.teamB.playerIds.length} jogadores</div>
            <div class="team-score-num" id="active-score-b">${m.teamB.score}</div>
            <button class="btn btn-primary" onclick="openGoalModal('teamB')">
              ⚽ + Gol ${escapeHtml(m.teamB.name)}
            </button>
          </div>
        </div>

        <!-- Escalações -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 12px; background: var(--bg-surface); border-radius: var(--radius-md); font-size: 0.82rem; margin-bottom: 16px;">
          <div>
            <strong style="color: var(--blue-light); display: block; margin-bottom: 2px;">${escapeHtml(m.teamA.name)}:</strong>
            <span style="color: var(--text-muted);">${escapeHtml(rosterA)}</span>
          </div>
          <div>
            <strong style="color: var(--blue-bright); display: block; margin-bottom: 2px;">${escapeHtml(m.teamB.name)}:</strong>
            <span style="color: var(--text-muted);">${escapeHtml(rosterB)}</span>
          </div>
        </div>

        <!-- Registro de Gols da Partida -->
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--text-white);">
            Gols Anotados Nesta Partida (${m.events.length})
          </h4>
          <div class="events-list">
            ${m.events.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem;">Nenhum gol anotado ainda. Clique nos botões acima para registrar.</p>' : ''}
            ${m.events.map(e => `
              <div class="event-item">
                <div class="event-details">
                  <span class="event-minute">${e.minute || '⚽'}</span>
                  <div class="event-info">
                    <span class="event-scorer">⚽ ${escapeHtml(e.scorerName)} (${escapeHtml(e.teamName)})</span>
                    <span class="event-assist">${e.assistName ? `🎯 Assistência: ${escapeHtml(e.assistName)}` : 'Sem assistência'}</span>
                  </div>
                </div>
                <button class="btn-remove-event" onclick="removeActiveMatchEvent('${e.id}')" title="Excluir este gol">✖</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Ações da Partida -->
        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn btn-danger btn-sm" onclick="cancelActiveMatch()">Cancelar Partida</button>
          <button class="btn btn-primary" onclick="finishAndSaveActiveMatch()">
            🏁 Finalizar Partida & Salvar Estatísticas
          </button>
        </div>
      </div>
    `;
  } else {
    activeContainer.innerHTML = '';
  }

  // Histórico de Partidas
  if (AppState.matches.length === 0 && !AppState.activeMatch) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏟️</div>
        <div class="empty-title">Nenhuma partida realizada ainda</div>
        <div class="empty-desc">Clique no botão "Nova Partida" para iniciar uma disputa entre os times cadastrados.</div>
        <button class="btn btn-primary" onclick="openNewMatchModal()">➕ Criar Nova Partida</button>
      </div>
    `;
  } else {
    historyContainer.innerHTML = AppState.matches.map(m => renderMatchCard(m, true)).join('');
  }
}

function renderMatchCard(match, allowActions = true) {
  const goalsSummary = match.events && match.events.length > 0
    ? match.events.map(e => `
        <div>
          ⚽ <strong>${escapeHtml(e.scorerName)}</strong> (${escapeHtml(e.teamName || '')})
          ${e.assistName ? `<span style="opacity: 0.75;">- Assist: ${escapeHtml(e.assistName)}</span>` : ''}
        </div>
      `).join('')
    : '<span style="opacity: 0.6;">Nenhum gol anotado nesta partida</span>';

  return `
    <div class="history-card">
      <div class="history-header">
        <span>📅 ${match.date || 'Data não informada'}</span>
        ${allowActions ? `
          <div style="display: flex; gap: 6px;">
            <button class="btn-card-action delete" onclick="deleteSavedMatch('${match.id}')" title="Excluir Partida">🗑️ Excluir</button>
          </div>
        ` : ''}
      </div>
      <div class="history-score-row">
        <span class="history-team-name team-a">${escapeHtml(match.teamA.name)}</span>
        <span class="history-score-badge">${match.teamA.score} x ${match.teamB.score}</span>
        <span class="history-team-name team-b">${escapeHtml(match.teamB.name)}</span>
      </div>
      <div class="history-goals-detail">
        ${goalsSummary}
      </div>
    </div>
  `;
}

function openNewMatchModal() {
  if (AppState.teams.length < 2) {
    alert('Você precisa ter pelo menos 2 times criados para iniciar uma partida.');
    switchTab('teams');
    return;
  }

  const selectA = document.getElementById('select-match-team-a');
  const selectB = document.getElementById('select-match-team-b');
  const dateInput = document.getElementById('input-match-date');

  selectA.innerHTML = AppState.teams.map((t, idx) => `
    <option value="${t.id}" ${idx === 0 ? 'selected' : ''}>${escapeHtml(t.name)} (${t.playerIds.length} jogadores)</option>
  `).join('');

  selectB.innerHTML = AppState.teams.map((t, idx) => `
    <option value="${t.id}" ${idx === 1 ? 'selected' : ''}>${escapeHtml(t.name)} (${t.playerIds.length} jogadores)</option>
  `).join('');

  dateInput.value = new Date().toISOString().slice(0, 10);

  openModal('modal-match-create');
}

function handleCreateMatchSubmit(e) {
  e.preventDefault();
  const teamAId = document.getElementById('select-match-team-a').value;
  const teamBId = document.getElementById('select-match-team-b').value;
  const dateValue = document.getElementById('input-match-date').value;

  if (teamAId === teamBId) {
    alert('Selecione dois times diferentes para a partida.');
    return;
  }

  const teamA = getTeamById(teamAId);
  const teamB = getTeamById(teamBId);

  // Formata data brasileira
  let formattedDate = new Date().toLocaleDateString('pt-BR');
  if (dateValue) {
    const parts = dateValue.split('-');
    if (parts.length === 3) {
      formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  AppState.activeMatch = {
    id: 'm_' + Date.now(),
    date: formattedDate,
    teamA: {
      id: teamA.id,
      name: teamA.name,
      score: 0,
      playerIds: [...teamA.playerIds]
    },
    teamB: {
      id: teamB.id,
      name: teamB.name,
      score: 0,
      playerIds: [...teamB.playerIds]
    },
    events: []
  };

  saveActiveMatch();
  closeModal('modal-match-create');
  renderMatchesView();
}

function openGoalModal(teamTarget) {
  if (!AppState.activeMatch) return;
  const m = AppState.activeMatch;
  const isTeamA = teamTarget === 'teamA';
  const targetTeam = isTeamA ? m.teamA : m.teamB;

  document.getElementById('goal-team-target').value = teamTarget;
  document.getElementById('modal-goal-team-label').textContent = targetTeam.name;

  const scorerSelect = document.getElementById('goal-scorer-select');
  const assistSelect = document.getElementById('goal-assist-select');

  // Jogadores escalados no time (se o time estiver sem ninguém, permite escolher de todos os jogadores para flexibilidade)
  let players = targetTeam.playerIds.map(id => getPlayerById(id)).filter(Boolean);
  if (players.length === 0) {
    players = [...AppState.players];
  }

  scorerSelect.innerHTML = players.map(p => `
    <option value="${p.id}">${escapeHtml(p.name)} (${p.pos || 'Linha'})</option>
  `).join('');

  assistSelect.innerHTML = `
    <option value="">Ninguém (Gol individual / Pênalti / Rebote)</option>
    ${players.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
  `;

  openModal('modal-goal');
}

function handleGoalFormSubmit(e) {
  e.preventDefault();
  if (!AppState.activeMatch) return;

  const teamTarget = document.getElementById('goal-team-target').value;
  const scorerId = document.getElementById('goal-scorer-select').value;
  const assistId = document.getElementById('goal-assist-select').value;

  const scorer = getPlayerById(scorerId);
  const assist = assistId ? getPlayerById(assistId) : null;

  if (!scorer) return;

  const m = AppState.activeMatch;
  const isTeamA = teamTarget === 'teamA';
  const targetTeam = isTeamA ? m.teamA : m.teamB;

  targetTeam.score += 1;

  const event = {
    id: 'evt_' + Date.now(),
    minute: `${m.events.length + 1}º`,
    teamId: targetTeam.id,
    teamName: targetTeam.name,
    scorerId: scorer.id,
    scorerName: scorer.name,
    assistId: assist ? assist.id : null,
    assistName: assist ? assist.name : null
  };

  m.events.push(event);
  saveActiveMatch();
  closeModal('modal-goal');

  showToast(`⚽ GOL de ${scorer.name}!`);
  renderMatchesView();
}

function removeActiveMatchEvent(eventId) {
  if (!AppState.activeMatch) return;
  const m = AppState.activeMatch;
  const idx = m.events.findIndex(e => e.id === eventId);
  if (idx === -1) return;

  const evt = m.events[idx];
  if (evt.teamId === m.teamA.id && m.teamA.score > 0) m.teamA.score -= 1;
  if (evt.teamId === m.teamB.id && m.teamB.score > 0) m.teamB.score -= 1;

  m.events.splice(idx, 1);
  saveActiveMatch();
  renderMatchesView();
}

function openEditScoreModal() {
  if (!AppState.activeMatch) return;
  const m = AppState.activeMatch;

  document.getElementById('label-score-team-a').textContent = m.teamA.name;
  document.getElementById('label-score-team-b').textContent = m.teamB.name;
  document.getElementById('input-score-team-a').value = m.teamA.score;
  document.getElementById('input-score-team-b').value = m.teamB.score;

  openModal('modal-edit-score');
}

function handleEditScoreSubmit(e) {
  e.preventDefault();
  if (!AppState.activeMatch) return;

  const scoreA = parseInt(document.getElementById('input-score-team-a').value) || 0;
  const scoreB = parseInt(document.getElementById('input-score-team-b').value) || 0;

  AppState.activeMatch.teamA.score = Math.max(0, scoreA);
  AppState.activeMatch.teamB.score = Math.max(0, scoreB);

  saveActiveMatch();
  closeModal('modal-edit-score');
  renderMatchesView();
}

function cancelActiveMatch() {
  if (confirm('Deseja cancelar esta partida em andamento? O placar não será salvo no histórico.')) {
    AppState.activeMatch = null;
    saveActiveMatch();
    renderMatchesView();
  }
}

// Finalizar Partida & Atualizar Automaticamente as Estatísticas dos Jogadores
function finishAndSaveActiveMatch() {
  if (!AppState.activeMatch) return;
  const m = AppState.activeMatch;

  if (!confirm(`Finalizar a partida ${m.teamA.name} ${m.teamA.score} x ${m.teamB.score} ${m.teamB.name}?\n\nOs jogos (+1), gols e assistências serão adicionados aos jogadores participantes.`)) {
    return;
  }

  // 1. Atualiza Jogos (+1) para todos os jogadores escalados
  const participants = new Set([...m.teamA.playerIds, ...m.teamB.playerIds]);
  participants.forEach(pid => {
    const player = getPlayerById(pid);
    if (player) {
      player.games = (player.games || 0) + 1;
    }
  });

  // 2. Atualiza Gols e Assistências dos eventos
  m.events.forEach(evt => {
    if (evt.scorerId) {
      const scorer = getPlayerById(evt.scorerId);
      if (scorer) scorer.goals = (scorer.goals || 0) + 1;
    }
    if (evt.assistId) {
      const assister = getPlayerById(evt.assistId);
      if (assister) assister.assists = (assister.assists || 0) + 1;
    }
  });

  savePlayers();

  // 3. Salva no Histórico de Partidas
  AppState.matches.unshift({ ...m });
  saveMatches();

  // 4. Limpa partida ativa
  AppState.activeMatch = null;
  saveActiveMatch();

  showToast('🏆 Partida Finalizada! Estatísticas atualizadas.');
  renderAllViews();
}

// Excluir Partida Salva e Reverter as Estatísticas dos Jogadores
function deleteSavedMatch(matchId) {
  const matchIndex = AppState.matches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return;

  const match = AppState.matches[matchIndex];

  if (confirm(`Deseja excluir permanentemente a partida "${match.teamA.name} ${match.teamA.score} x ${match.teamB.score} ${match.teamB.name}"?\n\nAs estatísticas (jogos, gols e assistências) somadas por ela serão descontadas automaticamente dos jogadores.`)) {
    // Reverte jogos
    const participants = new Set([...match.teamA.playerIds, ...match.teamB.playerIds]);
    participants.forEach(pid => {
      const player = getPlayerById(pid);
      if (player && player.games > 0) {
        player.games -= 1;
      }
    });

    // Reverte gols e assistências
    match.events.forEach(evt => {
      if (evt.scorerId) {
        const scorer = getPlayerById(evt.scorerId);
        if (scorer && scorer.goals > 0) scorer.goals -= 1;
      }
      if (evt.assistId) {
        const assister = getPlayerById(evt.assistId);
        if (assister && assister.assists > 0) assister.assists -= 1;
      }
    });

    savePlayers();

    // Remove do histórico
    AppState.matches.splice(matchIndex, 1);
    saveMatches();

    renderAllViews();
    showToast('Partida removida e estatísticas recalculadas.');
  }
}

// ==========================================
// 5. ABA ESTATÍSTICAS (PÁGINA DETALHADA)
// ==========================================
function renderStatsView() {
  const container = document.getElementById('stats-table-container');
  let list = [...AppState.players];

  if (AppState.statsSearchQuery) {
    const q = AppState.statsSearchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  if (AppState.statsPosFilter !== 'all') {
    list = list.filter(p => p.pos === AppState.statsPosFilter);
  }

  list.sort((a, b) => b.goals - a.goals || b.assists - a.assists || calculateScore(b) - calculateScore(a));

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Nenhum dado estatístico disponível. Cadastre jogadores e registre partidas.</p>
      </div>
    `;
    return;
  }

  const rows = list.map((p, idx) => {
    const participations = (p.goals || 0) + (p.assists || 0);
    const avg = p.games > 0 ? (p.goals / p.games).toFixed(2) : '0.00';
    const score = calculateScore(p);

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left;">
        <td style="padding: 12px 10px; font-weight: 700; color: var(--text-muted);">${idx + 1}º</td>
        <td style="padding: 12px 10px;">
          <div style="font-weight: 700; color: var(--text-white);">${escapeHtml(p.name)}</div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(p.pos || 'Linha')}</span>
        </td>
        <td style="padding: 12px 10px; font-weight: 700; color: var(--text-white);">${p.games || 0}</td>
        <td style="padding: 12px 10px; font-weight: 800; color: var(--blue-light);">${p.goals || 0}</td>
        <td style="padding: 12px 10px; font-weight: 800; color: var(--blue-bright);">${p.assists || 0}</td>
        <td style="padding: 12px 10px; font-weight: 700; color: var(--text-white);">${participations}</td>
        <td style="padding: 12px 10px; color: var(--text-muted);">${avg}</td>
        <td style="padding: 12px 10px; font-weight: 900; color: var(--blue-light);">${score} pts</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; min-width: 640px; font-size: 0.9rem;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-card); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">
          <th style="padding: 10px;">#</th>
          <th style="padding: 10px;">Jogador</th>
          <th style="padding: 10px;">🏟️ Jogos</th>
          <th style="padding: 10px;">⚽ Gols</th>
          <th style="padding: 10px;">🎯 Assist.</th>
          <th style="padding: 10px;">G+A</th>
          <th style="padding: 10px;">Média G/J</th>
          <th style="padding: 10px;">🏆 Pontos</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// ==========================================
// 6. ABA RANKING
// ==========================================
function renderRankingView() {
  const filter = AppState.rankingFilter;
  const titleEl = document.getElementById('ranking-table-title');
  const podium = document.getElementById('ranking-podium-area');
  const listEl = document.getElementById('ranking-leaderboard-list');

  let sorted = [...AppState.players];

  if (filter === 'overall') {
    titleEl.textContent = 'Classificação Geral (Pontuação Total)';
    sorted.sort((a, b) => calculateScore(b) - calculateScore(a) || b.goals - a.goals);
  } else if (filter === 'goals') {
    titleEl.textContent = 'Ranking de Artilheiros (Mais Gols ⚽)';
    sorted.sort((a, b) => b.goals - a.goals || calculateScore(b) - calculateScore(a));
  } else if (filter === 'assists') {
    titleEl.textContent = 'Ranking de Assistências (Mais Passes 🎯)';
    sorted.sort((a, b) => b.assists - a.assists || calculateScore(b) - calculateScore(a));
  } else if (filter === 'games') {
    titleEl.textContent = 'Ranking de Presença (Mais Jogos 🏟️)';
    sorted.sort((a, b) => b.games - a.games || calculateScore(b) - calculateScore(a));
  }

  // Pódio Visual quando houver pelo menos 3 jogadores cadastrados
  if (sorted.length >= 3 && calculateScore(sorted[0]) > 0) {
    const p1 = sorted[0];
    const p2 = sorted[1];
    const p3 = sorted[2];

    const getScoreDisplay = (p) => {
      if (filter === 'overall') return `${calculateScore(p)} pts`;
      if (filter === 'goals') return `${p.goals} gols`;
      if (filter === 'assists') return `${p.assists} ass`;
      return `${p.games} jogos`;
    };

    podium.innerHTML = `
      <div class="podium-step step-second">
        <div class="podium-avatar">${p2.name.substring(0, 2).toUpperCase()}</div>
        <div class="podium-name">${escapeHtml(p2.name)}</div>
        <div class="podium-score">${getScoreDisplay(p2)}</div>
        <div class="podium-pedestal">2º</div>
      </div>

      <div class="podium-step step-first">
        <div class="podium-avatar">👑</div>
        <div class="podium-name">${escapeHtml(p1.name)}</div>
        <div class="podium-score">${getScoreDisplay(p1)}</div>
        <div class="podium-pedestal">1º</div>
      </div>

      <div class="podium-step step-third">
        <div class="podium-avatar">${p3.name.substring(0, 2).toUpperCase()}</div>
        <div class="podium-name">${escapeHtml(p3.name)}</div>
        <div class="podium-score">${getScoreDisplay(p3)}</div>
        <div class="podium-pedestal">3º</div>
      </div>
    `;
    podium.style.display = 'flex';
  } else {
    podium.style.display = 'none';
  }

  // Lista do Ranking
  if (sorted.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏆</div>
        <div class="empty-title">Ranking Vazio</div>
        <div class="empty-desc">Cadastre jogadores e registre as partidas para que o ranking automático seja gerado!</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = sorted.map((p, idx) => {
    const rank = idx + 1;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
    const score = calculateScore(p);

    return `
      <div class="leaderboard-item ${rankClass}">
        <div class="leader-rank-badge">
          ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}º`}
        </div>
        <div class="leader-player-meta">
          <div class="leader-avatar">${p.name.substring(0, 2).toUpperCase()}</div>
          <div>
            <div class="leader-player-name">${escapeHtml(p.name)}</div>
            <div class="leader-player-sub">${escapeHtml(p.pos || 'Linha')}</div>
          </div>
        </div>
        <div class="leader-stats-group">
          <div class="stat-pill">
            <span class="stat-pill-label">🏟️ J</span>
            <span class="stat-pill-val">${p.games || 0}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill-label">⚽ G</span>
            <span class="stat-pill-val" style="color: var(--blue-light);">${p.goals || 0}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill-label">🎯 A</span>
            <span class="stat-pill-val" style="color: var(--blue-bright);">${p.assists || 0}</span>
          </div>
          <div class="stat-pill primary">
            <span class="stat-pill-label">PTS</span>
            <span class="stat-pill-val">${score}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// BACKUP, EXPORTAÇÃO E IMPORTAÇÃO
// ==========================================
function exportBackup() {
  const data = {
    players: AppState.players,
    teams: AppState.teams,
    matches: AppState.matches,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fut_de_domingo_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.players)) AppState.players = data.players;
      if (Array.isArray(data.teams)) AppState.teams = data.teams;
      if (Array.isArray(data.matches)) AppState.matches = data.matches;

      savePlayers();
      saveTeams();
      saveMatches();
      closeModal('modal-backup');
      renderAllViews();
      showToast('Backup restaurado com sucesso!');
    } catch (err) {
      alert('Erro ao carregar o arquivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function wipeAllData() {
  if (confirm('ATENÇÃO: Deseja apagar permanentemente todos os jogadores, times e partidas salvas? O sistema voltará a ficar 100% limpo.')) {
    AppState.players = [];
    AppState.teams = [];
    AppState.matches = [];
    AppState.activeMatch = null;

    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH);

    closeModal('modal-backup');
    renderAllViews();
    showToast('Todos os dados foram apagados.');
  }
}

// ==========================================
// MODAIS & UTILITÁRIOS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function showToast(text) {
  const toast = document.getElementById('goal-toast');
  const textEl = document.getElementById('goal-toast-text');
  textEl.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderAllViews() {
  renderHomeView();
  renderPlayersView();
  renderTeamsView();
  renderMatchesView();
  renderStatsView();
  renderRankingView();
}

// ==========================================
// LISTENERS DE EVENTOS
// ==========================================
function setupEventListeners() {
  // Navegação por abas
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('brand-home-btn').addEventListener('click', () => switchTab('home'));

  // Jogadores
  document.getElementById('btn-open-player-modal').addEventListener('click', () => openPlayerModal());
  document.getElementById('form-player').addEventListener('submit', handlePlayerFormSubmit);

  document.getElementById('player-search-input').addEventListener('input', (e) => {
    AppState.playerSearchQuery = e.target.value;
    renderPlayersView();
  });

  document.getElementById('player-position-filter').addEventListener('change', (e) => {
    AppState.playerPosFilter = e.target.value;
    renderPlayersView();
  });

  document.getElementById('player-sort-select').addEventListener('change', (e) => {
    AppState.playerSortBy = e.target.value;
    renderPlayersView();
  });

  // Times
  document.getElementById('btn-open-team-modal').addEventListener('click', () => openTeamModal());
  document.getElementById('form-team').addEventListener('submit', handleTeamFormSubmit);
  document.getElementById('btn-shuffle-teams-positions').addEventListener('click', shuffleTeamsByPositions);
  document.getElementById('btn-clear-all-teams').addEventListener('click', clearAllTeams);

  // Partidas
  document.getElementById('btn-open-new-match-modal').addEventListener('click', openNewMatchModal);
  document.getElementById('form-create-match').addEventListener('submit', handleCreateMatchSubmit);
  document.getElementById('form-goal').addEventListener('submit', handleGoalFormSubmit);
  document.getElementById('form-edit-score').addEventListener('submit', handleEditScoreSubmit);

  // Estatísticas
  document.getElementById('stats-search-input').addEventListener('input', (e) => {
    AppState.statsSearchQuery = e.target.value;
    renderStatsView();
  });

  document.getElementById('stats-pos-filter').addEventListener('change', (e) => {
    AppState.statsPosFilter = e.target.value;
    renderStatsView();
  });

  // Ranking
  document.querySelectorAll('[data-rank]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-rank]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.rankingFilter = btn.dataset.rank;
      renderRankingView();
    });
  });

  // Modais de Fechamento
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Backup e Limpeza
  document.getElementById('btn-backup-modal').addEventListener('click', () => openModal('modal-backup'));
  document.getElementById('btn-export-json').addEventListener('click', exportBackup);
  document.getElementById('btn-wipe-data').addEventListener('click', wipeAllData);

  const importInput = document.getElementById('input-import-json');
  importInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importBackup(e.target.files[0]);
    }
  });
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', initApp);
