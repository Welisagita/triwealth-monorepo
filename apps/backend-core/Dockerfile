FROM node:22-alpine

# Tambahkan OpenSSL (Dibutuhkan oleh mesin Prisma di lingkungan Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Salin package.json dan install dependensi
COPY package*.json ./
RUN npm install --force

# Salin seluruh kode aplikasi (termasuk folder prisma & prisma7.config.ts)
COPY . .

# Cetak Prisma Client setelah semua file konfigurasi tersedia
RUN npx prisma generate

# Standar port Google Cloud Run
EXPOSE 8080

# Jalankan server mode produksi (tanpa watch)
CMD ["npm", "start"]