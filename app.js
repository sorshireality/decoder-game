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
  nickname: 'decoder_nickname',
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
    pvpTitle:         'Duel',
    pvpConnection:    'Connection',
    pvpMenuTitle:     'Duel',
    pvpCreate:        'Create',
    pvpJoin:          'Join',
    pvpCreateRoom:    'Create Room',
    pvpJoinRoom:      'Join Room',
    pvpJoinByCode:    'Join by Code',
    pvpMode:          'Mode',
    pvpColors:        'Colors',
    pvpBestOf:        'Match Format',
    pvpModeClassic:   'Classic',
    pvpModePlusOne:   '+1 Decoy',
    pvpBestOfHint:    n => `First to ${Math.floor(n / 2) + 1} wins`,
    pvpRoomCodePh:    'ROOM CODE',
    pvpConnectionChecking: 'Checking connection…',
    pvpConnectionBackend:  'Connected',
    pvpConnectionFallback: 'Using local dev config',
    pvpConnectionMissing:  'No backend config. Open Dev Config.',
    pvpNickTitle:     'Nickname',
    pvpNickSubtitle:  'Add a nickname for PvP',
    pvpNickPlaceholder:'Your nickname',
    pvpNickSave:      'Save',
    pvpPlayerLabel:   name => `Player: ${name}`,
    pvpLeave:         'Leave PVP',
    pvpBackToPvp:     'Back to Duel',
    pvpCloseRoom:     'Close Room',
    pvpLeaveRoom:     'Leave Room',
    pvpRoundWon:      'Round cleared',
    pvpRoundLost:     'Round failed',
    pvpRoundKeepGoing:'Keep going',
    pvpRoundRetryFast:'Retry same round fast',
    pvpNext:          'Next',
    pvpRetry:         'Retry',
    pvpVictory:       'Victory',
    pvpDefeat:        'Defeat',
    pvpFinalScore:    (a, b) => `Final score ${a}-${b}`,
    pvpResultLock:    s => `Back in ${s}s`,
    pvpRoleHost:      'Host',
    pvpRoleGuest:     'Guest',
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
    pvpTitle:         'Поєдинок',
    pvpConnection:    'Підключення',
    pvpMenuTitle:     'Поєдинок',
    pvpCreate:        'Створити',
    pvpJoin:          'Приєднатись',
    pvpCreateRoom:    'Створити кімнату',
    pvpJoinRoom:      'Приєднатись',
    pvpJoinByCode:    'Підключитись за кодом',
    pvpMode:          'Режим',
    pvpColors:        'Кольори',
    pvpBestOf:        'Формат матчу',
    pvpModeClassic:   'Класичний',
    pvpModePlusOne:   '+1 зайвий',
    pvpBestOfHint:    n => `До ${Math.floor(n / 2) + 1} перемог`,
    pvpRoomCodePh:    'КОД КІМНАТИ',
    pvpConnectionChecking: 'Перевірка підключення…',
    pvpConnectionBackend:  'Підключено',
    pvpConnectionFallback: 'Локальний dev-конфіг',
    pvpConnectionMissing:  'Немає backend-конфігу. Відкрий Dev Config.',
    pvpNickTitle:     'Нікнейм',
    pvpNickSubtitle:  'Додай нікнейм для PvP',
    pvpNickPlaceholder:'Твій нікнейм',
    pvpNickSave:      'Зберегти',
    pvpPlayerLabel:   name => `Гравець: ${name}`,
    pvpLeave:         'Вийти з PvP',
    pvpBackToPvp:     'Назад до поєдинку',
    pvpCloseRoom:     'Закрити кімнату',
    pvpLeaveRoom:     'Вийти з кімнати',
    pvpRoundWon:      'Раунд пройдено',
    pvpRoundLost:     'Раунд програно',
    pvpRoundKeepGoing:'Продовжуй',
    pvpRoundRetryFast:'Швидко повторити раунд',
    pvpNext:          'Далі',
    pvpRetry:         'Повторити',
    pvpVictory:       'Перемога',
    pvpDefeat:        'Поразка',
    pvpFinalScore:    (a, b) => `Фінальний рахунок ${a}-${b}`,
    pvpResultLock:    s => `Назад через ${s}с`,
    pvpRoleHost:      'Ведучий',
    pvpRoleGuest:     'Гість',
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
  pendingRoundResult: null,
  finalResult: null,
};
let pvpMatch = {
  hostWins: 0,
  guestWins: 0,
  hostCorrectCount: 0,
  guestCorrectCount: 0,
  roundStatus: 'waiting',
};
let supabaseClient = null;
let supabaseClientCfgKey = '';
let pvpInitPromise = null;
let pvpRoomChannel = null;
let pvpPollTimer = null;
let uiInteractionUnlocks = {};

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

