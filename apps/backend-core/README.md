# TriWealth Backend Core 🚀

TriWealth Backend Core adalah REST API tingkat *Enterprise* yang dibangun menggunakan Node.js dan TypeScript. Aplikasi ini berfungsi sebagai tulang punggung untuk manajemen pengguna, portofolio finansial, dan modul edukasi, dengan fokus pada keamanan data, validasi ketat, dan arsitektur modular.

## 🛠️ Tech Stack Utama

- **Runtime & Framework:** Node.js, Express.js, TypeScript
- **Database & ORM:** PostgreSQL (via Docker), Prisma ORM
- **Keamanan & Autentikasi:** JSON Web Token (JWT), bcryptjs
- **Validasi Data:** Zod (v4 API)
- **Arsitektur:** Modular/Domain-Driven Design (DDD)

## 📂 Struktur Direktori (Mental Model)

Aplikasi ini menggunakan pendekatan **Modular**, di mana setiap fitur memiliki "rumah" sendiri.


apps/backend-core/
├── prisma/                 # Konfigurasi ORM & Skema Database (schema.prisma)
├── src/
│   ├── lib/                # Konfigurasi instance global (misal: prisma.ts)
│   ├── middlewares/        # Penjaga gerbang (auth.ts, error.ts, validate.ts)
│   ├── modules/            # Jantung aplikasi, dibagi per entitas
│   │   ├── users/          # Logika Pengguna (Routes, Controller, Service, Schema)
│   │   ├── portfolios/     # Logika Portofolio (Hanya bisa diakses pemilik)
│   │   └── education/      # Logika Konten Edukasi
│   └── app.ts              # File utama server (Entry Point)
├── .env                    # Variabel rahasia (TIDAK BOLEH di-commit ke Git)
└── package.json            # Daftar pustaka & script

# 🚀 Cara Menjalankan Aplikasi Lokal

## 1. Prasyarat Sistem
Node.js (v18 atau lebih baru)

Docker Desktop (untuk menjalankan PostgreSQL lokal)

npm atau pnpm

## 2. Persiapan Awal
Kloning repositori dan masuk ke folder backend-core, lalu instal dependensi:

Bash
npm install
Buat file .env di root folder dan isi dengan variabel berikut:

Code snippet
DATABASE_URL="postgresql://postgres:rahasia@localhost:5432/triwealth_dev?schema=public"
JWT_SECRET="super_rahasia_triwealth_2026"
PORT=3000

## 3. Menyiapkan Database
Nyalakan Docker, jalankan container database Anda, lalu sinkronkan skema Prisma:

Bash
// Melakukan migrasi struktur ke database
npx prisma migrate dev --name init

// Men-generate tipe TypeScript dari Prisma
npx prisma generate

## 4. Menjalankan Server
Bash
// Mode pengembangan (Auto-restart saat ada perubahan kode)
npm run dev

// Mode produksi
npm run build
npm start
Server akan berjalan di http://localhost:3000.

# 🔒 Sistem Keamanan (JWT & Otorisasi)
Semua rute kecuali /register, /login, dan publik GET dilindungi oleh authenticate middleware.

Klien harus mengirimkan header HTTP: Authorization: Bearer <TOKEN>.

Data Ownership: Modul seperti Portfolios dan modifikasi profil Users secara otomatis membaca identitas dari Token JWT. Pengguna A tidak akan pernah bisa mengakses atau mengubah data Pengguna B.

# 🛑 Penanganan Error (Error Handling)
Aplikasi ini menggunakan Centralized Error Handler.

Error dari dalam database (seperti duplikasi email P2002) otomatis dicegat dan diubah menjadi 409 Conflict.

Validasi data masuk dikawal ketat oleh Zod. Data cacat otomatis dibalas dengan 400 Bad Request yang berisi daftar field yang salah, mencegah aplikasi crash.