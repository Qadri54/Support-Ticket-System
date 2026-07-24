# Simple Support Ticket System — Spesifikasi Project

Dokumen ini adalah spesifikasi teknis. Implementasikan sesuai isi dokumen. Jangan menambah fitur, dependency, atau lapisan abstraksi yang tidak tercantum di sini.

---

## 1. Ruang lingkup

Aplikasi support ticket dengan dua peran.

**User**
- Melihat daftar tiket
- Membuat tiket baru
- Melihat detail tiket
- Melihat status tiket: `Open`, `In Progress`, `Resolved`

**Admin**
- Mengubah status tiket
- Menambahkan response ke tiket
- Memfilter tiket berdasarkan status

Aplikasi tidak perlu production-complete. Tidak ada registrasi user, rate limiting, notifikasi, soft delete, upload file, atau audit log.

---

## 2. Stack & versi

| Komponen | Versi | Catatan |
|---|---|---|
| PHP | 8.5.x | minimum 8.3 (batas bawah Laravel 13) |
| Laravel | 13.x | |
| Node.js | 24 LTS | jangan pakai Node 26 (masih status *Current*) |
| Next.js | >= 16.2.11 | batas bawah karena security release 20 Juli 2026 |
| React | 19.2.x | dibawa otomatis oleh Next 16 |
| TypeScript | bawaan `create-next-app` | jangan pin manual |
| Database | SQLite | |
| Test runner PHP | Pest | |
| CSS | Tailwind | |

Tanpa Docker. Semua service dijalankan native.

Prasyarat yang harus lolos sebelum mulai:

```bash
php -v                    # >= 8.3
php -m | grep -i sqlite   # pdo_sqlite dan sqlite3 aktif
composer -V
node -v                   # v24.x
```

---

## 3. Arsitektur

### 3.1 Level repo — polyglot monorepo

Satu repo berisi tiga aplikasi yang di-deploy independen dan tidak saling berkomunikasi.

Ini bukan arsitektur microservice: tidak ada komunikasi antar-service, dan hanya ada satu bounded context (Ticket). Jangan mengimplementasikan service discovery, message broker, API gateway, distributed tracing, atau per-service database.

### 3.2 Level Laravel API — layered MVC + Action layer

```
Route
  └─> FormRequest        validasi input
       └─> Controller    tipis, orkestrasi saja, tanpa logika bisnis
            ├─> Policy   otorisasi
            └─> Action   logika bisnis, satu kelas satu tugas
                 └─> Model (Eloquent)
                      └─> API Resource   bentuk response
```

Action class yang dibuat, tepat tiga:

```
app/Actions/CreateTicket.php
app/Actions/UpdateTicketStatus.php
app/Actions/AddTicketResponse.php
```

Masing-masing mengekspos satu method `handle()`. Controller hanya memanggil Action dan mengembalikan API Resource.

Action layer ada karena requirement unit test membutuhkan logika bisnis yang dapat diuji tanpa HTTP dan tanpa database.

### 3.3 Level Next.js — App Router, server-first

- **Server Component** untuk semua pembacaan data. Fetch langsung ke Laravel dari sisi server.
- **Client Component** hanya pada titik interaktif: form dan kontrol filter.
- **Route Handler** untuk mutasi yang membutuhkan token.

State filter status disimpan di URL searchParams (`/?status=open`), bukan di `useState`. Server Component membaca `searchParams` dan melakukan fetch ulang.

### 3.4 Level Node stats service

Satu file, tanpa struktur folder. Router, satu query, satu response.

---

## 4. Larangan eksplisit

