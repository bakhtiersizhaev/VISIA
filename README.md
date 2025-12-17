# VISIA — AI Image Studio (Next.js + Supabase + fal.ai)

Эта версия README предназначена для быстрого онбординга новых разработчиков: даёт обзор архитектуры, дерево файлов и ключевые потоки данных.

---

## Структура Проекта (File Tree)

```
. # корень репозитория
├── LICENSE # лицензия MIT
├── PRD.md # продуктовые требования/видение
├── README.md # текущий гайд
├── next-env.d.ts # типы Next.js
├── package.json # зависимости и npm-скрипты
├── package-lock.json # lock-файл npm
├── postcss.config.js # конфиг PostCSS/Tailwind
├── tailwind.config.ts # конфиг Tailwind (сканирует src/app, src/components, src/features)
├── task.md # список задач/фаз
├── tsconfig.json # TypeScript конфигурация
├── tsconfig.tsbuildinfo # кэш сборки TS
├── image # вспомогательные изображения для README
│   └── README/*.png # скриншоты UI
├── public # публичные ассеты
│   ├── bg-styles.png # фон для карточек
│   ├── bg-tools.png # фон для карточек
│   ├── logo-cat.png # иллюстрация на лендинге
│   └── logo-header-mini.png # логотип в хедере
└── src # исходный код приложения
    ├── app # Next.js App Router: страницы, API, middleware
    │   ├── api # serverless-роуты (Next.js Route Handlers)
    │   │   ├── fal/proxy/route.ts # прокси к fal.ai + биллинг токенов
    │   │   └── history/route.ts # CRUD истории генераций
    │   ├── auth/callback/route.ts # обмен OAuth-кода Google на сессию
    │   ├── generate/page.tsx # основная студия (mount GeneratorUI)
    │   ├── login
    │   │   ├── actions.ts # server actions: email/password, Google OAuth
    │   │   └── page.tsx # UI логина/регистрации
    │   ├── account/page.tsx # профиль + баланс + последние генерации
    │   ├── icon.png # favicon
    │   ├── layout.tsx # корневой layout и подключение шрифта
    │   ├── globals.css # общие стили, темing, utility-классы
    │   └── page.tsx # лендинг/маркетинговая страница
    ├── components # переиспользуемые UI-атомы и мелкие блоки
    │   ├── common/image-preview-dialog.tsx # модалка предпросмотра изображения
    │   ├── layout/theme.ts # токены/классы для оформления страниц
    │   └── ui # shadcn/ui компоненты (button, card, dialog, input, popover, select, sheet, textarea, command, label)
    ├── features
    │   └── generator # вся функциональность студии генерации
    │       ├── components
    │       │   ├── generator-ui.tsx # главный контейнер: шапка, очередь задач, командный центр
    │       │   ├── history-sheet.tsx # боковая панель истории
    │       │   ├── job-card.tsx # карточка задания (running/done/error)
    │       │   ├── model-selector.tsx # выбор модели (и отображение выбранных)
    │       │   ├── prompt-input.tsx # поле промпта + загрузка реф-изображений
    │       │   └── settings-pills.tsx # компактные контролы параметров модели
    │       ├── hooks
    │       │   ├── useGeneratorState.ts # выбор модели, значения инпутов, compare mode
    │       │   └── useJobQueue.ts # очередь генераций, статусы, таймеры, cancel
    │       ├── utils
    │       │   ├── aspect-ratio.tsx # утилиты отображения/иконки аспектов
    │       │   └── compare-mode.tsx # селектор compare-mode + маппинг аспектов
    │       └── index.ts # barrel-экспорт для feature
    ├── lib # общие библиотеки/адаптеры
    │   ├── ai
    │   │   ├── index.ts # barrel
    │   │   └── models.ts # каталог моделей fal.ai и их параметры
    │   ├── supabase
    │   │   ├── client.ts # браузерный клиент Supabase
    │   │   └── server.ts # серверный клиент Supabase (cookies)
    │   └── utils.ts # helper cn() для className
    ├── types
    │   └── generator-types.ts # типы генератора (InputValue, GenerationJob, константы)
    └── middleware.ts # защита роутов /generate и /api/fal/*
```

---

## Описание Модулей

