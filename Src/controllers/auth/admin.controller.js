import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import { AdminsModel } from "../../models/admin/admin.model.js";
import { comparePassword, encodePassword, jwtRefreshSign, jwtSign } from "../../utils/utils.js";

export default {
    async adminLogin(req, res) {
        try {
            let { phone_number, password } = req.body;

            let data = await AdminsModel.findOne({ phoneNumber: phone_number });

            if (!data) {
                return res.status(401).json({
                    msg: "Такого пользователя не существует",
                    status: 401,
                });
            }

            if (data) {
                let check_password = await comparePassword(password, data.password);
                if (check_password) {
                    await AdminsModel.updateOne({ _id: data._id }, { lastLogin: moment.tz('Asia/Tashkent').toDate() });

                    res.status(200).json({
                        name: data.name,
                        email: data.email,
                        lastName: data.lastName,
                        status: 200,
                        accessToken: await jwtSign(data._id, data.tokenVersion),
                        adminRefreshToken: await jwtRefreshSign(data._id, data.tokenVersion)
                    });
                }
                if (!check_password) {
                    return res.status(401).json({
                        msg: "wrong email or password",
                        status: 401,
                    });
                }
            }
        } catch (error) {
            console.log(error)
        }
    },

    async adminRefreshToken(req, res) {
        try {
            const { adminrefreshtoken } = req.headers;
            const REFRESH_SECRET = process.env.REFRESH_SECRET;

            if (!adminrefreshtoken) {
                return res.status(401).json({ msg: 'Refresh token not found' });
            }

            const payload = jwt.verify(adminrefreshtoken, REFRESH_SECRET);
            let adminData = await AdminsModel.findOne({ _id: payload.id });

            if (!adminData) {
                return res.status(404).json({ msg: "user data not found", status: 404 })
            }

            if (adminData.tokenVersion !== payload.version) {
                return res.status(403).json({ msg: "invalide token", status: 403 });
            }

            const newAccessToken = await jwtSign(adminData._id, adminData.tokenVersion);
            return res.status(200).json({ accessToken: newAccessToken, status: 200 });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(403).json({ msg: "invalide token", status: 403 });
            }
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


            let myData = await AdminsModel.findOne({ _id: payload.id })
            let checkPassword = await comparePassword(oldPassword, myData.password);

            if (!checkPassword) {
                return res.status(401).json({ msg: "wrong password", status: 401 })
            }

            let checkExists = await comparePassword(newPassword, myData.password)

            if (checkExists) {
                return res.status(400).json({ msg: "you cannot use the old password, this password has already been used", status: 400 })
            }

            newPassword = await encodePassword(newPassword)
            myData.password = newPassword
            myData.tokenVersion += 1
            myData.save()

            res.status(200).json({ myData, accessToken: await jwtSign(myData._id, myData.tokenVersion), adminRefreshToken: await jwtRefreshSign(myData._id, myData.tokenVersion),msg: "data successful updated", status: 200 })
        } catch (error) {
            console.log(error)
        }
    }
}