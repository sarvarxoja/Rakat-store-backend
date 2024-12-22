import mongoose, { Schema } from "mongoose";

const Admin = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    firstName: {
        type: String,
        default: null
    },

    lastName: {
        type: String,
        default: null
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"], // Mümkin bo'lgan qiymatlar
        default: null
    },

    password: {
        type: String,
        required: true
    },

    lastLogin: {
        type: Date,
        default: null,
    },

    email: {
        type: String,
        default: null
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    tokenVersion: {
        type: Number,
        default: 1
    },
})

export const AdminsModel = mongoose.model("Admins", Admin)