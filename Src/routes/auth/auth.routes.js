import { Router } from "express";
import authController from "../../controllers/auth/auth.controller.js";
import { validateLoginMiddleware, validateUserMiddleware, validateVerifyMiddleware } from "../../middlewares/check_auth/auth.middleware.js";
import { checkUserToken } from "../../tokens/user_token/user.token.js";

export const auth_router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Ro'yxatdan o'tish uchun telefon raqamiga kod yuborish
 *     tags: [Auth]
 *     description: Foydalanuvchi ro'yxatdan o'tishi uchun telefon raqamiga tasdiqlash kodi yuboriladi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+998974603262"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Kod yuborildi
 *       500:
 *         description: Server xatosi
 */
auth_router.post("/register", validateUserMiddleware, authController.register);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Kodni tasdiqlash
 *     tags: [Auth]
 *     description: Foydalanuvchi yuborilgan kodni tasdiqlaydi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verify_code:
 *                 type: string
 *                 example: "5555"
 *               phone_number: 
 *                   type: string,
 *                   example: "+998974603262"
 *     responses:
 *       200:
 *         description: Kod tasdiqlandi
 *       400:
 *         description: Kod noto'g'ri
 */
auth_router.post("/verify", validateVerifyMiddleware, authController.verify);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Foydalanuvchi kirish
 *     tags: [Auth]
 *     description: Foydalanuvchi telefon raqam va parol bilan tizimga kiradi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+998974603262"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Kirish muvaffaqiyatli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 lastName:
 *                   type: string
 *                   example: "Doe"
 *       401:
 *         description: Noto'g'ri login yoki parol
 */
auth_router.post("/login", validateLoginMiddleware, authController.login);

/**
 * @swagger
 * /auth/refresh/token:
 *   post:
 *     summary: Refresh token uchun
 *     tags: [Auth]
 *     description: Foydalanuvchi foydalanuvchilar refresh token uchun headersdan refreshToken yuborish kerak
 *     responses:
 *       200:
 *         description: Kod tasdiqlandi
 *       400:
 *         description: Kod noto'g'ri
 */
auth_router.post("/refresh/token", checkUserToken, authController.refreshToken)