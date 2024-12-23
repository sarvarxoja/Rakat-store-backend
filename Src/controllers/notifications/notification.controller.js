import jwt from "jsonwebtoken";
import moment from "moment-timezone";

import { UsersModel } from "../../models/users/users.model.js";
import { AdminsModel } from "../../models/admin/admin.model.js";
import { notificationsModel } from "../../models/notifications/notifications.model.js";

export default {
    async create(req, res) {
        try {
            let { message, userId, forAllUsers } = req.body;

            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let createdData = await notificationsModel.create({ message, userId, forAllUsers, createdAt: moment.tz('Asia/Tashkent').toDate(), creator: payload.id })

            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            console.log(error)
        }
    },

    async getMyNotifications(req, res) {
        try {
            const notifications = await notificationsModel.find({
                $or: [
                    { userId: req.admin ? req.admin._id : req.user._id }, // Notifications specifically for the user
                    { forAllUsers: true } // Notifications that are for all users
                ]
            }).sort({ createdAt: -1 });

            const unseenNotifications = notifications.filter(notification => {
                // If the notification is for all users and the user hasn't viewed it
                if (notification.forAllUsers && !notification.views.includes(req.user._id)) {
                    return true;
                }
                // If the notification is specific to the user and the user hasn't viewed it
                if (notification.userId.toString() === req.user._id.toString() && !notification.views.includes(req.user._id)) {
                    return true;
                }
                // Return false if the user has already viewed it
                return false;
            });

            res.status(200).json({ notifications: unseenNotifications, status: 200 })
        } catch (error) {
            console.log(error)
        }
    },

    async getById(req, res) {
        try {
            let { id } = req.params;

            const SECRET_KEY = process.env.SECRET_KEY;
            const tokenHeader = req.headers['authorization'];
            const token = tokenHeader.split(' ')[1];
            const payload = jwt.verify(token, SECRET_KEY)

            let notificationData = await notificationsModel.findOne({ _id: id })

            if (!notificationData) {
                return res.status(404).json({ msg: "Data not found", status: 200 })
            }

            if (req.user && notificationData.forAllUsers === true) {
                if (!notificationData.views.include(req.user._id)) {
                    notificationData.views.push(req.user._id);
                    notificationData.viewsCount = notificationData.views.length;
                    await notificationData.save();
                }
                return res.status(200).json({ notificationData, status: 200 })
            }


            if (req.admin || req.user.isWorker === true) {
                return res.status(200).json({ notificationData, status: 200 })
            }

            if (req.user._id.toString() === notificationData.userId) {
                if (!notificationData.views.include(req.user._id)) {
                    notificationData.views.push(req.user._id);
                    notificationData.viewsCount = notificationData.views.length;
                    await notificationData.save();
                }
                return res.status(200).json({ notificationData, status: 200 })
            }

            res.status(403).json({ error: "Forbidden", status: 403 })
        } catch (error) {
            console.log(error)
        }
    },

    async notificationsAll(req, res) {
        try {
            // Get page and limit from query parameters, with default values
            const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
            const limit = parseInt(req.query.limit) || 10; // Default to 10 notifications per page if not provided

            // Calculate the skip value
            const skip = (page - 1) * limit;

            // Get the notifications with pagination
            let notificationsAll = await notificationsModel.find()
                .sort({ createdAt: -1 })
                .skip(skip) // Skip the results based on the current page
                .limit(limit); // Limit the number of results per page

            // Get total count of notifications for pagination info
            const totalNotifications = await notificationsModel.countDocuments();

            if (!notificationsAll.length) {
                return res.status(404).json({ msg: "Data not found", status: 404 });
            }

            // Respond with the paginated notifications and additional info
            res.status(200).json({
                notificationsAll,
                page,
                limit,
                totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit), // Calculate the total number of pages
                status: 200
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Server error", status: 500 });
        }
    },

    async notificationDelete(req, res) {
        try {
            let { id } = req.params;
            let deletedData = await notificationsModel.findOneAndUpdate({ _id: id })

            if (!deletedData) {
                return res.status(404).json({ msg: "Notification not found", status: 404 })
            }

            res.status(200).json({ deletedData, msg: "Notification successfull deleted", status: 200 })
        } catch (error) {
            console.log(error)
        }
    }
}