import { Router } from "express";
import orderController from "../../controllers/order/order.controller.js";
import { checkWorkerToken } from "../../tokens/worker_token/worker.token.js";
import { checkUserToken } from "../../tokens/user_token/user.token.js";

export const order_router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Buyurtmalar bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /order/create:
 *   post:
 *     summary: Yangi buyurtma yaratish
 *     tags: [Orders]
 *     description: Foydalanuvchi yangi buyurtma yaratadi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60c72b2f9b1d4c4370e8d123"
 *               paid:
 *                 type: boolean
 *                 example: true
 *               paymentMethodOnline:
 *                 type: boolean
 *                 example: true
 *               productQuantity:
 *                 type: number
 *                 example: 2
 *               location:
 *                 type: string
 *                 example: "Tashkent"
 *     responses:
 *       201:
 *         description: Buyurtma muvaffaqiyatli yaratildi
 *       400:
 *         description: Stock miqdori yetarli emas
 *       404:
 *         description: Mahsulot topilmadi
 */
order_router.post("/create", orderController.create);

/**
 * @swagger
 * /orders/get/query:
 *   get:
 *     summary: Buyurtmalarni so'rovga ko'ra qidirish
 *     tags: [Orders]
 *     description: So'rov parametrlariga asoslanib buyurtmalarni qidirish.
 *     parameters:
 *       - in: query
 *         name: canceled
 *         required: false
 *         description: Buyurtma bekor qilinganmi (true/false)
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: paid
 *         required: false
 *         description: Buyurtma to'langanmi (true/false)
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: paymentMethodOnline
 *         required: false
 *         description: Onlayn to'lov usuli mavjudmi (true/false)
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: userId
 *         required: false
 *         description: Foydalanuvchi IDsi (masalan, "60d5f2e2f0a8c7bc0f9e6ed3")
 *         schema:
 *           type: string
 *       - in: query
 *         name: productId
 *         required: false
 *         description: Mahsulot IDsi (masalan, "60d5f2e2f0a8c7bc0f9e6ed3")
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: false
 *         description: |
 *           Buyurtma holati. Mavjud holatlar:
 *             - qabul_qilinmagan
 *             - jarayonda
 *             - yetkazilgan
 *         schema:
 *           type: string
 *           enum:
 *             - qabul_qilinmagan
 *             - jarayonda
 *             - yetkazilgan
 *       - in: query
 *         name: [any other query parameter]
 *         required: false
 *         description: Qo'shimcha so'rov parametrlarini kiritish mumkin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Buyurtmalar muvaffaqiyatli topildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       canceled:
 *                         type: boolean
 *                       paid:
 *                         type: boolean
 *                       paymentMethodOnline:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Serverda xatolik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Serverda xatolik"
 */
order_router.get("/get/query", checkWorkerToken, orderController.findByQuery);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Mening buyurtmalarimni olish
 *     description: Foydalanuvchining buyurtmalarini sahifalash (pagination) bilan qaytaradi.
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sahifa raqami (default - 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sahifadagi buyurtmalar soni (default - 10).
 *     responses:
 *       200:
 *         description: Buyurtmalar muvaffaqiyatli topildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 myOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 status:
 *                   type: integer
 *       404:
 *         description: Buyurtmalar topilmadi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 status:
 *                   type: integer
 *       500:
 *         description: Ichki server xatosi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 status:
 *                   type: integer
 */

order_router.get("/my", checkUserToken, orderController.getMyOrders)

/**
 * @swagger
 * /order/get/by/{id}:
 *   get:
 *     summary: ID bo'yicha buyurtma ma'lumotlarini olish
 *     tags: [Orders]
 *     description: ID orqali ma'lum bir buyurtma ma'lumotlarini olish, faqat admin va orderni yaratgan foydalanuvchiga korinadi
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Buyurtma ID-si
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ma'lumot muvaffaqiyatli qaytarildi
 *       404:
 *         description: Buyurtma topilmadi
 */
order_router.get("/get/by/:id", orderController.orderFindById);