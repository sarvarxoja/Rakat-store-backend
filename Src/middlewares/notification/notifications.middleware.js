import { UsersModel } from "../../models/users/users.model.js";

export const checkNotificationCreate = async (req, res, next) => {
    try {
        let { message, userId, forAllUsers } = req.body;

        if (!message) {
            return res.status(400).json({ msg: "message must not be empty", status: 400 })
        }

        if (!userId && !forAllUsers) {
            return res.status(400).json({ msg: "userId or forAllUsers must be empty", status: 400 })
        }

        if (message.length > 500 || message.length < 5) {
            return res.status(400).json({ msg: "message length must be greater than 5 and less than 500", status: 400 })
        }

        if (forAllUsers && (typeof forAllUsers !== Boolean)) {
            return res.status(400).json({ msg: "forAllUsers must be boolean", status: 400 })
        }

        if (userId) {
            let checkUserData = await UsersModel.findOne({ _id: userId })

            if (!checkUserData) {
                return res.status(404).json({ msg: "wrong userId. User not found", status: 404 })
            }
        }

        next()
    } catch (error) {
        console.log(error)
    }
}