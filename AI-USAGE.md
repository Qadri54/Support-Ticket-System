# AI Usage

Dokumen ini menjelaskan bagaimana AI digunakan dalam pengerjaan proyek Support
Ticket System, sesuai permintaan transparansi.

## Alat AI yang digunakan

- **Claude Code** (Anthropic) — agentic CLI yang dijalankan di terminal, dengan
  model **Claude Opus**. Dipakai untuk scaffolding, menulis kode, menjalankan
  perintah (composer, artisan, npm), menjalankan test, dan menyusun dokumentasi.

Tidak ada alat AI lain (mis. Copilot, ChatGPT terpisah) yang dipakai untuk proyek
ini.

## Tugas yang dibantu AI

AI membantu pada sebagian besar implementasi, dengan arahan dan keputusan tetap di
tangan saya (mis. keputusan mengganti database dari SQLite ke **MySQL**, penamaan
database, dan cakupan fitur admin):

- **Setup & scaffolding** — inisialisasi monorepo, `laravel new`,
  `create-next-app`, konfigurasi `.env`, CORS, dan Makefile.
- **Laravel API** — enum (`TicketStatus`, `UserRole`) beserta aturan transisi,
  migration, model + relasi, factory, seeder, Action layer (`CreateTicket`,
  `UpdateTicketStatus`, `AddTicketResponse`), FormRequest, Policy, API Resource,
  Controller, routing `/api/v1`, dan autentikasi Bearer token via Sanctum.
- **Testing** — Pest: unit (enum + transisi), integration, validation,
  authorization, dan auth (login/me/logout).
- **Next.js frontend** — Server Component untuk pembacaan data, filter status via
  URL `searchParams`, form create (Server Action + Zod), halaman detail + thread,
  loading/error state, fitur admin (login, ubah status, tambah response),
  notifikasi toast beranimasi, dan modal konfirmasi logout.
- **Node stats service** — Express + `mysql2`, membaca MySQL langsung.
- **Dokumentasi** — `README.md`, `docs/api.md`, `docs/decisions.md` (ADR).

## Contoh output AI yang salah / perlu diperbaiki

Beberapa kali output AI keliru dan perlu koreksi. Dua contoh nyata dari proyek ini:

### 1. Tipe return controller yang salah (tertangkap oleh test)

AI awalnya menulis method `store()` dan `TicketResponseController::store()` dengan
tipe return `Illuminate\Http\Response`:

```php
public function store(StoreTicketRequest $request, CreateTicket $action): Response
{
    return TicketResource::make($ticket)->response()->setStatusCode(201) ...;
}
```

Padahal `->response()` mengembalikan `Illuminate\Http\JsonResponse`, bukan
`Response`. Akibatnya endpoint create mengembalikan **HTTP 500** (`TypeError`).
Ini **langsung terdeteksi saat `php artisan test`** — 3 test gagal dengan pesan
"Expected response status code [201] but received 500". Perbaikannya mengganti
tipe return menjadi `JsonResponse`. Ini contoh bagus kenapa test otomatis penting
untuk memverifikasi kode hasil AI.

### 2. Tombol logout tidak muncul setelah login (tertangkap saat uji manual)

AI membuat `LoginForm` yang setelah login memanggil `router.refresh()` +
`router.push("/")`. Ternyata header di root layout (komponen persistent) tetap
menampilkan state "belum login" karena Router Cache Next.js — tombol **Log out**
tidak muncul. Bug ini saya temukan saat **mencoba aplikasi di browser**.
Solusinya mengganti soft-navigation dengan navigasi penuh
(`window.location.assign("/")`) agar server merender ulang header dengan cookie
baru. Kasus ini menunjukkan bahwa test otomatis saja tidak cukup — pengujian
manual di browser tetap perlu.

Selain itu, beberapa kode frontend awal melanggar aturan lint React 19
(`set-state-in-effect`, akses `ref` saat render) dan harus ditulis ulang agar
lolos ESLint.

## Cara meninjau & menguji kode hasil AI

Setiap output AI saya tinjau dan uji, tidak diterima mentah-mentah:

1. **Membaca setiap file** yang dihasilkan sebelum menerimanya, memastikan sesuai
   spesifikasi dan tidak menambah dependency/abstraksi yang dilarang.
2. **Test otomatis** — `php artisan test` (22 test Pest: unit, integration,
   validation, authorization, auth). Ini yang menangkap bug tipe return di atas.
3. **Type checking & linting frontend** — `tsc --noEmit` (strict, tanpa `any`),
   ESLint, dan `next build` untuk memastikan build produksi lolos.
4. **Smoke test API secara langsung** dengan `curl` — memverifikasi status code
   sesuai kontrak: login (token), list (paginated + filter), create (201 +
   header `Location`), admin PATCH (200), transisi invalid (422), tanpa token
   (401), non-admin (403), dan ticket tidak ada (404).
5. **Verifikasi database** dengan query SQL langsung ke MySQL (jumlah user,
   distribusi status ticket, response) untuk memastikan migration + seeder benar.
6. **Uji manual di browser** pada `http://localhost:3000` — alur user (list,
   filter, create, detail) dan alur admin (login, ubah status, tambah response,
   logout). Uji inilah yang menemukan bug tombol logout.
7. **Cek keamanan dasar** — memastikan `.env`, `.env.local`, dan kredensial tidak
   ter-commit (masuk `.gitignore`), serta tidak ada `any` di TypeScript.
8. **Commit per fase** sehingga setiap tahap berada dalam kondisi yang dapat
   dijalankan dan mudah ditinjau ulang.
