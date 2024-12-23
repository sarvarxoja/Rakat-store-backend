import multer from 'multer';
import path from 'path';

// Fayllarni yuklash uchun sozlamalar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products'); // Fayllar uploads papkasiga saqlanadi
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Fayl nomi vaqt belgisini o'z ichiga oladi
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB gacha bo'lgan fayllar
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Faqat rasm fayllari yuklanishi mumkin.'));
        }
    }
});

export default upload;