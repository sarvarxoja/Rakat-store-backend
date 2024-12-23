import mongoose from "mongoose";
import { UsersModel } from "../../models/users/users.model.js";

// General validation uchun middleware
export const validateUserMiddleware = async (req, res, next) => {
    try {
        const { phone_number, firstName, lastName, password, gender} = req.body;

        if (!phone_number || !firstName || !lastName || !password || !gender) {
            return res.status(400).json({ mssage: "Data is not fully", status: 400 })
        }

        // phoneNumber tekshiruvi
        if (!phone_number) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        if (!/^\+?\d{7,15}$/.test(phone_number)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        // firstName va lastName tekshiruvi
        if (firstName && (firstName.length < 3 || firstName.length > 50)) {
            return res.status(400).json({ message: "First name must be between 3 to 50 characters" });
        }

        if (lastName && (lastName.length < 3 || lastName.length > 50)) {
            return res.status(400).json({ message: "Last name must be between 3 to 50 characters" });
        }

        // gender tekshiruvi
        if (gender && !["male", "female", "other"].includes(gender)) {
            return res.status(400).json({ message: "Invalid gender. Allowed values: 'male', 'female', 'other'" });
        }

        // password tekshiruvi
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (password.length < 6 || password.length > 15) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        let checkPhoneNumber = await UsersModel.findOne({ phoneNumber: phone_number })

        if (checkPhoneNumber) {
            return res.status(400).json({ message: "This phone number already exists" })
        }

        next(); // Tekshirishlar muvaffaqiyatli bo'lsa keyingi middleware-ga o'tish
    } catch (error) {
        return res.status(500).json({ message: "Error validating user data", error: error.message });
    }
};

// Login uchun middleware
export const validateLoginMiddleware = async (req, res, next) => {
    try {
        const { phone_number, password } = req.body;

        if (!phone_number || !password) {
            return res.status(400).json({ msg: "Data is incomplete phone_number and password must not be empty", status: 400 })
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error during login validation", error: error.message });
    }
};

export const validateVerifyMiddleware = async (req, res, next) => {
    try {
        let { verify_code, phone_number } = req.body;

        if (!verify_code || !phone_number) {
            return res.status(400).json({ msg: "verify_code must not be empty", status: 400 })
        }

        next()
    } catch (error) {
        return res.status(500).json({ message: "Server error during login validation", error: error.message });
    }
}