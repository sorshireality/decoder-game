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
const LEVEL_PRESETS_V1 = [
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

const STAGE3_REPEATS_PRESETS = [
  { stage: 3, colors: 3, paletteColors: 3, attempts: 8 },
  { stage: 3, colors: 3, paletteColors: 3, attempts: 7 },
  { stage: 3, colors: 4, paletteColors: 4, attempts: 8 },
  { stage: 3, colors: 4, paletteColors: 4, attempts: 7 },
  { stage: 3, colors: 4, paletteColors: 4, attempts: 6 },
  { stage: 3, colors: 5, paletteColors: 5, attempts: 8 },
  { stage: 3, colors: 5, paletteColors: 5, attempts: 7 },
  { stage: 3, colors: 5, paletteColors: 5, attempts: 6 },
];

const STAGE4_FOG_PRESETS = [
  { stage: 4, colors: 4, paletteColors: 4, attempts: 8 },
  { stage: 4, colors: 4, paletteColors: 4, attempts: 7 },
  { stage: 4, colors: 5, paletteColors: 5, attempts: 8 },
  { stage: 4, colors: 5, paletteColors: 5, attempts: 7 },
  { stage: 4, colors: 5, paletteColors: 5, attempts: 6 },
  { stage: 4, colors: 6, paletteColors: 6, attempts: 7 },
];

const STAGE5_FREEZE_PRESETS = [
  { stage: 5, colors: 4, paletteColors: 4, attempts: 8 },
  { stage: 5, colors: 4, paletteColors: 4, attempts: 7 },
  { stage: 5, colors: 5, paletteColors: 5, attempts: 8 },
  { stage: 5, colors: 5, paletteColors: 5, attempts: 7 },
  { stage: 5, colors: 5, paletteColors: 5, attempts: 6 },
  { stage: 5, colors: 6, paletteColors: 6, attempts: 7 },
];

const STAGE6_CHAIN_PRESETS = [
  { stage: 6, colors: 4, paletteColors: 4, attempts: 7, chainRounds: 2 },
  { stage: 6, colors: 4, paletteColors: 4, attempts: 7, chainRounds: 3 },
  { stage: 6, colors: 5, paletteColors: 5, attempts: 8, chainRounds: 3 },
  { stage: 6, colors: 5, paletteColors: 5, attempts: 7, chainRounds: 3 },
  { stage: 6, colors: 5, paletteColors: 5, attempts: 7, chainRounds: 4 },
  { stage: 6, colors: 6, paletteColors: 6, attempts: 8, chainRounds: 4 },
];

function buildLevelV2Entry(cfg, idx, feature = 'none', featureConfig = {}) {
  const globalLevel = idx + 1;
  const stageLevel = cfg.stage === 2 ? globalLevel - 10 : (
    cfg.stage === 1 ? globalLevel : null
  );
  const mode = cfg.stage === 2 ? 'plus_one' : 'classic';
  const stageBasePoints = 10 + (cfg.stage - 1) * 5;
  const levelCoefficient = 1 + (((stageLevel ?? 1) - 1) * 0.12);
  return {
    id: `stage${cfg.stage}-lvl${stageLevel ?? 'x'}`,
    globalLevel,
    stage: cfg.stage,
    stageLevel,
    mode,
    feature,
    featureConfig,
    game: {
      stage: cfg.stage,
      colors: cfg.colors,
      paletteColors: cfg.paletteColors,
      attempts: cfg.attempts,
    },
    scoring: {
      stageBasePoints,
      levelCoefficient,
    },
  };
}

// LEVELS v2 (backward-compatible rollout)
// This is the new source-of-truth shape for future stages/mechanics.
function appendStageEntries(baseLen, presets, feature, featureConfigFactory) {
  return presets.map((cfg, localIdx) => {
    const idx = baseLen + localIdx;
    const entry = buildLevelV2Entry(cfg, idx, feature, featureConfigFactory(cfg, localIdx));
    entry.stageLevel = localIdx + 1;
    entry.id = `stage${cfg.stage}-lvl${entry.stageLevel}`;
    entry.scoring.levelCoefficient = 1 + (localIdx * 0.12);
    return entry;
  });
}

const LEVELS_V2 = [
  ...LEVEL_PRESETS_V1.map((cfg, idx) => buildLevelV2Entry(cfg, idx, 'none', {})),
  ...appendStageEntries(LEVEL_PRESETS_V1.length, STAGE3_REPEATS_PRESETS, 'repeats', () => ({ allowDuplicates: true })),
  ...appendStageEntries(LEVEL_PRESETS_V1.length + STAGE3_REPEATS_PRESETS.length, STAGE4_FOG_PRESETS, 'fog', () => ({ visibleHistory: 3 })),
  ...appendStageEntries(
    LEVEL_PRESETS_V1.length + STAGE3_REPEATS_PRESETS.length + STAGE4_FOG_PRESETS.length,
    STAGE5_FREEZE_PRESETS,
    'freeze',
    () => ({ freezeStartsAfterGuess: 1, freezeDurationTurns: 1 })
  ),
  ...appendStageEntries(
    LEVEL_PRESETS_V1.length + STAGE3_REPEATS_PRESETS.length + STAGE4_FOG_PRESETS.length + STAGE5_FREEZE_PRESETS.length,
    STAGE6_CHAIN_PRESETS,
    'chain',
    (cfg) => ({ chainRounds: cfg.chainRounds || 2 })
  ),
];

// Legacy-compatible flattened view (kept to avoid breaking current game flow).
const LEVELS = LEVELS_V2.map(lvl => lvl.game);
const LEVEL_STAGE_SUMMARY_V2 = LEVELS_V2.reduce((acc, lvl) => {
  acc[lvl.stage] ||= { levels: 0, firstGlobalLevel: lvl.globalLevel, features: new Set() };
  acc[lvl.stage].levels += 1;
  acc[lvl.stage].features.add(lvl.feature);
  return acc;
}, {});

const ABILITY_UNLOCK_LEVEL = 6;
const STAGE1_COUNT = 10;
const MATCHMAKING_ROOM_TTL_MS = 10 * 60 * 1000;
const STORAGE_KEYS = {
  progress: 'decoder_progress',
  score: 'decoder_score_state',
  daily: 'decoder_daily_state',
  guestId: 'decoder_guest_id',
  nickname: 'decoder_nickname',
  supabaseCfg: 'decoder_supabase_cfg',
  pvpSession: 'decoder_pvp_session',
};
const VERCEL_CONFIG_ENDPOINT = '/api/config';
const DAILY_UTC_ROLLOVER = true; // one shared challenge key for all users

// ---- I18N ----
const I18N = {
  en: {
    appSubtitle:      'Crack the secret color code',
    play:             'Play',
    daily:            'Daily',
    dailyDone:        'Daily completed',
    dailyTryTomorrow: 'Come back tomorrow for a new challenge',
    dailyLocked:      'Daily attempt already used',
    dailyAward:       pts => `Daily +${pts} pts`,
    dailyBadge:       'Daily Challenge',
    dailySolved:      'Daily challenge cleared!',
    dailyFailed:      'Daily challenge failed',
    dailyOneAttempt:  'One scored attempt today',
    pvp:              'PVP',
    pvpTitle:         'Duel',
    pvpConnection:    'Connection',
    pvpMenuTitle:     'Duel',
    pvpFindMatchCta:  'Find Match',
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
    authGuestMode:    'Guest mode',
    authSignedAs:     email => `Signed in: ${email}`,
    authGoogleIn:     'Google Sign In',
    authSignOut:      'Sign Out',
    authHomeSigned:   name => name ? name : 'Account',
    authHomeGuest:    'Google',
    nickChange:       'Change Nick',
    progressSynced:   'Progress synced to account',
    scoreShort:       n => `${n} pts`,
    leaderboard:      'Leaderboard',
    leaderboardTop10: 'Top 10 Global Rating',
    leaderboardLoading:'Loading leaderboard…',
    leaderboardEmpty: 'No players yet',
    leaderboardError: 'Leaderboard unavailable',
    leaderboardYou:   name => `${name} (you)`,
    matchmaking:      'Matchmaking',
    matchmakingAny:   'Any room',
    matchmakingExact: 'By settings',
    findMatch:        'Find Match',
    stopSearch:       'Stop Search',
    searching:        'Searching…',
    searchingBySettings:'Searching by settings…',
    pvpSearchingTitle:'Searching Match',
    pvpSearchingSub:  'Looking for an opponent…',
    pvpCreatedTitle:  'Room Created',
    pvpCreatedSub:    'Waiting for opponent…',
    pvpCancel:        'Cancel',
    pvpCodeLabel:     'Code',
    pvpCreateWaitingInfo: (mode, bestOf, colors) => `${mode} • Best of ${bestOf} • ${colors} colors`,
    pvpRoomTaken:     'Room just got taken. Trying next…',
    pvpRoomUnavailable:'Room unavailable',
    findNoRooms:      'No rooms found',
    matchFound:       'Match found',
    rematch:          'Rematch',
    rematchWaiting:   'Rematch requested. Waiting…',
    rematchIncoming:  'Opponent asks for rematch',
    rematchAccept:    'Accept Rematch',
    rematchDecline:   'Decline',
    pvpLeave:         'Leave PVP',
    pvpBackToPvp:     'Back to Duel',
    pvpCloseRoom:     'Close Room',
    pvpLeaveRoom:     'Leave Room',
    pvpRoundWon:      'Round cleared',
    pvpRoundLost:     'Round failed',
    pvpRoundKeepGoing:'Keep going',
    pvpRoundRetryFast:'Retry same round fast',
    pvpVsPreparing:   'Preparing match…',
    pvpVsRating:      n => `Rating: ${n ?? '-'}`,
    pvpNext:          'Next',
    pvpRetry:         'Retry',
    pvpVictory:       'Victory',
    pvpDefeat:        'Defeat',
    pvpFinalScore:    (a, b) => `Final score ${a}-${b}`,
    pvpResultLock:    s => `Back in ${s}s`,
    pvpRoleHost:      'Host',
    pvpRoleGuest:     'Guest',
    selectLevel:      'Select Level',
    stageName:        n => `Stage ${n}: ${({1:'Classic',2:'Decoy',3:'Repeats',4:'Fog',5:'Freeze',6:'Chain'}[n] || 'Mode')}`,
    stage2desc:       'Palette has one decoy color',
    stage3desc:       'Repeats are allowed in the secret code',
    stage4desc:       'Only last 3 attempts are visible',
    stage5desc:       'A random slot freezes each turn (from turn 2)',
    stage6desc:       'Win a chain of rounds with fewer attempts each round',
    levelHeader:      (cfg, stageLvl) =>
      cfg.stage === 2
        ? `Stage 2 · Lv.${stageLvl} · ${cfg.colors}+1`
        : cfg.stage === 3
          ? `Stage 3 · Lv.${stageLvl} · Repeats`
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
    daily:            'Щоденна',
    dailyDone:        'Щоденну загадку пройдено',
    dailyTryTomorrow: 'Повернись завтра за новим челенджем',
    dailyLocked:      'Сьогоднішню зараховану спробу вже використано',
    dailyAward:       pts => `Щоденна +${pts} очк.`,
    dailyBadge:       'Щоденний челендж',
    dailySolved:      'Щоденну загадку пройдено!',
    dailyFailed:      'Щоденний челендж не пройдено',
    dailyOneAttempt:  'Одна зарахована спроба сьогодні',
    pvp:              'PVP',
    pvpTitle:         'Поєдинок',
    pvpConnection:    'Підключення',
    pvpMenuTitle:     'Поєдинок',
    pvpFindMatchCta:  'Пошук матчу',
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
    authGuestMode:    'Режим гостя',
    authSignedAs:     email => `Увійшов: ${email}`,
    authGoogleIn:     'Увійти через Google',
    authSignOut:      'Вийти',
    authHomeSigned:   name => name ? name : 'Акаунт',
    authHomeGuest:    'Google',
    nickChange:       'Змінити нік',
    progressSynced:   'Прогрес синхронізовано',
    scoreShort:       n => `${n} очк.`,
    leaderboard:      'Рейтинг',
    leaderboardTop10: 'Топ 10 загального рейтингу',
    leaderboardLoading:'Завантаження рейтингу…',
    leaderboardEmpty: 'Поки немає гравців',
    leaderboardError: 'Рейтинг недоступний',
    leaderboardYou:   name => `${name} (ти)`,
    matchmaking:      'Пошук матчу',
    matchmakingAny:   'Будь-яка кімната',
    matchmakingExact: 'За налаштуваннями',
    findMatch:        'Знайти матч',
    stopSearch:       'Зупинити пошук',
    searching:        'Пошук…',
    searchingBySettings:'Пошук за налаштуваннями…',
    pvpSearchingTitle:'Пошук матчу',
    pvpSearchingSub:  'Шукаємо суперника…',
    pvpCreatedTitle:  'Кімнату створено',
    pvpCreatedSub:    'Очікування суперника…',
    pvpCancel:        'Скасувати',
    pvpCodeLabel:     'Код',
    pvpCreateWaitingInfo: (mode, bestOf, colors) => `${mode} • Best of ${bestOf} • ${colors} кол.`,
    pvpRoomTaken:     'Кімнату щойно зайняли. Шукаємо далі…',
    pvpRoomUnavailable:'Кімната недоступна',
    findNoRooms:      'Кімнат не знайдено',
    matchFound:       'Матч знайдено',
    rematch:          'Реванш',
    rematchWaiting:   'Запит на реванш надіслано…',
    rematchIncoming:  'Суперник пропонує реванш',
    rematchAccept:    'Прийняти реванш',
    rematchDecline:   'Відхилити',
    pvpLeave:         'Вийти з PvP',
    pvpBackToPvp:     'Назад до поєдинку',
    pvpCloseRoom:     'Закрити кімнату',
    pvpLeaveRoom:     'Вийти з кімнати',
    pvpRoundWon:      'Раунд пройдено',
    pvpRoundLost:     'Раунд програно',
    pvpRoundKeepGoing:'Продовжуй',
    pvpRoundRetryFast:'Швидко повторити раунд',
    pvpVsPreparing:   'Підготовка матчу…',
    pvpVsRating:      n => `Рейтинг: ${n ?? '-'}`,
    pvpNext:          'Далі',
    pvpRetry:         'Повторити',
    pvpVictory:       'Перемога',
    pvpDefeat:        'Поразка',
    pvpFinalScore:    (a, b) => `Фінальний рахунок ${a}-${b}`,
    pvpResultLock:    s => `Назад через ${s}с`,
    pvpRoleHost:      'Ведучий',
    pvpRoleGuest:     'Гість',
    selectLevel:      'Вибір рівня',
    stageName:        n => `Стадія ${n}: ${({1:'Класика',2:'Зайвий',3:'Повтори',4:'Туман',5:'Замороження',6:'Ланцюг'}[n] || 'Режим')}`,
    stage2desc:       'У палітрі є один зайвий колір',
    stage3desc:       'У секретному коді дозволені повтори',
    stage4desc:       'Видно лише останні 3 спроби',
    stage5desc:       'Випадкова комірка заморожується щоходу (з 2-го ходу)',
    stage6desc:       'Ланцюг раундів із меншим числом спроб',
    levelHeader:      (cfg, stageLvl) =>
      cfg.stage === 2
        ? `Стадія 2 · Рів.${stageLvl} · ${cfg.colors}+1`
        : cfg.stage === 3
          ? `Стадія 3 · Рів.${stageLvl} · Повтори`
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
  frozenSlotIndex:    null,
  chain:              null, // { totalRounds, roundIndex, baseAttempts }
  awardedMainLevels:  [],
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
  myName: null,
  opponentName: null,
  myRating: null,
  opponentRating: null,
  matchRewardGranted: false,
  introShownForMatch: false,
  vsTimer: null,
};
let pvpMatch = {
  hostWins: 0,
  guestWins: 0,
  hostCorrectCount: 0,
  guestCorrectCount: 0,
  roundStatus: 'waiting',
  rematchStatus: 'idle',
  rematchRequestedBy: null,
};
let authState = {
  user: null,
  profile: null,
  authReady: false,
  lastSyncToastAt: 0,
};
let supabaseClient = null;
let supabaseClientCfgKey = '';
let pvpConfigReadyCache = {
  ok: false,
  source: '',
  verifiedAt: 0,
};
let pvpInitPromise = null;
let pvpRoomChannel = null;
let pvpPollTimer = null;
let uiInteractionUnlocks = {};
let autoMatchSearch = {
  active: false,
  timer: null,
};
let leaderboardState = {
  rows: [],
  loading: false,
};
let scoreState = {
  mainGameScore: 0,
};
let dailyState = {
  records: {},
  active: null, // { dateKey, challenge, pointsAwarded, startedAt }
};

const DAILY_CHALLENGE_POOL = [
  { kind: 'preset_level', level: 10, tag: 'classic-hard' },
  { kind: 'preset_level', level: 12, tag: 'decoy-pressure' },
  { kind: 'preset_level', level: 14, tag: 'decoy-tight' },
  { kind: 'preset_level', level: 15, tag: 'decoy-wide' },
  { kind: 'preset_level', level: 16, tag: 'repeats-intro' },
  { kind: 'preset_level', level: 18, tag: 'repeats-mid' },
  { kind: 'preset_level', level: 20, tag: 'repeats-tight' },
  { kind: 'preset_level', level: 23, tag: 'repeats-hard' },
];

// ---- STORAGE ----
function saveProgress() {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify({
    unlockedLevel: state.unlockedLevel,
    hasAbility:    state.hasAbility,
    awardedMainLevels: Array.isArray(state.awardedMainLevels) ? state.awardedMainLevels : [],
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
      if (Array.isArray(d.awardedMainLevels)) {
        state.awardedMainLevels = d.awardedMainLevels
          .map(n => Number(n))
          .filter(n => Number.isInteger(n) && n >= 1 && n <= LEVELS.length);
      } else {
        // Legacy save migration: treat already unlocked cleared levels as already rewarded.
        state.awardedMainLevels = Array.from({ length: Math.max(0, state.unlockedLevel - 1) }, (_, i) => i + 1);
      }
      if (d.lang && I18N[d.lang]) lang = d.lang;
    }
  } catch (_) {}
}

function hasAwardedMainLevel(level) {
  return Array.isArray(state.awardedMainLevels) && state.awardedMainLevels.includes(level);
}

function markAwardedMainLevel(level) {
  if (!Number.isInteger(level) || level < 1) return false;
  if (!Array.isArray(state.awardedMainLevels)) state.awardedMainLevels = [];
  if (state.awardedMainLevels.includes(level)) return false;
  state.awardedMainLevels.push(level);
  state.awardedMainLevels.sort((a, b) => a - b);
  return true;
}

function saveScoreState() {
  localStorage.setItem(STORAGE_KEYS.score, JSON.stringify(scoreState));
}

function loadScoreState() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEYS.score) || '{}');
    scoreState.mainGameScore = Number(d.mainGameScore || 0);
  } catch (_) {
    scoreState.mainGameScore = 0;
  }
}

