# TaskFlow

**TaskFlow** — личный таск-менеджер с авторизацией, дашбордом, календарём и аналитикой по задачам. Full-stack pet-проект: React-фронтенд + REST API на Node.js/Express + база данных SQLite.

> Изначально это был интерактивный макет (данные в `localStorage`, mock-авторизация). Теперь это рабочее full-stack приложение: реальная регистрация/вход (JWT + хэширование паролей), хранение задач в БД, изоляция данных по пользователям, валидация и обработка ошибок на сервере. Визуальный стиль и UX макета сохранены.

## Возможности

- 🔐 **Авторизация** — регистрация, вход, выход, защищённые маршруты; пароли хэшируются (scrypt), сессия по JWT
- 📊 **Дашборд** — метрики, просроченные / предстоящие / текущие задачи, диаграммы по статусам и приоритетам, прогресс недели
- ✅ **Задачи** — создание, редактирование, завершение, возврат в работу, архивация, удаление; статусы, приоритеты, теги, дедлайн и дата в календаре
- 🔎 **Фильтры и поиск** — по статусу, приоритету, просроченности, «на сегодня»; поиск по названию/описанию/тегам; сортировки
- 📅 **Календарь** — месячный вид, задачи по датам, создание задачи кликом по дню, открытие задачи из календаря
- 👤 **Профиль и настройки** — статистика аккаунта, первый день недели, показ выполненных, число задач на дашборде
- 💬 **UX** — toast-уведомления, командная палитра (⌘K / Ctrl+K), реальные состояния loading / empty / error, адаптивный layout

## Технологический стек

**Frontend**
- React 18 + Vite 5
- React Router 6 — маршрутизация и защищённые роуты
- Context API — глобальное состояние (`src/store.jsx`)
- Слой API-клиента на `fetch` (`src/api/`)
- Без UI-библиотек: компоненты и графики написаны вручную (SVG/CSS)

**Backend**
- Node.js (≥ 22.5) + Express 4
- `node:sqlite` — встроенный SQLite-движок (без нативных зависимостей)
- `zod` — валидация входных данных
- `node:crypto` — хэширование паролей (scrypt) и подпись JWT (HS256), без `bcrypt`/`jsonwebtoken`
- REST API

> **Почему такой стек?** Проект небольшой и single-user-per-account, поэтому файловая SQLite идеальна для локальной разработки и портфолио. Использование встроенных модулей Node (`node:sqlite`, `node:crypto`) убирает нативную компиляцию и делает установку быстрой и предсказуемой. Подробнее — в [docs/architecture.md](docs/architecture.md).

## Требования

- **Node.js ≥ 22.5** (нужен встроенный модуль `node:sqlite`). Проверьте: `node --version`.
- npm (идёт вместе с Node).

## Структура проекта

Монорепозиторий: клиент и сервер вынесены в отдельные пакеты, в корне — оркестратор (скрипты) и `docker-compose.yml`.

```
taskflow/
  package.json               # корневой оркестратор: dev:all, setup, db:*, docker:*
  docker-compose.yml         # запуск всего стека в Docker
  .env.example               # JWT_SECRET для docker compose
  client/                    # ── ФРОНТЕНД (React + Vite) ──
    index.html               # точка входа Vite
    vite.config.js           # конфиг Vite + dev-прокси /api -> backend
    package.json             # зависимости и скрипты фронтенда
    .env.example             # переменные фронтенда (VITE_API_URL)
    Dockerfile               # multi-stage build → nginx
    nginx.conf               # раздача SPA + reverse-proxy /api -> server
    src/
      main.jsx               # Router + AppProvider
      App.jsx                # маршруты (публичные / защищённые / 404)
      store.jsx              # глобальное состояние + действия (вызывает API)
      ui.jsx                 # примитивы <Hov>, <Icon>
      api/                   # слой работы с backend
        client.js            # fetch-обёртка, токен, обработка ошибок
        auth.js              # register / login / me / logout
        tasks.js             # CRUD + complete/reopen/archive/reset-demo
      lib/                   # css, dates, constants, tasks-селекторы
      components/            # AppLayout, TaskCard, charts, Modals, CommandPalette
      pages/                 # Landing, Auth, Dashboard, Tasks, Calendar, Profile, Settings, 404
  server/                    # ── БЭКЕНД (Express + SQLite) ──
    Dockerfile               # образ API на node:24-alpine
    .env.example             # переменные сервера (порт, JWT, БД, demo-аккаунт)
    package.json             # скрипты dev/start/migrate/seed/reset/test
    src/
      index.js               # запуск сервера
      app.js                 # сборка Express-приложения
      config.js              # конфигурация из окружения
      db/                    # подключение, schema.sql, migrate, seed, reset, ensure-seed
      middleware/            # auth (JWT), validate (zod), error
      modules/
        auth/                # routes + service + validation
        tasks/               # routes + service + repo + validation + mapper
        users/               # repo
      utils/                 # password (scrypt), token (JWT), errors, ids
    test/api.test.js         # интеграционные smoke-тесты
  docs/
    architecture.md          # архитектура, слои, схема обмена, решения
    api.md                   # описание всех endpoints
    todo.md                  # задачи для дальнейшего развития
```

