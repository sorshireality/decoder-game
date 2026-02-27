# Manifest Architecture

## Текущий статус

- Тип проекта: статическая браузерная игра / PWA.
- Стек: `HTML + CSS + Vanilla JavaScript`.
- Frontend hosting: `Vercel`.
- Backend services: `Supabase` (Auth, Postgres, Realtime).
- Offline/PWA: `manifest.json` + `sw.js`.

## Ключевые файлы

- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/index.html`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/app.js`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/style.css`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/sw.js`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/manifest.json`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/api/config.js`
- `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/SUPABASE_AUTH_MVP.sql`

## Экраны

1. `home-screen`
2. `leaderboard-screen`
3. `pvp-screen`
4. `level-screen`
5. `game-screen`
6. `pvp-vs-screen`
7. `pvp-round-screen`
8. `result-screen`
9. `toast`

## Auth / Security

- Основной аккаунт: `Google Auth` (Supabase).
- PvP режим: `auth-only`.
- Supabase config: через `/api/config`.
- UI `Dev Config` удален.
- RLS для PvP таблиц должен быть strict participant-based (`rooms`, `room_players`, `match_state`).

## Данные и хранение

- Локально (`localStorage`): прогресс, score state, daily state, nickname, pvp session.
- Облачно: `profiles`, `player_progress`, `player_scores`, PvP room tables.

## PWA

- iPhone Add to Home Screen поддержан (`apple-touch-icon`, mobile web app meta).
- Для app shell используется `network-first`, для прочих статических ассетов `cache-first`.
