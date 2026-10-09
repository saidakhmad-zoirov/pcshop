# PC Forge — frontend

Kompyuter qismlari do'koni va PC Builder (konfigurator) saytining frontend qismi.

**Texnologiyalar:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand

Backend (FastAPI + PostgreSQL + JWT) alohida, yopiq repoda saqlanadi.

## Sahifalar

| Yo'l | Nima |
|---|---|
| `/` | Bosh sahifa: tayyor yig'ilma, turkumlar, chegirmalar |
| `/catalog` | Katalog: qidiruv, filtrlar (brend, narx, soket, xotira turi), saralash |
| `/product/[slug]` | Mahsulot sahifasi, xususiyatlar, o'xshash mahsulotlar |
| `/builder` | PC Builder: moslik tekshiruvi, quvvat shkalasi, ulashish havolasi |
| `/cart` | Savat va buyurtma berish, yig'ib berish xizmati |
| `/account` | Buyurtmalar tarixi, saqlangan yig'ilmalar |
| `/admin` | Mahsulotlar, Google'dan rasm tanlash, buyurtma statuslari |

## Xavfsizlik (frontend tomoni)

- Access token faqat xotirada saqlanadi, refresh token — httpOnly cookie'da (JavaScript o'qiy olmaydi)
- Token eskirganda avtomatik yangilanadi (bir vaqtda bitta so'rov)
- Content-Security-Policy va boshqa xavfsizlik headerlari
- Login'dan keyin faqat sayt ichidagi sahifaga qaytadi (open redirect'dan himoya)
- API so'rovlari Next.js orqali proxy qilinadi — cookie same-origin, CORS kerak emas

## Ishga tushirish

```bash
npm install
BACKEND_URL=http://localhost:8000 npm run dev
```

## Litsenziya

Barcha huquqlar himoyalangan — [LICENSE](LICENSE) faylini ko'ring.
