import { Router } from 'express';
import { EducationController } from './education.controller';
import { validate } from '../../middlewares/validate';
import { createEducationSchema, updateEducationSchema } from './education.schema';
import { authenticate } from '../../middlewares/auth'; // <-- Tambahkan import ini

const router = Router();
const educationController = new EducationController();

/**
 * @swagger
 * /education:
 *   get:
 *     summary: Mendapatkan daftar semua materi edukasi finansial
 *     tags: [Education]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar materi edukasi
 */
router.get('/', educationController.getAll);

/**
 * @swagger
 * /education:
 *   post:
 *     summary: Menambahkan materi edukasi baru (Butuh Token)
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, type, xpReward]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Cara Cepat Membangun Dana Darurat"
 *               content:
 *                 type: string
 *                 example: "Dana darurat sangat penting untuk menghindari utang saat krisis..."
 *               type:
 *                 type: string
 *                 enum: [ARTICLE, VIDEO]
 *                 example: "ARTICLE"
 *               xpReward:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Materi edukasi berhasil dibuat
 */
// ✅ Satpam (authenticate) sudah ditambahkan di sini
router.post('/', authenticate, validate(createEducationSchema), educationController.create);
router.get('/:id', educationController.getById); // <-- TAMBAHKAN BARIS INI

/**
 * @swagger
 * /education/{id}:
 *   put:
 *     summary: Memperbarui materi edukasi (Butuh Token)
 *     tags: [Education]
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
 *               title:
 *                 type: string
 *                 example: "Cara Cepat Membangun Dana Darurat (Update)"
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ARTICLE, VIDEO]
 *               xpReward:
 *                 type: number
 *     responses:
 *       200:
 *         description: Materi edukasi berhasil diperbarui
 *   delete:
 *     summary: Menghapus materi edukasi (Butuh Token)
 *     tags: [Education]
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
 *         description: Materi edukasi berhasil dihapus
 */
// ✅ Satpam (authenticate) juga sudah ditambahkan di rute PUT dan DELETE
router.put('/:id', authenticate, validate(updateEducationSchema), educationController.update);
router.delete('/:id', authenticate, educationController.delete);

export default router;