function setPvpLobbyView(view) {
  const menu = document.getElementById('pvp-menu-panel');
  const create = document.getElementById('pvp-create-panel');
  const join = document.getElementById('pvp-join-panel');
  if (!menu || !create || !join) return;
  menu.style.display = view === 'menu' ? '' : 'none';
  create.style.display = view === 'create' ? '' : 'none';
  join.style.display = view === 'join' ? '' : 'none';
}

function lockButtonForDelay(buttonEl, ms, baseLabel) {
  if (!buttonEl) return;
  const unlockAt = Date.now() + ms;
  uiInteractionUnlocks[buttonEl.id] = unlockAt;
  buttonEl.disabled = true;
  buttonEl.classList.add('btn-delayed', 'is-counting');
  buttonEl.style.setProperty('--delay-ms', `${ms}ms`);

  const isResultBack = buttonEl.id === 'btn-levels' && pvpState.finalResult;
  if (isResultBack) {
    const tick = () => {
      const left = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
      if (Date.now() >= unlockAt) {
        buttonEl.textContent = baseLabel;
        return;
      }
      buttonEl.textContent = t('pvpResultLock', left);
      setTimeout(tick, 250);
    };
    tick();
  }

  setTimeout(() => {
    if (uiInteractionUnlocks[buttonEl.id] !== unlockAt) return;
    buttonEl.disabled = false;
    buttonEl.classList.remove('is-counting');
    if (baseLabel) buttonEl.textContent = baseLabel;
  }, ms);
}

function protectScreenFromTapThrough(screenId, buttonIds, lockMs = 700) {
  const screen = document.getElementById(screenId);
  if (!screen) return;
  screen.style.pointerEvents = 'none';
  setTimeout(() => { screen.style.pointerEvents = ''; }, lockMs);
  buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
  });
  setTimeout(() => {
    buttonIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn && (!uiInteractionUnlocks[id] || Date.now() >= uiInteractionUnlocks[id])) btn.disabled = false;
    });
  }, lockMs);
}

function getGuestPlayerId() {
  let id = localStorage.getItem(STORAGE_KEYS.guestId);
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEYS.guestId, id);
  }
  return id;
}

function getNickname() {
  return (localStorage.getItem(STORAGE_KEYS.nickname) || '').trim();
}

function saveNickname(name) {
  const clean = (name || '').trim().slice(0, 20);
  if (!clean) return false;
  localStorage.setItem(STORAGE_KEYS.nickname, clean);
  updatePvpPlayerMeta();
  updatePvpCompetitionUi();
  return true;
}

function updatePvpPlayerMeta() {
  const meta = document.getElementById('pvp-player-meta');
  if (!meta) return;
  const nick = getNickname() || getGuestPlayerId();
  meta.textContent = t('pvpPlayerLabel', nick);
}

function showNicknameModal() {
  const modal = document.getElementById('nickname-modal');
  const input = document.getElementById('nickname-input');
  modal.style.display = '';
  input.value = getNickname();
  setTimeout(() => input.focus(), 20);
}

function hideNicknameModal() {
  const modal = document.getElementById('nickname-modal');
  modal.style.display = 'none';
}

function ensurePvpNickname() {
  if (getNickname()) return true;
  showNicknameModal();
  return false;
}

