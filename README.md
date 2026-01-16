# Tzolkin Tracker (tzolkin_calculator)

Мини‑приложение (в том числе для Telegram WebApp) для ежедневной рефлексии по календарю Цолькин: показывает текущий Kin (тон + печать), даёт быстрый дневник на 5 вопросов + заметка, строит историю/волну и запрашивает AI‑анализ дня или полной 13‑дневной волны.

## Возможности

- Расчёт Kin / тона / печати по дате
- Ежедневный трекинг: энергия, резонанс, делать/быть, стадия проекта, инсайт, заметки
- История волн и экран текущей 13‑дневной волны
- AI совет на день и AI анализ полной волны через serverless API (`/api/...`)
- Рендер AI‑ответов в Markdown (без сборщика) с санитайзингом
- Haptic feedback в Telegram WebApp при нажатиях

## Технологии и подход

- Frontend: React 18 через CDN + Babel Standalone (JSX компилируется в браузере)
- UI: Tailwind CSS через CDN + Typography plugin (`prose prose-invert`)
- Markdown: `marked` + `DOMPurify` (через CDN), вывод через `dangerouslySetInnerHTML` после санитайза
- Icons: `lucide-react` UMD (через CDN), используется `window.LucideReact`
- Storage: Supabase (таблица `user_days`)
- Backend API: serverless‑роуты в папке `api/` (формат совместим с Vercel‑подобными платформами)
- AI: Anthropic Messages API (Claude)

## Структура

- `index.html` — подключение CDN библиотек и `*.jsx`
- `App.jsx` — корневой компонент, роутинг по экранам
- `HomeScreen.jsx` — текущий день, “Отследить день”, AI совет
- `CurrentWave.jsx` — текущая волна (13 дней)
- `WaveHistoryScreen.jsx` — список волн
- `WaveHistory.jsx` — анализ паттерна + AI анализ волны (Markdown)
- `BottomNavigation.jsx` — нижняя навигация
- `TutorialScreen.jsx` — обучение
- `api/analyze-day.js` — POST `/api/analyze-day`
- `api/analyze-wave.js` — POST `/api/analyze-wave`
- `api/telegram.js` — Telegram WebApp helper/интеграция (если используется)

## Локальный запуск (frontend)

⚠️ **Важно**: API функции (`/api/analyze-day`, `/api/analyze-wave`) работают только на Vercel или аналогичной платформе с поддержкой serverless функций. 

При локальном тестировании через Live Server или `python -m http.server`:
- Основной функционал приложения (трекинг, сохранение в Supabase, визуализация) работает полностью
- Кнопки "ИИ-совет" и "Анализ волны" выдадут ошибку (это нормально)
- Для тестирования AI функций разверните проект на Vercel

Не открывайте через `file://` — нужен локальный HTTP‑сервер.

Python:

```bash
python -m http.server 8000
```

Открыть: `http://localhost:8000`

Node:

```bash
npx serve .
```

Важно: без деплоя `api/` запросы к `/api/analyze-day` и `/api/analyze-wave` работать не будут.

## API (деплой)

Папка `api/` рассчитана на serverless‑деплой. После деплоя доступны:

- `POST /api/analyze-day` — принимает `{ dayData }`, возвращает `{ advice }` (Markdown)
- `POST /api/analyze-wave` — принимает `{ waveDays }`, возвращает `{ analysis }` (Markdown)

### Переменные окружения

- `CLAUDE_API_KEY` — ключ Anthropic

## Supabase

Данные сохраняются в таблицу `user_days`.

Минимально ожидаемые поля:

- `user_id` (string)
- `date` (string/DATE)
- `kin` (number)
- `tone` (number)
- `seal` (number)
- `energy`, `resonance`, `action`, `project`, `insight` (string)
- `notes` (string)

Про идентификацию пользователя: используется `user_id` из `localStorage`. Если включён RLS — настройте политики, чтобы чтение/запись работали для этой модели.

## Telegram WebApp

- Для тактильной отдачи используется `window.Telegram.WebApp.HapticFeedback.impactOccurred('light')`.
- В UI это вызывается через безопасный хелпер `window.tgHapticLight()`.

## Безопасность

Перед публикацией репозитория проверьте, что секреты (ключи/токены/URL) вынесены в переменные окружения и не лежат в исходниках.
