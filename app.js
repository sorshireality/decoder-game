'use strict';

// ---- CONFIG ----
const COLORS = [
  { id: 'red',    cls: 'color-red',    labelEn: 'Red',    labelUk: 'Червоний' },
  { id: 'orange', cls: 'color-orange', labelEn: 'Orange', labelUk: 'Помаранчевий' },
  { id: 'yellow', cls: 'color-yellow', labelEn: 'Yellow', labelUk: 'Жовтий' },
  { id: 'green',  cls: 'color-green',  labelEn: 'Green',  labelUk: 'Зелений' },
  { id: 'blue',   cls: 'color-blue',   labelEn: 'Blue',   labelUk: 'Синій' },
  { id: 'purple', cls: 'color-purple', labelEn: 'Purple', labelUk: 'Фіолетовий' },
];

// stage: 1 = no decoy, 2 = palette has 1 extra decoy color
// colors = secret length, paletteColors = palette size
const LEVELS = [
  // Stage 1
  { stage: 1, colors: 3, paletteColors: 3, attempts: 8 },  // 1
  { stage: 1, colors: 3, paletteColors: 3, attempts: 6 },  // 2
  { stage: 1, colors: 4, paletteColors: 4, attempts: 8 },  // 3
  { stage: 1, colors: 4, paletteColors: 4, attempts: 7 },  // 4
  { stage: 1, colors: 4, paletteColors: 4, attempts: 6 },  // 5
  { stage: 1, colors: 5, paletteColors: 5, attempts: 8 },  // 6  ← ability unlocks here
  { stage: 1, colors: 5, paletteColors: 5, attempts: 7 },  // 7
  { stage: 1, colors: 6, paletteColors: 6, attempts: 8 },  // 8
  { stage: 1, colors: 6, paletteColors: 6, attempts: 7 },  // 9
  { stage: 1, colors: 6, paletteColors: 6, attempts: 5 },  // 10
  // Stage 2 — palette shows 1 extra decoy color
  { stage: 2, colors: 3, paletteColors: 4, attempts: 8 },  // 11
  { stage: 2, colors: 4, paletteColors: 5, attempts: 8 },  // 12
  { stage: 2, colors: 4, paletteColors: 5, attempts: 7 },  // 13
  { stage: 2, colors: 4, paletteColors: 5, attempts: 6 },  // 14
  { stage: 2, colors: 5, paletteColors: 6, attempts: 8 },  // 15
];

const ABILITY_UNLOCK_LEVEL = 6;
const STAGE1_COUNT = 10;
const STORAGE_KEYS = {
  progress: 'decoder_progress',
  guestId: 'decoder_guest_id',
  supabaseCfg: 'decoder_supabase_cfg',
  pvpSession: 'decoder_pvp_session',
};
const VERCEL_CONFIG_ENDPOINT = '/api/config';

