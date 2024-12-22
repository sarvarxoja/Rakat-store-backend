import { Router } from "express";
import { uploadAvatar } from "../../utils/avatar.multer.js";
import usersController from "../../controllers/users/users.controller.js";

export const users_router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Qidiruv uchun foydalanuvchi ma'lumotlarini olish
 *     tags: [Users]
 *     description: Foydalanuvchilarni qidiruv so'roviga qarab qidirish
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Qidirilayotgan so'z
 *         required: true
 *         schema:
 *           type: string
 *           example: "John"
 *     responses:
 *       200:
 *         description: Qidiruv muvaffaqiyatli
 *       400:
 *         description: So'rov noto'g'ri
 */
users_router.get("/search", usersController.getByQuery);

/**
 * @swagger
 * /users/get/{id}:
 *   get:
 *     summary: ID orqali foydalanuvchi ma'lumotlarini olish
 *     tags: [Users]
 *     description: Ma'lum bir ID bo'yicha foydalanuvchi ma'lumotlarini olish
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Foydalanuvchi ID-si
 *         required: true
 *         schema:
 *           type: string
 *           example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Ma'lumot muvaffaqiyatli qaytarildi
 *       404:
 *         description: Ma'lumot topilmadi
 */
users_router.get("/get/:id", usersController.getById);

/**
 * @swagger
 * /users/update/me:
 *   patch:
 *     summary: Ozingizning malumotlaringizni update qilish
 *     tags: [Users]
 *     description: Bu yerga faqat request va kerakli malumotlar yuborilsa boldi sizning kimligingizni tokendan bilib sizni malumotingizni yangilaydi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "sarvar"
 *     responses:
 *       200:
 *         description: Ma'lumot muvaffaqiyatli yangilandi
 *       404:
 *         description: User Ma'lumot topilmadi
 */
users_router.patch("/update/me", uploadAvatar.single('avatar'), usersController.updateMe)

/**
 * @swagger
 * /users/update/my/password:
 *   patch:
 *     tags: [Users]
 *     summary: Admin parolini yangilash
 *     description: Ushbu yo'l, adminning eski parolini va yangi parolini taqdim etish orqali parolni yangilashga imkon beradi.
 *     operationId: updateMyPassword
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Adminning hozirgi paroli.
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 description: Admin yangi o'rnatmoqchi bo'lgan parol.
 *                 example: "newPassword456"
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 myData:
 *                   type: object
 *                   description: Yangilangan admin ma'lumotlari
 *                 accessToken:
 *                   type: string
 *                   description: Yangi olingan kirish tokeni
 *                 adminRefreshToken:
 *                   type: string
 *                   description: Yangi olingan refresh tokeni
 *                 msg:
 *                   type: string
 *                   description: Muvaffaqiyatli yangilash haqida xabar
 *                   example: "Ma'lumot muvaffaqiyatli yangilandi"
 *                 status:
 *                   type: integer
 *                   description: HTTP status kodi
 *                   example: 200
 *       400:
 *         description: Noto'g'ri so'rov, kirish parametrlaridagi xatolik (masalan, parol uzunligi yoki bo'sh maydonlar)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Xatolik haqida xabar
 *                 status:
 *                   type: integer
 *                   description: HTTP status kodi
 *                   example: 400
 *       401:
 *         description: Avtorizatsiya xatosi, noto'g'ri eski parol
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Xatolik haqida xabar
 *                 status:
 *                   type: integer
 *                   description: HTTP status kodi
 *                   example: 401
 *       500:
 *         description: Ichki server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Xatolik haqida xabar
 *                 status:
 *                   type: integer
 *                   description: HTTP status kodi
 *                   example: 500
 */
users_router.patch("/update/my/password", usersController.updateMyPassword)