- **src/app** — слой маршрутизации и страниц (Next.js App Router). Содержит UI страниц, API-роуты (Route Handlers) и middleware. Технологии: Next.js 14, Server/Client Components, Route Handlers, Supabase SSR клиент.
- **src/components** — UI-атомы и общие блоки (shadcn/ui). Используются как строительные блоки на страницах и в фичах. Технологии: Tailwind, shadcn/ui, lucide-react и кастомные классы в `layout/theme.ts`.
- **src/features/generator** — фича-модуль студии генерации: контейнер `GeneratorUI`, дочерние компоненты, бизнес-хуки и утилиты для compare mode и аспектов. Технологии: React client components, fal.ai клиент, Supabase (через API), кастомные хуки.
- **src/lib** — адаптеры и общие библиотеки: Supabase клиенты (browser/server), каталог моделей fal.ai (`AI_MODELS`), утилита `cn` (clsx + tailwind-merge).
- **src/types** — общие типы фичи генератора и константы (`USD_PER_TOKEN`, `MAX_PARALLEL_JOBS`).
- **public / image** — статические ассеты и скриншоты для документации.
- **config файлы (tailwind, postcss, tsconfig, middleware)** — инфраструктурный слой сборки/стилей/авторизации.

---

## Ключевой Функционал и Логика

### Маршрутизация и доступ
- `src/middleware.ts`  
  - **Назначение:** защищает `/generate`, `/account`, `/api/fal/*` от неавторизованных.  
  - **Логика:** создаёт Supabase SSR клиент, проверяет `auth.getUser()`. Если запрос к API и нет юзера — 401 JSON. Иначе редирект на `/login`. Пробрасывает/устанавливает cookies через Supabase cookie adapter.

### Аутентификация
- `src/app/login/page.tsx` / `src/app/login/actions.ts`  
  - **Назначение:** логин/регистрация/email+пароль и Google OAuth.  
  - **Ключевые функции:**  
    - `login(formData)` → `supabase.auth.signInWithPassword` → redirect `/generate` или ошибка в query.  
    - `signup(formData)` → `signUp` → redirect `/generate`.  
    - `signInWithGoogle()` → OAuth с `redirectTo /auth/callback`.  
  - **UX:** кнопка Google, форма email/password, вывод ошибок через `searchParams`.
- `src/app/auth/callback/route.ts`  
  - **Назначение:** обмен OAuth-кода на сессию.  
  - **Логика:** читает `code` из query, вызывает `supabase.auth.exchangeCodeForSession`, выставляет cookies, редиректит на `/generate` (или `next`), при ошибке — `/login?error=Auth Error`.

### Главная / Лендинг
- `src/app/page.tsx`  
  - **Назначение:** маркетинговая страница. Проверяет сессию (через browser supabase) для показа CTA “Open Studio” или “Login”.  
  - **UI:** hero, фичи, CTA, светящиеся фоны.

### Аккаунт и баланс
- `src/app/account/page.tsx`  
  - **Назначение:** показать email, баланс токенов, последние 10 генераций, дать предпросмотр/скачивание.  
  - **Логика:**  
    - `supabase.auth.getUser()` → upsert пользователя в таблицу `users`.  
    - Тянет баланс `token_balance` и историю через `/api/history` (client fetch).  
    - Локальное состояние: email, balance, history, модалка preview.  
    - Logout через `supabase.auth.signOut()` → redirect `/login`.

### API: История
- `src/app/api/history/route.ts`  
  - **GET:** требует аутентификацию, отдаёт до 50 записей пользователя, сортировка по `created_at desc`.  
  - **POST:** принимает либо один объект `{imageUrl,prompt,modelId,timestamp?}`, либо `{items:[...]}`. Вставляет строки с `user_id`, `image_url`, `prompt`, `model_id`, `created_at`. Ошибки: 401 (unauth), 400 (пустой payload), 500 (insert).  
  - **Cookies:** поддержка Supabase cookie adapter (ответные cookies не пишутся в ответ, но middleware обновит при необходимости).

