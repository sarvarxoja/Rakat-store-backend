import mongoose, { Schema } from "mongoose";

const notifications = new Schema({
    message: {
        type: String,
        minlength: 5,
        maxLength: 500,
    },

    userId: {
        type: Schema.ObjectId,
        ref: "Users",
        default: null
    },

    forAllUsers: {
        type: Boolean,
        default: false
    },

    creator: {
        type: Schema.ObjectId,
        ref: "Users",
        default: null
    },

    readAt: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const notificationsModel = mongoose.model("Notifications", notifications)