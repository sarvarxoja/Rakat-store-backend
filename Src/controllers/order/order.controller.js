import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { UsersModel } from "../../models/users/users.model.js";
import { AdminsModel } from "../../models/admin/admin.model.js";
import { OrdersModel } from "../../models/orders/orders.model.js"
import { productsModel } from "../../models/products/products.model.js";

export default {
    async create(req, res) {
        try {
            const session = await mongoose.startSession();
            let { productId, paid, paymentMethodOnline, productQuantity, location } = req.body;

            const SECRET_KEY = process.env.SECRET_KEY;

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            session.startTransaction();

            let productData = await productsModel.findOne({ _id: productId })

            if (!productData) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ msg: "Product not found", status: 404 })
            }

            if (productQuantity > productData.stockQuantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    "status": 400,
                    "error": "Insufficient stock",
                    "requested_quantity": productQuantity,
                    "available_quantity": productData.productQuantity
                })
            }

            const sellingPrice = productData.price * productQuantity;

            let createdData = await OrdersModel.create({ productId, paid, paymentMethodOnline, sellingPrice, productQuantity, location, userId: payload.id })

            await productsModel.updateOne(
                { _id: productId },
                { $inc: { stockQuantity: -productQuantity, numberOfSales: 1 } }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({ createdData, status: 201 });
        } catch (error) {
            console.log(error)
            await session.abortTransaction();
            session.endSession();
        }
    },

    async orderFindById(req, res) {
        try {
            let { id } = req.params;

            const SECRET_KEY = process.env.SECRET_KEY;

            // Tokenni olish va foydalanuvchi ma'lumotlarini tekshirish
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY);

            // Orderni olish
            let orderData = await OrdersModel.findOne({ _id: id }).populate("userId", "-password -interests");

            if (!orderData) {
                return res.status(404).json({ msg: "Order not found", status: 404 });
            }

            // Admin yoki foydalanuvchi tekshirish
            let adminData = await AdminsModel.findOne({ _id: payload.id });
            let usersData = await UsersModel.findOne({ _id: payload.id });

            // Agar admin bo'lmasa va orderni yaratuvchi foydalanuvchi bo'lmasa, xato xabarini qaytarish
            if (!adminData && usersData._id.toString() !== orderData.userId._id.toString()) {
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
            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY);

            // Extract the page and limit parameters from the query string
            const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is provided
            const limit = parseInt(req.query.limit) || 10; // Default to 10 results per page

            // Calculate the skip value based on the page number
            const skip = (page - 1) * limit;

            // Fetch the orders with pagination
            const myOrders = await OrdersModel.find({ userId: payload.id })
                .skip(skip)
                .limit(limit);

            // Get the total number of orders for pagination info
            const totalOrders = await OrdersModel.countDocuments({ userId: payload.id });

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