## Установка и запуск

### 1. Установить зависимости и подготовить БД одной командой

```bash
npm run setup
```

Команда установит зависимости фронтенда и бэкенда, создаст БД, применит схему и заполнит демо-данными.

> При желании можно сделать всё вручную:
> ```bash
> npm install                 # concurrently (оркестратор)
> npm run install:all         # зависимости client/ и server/
> npm run db:reset            # создать БД + демо-данные
> ```

### 2. Настроить переменные окружения (опционально)

Дефолты работают «из коробки» для локальной разработки. Для кастомизации:

```bash
cp server/.env.example server/.env   # порт, JWT_SECRET, путь к БД, demo-аккаунт
cp client/.env.example client/.env   # VITE_API_URL (для продакшена)
```

> Файл `server/.env` уже создан с дев-значениями. **Перед деплоем обязательно смените `JWT_SECRET`** на длинную случайную строку.

### 3. Запустить фронтенд и бэкенд вместе

```bash
npm run dev:all
```

- Frontend (Vite): **http://localhost:5173**
- Backend (API): **http://localhost:4000**

Vite проксирует запросы `/api/*` на бэкенд, поэтому CORS в дев-режиме не мешает.

### Запуск по отдельности

```bash
npm run dev       # только фронтенд (http://localhost:5173)
npm run server    # только бэкенд в dev-режиме (авто-перезапуск)
```

### Демо-вход

На странице входа нажмите **«Войти в демо-аккаунт»** или **«Демо без регистрации»** на лендинге. Учётные данные демо-аккаунта (из `server/.env`):

```
email:    demo@taskflow.app
password: demo1234
```

Либо зарегистрируйте новый аккаунт — у него будет свой пустой список задач.

## Production-сборка

```bash
npm run build     # сборка фронтенда в dist/
npm run preview   # локальный предпросмотр сборки

npm run server:start   # запуск бэкенда в production-режиме
```

Для продакшена: выставьте `VITE_API_URL` (origin API) в `client/.env` перед `npm run build`, поднимите бэкенд (`npm run server:start`) и раздавайте `client/dist/` любым статик-сервером.

## Запуск в Docker

Требуется Docker с плагином Compose. Одна команда поднимает весь стек:

```bash
npm run docker:up      # = docker compose up --build
# открыть http://localhost:8080
```

