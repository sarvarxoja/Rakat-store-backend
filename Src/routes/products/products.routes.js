import { Router } from "express";
import { upload } from "../../utils/multer.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";
import productsController from "../../controllers/products/products.controller.js";
import { validateProductCreate, validateProductUpdate } from "../../middlewares/check_product/product.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products bilan ishlash uchun endpointlar
 */

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: Create a new product with necessary details, images, and descriptions.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Product"
 *               short_description:
 *                 type: string
 *                 example: "A short description of the product."
 *               description:
 *                 type: string
 *                 example: "A more detailed product description."
 *               stock_quantity:
 *                 type: number
 *                 example: 50
 *               price:
 *                 type: number
 *                 example: 1000
 *               discount:
 *                 type: number
 *                 example: 10
 *               sale_status:
 *                 type: boolean
 *                 example: true
 *               tags:
 *                 type: string
 *                 example: "electronics, gadgets"
 *               category:
 *                 type: string
 *                 example: "1,2"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               mainImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid or missing images or mainImage
 */

export const products_router = Router();


products_router.post(
    "/create",
    checkAdminToken,
    upload.fields([{ name: "images" }, { name: "mainImage", maxCount: 1 }]),
    validateProductCreate,
    productsController.create
);

/**
 * @swagger
 * /products/get/by/{id}:
 *   get:
 *     summary: Get a product by its ID
 *     tags: [Products]
 *     description: Fetch a specific product by its unique identifier.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved product
 *       404:
 *         description: Product not found
 */
products_router.get("/get/by/:id", productsController.getById);

/**
 * @swagger
 * /products/get/query:
 *   get:
 *     summary: Query products
 *     tags: [Products]
 *     description: Filter and fetch products based on provided query parameters.
 *     parameters:
 *       - in: query
 *         name: name
 *         description: Search by product name
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: saleStatus
 *         description: Filter by sale status
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: discount
 *         description: Filter by discount
 *         schema:
 *           type: number
 *       - in: query
 *         name: category
 *         description: Filter by category IDs
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         description: Filter by tags
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched query results
 */
products_router.get("/get/query", productsController.getByQuery);

/**
 * @swagger
 * /products/update/{id}:
 *   patch:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     description: Updates allowed fields of a specific product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               short_description:
 *                 type: string
 *               description:
 *                 type: string
 *               stock_quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               saleStatus:
 *                 type: boolean
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product successfully updated
 *       400:
 *         description: Invalid data provided
 *       404:
 *         description: Product not found
 */
products_router.patch("/update/:id", checkAdminToken, productsController.updateById);

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     description: Deletes a specific product by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
products_router.delete("/delete/:id", checkAdminToken, validateProductUpdate, productsController.deleteById);

/**
 * @swagger
 * /products/get/popular:
 *   get:
 *     summary: "get popular products"
 *     tags: [Products]
 *     description: Trenddagi productlarni korish.
 *     responses:
 *       200:
 *         description: "productlar topildi"
 */
products_router.get("/get/popular", productsController.getPopularProduct)

/**
 * @swagger
 * /products/get/discounted:
 *   get:
 *     summary: "Chegirma mavjud bo'lgan tasodifiy mahsulotlarni olish"
 *     tags: [Products]
 *     description: "Chegirma qiymati 0 dan katta bo'lgan mahsulotlarni olish va ularni tasodifiy ravishda aralashtirish."
 *     responses:
 *       200:
 *         description: "Chegirma bilan mahsulotlar muvaffaqiyatli olindi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productsWithDiscount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: "Mahsulotning identifikatori"
 *                       name:
 *                         type: string
 *                         description: "Mahsulotning nomi"
 *                       price:
 *                         type: number
 *                         description: "Mahsulotning narxi"
 *                       discount:
 *                         type: number
 *                         description: "Chegirma foizi"
 *                       description:
 *                         type: string
 *                         description: "Mahsulot tavsifi"
 *                       createdAt:
 *                         type: string
 *                         description: "Mahsulot yaratish sanasi"
 *                       updatedAt:
 *                         type: string
 *                         description: "Mahsulotni yangilash sanasi"
 *                 status:
 *                   type: integer
 *                   description: "Javob holati kodi"
 *       404:
 *         description: "Chegirma mavjud mahsulotlar topilmadi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "Xatolik haqida xabar"
 *       500:
 *         description: "Serverda xatolik yuz berdi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "Xatolik haqida xabar"
 */
products_router.get("/get/discounted", productsController.getRandomDiscountedProducts)

/**
 * @swagger
 * /products/best/sellers:
 *   get:
 *     summary: "Eng ko'p sotilgan mahsulotlarni olish"
 *     tags: [Products]
 *     description: "Buyurtmalar soni eng yuqori bo'lgan mahsulotlarni olish, aralashtirilgan holatda tasodifiy tarzda qaytarish."
 *     parameters:
 *       - name: "page"
 *         in: "query"
 *         description: "Qaytariladigan sahifa raqami"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: "limit"
 *         in: "query"
 *         description: "Sahifada qaytariladigan mahsulotlar soni"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: "Eng ko'p sotilgan mahsulotlar muvaffaqiyatli qaytarildi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "Javobning muvaffaqiyatli ekanligini bildiradi"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: "Mahsulotning identifikatori"
 *                       name:
 *                         type: string
 *                         description: "Mahsulot nomi"
 *                       price:
 *                         type: number
 *                         description: "Mahsulot narxi"
 *                       discount:
 *                         type: number
 *                         description: "Chegirma foizi"
 *                       description:
 *                         type: string
 *                         description: "Mahsulot tavsifi"
 *                       createdAt:
 *                         type: string
 *                         description: "Mahsulot yaratish sanasi"
 *                       updatedAt:
 *                         type: string
 *                         description: "Mahsulotni yangilash sanasi"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: "Hozirgi sahifa raqami"
 *                     totalPages:
 *                       type: integer
 *                       description: "Jami sahifalar soni"
 *                     totalItems:
 *                       type: integer
 *                       description: "Jami mahsulotlar soni"
 *       404:
 *         description: "Mahsulotlar topilmadi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "Javobning muvaffaqiyatsiz ekanligini bildiradi"
 *                 message:
 *                   type: string
 *                   description: "Xatolik haqida xabar"
 *       500:
 *         description: "Serverda xatolik yuz berdi."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "Javob muvaffaqiyatsiz"
 *                 message:
 *                   type: string
 *                   description: "Xatolik haqida xabar"
 */
products_router.get("/best/sellers", productsController.getMostSell)



/**
//  @swagger
 * /products/get/my/like:
 *   get:
 *     summary: my like mroducts
 *     tags: [Products]
 *     description: userga yoqadigan productlar
 *     responses:
 *       200:
 *         description: productlar topildi
 */
// products_router.get("/get/my/like", productsController.getMyLike)