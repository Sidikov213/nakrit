# Накрит 🍽️

Шуточный сайт «кто должен накрыть в кафе» среди друзей.

## Что умеет

- **Топ-3** — пьедестал тех, кто чаще всех накрывал
- **Полный список** — сколько раз каждый накрыл; нажми — увидишь причину каждого раза
- **Рандом** — выбирает, кто платит сегодня (чем чаще уже накрывал, тем выше шанс)
- **Админка** — только по паролю: добавить друга, записать каждый «раз» с отдельной причиной

## Локальный запуск

```bash
npm install
cp .env.example .env.local
# Отредактируй ADMIN_PASSWORD и AUTH_SECRET в .env.local
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).  
Админка: [http://localhost:3000/admin](http://localhost:3000/admin)

Без Redis данные сохраняются в `data/friends.json` локально.

## Деплой на Vercel

1. Залей репозиторий на GitHub
2. Импортируй проект в [Vercel](https://vercel.com)
3. Добавь **Upstash Redis** из [Marketplace](https://vercel.com/marketplace?category=storage&search=redis) — переменные подтянутся автоматически
4. В **Environment Variables** добавь:
   - `ADMIN_PASSWORD` — пароль для админки
   - `AUTH_SECRET` — случайная строка (минимум 32 символа)
5. Deploy

> На Vercel без Redis изменения в админке **не сохранятся** — обязательно подключи Upstash.

## Переменные окружения

| Переменная | Обязательно | Описание |
|---|---|---|
| `ADMIN_PASSWORD` | да | Пароль для `/admin` |
| `AUTH_SECRET` | да | Секрет для cookie-сессии |
| `UPSTASH_REDIS_REST_URL` | на Vercel | URL Redis |
| `UPSTASH_REDIS_REST_TOKEN` | на Vercel | Токен Redis |
