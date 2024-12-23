import jwt from "jsonwebtoken";
import { AdminsModel } from "../../models/admin/admin.model.js";

export const checkAdminToken = async (req, res, next) => {
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
            return res.status(403).json({ msg: "Invalid token", status: 403 });
        }

        const adminData = await AdminsModel.findOne({ _id: payload.id });

        if (!adminData || adminData.isAdmin !== true || adminData.tokenVersion !== payload.version) {
            return res.status(403).json({ msg: "Invalid token", status: 403 });
        }

        // Admin ma'lumotlarini req obyektiga qo'shish
        req.admin = adminData;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ msg: "Invalid token", status: 403 });
        }
        console.error(error.message);
        res.status(500).json({ msg: "Internal Server Error", status: 500 });
    }
};