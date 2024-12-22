import jwt from "jsonwebtoken";
import { UsersModel } from "../../models/users/users.model.js";
import { AdminsModel } from "../../models/admin/admin.model.js";

export const checkWorkerToken = async (req, res, next) => {
    try {
        const SECRET_KEY = process.env.SECRET_KEY;

        const tokenHeader = req.headers['authorization'];

        if (!tokenHeader) {
            return res.status(401).json({
                error: 'Token not available. Please authenticate.'
            });
        }

        const token = tokenHeader.split(' ')[1];
        const payload = jwt.verify(token, SECRET_KEY);

        if (!payload.id || !payload.version) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        let userData = await UsersModel.findOne({ _id: payload.id })
        let adminData = await AdminsModel.findOne({ _id: payload.id })

        if (!userData && !adminData) {
            return res.status(404).json({ error: "User not found" })
        }

        if (adminData) {
            if (adminData.tokenVersion !== payload.version) {
                return res.status(403).json({ msg: "invalide token", status: 403 });
            }
            return next(); // Admin mavjud bo'lsa, keyingi middleware-ga o'tish
        }

        if (userData.tokenVersion !== payload.version || userData.isWorker !== true) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }
    }
}