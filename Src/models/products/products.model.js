import mongoose, { Schema } from "mongoose";

const products = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxLength: 50,
    },

    shortDescription: {
        type: String,
        required: true,
        minlength: 300,
        maxLength: 500,
    },

    description: {
        type: String,
        required: true,
        minlength: 300,
        maxLength: 2000
    },

    stockQuantity: {
        type: Number,
        required: true,
    },

    price: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0,
    },

    saleStatus: {
        type: Boolean,
        required: true
    },

    tags: [
        {
            type: Schema.ObjectId, // ObjectId типи
            ref: 'Tags', // 'Tag' моделига ишора
        }
    ],

    category: [
        {
            type: Schema.ObjectId, // ObjectId типи
            ref: 'Categories', // 'Tag' моделига ишора
            required: true
        }
    ],

    mainImg: {
        type: String,
        required: true
    },

    productImages: {
        type: [String],
        required: true,
    },

    metaTitle: {
        type: String,
        default: null
    },

    metaDescription: {
        type: String,
        default: null
    },

    metaImage: {
        type: String,
        default: null
    },

    popularity: {
        type: Number,
        default: 0
    },

    color: {
        type: String,
        default: null
    },

    views: [
        {
            type: Schema.ObjectId, // ObjectId типи
            ref: 'Users', // 'Tag' моделига ишора
        }
    ],

    viewsCount: {
        type: Number,
        default: 0
    },


    numberOfSales: {
        type: Number,
        default: 0
    },

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

products.virtual('discountedPrice').get(function () {
    if (this.discount && this.price) {
        return this.price * (1 - this.discount / 100); // 10% chegirma misol uchun
    }
    return this.price; // Discount yo'q bo'lsa, asl narxni qaytaradi
});

products.set('toJSON', { virtuals: true });
products.set('toObject', { virtuals: true });

export const productsModel = mongoose.model("products", products)