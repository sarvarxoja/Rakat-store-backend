import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { tagsModel } from "../../models/tags/tags.model.js";


export default {
    async createTag(req, res) {
        try {
            let { name } = req.body;

            const SECRET_KEY = process.env.SECRET_KEY;

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let createdData = await tagsModel.create({ name: `#${name}`, createdAt: moment.tz('Asia/Tashkent').toDate(), userId: payload.id })

            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            console.log(error)
        }
    },

    async getAllTags(req, res) {
        try {
            // Sahifa va limitni so'rovdan olish
            let page = parseInt(req.query.page) || 1; // Sahifa raqami, agar kelmagan bo'lsa 1 ga tenglanadi
            let limit = parseInt(req.query.limit) || 10; // Har sahifada ko'rsatiladigan yozuvlar soni, agar kelmagan bo'lsa 10 ga tenglanadi

            // `skip` hisoblanadi: sahifaga o'tish uchun
            let skip = (page - 1) * limit;

            // Ma'lumotlarni olib kelish
            let categoryData = await tagsModel.find().skip(skip).limit(limit);

            // Yozuvlar sonini hisoblash
            let totalCategories = await tagsModel.countDocuments();

            res.status(200).json({
                categoryData,
                status: 200,
                currentPage: page,
                totalPages: Math.ceil(totalCategories / limit), // Umumiy sahifalar soni
                totalItems: totalCategories,
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: 'Server xatosi', status: 500 });
        }
    },

    async getByQuery(req, res) {
        try {
            const { name } = req.query;

            if (!name) {
                return res.status(400).json({ msg: 'Iltimos, name parametrini kiriting', status: 400 });
            }

            const tags = await tagsModel.find({ name: new RegExp(name, 'i') });

            res.status(200).json({ tags, status: 200 });
        } catch (error) {
            console.log(error)
        }
    },

    async updateTag(req, res) {
        try {
            let { id } = req.params;
            let { name } = req.body;

            let updatedData = await tagsModel.findOneAndUpdate({ _id: id }, { name: name }, { new: true })

            if (!updatedData) {
                return res.status(404).json({ msg: "Tag not found", status: 404 })
            }

            res.status(200).json({ updatedData, msg: "Tag successfully update", status: 200 })
        } catch (error) {
            console.log(error.message)
        }
    }
}