'use strict';

// ---- GAME CONFIG ----
const COLORS = [
  { id: 'red',    cls: 'color-red',    label: 'Red' },
  { id: 'orange', cls: 'color-orange', label: 'Orange' },
  { id: 'yellow', cls: 'color-yellow', label: 'Yellow' },
  { id: 'green',  cls: 'color-green',  label: 'Green' },
  { id: 'blue',   cls: 'color-blue',   label: 'Blue' },
  { id: 'purple', cls: 'color-purple', label: 'Purple' },
];

// Each level: { colors: N, attempts: M }
const LEVELS = [
  { colors: 3, attempts: 8 },   // 1
  { colors: 3, attempts: 6 },   // 2
  { colors: 4, attempts: 8 },   // 3
  { colors: 4, attempts: 7 },   // 4
  { colors: 4, attempts: 6 },   // 5
  { colors: 5, attempts: 8 },   // 6
  { colors: 5, attempts: 7 },   // 7
  { colors: 6, attempts: 8 },   // 8
  { colors: 6, attempts: 7 },   // 9
  { colors: 6, attempts: 5 },   // 10
];

// ---- STATE ----
let state = {
  unlockedLevel: 1,    // highest level user may play (1-based)
  currentLevel: null,  // 1-based
  secret: [],          // array of color ids
  guess: [],           // current guess slots (null = empty)
  history: [],         // [{guess, correct}]
  attemptsLeft: 0,
  selectedColor: null,
  gameOver: false,
};

// ---- STORAGE ----
function saveProgress() {
  localStorage.setItem('decoder_progress', JSON.stringify({ unlockedLevel: state.unlockedLevel }));
}
function loadProgress() {
  try {
    const d = JSON.parse(localStorage.getItem('decoder_progress'));
    if (d && d.unlockedLevel) state.unlockedLevel = Math.min(d.unlockedLevel, LEVELS.length);
  } catch(_) {}
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

function generateSecret(n) {
  return shuffle(COLORS.slice(0, n).map(c => c.id));
}

function countCorrect(secret, guess) {
  return secret.reduce((acc, c, i) => acc + (c === guess[i] ? 1 : 0), 0);
}

// ---- NAVIGATION ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---- HOME SCREEN ----
function initHome() {
  // Show decorative color dots
  const preview = document.querySelector('.color-preview');
  preview.innerHTML = '';
  ['red', 'orange', 'yellow', 'green', 'blue', 'purple'].forEach(id => {
    const dot = document.createElement('div');
    dot.className = `dot color-${id}`;
    preview.appendChild(dot);
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });
}

// ---- LEVEL SELECT ----
function renderLevelSelect() {
  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '';

  LEVELS.forEach((cfg, idx) => {
    const lvl = idx + 1;
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.textContent = lvl;

    if (lvl < state.unlockedLevel) {
      btn.classList.add('unlocked');
    } else if (lvl === state.unlockedLevel) {
      btn.classList.add('current');
    } else {
      btn.classList.add('locked');
      const lock = document.createElement('span');
      lock.className = 'lock-icon';
      lock.textContent = '🔒';
      btn.appendChild(lock);
    }

    if (lvl <= state.unlockedLevel) {
      btn.addEventListener('click', () => startLevel(lvl));
    }

    grid.appendChild(btn);
  });
}

// ---- GAME ----
function startLevel(lvl) {
  const cfg = LEVELS[lvl - 1];
  state.currentLevel  = lvl;
  state.secret        = generateSecret(cfg.colors);
  state.guess         = new Array(cfg.colors).fill(null);
  state.history       = [];
  state.attemptsLeft  = cfg.attempts;
  state.selectedColor = null;
  state.gameOver      = false;

  renderGame();
  showScreen('game-screen');
}

function renderGame() {
  const cfg = LEVELS[state.currentLevel - 1];

  // Header
  document.getElementById('game-level-label').textContent =
    `Level ${state.currentLevel} · ${cfg.colors} colors`;
  updateAttemptsDisplay();

  // History
  renderHistory();

  // Active guess row
  renderGuessRow();

  // Palette — show only the colors used in this level
  renderPalette(cfg.colors);

  // Confirm button
  updateConfirmBtn();
}

function updateAttemptsDisplay() {
  const el = document.getElementById('game-attempts');
  el.innerHTML = `Attempts left: <span class="attempts-num">${state.attemptsLeft}</span>`;
}

function renderHistory() {
  const area = document.getElementById('history-area');
  area.innerHTML = '';
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
    const cfg = LEVELS[state.currentLevel - 1];
    res.innerHTML = `${entry.correct}<span class="result-total">/${cfg.colors}</span>`;

    row.appendChild(slots);
    row.appendChild(res);
    area.appendChild(row);
  });

  // Scroll to bottom
  area.scrollTop = area.scrollHeight;
}

