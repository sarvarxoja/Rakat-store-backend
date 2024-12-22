import "dotenv/config";

import path from "path";
import cors from 'cors';
import "./config/index.js";

import "./config/redis.js";
import express from "express";
import { fileURLToPath } from "url";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger.js";
import orderController from "./controllers/order/order.controller.js";


import { tags_router } from "./routes/tags/tags.routes.js";
import { auth_router } from "./routes/auth/auth.routes.js";
import { users_router } from "./routes/users/users.routes.js";


import { order_router } from "./routes/order/order.routes.js";
import { adminAuthRouter } from "./routes/auth/admin.routes.js";
import { images_router } from "./routes/images/images.routes.js";


import { checkUserToken } from "./tokens/user_token/user.token.js";
import { comment_router } from "./routes/comments/comments.routes.js";
import { category_router } from "./routes/category/category.routes.js";


import { products_router } from "./routes/products/products.routes.js";
import { korzinka_rotuer } from "./routes/korzinka/korzinka.routes.js";
import { dashboard_routes } from "./routes/dashboard/dashboard.routes.js";


import { checkAdminToken } from "./tokens/admin_token/admin.token.js";
import { checkWorkerToken } from "./tokens/worker_token/worker.token.js";
import { notification_router } from "./routes/notifications/notification.routes.js";



async function starter() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const PORT = process.env.PORT;

        const app = express()
        app.use(express.json())
        app.use(cors());
        let token = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY3NjExNzY0NjAzMDM3YzM5Yzc3MDRiMSJ9.MglM0xBkU8JXz_4t_3mbT61vfdpv1W0cfZSv_t4znxU'

        app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec, {
                requestInterceptor: (req) => {
                    // Tokenni so'rovlar orasida qo'shish
                    req.headers['authorization'] = token;
                    return req;
                },
            })
        );


        app.use('/auth', auth_router);
        app.use('/admin', adminAuthRouter);

        app.use('/cart', checkUserToken, korzinka_rotuer);
        app.use('/dashboard', checkAdminToken, dashboard_routes);

        app.patch("/update/order/:id", checkWorkerToken, orderController.updateOrder)

        app.use('/tags', checkUserToken, tags_router);
        app.use('/users', checkUserToken, users_router);

        app.use('/uploads', images_router);
        app.use('/order', checkUserToken, order_router);

        app.use('/category', category_router);
        app.use('/comments', checkUserToken, comment_router);

        app.use('/products', products_router);
        app.use('/notification', notification_router);

        app.listen(PORT, "192.168.1.4", console.log(`server is running on http://192.168.1.114:${PORT}`))
    } catch (error) {
        console.log(error)
    }
}

starter()