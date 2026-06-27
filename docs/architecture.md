# Архитектура TaskFlow

## 1. Общая архитектура

TaskFlow — клиент-серверное приложение с чётким разделением на три слоя:

```
┌─────────────────────────┐      HTTP / JSON (REST)      ┌──────────────────────────┐
│   Frontend (React/Vite)  │  ───────────────────────▶   │   Backend (Express)       │
│                          │   /api/auth/*  /api/tasks/* │                           │
│  UI → store → api/*      │  ◀───────────────────────   │  routes → service → repo  │
└─────────────────────────┘     Bearer JWT в заголовке   └────────────┬─────────────┘
                                                                       │
                                                                ┌──────▼──────┐
                                                                │  SQLite БД   │
                                                                │ (node:sqlite)│
                                                                └─────────────┘
```

- В dev-режиме фронтенд (Vite, порт 5173) обращается к `/api/*`; Vite проксирует это на бэкенд (порт 4000). CORS в дев-режиме не мешает, в проде настраивается через `CORS_ORIGIN`.
- Аутентификация — stateless JWT в заголовке `Authorization: Bearer <token>`.
- Вся бизнес-логика, валидация и проверка прав доступа продублированы на сервере (источник истины), даже если клиент тоже валидирует для UX.

## 2. Frontend-слои

```
pages/ + components/      ← презентация (JSX, инлайн-стили из макета)
        │  useApp()
        ▼
store.jsx (Context)       ← состояние приложения + действия (auth, tasks, modals, toasts…)
        │  вызывает
        ▼
api/ (client/auth/tasks)  ← слой доступа к backend: fetch, токен, разбор ошибок
        │  HTTP
        ▼
   Backend REST API
```

- **`api/client.js`** — единая обёртка над `fetch`: базовый URL, подстановка `Bearer`-токена, единый разбор ошибок в `ApiError { message, status, fields }`, хранение токена в `localStorage` (`taskflow.token`).
- **`api/auth.js`, `api/tasks.js`** — типобезопасные (по соглашению) функции на каждый endpoint, возвращают чистые DTO.
- **`store.jsx`** — единственный потребитель API-слоя. Хранит `tasks`, `user`, `isAuth`, фильтры, состояние модалок/тостов и UI-настройки. Доменные мутации идут через API, после чего локальный список задач обновляется (`upsertLocal`/`removeLocal`). Публичный интерфейс `useApp()` намеренно стабилен — компоненты макета не переписывались.
- **`lib/tasks.js`** — чистые селекторы и сборка view-моделей дашборда/календаря/фильтрации. Считаются на клиенте по полному списку задач пользователя.

Состояния данных:
- `bootstrapping` — восстановление сессии по сохранённому токену при загрузке (показывается полноэкранный лоадер вместо преждевременного редиректа на `/login`).
- `tasksLoading` / `tasksError` — реальные состояния загрузки/ошибки списка задач.
- `forcedTasks` — демо-переключатель состояний (Настройки) для наглядности loading/empty/error.

## 3. Backend-слои

Каждый функциональный модуль (`auth`, `tasks`) разбит по ответственности:

```
routes      ← HTTP: парсинг запроса, выбор middleware, формирование ответа
   │
validate    ← middleware: zod-схема → req.validated или 400 с пофайловыми ошибками
   │
service     ← бизнес-логика: правила статусов/прав, оркестрация
   │
repo        ← доступ к данным: SQL-запросы, маппинг строк
   │
db          ← одно общее соединение node:sqlite
```

Сквозные элементы:
- **`middleware/auth.js`** — проверяет `Bearer`-токен, кладёт `req.userId`.
- **`middleware/validate.js`** — валидация тела запроса по zod-схеме.
- **`middleware/error.js`** — централизованная обработка ошибок: `ApiError` → JSON `{ error: { message, fields? } }`; непредвиденные ошибки логируются и отдаются как 500.
- **`utils/`** — `password.js` (scrypt), `token.js` (HS256 JWT на `node:crypto`), `errors.js` (`ApiError` + хелперы), `ids.js` (UUID, ISO-timestamp).

## 4. Схема обмена frontend ↔ backend

Пример: завершение задачи.

```
TaskCard.onClick
  → store.completeTask(id)
    → tasksApi.completeTask(id)            POST /api/tasks/:id/complete  (Bearer)
      → requireAuth (проверка JWT, req.userId)
      → tasks.service.complete(id, userId) (проверка владения + статус=done, completedAt=now)
      → tasks.repo.update(...)             UPDATE … WHERE id=? AND user_id=?
      ← { task }                            обновлённый DTO (camelCase)
    ← task
  → store.upsertLocal(task) + toast        список и дашборд пересчитываются
```

Формат ответов:
- Успех: `{ token, user }` (auth) либо `{ task }` / `{ tasks }` (tasks); `204 No Content` для delete/logout.
- Ошибка: `{ error: { message, fields? } }` с подходящим HTTP-статусом (400/401/403/404/409/500).

DTO задач отдаются в **camelCase** (`dueDate`, `calendarDate`, `createdAt`…), совпадая с тем, что уже ожидали React-компоненты, — поэтому ремаппинг данных на клиенте не нужен.

## 5. Модели данных

