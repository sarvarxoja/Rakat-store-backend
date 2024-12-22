import mongoose, { Schema } from "mongoose";

const tags = new Schema({
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

    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const tagsModel = mongoose.model("Tags", tags)