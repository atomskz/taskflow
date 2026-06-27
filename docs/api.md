# TaskFlow API

REST API. Базовый префикс: **`/api`**. В dev-режиме доступен через Vite-прокси на `http://localhost:5173/api` или напрямую на `http://localhost:4000/api`.

## Общие соглашения

- Формат тела запроса и ответа — **JSON**.
- Аутентификация — заголовок `Authorization: Bearer <token>`. Токен выдаётся при регистрации/входе.
- **Формат ошибки** (любой статус ≥ 400):
  ```json
  { "error": { "message": "Текст для пользователя", "fields": { "поле": "сообщение" } } }
  ```
  Поле `fields` присутствует только для ошибок валидации (400).
- Значения задач возвращаются в **camelCase**.

### Типы

```ts
type Status   = 'todo' | 'in_progress' | 'done' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'critical';

type User = {
  id: string; name: string; email: string;
  avatarUrl: string | null; createdAt: string; updatedAt: string;
};

type Task = {
  id: string; userId: string;
  title: string; description: string;
  status: Status; priority: Priority;
  dueDate: string | null;        // 'YYYY-MM-DD'
  calendarDate: string | null;   // 'YYYY-MM-DD'
  startTime: string | null;      // 'HH:MM'
  endTime: string | null;        // 'HH:MM'
  tags: string[];
  completedAt: string | null;    // ISO timestamp
  createdAt: string; updatedAt: string;
};
```

---

## Health

### `GET /api/health`
Проверка доступности сервиса. Без авторизации.

**200** → `{ "status": "ok" }`

---

## Auth

### `POST /api/auth/register`
Регистрация и автоматический вход.

**Body**
```json
{ "name": "Иван", "email": "ivan@example.com", "password": "secret12" }
```
Валидация: `name` 2–50; `email` валидный и не занят; `password` ≥ 8, минимум одна буква и одна цифра.

**201** → `{ "token": "<jwt>", "user": User }`

**Ошибки**
- `400` — ошибки валидации (`fields`).
- `409` — `«Этот email уже зарегистрирован»`.

---

### `POST /api/auth/login`
Вход по email и паролю.

**Body**
```json
{ "email": "ivan@example.com", "password": "secret12" }
```

**200** → `{ "token": "<jwt>", "user": User }`

**Ошибки**
- `400` — ошибки валидации (`fields`).
- `401` — `«Неверный email или пароль»` (одинаковое сообщение для несуществующего email и неверного пароля, чтобы не раскрывать наличие аккаунта).

---

### `GET /api/auth/me`
Текущий пользователь по токену. **Требует авторизации.**

**200** → `{ "user": User }`

**Ошибки**
- `401` — токен отсутствует/некорректен/истёк.
- `404` — пользователь не найден.

---

### `POST /api/auth/logout`
Завершение сессии. При stateless-JWT — no-op (клиент удаляет токен сам). Предусмотрен для симметрии/расширения.

**204** → пустой ответ.

---

## Tasks

> Все маршруты ниже **требуют авторизации**. Операции всегда ограничены задачами текущего пользователя; обращение к чужой/несуществующей задаче → `404`.

### `GET /api/tasks`
Задачи текущего пользователя с серверной фильтрацией, сортировкой и пагинацией. Удалённые (мягко) задачи не возвращаются.

**Query-параметры** (все необязательны)

| Параметр           | Значения / тип                                                        | По умолчанию   | Описание |
|--------------------|-----------------------------------------------------------------------|----------------|----------|
| `status`           | `all` \| `todo` \| `in_progress` \| `done` \| `archived`              | `all`          | `all` исключает архив |
| `priority`         | `all` \| `low` \| `medium` \| `high` \| `critical`                    | `all`          | |
| `search`           | строка (≤100)                                                          | —              | Подстрока в названии, описании или тегах |
| `onlyOverdue`      | `true` \| `false`                                                     | `false`        | Просроченные (по `today`) |
| `onlyToday`        | `true` \| `false`                                                     | `false`        | `calendarDate` или `dueDate` = `today` |
| `includeCompleted` | `true` \| `false`                                                     | `true`         | При `status=all` скрывает выполненные, если `false` |
| `sort`             | `created_desc` \| `created_asc` \| `due_asc` \| `priority_desc` \| `title_asc` | `created_desc` | |
| `today`            | `YYYY-MM-DD`                                                          | дата сервера   | Локальная дата клиента для `onlyOverdue`/`onlyToday` |
| `limit`            | 1…500                                                                  | `50`           | Размер страницы |
| `offset`           | ≥0                                                                     | `0`            | Смещение для пагинации |

