import { Router } from 'express';
import { UserController } from './users.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth'; 
import { createUserSchema, updateUserSchema, loginSchema } from './users.schema'; 
import { uploadKycMiddleware } from '../../middlewares/upload';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Mendapatkan daftar semua pengguna (mendukung Pagination & Filter)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Nomor halaman (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah data per halaman (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan nama
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kycStatus (contoh PENDING, PENDING_VERIFICATION)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */

// --- PUBLIC ROUTES ---
router.get('/', userController.getAll);

// Optional authentication middleware just to extract user info if present (for checking SuperAdmin)
const optionalAuthenticate = (req: any, res: any, next: any) => {
    authenticate(req, res, (err: any) => {
        if (err) req.user = undefined; // Ignore auth error, proceed as guest
        next();
    });
};

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Mendaftarkan pengguna baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               riskProfile:
 *                 type: string
 *                 enum: [CONSERVATIVE, MODERATE, AGGRESSIVE]
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 */
router.post('/register', validate(createUserSchema), userController.create);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login untuk mendapatkan Token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil dan mengembalikan token
 */

router.post('/login', validate(loginSchema), userController.login); 

// --- PROTECTED DASHBOARD ROUTES ---
router.get('/admins', authenticate, userController.getAdmins);
router.get('/stats', authenticate, userController.getStats);

// 🛑 RUTE UPLOAD KYC (Wajib bawa Token JWT dan File Dokumen)
// "document" adalah nama field form-data yang harus dikirim dari frontend

/**
 * @swagger
 * /users/kyc:
 *   post:
 *     summary: Upload dokumen KYC (KTP/Identitas)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Dokumen berhasil diunggah
 */
// 🛑 RUTE UPLOAD KYC
// --- PROTECTED KYC ROUTE ---
router.post('/kyc', authenticate, uploadKycMiddleware.single('document') as any, userController.uploadKyc);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Mendapatkan profil pengguna berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mengambil profil
 */
router.get('/:id', authenticate, userController.getProfile);

// 🛑 RUTE TERKUNCI: Wajib bawa Token JWT
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Memperbarui profil pengguna (Hanya profil sendiri)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               riskProfile:
 *                 type: string
 *                 enum: [CONSERVATIVE, MODERATE, AGGRESSIVE]
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *   delete:
 *     summary: Menghapus akun pengguna (Hanya akun sendiri)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 */
router.put('/:id', authenticate, validate(updateUserSchema), userController.update);

router.delete('/:id', authenticate, userController.delete);

export default router;