// ---- I18N ----
const I18N = {
  en: {
    appSubtitle:      'Crack the secret color code',
    play:             'Play',
    pvp:              'PVP',
    selectLevel:      'Select Level',
    stageName:        n => `Stage ${n}`,
    stage2desc:       'Palette has one decoy color',
    levelHeader:      (cfg, stageLvl) =>
      cfg.stage === 2
        ? `Stage 2 · Lv.${stageLvl} · ${cfg.colors}+1`
        : `Level ${stageLvl} · ${cfg.colors} colors`,
    attemptsLeft:     n => `Attempts: <span class="attempts-num">${n}</span>`,
    paletteHint:      'Choose a color, tap a slot',
    confirmGuess:     'Confirm Guess',
    abilityBtn:       '✨ Reveal a position',
    decoded:          'Decoded!',
    gameOver:         'Game Over',
    crackedLevel:     n => `You cracked level ${n}!`,
    stage2Unlocked:   'Stage 2 unlocked! 🔓',
    theCodeWas:       'The code was:',
    nextLevel:        'Next Level',
    tryAgain:         'Try Again',
    playAgain:        'Play Again',
    allLevels:        'All Levels',
    abilityUnlocked:  '✨ Ability unlocked!',
    positionRevealed: 'Position revealed!',
    colorLabel:       c => c.labelEn,
  },
  uk: {
    appSubtitle:      'Розгадай таємний колірний код',
    play:             'Грати',
    pvp:              'PVP',
    selectLevel:      'Вибір рівня',
    stageName:        n => `Стадія ${n}`,
    stage2desc:       'У палітрі є один зайвий колір',
    levelHeader:      (cfg, stageLvl) =>
      cfg.stage === 2
        ? `Стадія 2 · Рів.${stageLvl} · ${cfg.colors}+1`
        : `Рівень ${stageLvl} · ${cfg.colors} кол.`,
    attemptsLeft:     n => `Спроб: <span class="attempts-num">${n}</span>`,
    paletteHint:      'Вибери колір, натисни комірку',
    confirmGuess:     'Підтвердити',
    abilityBtn:       '✨ Відкрити позицію',
    decoded:          'Розгадано!',
    gameOver:         'Гру програно',
    crackedLevel:     n => `Ти розгадав рівень ${n}!`,
    stage2Unlocked:   'Стадія 2 відкрита! 🔓',
    theCodeWas:       'Код був:',
    nextLevel:        'Наступний рівень',
    tryAgain:         'Спробувати ще',
    playAgain:        'Грати знову',
    allLevels:        'Усі рівні',
    abilityUnlocked:  '✨ Здатність розблоковано!',
    positionRevealed: 'Позицію відкрито!',
    colorLabel:       c => c.labelUk,
  },
};

let lang = 'en';

function t(key, ...args) {
  const s = (I18N[lang] || I18N.en)[key] ?? I18N.en[key] ?? key;
  return typeof s === 'function' ? s(...args) : s;
}

// ---- STATE ----
let state = {
  unlockedLevel:      1,
  currentLevel:       null,
  secret:             [],
  guess:              [],
  history:            [],
  attemptsLeft:       0,
  selectedColor:      null,
  gameOver:           false,
  hasAbility:         false,
  abilityAvailable:   false,
  revealedPositions:  [],   // [{index, colorId}]
};

let currentScreen = 'home-screen';
let pvpState = {
  roomId: null,
  roomCode: null,
  role: null,
  status: null,
  mode: null,
  bestOf: null,
  colorsCount: null,
  localRoundStarted: false,
};
let supabaseClient = null;
let supabaseClientCfgKey = '';
let pvpInitPromise = null;
let pvpRoomChannel = null;
let pvpPollTimer = null;

// ---- STORAGE ----
function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify({
    unlockedLevel: state.unlockedLevel,
    hasAbility:    state.hasAbility,
    lang,
  }));
}

function loadProgress() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress));
    if (d) {
      if (d.unlockedLevel) {
        state.unlockedLevel = Math.min(d.unlockedLevel, LEVELS.length);
        // Grant ability retroactively to players who passed level 6
        if (state.unlockedLevel > ABILITY_UNLOCK_LEVEL) state.hasAbility = true;
      }
      if (d.hasAbility) state.hasAbility = true;
      if (d.lang && I18N[d.lang]) lang = d.lang;
    }
  } catch (_) {}
}

// ---- HELPERS ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// For stage 2: secret picks `colors` colors from pool of `paletteColors`
function generateSecret(cfg) {
  const pool = shuffle(COLORS.slice(0, cfg.paletteColors).map(c => c.id));
  return pool.slice(0, cfg.colors);
}

function countCorrect(secret, guess) {
  return secret.reduce((acc, c, i) => acc + (c === guess[i] ? 1 : 0), 0);
}

// Returns the display level number within the stage (1-based)
function stageLvlNum(globalLvl) {
  return LEVELS[globalLvl - 1].stage === 2 ? globalLvl - STAGE1_COUNT : globalLvl;
}

