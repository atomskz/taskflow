// Demo task definitions, ported from the original frontend mock (src/lib/seed.js).
// Dates are anchored relative to "today" at generation time so the dashboard,
// calendar and overdue lists always look alive. Returns plain DTOs (no id/userId)
// ready for the tasks repository to insert.

const sod = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const today = () => sod(new Date());
const addDays = (d, n) => {
  const x = sod(d);
  x.setDate(x.getDate() + n);
  return x;
};
const isoDate = (d) => {
  const x = sod(d);
  return (
    x.getFullYear() +
    '-' +
    String(x.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(x.getDate()).padStart(2, '0')
  );
};

export function buildDemoTasks() {
  const di = (o) => isoDate(addDays(today(), o));
  // Deterministic-ish timestamp builder (avoids Math.random for reproducibility).
  const ts = (o, h = 9, m = 15) => {
    const d = addDays(today(), o);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const T = (o) => {
    const created = o.c == null ? -3 : o.c;
    const base = {
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      calendarDate: null,
      startTime: null,
      endTime: null,
      tags: [],
      completedAt: null,
      createdAt: ts(created),
      updatedAt: ts(created),
    };
    const merged = { ...base, ...o };
    delete merged.c;
    return merged;
  };

  const raw = [
    { title: 'Сверстать форму логина', description: 'Адаптивная форма с валидацией полей и понятными состояниями ошибок.', status: 'in_progress', priority: 'high', dueDate: di(1), calendarDate: di(0), startTime: '10:00', endTime: '12:30', tags: ['frontend', 'учёба'], c: -2 },
    { title: 'Прочитать документацию React Router', description: 'Разобраться с защищёнными маршрутами и data loaders.', status: 'todo', priority: 'medium', dueDate: di(3), calendarDate: di(1), tags: ['учёба'], c: -1 },
    { title: 'Настроить backend и БД', description: 'Express + SQLite: политики доступа — пользователь видит только свои задачи.', status: 'todo', priority: 'critical', dueDate: di(-1), calendarDate: di(-1), tags: ['backend', 'deploy'], c: -4 },
    { title: 'Подготовить отчёт по спринту', description: 'Собрать метрики недели и оформить в Notion.', status: 'todo', priority: 'high', dueDate: di(2), calendarDate: di(0), startTime: '15:00', endTime: '16:00', tags: ['работа'], c: -1 },
    { title: 'Code review PR #142', description: 'Проверить рефакторинг дашборда и оставить комментарии.', status: 'in_progress', priority: 'medium', dueDate: di(0), calendarDate: di(0), startTime: '14:00', endTime: '14:45', tags: ['работа', 'frontend'], c: -1 },
    { title: 'Купить продукты на неделю', description: '', status: 'todo', priority: 'low', dueDate: di(1), calendarDate: di(1), tags: ['личное'], c: -1 },
    { title: 'Тренировка в зале', description: 'Ноги и спина, 60 минут.', status: 'todo', priority: 'low', calendarDate: di(0), startTime: '19:00', endTime: '20:30', tags: ['личное', 'здоровье'], c: -2 },
    { title: 'Дизайн лендинга TaskFlow', description: 'Hero, блок возможностей и футер. Светлая тема, индиго-акцент.', status: 'in_progress', priority: 'high', dueDate: di(4), calendarDate: di(2), tags: ['дизайн', 'frontend'], c: -3 },
    { title: 'Исправить баг с часовым поясом', description: 'Даты сдвигаются на день при сохранении задачи.', status: 'todo', priority: 'critical', dueDate: di(0), calendarDate: di(0), tags: ['frontend', 'bug'], c: -1 },
    { title: 'Созвон с ментором', description: 'Обсудить план портфолио и следующие шаги.', status: 'todo', priority: 'medium', dueDate: di(2), calendarDate: di(2), startTime: '18:00', endTime: '18:30', tags: ['учёба'], c: 0 },
    { title: 'Написать unit-тесты для утилит дат', description: 'Покрыть обёртки над датами.', status: 'todo', priority: 'low', dueDate: di(5), calendarDate: di(3), tags: ['тесты'], c: 0 },
    { title: 'Задеплоить проект на Vercel', description: 'Настроить переменные окружения и домен.', status: 'todo', priority: 'high', dueDate: di(6), calendarDate: di(5), tags: ['deploy'], c: -1 },
    { title: 'Обновить README со скриншотами', description: 'Добавить раздел Getting Started и demo-ссылку.', status: 'todo', priority: 'medium', dueDate: di(-2), tags: ['docs'], c: -5 },
    { title: 'Настроить ESLint и Prettier', description: 'Единый стиль кода для проекта.', status: 'done', priority: 'medium', tags: ['setup'], completedAt: ts(-2, 16), c: -5 },
    { title: 'Сверстать сайдбар и навигацию', description: 'Левое меню с активными состояниями.', status: 'done', priority: 'high', calendarDate: di(-1), tags: ['frontend'], completedAt: ts(-1, 12), c: -4 },
    { title: 'Свёрстать карточку задачи', description: 'Карточка со статусом, приоритетом и действиями.', status: 'done', priority: 'medium', tags: ['frontend'], completedAt: ts(0, 11), c: -3 },
    { title: 'Создать репозиторий и Vite-проект', description: 'Инициализация и базовая структура папок.', status: 'done', priority: 'low', tags: ['setup'], completedAt: ts(-3, 10), c: -6 },
    { title: 'Старый прототип на localStorage', description: 'Архивная версия до перехода на backend.', status: 'archived', priority: 'low', tags: ['archive'], c: -12 },
  ];

  return raw.map(T);
}
