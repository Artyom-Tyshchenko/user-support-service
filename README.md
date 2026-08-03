# User Support Service

Тестовое задание (Effective Mobile) — сервис регистрации и управления пользователями.
Бэкенд переписан с Express на **NestJS**, добавлен полноценный **React**-фронтенд.

## Стек

| Слой | Технологии |
|---|---|
| Backend | NestJS 10, TypeScript, Prisma ORM, PostgreSQL, Passport-JWT, class-validator, Swagger |
| Frontend | React 18, TypeScript, Vite, React Router |
| Инфраструктура | Docker Compose (PostgreSQL) |

## Роли и статусы

- **Роль** (`role`): `admin` или `user`. Назначается в БД (по умолчанию — `user`; чтобы создать первого админа, поменяйте роль вручную через `prisma studio` или SQL).
- **Статус** (`isActive`): `true` (активен) / `false` (заблокирован). Заблокированный пользователь не может войти в систему (`403 Forbidden` при попытке логина).

## Эндпоинты API

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| `POST` | `/api/users/register` | Публичный | Регистрация нового пользователя |
| `POST` | `/api/users/login` | Публичный | Авторизация, выдаёт JWT |
| `GET` | `/api/users` | Только `admin` | Список пользователей (пагинация `?page=&limit=`) |
| `GET` | `/api/users/:id` | `admin` или сам пользователь | Получить пользователя по ID |
| `PATCH` | `/api/users/:id/block` | `admin` или сам пользователь | Заблокировать пользователя |
| `GET` | `/health` | Публичный | Health-check |

Полная интерактивная документация (Swagger) поднимается вместе с сервером на `/api/docs`.

## Структура репозитория

```
├── backend/            # NestJS API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── auth/        # JWT-стратегия, гварды (JwtAuthGuard, RolesGuard)
│       ├── users/        # DTO, сервис, контроллер
│       ├── common/        # декораторы (@Roles, @CurrentUser), фильтр ошибок
│       └── main.ts
├── frontend/           # React + TypeScript SPA
│   └── src/
│       ├── api/client.ts     # типизированный fetch-клиент
│       ├── context/AuthContext.tsx
│       ├── pages/             # Login, Register, Dashboard, Users (admin)
│       └── components/
├── docker-compose.yml   # локальный PostgreSQL
└── LICENSE
```

## Быстрый старт

### 1. База данных

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # при необходимости поправьте значения
npm install
npm run prisma:migrate     # создаст таблицы в БД
npm run start:dev
```

Сервер поднимется на `http://localhost:3000`, Swagger — на `http://localhost:3000/api/docs`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Откройте `http://localhost:5173`.

### Первый администратор

По умолчанию все новые пользователи регистрируются с ролью `user`. Чтобы получить админа:

```bash
cd backend
npm run prisma:studio
```

В открывшемся Prisma Studio найдите нужного пользователя и смените `role` на `admin`.

## Бизнес-правила

- Email уникален; повторная регистрация с тем же email → `409 Conflict`.
- Пароль: минимум 8 символов, обязательна заглавная буква и цифра.
- Регистрация доступна только пользователям 18+ (проверяется по дате рождения).
- `GET /api/users` (список) — доступен только `admin`.
- `GET /api/users/:id` и `PATCH /api/users/:id/block` — доступны `admin` для любого пользователя, либо самому пользователю только для своего `id`. Во всех остальных случаях — `403 Forbidden`.
- Попытка входа заблокированным пользователем → `403 Forbidden`.

## Лицензия

Код распространяется по лицензии [MIT](./LICENSE).
