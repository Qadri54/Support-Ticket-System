# API Contract — `/api/v1`

Base URL: `http://localhost:8000/api/v1`

Semua response berformat JSON. Resource dibungkus dalam key `data` (konvensi
Laravel API Resource). Endpoint list bersifat paginated.

## Status codes

| Kondisi | Code |
|---|---|
| Resource dibuat | 201 |
| Read / update berhasil | 200 |
| Belum terautentikasi | 401 |
| Terautentikasi tapi bukan admin | 403 |
| Ticket tidak ditemukan | 404 |
| Validasi gagal | 422 |

## Bentuk error (konsisten, bawaan Laravel)

```json
{
  "message": "The subject field is required.",
  "errors": {
    "subject": ["The subject field is required."]
  }
}
```

---

## POST `/login`

Menerbitkan Bearer token via Sanctum. Tanpa auth.

**Request**

```json
{ "email": "admin@example.com", "password": "password" }
```

**Response `200`**

```json
{
  "token": "1|abcdef...",
  "user": { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "admin" }
}
```

**Error `422`** — kredensial salah atau field kosong.

---

## GET `/me`

User yang sedang terautentikasi. **Perlu Bearer token.**

**Headers**: `Authorization: Bearer <token>`

**Response `200`**

```json
{ "data": { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "admin" } }
```

**Error `401`** — tanpa token / token tidak valid.

---

## POST `/logout`

Mencabut (revoke) token akses saat ini. **Perlu Bearer token.**

**Response `200`**

```json
{ "message": "Logged out." }
```

---

## GET `/tickets`

List ticket, paginated (10 per halaman). Tanpa auth.

**Query params**

| Param | Contoh | Keterangan |
|---|---|---|
| `status` | `open` \| `in_progress` \| `resolved` | filter status (nilai lain diabaikan) |
| `page` | `2` | halaman |

**Response `200`**

```json
{
  "data": [
    {
      "id": 12,
      "subject": "Cannot log in",
      "description": "I keep getting a 500 error...",
      "status": "open",
      "status_label": "Open",
      "user": { "id": 2, "name": "Demo User", "email": "user@example.com", "role": "user" },
      "responses_count": 2,
      "created_at": "2026-07-24T09:00:00+00:00",
      "updated_at": "2026-07-24T09:00:00+00:00"
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "from": 1, "last_page": 2, "path": "...", "per_page": 10, "to": 10, "total": 15 }
}
```

---

## POST `/tickets`

Membuat ticket. Tanpa auth. Status awal selalu `open`.

**Request**

```json
{ "subject": "Cannot log in", "description": "Detail masalah..." }
```

Validasi (FormRequest): `subject` required, string, max 255. `description`
required, string, max 5000.

**Response `201`** + header `Location: /api/v1/tickets/{id}`

```json
{
  "data": {
    "id": 16,
    "subject": "Cannot log in",
    "description": "Detail masalah...",
    "status": "open",
    "status_label": "Open",
    "user": { "id": 2, "name": "Demo User", "email": "user@example.com", "role": "user" },
    "created_at": "2026-07-24T09:00:00+00:00",
    "updated_at": "2026-07-24T09:00:00+00:00"
  }
}
```

**Error `422`** — `subject` / `description` kosong.

---

## GET `/tickets/{id}`

Detail ticket termasuk relasi `responses`. Tanpa auth.

**Response `200`**

```json
{
  "data": {
    "id": 12,
    "subject": "Cannot log in",
    "description": "...",
    "status": "in_progress",
    "status_label": "In Progress",
    "user": { "id": 2, "name": "Demo User", "email": "user@example.com", "role": "user" },
    "responses": [
      {
        "id": 5,
        "body": "Sedang kami periksa.",
        "user": { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "admin" },
        "created_at": "2026-07-24T10:00:00+00:00"
      }
    ],
    "created_at": "2026-07-24T09:00:00+00:00",
    "updated_at": "2026-07-24T10:00:00+00:00"
  }
}
```

**Error `404`** — ticket tidak ada.

---

## PATCH `/tickets/{id}/status`

Mengubah status ticket. **Admin only** (`auth:sanctum` + Policy).

**Headers**: `Authorization: Bearer <token>`

**Request**

```json
{ "status": "in_progress" }
```

`status` harus salah satu dari `open`, `in_progress`, `resolved`, dan harus
mengikuti aturan transisi yang valid:

| Dari | Boleh ke |
|---|---|
| `open` | `in_progress`, `resolved` |
| `in_progress` | `open`, `resolved` |
| `resolved` | `in_progress` |

**Response `200`** — resource ticket (seperti GET detail, tanpa `responses`).

**Error**: `401` tanpa token · `403` bukan admin · `404` ticket tidak ada ·
`422` status invalid atau transisi tidak diperbolehkan.

---

## POST `/tickets/{id}/responses`

Menambahkan response ke ticket. **Admin only**.

**Headers**: `Authorization: Bearer <token>`

**Request**

```json
{ "body": "Sedang kami periksa." }
```

Validasi: `body` required, string, max 5000.

**Response `201`**

```json
{
  "data": {
    "id": 5,
    "body": "Sedang kami periksa.",
    "user": { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "admin" },
    "created_at": "2026-07-24T10:00:00+00:00"
  }
}
```

**Error**: `401` · `403` · `404` · `422`.

---

## Stats service (terpisah, port 4000)

## GET `/stats`

Membaca MySQL langsung, tidak memanggil API Laravel.

**Response `200`**

```json
{
  "total": 15,
  "by_status": { "open": 5, "in_progress": 5, "resolved": 5 },
  "avg_responses_per_ticket": 1.27,
  "generated_at": "2026-07-24T09:00:00.000Z"
}
```