### API: fal.ai Proxy + биллинг
- `src/app/api/fal/proxy/route.ts`  
  - **Назначение:** скрыть FAL_KEY и биллинг токенов.  
  - **Логика:**  
    - Проверяет пользователя через Supabase SSR.  
    - `estimateCostTokens(body)` считает стоимость: ищет модель в `AI_MODELS` по `model`/`editId`, берёт `basePriceUsd`, умножает на 1.2 и `num_images`, переводит в токены (`USD_PER_TOKEN`). Минимум 1 токен.  
    - Снимает токены: читает `token_balance` (fallback 100), если < cost → 402. Иначе обновляет `users.token_balance = balance - cost`.  
    - Делегирует вызов в `@fal-ai/server-proxy/nextjs` (`route.POST`).  
    - При `!res.ok` делает рефанд (возвращает исходный баланс).  
    - Возвращает ответ fal.ai как есть.  
  - **GET**: пробрасывает `route.GET` (используется SDK).

### Студия генерации (фича `generator`)
- **Точка входа:** `src/app/generate/page.tsx` → при загрузке проверяет сессию (Supabase browser), редиректит на `/login` если нет юзера, иначе рендерит `<GeneratorUI user={user} />`.

- `src/features/generator/components/generator-ui.tsx`  
  - **Роль:** главный контейнер UI: хедер, баланс, история, очередь заданий, командный центр (prompt + настройки + generate), предпросмотр изображений.  
  - **Ключевые блоки и стейты:**  
    - `useGeneratorState()` → `selectedModel`, `inputValues`, compare mode, выбранные модели.  
    - `useJobQueue()` → `jobs`, `activeJobs`, `addJob`, `updateJob`, `removeJob`, `cancelJob`.  
    - Локально: `history` (client cache из `/api/history`), `tokenBalance` (Supabase), `previewOpen/src`.  
  - **Поток данных (Generate):**  
    1. Валидация промпта и параллельных слотов (`MAX_PARALLEL_JOBS`).  
    2. Выбор списка моделей: одна или несколько (compare mode). Если есть реф-изображение и у модели есть `editId` → использует edit-вариант.  
    3. Оценка токенов `getTotalPrice()` (UI) и проверка баланса перед отправкой.  
    4. Для каждой модели создаёт `GenerationJob` со статусом `pending`, затем запускает `executeJob(job)`.  
    5. `executeJob`:  
       - Загружает реф-изображения через `fal.storage.upload` (или оставляет URL).  
       - Приводит аспект к формату модели (`getModelAspectRatioValue`) и чистит лишний параметр (`aspect_ratio` vs `image_size`).  
       - Если `modelId` содержит `/edit` → удаляет `num_images`/`resolution`; иначе убирает `image_url(s)` (не нужны t2i).  
       - Подписывается на fal.ai через `fal.subscribe`, собирает `logs` из очереди, обновляет статус `running/done/error`.  
       - При успехе сохраняет результаты в локальный `history` и отправляет пачку в `/api/history` (POST). Обновляет баланс (read Supabase).  
    - **UI-структура:**  
       - Хедер: логотип, `HistorySheet`, баланс, аватар/выход.  
       - Feed: `JobCard` для активных и завершённых задач; пустой стейт с иконкой.  
       - Командный центр (sticky внизу): `PromptInput` (upload/prompt), панель настроек (`CompareModeSelector`, `ModelSelector`, `SettingsPills`), кнопка Generate, расчёт стоимости.

- `src/features/generator/components/prompt-input.tsx`  
  - **Роль:** ввод промпта + загрузка/просмотр/удаление реф-изображений.  
  - **Логика:** рендерит кнопку “Image” (multiple), отображает превью, позволяет zoom/remove. Поддержка вставки изображений из буфера (onPaste).

- `src/features/generator/components/settings-pills.tsx`  
  - **Роль:** компактные контролы параметров модели.  
  - **Логика:**  
    - В compare mode (>=2 моделей) показывает только общие параметры (пересечение аспектов, `num_images` если поддерживают все).  
    - В обычном режиме строит поповеры по `inputParams` модели, поддерживает boolean toggle, select/number inputs, отображает иконки аспектов (`AspectRatioIcon`) и читабельные названия (`getAspectRatioDisplayName`).

- `src/features/generator/components/model-selector.tsx`  
  - **Роль:** выбор модели или количество выбранных в compare mode.  
  - **Логика:** поповер со списком `AI_MODELS`; отображает эмодзи-иконку по типу модели.

