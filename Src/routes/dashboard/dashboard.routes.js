import { Router } from "express";
import orderController from "../../controllers/order/order.controller.js";
import usersController from "../../controllers/users/users.controller.js";
import dashboardController from "../../controllers/dashboard/dashboard.controller.js";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard bilan siteni nazorat qilish
 */

export const dashboard_routes = Router()

/**
 * @swagger
 * /dashboard/get/users:
 *   get:
 *     summary: Foydalanuvchilar jinsiga oid statistikani olish
 *     description: Ushbu API foydalanuvchilarning jinsiga oid umumiy sonini va foizlarini qaytaradi.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Foydalanuvchilar jinsiga oid statistikalar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: Umumiy foydalanuvchilar soni
 *                 maleCount:
 *                   type: integer
 *                   description: Erkak foydalanuvchilar soni
 *                 femaleCount:
 *                   type: integer
 *                   description: Ayol foydalanuvchilar soni
 *                 otherCount:
 *                   type: integer
 *                   description: Boshqa jinsdagi foydalanuvchilar soni
 *                 malePercentage:
 *                   type: string
 *                   description: Erkak foydalanuvchilarning foizi
 *                 femalePercentage:
 *                   type: string
 *                   description: Ayol foydalanuvchilarning foizi
 *                 otherPercentage:
 *                   type: string
 *                   description: Boshqa jinsdagi foydalanuvchilarning foizi
 *       500:
 *         description: Ichki server xatoligi
 */
dashboard_routes.get("/get/users", dashboardController.getUsersGender)

/**
 * @swagger
 * /dashboard/orders/data:
 *   get:
 *     summary: Buyurtmalar to'lov usullariga oid statistikani olish
 *     description: Ushbu API buyurtmalar to'lov usullari bo'yicha umumiy sonini va foizlarini qaytaradi.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Buyurtmalar statistikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paymentMethodOnline:
 *                     type: string
 *                     description: To'lov usulining nomi (masalan, "Kredit karta", "PayPal" va boshqalar)
 *                   count:
 *                     type: integer
 *                     description: Ushbu to'lov usulida amalga oshirilgan buyurtmalar soni
 *                   percentage:
 *                     type: string
 *                     description: To'lov usulining umumiy buyurtmalar ichidagi foizi
 *       500:
 *         description: Ichki server xatoligi
 */
dashboard_routes.get("/orders/data", dashboardController.getOrder)

/**
 * @swagger
 * /dashboard/order/delete/{id}:
 *   delete:
 *     summary: Buyurtmani o'chirish
 *     tags: [Dashboard]
 *     description: Ma'lum bir buyurtmani o'chirish
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Buyurtma ID-si
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:   
 *         description: Buyurtma muvaffaqiyatli o'chirildi
 *       404:
 *         description: Buyurtma topilmadi
 */
dashboard_routes.delete("/order/delete/:id", orderController.deleteById);

/**
 * @swagger
 * /dashboard/orders/get:
 *   get:
 *     summary: Buyurtmalarni qidirish
 *     tags: [Dashboard]
 *     description: Buyurtmalarni so'rovga asosan qidirish
 *     parameters:
 *       - name: userId
 *         in: query
 *         description: Foydalanuvchi ID-si
 *         required: false
 *         schema:
 *           type: string
 *       - name: productId
 *         in: query
 *         description: Mahsulot ID-si
 *         required: false
 *         schema:
 *           type: string
 *       - name: paid
 *         in: query
 *         description: To'langan holat
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Buyurtmalar muvaffaqiyatli qaytarildi
 */
dashboard_routes.get("/orders/get", orderController.findByQuery);

/**
 * @swagger
 * /dashboard/users/all:
 *   get:
 *     summary: Barcha foydalanuvchilarni sahifalar bilan olish
 *     tags: [Dashboard]
 *     description: Foydalanuvchilarni sahifa va limit yordamida olish
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Sahifa raqami
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Har sahifadagi elementlar soni
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli
 *       404:
 *         description: Ma'lumot topilmadi
 */
dashboard_routes.get("/users/all", usersController.getAll);