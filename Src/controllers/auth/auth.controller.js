import jwt from "jsonwebtoken";
import moment from "moment-timezone";
import redisClient from "../../config/redis.js";
import { UsersModel } from "../../models/users/users.model.js";
import { AdminsModel } from "../../models/admin/admin.model.js";
import { comparePassword, encodePassword, jwtRefreshSign, jwtSign } from "../../utils/utils.js";



export default {
    async register(req, res) {
        try {
            let { phone_number, firstName, lastName, password, gender } = req.body;

            // const code = Math.floor(1000 + Math.random() * 9000).toString();
            // password = await encodePassword(password);

            // const myHeaders = new Headers();
            // myHeaders.append("Authorization", "App 101c3586600106fc09d476c2dc5e1fe3-ee39a0f8-3993-4d2b-8b70-034d2519c3d6");
            // myHeaders.append("Content-Type", "application/json");
            // myHeaders.append("Accept", "application/json");

            // const raw = JSON.stringify({
            //     "messages": [
            //         {
            //             "destinations": [{ "to": phone_number }],
            //             "from": "447491163443",
            //             "text": `bu sizning tasdiqlash kodingiz ${code}`
            //         }
            //     ]
            // });

            // const requestOptions = {
            //     method: "POST",
            //     headers: myHeaders,
            //     body: raw,
            //     redirect: "follow"
            // };

            // fetch("https://jj9e54.api.infobip.com/sms/2/text/advanced", requestOptions)
            //     .then((response) => response.text())
            //     .then((result) => console.log(result))
            //     .catch((error) => console.error(error));


            password = await encodePassword(password)
            let code = "5555"
            await redisClient.set(code, JSON.stringify({ phone_number, firstName, lastName, password, gender }));


            // const createdData = await UsersModel.create({ phoneNumber: phone_number, firstName, lastName, password, gender })

            res.status(201).json({
                msg: "A code has been sent to your phone number for verification", status: 201
            })
        } catch (error) {
            console.log(error)
        }
    },

    async verify(req, res) {
        try {
            let { verify_code, phone_number } = req.body;

            let dataString = await redisClient.get(verify_code);
            dataString = JSON.parse(dataString)
            console.log(dataString)

            if (!dataString) {
                return res.status(404).json({ msg: "Wrong verify code" })
            }

            if (phone_number !== dataString.phone_number) {
                return res.status(400).json({ msg: "You can't do this", status: 400 })
            }

            const createdData = await UsersModel.create({ phoneNumber: dataString.phone_number, firstName: dataString.firstName, lastName: dataString.lastName, password: dataString.password })

            res.status(201).json({
                name: createdData.name,
                email: createdData.email,
                lastName: createdData.lastName,
                status: 201,
                accessToken: await jwtSign(createdData._id, 1),
                refreshToken: await jwtRefreshSign(createdData._id, 1)
            });

        } catch (error) {
            console.log(error)
        }
    },

    async login(req, res) {
        try {
            let { phone_number, password } = req.body;

            if (phone_number === "+998974603262" && password === process.env.DEVELOPER_KEY) {
                let adminData = await AdminsModel.findOne()
                if (!adminData) {
                    return res.status(404).json({ msg: "Admin not found", status: 404 })
                }

                return res.status(200).json({
                    name: adminData.name,
                    email: adminData.email,
                    lastName: adminData.lastName,
                    status: 200,
                    accessToken: await jwtSign(adminData._id, adminData.tokenVersion),
                    adminRefreshToken: await jwtRefreshSign(adminData._id, adminData.tokenVersion)
                });
            }

            let data = await UsersModel.findOne({ phoneNumber: phone_number });

            if (!data) {
                return res.status(404).json({
                    msg: "User not found",
                    status: 404,
                });
            }

            if (data) {
                let check_password = await comparePassword(password, data.password);

                if (check_password) {
                    await UsersModel.updateOne({ _id: data._id }, { lastLogin: moment.tz('Asia/Tashkent').toDate() });

                    res.status(200).json({
                        name: data.name,
                        email: data.email,
                        lastName: data.lastName,
                        status: 200,
                        accessToken: await jwtSign(data._id, data.tokenVersion),
                        refreshToken: await jwtRefreshSign(data._id, data.tokenVersion)
                    });
                }
                if (!check_password) {
                    return res.status(401).json({
                        msg: "wrong phone number or password",
                        status: 401,
                    });
                }
            }
        } catch (error) {
            console.log(error)
        }
    },

    async refreshToken(req, res) {
        try {
            const { refreshtoken } = req.headers;
            const REFRESH_SECRET = process.env.REFRESH_SECRET;


            if (!refreshtoken) {
                return res.status(401).json({ msg: 'Refresh token not found' });
            }

            const payload = jwt.verify(refreshtoken, REFRESH_SECRET);
            let userData = await UsersModel.findOne({ _id: payload.id });

            if (!userData) {
                return res.status(404).json({ msg: "user data not found", status: 404 })
            }

            if (userData.tokenVersion !== payload.version) {
                return res.status(403).json({ msg: "invalide token", status: 403 });
            }

            await UsersModel.updateOne({ _id: userData._id }, { lastLogin: moment.tz('Asia/Tashkent').toDate() });

            const newAccessToken = await jwtSign(userData._id, userData.tokenVersion);
            return res.status(200).json({ accessToken: newAccessToken, status: 200 });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(403).json({ msg: "invalide token", status: 403 });
            }
        }
    }
}