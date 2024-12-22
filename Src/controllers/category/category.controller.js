import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { categoriesModel } from "../../models/categories/categories.model.js";
import { productsModel } from "../../models/products/products.model.js";

export default {
  async createCategory(req, res) {
    try {
      let { name } = req.body;
      const SECRET_KEY = process.env.SECRET_KEY;

      if (!req.file) {
        return res
          .status(400)
          .json({ msg: "image must not empty", status: 400 });
      }

      const tokenHeader = req.headers["authorization"];
      const token = tokenHeader.split(" ")[1];
      const payload = jwt.verify(token, SECRET_KEY);

      let createdData = await categoriesModel.create({
        name: name,
        createdAt: moment.tz("Asia/Tashkent").toDate(),
        userId: payload.id,
        category_img: `/uploads/categories/${req.file.filename}`,
      });

      res.status(201).json({ createdData, status: 201 });
    } catch (error) {
      console.log(error);
    }
  },

  async getAllCategory(req, res) {
    try {
      // Sahifa va limitni so'rovdan olish
      let page = parseInt(req.query.page) || 1; // Sahifa raqami, agar kelmagan bo'lsa 1 ga tenglanadi
      let limit = parseInt(req.query.limit) || 10; // Har sahifada ko'rsatiladigan yozuvlar soni, agar kelmagan bo'lsa 10 ga tenglanadi

      // `skip` hisoblanadi: sahifaga o'tish uchun
      let skip = (page - 1) * limit;

      // Ma'lumotlarni olib kelish
      let categoryData = await categoriesModel.find().skip(skip).limit(limit);

      // Yozuvlar sonini hisoblash
      let totalCategories = await categoriesModel.countDocuments();

      res.status(200).json({
        categoryData,
        status: 200,
        currentPage: page,
        totalPages: Math.ceil(totalCategories / limit), // Umumiy sahifalar soni
        totalItems: totalCategories,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Server xatosi", status: 500 });
    }
  },

  async getByQuery(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return res
          .status(400)
          .json({ msg: "Please enter the name parameter", status: 400 });
      }

      const categories = await categoriesModel.find({
        name: new RegExp(name, "i"),
      });

      res.status(200).json({ categories, status: 200 });
    } catch (error) {
      console.log(error);
    }
  },

  async getTopCategories(req, res) {
    try {
      // Top qismi true bo'lgan barcha category-larni olish
      const categories = await categoriesModel.find({ top: true });

      // Arrayni random qilib aralashtirish
      const shuffledCategories = categories.sort(() => 0.5 - Math.random());

      // Response yuborish
      res.status(200).json({
        success: true,
        data: shuffledCategories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Serverda xatolik yuz berdi.",
        error: error.message,
      });
    }
  },

  async updateCategory(req, res) {
    const { id } = req.params; // URLdan id olish
    const { name, top } = req.body; // Bodydan kelgan ma'lumotlarni olish

    try {
      const updateFields = {};

      if (top) {
        if (typeof top !== "boolean") {
          return res.status(400).json({ msg: "top must be boolean" });
        }
      }

      // Faqat mavjud maydonlarni tekshiradi va yangilanadigan maydonlar tanlanadi
      if (name) updateFields.name = name;
      if (top !== undefined) updateFields.top = top;

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          message: "Yangilash uchun valid maydonlar tanlanmagan.",
        });
      }

      const updatedCategory = await categoriesModel.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true } // Yangi yangilangan obyektni qaytaradi
      );

      if (!updatedCategory) {
        return res.status(404).json({
          message: "Kategoriya topilmadi.",
        });
      }

      return res.status(200).json({
        message: "Yangilash muvaffaqiyatli!",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Yangilashda xatolik:", error);
      return res.status(500).json({
        error: "Yangilashda server xatosi.",
      });
    }
  },

  async getCategoryById(req, res) {
    try {
      const { id } = req.params; // Category ID
      const { page = 1, limit = 10 } = req.query; // Pagination params (default: page 1, 10 items per page)

      // Validate page and limit
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (
        isNaN(pageNumber) ||
        pageNumber < 1 ||
        isNaN(limitNumber) ||
        limitNumber < 1
      ) {
        return res
          .status(400)
          .json({ message: "Invalid pagination parameters" });
      }

      const products = await productsModel
        .find({ category: id }) // Filter by category ID
        .populate("tags") // Populate tags if needed
        .populate("category") // Populate category if needed
        .skip((pageNumber - 1) * limitNumber) // Skip previous pages
        .limit(limitNumber); // Limit number of items

      const total = await productsModel.countDocuments({ category: id }); // Total number of products in the category

      res.status(200).json({
        data: products,
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