function saveSupabaseConfigFromForm() {
  const url = document.getElementById('supabase-url').value.trim();
  const anonKey = document.getElementById('supabase-anon-key').value.trim();
  localStorage.setItem(STORAGE_KEYS.supabaseCfg, JSON.stringify({ url, anonKey }));
  supabaseClient = null;
  supabaseClientCfgKey = '';
  setPvpConnectionStatus(t('pvpConnectionFallback'), 'warn');
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
    setPvpConnectionStatus(t('pvpConnectionChecking'));
    await tryLoadSupabaseConfigFromServer();
    getSupabaseClient();
    setPvpConnectionStatus(t('pvpConnectionBackend'), 'ok');
    return true;
  } catch (_) {
    try {
      loadSupabaseConfigToForm();
      getSupabaseClient();
      setPvpConnectionStatus(t('pvpConnectionFallback'), 'warn');
      return true;
    } catch (fallbackErr) {
      setPvpConnectionStatus(t('pvpConnectionMissing'), 'warn');
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
  if (pvpState.pendingRoundResult || pvpState.finalResult) return;
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
  const prevStatus = pvpState.status;
  pvpState.roomId = room.id;
  pvpState.roomCode = room.room_code;
  pvpState.status = room.status;
  pvpState.mode = room.mode;
  pvpState.bestOf = room.best_of;
  pvpState.colorsCount = room.colors_count;
  if (roleOverride) pvpState.role = roleOverride;
  savePvpSession();
  updatePvpCompetitionUi();
  renderPvpStatus({
    roomCode: room.room_code,
    role: pvpState.role,
    status: room.status,
    mode: room.mode,
    bestOf: room.best_of,
    colorsCount: room.colors_count,
  });
  if (room.status === 'abandoned' && prevStatus && prevStatus !== 'abandoned') {
    showToast('Room closed', 2500);
    resetPvpStateLocal();
    document.getElementById('pvp-room-status').style.display = 'none';
    if (currentScreen !== 'home-screen') showScreen('pvp-screen');
    return;
  }
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
    await refreshPvpMatchState();
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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_state',
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const row = payload.new || payload.old;
        if (row && payload.eventType !== 'DELETE') applyMatchStateToPvp(row);
      })
      .subscribe();
  } catch (_) {
    pvpRoomChannel = null;
  }

  // Polling fallback (also useful if Realtime is not enabled yet)
  pvpPollTimer = setInterval(refreshPvpRoom, 2500);
  await refreshPvpRoom();
}

function isPvpModeActive() {
  return !!pvpState.roomId;
}

function isPvpRoleHost() {
  return pvpState.role === 'host';
}

function getPvpWinsNeeded() {
  const bestOf = Number(pvpState.bestOf || 1);
  return Math.floor(bestOf / 2) + 1;
}

function getMyPvpWins() {
  return isPvpRoleHost() ? pvpMatch.hostWins : pvpMatch.guestWins;
}

function getOpponentPvpWins() {
  return isPvpRoleHost() ? pvpMatch.guestWins : pvpMatch.hostWins;
}

function getMyPvpCorrectCount() {
  return isPvpRoleHost() ? pvpMatch.hostCorrectCount : pvpMatch.guestCorrectCount;
}

function getOpponentPvpCorrectCount() {
  return isPvpRoleHost() ? pvpMatch.guestCorrectCount : pvpMatch.hostCorrectCount;
}

function renderPvpTrackDots(targetEl, wins, winsNeeded) {
  targetEl.innerHTML = '';
  for (let i = 0; i < winsNeeded; i++) {
    const dot = document.createElement('div');
    dot.className = 'pvp-track-dot';
    if (i < wins) dot.classList.add('done');
    else if (i === wins && wins < winsNeeded) dot.classList.add('current');
    targetEl.appendChild(dot);
  }
}

function updatePvpCompetitionUi() {
  const card = document.getElementById('pvp-competition-card');
  const leaveBtn = document.getElementById('btn-pvp-leave');
  if (!isPvpModeActive() || !pvpState.bestOf) {
    card.style.display = 'none';
    leaveBtn.style.display = 'none';
    return;
  }

  card.style.display = '';
  leaveBtn.style.display = '';

  const winsNeeded = getPvpWinsNeeded();
  const myWins = getMyPvpWins();
  const oppWins = getOpponentPvpWins();
  const myLabel = (getNickname() || (isPvpRoleHost() ? t('pvpRoleHost') : t('pvpRoleGuest'))).slice(0, 8);
  const oppLabel = isPvpRoleHost() ? t('pvpRoleGuest') : t('pvpRoleHost');
  document.getElementById('pvp-you-label').textContent = myLabel;
  document.getElementById('pvp-opp-label').textContent = oppLabel;

  renderPvpTrackDots(document.getElementById('pvp-you-track'), myWins, winsNeeded);
  renderPvpTrackDots(document.getElementById('pvp-opp-track'), oppWins, winsNeeded);
}

