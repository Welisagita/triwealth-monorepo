import { Router } from 'express';
import { PortfolioController } from './portfolios.controller';
import { validate } from '../../middlewares/validate';
import { createPortfolioSchema, updatePortfolioSchema, topUpSchema } from './portfolios.schema';
import { authenticate } from '../../middlewares/auth';


const router = Router();
const portfolioController = new PortfolioController();

router.use(authenticate); 

/**
 * @swagger
 * /portfolios:
 *   get:
 *     summary: Mendapatkan semua portofolio milik user yang sedang login
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data portofolio
 *   post:
 *     summary: Membuat portofolio baru
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, balance]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dana Pensiun"
 *               balance:
 *                 type: number
 *                 example: 5000000
 *     responses:
 *       201:
 *         description: Portofolio berhasil dibuat
 */
router.get('/', portfolioController.getAll);
router.post('/', validate(createPortfolioSchema), portfolioController.create);

/**
 * @swagger
 * /portfolios/wealth-summary:
 *   get:
 *     summary: Mendapatkan kalkulasi total kekayaan (saldo) seluruh portofolio aktif
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengalkulasi total kekayaan
 */
router.get('/wealth-summary', portfolioController.getWealthSummary);

/**
 * @swagger
 * /portfolios/full-data:
 *   get:
 *     summary: Mendapatkan data lengkap portofolio, posisi aset, dan riwayat transaksi
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/full-data', portfolioController.getFullData);

/**
 * @swagger
 * /portfolios/topup:
 *   post:
 *     summary: Melakukan top-up saldo kas simulasi
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 */
router.post('/topup', validate(topUpSchema), portfolioController.topUp);
router.post('/withdraw', portfolioController.withdraw); // Opsional: tambahkan validasi skema jika mau

/**
 * @swagger
 * /portfolios/{id}:
 *   put:
 *     summary: Memperbarui portofolio (hanya pemilik)
 *     tags: [Portfolios]
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
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Portofolio berhasil diupdate
 *   delete:
 *     summary: Menghapus portofolio (hanya pemilik)
 *     tags: [Portfolios]
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
 *         description: Portofolio berhasil dihapus
 */
router.put('/:id', validate(updatePortfolioSchema), portfolioController.update);
router.delete('/:id', portfolioController.delete);



export default router;