function saveDailyState() {
  localStorage.setItem(STORAGE_KEYS.daily, JSON.stringify({
    records: dailyState.records || {},
  }));
}

function loadDailyState() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEYS.daily) || '{}');
    dailyState.records = (d && typeof d.records === 'object' && d.records) ? d.records : {};
  } catch (_) {
    dailyState.records = {};
  }
}

function getDailyDateKey(date = new Date()) {
  if (!DAILY_UTC_ROLLOVER) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return date.toISOString().slice(0, 10);
}

function seededRngFromString(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function next() {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailyChallengeForDate(dateKey = getDailyDateKey()) {
  const rng = seededRngFromString(`daily:${dateKey}:v1`);
  const idx = Math.floor(rng() * DAILY_CHALLENGE_POOL.length);
  const template = DAILY_CHALLENGE_POOL[idx];
  if (template.kind === 'preset_level') {
    const lvlV2 = getLevelV2(template.level);
    const game = lvlV2?.game || LEVELS[template.level - 1];
    return {
      dateKey,
      id: `${dateKey}:${template.kind}:${template.level}:${template.tag}`,
      kind: template.kind,
      tag: template.tag,
      level: template.level,
      stage: game.stage,
      colors: game.colors,
      attempts: game.attempts,
      mode: lvlV2?.mode || (game.stage === 2 ? 'plus_one' : 'classic'),
      feature: lvlV2?.feature || 'none',
      scoreBase: 15,
    };
  }
  return null;
}

function getTodayDailyRecord() {
  return dailyState.records[getDailyDateKey()] || null;
}

function isDailyModeActive() {
  return !!dailyState.active;
}

function clearDailyActiveSession() {
  dailyState.active = null;
}

function getDailyPointsReward(attemptsLeft) {
  return 15 + (Math.max(0, Number(attemptsLeft || 0)) * 5);
}

function startDailyChallenge() {
  const todayKey = getDailyDateKey();
  const existing = dailyState.records[todayKey];
  if (existing && existing.completed) {
    showToast(t('dailyLocked'), 2200);
    return;
  }
  const challenge = getDailyChallengeForDate(todayKey);
  if (!challenge) {
    showToast('Daily unavailable', 2200);
    return;
  }
  dailyState.active = {
    dateKey: todayKey,
    challenge,
    startedAt: Date.now(),
    pointsAwarded: false,
  };
  startLevel(challenge.level);
}

function completeDailyChallengeRun(won, attemptsLeft) {
  const active = dailyState.active;
  if (!active || !active.challenge) return;
  const points = won ? getDailyPointsReward(attemptsLeft) : 0;
  dailyState.records[active.dateKey] = {
    completed: true,
    won,
    challengeId: active.challenge.id,
    level: active.challenge.level,
    attemptsLeft: Math.max(0, Number(attemptsLeft || 0)),
    attemptsTotal: Number(active.challenge.attempts || 0),
    points,
    finishedAt: new Date().toISOString(),
  };
  saveDailyState();
  if (won && !active.pointsAwarded && points > 0) {
    active.pointsAwarded = true;
    addDailyPoints(points).catch(() => {});
    showToast(t('dailyAward', points), 2200);
  }
}

function updateHomeScoreUi() {
  const el = document.getElementById('home-score');
  if (!el) return;
  el.textContent = t('scoreShort', scoreState.mainGameScore || 0);
}

function setPvpFindStatus(msg = '') {
  const el = document.getElementById('pvp-find-status');
  if (!el) return;
  el.textContent = msg;
  const searchingEl = document.getElementById('pvp-searching-status');
  if (searchingEl) searchingEl.textContent = msg;
}

function renderLeaderboard() {
  const statusEl = document.getElementById('leaderboard-status');
  const listEl = document.getElementById('leaderboard-list');
  if (!statusEl || !listEl) return;

  if (leaderboardState.loading) {
    statusEl.textContent = t('leaderboardLoading');
    listEl.innerHTML = '';
    return;
  }

  statusEl.textContent = t('leaderboardTop10');
  listEl.innerHTML = '';
  if (!leaderboardState.rows.length) {
    statusEl.textContent = t('leaderboardEmpty');
    return;
  }

  leaderboardState.rows.forEach((row, index) => {
    const item = document.createElement('div');
    item.className = 'leaderboard-row';
    if (authState.user && row.user_id === authState.user.id) item.classList.add('me');
    const name = authState.user && row.user_id === authState.user.id
      ? t('leaderboardYou', row.nickname || row.email || 'Player')
      : (row.nickname || row.email || 'Player');
    item.innerHTML = `
      <div class="leaderboard-rank">#${index + 1}</div>
      <div class="leaderboard-name">${name}</div>
      <div class="leaderboard-score">${Number(row.rating_score || 0)}</div>
    `;
    listEl.appendChild(item);
  });
}

async function loadLeaderboardTop10() {
  leaderboardState.loading = true;
  renderLeaderboard();
  try {
    await ensurePvpConfigReady();
    const sb = getSupabaseClient();
    const { data: scores, error: scoreErr } = await sb
      .from('player_scores')
      .select('user_id,rating_score')
      .order('rating_score', { ascending: false })
      .limit(10);
    if (scoreErr) throw scoreErr;

    const ids = (scores || []).map(s => s.user_id).filter(Boolean);
    let profiles = [];
    if (ids.length) {
      const profileRes = await sb.from('profiles')
        .select('id,nickname,email')
        .in('id', ids);
      if (!profileRes.error) profiles = profileRes.data || [];
    }
    const byId = new Map(profiles.map(p => [p.id, p]));
    leaderboardState.rows = (scores || []).map(s => ({
      ...s,
      nickname: byId.get(s.user_id)?.nickname || null,
      email: byId.get(s.user_id)?.email || null,
    }));
  } catch (_) {
    leaderboardState.rows = [];
    const statusEl = document.getElementById('leaderboard-status');
    const listEl = document.getElementById('leaderboard-list');
    if (statusEl) statusEl.textContent = t('leaderboardError');
    if (listEl) listEl.innerHTML = '';
    leaderboardState.loading = false;
    return;
  }
  leaderboardState.loading = false;
  renderLeaderboard();
}

function stopAutoMatchSearch() {
  autoMatchSearch.active = false;
  if (autoMatchSearch.timer) clearTimeout(autoMatchSearch.timer);
  autoMatchSearch.timer = null;
  const btn = document.getElementById('btn-find-match');
  if (btn) btn.textContent = t('findMatch');
}

function getRematchRequesterIsMe() {
  return pvpMatch.rematchRequestedBy && pvpMatch.rematchRequestedBy === getCurrentPlayerId();
}

function getStageBasePoints(stage) {
  return 10 + (Math.max(1, stage) - 1) * 5;
}

function getLevelCoefficient(stageLevel) {
  return 1 + Math.max(0, stageLevel - 1) * 0.12;
}

function getLevelV2(globalLevel) {
  return LEVELS_V2[globalLevel - 1] || null;
}

function getCurrentLevelV2() {
  if (!state.currentLevel) return null;
  return getLevelV2(state.currentLevel);
}

function getCurrentFeature() {
  return getCurrentLevelV2()?.feature || 'none';
}

function getCurrentFeatureConfig() {
  return getCurrentLevelV2()?.featureConfig || {};
}

function calculateMainGamePoints(levelNumber) {
  const lvl = getLevelV2(levelNumber);
  if (!lvl) return 0;
  return Math.round(lvl.scoring.stageBasePoints * lvl.scoring.levelCoefficient);
}

async function syncLocalScoreToCloud() {
  if (!authState.user) return;
  const sb = getSupabaseClient();
  const localMain = Number(scoreState.mainGameScore || 0);
  const { data: cloud, error: readErr } = await sb
    .from('player_scores')
    .select('*')
    .eq('user_id', authState.user.id)
    .maybeSingle();
  if (readErr) throw readErr;
  const mergedMain = Math.max(localMain, Number(cloud?.main_game_score || 0));
  scoreState.mainGameScore = mergedMain;
  saveScoreState();
  updateHomeScoreUi();
  const payload = {
    user_id: authState.user.id,
    main_game_score: mergedMain,
    rating_score: Math.max(mergedMain + Number(cloud?.daily_score || 0) + Number(cloud?.pvp_score || 0), Number(cloud?.rating_score || 0)),
    daily_score: Number(cloud?.daily_score || 0),
    pvp_score: Number(cloud?.pvp_score || 0),
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from('player_scores').upsert(payload);
  if (error) throw error;
}

async function addMainGamePoints(points) {
  if (!points || points < 1) return;
  scoreState.mainGameScore += points;
  saveScoreState();
  updateHomeScoreUi();
  if (authState.user) {
    try {
      const sb = getSupabaseClient();
      const { data: cloud } = await sb.from('player_scores').select('*').eq('user_id', authState.user.id).maybeSingle();
      const nextMain = Number(cloud?.main_game_score || 0) + points;
      const nextDaily = Number(cloud?.daily_score || 0);
      const nextPvp = Number(cloud?.pvp_score || 0);
      await sb.from('player_scores').upsert({
        user_id: authState.user.id,
        main_game_score: nextMain,
        daily_score: nextDaily,
        pvp_score: nextPvp,
        rating_score: nextMain + nextDaily + nextPvp,
        updated_at: new Date().toISOString(),
      });
    } catch (_) {}
  }
}

async function addPvpMatchPoints(won) {
  const points = won ? 20 : 5;
  if (authState.user) {
    try {
      const sb = getSupabaseClient();
      const { data: cloud } = await sb.from('player_scores').select('*').eq('user_id', authState.user.id).maybeSingle();
      const nextMain = Number(cloud?.main_game_score || 0);
      const nextDaily = Number(cloud?.daily_score || 0);
      const nextPvp = Number(cloud?.pvp_score || 0) + points;
      await sb.from('player_scores').upsert({
        user_id: authState.user.id,
        main_game_score: nextMain,
        daily_score: nextDaily,
        pvp_score: nextPvp,
        rating_score: nextMain + nextDaily + nextPvp,
        updated_at: new Date().toISOString(),
      });
    } catch (_) {}
  }
}

function awardPvpMatchPointsOnce(won) {
  if (pvpState.matchRewardGranted) return;
  pvpState.matchRewardGranted = true;
  addPvpMatchPoints(won).catch(() => {});
}

async function addDailyPoints(points) {
  if (!points || points < 1) return;
  scoreState.mainGameScore += points;
  saveScoreState();
  updateHomeScoreUi();
  if (authState.user) {
    try {
      const sb = getSupabaseClient();
      const { data: cloud } = await sb.from('player_scores').select('*').eq('user_id', authState.user.id).maybeSingle();
      const nextMain = Number(cloud?.main_game_score || 0);
      const nextDaily = Number(cloud?.daily_score || 0) + points;
      const nextPvp = Number(cloud?.pvp_score || 0);
      await sb.from('player_scores').upsert({
        user_id: authState.user.id,
        main_game_score: nextMain,
        daily_score: nextDaily,
        pvp_score: nextPvp,
        rating_score: nextMain + nextDaily + nextPvp,
        updated_at: new Date().toISOString(),
      });
    } catch (_) {}
  }
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
function generateSecret(cfg, featureConfig = {}) {
  const palette = COLORS.slice(0, cfg.paletteColors).map(c => c.id);
  if (featureConfig.allowDuplicates) {
    const secret = [];
    for (let i = 0; i < cfg.colors; i++) {
      secret.push(palette[Math.floor(Math.random() * palette.length)]);
    }
    return secret;
  }
  const pool = shuffle(palette);
  return pool.slice(0, cfg.colors);
}

function countCorrect(secret, guess) {
  return secret.reduce((acc, c, i) => acc + (c === guess[i] ? 1 : 0), 0);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function sampleIndices(count, maxExclusive) {
  const all = Array.from({ length: maxExclusive }, (_, i) => i);
  const shuffled = shuffle(all);
  return shuffled.slice(0, Math.max(0, Math.min(count, maxExclusive)));
}

function applyFreezeForNextTurn(cfg) {
  if (getCurrentFeature() !== 'freeze') {
    state.frozenSlotIndex = null;
    return;
  }
  if (state.history.length < 1) {
    state.frozenSlotIndex = null;
    return;
  }
  const blocked = new Set(state.revealedPositions.map(r => r.index));
  const candidates = [];
  for (let i = 0; i < cfg.colors; i++) {
    if (!blocked.has(i)) candidates.push(i);
  }
  if (!candidates.length) {
    state.frozenSlotIndex = null;
    return;
  }
  state.frozenSlotIndex = candidates[getRandomInt(candidates.length)];
  state.guess[state.frozenSlotIndex] = null;
}

function initChainStateForLevel() {
  const lvlV2 = getCurrentLevelV2();
  if (!lvlV2 || lvlV2.feature !== 'chain') {
    state.chain = null;
    return;
  }
  const rounds = Math.max(2, Number(lvlV2.featureConfig?.chainRounds || 2));
  state.chain = {
    totalRounds: rounds,
    roundIndex: 1,
    baseAttempts: LEVELS[state.currentLevel - 1].attempts,
  };
}

function setupChainRound(roundIndex, cfg) {
  state.history = [];
  state.selectedColor = null;
  state.gameOver = false;
  state.frozenSlotIndex = null;
  state.secret = generateSecret(cfg, getCurrentFeatureConfig());
  state.guess = new Array(cfg.colors).fill(null);
  state.revealedPositions = [];
  const attempts = Math.max(1, cfg.attempts - Math.max(0, roundIndex - 1));
  state.attemptsLeft = attempts;
  const presetReveals = Math.max(0, roundIndex - 1);
  if (presetReveals > 0) {
    sampleIndices(Math.min(presetReveals, cfg.colors - 1), cfg.colors).forEach(index => {
      state.revealedPositions.push({ index, colorId: state.secret[index] });
      state.guess[index] = state.secret[index];
    });
  }
}

function advanceChainRoundOrFinish(cfg) {
  if (!state.chain) return false;
  if (state.chain.roundIndex >= state.chain.totalRounds) return false;
  state.chain.roundIndex += 1;
  setupChainRound(state.chain.roundIndex, cfg);
  renderGame();
  showToast(`Chain ${state.chain.roundIndex}/${state.chain.totalRounds}`, 1600);
  return true;
}

// Returns the display level number within the stage (1-based)
function stageLvlNum(globalLvl) {
  return getLevelV2(globalLvl)?.stageLevel || globalLvl;
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
  const searching = document.getElementById('pvp-searching-panel');
  const created = document.getElementById('pvp-created-panel');
  const roomStatus = document.getElementById('pvp-room-status');
  if (!menu || !create || !join || !searching || !created || !roomStatus) return;
  menu.style.display = view === 'menu' ? '' : 'none';
  create.style.display = view === 'create' ? '' : 'none';
  join.style.display = view === 'join' ? '' : 'none';
  searching.style.display = view === 'searching' ? '' : 'none';
  created.style.display = view === 'created' ? '' : 'none';
  roomStatus.style.display = view === 'status' ? '' : 'none';
  if (view !== 'join' && view !== 'searching') {
    stopAutoMatchSearch();
    setPvpFindStatus('');
  }
}

function updatePvpCreatedPanel() {
  const codeEl = document.getElementById('pvp-created-code');
  const infoEl = document.getElementById('pvp-created-match-info');
  if (!codeEl || !infoEl) return;
  codeEl.textContent = (pvpState.roomCode || '------').toUpperCase();
  const modeLabel = pvpState.mode === 'plus_one' ? t('pvpModePlusOne') : t('pvpModeClassic');
  infoEl.textContent = pvpState.bestOf && pvpState.colorsCount
    ? t('pvpCreateWaitingInfo', modeLabel, pvpState.bestOf, pvpState.colorsCount)
    : '';
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

async function fetchScoresByUserIds(userIds) {
  const ids = (userIds || []).filter(Boolean);
  if (!ids.length) return [];
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from('player_scores')
    .select('user_id,rating_score')
    .in('user_id', ids);
  if (error) throw error;
  return data || [];
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

function getCurrentPlayerId() {
  return authState.user?.id || getGuestPlayerId();
}

function getCurrentPlayerNickname() {
  return getNickname() || authState.profile?.nickname || authState.user?.user_metadata?.full_name || '';
}

async function fetchProfile(userId) {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertProfileFromAuthUser(user) {
  if (!user) return;
  const sb = getSupabaseClient();
  const nickname = getNickname() || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';
  const payload = {
    id: user.id,
    email: user.email || null,
    nickname,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from('profiles').upsert(payload);
  if (error) throw error;
  authState.profile = { ...(authState.profile || {}), ...payload };
  if (!getNickname()) saveNickname(nickname);
}

async function mergeLocalProgressToCloud(user) {
  if (!user) return;
  const sb = getSupabaseClient();
  const local = {
    unlocked_level: state.unlockedLevel,
    has_ability: state.hasAbility,
    lang,
  };
  const { data: cloud, error: cloudErr } = await sb
    .from('player_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (cloudErr) throw cloudErr;

  const merged = {
    user_id: user.id,
    unlocked_level: Math.max(local.unlocked_level || 1, cloud?.unlocked_level || 1),
    has_ability: Boolean(local.has_ability || cloud?.has_ability),
    lang: local.lang || cloud?.lang || 'en',
    updated_at: new Date().toISOString(),
  };

  state.unlockedLevel = merged.unlocked_level;
  state.hasAbility = merged.has_ability;
  saveProgress();

  const { error } = await sb.from('player_progress').upsert(merged);
  if (error) throw error;
}

function updateAuthUi() {
  const authMeta = document.getElementById('pvp-auth-meta');
  const signInBtn = document.getElementById('btn-auth-google');
  const signOutBtn = document.getElementById('btn-auth-logout');
  const editNickBtn = document.getElementById('btn-edit-nickname');
  const homeAuthBtn = document.getElementById('btn-auth-home');
  if (!authMeta || !signInBtn || !signOutBtn || !editNickBtn || !homeAuthBtn) return;

  if (authState.user) {
    authMeta.textContent = t('authSignedAs', authState.user.email || authState.profile?.nickname || 'Google');
    signInBtn.style.display = 'none';
    signOutBtn.style.display = '';
    homeAuthBtn.textContent = t('authHomeSigned', (authState.profile?.nickname || authState.user.user_metadata?.full_name || ''));
    homeAuthBtn.classList.add('signed');
  } else {
    authMeta.textContent = t('authGuestMode');
    signInBtn.style.display = '';
    signOutBtn.style.display = 'none';
    homeAuthBtn.textContent = t('authHomeGuest');
    homeAuthBtn.classList.remove('signed');
  }
  signInBtn.textContent = t('authGoogleIn');
  signOutBtn.textContent = t('authSignOut');
  editNickBtn.textContent = t('nickChange');
}

async function handleAuthSession(session, event = 'INITIAL_SESSION') {
  const prevUserId = authState.user?.id || null;
  authState.user = session?.user || null;
  authState.authReady = true;
  authState.profile = null;
  if (authState.user) {
    const shouldSyncCloud = ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED'].includes(event) || prevUserId !== authState.user.id;
    try {
      await upsertProfileFromAuthUser(authState.user);
      try {
        authState.profile = await fetchProfile(authState.user.id);
      } catch (_) {}
      if (shouldSyncCloud) {
        await mergeLocalProgressToCloud(authState.user);
        await syncLocalScoreToCloud();
        const now = Date.now();
        if (now - (authState.lastSyncToastAt || 0) > 12000) {
          showToast(t('progressSynced'), 1800);
          authState.lastSyncToastAt = now;
        }
      }
    } catch (err) {
      showToast(err?.message || 'Auth sync failed', 2500);
    }
  }
  updateAuthUi();
  updatePvpPlayerMeta();
  updatePvpCompetitionUi();
  updateHomeScoreUi();
  if (currentScreen === 'level-screen') renderLevelSelect();
}

async function initSupabaseAuth() {
  const sb = getSupabaseClient();
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  await handleAuthSession(data.session, 'INITIAL_SESSION');
  sb.auth.onAuthStateChange((event, session) => {
    handleAuthSession(session, event);
  });
}

async function signInWithGoogle() {
  await ensurePvpConfigReady();
  const sb = getSupabaseClient();
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}

async function signOutGoogle() {
  await ensurePvpConfigReady();
  const sb = getSupabaseClient();
  await sb.auth.signOut();
  authState.user = null;
  authState.profile = null;
  updateAuthUi();
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
  if (el.textContent === text && ((tone && el.classList.contains(tone)) || (!tone && !el.classList.contains('ok') && !el.classList.contains('warn')))) {
    return;
  }
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
  const now = Date.now();
  if (pvpConfigReadyCache.ok && (now - pvpConfigReadyCache.verifiedAt < 60000)) {
    if (pvpConfigReadyCache.source === 'backend') setPvpConnectionStatus(t('pvpConnectionBackend'), 'ok');
    else if (pvpConfigReadyCache.source === 'fallback') setPvpConnectionStatus(t('pvpConnectionFallback'), 'warn');
    return true;
  }
  try {
    setPvpConnectionStatus(t('pvpConnectionChecking'));
    await tryLoadSupabaseConfigFromServer();
    getSupabaseClient();
    setPvpConnectionStatus(t('pvpConnectionBackend'), 'ok');
    pvpConfigReadyCache = { ok: true, source: 'backend', verifiedAt: now };
    return true;
  } catch (_) {
    try {
      loadSupabaseConfigToForm();
      getSupabaseClient();
      setPvpConnectionStatus(t('pvpConnectionFallback'), 'warn');
      pvpConfigReadyCache = { ok: true, source: 'fallback', verifiedAt: now };
      return true;
    } catch (fallbackErr) {
      setPvpConnectionStatus(t('pvpConnectionMissing'), 'warn');
      pvpConfigReadyCache = { ok: false, source: '', verifiedAt: now };
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

function getMatchmakingFreshSinceIso() {
  return new Date(Date.now() - MATCHMAKING_ROOM_TTL_MS).toISOString();
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

function renderPvpVsScreen() {
  const meName = (pvpState.myName || getCurrentPlayerNickname() || (isPvpRoleHost() ? t('pvpRoleHost') : t('pvpRoleGuest'))).slice(0, 16);
  const oppName = (pvpState.opponentName || (isPvpRoleHost() ? t('pvpRoleGuest') : t('pvpRoleHost'))).slice(0, 16);
  document.getElementById('pvp-vs-me-name').textContent = meName;
  document.getElementById('pvp-vs-opp-name').textContent = oppName;
  document.getElementById('pvp-vs-me-rating').textContent = t('pvpVsRating', pvpState.myRating);
  document.getElementById('pvp-vs-opp-rating').textContent = t('pvpVsRating', pvpState.opponentRating);
  document.getElementById('pvp-vs-subtitle').textContent = t('pvpVsPreparing');
}

function schedulePvpMatchIntroStart(room, lvl) {
  if (pvpState.vsTimer) {
    clearTimeout(pvpState.vsTimer);
    pvpState.vsTimer = null;
  }
  pvpState.introShownForMatch = true;
  renderPvpVsScreen();
  showScreen('pvp-vs-screen');
  pvpState.vsTimer = setTimeout(() => {
    pvpState.vsTimer = null;
    if (!isPvpModeActive() || pvpState.status !== 'ready') return;
    pvpState.localRoundStarted = true;
    showToast(`Match ready • ${room.room_code}`, 1800);
    startLevel(lvl);
  }, 1200);
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
  const isFreshMatchIntro = !pvpState.introShownForMatch && getMyPvpWins() === 0 && getOpponentPvpWins() === 0;
  if (isFreshMatchIntro) {
    schedulePvpMatchIntroStart(room, lvl);
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
  updatePvpCreatedPanel();
  renderPvpStatus({
    roomCode: room.room_code,
    role: pvpState.role,
    status: room.status,
    mode: room.mode,
    bestOf: room.best_of,
    colorsCount: room.colors_count,
  });
  if (currentScreen === 'pvp-screen') {
    if (room.status === 'waiting_for_opponent' && pvpState.role === 'host') {
      setPvpLobbyView('created');
    } else if (room.status !== 'waiting_for_opponent' && !autoMatchSearch.active && !pvpState.localRoundStarted) {
      setPvpLobbyView('status');
    }
  }
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

async function fetchRoomPlayers(roomId) {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from('room_players')
    .select('player_id, user_id, role, nickname')
    .eq('room_id', roomId);
  if (error) throw error;
  return data || [];
}

async function refreshPvpNames() {
  if (!pvpState.roomId) return;
  try {
    const players = await fetchRoomPlayers(pvpState.roomId);
    const me = players.find(p => p.role === pvpState.role);
    const opp = players.find(p => p.role && p.role !== pvpState.role);
    pvpState.myName = me?.nickname || getCurrentPlayerNickname() || null;
    pvpState.opponentName = opp?.nickname || null;
    const scores = await fetchScoresByUserIds([me?.user_id, opp?.user_id]);
    const byUserId = new Map(scores.map(s => [s.user_id, Number(s.rating_score || 0)]));
    pvpState.myRating = me?.user_id ? (byUserId.get(me.user_id) ?? 0) : null;
    pvpState.opponentRating = opp?.user_id ? (byUserId.get(opp.user_id) ?? 0) : null;
    updatePvpCompetitionUi();
  } catch (_) {}
}

async function refreshPvpRoom() {
  if (!pvpState.roomId) return;
  try {
    const room = await fetchRoomById(pvpState.roomId);
    applyRoomToPvpState(room);
    await refreshPvpNames();
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
  const myLabel = (pvpState.myName || getCurrentPlayerNickname() || (isPvpRoleHost() ? t('pvpRoleHost') : t('pvpRoleGuest'))).slice(0, 8);
  const oppLabel = (pvpState.opponentName || (isPvpRoleHost() ? t('pvpRoleGuest') : t('pvpRoleHost'))).slice(0, 8);
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
  awardPvpMatchPointsOnce(won);
  pvpState.finalResult = won ? 'win' : 'lose';
  document.getElementById('result-emoji').textContent = won ? '🏆' : '😞';
  document.getElementById('result-title').textContent = won ? t('pvpVictory') : t('pvpDefeat');
  document.getElementById('result-subtitle').textContent =
    t('pvpFinalScore', getMyPvpWins(), getOpponentPvpWins());
  document.getElementById('result-answer').innerHTML = '';
  const nextBtn = document.getElementById('btn-next');
  const backBtn = document.getElementById('btn-levels');
  nextBtn.style.display = '';
  nextBtn.textContent = t('rematch');
  nextBtn.disabled = false;
  backBtn.textContent = t('pvpBackToPvp');
  showScreen('result-screen');
  protectScreenFromTapThrough('result-screen', ['btn-next', 'btn-levels'], 800);
  lockButtonForDelay(backBtn, 1800, t('pvpBackToPvp'));
}

function resetPvpStateLocal() {
  stopPvpWatchers();
  if (pvpState.vsTimer) clearTimeout(pvpState.vsTimer);
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
    myName: null,
    opponentName: null,
    myRating: null,
    opponentRating: null,
    matchRewardGranted: false,
    introShownForMatch: false,
    vsTimer: null,
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
  if (document.getElementById('pvp-screen')) {
    setPvpLobbyView('menu');
  }
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
        .eq('player_id', getCurrentPlayerId());
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
  pvpMatch.rematchStatus = matchState.rematch_status || 'idle';
  pvpMatch.rematchRequestedBy = matchState.rematch_requested_by || null;
  updatePvpCompetitionUi();

  if (!isPvpModeActive()) return;
  if (pvpState.finalResult) {
    if (pvpMatch.rematchStatus === 'accepted') {
      resetLocalPvpMatchForRematch();
      pvpMatch.rematchStatus = 'idle';
      pvpMatch.rematchRequestedBy = null;
      showScreen('game-screen');
      maybeStartLocalPvpRound({
        id: pvpState.roomId,
        room_code: pvpState.roomCode,
        status: 'ready',
        mode: pvpState.mode,
        colors_count: pvpState.colorsCount,
      });
      return;
    }
    if (currentScreen === 'result-screen') {
      const nextBtn = document.getElementById('btn-next');
      const backBtn = document.getElementById('btn-levels');
      if (pvpMatch.rematchStatus === 'pending') {
        if (getRematchRequesterIsMe()) {
          nextBtn.textContent = t('rematchWaiting');
          nextBtn.disabled = true;
          backBtn.textContent = t('pvpBackToPvp');
        } else {
          document.getElementById('result-subtitle').textContent = t('rematchIncoming');
          nextBtn.textContent = t('rematchAccept');
          nextBtn.disabled = false;
          backBtn.textContent = t('rematchDecline');
        }
      } else if (pvpMatch.rematchStatus === 'declined') {
        nextBtn.textContent = t('rematch');
        nextBtn.disabled = false;
        backBtn.textContent = t('pvpBackToPvp');
      }
    }
  }
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

async function requestRematchMvp() {
  if (!pvpState.roomId) return;
  const sb = getSupabaseClient();
  const { error } = await sb.from('match_state').update({
    rematch_status: 'pending',
    rematch_requested_by: getCurrentPlayerId(),
  }).eq('room_id', pvpState.roomId);
  if (error) throw new Error(error.message);
}

async function acceptRematchMvp() {
  if (!pvpState.roomId) return;
  const sb = getSupabaseClient();
  const patch = {
    current_round: 1,
    host_round_wins: 0,
    guest_round_wins: 0,
    host_correct_count: 0,
    guest_correct_count: 0,
    round_status: 'waiting',
    rematch_status: 'accepted',
    rematch_requested_by: null,
  };
  const { error } = await sb.from('match_state').update(patch).eq('room_id', pvpState.roomId);
  if (error) throw new Error(error.message);
  await sb.from('rooms').update({ status: 'ready' }).eq('id', pvpState.roomId);
}

async function declineRematchMvp() {
  if (!pvpState.roomId) return;
  const sb = getSupabaseClient();
  const { error } = await sb.from('match_state').update({
    rematch_status: 'declined',
  }).eq('room_id', pvpState.roomId);
  if (error) throw new Error(error.message);
}

function resetLocalPvpMatchForRematch() {
  pvpState.finalResult = null;
  pvpState.pendingRoundResult = null;
  pvpState.localRoundStarted = false;
  pvpState.matchRewardGranted = false;
  pvpState.introShownForMatch = false;
  if (pvpState.vsTimer) {
    clearTimeout(pvpState.vsTimer);
    pvpState.vsTimer = null;
  }
  pvpMatch.hostWins = 0;
  pvpMatch.guestWins = 0;
  pvpMatch.hostCorrectCount = 0;
  pvpMatch.guestCorrectCount = 0;
  pvpMatch.roundStatus = 'waiting';
  updatePvpCompetitionUi();
}

function getIsRematchSchemaMissingError(err) {
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('rematch_status') || msg.includes('rematch_requested_by');
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
  setText('btn-pvp-open-join', 'pvpFindMatchCta');
  setText('btn-auth-google', 'authGoogleIn');
  setText('btn-auth-logout', 'authSignOut');
  setText('btn-edit-nickname', 'nickChange');
  setText('pvp-find-mode-label', 'matchmaking');
  setText('pvp-find-rule-mode-label', 'pvpMode');
  setText('pvp-find-rule-colors-label', 'pvpColors');
  setText('pvp-find-rule-bestof-label', 'pvpBestOf');
  setText('btn-find-match', 'findMatch');
  setText('pvp-create-title', 'pvpCreateRoom');
  setText('pvp-join-title', 'pvpJoinRoom');
  setText('pvp-mode-label', 'pvpMode');
  setText('pvp-colors-label', 'pvpColors');
  setText('pvp-bestof-label', 'pvpBestOf');
  setText('btn-create-room', 'pvpCreateRoom');
  setText('btn-join-room', 'pvpJoinByCode');
  setText('pvp-searching-title', 'pvpSearchingTitle');
  setText('pvp-searching-subtitle', 'pvpSearchingSub');
  setText('pvp-created-title', 'pvpCreatedTitle');
  setText('pvp-created-subtitle', 'pvpCreatedSub');
  setText('btn-pvp-search-cancel', 'pvpCancel');
  setText('btn-pvp-search-code', 'pvpJoinByCode');
  setText('btn-pvp-created-cancel', 'pvpCancel');
  setText('pvp-created-code-label', 'pvpCodeLabel');
  const vsSub = document.getElementById('pvp-vs-subtitle');
  if (vsSub) vsSub.textContent = t('pvpVsPreparing');
  if (currentScreen === 'pvp-vs-screen') renderPvpVsScreen();
  setText('btn-pvp-leave', 'pvpLeave');
  setText('btn-daily', 'daily');
  setText('btn-pvp-round-back', 'pvpBackToPvp');
  setText('btn-leaderboard', 'leaderboard');
  setText('leaderboard-title', 'leaderboard');
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
  const findModeSelect = document.getElementById('pvp-find-mode-select');
  if (findModeSelect) {
    const anyOpt = findModeSelect.querySelector('option[value="any"]');
    const exactOpt = findModeSelect.querySelector('option[value="exact"]');
    if (anyOpt) anyOpt.textContent = t('matchmakingAny');
    if (exactOpt) exactOpt.textContent = t('matchmakingExact');
  }
  ['pvp-find-rule-mode', 'pvp-find-rule-bestof'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    if (id === 'pvp-find-rule-mode') {
      const classicOpt = sel.querySelector('option[value="classic"]');
      const plusOneOpt = sel.querySelector('option[value="plus_one"]');
      if (classicOpt) classicOpt.textContent = t('pvpModeClassic');
      if (plusOneOpt) plusOneOpt.textContent = t('pvpModePlusOne');
    } else if (id === 'pvp-find-rule-bestof') {
      ['1', '3', '5'].forEach(v => {
        const opt = sel.querySelector(`option[value="${v}"]`);
        if (opt) opt.textContent = `Best of ${v}`;
      });
    }
  });
  updatePvpBestOfHint();
  updatePvpCreatedPanel();
  updatePvpPlayerMeta();
  updatePvpCompetitionUi();
  updateAuthUi();
  updateHomeScoreUi();
  if (currentScreen === 'leaderboard-screen') renderLeaderboard();
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
    if (isDailyModeActive()) {
      const won = !!(getTodayDailyRecord()?.won);
      showResult(won);
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
  document.getElementById('btn-daily').addEventListener('click', () => {
    startDailyChallenge();
  });
  document.getElementById('btn-leaderboard').addEventListener('click', async () => {
    showScreen('leaderboard-screen');
    await loadLeaderboardTop10();
  });

  document.getElementById('btn-pvp').addEventListener('click', () => {
    if (!ensurePvpNickname()) return;
    showScreen('pvp-screen');
  });
  document.getElementById('btn-auth-home').addEventListener('click', async () => {
    try {
      if (authState.user) {
        showScreen('pvp-screen');
        return;
      }
      await signInWithGoogle();
    } catch (e) {
      showToast(e.message || 'Google sign-in failed', 2500);
    }
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

function getPvpFindSettings() {
  return {
    strategy: document.getElementById('pvp-find-mode-select').value,
    mode: document.getElementById('pvp-find-rule-mode').value,
    bestOf: Number(document.getElementById('pvp-find-rule-bestof').value),
    colorsCount: Number(document.getElementById('pvp-find-rule-colors').value),
  };
}

function updatePvpFindUi() {
  const strategy = document.getElementById('pvp-find-mode-select').value;
  document.getElementById('pvp-find-filters').style.display = strategy === 'exact' ? '' : 'none';
}

async function createRoomMvp() {
  await ensurePvpConfigReady();
  const { mode, bestOf, colorsCount } = getPvpSettingsFromForm();
  return createRoomMvpWithSettings({ mode, bestOf, colorsCount }, { openCreatedScreen: true });
}

async function createRoomMvpWithSettings({ mode, bestOf, colorsCount }, options = {}) {
  const { openCreatedScreen = true, silentToast = false } = options;
  await ensurePvpConfigReady();
  const playerId = getCurrentPlayerId();
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
        host_player_id: playerId,
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
    player_id: getCurrentPlayerId(),
    user_id: authState.user?.id || null,
    nickname: getCurrentPlayerNickname() || getGuestPlayerId(),
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
    myName: getCurrentPlayerNickname() || null,
    opponentName: null,
    myRating: null,
    opponentRating: null,
    matchRewardGranted: false,
    introShownForMatch: false,
    vsTimer: null,
  };
  applyRoomToPvpState(room, 'host');
  updatePvpCreatedPanel();
  if (openCreatedScreen) setPvpLobbyView('created');
  await watchPvpRoom(room.id);
  if (!silentToast) showToast(`Room created: ${room.room_code}`, 3000);
  return room;
}

async function joinRoomRecordMvp(room) {
  await ensurePvpConfigReady();
  const playerId = getCurrentPlayerId();
  const sb = getSupabaseClient();

  if (room.host_player_id === playerId) throw new Error('This device is already the host');
  if (room.guest_player_id && room.guest_player_id !== playerId) throw new Error('Room already has guest');

  const isReconnectGuest = room.guest_player_id && room.guest_player_id === playerId;
  let claimQuery = sb
    .from('rooms')
    .update({
      guest_player_id: playerId,
      status: 'ready',
    })
    .eq('id', room.id);
  if (!isReconnectGuest) {
    claimQuery = claimQuery
      .eq('status', 'waiting_for_opponent')
      .is('guest_player_id', null);
  }
  let { data: claimedRoom, error: updateErr } = await claimQuery.select().maybeSingle();
  if (updateErr) throw new Error(updateErr.message);
  if (!claimedRoom) {
    // Some Supabase/RLS combinations may not return UPDATE rows reliably; verify via read.
    const { data: reRead, error: readErr } = await sb.from('rooms').select('*').eq('id', room.id).maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!reRead || reRead.guest_player_id !== playerId) throw new Error(t('pvpRoomUnavailable'));
    claimedRoom = reRead;
  }

  const { error: playerErr } = await sb
    .from('room_players')
    .upsert({
      room_id: room.id,
      player_id: getCurrentPlayerId(),
      user_id: authState.user?.id || null,
      nickname: getCurrentPlayerNickname() || getGuestPlayerId(),
      role: 'guest',
      connection_status: 'connected',
    }, { onConflict: 'room_id,player_id' });
  if (playerErr) throw new Error(playerErr.message);

  pvpState = {
    roomId: room.id,
    roomCode: claimedRoom.room_code,
    role: 'guest',
    status: 'ready',
    mode: claimedRoom.mode,
    bestOf: claimedRoom.best_of,
    colorsCount: claimedRoom.colors_count,
    localRoundStarted: false,
    myName: getCurrentPlayerNickname() || null,
    opponentName: null,
    myRating: null,
    opponentRating: null,
    matchRewardGranted: false,
    introShownForMatch: false,
    vsTimer: null,
  };
  applyRoomToPvpState(claimedRoom, 'guest');
  setPvpLobbyView('status');
  await watchPvpRoom(room.id);
  showToast(`Joined: ${claimedRoom.room_code}`, 3000);
}

async function joinRoomByCodeMvp() {
  await ensurePvpConfigReady();
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
  await joinRoomRecordMvp(room);
}

async function findMatchMvp() {
  await ensurePvpConfigReady();
  const sb = getSupabaseClient();
  const playerId = getCurrentPlayerId();
  const cfg = getPvpFindSettings();

  let query = sb
    .from('rooms')
    .select('*')
    .eq('status', 'waiting_for_opponent')
    .is('guest_player_id', null)
    .gte('created_at', getMatchmakingFreshSinceIso())
    .order('created_at', { ascending: true })
    .limit(25);

  if (cfg.strategy === 'exact') {
    query = query
      .eq('mode', cfg.mode)
      .eq('best_of', cfg.bestOf)
      .eq('colors_count', cfg.colorsCount);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rooms = (data || []).filter(r => r.host_player_id !== playerId);
  if (!rooms.length) throw new Error(t('findNoRooms'));
  let lastErr = null;
  for (const room of rooms) {
    try {
      showToast(`${t('matchFound')}: ${room.room_code}`, 1200);
      await joinRoomRecordMvp(room);
      return;
    } catch (err) {
      lastErr = err;
      if ((err?.message || '') === t('pvpRoomUnavailable')) {
        setPvpFindStatus(t('pvpRoomTaken'));
        continue;
      }
      throw err;
    }
  }
  throw new Error(lastErr?.message || t('findNoRooms'));
}

async function createMatchmakingRoomMvp() {
  if (pvpState.roomId) return null;
  const findCfg = getPvpFindSettings();
  const fallbackCreateCfg = getPvpSettingsFromForm();
  const settings = findCfg.strategy === 'exact'
    ? { mode: findCfg.mode, bestOf: findCfg.bestOf, colorsCount: findCfg.colorsCount }
    : fallbackCreateCfg;
  setPvpFindStatus(getPvpFindSettings().strategy === 'exact' ? t('searchingBySettings') : t('searching'));
  const room = await createRoomMvpWithSettings(settings, { openCreatedScreen: true, silentToast: true });
  stopAutoMatchSearch();
  setPvpFindStatus('');
  showToast(`Room created: ${room.room_code}`, 1800);
  return room;
}

async function autoFindMatchTick() {
  if (!autoMatchSearch.active) return;
  try {
    await findMatchMvp();
    stopAutoMatchSearch();
    setPvpFindStatus('');
    return;
  } catch (err) {
    if (!autoMatchSearch.active) return;
    const msg = err?.message || '';
    const noRooms = msg.includes(t('findNoRooms'));
    if (noRooms && !pvpState.roomId) {
      try {
        await createMatchmakingRoomMvp();
        return;
      } catch (createErr) {
        setPvpFindStatus(createErr?.message || t('searching'));
      }
    } else {
      setPvpFindStatus(noRooms
        ? (getPvpFindSettings().strategy === 'exact' ? t('searchingBySettings') : t('searching'))
        : (msg || t('searching')));
    }
    autoMatchSearch.timer = setTimeout(autoFindMatchTick, 1800);
  }
}

function toggleAutoMatchSearch() {
  if (autoMatchSearch.active) {
    stopAutoMatchSearch();
    setPvpFindStatus('');
    setPvpLobbyView('join');
    return;
  }
  autoMatchSearch.active = true;
  document.getElementById('btn-find-match').textContent = t('stopSearch');
  setPvpFindStatus(getPvpFindSettings().strategy === 'exact' ? t('searchingBySettings') : t('searching'));
  setPvpLobbyView('searching');
  autoFindMatchTick();
}

function initPvpMvp() {
  loadSupabaseConfigToForm();
  setPvpConnectionStatus(t('pvpConnectionChecking'));
  setPvpLobbyView('menu');
  updatePvpBestOfHint();
  updatePvpFindUi();

  document.getElementById('btn-save-supabase').addEventListener('click', saveSupabaseConfigFromForm);
  document.getElementById('btn-toggle-dev-config').addEventListener('click', togglePvpDevConfig);
  document.getElementById('btn-auth-google').addEventListener('click', async () => {
    try { await signInWithGoogle(); } catch (e) { showToast(e.message || 'Google sign-in failed', 2500); }
  });
  document.getElementById('btn-auth-logout').addEventListener('click', async () => {
    try { await signOutGoogle(); } catch (e) { showToast(e.message || 'Sign out failed', 2500); }
  });
  document.getElementById('btn-edit-nickname').addEventListener('click', showNicknameModal);
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
  document.getElementById('btn-pvp-search-cancel').addEventListener('click', () => {
    stopAutoMatchSearch();
    setPvpFindStatus('');
    setPvpLobbyView('join');
  });
  document.getElementById('btn-pvp-search-code').addEventListener('click', () => {
    stopAutoMatchSearch();
    setPvpFindStatus('');
    setPvpLobbyView('join');
    document.getElementById('pvp-room-code').focus();
  });
  document.getElementById('btn-pvp-created-cancel').addEventListener('click', async () => {
    await leavePvpSession();
    setPvpLobbyView('menu');
  });
  document.getElementById('pvp-bestof').addEventListener('change', updatePvpBestOfHint);
  document.getElementById('pvp-find-mode-select').addEventListener('change', updatePvpFindUi);
  ['pvp-mode', 'pvp-colors', 'pvp-bestof'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      if (id === 'pvp-mode') document.getElementById('pvp-find-rule-mode').value = document.getElementById('pvp-mode').value;
      if (id === 'pvp-colors') document.getElementById('pvp-find-rule-colors').value = document.getElementById('pvp-colors').value;
      if (id === 'pvp-bestof') document.getElementById('pvp-find-rule-bestof').value = document.getElementById('pvp-bestof').value;
    });
  });

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
  document.getElementById('btn-find-match').addEventListener('click', toggleAutoMatchSearch);

  pvpInitPromise = ensurePvpConfigReady().then(ok => {
    if (ok) return initSupabaseAuth().catch(() => {});
  });
  restorePvpSessionIfAny();
}

// ---- LEVEL SELECT ----
function renderLevelSelect() {
  document.getElementById('select-level-title').textContent = t('selectLevel');
  const container = document.getElementById('levels-container');
  container.innerHTML = '';

  const stageIds = Object.keys(LEVEL_STAGE_SUMMARY_V2)
    .map(Number)
    .sort((a, b) => a - b);

  stageIds.forEach(stageId => {
    const section = document.createElement('div');
    section.className = 'stage-section';

    const header = document.createElement('div');
    header.className = 'stage-header';

    const title = document.createElement('span');
    title.className = 'stage-header-title';
    title.textContent = t('stageName', stageId);
    header.appendChild(title);

    if ([2, 3, 4, 5, 6].includes(stageId)) {
      const desc = document.createElement('span');
      desc.className = 'stage-header-desc';
      const descKey = ({
        2: 'stage2desc',
        3: 'stage3desc',
        4: 'stage4desc',
        5: 'stage5desc',
        6: 'stage6desc',
      })[stageId];
      desc.textContent = t(descKey);
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
  const lvlV2 = getLevelV2(lvl);
  const cfg = lvlV2?.game || LEVELS[lvl - 1];
  state.currentLevel      = lvl;
  state.secret            = generateSecret(cfg, lvlV2?.featureConfig || {});
  state.guess             = new Array(cfg.colors).fill(null);
  state.history           = [];
  state.attemptsLeft      = cfg.attempts;
  state.selectedColor     = null;
  state.gameOver          = false;
  state.abilityAvailable  = isPvpModeActive() ? false : state.hasAbility;
  state.revealedPositions = [];
  state.frozenSlotIndex   = null;
  state.chain             = null;
  initChainStateForLevel();
  if (state.chain) {
    setupChainRound(state.chain.roundIndex, cfg);
  }
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
  let gameLabel = isDailyModeActive()
    ? `${t('dailyBadge')} · ${t('levelHeader', cfg, stageLvl)}`
    : t('levelHeader', cfg, stageLvl);
  if (state.chain) {
    gameLabel += ` · Chain ${state.chain.roundIndex}/${state.chain.totalRounds}`;
  }
  document.getElementById('game-level-label').textContent = gameLabel;
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
  const feature = getCurrentFeature();
  const visibleHistory = feature === 'fog'
    ? (getCurrentFeatureConfig().visibleHistory || 3)
    : state.history.length;
  const entries = state.history.slice(-visibleHistory);

  entries.forEach(entry => {
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
    const isFrozen = state.frozenSlotIndex === idx && !isRevealed;
    const slot = document.createElement('div');
    slot.className = 'guess-slot';
    if (cid) slot.classList.add('filled', `color-${cid}`);
    if (isRevealed) slot.classList.add('revealed');
    if (isFrozen) slot.classList.add('frozen');
    if (!isRevealed && !isFrozen) slot.addEventListener('click', () => onSlotClick(idx));
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
  if (state.frozenSlotIndex === idx) return;
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
    .filter(({ index }) => !state.revealedPositions.some(r => r.index === index))
    .filter(({ index }) => state.frozenSlotIndex !== index);

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

  if (won && state.chain) {
    const advanced = advanceChainRoundOrFinish(cfg);
    if (advanced) return;
  }

  if (won || lost) {
    state.gameOver = true;
    state.frozenSlotIndex = null;
    let abilityJustUnlocked = false;
    let stage2JustUnlocked = false;

    if (!isDailyModeActive() && won && state.currentLevel >= state.unlockedLevel && state.unlockedLevel < LEVELS.length) {
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

    if (!isDailyModeActive() && won && markAwardedMainLevel(state.currentLevel)) {
      saveProgress();
      addMainGamePoints(calculateMainGamePoints(state.currentLevel));
    }

    if (isDailyModeActive()) {
      completeDailyChallengeRun(won, state.attemptsLeft);
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
    applyFreezeForNextTurn(cfg);
    state.revealedPositions.forEach(r => { state.guess[r.index] = r.colorId; });
    state.selectedColor = null;
    renderGame();
  }
}

function showResult(won) {
  const cfg = LEVELS[state.currentLevel - 1];
  const stageLvl = stageLvlNum(state.currentLevel);
  const isDaily = isDailyModeActive();
  const todayRecord = isDaily ? getTodayDailyRecord() : null;

  document.getElementById('result-emoji').textContent = won ? '🎉' : '😔';
  document.getElementById('result-title').textContent = isDaily
    ? (won ? t('dailySolved') : t('dailyFailed'))
    : (won ? t('decoded') : t('gameOver'));
  document.getElementById('result-subtitle').textContent = isDaily
    ? (won
      ? `${t('dailyBadge')} • +${todayRecord?.points || 0}`
      : `${t('dailyBadge')} • ${t('dailyTryTomorrow')}`)
    : (won ? t('crackedLevel', stageLvl) : t('theCodeWas'));

  const answerEl = document.getElementById('result-answer');
  answerEl.innerHTML = '';
  state.secret.forEach(cid => {
    const dot = document.createElement('div');
    dot.className = `dot color-${cid}`;
    answerEl.appendChild(dot);
  });

  const nextBtn = document.getElementById('btn-next');
  nextBtn.style.display = '';
  if (isDaily) {
    nextBtn.textContent = t('dailyDone');
  } else if (won && state.currentLevel < LEVELS.length) {
    nextBtn.textContent = t('nextLevel');
  } else if (won) {
    nextBtn.textContent = t('playAgain');
  } else {
    nextBtn.textContent = t('tryAgain');
  }

  document.getElementById('btn-levels').textContent = isDaily ? t('play') : t('allLevels');
  showScreen('result-screen');
  protectScreenFromTapThrough('result-screen', ['btn-next', 'btn-levels'], 700);
}

// ---- INIT ----
function init() {
  loadProgress();
  loadScoreState();
  loadDailyState();
  applyLang();
  initHome();
  initPvpMvp();
  showScreen('home-screen');

  document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-leaderboard').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-pvp').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-game').addEventListener('click', async () => {
    if (isPvpModeActive()) {
      await leavePvpSession();
      document.getElementById('pvp-room-status').style.display = 'none';
      showScreen('pvp-screen');
      return;
    }
    if (isDailyModeActive()) {
      clearDailyActiveSession();
      showScreen('home-screen');
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
    if (pvpState.finalResult) {
      (async () => {
        try {
          if (pvpMatch.rematchStatus === 'pending' && !getRematchRequesterIsMe()) {
            await acceptRematchMvp();
          } else if (pvpMatch.rematchStatus !== 'pending') {
            await requestRematchMvp();
          }
        } catch (e) {
          if (getIsRematchSchemaMissingError(e)) {
            showToast('Run latest Supabase SQL (rematch fields missing)', 3200);
          } else {
            showToast(e.message || 'Rematch failed', 2500);
          }
        }
      })();
      return;
    }
    if (isDailyModeActive()) {
      clearDailyActiveSession();
      showScreen('home-screen');
      return;
    }
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
      if (pvpMatch.rematchStatus === 'pending' && !getRematchRequesterIsMe()) {
        try {
          await declineRematchMvp();
        } catch (e) {
          if (getIsRematchSchemaMissingError(e)) showToast('Run latest Supabase SQL (rematch fields missing)', 3200);
        }
      }
      await leavePvpSession({ fromMatchEnd: true });
      document.getElementById('pvp-room-status').style.display = 'none';
      showScreen('pvp-screen');
      return;
    }
    if (isDailyModeActive()) {
      clearDailyActiveSession();
      showScreen('home-screen');
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
