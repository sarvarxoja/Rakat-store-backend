import { Router } from "express";
import commentsController from "../../controllers/comments/comments.controller.js";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comments bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /comments/create/{id}:
 *   post:
 *     summary: Mahsulotga izoh qo'shish
 *     tags: [Comments]
 *     description: Mahsulotga izoh va reyting qo'shish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Mahsulot IDsi
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Izoh matni
 *               numberOfRatings:
 *                 type: number
 *                 description: Reyting soni
 *     responses:
 *       201:
 *         description: Izoh muvaffaqiyatli yaratildi
 *       400:
 *         description: Izoh yaratishda xatolik (bir marta izoh yozilgan bo'lsa)
 */
export const comment_router = Router();

comment_router.post("/create/:id", commentsController.create);

/**
 * @swagger
 * /comments/find/{id}:
 *   get:
 *     summary: Mahsulotga tegishli izohlarni qidirish
 *     tags: [Comments]
 *     description: Mahsulotga tegishli izohlar va sahifalashni qo'llab-quvvatlash
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Mahsulot IDsi
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Sahifa raqami
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Bir sahifada ko'rsatiladigan izohlar soni
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Izohlar muvaffaqiyatli topildi
 *       500:
 *         description: Server xatosi
 */
comment_router.get("/find/:id", commentsController.findComments);
