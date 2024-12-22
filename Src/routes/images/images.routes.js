import path from "path";
import { Router } from "express";

export const images_router = Router()

images_router.get('/:category/:filename', (req, res) => {
    try {
        const { category, filename } = req.params;
        const filePath = path.join(process.cwd(), 'uploads', category, filename);

        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(404).json({ message: 'Fayl topilmadi yoki yo‘q' });
            }
        });
    } catch (error) {
        console.log(error)
    }
});