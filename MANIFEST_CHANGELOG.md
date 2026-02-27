# Manifest Changelog

## Recent

- Добавлен PvP MVP (`Create/Join`, matchmaking, room lifecycle, rematch).
- Добавлен auth-gating PvP (`Google Auth required`).
- Удален пользовательский UI просмотра/редактирования Supabase config.
- Ужесточены RLS policies для PvP таблиц (participant-based).
- Добавлен глобальный leaderboard (`Top 10`).
- Добавлен Daily MVP (1 challenge/day, 1 scored attempt/day).
- Добавлены Stage 4/5/6 (`Fog`, `Freeze`, `Chain`).
- Введена защита от фарма main-game очков (`first clear only`).
- Введены feature multipliers для баланса очков.

## Next planned

- `Double Code` (main game).
- Расширение Daily-пула новыми механиками (`double_code`, signature/future stages).
- При необходимости серверная фиксация daily attempt/result (`daily_results` table).