| Jangan | Alasan teknis |
|---|---|
| Repository Pattern | Eloquent sudah Active Record. Wrapper interface menambah indirection tanpa manfaat |
| Clean / Hexagonal Architecture | Tiga tabel tidak membutuhkan lapisan + DTO + mapper |
| DDD (aggregate, value object) | Tidak ada domain kompleks untuk dimodelkan |
| CQRS, event sourcing | Di luar cakupan |
| Redux, Zustand, Jotai | State filter cukup di URL searchParams |
| React Query, SWR | Server Component sudah async; tidak ada polling atau cache invalidation |
| Turborepo, Nx | Tool workspace JavaScript; `apps/api` yang PHP tidak masuk graph-nya |
| Docker | Dilepas dari scope |
| Sanctum SPA cookie mode | Gunakan Bearer token. Cookie mode butuh sibling domain dan CSRF cookie |
| `localStorage` untuk token | Gunakan httpOnly cookie |
| `any` di TypeScript | Tipe response API ditulis manual di `lib/types.ts` |
| Commit `database/database.sqlite` | Masuk `.gitignore`; dibuat lewat `migrate --seed` |

Batas abstraksi di sisi Laravel: satu layer di atas Eloquent, tidak lebih.

---

## 5. Struktur direktori

```
support-ticket-system/
├── apps/
│   ├── api/                 # Laravel 13 — main API
│   ├── web/                 # Next.js 16 — frontend
│   └── stats/               # Node 24 + TS — second backend task
├── docs/
│   ├── api.md               # kontrak endpoint
│   └── decisions.md         # ADR
├── .editorconfig
├── .gitignore
├── package.json             # npm workspaces: web + stats
├── Makefile
└── README.md
```

Root `package.json`:

```json
{
  "name": "support-ticket-system",
  "private": true,
  "workspaces": ["apps/web", "apps/stats"],
  "engines": { "node": ">=24" }
}
```

`apps/api` tidak dimasukkan ke workspaces meskipun Laravel menyertakan `package.json` untuk Vite. API-only tidak memakai Vite.

---

## 6. Setup

### 6.1 Repo

```bash
mkdir support-ticket-system && cd support-ticket-system
git init
mkdir -p apps docs
```

Commit per fase implementasi (lihat bagian 12), bukan satu commit di akhir.

### 6.2 Laravel

```bash
cd apps
laravel new api
# prompt: starter kit       -> None
#         testing framework -> Pest
#         database          -> SQLite
cd api
php artisan install:api
```

`.env`:

```
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
FRONTEND_URL=http://localhost:3000
```

`DB_DATABASE` dikosongkan — Laravel memakai `database/database.sqlite`.

CORS:

