import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { UsersModel } from "../../models/users/users.model.js";
import { productsModel } from "../../models/products/products.model.js";
import { OrdersModel } from "../../models/orders/orders.model.js";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

export default {
    async create(req, res) {
        try {
            const SECRET_KEY = process.env.SECRET_KEY;
            const images = req.files['images']?.map(file => `/uploads/products/${file.filename}`) || [];

            if (!images.length) {
                return res.status(400).json({
                    msg: 'Images must not be empty',
                    status: 400
                });
            }


            const mainImage = req.files['mainImage']?.[0]
                ? `/uploads/products/${req.files['mainImage'][0].filename}`
                : null;

            if (!mainImage) {
                return res.status(400).json({
                    msg: 'mainImage must not be empty!',
                    status: 400
                });
            }

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let { name, short_description, description, stock_quantity, price, discount, sale_status, tags, category, color } = req.body;

            let createdData = await productsModel.create({
                name, shortDescription: short_description, description, stockQuantity: stock_quantity, price, discount, saleStatus: sale_status, tags, category,
                userId: payload.id, createdAt: moment.tz('Asia/Tashkent').toDate(), productImages: images, mainImg: mainImage, color
            })

            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            console.log(error.message)
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

    async getMyLike(req, res) {
        try {
            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)


            let userData = await UsersModel.findOne({ _id: payload.id })

            if (!userData.interests.length) {
                let products = await productsModel.find({ saleStatus: true }).sort({ viewsCount: -1 })
                return res.status(200).json({ products, status: 200 })
            }

            const products = await productsModel.find({
                saleStatus: true, tags: { $in: userData.interests }
            }).sort({ viewsCount: -1 }).populate("user_id", "-password -phoneNumber");

            res.status(200).json({ products, status: 200 })
        } catch (error) {
            console.log(error.message)
        }
    }, //togirlash kerak bunga check token qoyiladi

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
                saleStatus,
                discount,
                category,
                tags,
            } = req.query;

            // Qidirish uchun dinamik so'rovni tuzish
            const query = {};

            // RegExp yordamida name bo‘yicha qidirish
            if (name) {
                query.name = { $regex: name, $options: 'i' }; // 'i' - case-insensitive
            }

            if (saleStatus) {
                query.saleStatus = saleStatus === 'true';
            }

            if (discount) {
                query.discount = Number(discount);
            }

            if (category) {
                query.category = { $in: category.split(',').map(id => mongoose.Types.ObjectId(id)) };
            }

            if (tags) {
                query.tags = { $in: tags.split(',').map(id => mongoose.Types.ObjectId(id)) };
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
            console.log(req.body)
            const { id } = req.params; // URL parametri orqali product ID olish
            const allowedFields = [
                "name",
                "short_description",
                "description",
                "stock_quantity",
                "saleStatus",
                "discount",
                "price",
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

    async getRandomDiscountedProducts(req, res) {
        try {
            // Query for products with a discount greater than 0
            const productsWithDiscount = await productsModel.find({ discount: { $gt: 0 } });

            if (productsWithDiscount.length === 0) {
                return res.status(404).json({ message: 'No products with discount found.' });
            }

            // Shuffle the array of products randomly
            shuffleArray(productsWithDiscount);

            // Send the shuffled products as the response
            res.status(200).json({ productsWithDiscount, status: 200 });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'An error occurred while fetching products.' });
        }
    }
}