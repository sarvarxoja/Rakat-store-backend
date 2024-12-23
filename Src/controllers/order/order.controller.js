import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { OrdersModel } from "../../models/orders/orders.model.js"
import { productsModel } from "../../models/products/products.model.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

export default {
    async create(req, res) {
        const session = await mongoose.startSession();
        try {
            if (req.admin) {
                return res.status(403).json({ msg: "You cannot perform this action", status: 403 });
            }

            let { productId, paid, paymentMethodOnline, productQuantity, location } = req.body;
            session.startTransaction();

            // Mahsulotni qidirish
            const productData = await productsModel.findOne({
                "variants._id": productId // `variants` ichidagi `_id`ni qidirish
            });

            if (!productData) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ msg: "Product not found", status: 404 });
            }

            // Variantni topish
            const variant = productData.variants.find(v => v._id.toString() === productId);

            // Agar variant topilmasa
            if (!variant) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ msg: "Variant not found", status: 404 });
            }

            // Omber miqdorini tekshirish
            if (productQuantity > variant.stockQuantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    status: 400,
                    error: "Insufficient stock",
                    requested_quantity: productQuantity,
                    available_quantity: variant.stockQuantity
                });
            }

            // Sotish narxini hisoblash
            const sellingPrice = variant.price * productQuantity;

            // Yangi buyurtma yaratish
            let createdData = await OrdersModel.create({
                productId,
                paid,
                paymentMethodOnline,
                sellingPrice,
                productQuantity,
                location,
                userId: req.user._id
            });

            // Variantning stock miqdorini kamaytirish
            await productsModel.updateOne(
                { _id: productData._id, "variants._id": productId },
                {
                    $inc: { "variants.$.stockQuantity": -productQuantity }, // Variantning stock miqdorini kamaytirish
                    $inc: { numberOfSales: 1 } // Umumiy sotish sonini oshirish
                }
            );

            // Chatga xabar yuborish
            const message = "Siteda sizga buyurtma bor";
            const chatId = "1390138455";
            await bot.sendMessage(chatId, message);

            // Tranzaksiyani tasdiqlash
            await session.commitTransaction();
            session.endSession();

            // Javob qaytarish
            res.status(201).json({ createdData, status: 201 });

        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ msg: "Server error", error: error.message });
        }
    },

    async orderFindById(req, res) {
        try {
            let { id } = req.params;

            // Orderni olish
            let orderData = await OrdersModel.findOne({ _id: id }).populate("userId", "-password -interests");

            if (!orderData) {
                return res.status(404).json({ msg: "Order not found", status: 404 });
            }

            // Agar admin bo'lmasa va orderni yaratuvchi foydalanuvchi bo'lmasa, xato xabarini qaytarish
            if (!req.admin && req.user._id.toString() !== orderData.userId._id.toString()) {
                return res.status(403).json({ msg: "Forbidden: You do not have permission to view this order", status: 403 });
            }

            // Agar muvofiq huquqlar mavjud bo'lsa, orderni qaytarish
            res.status(200).json({ orderData, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal Server Error", status: 500 });
        }
    },

    async deleteById(req, res) {
        try {
            let { id } = req.params;
            let deletedData = await OrdersModel.findOneAndDelete({ _id: id });

            if (!deletedData) {
                return res.status(404).json({ msg: "Order not found", status: 404 });
            }

            res.status(200).json({
                deletedData,
                msg: "The warrant was successfully deleted",
                status: 200
            });
        } catch (error) {
            console.log(error)
        }
    },

    async findByQuery(req, res) {
        try {
            const query = Object.keys(req.query).reduce((acc, key) => {
                if (req.query[key]) {
                    if (key === "canceled" || key === "paid" || key === "paymentMethodOnline") {
                        acc[key] = req.query[key] === "true";
                    } else if (key === "userId" || key === "productId") {
                        acc[key] = req.query[key];
                    } else if (key === "status") {
                        // Ensure the status value is one of the valid options
                        const validStatuses = ["qabul_qilinmagan", "jarayonda", "yetkazilgan"];
                        if (validStatuses.includes(req.query[key])) {
                            acc[key] = req.query[key];
                        }
                    } else {
                        acc[key] = req.query[key];
                    }
                }
                return acc;
            }, {});

            const orders = await OrdersModel.find(query);

            res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Serverda xatolik",
            });
        }
    },

    async updateOrder(req, res) {
        try {
            let { id } = req.params;
            let { status } = req.body;

            if (!status) {
                return res.status(400).json({ msg: "Bad request status must not be empty", status: 400 })
            }

            if (status && !["jarayonda", "yetkazish_jarayonida", "yetkazilgan"].includes(status)) {
                return res.status(400).json({ message: "Invalid status. Allowed values: 'jarayonda', 'yetkazilgan'" });
            }

            let updatedData = await OrdersModel.findOneAndUpdate({ _id: id }, { status: status }, { new: true })

            if (!updatedData) {
                return res.status(404).json({ msg: "order not found", status: 404 })
            }

            res.status(200).json({ updatedData, status: 200 })
        } catch (error) {
            console.log(error)
        }
    },

    async getMyOrders(req, res) {
        try {
            if (req.admin) {
                return res.status(404).json({ msg: "dont have your orders", status: 404 })
            }

            // Extract the page and limit parameters from the query string
            const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is provided
            const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page

            // Calculate the skip value based on the page number
            const skip = (page - 1) * limit;

            // Fetch the orders with pagination
            const myOrders = await OrdersModel.find({ userId: req.user._id })
                .skip(skip)
                .limit(limit);

            // Get the total number of orders for pagination info
            const totalOrders = await OrdersModel.countDocuments({ userId: req.user._id });

            // If no orders found, return a 404
            if (myOrders.length === 0) {
                return res.status(404).json({ msg: "Data not found", status: 404 });
            }

            // Send the response with pagination info
            res.status(200).json({
                myOrders,
                pagination: {
                    page,
                    limit,
                    totalOrders,
                    totalPages: Math.ceil(totalOrders / limit),
                },
                status: 200,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal Server Error", status: 500 });
        }
    }
}