**200** → `{ "tasks": Task[], "total": number }` — `total` это число всех подходящих задач (для пагинации).

---

### `POST /api/tasks`
Создать задачу.

**Body** (обязателен только `title`)
```json
{
  "title": "Подготовить отчёт",
  "description": "",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-07-01",
  "calendarDate": "2026-06-28",
  "startTime": "10:00",
  "endTime": "11:30",
  "tags": ["работа"]
}
```
Валидация: `title` 3–100; `description` ≤ 1000; `status`/`priority` из допустимых значений (по умолчанию `todo`/`medium`); даты `YYYY-MM-DD`; время `HH:MM`; `endTime` не раньше `startTime`. Пустые строки в датах/времени трактуются как `null`. Если `status: "done"`, проставляется `completedAt`.

**201** → `{ "task": Task }`

**Ошибки**: `400` (`fields`), `401`.

---

### `GET /api/tasks/:id`
Одна задача (только своя).

**200** → `{ "task": Task }`
**Ошибки**: `401`, `404`.

---

### `PATCH /api/tasks/:id`
Частичное обновление. Передаются только изменяемые поля (любое подмножество полей создания).

**Body** (пример)
```json
{ "title": "Новое название", "priority": "critical", "status": "in_progress" }
```
При смене `status` поле `completedAt` приводится в соответствие: `done` → проставляется (если не было), иначе обнуляется.

**200** → `{ "task": Task }`
**Ошибки**: `400` (`fields`), `401`, `404`.

---

### `DELETE /api/tasks/:id`
Физическое удаление.

**204** → пустой ответ.
**Ошибки**: `401`, `404`.

---

### `POST /api/tasks/:id/complete`
Завершить задачу: `status = done`, `completedAt = now`.

**200** → `{ "task": Task }`
**Ошибки**: `401`, `404`.

---

### `POST /api/tasks/:id/reopen`
Вернуть в работу: `status = todo`, `completedAt = null`.

**200** → `{ "task": Task }`
**Ошибки**: `401`, `404`.

---

### `POST /api/tasks/:id/archive`
Перевести в архив: `status = archived`.

**200** → `{ "task": Task }`
**Ошибки**: `401`, `404`.

---

### `POST /api/tasks/reset-demo`
Удалить все задачи текущего пользователя и заполнить заново демонстрационным набором (привязан к «сегодня»). Используется кнопкой «Сбросить демо» в настройках.

**200** → `{ "tasks": Task[] }`
**Ошибки**: `401`.

---

## Сводная таблица

| Метод  | Путь                        | Назначение              | Авторизация |
| ------ | --------------------------- | ----------------------- | ----------- |
| GET    | `/api/health`               | Проверка сервиса        | —           |
| POST   | `/api/auth/register`        | Регистрация             | —           |
| POST   | `/api/auth/login`           | Вход                    | —           |
| GET    | `/api/auth/me`              | Текущий пользователь    | ✔           |
| POST   | `/api/auth/logout`          | Выход                   | —           |
| GET    | `/api/tasks`                | Список задач            | ✔           |
| POST   | `/api/tasks`                | Создать задачу          | ✔           |
| GET    | `/api/tasks/:id`            | Получить задачу         | ✔           |
| PATCH  | `/api/tasks/:id`            | Обновить задачу         | ✔           |
| DELETE | `/api/tasks/:id`            | Удалить задачу          | ✔           |
| POST   | `/api/tasks/:id/complete`   | Завершить               | ✔           |
| POST   | `/api/tasks/:id/reopen`     | Вернуть в работу        | ✔           |
| POST   | `/api/tasks/:id/archive`    | В архив                 | ✔           |
| POST   | `/api/tasks/reset-demo`     | Сбросить демо-данные    | ✔           |

## Примеры (curl)

```bash
# Вход в демо-аккаунт
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@taskflow.app","password":"demo1234"}' | jq -r .token)

# Список задач
curl -s http://localhost:4000/api/tasks -H "Authorization: Bearer $TOKEN" | jq '.tasks | length'

# Создать задачу
curl -s -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Новая задача","priority":"high","dueDate":"2026-07-01"}' | jq .task
```
