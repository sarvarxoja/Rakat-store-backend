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

order_router.get("/get/query", checkWorkerToken, orderController.findByQuery);
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