### User
| Поле          | Тип   | Примечание                         |
| ------------- | ----- | ---------------------------------- |
| id            | TEXT  | UUID, PK                           |
| name          | TEXT  | 2–50 символов                      |
| email         | TEXT  | уникальный, нижний регистр         |
| password_hash | TEXT  | `scrypt$<salt>$<hash>`             |
| avatar_url    | TEXT  | nullable                           |
| created_at    | TEXT  | ISO timestamp                      |
| updated_at    | TEXT  | ISO timestamp                      |

### Task
| Поле          | Тип   | Примечание                                            |
| ------------- | ----- | ----------------------------------------------------- |
| id            | TEXT  | UUID, PK                                               |
| user_id       | TEXT  | FK → users.id, `ON DELETE CASCADE`                    |
| title         | TEXT  | 3–100 символов                                        |
| description   | TEXT  | ≤ 1000, по умолчанию ''                                |
| status        | TEXT  | `todo` \| `in_progress` \| `done` \| `archived`       |
| priority      | TEXT  | `low` \| `medium` \| `high` \| `critical`             |
| due_date      | TEXT  | `YYYY-MM-DD` \| NULL — дедлайн                         |
| calendar_date | TEXT  | `YYYY-MM-DD` \| NULL — дата в календаре                |
| start_time    | TEXT  | `HH:MM` \| NULL                                       |
| end_time      | TEXT  | `HH:MM` \| NULL (не раньше start_time)                |
| tags          | TEXT  | JSON-массив строк                                     |
| completed_at  | TEXT  | ISO timestamp \| NULL                                 |
| created_at    | TEXT  | ISO timestamp                                         |
| updated_at    | TEXT  | ISO timestamp                                         |

**Связь:** один `User` → много `Task`. Все запросы задач ограничены `user_id`, что гарантирует изоляцию данных (пользователь видит/меняет только свои задачи). Индексы: `idx_tasks_user`, `idx_tasks_user_due`, `idx_tasks_user_cal`.

Разделение `due_date` (дедлайн) и `calendar_date` (план) заложено согласно ТЗ (раздел 6.6.5).

## 6. Принятые архитектурные решения

1. **Сохранён фронтенд-стек и UX макета.** React + Vite + JSX + инлайн-стили не трогали; внутренности `store.jsx` переведены на API при стабильном `useApp()`, поэтому компоненты не переписывались. Миграция на TypeScript не делалась — не оправдана для учебного объёма.
2. **REST вместо GraphML/GraphQL.** Набор операций фиксирован и невелик — REST проще и нагляднее.
3. **SQLite, а не Postgres.** Проект небольшой, один пользователь на аккаунт, нет сложных связей/конкурентной записи под нагрузкой. Файловая БД = ноль инфраструктуры для локального запуска и портфолио.
4. **`node:sqlite` вместо `better-sqlite3`.** Встроенный модуль Node 22.5+ убирает нативную компиляцию (которая блокировалась политикой install-scripts в окружении). Транзакции — через явные `BEGIN/COMMIT` (helper'а `.transaction()` у `node:sqlite` нет).
5. **scrypt + ручной HS256 JWT на `node:crypto`** вместо `bcrypt`/`jsonwebtoken`. Снова — нет нативных зависимостей, минимум сторонних пакетов, безопасные дефолты (соль на пароль, `timingSafeEqual` при сравнении).
6. **Тонкие зависимости.** Бэкенд держится на `express`, `cors`, `zod` — все pure-JS. Это делает установку быстрой и предсказуемой.
7. **Валидация — на сервере (zod) и на клиенте.** Сервер — источник истины; клиент валидирует для мгновенного UX. Правила синхронизированы с ТЗ.
8. **Настройки UI — в localStorage.** Тема/первый день недели/число карточек — это предпочтения отображения, а не доменные данные, поэтому они не в БД.
9. **Монорепозиторий `client/` + `server/`.** Клиент и сервер — отдельные npm-пакеты со своими зависимостями и `Dockerfile`; в корне — оркестратор (`package.json` со скриптами `dev:all`, `setup`, `db:*`, `docker:*`) и `docker-compose.yml`. Это привычная для реальных проектов раскладка и чёткая граница ответственности.
10. **Docker Compose.** Два сервиса: `server` (Node/Express + том SQLite) и `client` (nginx, раздаёт собранный SPA и reverse-proxy `/api` → `server`). В Docker фронтенд обращается к тому же origin (`/api`), поэтому CORS не задействуется; БД переживает перезапуск благодаря именованному volume.

## 7. Что можно улучшить дальше

- Перенести агрегацию дашборда и фильтрацию/сортировку/пагинацию на сервер для масштабирования (сейчас всё считается на клиенте по полному списку).
- Тёмная тема (CSS-переменные уже подготовлены).
- Refresh-токены и серверный отзыв сессий; httpOnly-cookie вместо localStorage для токена.
- Хранение настроек пользователя на сервере.
- Мягкое удаление (`deleted_at`) вместо физического.
- Rate limiting, helmet, структурное логирование, health-чеки и метрики.
- Перевод на TypeScript и общий пакет типов/схем между фронтом и бэком (zod уже даёт основу).
- E2E-тесты (Playwright) и больше юнит-тестов селекторов дашборда.

Полный backlog с критериями готовности — в [todo.md](todo.md).
