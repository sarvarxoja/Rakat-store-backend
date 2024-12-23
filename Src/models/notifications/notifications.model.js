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

    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    views: [
        {
            type: Schema.ObjectId, // ObjectId типи
            ref: 'Users',
        }
    ],

    viewsCount: {
        type: Number,
        default: 0
    },

});

export const notificationsModel = mongoose.model("Notifications", notifications)