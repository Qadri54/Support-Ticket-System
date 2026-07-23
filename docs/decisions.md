# Architecture Decision Records

## ADR-1: Polyglot monorepo, bukan microservice

Ketiga aplikasi (Laravel API, Next.js web, Node stats) berada dalam satu repo
namun di-deploy independen dan tidak saling memanggil. Ini bukan microservice
karena tidak ada komunikasi antar-service dan hanya ada satu bounded context
(Ticket). Karena itu tidak ada service discovery, message broker, API gateway,
maupun distributed tracing — kompleksitas tersebut tidak sebanding untuk tiga
tabel. Monorepo cukup untuk berbagi dokumentasi dan menyederhanakan setup.

## ADR-2: Action layer, bukan Repository Pattern

Logika bisnis ditempatkan pada tiga Action class (`CreateTicket`,
`UpdateTicketStatus`, `AddTicketResponse`), masing-masing satu method `handle()`,
sehingga dapat diuji tanpa HTTP dan controller tetap tipis. Repository Pattern
sengaja dihindari: Eloquent sudah merupakan Active Record, sehingga membungkusnya
dengan interface repository hanya menambah indirection tanpa manfaat nyata pada
skala ini. Batas abstraksi ditetapkan tepat satu layer di atas Eloquent.

## ADR-3: MySQL sebagai database

Spesifikasi awal memilih SQLite, tetapi atas permintaan proyek diganti ke
**MySQL 8.0**. Migration ditulis portabel (tanpa fitur spesifik vendor) sehingga
perpindahan ini tidak mengubah kode aplikasi — hanya konfigurasi `.env`.
Konsekuensinya: service stats tidak lagi membaca file SQLite melainkan terhubung
langsung ke MySQL via driver `mysql2`, dan test suite berjalan di database MySQL
khusus (`Support_Ticket_System_test`) alih-alih SQLite in-memory.

## ADR-4: Bearer token, bukan Sanctum SPA cookie mode

Autentikasi admin memakai Sanctum personal access token (Bearer), bukan mode SPA
berbasis cookie. Cookie mode membutuhkan sibling domain, endpoint CSRF cookie, dan
konfigurasi `stateful domains` yang menambah kompleksitas untuk aplikasi lokal.
Dengan Bearer token, API tetap stateless. Di sisi Next.js token tetap disimpan
sebagai httpOnly cookie yang di-set oleh Route Handler, lalu Server Component
membacanya dan meneruskannya sebagai header `Authorization: Bearer <token>` — token
tidak pernah tersentuh JavaScript client.

## ADR-5: Validasi di sisi client dan server

Form create ticket divalidasi di dua tempat: Zod pada client (umpan balik instan
per field, tanpa round-trip) dan Laravel FormRequest pada server (sumber kebenaran,
tidak dapat dilewati). Keduanya wajib, bukan salah satu: validasi client
meningkatkan UX namun tidak dapat dipercaya, sementara validasi server menjamin
integritas. Error 422 dari server ditampilkan per field melalui bentuk error yang
sama dengan hasil Zod, sehingga UI konsisten. `ValidationException` dibiarkan
diproses handler bawaan Laravel dan tidak ditangkap `try/catch` generik.
