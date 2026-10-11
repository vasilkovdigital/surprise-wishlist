# Surprise Wish-list (прототип)

Свайп-приложение впечатлений Surprise.by. ТЗ: [docs/TZ.md](docs/TZ.md).

```
npm install
npm run sync          # обновить каталог из surprise.by/google_merchant.csv
npm run sync:images   # то же + скачать фото для полного офлайна (~24 МБ)
npm run dev           # разработка
npm run build && npm run preview   # prod-сборка с service worker (офлайн)
```

Офлайн-синк из локального файла: `FEED_FILE=путь\к\feed.csv npm run sync`.

Настройки текстов, бонуса, UTM и флага регистрации — `src/lib/config.ts`.
Бренд-ассеты — `brand/` (из дизайн-системы Surprise).
