import { Router } from "express";
import { uploadCategory } from "../../utils/category.multer.js";
import { validateName } from "../../middlewares/check_name/name.middleware.js";
import categoryController from "../../controllers/category/category.controller.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Categories bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     description: Creates a new category in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               description:
 *                 type: string
 *                 example: "Devices and gadgets related to electronics"
 *     responses:
 *       201:
 *         description: Category created successfully
 */
export const category_router = Router();

category_router.post(
  "/create",
  checkAdminToken,
  uploadCategory.single("category_img"),
  validateName,
  categoryController.createCategory
);

/**
 * @swagger
 * /category/get/all:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     description: Fetches all available categories from the database
 *     responses:
 *       200:
 *         description: Successfully fetched all categories
 */
category_router.get("/get/all", categoryController.getAllCategory);

/**
 * @swagger
 * /category/get/popular:
 *   get:
 *     summary: categoryalar eng top bolganlari
 *     tags: [Categories]
 *     description: admin tomonidan belgilangan categoyalar
 *     responses:
 *       200:
 *         description: Successfully fetched all categories
 */

category_router.get("/get/popular", categoryController.getTopCategories);

/**
 * @swagger
 * /category/get/by/query:
 *   get:
 *     summary: Get categories by query
 *     tags: [Categories]
 *     description: Fetches categories based on specific query parameters
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Category name to filter by
 *     responses:
 *       200:
 *         description: Successfully fetched categories by query
 */
category_router.get("/get/by/query", categoryController.getByQuery);

/**
 * @swagger
 * /category/update/{id}:
 *   patch:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     description: Updates the details of a specific category by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Category Name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
category_router.patch(
  "/update/:id",
  checkAdminToken,
  validateName,
  categoryController.updateCategory
);

category_router.get("/get/by/:id", categoryController.getCategoryById);
