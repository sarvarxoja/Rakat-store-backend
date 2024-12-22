import mongoose, { Schema } from "mongoose";

const Comments = new Schema({
    comment: {
        type: String,
        minlength: 1,
        maxLength: 600,
    },

    productId: {
        type: Schema.ObjectId,
        ref: "products"
    },

    userId: {
        type: Schema.ObjectId,
        ref: "Users",
        required: true
    },

    numberOfRatings: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const CommentsModel = mongoose.model("Comments", Comments)