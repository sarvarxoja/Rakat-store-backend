import mongoose, { Schema } from "mongoose";

export const productVariantSchema = new Schema({
    price: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },

    stockQuantity: {
        type: Number,
        required: true
    },

    color: {
        type: String,
        default: null
    },

    // Har bir variantga alohida rasm
    productImages: {
        type: [String],
        required: true
    },

    discountedPrice: {
        type: Number,
        default: function () {
            if (this.discount && this.price) {
                return this.price * (1 - this.discount / 100);
            }
            return this.price;
        }
    },
}, { _id: true }); // `_id`ni ishlatish

export const variantsModel = mongoose.model("variants", productVariantSchema)