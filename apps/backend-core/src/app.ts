import express from 'express';
import cors from 'cors';

// Import Swagger
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';

// Impor semua rute dari masing-masing modul
import userRoutes from './modules/users/users.routes';
import portfolioRoutes from './modules/portfolios/portfolios.routes';
import educationRoutes from './modules/education/education.routes';
import watchlistRoutes from './modules/watchlist/watchlist.routes';
import tradingRoutes from './modules/trading/trading.routes';
import communityRoutes from './modules/community/community.routes';

import { errorHandler } from './middlewares/error';

const app = express();

// Konfigurasi CORS Dinamis (Jika FRONTEND_URL belum disetel, izinkan sementara untuk tahap testing awal)
const corsOptions = process.env.FRONTEND_URL
    ? {
          origin: process.env.FRONTEND_URL.split(',').map((url) => url.trim()),
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
      }
    : {};

app.use(cors(corsOptions));
app.use(express.json());

// 📂 BUKA AKSES FOLDER UPLOADS KE PUBLIK
app.use('/uploads', express.static('public/uploads'));

// ✅ HEALTH CHECK ROUTE (Untuk verifikasi cepat di Cloud Run)
app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'TriWealth Backend Core is running',
        environment: process.env.NODE_ENV || 'development',
    });
});

// 🌐 RUTE HALAMAN DOKUMENTASI (SWAGGER UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Daftarkan rute API
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/trading', tradingRoutes);
app.use('/api/v1/community', communityRoutes);

// 🛑 GLOBAL ERROR HANDLER HARUS DI SINI (Paling Bawah)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] TriWealth Backend Core running on http://0.0.0.0:${PORT}`);
    console.log(`[Swagger] API Documentation available at http://0.0.0.0:${PORT}/api-docs`);
});