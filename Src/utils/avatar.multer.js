import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/users"); // Fayllarni saqlash uchun katalog
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unikal nom berish
    },
});

// Fayl turlarini tekshirish (faqat rasm bo'lishi kerak)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Faqat rasm fayllari (jpeg, jpg, png, gif) ruxsat etiladi!"), false);
    }
};

// Multer opsiyalari
export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal hajm 10 MB
});