// ---- TOAST ----
function showToast(msg, duration = 2000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visible'), duration);
}

// ---- NAVIGATION ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  currentScreen = id;
}

function getGuestPlayerId() {
  let id = localStorage.getItem(STORAGE_KEYS.guestId);
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEYS.guestId, id);
  }
  return id;
}

function saveSupabaseConfigFromForm() {
  const url = document.getElementById('supabase-url').value.trim();
  const anonKey = document.getElementById('supabase-anon-key').value.trim();
  localStorage.setItem(STORAGE_KEYS.supabaseCfg, JSON.stringify({ url, anonKey }));
  supabaseClient = null;
  supabaseClientCfgKey = '';
  setPvpConnectionStatus('Using local dev config', 'warn');
  showToast('Supabase config saved');
}

function loadSupabaseConfigToForm() {
  try {
    const cfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.supabaseCfg) || '{}');
    document.getElementById('supabase-url').value = cfg.url || '';
    document.getElementById('supabase-anon-key').value = cfg.anonKey || '';
  } catch (_) {}
}

function getSupabaseClient() {
  const cfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.supabaseCfg) || '{}');
  if (!cfg.url || !cfg.anonKey) {
    throw new Error('Missing Supabase URL or anon key');
  }
  const cacheKey = `${cfg.url}|${cfg.anonKey}`;
  if (supabaseClient && supabaseClientCfgKey === cacheKey) return supabaseClient;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase CDN not loaded');
  }
  supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
  supabaseClientCfgKey = cacheKey;
  return supabaseClient;
}

function setPvpConnectionStatus(text, tone = '') {
  const el = document.getElementById('pvp-connection-status');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('ok', 'warn');
  if (tone) el.classList.add(tone);
}

function togglePvpDevConfig() {
  const panel = document.getElementById('pvp-dev-config');
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : '';
}

