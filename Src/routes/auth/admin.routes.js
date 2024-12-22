import { Router } from "express";
import adminController from "../../controllers/auth/admin.controller.js";
import { validateLoginMiddleware } from "../../middlewares/check_auth/auth.middleware.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";

/**
 * @swagger
 * tags:
 *   name: AdminAuth
 *   description: Admin autentifikatsiyasi uchun endpointlar
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin tizimiga kirish
 *     tags: [AdminAuth]
 *     description: Adminning tizimga kirishi uchun telefon raqami va parol bilan login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+998901234567"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Kirish muvaffaqiyatli, access token qaytarildi
 *       401:
 *         description: Telefon raqami yoki parol noto'g'ri
 */
export const adminAuthRouter = Router();

adminAuthRouter.post("/login", validateLoginMiddleware, adminController.adminLogin);

/**
 * @swagger
 * /admin/refresh/token:
 *   post:
 *     summary: Admin refresh token uchun
 *     tags: [AdminAuth]
 *     description: Admin refresh token uchun headersdan refreshToken yuborish kerak
 *     responses:
 *       200:
 *         description: Kod tasdiqlandi
 *       400:
 *         description: Kod noto'g'ri
 */
adminAuthRouter.post("/refresh/token", checkAdminToken, adminController.adminRefreshToken)

/**
 * @swagger
 * /admin/update/password:
 *   patch:
 *     tags: [AdminAuth]
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

adminAuthRouter.patch("/update/password", checkAdminToken, adminController.updateMyPassword)