function hidePvpRoundScreen() {
  if (currentScreen === 'pvp-round-screen') showScreen('game-screen');
}

function showPvpRoundScreen(kind) {
  const title = document.getElementById('pvp-round-title');
  const subtitle = document.getElementById('pvp-round-subtitle');
  const emoji = document.getElementById('pvp-round-emoji');
  const nextBtn = document.getElementById('btn-pvp-round-next');

  if (kind === 'won') {
    emoji.textContent = '✅';
    title.textContent = t('pvpRoundWon');
    subtitle.textContent = `Score ${getMyPvpWins()}-${getOpponentPvpWins()} • Opp ${getOpponentPvpCorrectCount()}/${pvpState.colorsCount || '-'}`;
    nextBtn.textContent = t('pvpNext');
    nextBtn.style.display = '';
  } else {
    emoji.textContent = '❌';
    title.textContent = t('pvpRoundLost');
    subtitle.textContent = t('pvpRoundRetryFast');
    nextBtn.textContent = t('pvpRetry');
    nextBtn.style.display = '';
  }
  showScreen('pvp-round-screen');
  protectScreenFromTapThrough('pvp-round-screen', ['btn-pvp-round-next', 'btn-pvp-round-back'], 700);
  lockButtonForDelay(document.getElementById('btn-pvp-round-back'), 1400, t('pvpBackToPvp'));
}

function showPvpFinalResult(won) {
  pvpState.finalResult = won ? 'win' : 'lose';
  document.getElementById('result-emoji').textContent = won ? '🏆' : '😞';
  document.getElementById('result-title').textContent = won ? t('pvpVictory') : t('pvpDefeat');
  document.getElementById('result-subtitle').textContent =
    t('pvpFinalScore', getMyPvpWins(), getOpponentPvpWins());
  document.getElementById('result-answer').innerHTML = '';
  document.getElementById('btn-next').style.display = 'none';
  document.getElementById('btn-levels').textContent = t('pvpBackToPvp');
  showScreen('result-screen');
  protectScreenFromTapThrough('result-screen', ['btn-levels'], 800);
  lockButtonForDelay(document.getElementById('btn-levels'), 1800, t('pvpBackToPvp'));
}

function resetPvpStateLocal() {
  stopPvpWatchers();
  pvpState = {
    roomId: null,
    roomCode: null,
    role: null,
    status: null,
    mode: null,
    bestOf: null,
    colorsCount: null,
    localRoundStarted: false,
    pendingRoundResult: null,
    finalResult: null,
  };
  pvpMatch = {
    hostWins: 0,
    guestWins: 0,
    hostCorrectCount: 0,
    guestCorrectCount: 0,
    roundStatus: 'waiting',
  };
  localStorage.removeItem(STORAGE_KEYS.pvpSession);
  document.getElementById('btn-next').style.display = '';
  updatePvpCompetitionUi();
}

async function leavePvpSession(options = {}) {
  const { fromMatchEnd = false } = options;
  if (!pvpState.roomId) {
    resetPvpStateLocal();
    return;
  }
  try {
    await ensurePvpConfigReady();
    const sb = getSupabaseClient();

    if (isPvpRoleHost()) {
      await sb.from('rooms')
        .update({ status: fromMatchEnd ? 'match_finished' : 'abandoned' })
        .eq('id', pvpState.roomId);
    } else {
      await sb.from('rooms')
        .update({
          guest_player_id: null,
          status: fromMatchEnd ? 'match_finished' : 'waiting_for_opponent',
        })
        .eq('id', pvpState.roomId);

      await sb.from('room_players')
        .delete()
        .eq('room_id', pvpState.roomId)
        .eq('player_id', getGuestPlayerId());
    }
  } catch (_) {
    // still clear local state to avoid trapping the user
  }
  resetPvpStateLocal();
}