```bash
php artisan config:publish cors
```

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => [env('FRONTEND_URL')],
```

### 6.3 Next.js

```bash
cd apps
npx create-next-app@latest web
```

| Prompt | Jawaban |
|---|---|
| TypeScript | Yes |
| ESLint | Yes |
| Tailwind CSS | Yes |
| `src/` directory | Yes |
| App Router | Yes |
| Turbopack | Yes |
| import alias | `@/*` |

```bash
cd web && npm ls next   # verifikasi >= 16.2.11
```

`apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 6.4 Node stats service

```bash
cd apps && mkdir stats && cd stats
npm init -y
npm i express
npm i -D typescript tsx @types/node @types/express
npx tsc --init
```

Tanpa driver database. Node 24 menyediakan modul SQLite bawaan `node:sqlite` (stability 1.2, release candidate). Verifikasi:

```bash
node -e "const {DatabaseSync}=require('node:sqlite'); console.log('ok')"
```

Jika gagal: tambahkan flag `--experimental-sqlite`, atau fallback ke `npm i better-sqlite3`.

---

## 7. Skema database

```
users
  id             bigint, PK
  name           string
  email          string, unique
  password       string
  role           string        'user' | 'admin'
  timestamps

tickets
  id             bigint, PK
  user_id        FK -> users.id, cascadeOnDelete
  subject        string
  description    text
  status         string, default 'open'
  timestamps

ticket_responses
  id             bigint, PK
  ticket_id      FK -> tickets.id, cascadeOnDelete
  user_id        FK -> users.id
  body           text
  timestamps
```

Relasi Eloquent:

- `User hasMany Ticket`
- `Ticket belongsTo User`
- `Ticket hasMany TicketResponse`
- `TicketResponse belongsTo Ticket`
- `TicketResponse belongsTo User`

Kolom `status` dan `role` bertipe `string` di level database (SQLite tidak memiliki tipe ENUM native), di-cast ke PHP backed enum di model.

```php
// app/Enums/TicketStatus.php
enum TicketStatus: string
{
    case Open       = 'open';
    case InProgress = 'in_progress';
    case Resolved   = 'resolved';

    public function label(): string
    {
        return match($this) {
            self::Open       => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved   => 'Resolved',
        };
    }
}
```

```php
// app/Models/Ticket.php
protected function casts(): array
{
    return ['status' => TicketStatus::class];
}
```

Migration ditulis portabel agar `DB_CONNECTION` dapat diganti ke MySQL tanpa perubahan kode.

**Seeder** (`database/seeders/DatabaseSeeder.php`):

- 1 admin: `admin@example.com`
- 3 user biasa, salah satunya `user@example.com`
- Password seragam: `password`
- ~15 tiket tersebar merata di ketiga status
- Sebagian tiket memiliki response, sebagian tidak

---

## 8. Kontrak API

Prefix: `/api/v1`

| Method | Endpoint | Auth | Sukses | Keterangan |
|---|---|---|---|---|
| POST | `/login` | — | 200 | mengembalikan Bearer token |
| GET | `/tickets` | — | 200 | `?status=open&page=1`, paginated |
| POST | `/tickets` | — | 201 | + header `Location` |
| GET | `/tickets/{id}` | — | 200 | menyertakan relasi `responses` |
| PATCH | `/tickets/{id}/status` | admin | 200 | |
| POST | `/tickets/{id}/responses` | admin | 201 | |

Service Node terpisah, port 4000:

| Method | Endpoint | Sukses |
|---|---|---|
| GET | `/stats` | 200 |

### 8.1 HTTP status code

| Kondisi | Code |
|---|---|
| Resource dibuat | 201 |
| Read / update berhasil | 200 |
| Belum terautentikasi | 401 |
| Terautentikasi tapi bukan admin | 403 |
| Ticket tidak ditemukan | 404 |
| Validasi gagal | 422 |

### 8.2 Bentuk error

Konsisten untuk seluruh endpoint, memakai format bawaan Laravel:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "subject": ["The subject field is required."]
  }
}
```

`ValidationException` tidak boleh tertangkap oleh `try/catch` generik.

### 8.3 Autentikasi & otorisasi

- Endpoint baca dan create tiket: terbuka, tanpa auth.
- Endpoint admin (`PATCH /tickets/{id}/status`, `POST /tickets/{id}/responses`): middleware `auth:sanctum` + Policy yang memeriksa `role === 'admin'`.
- `POST /login` menerbitkan Bearer token via Sanctum.

Di sisi Next.js: token disimpan sebagai httpOnly cookie melalui Route Handler `app/api/login/route.ts`. Server Component membaca cookie tersebut dan mengirimkannya sebagai header `Authorization: Bearer <token>`.

### 8.4 Response stats service

```json
{
  "total": 42,
  "by_status": { "open": 15, "in_progress": 12, "resolved": 15 },
  "avg_responses_per_ticket": 1.7,
  "generated_at": "2026-07-24T09:00:00Z"
}
```

Membaca file SQLite Laravel secara read-only. Tidak memanggil API Laravel.

---

## 9. Frontend

```
apps/web/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # list tiket, membaca searchParams
│   ├── loading.tsx
│   ├── error.tsx
│   ├── tickets/
│   │   ├── new/page.tsx          # form buat tiket
│   │   └── [id]/
│   │       ├── page.tsx          # detail + thread response
│   │       ├── loading.tsx
│   │       └── error.tsx
│   └── api/login/route.ts        # set httpOnly cookie
├── components/
│   ├── TicketCard.tsx
│   ├── StatusBadge.tsx
│   ├── StatusFilter.tsx          # client component, push ke URL
│   └── TicketForm.tsx            # client component
├── lib/
│   ├── api.ts                    # fetch wrapper terpusat
│   └── types.ts                  # tipe response API, ditulis manual
└── schemas/
    └── ticket.ts                 # skema Zod
```

Requirement wajib:

| Requirement | Implementasi |
|---|---|
| Responsive | Tailwind mobile-first, diverifikasi pada viewport 375px |
| Loading state | `loading.tsx` per route + `useFormStatus` / `isPending` saat submit |
| Error state | `error.tsx` per route + pesan dari respons 422 ditampilkan per field |
| Validasi form | Zod di client **dan** FormRequest di server — keduanya, bukan salah satu |

---

## 10. Testing

Seluruh test berada di `apps/api`, dijalankan dengan `php artisan test`.

**Unit test** — tanpa database, tanpa HTTP.

```
tests/Unit/TicketStatusTest.php
  - TicketStatus::InProgress->label() === 'In Progress'
  - aturan transisi status yang valid dan tidak valid
```

**API / integration test**

```
tests/Feature/CreateTicketTest.php
  - POST /api/v1/tickets dengan payload valid
  - assertStatus(201)
  - assertDatabaseHas('tickets', [...])
  - status awal bernilai 'open'
```

**Validation test**

```
tests/Feature/TicketValidationTest.php
  - POST /api/v1/tickets tanpa subject
  - assertStatus(422)
  - assertJsonValidationErrors(['subject'])
```

**Authorization test**

```
tests/Feature/TicketAuthorizationTest.php
  - user biasa PATCH /api/v1/tickets/{id}/status -> 403
  - admin PATCH endpoint yang sama -> 200
  - tanpa token -> 401
```

Konfigurasi `phpunit.xml`:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

Test frontend tidak diwajibkan.

---

## 11. Makefile

```makefile
.PHONY: setup api web stats test fresh

setup:
	cd apps/api && composer install && cp -n .env.example .env && php artisan key:generate
	cd apps/api && touch database/database.sqlite && php artisan migrate --seed
	npm install

fresh:
	cd apps/api && php artisan migrate:fresh --seed

api:
	cd apps/api && php artisan serve

web:
	npm run dev --workspace=apps/web

stats:
	npm run dev --workspace=apps/stats

test:
	cd apps/api && php artisan test
```

Port: Laravel 8000, Next.js 3000, stats service 4000.

---

## 12. Urutan implementasi

Setiap fase harus menghasilkan kondisi yang dapat dijalankan sebelum lanjut ke fase berikutnya.

| # | Fase | Kondisi selesai |
|---|---|---|
| 1 | Inisialisasi repo + Laravel | `php artisan migrate` sukses |
| 2 | Migration, model, relasi, enum, seeder | `php artisan migrate:fresh --seed` menghasilkan data |
| 3 | Action layer + endpoint list / detail / create + FormRequest | endpoint dapat dipanggil, status code sesuai bagian 8.1 |
| 4 | Sanctum + Policy + endpoint admin | non-admin menerima 403 |
| 5 | Seluruh test | `php artisan test` hijau |
| 6 | Next.js: list + filter via searchParams + detail | frontend membaca API |
| 7 | Next.js: form create + loading state + error state | alur user lengkap |
| 8 | Node stats service | `GET localhost:4000/stats` mengembalikan JSON |
| 9 | README, `docs/api.md`, `docs/decisions.md` | dokumentasi lengkap |

---

## 13. Dokumentasi

`README.md`:

```markdown
# Support Ticket System

## Tech Stack
## Arsitektur
## Setup
## Akun Demo
   admin@example.com / password
   user@example.com  / password
## API Endpoints
## Menjalankan Test
## Second Backend Task
## Batasan Scope
```

`docs/api.md` — kontrak lengkap tiap endpoint: request body, response body, status code, contoh.

`docs/decisions.md` — lima ADR, masing-masing 3–4 kalimat:

1. Polyglot monorepo, bukan microservice
2. Action layer, dan alasan tidak memakai Repository Pattern
3. SQLite sebagai database
4. Bearer token, bukan Sanctum SPA cookie mode
5. Validasi di sisi client dan server
