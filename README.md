# Мини-CRM для малого бизнеса

Монорепо с фронтендом (React + Vite) и бэкендом (Node.js + Express) для курсовой работы.

## Структура
- `backend` — API сервис на Express + TypeScript
- `frontend` — UI на React + Vite + Tailwind

## Быстрый старт

### Backend
```bash
cd backend
npm install
npm run dev
```
API будет доступен на `http://localhost:4000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
UI будет доступен на `http://localhost:5173`.

## Переменные окружения
- `backend/.env.example` — порт API + Supabase ключи
- `frontend/.env.example` — базовый URL API

Скопируйте `.env.example` в `.env` при необходимости и измените значения.

## Подключение Supabase

По умолчанию используется in-memory хранилище. Если задать переменные Supabase, бэкенд автоматически переключится на БД.

Нужные переменные в `backend/.env`:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Ожидаемые таблицы/колонки
Бэкенд ожидает таблицы (snake_case):
- `user_profiles`: `id`, `name`, `email`, `role`, `is_active`, `created_at`
- `clients`: `id`, `name`, `email`, `phone`, `notes`, `created_at`
- `projects`: `id`, `client_id`, `name`, `description`, `status`, `budget`, `start_date`, `due_date`, `created_at`
- `project_members`: `project_id`, `user_id`, `member_role`
- `tasks`: `id`, `project_id`, `title`, `description`, `assignee_id`, `priority`, `status`, `due_date`, `created_at`, `updated_at`
- `task_status_history`: `id`, `task_id`, `from_status`, `to_status`, `changed_by_user_id`, `changed_at`

Если названия отличаются, скажи — быстро подгоню маппинг.

## Скрипты
Backend:
- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка
- `npm run test` — unit-тесты репозиториев

Frontend:
- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка

## Notes
- Для смены пользователя используйте заголовок `X-User-Id`.
- При Supabase seed-данные не добавляются автоматически.
