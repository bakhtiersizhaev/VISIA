# VISIA — AI Image Studio (Next.js + Supabase + fal.ai)

> Приложение генерирует изображения через fal.ai, держит токеновый баланс пользователей в Supabase и скрывает API‑ключи за серверными эндпоинтами Next.js.

## Основное
- **Next.js 14 (App Router), TypeScript, Tailwind/shadcn/ui**.
- **Supabase**: аутентификация (Google/email), таблица `users` с `token_balance` (default 100), таблица `history` для генераций.
- **fal.ai**: работа через защищённый proxy `/api/fal/proxy` (ключ не попадает на клиент).
- **История**: серверный `/api/history` для чтения/записи; клиент не пишет в БД напрямую.
- **Множественные изображения**: модели, поддерживающие `num_images`, возвращают и показывают несколько картинок сеткой, сохраняются пачкой в историю.

## Запуск
1) Установить зависимости  
   ```bash
   npm install
   ```
2) Настроить переменные (создайте `.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...        # Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   FAL_KEY=...                         # fal.ai API key
   ```
3) Запустить дев-сервер  
   ```bash
   npm run dev
   ```  
   Открыть http://localhost:3000.

## Структура
- `src/app/page.tsx` — лендинг.
- `src/app/login` — логин/Google OAuth.
- `src/app/generate` — основная студия, `GeneratorUI`.
- `src/app/account` — профиль, баланс, история (последние записи).
- `src/app/api/fal/proxy` — серверный вызов fal.ai + списание токенов.
- `src/app/api/history` — история генераций (GET/POST, принимает пачку).
- `src/components/` — UI (история, предпросмотр, гриды).
- `src/lib/models.ts` — список моделей и параметров (prompt, aspect ratio, num_images).
- `src/middleware.ts` — защита `/generate`, `/api/fal/*` (401/redirect).

## Поведение токенов
- Стоимость считается на сервере по `basePriceUsd` модели и `num_images`.
- При недостатке токенов `/api/fal/proxy` возвращает 402.
- При ошибке fal.ai токены возвращаются.
- Default баланса: 100 (задать в БД, см. ниже).

## Настройка Supabase (минимум)
- Таблица `users`: поля `id uuid primary key`, `email text`, `token_balance integer default 100 not null`.
- Таблица `history`: `id uuid default uuid_generate_v4()`, `user_id uuid`, `image_url text`, `prompt text`, `model_id text`, `created_at timestamptz default now()`.
- Включить UUID ext (`uuid-ossp`), если нужно.
- **RLS**: включить и добавить политики:
  - `users`: select/insert/update, когда `auth.uid() = id`; запрет anon на insert/update.
  - `history`: select/insert, когда `auth.uid() = user_id`; запрет anon.

## Безопасность / TODO
- Добавить rate-limit на `/api/fal/proxy` (per user/IP) — сейчас нет ограничителя.
- Сделать списание токенов + вызов fal.ai атомарным через транзакционный RPC в БД (сейчас списание/возврат отдельными запросами).
- Прокидывать cookies Supabase в ответах `/api/fal/proxy` и `/api/history` (формируются, но не возвращаются).
- История: при росте объёма добавить пагинацию/курсор в API и ленивую подгрузку в UI.
- Отображение стоимости: синхронизировать UI-оценку с серверной формулой (num_images, модель).

## Скрипты
- `npm run dev` — запуск в dev.
- `npm run build` — сборка.
- `npm run start` — прод-сервер.
- `npm run lint` — линт (входит в `next build`).

## Быстрый чек перед релизом
- ✅ Логин/Google OAuth проходит, сессия живая.
- ✅ Баланс > 0, `/api/fal/proxy` отвечает 200.
- ✅ Генерация с `num_images>1` возвращает несколько изображений и сохраняет их в истории.
- ✅ Ошибка fal.ai не списывает токены (виден рефанд).
- ✅ RLS включён, anon не может писать в `users`/`history`.
