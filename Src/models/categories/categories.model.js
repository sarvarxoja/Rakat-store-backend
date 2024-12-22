import mongoose, { Schema } from "mongoose";

const categories = new Schema({
    category_img: {
        type: String,
    },

    name: {
        type: String,
        required: true,
        minlength: 2,
        maxLength: 20
    },

    userId: {
        type: Schema.ObjectId,
        ref: "Admins",
        required: true
    },

    top: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const categoriesModel = mongoose.model("Categories", categories)