import jwt from "jsonwebtoken";
import { comparePassword, encodePassword, jwtRefreshSign, jwtSign } from "../../utils/utils.js";
import { UsersModel } from "../../models/users/users.model.js";

export default {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            let usersData = await UsersModel.find()
                .select("-password")
                .limit(parseInt(limit))
                .skip(skip)
                .exec();

            if (!usersData.length) {
                return res.status(404).json({ msg: "Data not found", status: 404 });
            }

            res.status(200).json({ usersData, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error", status: 500 });
        }
    },

    async getByQuery(req, res) {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({ msg: 'Please enter the query parameter', status: 400 });
            }

            const regex = new RegExp(query, 'i');

            const users = await UsersModel.find({
                $or: [
                    { firstName: regex },
                    { name: regex },
                    { email: regex },
                    { phoneNumber: regex },
                ],
            }).select("-password");


            res.status(200).json({ users, status: 200 })
        } catch (error) {
            console.log(error)
        }
    },

    async getById(req, res) {
        try {
            let { id } = req.params;
            let userData = await UsersModel.findOne({ _id: id }).select("-password");

            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let isYour = false;

            if (!userData) {
                return res.status(404).json({ msg: "Data not found", status: 404 });
            }

            if (userData._id.toString() === payload.id) {
                isYour = true;
            }

            res.status(200).json({ userData, isYour: isYour, status: 200 });
        } catch (error) {
            console.log(error);
        }
    },

    async updateMe(req, res) {
        try {
            const allowedFields = ['firstName', 'lastName', 'gender', 'email'];
            const SECRET_KEY = process.env.SECRET_KEY;

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY);

            const updateFields = {};
            allowedFields.forEach((field) => {
                if (req.body[field]) {
                    updateFields[field] = req.body[field];
                }
            });

            // Avatar yuklanganda uni qo'shish
            if (req.file) {
                updateFields.avatar = `/uploads/users/${req.file.filename}`;
            }

            if (req.body.firstName && (req.body.firstName.length < 3 || req.body.firstName.length > 50)) {
                return res.status(400).json({ message: "First name must be between 3 to 50 characters" });
            }

            if (req.body.lastName && (req.body.lastName.length < 3 || req.body.lastName.length > 50)) {
                return res.status(400).json({ message: "Last name must be between 3 to 50 characters" });
            }

            if (req.body.gender && !["male", "female", "other"].includes(req.body.gender)) {
                return res.status(400).json({ message: "Invalid gender. Allowed values: 'male', 'female', 'other'" });
            }

            if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
                return res.status(400).json({ message: "Invalid email address" });
            }

            // Hech qanday o'zgartirish bo'lmasa, xato qaytarish
            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({ error: 'Hech qanday yangilik kelmadi.' });
            }

            // Mongoose yordamida yangilash
            const updatedUser = await UsersModel.findByIdAndUpdate(
                payload.id,
                { $set: updateFields },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ error: 'User topilmadi.' });
            }

            res.status(200).json({ message: 'User updated successfully', data: updatedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server xatosi' });
        }
    },

    async updateMyPassword(req, res) {
        try {
            let { newPassword, oldPassword } = req.body;

            if (!newPassword || !oldPassword) {
                return res.status(400).json({ msg: "newPassword and oldPassword must not be empty", status: 400 })
            }

            if (newPassword.length < 6 || newPassword.length > 15) {
                return res.status(400).json({ msg: "newPassword must be at least 6 characters long (max length 15)", status: 400 });
            }

            const SECRET_KEY = process.env.SECRET_KEY;

            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY);


            let myData = await UsersModel.findOne({ _id: payload.id })
            let checkPassword = await comparePassword(oldPassword, myData.password);

            if (!checkPassword) {
                return res.status(401).json({ msg: "wrong password", status: 401 })
            }

            let checkExists = await comparePassword(newPassword, myData.password)

            if (checkExists) {
                return res.status(401).json({ msg: "you cannot use the old password, this password has already been used", status: 401 })
            }

            newPassword = await encodePassword(newPassword)
            myData.password = newPassword
            myData.tokenVersion += 1
            myData.save()

            res.status(200).json({ myData, accessToken: await jwtSign(myData._id, myData.tokenVersion), refreshToken: await jwtRefreshSign(myData._id, myData.tokenVersion), msg: "data successful updated", status: 200 })
        } catch (error) {
            console.log(error)
        }
    }
} 