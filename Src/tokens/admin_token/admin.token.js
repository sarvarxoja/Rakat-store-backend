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
        const payload = jwt.verify(token, SECRET_KEY)
        console.log(payload)

        if (!payload.id || !payload.version) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        let adminData = await AdminsModel.findOne({ _id: payload.id })

        if (!adminData) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        if (adminData.isAdmin !== true) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        if (adminData.tokenVersion !== payload.version) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ msg: "invalide token", status: 403 });
        }
    }
}