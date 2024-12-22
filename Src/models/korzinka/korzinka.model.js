import mongoose, { Schema } from "mongoose";

const korzinka = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products", // Mahsulotlar modeliga bog'lanadi
            },
            quantity: {
                type: Number,
                default: 1,
            },
            price: {
                type: Number,  // Mahsulotning narxi, uni ko'paytirish uchun
                default: 0
            }
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now
    },

    totalPrice: {
        type: Number,
        default: 0
    }
});

export const korzinkaModel = mongoose.model("korzinkalar", korzinka);