function renderGuessRow() {
  const row = document.getElementById('active-row');
  row.innerHTML = '';

  state.guess.forEach((cid, idx) => {
    const slot = document.createElement('div');
    slot.className = 'guess-slot' + (cid ? ' filled' : '');
    if (cid) slot.classList.add(`color-${cid}`);
    slot.addEventListener('click', () => onSlotClick(idx));
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
    btn.setAttribute('aria-label', color.label);
    if (state.selectedColor === color.id) btn.classList.add('selected');
    btn.addEventListener('click', () => onPaletteClick(color.id));
    row.appendChild(btn);
  });
}

function onPaletteClick(colorId) {
  if (state.gameOver) return;
  state.selectedColor = (state.selectedColor === colorId) ? null : colorId;

  // Update selected state visually
  document.querySelectorAll('.palette-color').forEach(el => {
    el.classList.remove('selected');
    if (el.classList.contains(`color-${colorId}`) && state.selectedColor === colorId) {
      el.classList.add('selected');
    }
  });

  // If a slot is "pending fill" via selection, show hint
}

function onSlotClick(idx) {
  if (state.gameOver) return;
  if (state.selectedColor) {
    // Place selected color into this slot
    state.guess[idx] = state.selectedColor;
  } else {
    // Clear the slot
    state.guess[idx] = null;
  }
  renderGuessRow();
  updateConfirmBtn();
}

function updateConfirmBtn() {
  const btn = document.getElementById('btn-confirm');
  const allFilled = state.guess.every(c => c !== null);
  btn.disabled = !allFilled || state.gameOver;
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
    if (won && state.currentLevel >= state.unlockedLevel && state.unlockedLevel < LEVELS.length) {
      state.unlockedLevel = state.currentLevel + 1;
      saveProgress();
    }
    // Show last guess in history before result
    state.guess = new Array(cfg.colors).fill(null);
    renderGame();
    setTimeout(() => showResult(won), 600);
  } else {
    state.guess = new Array(cfg.colors).fill(null);
    state.selectedColor = null;
    renderGame();
  }
}

function showResult(won) {
  document.getElementById('result-emoji').textContent  = won ? '🎉' : '😔';
  document.getElementById('result-title').textContent  = won ? 'Decoded!' : 'Game Over';
  document.getElementById('result-subtitle').textContent = won
    ? `You cracked level ${state.currentLevel}!`
    : `The code was:`;

  // Show secret
  const answerEl = document.getElementById('result-answer');
  answerEl.innerHTML = '';
  state.secret.forEach(cid => {
    const dot = document.createElement('div');
    dot.className = `dot color-${cid}`;
    answerEl.appendChild(dot);
  });

  // Buttons
  const nextBtn = document.getElementById('btn-next');
  if (won && state.currentLevel < LEVELS.length) {
    nextBtn.textContent = 'Next Level';
    nextBtn.style.display = '';
  } else if (won && state.currentLevel === LEVELS.length) {
    nextBtn.textContent = 'Play Again';
    nextBtn.style.display = '';
  } else {
    nextBtn.textContent = 'Try Again';
    nextBtn.style.display = '';
  }

  showScreen('result-screen');
}

// ---- RESULT ACTIONS ----
function onNextLevel() {
  if (state.currentLevel < LEVELS.length && state.history.some(h => h.correct === LEVELS[state.currentLevel - 1].colors)) {
    startLevel(Math.min(state.currentLevel + 1, LEVELS.length));
  } else {
    startLevel(state.currentLevel);
  }
}

function onRetry() {
  startLevel(state.currentLevel);
}

// ---- INIT ----
function init() {
  loadProgress();
  initHome();
  showScreen('home-screen');

  // Back buttons
  document.getElementById('btn-back-levels').addEventListener('click', () => showScreen('home-screen'));
  document.getElementById('btn-back-game').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });

  // Confirm
  document.getElementById('btn-confirm').addEventListener('click', onConfirm);

  // Result buttons
  document.getElementById('btn-next').addEventListener('click', () => {
    const cfg = LEVELS[state.currentLevel - 1];
    const won = state.history.length > 0 && state.history[state.history.length - 1].correct === cfg.colors;
    if (won) {
      if (state.currentLevel < LEVELS.length) {
        startLevel(state.currentLevel + 1);
      } else {
        // Completed all levels — restart from 1
        startLevel(1);
      }
    } else {
      startLevel(state.currentLevel);
    }
  });

  document.getElementById('btn-levels').addEventListener('click', () => {
    renderLevelSelect();
    showScreen('level-screen');
  });

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
