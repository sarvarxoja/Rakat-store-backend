import mongoose, { Schema } from "mongoose";

// Mahsulotlar modelini yaratish
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

    // Variants bo'limi qo'shildi
    variants: [
        {
            color: { type: String, required: true },
            price: { type: Number, required: true },
            discount: { type: Number, default: 0 }, // Variantga tegishli chegirma
            saleStatus: { type: Boolean, required: true },
            productImages: { type: [String], required: true }, // Rasm variantlarga oid
            stockQuantity: { type: Number, required: true }, // Variantning mavjudligi
        }
    ],

    mainImg: { type: String, required: true },

    tags: [
        {
            type: Schema.ObjectId, // ObjectId tipi
            ref: 'Tags', // 'Tag' modeliga ishora
        }
    ],

    category: [
        {
            type: Schema.ObjectId, // ObjectId tipi
            ref: 'Categories', // 'Category' modeliga ishora
            required: true
        }
    ],

    metaTitle: { type: String, default: null },
    metaDescription: { type: String, default: null },

    popularity: { type: Number, default: 0 },

    views: [
        {
            type: Schema.ObjectId, // ObjectId tipi
            ref: 'Users', // 'User' modeliga ishora
        }
    ],

    viewsCount: { type: Number, default: 0 },

    numberOfSales: { type: Number, default: 0 },

    userId: { type: Schema.ObjectId, ref: "Users", required: true },

    createdAt: { type: Date, default: Date.now },
});

products.virtual('variantsDiscounted').get(function () {
    return this.variants.map(variant => {
        const discountedPrice = variant.price * (1 - (variant.discount / 100));
        return { ...variant.toObject(), discountedPrice };
    });
});

products.set('toJSON', { virtuals: true });
products.set('toObject', { virtuals: true });

export const productsModel = mongoose.model("products", products);