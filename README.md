# Support Ticket System

Sistem support ticket sederhana dengan dua peran (user & admin), dibangun sebagai
polyglot monorepo: API Laravel, frontend Next.js, dan satu service statistik Node.

> **Catatan database:** Proyek ini menggunakan **MySQL** (bukan SQLite seperti pada
> spesifikasi awal) sesuai permintaan. Lihat [ADR-3](docs/decisions.md).

## Tech Stack

| Komponen | Versi |
|---|---|
| PHP | 8.3 (Laravel 13 minimum) |
| Laravel | 13.x |
| Node.js | 24 LTS |
| Next.js | 16.2.11 |
| React | 19.2.x |
| TypeScript | bawaan `create-next-app` |
| Database | MySQL 8.0 |
| Test runner | Pest |
| CSS | Tailwind CSS v4 |

## Arsitektur

Monorepo berisi tiga aplikasi yang di-deploy independen dan tidak saling
berkomunikasi (bukan microservice — hanya satu bounded context: Ticket).

```
support-ticket-system/
├── apps/
│   ├── api/     # Laravel 13 — REST API (Route → FormRequest → Controller → Policy/Action → Model → Resource)
│   ├── web/     # Next.js 16 — App Router, server-first
│   └── stats/   # Node 24 + TS — service statistik, query MySQL langsung
└── docs/        # kontrak API + ADR
```

- **API**: layered MVC + Action layer. Tiga Action (`CreateTicket`,
  `UpdateTicketStatus`, `AddTicketResponse`) menampung logika bisnis agar dapat
  diuji tanpa HTTP.
- **Web**: Server Component untuk semua pembacaan data (fetch langsung ke Laravel
  dari server). Client Component hanya untuk form dan filter. State filter status
  disimpan di URL `searchParams`, bukan `useState`.
- **Stats**: satu file Express, membaca database MySQL yang sama secara langsung
  (tidak memanggil API Laravel).

## Setup

Prasyarat: PHP ≥ 8.3 (+ `pdo_mysql`), Composer, Node ≥ 24, MySQL berjalan di
`127.0.0.1:3306` (user `root`, tanpa password — default Laragon).

```bash
make setup     # buat database, install deps, generate key, migrate --seed
```

Atau manual:

```bash
# 1. Buat database
mysql -u root -h 127.0.0.1 -e "CREATE DATABASE Support_Ticket_System; CREATE DATABASE Support_Ticket_System_test;"

# 2. Laravel API
cd apps/api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# 3. Dependencies JS (web + stats)
cd ../.. && npm install
cp apps/stats/.env.example apps/stats/.env   # opsional; default sudah cocok
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > apps/web/.env.local
```

Menjalankan (tiga terminal):

```bash
make api      # Laravel   → http://localhost:8000
make web      # Next.js   → http://localhost:3000
make stats    # Stats     → http://localhost:4000/stats
```

## Akun Demo

Password seragam: `password`

| Email | Role |
|---|---|
| `admin@example.com` | admin |
| `user@example.com` | user |

## API Endpoints

Prefix: `/api/v1`. Detail lengkap di [`docs/api.md`](docs/api.md).

| Method | Endpoint | Auth | Sukses |
|---|---|---|---|
| POST | `/login` | — | 200 |
| GET | `/tickets` | — | 200 |
| POST | `/tickets` | — | 201 |
| GET | `/tickets/{id}` | — | 200 |
| PATCH | `/tickets/{id}/status` | admin | 200 |
| POST | `/tickets/{id}/responses` | admin | 201 |

Endpoint admin memakai `auth:sanctum` + Policy (`role === 'admin'`). Token berupa
Bearer token yang diterbitkan Sanctum.

## Menjalankan Test

```bash
make test        # atau: cd apps/api && php artisan test
```

Test dijalankan terhadap database MySQL khusus `Support_Ticket_System_test`
(dikonfigurasi di `apps/api/phpunit.xml`). Mencakup:

- **Unit** — `TicketStatus::label()` dan aturan transisi status.
- **Integration** — create ticket (201, status awal `open`).
- **Validation** — create tanpa subject/description (422).
- **Authorization** — non-admin 403, admin 200, tanpa token 401.

## Second Backend Task

Service statistik Node (`apps/stats`) berjalan di port 4000, membaca MySQL secara
langsung tanpa memanggil API Laravel.

```bash
curl http://localhost:4000/stats
```

```json
{
  "total": 15,
  "by_status": { "open": 5, "in_progress": 5, "resolved": 5 },
  "avg_responses_per_ticket": 1.27,
  "generated_at": "2026-07-24T09:00:00.000Z"
}
```

## Batasan Scope

- Tidak ada registrasi user, notifikasi, rate limiting, upload file, soft delete,
  atau audit log.
- Endpoint baca & create ticket terbuka tanpa auth; ticket baru diberikan ke
  reporter default (user demo) ketika tidak ada token.
- UI admin (ubah status / tambah response) berada di layer API dan diuji lewat
  test; frontend fokus pada alur user (list, filter, create, detail) sesuai
  spesifikasi.
- Tanpa Docker — seluruh service dijalankan native.