async function tryLoadSupabaseConfigFromServer() {
  const res = await fetch(VERCEL_CONFIG_ENDPOINT, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Config endpoint failed (${res.status})`);
  const data = await res.json();
  if (!data || !data.supabaseUrl || !data.supabaseAnonKey) {
    throw new Error('Invalid config payload');
  }
  localStorage.setItem(STORAGE_KEYS.supabaseCfg, JSON.stringify({
    url: data.supabaseUrl,
    anonKey: data.supabaseAnonKey,
  }));
  supabaseClient = null;
  supabaseClientCfgKey = '';
  loadSupabaseConfigToForm();
}

async function ensurePvpConfigReady() {
  try {
    setPvpConnectionStatus('Connecting to backend config…');
    await tryLoadSupabaseConfigFromServer();
    getSupabaseClient();
    setPvpConnectionStatus('Connected via Vercel config', 'ok');
    return true;
  } catch (_) {
    try {
      loadSupabaseConfigToForm();
      getSupabaseClient();
      setPvpConnectionStatus('Using local dev config (fallback)', 'warn');
      return true;
    } catch (fallbackErr) {
      setPvpConnectionStatus('No backend config. Open Dev Config (fallback).', 'warn');
      return false;
    }
  }
}

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function savePvpSession() {
  const payload = {
    roomId: pvpState.roomId,
    roomCode: pvpState.roomCode,
    role: pvpState.role,
  };
  if (!payload.roomId) {
    localStorage.removeItem(STORAGE_KEYS.pvpSession);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.pvpSession, JSON.stringify(payload));
}

function loadPvpSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.pvpSession) || 'null');
  } catch (_) {
    return null;
  }
}

function stopPvpWatchers() {
  if (pvpPollTimer) {
    clearInterval(pvpPollTimer);
    pvpPollTimer = null;
  }
  if (pvpRoomChannel && supabaseClient) {
    try { supabaseClient.removeChannel(pvpRoomChannel); } catch (_) {}
  }
  pvpRoomChannel = null;
}

function getPvpLevelFromRoom(room) {
  const targetStage = room.mode === 'plus_one' ? 2 : 1;
  const idx = LEVELS.findIndex(cfg => cfg.stage === targetStage && cfg.colors === room.colors_count);
  return idx >= 0 ? idx + 1 : null;
}

function maybeStartLocalPvpRound(room) {
  if (!room || room.status !== 'ready') return;
  if (pvpState.localRoundStarted) return;
  const lvl = getPvpLevelFromRoom(room);
  if (!lvl) {
    showToast('No matching level preset for room settings', 3000);
    return;
  }
  pvpState.localRoundStarted = true;
  showToast(`Match ready • ${room.room_code}`, 2200);
  startLevel(lvl);
}

function applyRoomToPvpState(room, roleOverride = null) {
  pvpState.roomId = room.id;
  pvpState.roomCode = room.room_code;
  pvpState.status = room.status;
  pvpState.mode = room.mode;
  pvpState.bestOf = room.best_of;
  pvpState.colorsCount = room.colors_count;
  if (roleOverride) pvpState.role = roleOverride;
  savePvpSession();
  renderPvpStatus({
    roomCode: room.room_code,
    role: pvpState.role,
    status: room.status,
    mode: room.mode,
    bestOf: room.best_of,
    colorsCount: room.colors_count,
  });
  maybeStartLocalPvpRound(room);
}

async function fetchRoomById(roomId) {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('rooms').select('*').eq('id', roomId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Room not found');
  return data;
}

async function refreshPvpRoom() {
  if (!pvpState.roomId) return;
  try {
    const room = await fetchRoomById(pvpState.roomId);
    applyRoomToPvpState(room);
  } catch (_) {}
}

async function watchPvpRoom(roomId) {
  stopPvpWatchers();
  const sb = getSupabaseClient();

  try {
    pvpRoomChannel = sb
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, payload => {
        const room = payload.new || payload.old;
        if (room && payload.eventType !== 'DELETE') applyRoomToPvpState(room);
      })
      .subscribe();
  } catch (_) {
    pvpRoomChannel = null;
  }

  // Polling fallback (also useful if Realtime is not enabled yet)
  pvpPollTimer = setInterval(refreshPvpRoom, 2500);
  await refreshPvpRoom();
}

async function restorePvpSessionIfAny() {
  const session = loadPvpSession();
  if (!session || !session.roomId) return;
  try {
    await ensurePvpConfigReady();
    pvpState.roomId = session.roomId;
    pvpState.roomCode = session.roomCode || null;
    pvpState.role = session.role || null;
    pvpState.localRoundStarted = false;
    await watchPvpRoom(session.roomId);
  } catch (_) {
    // keep silent on init; user can still use Dev Config fallback
  }
}

function renderPvpStatus(info) {
  const box = document.getElementById('pvp-room-status');
  box.style.display = '';
  box.innerHTML = `
    <h3 class="pvp-panel-title">Room Status</h3>
    <div class="pvp-status-line"><span class="pvp-status-label">Room Code</span><span class="pvp-status-value">${info.roomCode || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Role</span><span class="pvp-status-value">${info.role || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Status</span><span class="pvp-status-value">${info.status || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Mode</span><span class="pvp-status-value">${info.mode || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Best Of</span><span class="pvp-status-value">${info.bestOf || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Colors</span><span class="pvp-status-value">${info.colorsCount || '-'}</span></div>
  `;
}

// ---- LANG ----
function applyLang() {
  document.documentElement.lang = lang;
  document.getElementById('app-subtitle').textContent = t('appSubtitle');
  document.getElementById('btn-play').textContent = t('play');
  const pvpBtn = document.getElementById('btn-pvp');
  if (pvpBtn) pvpBtn.textContent = `${t('pvp')} (MVP)`;
  document.getElementById('lang-toggle').textContent = lang === 'uk' ? 'EN' : 'UA';
}

function toggleLang() {
  lang = lang === 'en' ? 'uk' : 'en';
  saveProgress();
  applyLang();
  if (currentScreen === 'level-screen') renderLevelSelect();
  if (currentScreen === 'game-screen') renderGame();
  if (currentScreen === 'result-screen') {
    const cfg = LEVELS[state.currentLevel - 1];
    const won = state.history.length > 0 &&
      state.history[state.history.length - 1].correct === cfg.colors;
    const nextBtn = document.getElementById('btn-next');
    if (won && state.currentLevel < LEVELS.length) {
      nextBtn.textContent = t('nextLevel');
    } else if (won) {
      nextBtn.textContent = t('playAgain');
    } else {
      nextBtn.textContent = t('tryAgain');
    }
    document.getElementById('btn-levels').textContent = t('allLevels');
    document.getElementById('result-title').textContent =
      won ? t('decoded') : t('gameOver');
  }
}

// ---- HOME ----
function initHome() {
  const preview = document.querySelector('.color-preview');
  preview.innerHTML = '';
  COLORS.forEach(({ id }) => {
    const dot = document.createElement('div');
    dot.className = `dot color-${id}`;
    preview.appendChild(dot);
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });

  document.getElementById('btn-pvp').addEventListener('click', () => {
    showScreen('pvp-screen');
  });

  document.getElementById('lang-toggle').addEventListener('click', toggleLang);
}

// ---- PVP MVP (Supabase + Room Code) ----
function getPvpSettingsFromForm() {
  return {
    mode: document.getElementById('pvp-mode').value,
    bestOf: Number(document.getElementById('pvp-bestof').value),
    colorsCount: Number(document.getElementById('pvp-colors').value),
  };
}

async function createRoomMvp() {
  await ensurePvpConfigReady();
  const guestId = getGuestPlayerId();
  const { mode, bestOf, colorsCount } = getPvpSettingsFromForm();
  const sb = getSupabaseClient();

  let room = null;
  let lastError = null;

  for (let attempt = 0; attempt < 5 && !room; attempt++) {
    const roomCode = randomRoomCode();
    const { data, error } = await sb
      .from('rooms')
      .insert({
        room_code: roomCode,
        status: 'waiting_for_opponent',
        mode,
        best_of: bestOf,
        colors_count: colorsCount,
        host_player_id: guestId,
      })
      .select()
      .single();

    if (!error) room = data;
    else lastError = error;
  }

  if (!room) throw new Error(lastError?.message || 'Failed to create room');

  const paletteSize = mode === 'plus_one' ? colorsCount + 1 : colorsCount;

  const hostPlayerRes = await sb.from('room_players').insert({
    room_id: room.id,
    player_id: guestId,
    role: 'host',
    connection_status: 'connected',
  });
  if (hostPlayerRes.error) throw new Error(hostPlayerRes.error.message);

  const matchStateRes = await sb.from('match_state').insert({
    room_id: room.id,
    current_round: 1,
    host_round_wins: 0,
    guest_round_wins: 0,
    host_correct_count: 0,
    guest_correct_count: 0,
    round_status: 'waiting',
    secret_length: colorsCount,
    palette_size: paletteSize,
  });
  if (matchStateRes.error) throw new Error(matchStateRes.error.message);

  pvpState = {
    roomId: room.id,
    roomCode: room.room_code,
    role: 'host',
    status: room.status,
    mode: room.mode,
    bestOf: room.best_of,
    colorsCount: room.colors_count,
    localRoundStarted: false,
  };
  applyRoomToPvpState(room, 'host');
  await watchPvpRoom(room.id);
  showToast(`Room created: ${room.room_code}`, 3000);
}

async function joinRoomByCodeMvp() {
  await ensurePvpConfigReady();
  const guestId = getGuestPlayerId();
  const code = document.getElementById('pvp-room-code').value.trim().toUpperCase();
  if (!code) throw new Error('Enter room code');

  const sb = getSupabaseClient();
  const { data: room, error: roomErr } = await sb
    .from('rooms')
    .select('*')
    .eq('room_code', code)
    .maybeSingle();

  if (roomErr) throw new Error(roomErr.message);
  if (!room) throw new Error('Room not found');
  if (room.host_player_id === guestId) throw new Error('This device is already the host');
  if (room.guest_player_id && room.guest_player_id !== guestId) throw new Error('Room already has guest');

  const { error: updateErr } = await sb
    .from('rooms')
    .update({
      guest_player_id: guestId,
      status: 'ready',
    })
    .eq('id', room.id);
  if (updateErr) throw new Error(updateErr.message);

  const { error: playerErr } = await sb
    .from('room_players')
    .upsert({
      room_id: room.id,
      player_id: guestId,
      role: 'guest',
      connection_status: 'connected',
    }, { onConflict: 'room_id,player_id' });
  if (playerErr) throw new Error(playerErr.message);

  pvpState = {
    roomId: room.id,
    roomCode: room.room_code,
    role: 'guest',
    status: 'ready',
    mode: room.mode,
    bestOf: room.best_of,
    colorsCount: room.colors_count,
    localRoundStarted: false,
  };
  applyRoomToPvpState({ ...room, status: 'ready', guest_player_id: guestId }, 'guest');
  await watchPvpRoom(room.id);
  showToast(`Joined: ${room.room_code}`, 3000);
}

function initPvpMvp() {
  document.getElementById('pvp-guest-id').textContent = `Guest ID: ${getGuestPlayerId()}`;
  loadSupabaseConfigToForm();
  setPvpConnectionStatus('Checking connection…');

  document.getElementById('btn-save-supabase').addEventListener('click', saveSupabaseConfigFromForm);
  document.getElementById('btn-toggle-dev-config').addEventListener('click', togglePvpDevConfig);

  document.getElementById('btn-create-room').addEventListener('click', async () => {
    try {
      await createRoomMvp();
    } catch (err) {
      showToast(err.message || 'Create room failed', 3000);
    }
  });

  document.getElementById('btn-join-room').addEventListener('click', async () => {
    try {
      await joinRoomByCodeMvp();
    } catch (err) {
      showToast(err.message || 'Join room failed', 3000);
    }
  });

  pvpInitPromise = ensurePvpConfigReady();
  restorePvpSessionIfAny();
}

// ---- LEVEL SELECT ----
function renderLevelSelect() {
  document.getElementById('select-level-title').textContent = t('selectLevel');
  const container = document.getElementById('levels-container');
  container.innerHTML = '';

  [1, 2].forEach(stageId => {
    const section = document.createElement('div');
    section.className = 'stage-section';

    const header = document.createElement('div');
    header.className = 'stage-header';

    const title = document.createElement('span');
    title.className = 'stage-header-title';
    title.textContent = t('stageName', stageId);
    header.appendChild(title);

    if (stageId === 2) {
      const desc = document.createElement('span');
      desc.className = 'stage-header-desc';
      desc.textContent = t('stage2desc');
      header.appendChild(desc);
    }

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'stage-levels-grid';

    LEVELS.forEach((cfg, idx) => {
      if (cfg.stage !== stageId) return;
      const globalLvl = idx + 1;
      const displayLvl = stageLvlNum(globalLvl);

      const btn = document.createElement('button');
      btn.className = 'level-btn';
      btn.textContent = displayLvl;

      if (globalLvl < state.unlockedLevel) {
        btn.classList.add('unlocked');
      } else if (globalLvl === state.unlockedLevel) {
        btn.classList.add('current');
      } else {
        btn.classList.add('locked');
        const lock = document.createElement('span');
        lock.className = 'lock-icon';
        lock.textContent = '🔒';
        btn.appendChild(lock);
      }

      if (globalLvl <= state.unlockedLevel) {
        btn.addEventListener('click', () => startLevel(globalLvl));
      }

      grid.appendChild(btn);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ---- GAME ----
function startLevel(lvl) {
  const cfg = LEVELS[lvl - 1];
  state.currentLevel      = lvl;
  state.secret            = generateSecret(cfg);
  state.guess             = new Array(cfg.colors).fill(null);
  state.history           = [];
  state.attemptsLeft      = cfg.attempts;
  state.selectedColor     = null;
  state.gameOver          = false;
  state.abilityAvailable  = state.hasAbility;
  state.revealedPositions = [];

  renderGame();
  showScreen('game-screen');
}

function renderGame() {
  const cfg = LEVELS[state.currentLevel - 1];
  const stageLvl = stageLvlNum(state.currentLevel);

  document.getElementById('game-level-label').textContent = t('levelHeader', cfg, stageLvl);
  document.getElementById('game-attempts').innerHTML = t('attemptsLeft', state.attemptsLeft);
  document.getElementById('palette-hint').textContent = t('paletteHint');
  document.getElementById('btn-confirm').textContent = t('confirmGuess');

  renderHistory();
  renderGuessRow();
  renderPalette(cfg.paletteColors);
  updateConfirmBtn();
  updateAbilityBtn();
}

function renderHistory() {
  const area = document.getElementById('history-area');
  area.innerHTML = '';
  const cfg = LEVELS[state.currentLevel - 1];

  state.history.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'history-row';

    const slots = document.createElement('div');
    slots.className = 'history-slots';
    entry.guess.forEach(cid => {
      const s = document.createElement('div');
      s.className = `history-slot color-${cid}`;
      slots.appendChild(s);
    });

    const res = document.createElement('div');
    res.className = 'history-result';
    res.innerHTML = `${entry.correct}<span class="result-total">/${cfg.colors}</span>`;

    row.appendChild(slots);
    row.appendChild(res);
    area.appendChild(row);
  });

  area.scrollTop = area.scrollHeight;
}

function renderGuessRow() {
  const row = document.getElementById('active-row');
  row.innerHTML = '';

  state.guess.forEach((cid, idx) => {
    const isRevealed = state.revealedPositions.some(r => r.index === idx);
    const slot = document.createElement('div');
    slot.className = 'guess-slot';
    if (cid) slot.classList.add('filled', `color-${cid}`);
    if (isRevealed) slot.classList.add('revealed');
    if (!isRevealed) slot.addEventListener('click', () => onSlotClick(idx));
    row.appendChild(slot);
  });
}

function renderPalette(n) {
  const row = document.getElementById('palette-row');
  row.innerHTML = '';

  COLORS.slice(0, n).forEach(color => {
    const btn = document.createElement('div');
    btn.className = `palette-color ${color.cls}`;
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', t('colorLabel', color));
    if (state.selectedColor === color.id) btn.classList.add('selected');
    btn.addEventListener('click', () => onPaletteClick(color.id));
    row.appendChild(btn);
  });
}

function onPaletteClick(colorId) {
  if (state.gameOver) return;
  state.selectedColor = (state.selectedColor === colorId) ? null : colorId;

  document.querySelectorAll('.palette-color').forEach(el => {
    el.classList.toggle('selected',
      state.selectedColor !== null && el.classList.contains(`color-${state.selectedColor}`)
    );
  });
}

function onSlotClick(idx) {
  if (state.gameOver) return;
  if (state.revealedPositions.some(r => r.index === idx)) return;
  state.guess[idx] = state.selectedColor || null;
  renderGuessRow();
  updateConfirmBtn();
}

function updateConfirmBtn() {
  const btn = document.getElementById('btn-confirm');
  btn.disabled = !state.guess.every(c => c !== null) || state.gameOver;
}

function updateAbilityBtn() {
  const btn = document.getElementById('btn-ability');
  if (!state.hasAbility) { btn.style.display = 'none'; return; }
  btn.style.display = '';
  btn.disabled = !state.abilityAvailable || state.gameOver;
  btn.textContent = t('abilityBtn');
}

function useAbility() {
  if (!state.abilityAvailable || state.gameOver) return;

  const available = state.secret
    .map((colorId, index) => ({ index, colorId }))
    .filter(({ index }) => !state.revealedPositions.some(r => r.index === index));

  if (available.length === 0) return;

  const chosen = available[Math.floor(Math.random() * available.length)];
  state.revealedPositions.push(chosen);
  state.guess[chosen.index] = chosen.colorId;
  state.abilityAvailable = false;

  renderGuessRow();
  updateConfirmBtn();
  updateAbilityBtn();
  showToast(t('positionRevealed'));
}

function onConfirm() {
  if (state.gameOver) return;
  const cfg = LEVELS[state.currentLevel - 1];
  if (state.guess.some(c => c === null)) return;

  const correct = countCorrect(state.secret, state.guess);
  state.history.push({ guess: [...state.guess], correct });
  state.attemptsLeft--;

  const won = correct === cfg.colors;
  const lost = !won && state.attemptsLeft === 0;

  if (won || lost) {
    state.gameOver = true;
    let abilityJustUnlocked = false;
    let stage2JustUnlocked = false;

    if (won && state.currentLevel >= state.unlockedLevel && state.unlockedLevel < LEVELS.length) {
      state.unlockedLevel = state.currentLevel + 1;
      if (!state.hasAbility && state.currentLevel === ABILITY_UNLOCK_LEVEL) {
        state.hasAbility = true;
        abilityJustUnlocked = true;
      }
      if (state.currentLevel === STAGE1_COUNT) {
        stage2JustUnlocked = true;
      }
      saveProgress();
    }

    state.guess = new Array(cfg.colors).fill(null);
    renderGame();
    setTimeout(() => {
      showResult(won);
      if (abilityJustUnlocked) {
        setTimeout(() => showToast(t('abilityUnlocked'), 3000), 500);
      } else if (stage2JustUnlocked) {
        setTimeout(() => showToast(t('stage2Unlocked'), 3000), 500);
      }
    }, 600);
  } else {
    state.guess = new Array(cfg.colors).fill(null);
    // Persist revealed positions into next attempt
    state.revealedPositions.forEach(r => { state.guess[r.index] = r.colorId; });
    state.selectedColor = null;
    renderGame();
  }
}

function showResult(won) {
  const cfg = LEVELS[state.currentLevel - 1];
  const stageLvl = stageLvlNum(state.currentLevel);

  document.getElementById('result-emoji').textContent = won ? '🎉' : '😔';
  document.getElementById('result-title').textContent = won ? t('decoded') : t('gameOver');
  document.getElementById('result-subtitle').textContent = won
    ? t('crackedLevel', stageLvl)
    : t('theCodeWas');

  const answerEl = document.getElementById('result-answer');
  answerEl.innerHTML = '';
  state.secret.forEach(cid => {
    const dot = document.createElement('div');
    dot.className = `dot color-${cid}`;
    answerEl.appendChild(dot);
  });

  const nextBtn = document.getElementById('btn-next');
  if (won && state.currentLevel < LEVELS.length) {
    nextBtn.textContent = t('nextLevel');
  } else if (won) {
    nextBtn.textContent = t('playAgain');
  } else {
    nextBtn.textContent = t('tryAgain');
  }

  document.getElementById('btn-levels').textContent = t('allLevels');
  showScreen('result-screen');
}

// ---- INIT ----
function init() {
  loadProgress();
  applyLang();
  initHome();
  initPvpMvp();
  showScreen('home-screen');

  document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-pvp').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-game').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });

  document.getElementById('btn-confirm').addEventListener('click', onConfirm);
  document.getElementById('btn-ability').addEventListener('click', useAbility);

  document.getElementById('btn-next').addEventListener('click', () => {
    const cfg = LEVELS[state.currentLevel - 1];
    const won = state.history.length > 0 &&
      state.history[state.history.length - 1].correct === cfg.colors;
    if (won) {
      startLevel(state.currentLevel < LEVELS.length ? state.currentLevel + 1 : 1);
    } else {
      startLevel(state.currentLevel);
    }
  });

  document.getElementById('btn-levels').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
