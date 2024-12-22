import { Router } from "express";
import { checkUserToken } from "../../tokens/user_token/user.token.js";
import { checkWorkerToken } from "../../tokens/worker_token/worker.token.js";
import notificationController from "../../controllers/notifications/notification.controller.js";
import { checkNotificationCreate } from "../../middlewares/notification/notifications.middleware.js";
import { checkAdminToken } from "../../tokens/admin_token/admin.token.js";

export const notification_router = Router()

notification_router
    .post('/create', checkWorkerToken, checkNotificationCreate, notificationController.create)
    .delete("/delete/:id", checkAdminToken, notificationController.notificationDelete)
    .get('/my', checkUserToken, notificationController.getMyNotifications)
    .get('/notifications/all', notificationController.notificationsAll)
    .get("/get/:id", checkUserToken, notificationController.getById)