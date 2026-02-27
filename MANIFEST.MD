# Decoder Game Manifest Index

Этот файл — входная точка. Перед любой новой задачей читать манифесты в таком порядке:

1. `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/MANIFEST_RULES.md`
2. `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/MANIFEST_ARCH.md`
3. `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/MANIFEST_GAME.md`
4. `/Users/oleksandrtiutiunnik/Documents/pet-projects/decoder-game/MANIFEST_CHANGELOG.md`

## Быстрые правила

- Всегда указывать `неопределенность: 0..1`.
- Если `>= 0.3` — сначала уточняющие вопросы, потом реализация.
- Любые изменения структуры, механик, PvP flow, данных или безопасности отражать в соответствующем manifest-файле в этом же изменении.

## Назначение файлов

- `MANIFEST_RULES.md`: обязательные правила проекта и критерии качества.
- `MANIFEST_ARCH.md`: архитектура, экраны, auth/security, PWA, хранение данных.
- `MANIFEST_GAME.md`: уровни, стадии, механики, scoring, daily, PvP gameplay.
- `MANIFEST_CHANGELOG.md`: история ключевых изменений и ближайшие planned steps.