- `src/features/generator/utils/compare-mode.tsx`  
  - **Роль:** кнопка включения compare mode и чекбоксы моделей + маппинг аспектов.  
  - **Доп. логика:** нормализация аспектов `ASPECT_RATIO_MAP`, пересечение аспектов `getCommonAspectRatios`, обратное маппирование в формат модели `getModelAspectRatioValue`, проверка `allModelsSupportsNumImages`.

- `src/features/generator/hooks/useJobQueue.ts`  
  - **Роль:** состояние очереди генераций.  
  - **Логика:** `jobs` хранят задания, `activeJobs` — running/pending; таймер обновляет `elapsedTime` каждые 50ms; `cancelJob` вызывает `abort()` и ставит статус `error` с сообщением.

- `src/features/generator/hooks/useGeneratorState.ts`  
  - **Роль:** базовый стейт фичи: выбранная модель, значения инпутов, compare mode и выбранные модели.  
  - **Логика:** `toggleCompareMode` при включении добавляет текущую модель в сет; `handleInputChange` — простой set-state.

- `src/features/generator/utils/aspect-ratio.tsx`  
  - **Роль:** отрисовка и вычисление ориентации для аспектов.  
  - **Функции:** `getAspectOrientation`, `AspectRatioIcon`, `getAspectRatioDisplayName` (маппит тех. названия в читаемые).

- `src/features/generator/components/job-card.tsx`  
  - **Роль:** визуализация задания: статус, логи, прогресс, сетка изображений, кнопки zoom/download/cancel/remove.  
  - **Грид:** адаптивный (1 → центр, 2 → 2 колонки, 3 → 3, 4+ → responsive).

### Каталог моделей
- `src/lib/ai/models.ts`  
  - **Назначение:** список моделей fal.ai с параметрами и ценой.  
  - **Структура:** `ModelConfig` (id, editId, name, type, description, basePriceUsd, inputParams).  
  - **Используется:** UI (для выбора и отображения), API `/api/fal/proxy` (расчёт стоимости), compare-mode (совместимость параметров).

### Типы и константы
- `src/types/generator-types.ts`  
  - **Назначение:** общие типы фичи: `InputValue`, `GenerationJob`, `FalResponse`, `FalQueueUpdate`, константы `USD_PER_TOKEN`, `MAX_PARALLEL_JOBS`.

### Инфраструктура стилей
- `src/app/globals.css`  
  - **Назначение:** темing (dark ethereal), утилиты `animated-bg`, стеклоэффекты (`glass`, `glass-strong`), кастомные скроллбары, анимации.  
  - **Важно:** `tailwind.config.ts` сканирует `src/features/**` — необходимо после рефакторинга на фичи (уже добавлено).

---

## Важные примечания и Edge Cases
- **Биллинг токенов:** `/api/fal/proxy` списывает токены перед вызовом fal.ai и возвращает при неуспешном ответе. Возможен race, если параллельно идут запросы: нет транзакции в БД. Для прод — вынести в RPC-транзакцию.  
- **Compare Mode:** UI оценивает стоимость суммой выбранных моделей, но сервер считает по конкретному `model` в body. Следите за согласованностью полей при расширении моделей.  
- **Aspect Ratio:** при смене модели с `aspect_ratio` на `image_size` (Seedream) используется маппинг. Добавляя новые модели с другими полями, обновляйте `CANONICAL_TO_MODEL_MAP` и `ASPECT_RATIO_MAP`.  
- **История:** API сейчас без пагинации и без возврата cookies в ответе; при масштабировании — добавить курсор и явную установку cookies.  
- **Abort:** `cancelJob` вызывает `abortController.abort()`, но сторонний SDK должен корректно обрабатывать отмену; убедитесь, что fal.ai поддерживает abort при новых моделях.

---

## Быстрый старт для разработки
1) Установить зависимости: `npm install`.  
2) Создать `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   FAL_KEY=... # fal.ai API key
   ```
3) Запуск: `npm run dev` → открыть http://localhost:3000.  
4) Минимальная БД в Supabase:  
   - Таблица `users(id uuid pk, email text, token_balance int default 100 not null)` с RLS (auth.uid() = id).  
   - Таблица `history(id uuid default uuid_generate_v4(), user_id uuid, image_url text, prompt text, model_id text, created_at timestamptz default now())` с RLS (auth.uid() = user_id).  
5) Проверки: авторизация → `/generate`; баланс отображается; генерация создаёт job и сохраняет историю; ошибки fal.ai возвращают токены.
