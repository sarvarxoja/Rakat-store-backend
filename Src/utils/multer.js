import multer from 'multer';

// Fayllarni joylash uchun papkani aniqlash
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products'); // Fayllarni saqlash joyi
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// Fayl turlarini cheklash
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Faqat rasm yuklash mumkin!'), false);
    }
};

// Multer konfiguratsiyasi
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal hajmni 5MB qilib cheklash
});