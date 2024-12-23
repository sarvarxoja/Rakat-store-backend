import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import moment from "moment-timezone";

import { UsersModel } from "../../models/users/users.model.js";
import { OrdersModel } from "../../models/orders/orders.model.js";
import { productsModel } from "../../models/products/products.model.js";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default {
    async create(req, res) {
        try {
            // category maydonini to'g'ri formatda olish
            // const categories = req.body.category.map(categoryId => mongoose.Types.ObjectId(categoryId));

            // shortDescription va description maydonlarini tekshirish
            const { name, shortDescription, description, metaTitle, metaDescription, variants, category } = req.body;

            if (shortDescription.length < 300) {
                return res.status(400).json({
                    msg: 'Short description must be at least 300 characters.',
                    status: 400
                });
            }

            if (description.length < 300) {
                return res.status(400).json({
                    msg: 'Description must be at least 300 characters.',
                    status: 400
                });
            }

            // Variantsni to'g'ri formatda ishlash
            const variantImages = req.files['variants[1][images]']?.map(file => `/uploads/products/${file.filename}`) || [];

            // Asosiy rasmni olish
            const mainImage = req.files['mainImage']?.[0]
                ? `/uploads/products/${req.files['mainImage'][0].filename}`
                : null;

            if (!mainImage) {
                return res.status(400).json({
                    msg: 'Main image is required!',
                    status: 400
                });
            }

            // Variantlarni to'g'ri formatda saqlash
            const processedVariants = variants.map((variant, index) => {
                if (index === 1) {
                    return {
                        ...variant,
                        productImages: variantImages, // Variantga rasm qo'shish
                    };
                }
                return variant;
            });

            // Yangi mahsulotni yaratish
            const createdData = await productsModel.create({
                name,
                shortDescription,
                description,
                category: category,
                metaTitle,
                metaDescription,
                variants: processedVariants, // Variantlarni saqlash
                mainImg: mainImage,
                userId: req.admin._id,
                createdAt: moment.tz('Asia/Tashkent').toDate()
            });

            // Mahsulot yaratildi
            res.status(201).json({ createdData, status: 201 });

        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error creating product', error: error.message });
        }
    },

    async getPopularProduct(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;  // Default to page 1, limit 20 products per page

            // Find the top products sorted by popularity
            const products = await productsModel.find().sort("-popularity").skip((page - 1) * limit).limit(Number(limit));

            // Check if there are any products
            if (products.length === 0) {
                return res.status(404).json({ success: false, message: "No products found" });
            }

            // Shuffle the products array randomly
            const shuffledProducts = products.sort(() => 0.5 - Math.random());

            // Response with shuffled products
            res.status(200).json({
                success: true,
                data: shuffledProducts,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(await productsModel.countDocuments() / limit),
                    totalItems: await productsModel.countDocuments(),
                },
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async getVariantById(req, res) {
        const { id } = req.params; // URL dan variantId olish

        try {
            // Variantni qidirish
            const product = await productsModel.findOne({
                "variants._id": id // `variants` ichida `_id`ni qidirish
            });

            if (!product) {
                return res.status(404).json({ msg: 'Product with the specified variant not found' });
            }

            // Variantni olish
            const variant = product.variants.find(v => v._id.toString() === id);

            if (!variant) {
                return res.status(404).json({ msg: 'Variant not found' });
            }

            res.status(200).json({ variant, status: 200 });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ msg: 'Error occurred while fetching variant', error: error.message });
        }
    },

    async getMostSell(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;  // Default to page 1, limit 20 products per page

            // Find the most sold products by counting the orders for each product
            const mostSoldProducts = await OrdersModel.aggregate([
                { $match: { canceled: false } },  // Exclude canceled orders
                { $group: { _id: "$productId", count: { $sum: 1 } } },  // Group by productId and count the occurrences
                { $sort: { count: -1 } },  // Sort by the count of orders in descending order
                { $skip: (page - 1) * limit },  // Skip the products for the current page
                { $limit: Number(limit) }  // Limit the number of products per page
            ]);

            if (mostSoldProducts.length === 0) {
                return res.status(404).json({ success: false, message: "No products found" });
            }

            // Retrieve product details from the productsModel based on the most sold productIds
            const productIds = mostSoldProducts.map(item => item._id);
            const products = await productsModel.find({ _id: { $in: productIds } }).populate("userId", "-password");

            // Shuffle the products randomly
            const shuffledProducts = products.sort(() => 0.5 - Math.random());

            // Response with shuffled most sold products
            res.status(200).json({
                success: true,
                data: shuffledProducts,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(await OrdersModel.countDocuments({ canceled: false, productId: { $in: productIds } }) / limit),
                    totalItems: await OrdersModel.countDocuments({ canceled: false, productId: { $in: productIds } })
                },
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // async getMyLike(req, res) {
    //     try {
    //         const SECRET_KEY = process.env.SECRET_KEY;
    //         const tokenHeader = req.headers['authorization'];
    //         const token = tokenHeader.split(' ')[1];
    //         const payload = jwt.verify(token, SECRET_KEY)


    //         let userData = await UsersModel.findOne({ _id: payload.id })

    //         if (!userData.interests.length) {
    //             let products = await productsModel.find({ saleStatus: true }).sort({ viewsCount: -1 })
    //             return res.status(200).json({ products, status: 200 })
    //         }

    //         const products = await productsModel.find({
    //             saleStatus: true, tags: { $in: userData.interests }
    //         }).sort({ viewsCount: -1 }).populate("user_id", "-password -phoneNumber");

    //         res.status(200).json({ products, status: 200 })
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }, 

    async getById(req, res) {
        try {
            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            if (tokenHeader) {
                const token = tokenHeader.split(' ')[1];
                const payload = jwt.verify(token, SECRET_KEY);

                const userData = await UsersModel.findOne({ _id: payload.id });
                if (userData) {
                    const tagsToAdd = productData.tags.map(tag => tag._id);

                    userData.interests = [...new Set([...userData.interests, ...tagsToAdd])];

                    const newTags = tagsToAdd.filter(tagId => !userData.interests.includes(tagId));

                    if (newTags.length > 0) {
                        userData.interests.push(...newTags);
                        await userData.save();
                    }

                    if (!productData.views.includes(payload.id)) {
                        productData.views.push(payload.id);
                        productData.viewsCount = productData.views.length;
                        productData.popularity += 1;
                        await productData.save();
                    }
                }
            }

            const { id } = req.params;
            // Query the OrdersModel for the product with this id
            const orders = await OrdersModel.find({ productId: id, canceled: false });

            if (!orders.length) {
                return res.status(404).json({ msg: "Product not found in orders", status: 404 });
            }

            // Get the number of times the product has been purchased
            const purchaseCount = orders.length;

            // Optionally, you can also get product data from another model (if needed)
            let productData = await productsModel.findOne({ _id: id }).populate("userId", "-password");

            if (!productData) {
                return res.status(404).json({ msg: "Product not found", status: 404 });
            }

            // Include the purchase count in the response
            res.status(200).json({ productData, purchaseCount, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Server error", status: 500 });
        }
    },

    async getByQuery(req, res) {
        try {
            const {
                name = '',
                category,
            } = req.query;

            // Qidirish uchun dinamik so'rovni tuzish
            const query = {};

            // RegExp yordamida name bo‘yicha qidirish
            if (name) {
                query.name = { $regex: name, $options: 'i' }; // 'i' - case-insensitive
            }

            if (category) {
                query.category = { $in: category.split(',').map(id => mongoose.Types.ObjectId(id)) };
            }

            const results = await productsModel.find(query);

            res.status(200).json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async deleteById(req, res) {
        try {
            let { id } = req.params;

            let deletedData = await productsModel.findOneAndDelete({ _id: id })

            if (!deletedData) {
                return res.status(404).json({ msg: "Product not found", status: 404 })
            }

            res.status(200).json({ deletedData, msg: "product succesfully deleted", status: 200 })
        } catch (error) {
            console.log(error)
        }
    },

    async updateById(req, res) {
        try {
            const { id } = req.params; // URL parametri orqali product ID olish
            const allowedFields = [
                "name",
                "shortDescription",
                "description",
            ]; // Yangilanadigan maydonlar

            // Request body-dan kelgan kalitlarni filtrlash
            const updates = Object.keys(req.body).filter((key) =>
                allowedFields.includes(key)
            );

            if (updates.length === 0) {
                return res.status(400).json({ message: "No valid fields to update" });
            }

            const updateData = {};
            updates.forEach((key) => {
                updateData[key] = req.body[key];
            });

            const updatedProduct = await productsModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true } // Yangi yangilangan obyektni qaytarish
            );

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.status(200).json({
                message: "Product updated successfully",
                data: updatedProduct,
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    },

    async updateVariantById(req, res) {
        try {
            const { productId, variantId } = req.params;
            const updateData = req.body;

            // O'chirish kerak bo'lgan maydonlar
            delete updateData.productImages; // productImages yangilanmaydi

            // Mahsulotni topish
            const product = await productsModel.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Mahsulot topilmadi' });
            }

            // Variantni topish
            const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
            if (variantIndex === -1) {
                return res.status(404).json({ message: 'Variant topilmadi' });
            }

            // Yangilash
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    product.variants[variantIndex][key] = updateData[key];
                }
            });

            // Yangilangan mahsulotni saqlash
            await product.save();

            res.status(200).json({ message: 'Variant yangilandi', data: product.variants[variantIndex] });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server xatosi', error });
        }
    },

    async getRandomDiscountedVariants(req, res) {
        try {
            // Mahsulotlarni variantlarining chegirmalarini tekshirish
            const productsWithDiscountedVariants = await productsModel.find({
                "variants.discount": { $gt: 0 }
            });

            if (productsWithDiscountedVariants.length === 0) {
                return res.status(404).json({ message: 'No variants with discount found.' });
            }

            // Tasodifiy aralash
            shuffleArray(productsWithDiscountedVariants);

            res.status(200).json({ productsWithDiscountedVariants, status: 200 });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'An error occurred while fetching discounted variants.' });
        }
    }
}