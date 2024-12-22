import mongoose, { Schema } from "mongoose";

const Orders = new Schema({
    productId: {
        type: Schema.ObjectId,
        required: true
    },

    paid: {
        type: Boolean,
        default: false
    },

    paymentMethodOnline: {
        type: Boolean,
        default: false
    },   // true bolsa online tolanadi false bolsa offline tolanadi degan manoni bildiradi

    productQuantity: {
        type: Number,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    sellingPrice: {
        type: String,
        required: true
    },

    canceled: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["qabul_qilinmagan", "jarayonda", "yetkazish_jarayonida", "yetkazilgan"],
        default: "qabul_qilinmagan"
    }, //bu statusda orderning statusi masalan yolda yetkazib berish uchun olib ketilmoqda, yetkazib berildi

    userId: {
        type: Schema.ObjectId,
        ref: "Users",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const OrdersModel = mongoose.model('Orders', Orders)