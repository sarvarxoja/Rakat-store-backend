import { Router } from "express";
import { checkUserToken } from "../../tokens/user_token/user.token.js";
import { checkWorkerToken } from "../../tokens/worker_token/worker.token.js";
import notificationController from "../../controllers/notifications/notification.controller.js";
import { checkNotificationCreate } from "../../middlewares/notification/notifications.middleware.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";

export const notification_router = Router();

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Bildirishnomalar bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /notifications/create:
 *   post:
 *     summary: Yangi bildirishnoma yaratish
 *     tags: [Notification]
 *     description: Maxsus foydalanuvchi yoki barcha foydalanuvchilar uchun yangi bildirishnoma yaratish.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Tizimning texnik ta'minoti kechqurun o'n ikkida amalga oshiriladi."
 *               userId:
 *                 type: string
 *                 example: "60d5f2e2f0a8c7bc0f9e6ed3"
 *               forAllUsers:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Yangi bildirishnoma muvaffaqiyatli yaratildi
 *       400:
 *         description: Yaroqsiz yoki yo'q bo'lgan ma'lumotlar
 */
notification_router.post(
    "/create",
    checkWorkerToken,
    checkNotificationCreate,
    notificationController.create
);

/**
 * @swagger
 * /notifications/delete/{id}:
 *   delete:
 *     summary: Bildirishnomani o'chirish
 *     tags: [Notification]
 *     description: Berilgan IDga ega bo'lgan bildirishnomani o'chirish.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: O'chirilishi kerak bo'lgan bildirishnoma IDsi
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bildirishnoma muvaffaqiyatli o'chirildi
 *       404:
 *         description: Bildirishnoma topilmadi
 */
notification_router.delete(
    "/delete/:id",
    checkAdminToken,
    notificationController.notificationDelete
);

/**
 * @swagger
 * /notifications/my:
 *   get:
 *     summary: Mening bildirishnomalarimni olish
 *     tags: [Notification]
 *     description: Foydalanuvchiga tegishli barcha bildirishnomalarni olish.
 *     responses:
 *       200:
 *         description: Mening bildirishnomalarim muvaffaqiyatli olindi
 *       404:
 *         description: Bildirishnomalar topilmadi
 */
notification_router.get(
    "/my",
    checkUserToken,
    notificationController.getMyNotifications
);

/**
 * @swagger
 * /notifications/all:
 *   get:
 *     summary: Barcha bildirishnomalarni olish
 *     tags: [Notification]
 *     description: Barcha bildirishnomalarni olish.
 *     responses:
 *       200:
 *         description: Barcha bildirishnomalar muvaffaqiyatli qaytarildi
 *       404:
 *         description: Bildirishnomalar topilmadi
 */
notification_router.get(
    "/notifications/all",
    notificationController.notificationsAll
);

/**
 * @swagger
 * /notifications/get/{id}:
 *   get:
 *     summary: Maxsus bildirishnoma olish
 *     tags: [Notification]
 *     description: Berilgan IDga ega bo'lgan bildirishnomani olish.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Bildirishnoma IDsi
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bildirishnoma muvaffaqiyatli olindi
 *       404:
 *         description: Bildirishnoma topilmadi
 */
notification_router.get(
    "/get/:id",
    checkUserToken,
    notificationController.getById
);