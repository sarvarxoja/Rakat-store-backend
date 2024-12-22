import mongoose, { Schema } from "mongoose"

const Users = new Schema({
    avatar: {
        default: "/uploads/usres/default.png",
        type: String,
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    firstName: {
        type: String,
        default: null,
        minlength: 3,
        maxLength: 50,
    },

    lastName: {
        type: String,
        default: null,
        minlength: 3,
        maxLength: 50,
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"], // Mümkin bo'lgan qiymatlar
        default: null
    },

    email: {
        type: String,
        default: null,
        minlength: 3,
        maxLength: 700,
    },

    password: {
        type: String,
        required: true,
    },

    interests: [{
        type: Schema.ObjectId, // ObjectId типи
        ref: 'Tags', // 'Tag' моделига ишора
        default: []
    }],

    lastLogin: {
        type: Date,
        default: null,
    },

    isWorker: {
        type: Boolean,
        default: false
    },

    tokenVersion: {
        type: Number,
        default: 1
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const UsersModel = mongoose.model("Users", Users)