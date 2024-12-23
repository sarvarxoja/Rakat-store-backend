import { Router } from "express";
import upload from "../../utils/multer.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";
import productsController from "../../controllers/products/products.controller.js";
import { validateProductUpdate } from "../../middlewares/check_product/product.middleware.js";

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Mahsulot yaratish
 *     description: Yangi mahsulot yaratish uchun ma'lumotlar kiritiladi.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - shortDescription
 *               - description
 *               - mainImage
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Mahsulot nomi"
 *               shortDescription:
 *                 type: string
 *                 example: "Qisqacha tavsif (kamida 300 ta belgi)"
 *               description:
 *                 type: string
 *                 example: "Batafsil tavsif (kamida 300 ta belgi)"
 *               metaTitle:
 *                 type: string
 *                 example: "Meta Title"
 *               metaDescription:
 *                 type: string
 *                 example: "Meta Description"
 *               mainImage:
 *                 type: string
 *                 format: binary
 *                 description: "Asosiy rasm yuklash"
 *               variants[1][images]:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Variant uchun rasmlar yuklash"
 *               variants[1][price]:
 *                 type: number
 *                 example: 20000
 *               variants[1][color]:
 *                 type: string
 *                 example: "red"
 *               variants[1][discount]:
 *                 type: number
 *                 example: 10
 *               variants[1][stockQuantity]:
 *                 type: number
 *                 example: 100
 *               variants[1][saleStatus]:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Mahsulot muvaffaqiyatli yaratildi.
 *         content:
 *           application/json:
 *             example:
 *               createdData:
 *                 id: "67694284ac5a42fc8202dccf"
 *                 name: "Mahsulot nomi"
 *                 mainImg: "/uploads/products/1734951556666.png"
 *                 shortDescription: "Qisqacha tavsif..."
 *                 description: "Batafsil tavsif..."
 *                 variants:
 *                   - color: "red"
 *                     price: 20000
 *                     discount: 10
 *                     stockQuantity: 100
 *                     saleStatus: true
 *                     productImages: ["/uploads/products/1.png"]
 *       400:
 *         description: So‘rov noto‘g‘ri yoki kerakli maydonlar to‘ldirilmagan.
 *       500:
 *         description: Serverda xatolik yuz berdi.
 */

export const products_router = Router();


products_router.post(
    "/create",
    checkAdminToken,
    upload.fields([
        { name: "mainImage", maxCount: 1 },  // Handle the main image
        { name: "variants[1][images]", maxCount: 10 },
        { name: "variants[2][images]", maxCount: 10 },
        { name: "variants[3][images]", maxCount: 10 },
        { name: "variants[4][images]", maxCount: 10 }  // Handle variant images (assuming maxCount is 10 for each variant)
    ]),
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
products_router.get("/get/discounted", productsController.getRandomDiscountedVariants)

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
 * @swagger
 * /products/{productId}/variants/{variantId}:
 *   patch:
 *     summary: Mahsulot variantlarini yangilash
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Mahsulot ID-si
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         description: Variant ID-si
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *                 example: "Ko'k"
 *               price:
 *                 type: number
 *                 example: 120000
 *               discount:
 *                 type: number
 *                 example: 15
 *               saleStatus:
 *                 type: boolean
 *                 example: true
 *               stockQuantity:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Variant muvaffaqiyatli yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Mahsulot yoki variant topilmadi
 *       500:
 *         description: Server xatosi
 */

products_router.patch('/products/:productId/variants/:variantId', checkAdminToken, productsController.updateVariantById)

/**
 * @swagger
 * /products/get/veriant/by/{id}:
 *   get:
 *     summary: Berilgan ID bo'yicha variantni olish
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Variant ID-si
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant muvaffaqiyatli topildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variant:
 *                   type: object
 *                 status:
 *                   type: number
 *       404:
 *         description: Variant topilmadi
 *       500:
 *         description: Server xatosi
 */

products_router.get("/get/veriant/by/:id", productsController.getVariantById)

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