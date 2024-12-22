import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { CommentsModel } from "../../models/comments/comments.model.js";
import { productsModel } from "../../models/products/products.model.js";

export default {
    async create(req, res) {
        try {
            let { id } = req.params;
            let { comment, numberOfRatings } = req.body;

            const SECRET_KEY = process.env.SECRET_KEY;

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let productData = await productsModel.findOne({ _id: id })

            if (!productData) {
                return res.status(200).json({ msg: "Product not found", msg: 200 })
            }

            let commentCheck = await CommentsModel.findOne({ productId: id, userId: payload.id })

            if (commentCheck) {
                return res.status(400).json({ msg: "You are already write comment", status: 400})
            }

            let commentData = await CommentsModel.create({
                comment: comment, productId: id, userId: payload.id,
                createdAt: moment.tz('Asia/Tashkent').toDate(), numberOfRatings: numberOfRatings
            });

            await productsModel.updateOne(
                { _id: id },
                { $inc: { popularity: 1 } }
            );

            res.status(201).json({ commentData, status: 201 })
        } catch (error) {
            console.log(error)
        }
    },

    async findComments(req, res) {
        try {
            let { id } = req.params;
            let { page = 1, limit = 10 } = req.query; // Sahifa va limitni so'rov parametrlaridan olish

            page = parseInt(page); // Sahifa raqamini son shakliga o'tkazish
            limit = parseInt(limit); // Limitni son shakliga o'tkazish

            const commentsData = await CommentsModel.find({ productId: id })
                .skip((page - 1) * limit) // Sahifa asosida ma'lumotlarni o'tkazish
                .limit(limit); // Ma'lumotlar sonini cheklash

            const totalComments = await CommentsModel.countDocuments({ productId: id }); // Umumiy kommentlar sonini olish
            const totalPages = Math.ceil(totalComments / limit); // Umumiy sahifalar sonini hisoblash

            res.status(200).json({
                commentsData,
                status: 200,
                pagination: {
                    totalComments,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: error.message });
        }
    }
}