async function fetchMatchStateByRoomId(roomId) {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('match_state').select('*').eq('room_id', roomId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

function applyMatchStateToPvp(matchState) {
  if (!matchState) return;
  pvpMatch.hostWins = matchState.host_round_wins || 0;
  pvpMatch.guestWins = matchState.guest_round_wins || 0;
  pvpMatch.hostCorrectCount = matchState.host_correct_count || 0;
  pvpMatch.guestCorrectCount = matchState.guest_correct_count || 0;
  pvpMatch.roundStatus = matchState.round_status || 'waiting';
  updatePvpCompetitionUi();

  if (!isPvpModeActive()) return;
  const winsNeeded = getPvpWinsNeeded();
  if (!pvpState.finalResult) {
    if (getMyPvpWins() >= winsNeeded) showPvpFinalResult(true);
    else if (getOpponentPvpWins() >= winsNeeded) showPvpFinalResult(false);
  }
}

async function refreshPvpMatchState() {
  if (!pvpState.roomId) return;
  try {
    const matchState = await fetchMatchStateByRoomId(pvpState.roomId);
    applyMatchStateToPvp(matchState);
  } catch (_) {}
}

async function updatePvpCorrectProgress(correctCount) {
  if (!isPvpModeActive() || !pvpState.roomId) return;
  try {
    const sb = getSupabaseClient();
    const field = isPvpRoleHost() ? 'host_correct_count' : 'guest_correct_count';
    await sb.from('match_state').update({ [field]: correctCount }).eq('room_id', pvpState.roomId);
    if (isPvpRoleHost()) pvpMatch.hostCorrectCount = correctCount;
    else pvpMatch.guestCorrectCount = correctCount;
    updatePvpCompetitionUi();
  } catch (_) {}
}

async function addPvpWinAndAdvance() {
  if (!isPvpModeActive()) return;
  const sb = getSupabaseClient();
  const matchState = await fetchMatchStateByRoomId(pvpState.roomId);
  if (!matchState) throw new Error('Missing match_state');

  const myWinField = isPvpRoleHost() ? 'host_round_wins' : 'guest_round_wins';
  const myCorrectField = isPvpRoleHost() ? 'host_correct_count' : 'guest_correct_count';
  const nextWins = (matchState[myWinField] || 0) + 1;
  const winsNeeded = getPvpWinsNeeded();

  const patch = {
    [myWinField]: nextWins,
    [myCorrectField]: 0,
    round_status: nextWins >= winsNeeded ? 'finished' : 'waiting',
  };

  const { error } = await sb.from('match_state').update(patch).eq('room_id', pvpState.roomId);
  if (error) throw new Error(error.message);

  await refreshPvpMatchState();
  if (nextWins >= winsNeeded) {
    await sb.from('rooms').update({ status: 'match_finished' }).eq('id', pvpState.roomId);
    pvpState.status = 'match_finished';
    showPvpFinalResult(true);
    return;
  }

  pvpState.localRoundStarted = false;
  pvpState.pendingRoundResult = 'won';
  showPvpRoundScreen('won');
}

function restartCurrentPvpRoundFast() {
  pvpState.localRoundStarted = false;
  pvpState.pendingRoundResult = null;
  const lvl = getPvpLevelFromRoom({
    mode: pvpState.mode,
    colors_count: pvpState.colorsCount,
  });
  if (lvl) {
    startLevel(lvl);
    pvpState.localRoundStarted = true;
    updatePvpCorrectProgress(0);
  }
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
  const winsNeeded = pvpState.bestOf ? getPvpWinsNeeded() : null;
  const roleLabel = info.role === 'host'
    ? t('pvpRoleHost')
    : info.role === 'guest'
      ? t('pvpRoleGuest')
      : (info.role || '-');
  const modeLabel = info.mode === 'classic'
    ? t('pvpModeClassic')
    : info.mode === 'plus_one'
      ? t('pvpModePlusOne')
      : (info.mode || '-');
  box.innerHTML = `
    <h3 class="pvp-panel-title">${t('pvpJoinRoom')}</h3>
    <div class="pvp-status-line"><span class="pvp-status-label">Code</span><span class="pvp-status-value">${info.roomCode || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Role</span><span class="pvp-status-value">${roleLabel}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">Status</span><span class="pvp-status-value">${info.status || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">${t('pvpMode')}</span><span class="pvp-status-value">${modeLabel}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">${t('pvpBestOf')}</span><span class="pvp-status-value">${info.bestOf || '-'}</span></div>
    <div class="pvp-status-line"><span class="pvp-status-label">${t('pvpColors')}</span><span class="pvp-status-value">${info.colorsCount || '-'}</span></div>
    ${winsNeeded ? `<div class="pvp-status-line"><span class="pvp-status-label">Score</span><span class="pvp-status-value">${getMyPvpWins()}-${getOpponentPvpWins()} / ${winsNeeded}</span></div>` : ''}
    <button id="btn-pvp-leave-lobby" class="btn-secondary pvp-btn">${isPvpRoleHost() ? t('pvpCloseRoom') : t('pvpLeaveRoom')}</button>
  `;
  const leaveLobbyBtn = document.getElementById('btn-pvp-leave-lobby');
  if (leaveLobbyBtn) {
    leaveLobbyBtn.addEventListener('click', async () => {
      await leavePvpSession();
      showScreen('pvp-screen');
      document.getElementById('pvp-room-status').style.display = 'none';
    });
  }
}

function updatePvpBestOfHint() {
  const select = document.getElementById('pvp-bestof');
  const hint = document.getElementById('pvp-bestof-hint');
  if (!select || !hint) return;
  hint.textContent = t('pvpBestOfHint', Number(select.value || 1));
}

// ---- LANG ----
function applyLang() {
  document.documentElement.lang = lang;
  document.getElementById('app-subtitle').textContent = t('appSubtitle');
  document.getElementById('btn-play').textContent = t('play');
  const pvpBtn = document.getElementById('btn-pvp');
  if (pvpBtn) pvpBtn.textContent = t('pvpTitle');
  const setText = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  setText('pvp-title', 'pvpTitle');
  setText('pvp-menu-title', 'pvpMenuTitle');
  setText('btn-pvp-open-create', 'pvpCreate');
  setText('btn-pvp-open-join', 'pvpJoin');
  setText('pvp-create-title', 'pvpCreateRoom');
  setText('pvp-join-title', 'pvpJoinRoom');
  setText('pvp-mode-label', 'pvpMode');
  setText('pvp-colors-label', 'pvpColors');
  setText('pvp-bestof-label', 'pvpBestOf');
  setText('btn-create-room', 'pvpCreateRoom');
  setText('btn-join-room', 'pvpJoinByCode');
  setText('btn-pvp-leave', 'pvpLeave');
  setText('btn-pvp-round-back', 'pvpBackToPvp');
  setText('nickname-modal-title', 'pvpNickTitle');
  setText('nickname-modal-subtitle', 'pvpNickSubtitle');
  setText('btn-save-nickname', 'pvpNickSave');
  document.getElementById('nickname-input').placeholder = t('pvpNickPlaceholder');
  document.getElementById('pvp-room-code').placeholder = t('pvpRoomCodePh');
  const modeSelect = document.getElementById('pvp-mode');
  if (modeSelect) {
    const classicOpt = modeSelect.querySelector('option[value="classic"]');
    const plusOneOpt = modeSelect.querySelector('option[value="plus_one"]');
    if (classicOpt) classicOpt.textContent = t('pvpModeClassic');
    if (plusOneOpt) plusOneOpt.textContent = t('pvpModePlusOne');
  }
  updatePvpBestOfHint();
  updatePvpPlayerMeta();
  updatePvpCompetitionUi();
  document.getElementById('lang-toggle').textContent = lang === 'uk' ? 'EN' : 'UA';
}

function toggleLang() {
  lang = lang === 'en' ? 'uk' : 'en';
  saveProgress();
  applyLang();
  if (currentScreen === 'level-screen') renderLevelSelect();
  if (currentScreen === 'game-screen') renderGame();
  if (currentScreen === 'result-screen') {
    if (pvpState.finalResult) {
      showPvpFinalResult(pvpState.finalResult === 'win');
      return;
    }
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
    if (!ensurePvpNickname()) return;
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
  loadSupabaseConfigToForm();
  setPvpConnectionStatus(t('pvpConnectionChecking'));
  setPvpLobbyView('menu');
  updatePvpBestOfHint();

  document.getElementById('btn-save-supabase').addEventListener('click', saveSupabaseConfigFromForm);
  document.getElementById('btn-toggle-dev-config').addEventListener('click', togglePvpDevConfig);
  document.getElementById('btn-save-nickname').addEventListener('click', () => {
    const val = document.getElementById('nickname-input').value;
    if (!saveNickname(val)) {
      showToast('Enter nickname', 1500);
      return;
    }
    hideNicknameModal();
    if (currentScreen === 'home-screen') showScreen('pvp-screen');
  });
  document.getElementById('nickname-input').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    document.getElementById('btn-save-nickname').click();
  });
  document.getElementById('btn-pvp-open-create').addEventListener('click', () => setPvpLobbyView('create'));
  document.getElementById('btn-pvp-open-join').addEventListener('click', () => setPvpLobbyView('join'));
  document.getElementById('btn-pvp-create-back').addEventListener('click', () => setPvpLobbyView('menu'));
  document.getElementById('btn-pvp-join-back').addEventListener('click', () => setPvpLobbyView('menu'));
  document.getElementById('pvp-bestof').addEventListener('change', updatePvpBestOfHint);

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
  state.abilityAvailable  = isPvpModeActive() ? false : state.hasAbility;
  state.revealedPositions = [];
  if (isPvpModeActive()) {
    pvpState.localRoundStarted = true;
    pvpState.pendingRoundResult = null;
  }

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
  updatePvpCompetitionUi();
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
  if (isPvpModeActive()) { btn.style.display = 'none'; return; }
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

async function onConfirm() {
  if (state.gameOver) return;
  const cfg = LEVELS[state.currentLevel - 1];
  if (state.guess.some(c => c === null)) return;

  const correct = countCorrect(state.secret, state.guess);
  state.history.push({ guess: [...state.guess], correct });
  state.attemptsLeft--;
  if (isPvpModeActive()) updatePvpCorrectProgress(correct);

  const won = correct === cfg.colors;
  const lost = !won && state.attemptsLeft === 0;

  if (isPvpModeActive()) {
    if (won || lost) {
      state.gameOver = true;
      state.guess = new Array(cfg.colors).fill(null);
      renderGame();
      setTimeout(async () => {
        if (won) {
          try {
            await addPvpWinAndAdvance();
          } catch (err) {
            showToast(err.message || 'PVP progress update failed', 3000);
          }
        } else {
          await updatePvpCorrectProgress(0);
          pvpState.pendingRoundResult = 'lost';
          showPvpRoundScreen('lost');
        }
      }, 250);
      return;
    }

    state.guess = new Array(cfg.colors).fill(null);
    state.selectedColor = null;
    renderGame();
    return;
  }

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
  nextBtn.style.display = '';
  if (won && state.currentLevel < LEVELS.length) {
    nextBtn.textContent = t('nextLevel');
  } else if (won) {
    nextBtn.textContent = t('playAgain');
  } else {
    nextBtn.textContent = t('tryAgain');
  }

  document.getElementById('btn-levels').textContent = t('allLevels');
  showScreen('result-screen');
  protectScreenFromTapThrough('result-screen', ['btn-next', 'btn-levels'], 700);
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
  document.getElementById('btn-back-game').addEventListener('click', async () => {
    if (isPvpModeActive()) {
      await leavePvpSession();
      document.getElementById('pvp-room-status').style.display = 'none';
      showScreen('pvp-screen');
      return;
    }
    renderLevelSelect();
    showScreen('level-screen');
  });

  document.getElementById('btn-confirm').addEventListener('click', onConfirm);
  document.getElementById('btn-ability').addEventListener('click', useAbility);
  document.getElementById('btn-pvp-leave').addEventListener('click', async () => {
    await leavePvpSession();
    document.getElementById('pvp-room-status').style.display = 'none';
    showScreen('pvp-screen');
  });

  document.getElementById('btn-pvp-round-next').addEventListener('click', () => {
    hidePvpRoundScreen();
    restartCurrentPvpRoundFast();
  });
  document.getElementById('btn-pvp-round-back').addEventListener('click', async () => {
    await leavePvpSession();
    document.getElementById('pvp-room-status').style.display = 'none';
    showScreen('pvp-screen');
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (pvpState.finalResult) return;
    const cfg = LEVELS[state.currentLevel - 1];
    const won = state.history.length > 0 &&
      state.history[state.history.length - 1].correct === cfg.colors;
    if (won) {
      startLevel(state.currentLevel < LEVELS.length ? state.currentLevel + 1 : 1);
    } else {
      startLevel(state.currentLevel);
    }
  });

  document.getElementById('btn-levels').addEventListener('click', async () => {
    if (pvpState.finalResult) {
      await leavePvpSession({ fromMatchEnd: true });
      document.getElementById('pvp-room-status').style.display = 'none';
      showScreen('pvp-screen');
      return;
    }
    renderLevelSelect();
    showScreen('level-screen');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
