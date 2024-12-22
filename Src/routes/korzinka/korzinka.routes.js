import { Router } from "express";
import korzinkaController from "../../controllers/korzinka/korzinka.controller.js";

/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: Buyurtmalar bilan ishlash uchun endpointlar
 */

export const korzinka_rotuer = Router();

/**
* @swagger
 * /cart/create:
 *   post:
 *     summary: Yangi korzinka yaratish
 *     tags: [Carts]
 *     description: Yangi korzinka yaratadi, agar foydalanuvchida allaqachon korzinka bo'lsa, xato beradi.
 *     responses:
 *       201:
 *         description: Korzinka yaratildi
 *       400:
 *         description: Korzinka allaqachon mavjud
 *       500:
 *         description: Server xatosi
 */
korzinka_rotuer.post("/create", korzinkaController.create)

    /**
     * @swagger
     * /cart/my:
     *   get:
     *     summary: Foydalanuvchining korzinka ma'lumotlarini olish
     *     tags: [Carts]
     * 
     *     description: Foydalanuvchining mavjud korzinka ma'lumotlarini ko'rsatadi.
     *     responses:
     *       200:
     *         description: Korzinka ma'lumotlari muvaffaqiyatli olindi
     *       404:
     *         description: Korzinka topilmadi
     *       500:
     *         description: Server xatosi
     */
    .get("/my", korzinkaController.getKorzinkaData)

    /**
     * @swagger
     * /cart/add/product:
     *   patch:
     *     summary: Korzinkaga mahsulot qo'shish
     *     tags: [Carts]
     *     description: Foydalanuvchining korzinkasiga yangi mahsulotlarni qo'shadi.
     *     parameters:
     *       - in: body
     *         name: products
     *         description: Qo'shmoqchi bo'lgan mahsulotlar
     *         schema:
     *           type: object
     *           properties:
     *             products:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   productId:
     *                     type: string
     *                   quantity:
     *                     type: integer
     *     responses:
     *       200:
     *         description: Mahsulotlar muvaffaqiyatli qo'shildi
     *       400:
     *         description: Mahsulot topilmadi yoki zaxira yetarli emas
     *       404:
     *         description: Korzinka topilmadi
     *       500:
     *         description: Server xatosi
     */
    .patch("/add/product", korzinkaController.addProductKarzinka)

    /**
     * @swagger
     * /cart/remove/product/{id}:
     *   delete:
     *     summary: Korzinkadan mahsulotni olib tashlash
     *     tags: [Carts]
     *     description: Foydalanuvchining korzinkasidan mahsulotni olib tashlash.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: Olib tashlanadigan mahsulotning ID raqami
     *     responses:
     *       200:
     *         description: Mahsulot muvaffaqiyatli olib tashlandi
     *       404:
     *         description: Mahsulot topilmadi yoki korzinka mavjud emas
     *       500:
     *         description: Server xatosi
     */
    .delete("/remove/product/:id", korzinkaController.removeProduct)