- **caddy** — терминирует TLS (автоматический сертификат Let's Encrypt для `$DOMAIN`), редиректит http→https и проксирует на `client`. Слушает порты **80/443**.
- **client** — nginx раздаёт собранный SPA и проксирует `/api` на сервис `server` (см. [client/nginx.conf](client/nginx.conf)). Наружу не публикуется — доступ только через `caddy`.
- **server** — API на порту **4000** (только во внутренней сети), БД SQLite хранится в именованном volume `taskflow-data`, поэтому данные переживают перезапуск.
- При первом старте пустая БД автоматически заполняется демо-данными (`server/src/db/ensure-seed.js`); при последующих запусках сид пропускается.

```bash
docker compose up --build -d   # в фоне
docker compose logs -f         # логи
npm run docker:down            # остановить (= docker compose down)
npm run docker:reset           # остановить и удалить volume с данными (= down -v)
```

### Чек-лист production-готовности

- **`JWT_SECRET`** — обязателен. Скопируйте `.env.example` → `.env` в корне и впишите длинную случайную строку (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`). В режиме `NODE_ENV=production` сервер **не стартует** с дефолтным/коротким секретом.
- **`DOMAIN`** — домен для HTTPS (нужна A-запись на сервер, открытые порты 80/443). Caddy сам получит и продлит сертификат.
- **Безопасность API** — включены security-заголовки (nosniff, X-Frame-Options, HSTS в prod), rate limiting на `/api/auth/*`, структурированные JSON-логи запросов.
- **Сессии** — короткоживущий access-токен (15 мин) + refresh-токен в httpOnly-cookie с ротацией и серверным отзывом.

## Работа с базой данных

| Команда             | Действие                                                        |
| ------------------- | --------------------------------------------------------------- |
| `npm run db:migrate`| Применить схему (идемпотентно)                                  |
| `npm run db:seed`   | Создать демо-аккаунт и заполнить его демо-задачами              |
| `npm run db:reset`  | Полностью пересоздать БД (drop → schema → seed)                 |

Файл БД: `server/data/taskflow.db` (создаётся автоматически, в git не коммитится). Внутри приложения кнопка **Настройки → «Сбросить демо»** пересоздаёт задачи текущего пользователя через API.

## Основные npm-скрипты

| Скрипт                | Описание                                              |
| --------------------- | ----------------------------------------------------- |
| `npm run setup`       | Установить всё + подготовить БД                       |
| `npm run dev:all`     | Фронтенд + бэкенд одновременно                         |
| `npm run dev`         | Только фронтенд (Vite)                                 |
| `npm run server`      | Только бэкенд (dev, авто-перезапуск)                  |
| `npm run build`       | Production-сборка фронтенда                            |
| `npm run preview`     | Предпросмотр сборки                                   |
| `npm run server:start`| Бэкенд в production-режиме                             |
| `npm run db:reset`    | Пересоздать БД с демо-данными                          |
| `npm run install:all` | Установить зависимости client/ и server/              |
| `npm run docker:up`   | Поднять весь стек в Docker (build + up)                |
| `npm run docker:down` | Остановить Docker-стек                                 |
| `npm run docker:reset`| Остановить и удалить volume с данными                  |
| `npm test`            | Интеграционные тесты API                               |

## Тесты

```bash
npm test
```

Запускает интеграционные smoke-тесты бэкенда (`server/test/api.test.js`) на изолированной временной БД: регистрация/валидация, дубликат email, неверный пароль, защита маршрутов, CRUD задачи, проверка порядка времени, изоляция данных между пользователями.

## Известные ограничения

- **Тёмная тема** в настройках — заглушка (toast «появится в версии 2»); переключатель присутствует, но тема пока только светлая.
- **Настройки** (первый день недели, показ выполненных, число задач на дашборде, тема) хранятся в `localStorage` браузера, а не на сервере — это UI-предпочтения, не доменные данные.
- **Дашборд-статистика и фильтры/сортировка** считаются на клиенте по полному списку задач пользователя (как и в макете). Для тысяч задач стоит вынести агрегацию/пагинацию на сервер (см. `docs/todo.md`).
- **Logout** при JWT — на стороне клиента (удаление токена). Серверного отзыва токенов/refresh-токенов нет.
- Нет отдельных страниц `/tasks/:id` и `/tasks/new` — просмотр/создание/редактирование задач реализованы через модальные окна (как в макете). Эндпоинт `GET /api/tasks/:id` на бэкенде есть.

Подробный список дальнейших задач — в [docs/todo.md](docs/todo.md).

## Документация

- [docs/architecture.md](docs/architecture.md) — архитектура, слои фронта и бэка, схема обмена, модели данных, принятые решения
- [docs/api.md](docs/api.md) — описание всех API endpoints
- [docs/todo.md](docs/todo.md) — задачи для дальнейшего развития (формат для AI-агента)
