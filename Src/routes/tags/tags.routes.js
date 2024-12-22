import { Router } from "express";
import tagsController from "../../controllers/tags/tags.controller.js";
import { validateName } from "../../middlewares/check_name/name.middleware.js";

export const tags_router = Router()

/**
 * @swagger
 *   tags:
 *     name: Tags
 *     description: Tags bilan ishlash
 */

/**
 * @swagger
 * /tags/create:
 *   post:
 *     summary: Tag yaratish
 *     tags: [Tags]
 *     description: Yangi tag yaratish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: tech
 *     responses:
 *       201:
 *         description: Tag muvaffaqiyatli yaratildi
 */
tags_router.post("/create", validateName, tagsController.createTag);

/**
 * @swagger
 * /tags/get/all:
 *   get:
 *     summary: Barcha taglarni olish
 *     tags: [Tags]
 *     description: Taglarni sahifa va limit bilan olish
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
 *         description: Har sahifada ko'rsatiladigan taglar soni
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Taglar muvaffaqiyatli qaytarildi
 */
tags_router.get("/get/all", tagsController.getAllTags);

/**
 * @swagger
 * /tags/get/by/query:
 *   get:
 *     summary: Taglarni qidirish
 *     tags: [Tags]
 *     description: Taglar nomiga qarab qidirish
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Qidirilayotgan tag nomi
 *         required: true
 *         schema:
 *           type: string
 *           example: tech
 *     responses:
 *       200:
 *         description: Qidirish muvaffaqiyatli
 */
tags_router.get("/get/by/query", tagsController.getByQuery);

/**
 * @swagger
 * /tags/update/{id}:
 *   patch:
 *     summary: Tagni yangilash
 *     tags: [Tags]
 *     description: ID bo‘yicha tagni yangilash
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Yangilanadigan tagning ID raqami
 *         required: true
 *         schema:
 *           type: string
 *           example: "123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: newTagName
 *     responses:
 *       200:
 *         description: Yangilash muvaffaqiyatli
 *       404:
 *         description: Tag topilmadi
 */
tags_router.patch("/update/:id", validateName, tagsController.updateTag);