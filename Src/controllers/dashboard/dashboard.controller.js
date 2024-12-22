import { UsersModel } from "../../models/users/users.model.js";
import { OrdersModel } from "../../models/orders/orders.model.js";

export default {
    async getUsersGender(req, res) {
        try {
            // Barcha userlarni olish
            const users = await UsersModel.find();

            // Jinslar bo'yicha statistika hisoblash
            const totalUsers = users.length;

            const maleCount = users.filter(user => user.gender === 'male').length;
            const femaleCount = users.filter(user => user.gender === 'female').length;
            const otherCount = users.filter(user => user.gender === 'other').length;

            // Foizlarni hisoblash
            const malePercentage = (maleCount / totalUsers) * 100;
            const femalePercentage = (femaleCount / totalUsers) * 100;
            const otherPercentage = (otherCount / totalUsers) * 100;

            // Natijani yuborish
            res.json({
                totalUsers,
                maleCount,
                femaleCount,
                otherCount,
                malePercentage: malePercentage.toFixed(2),
                femalePercentage: femalePercentage.toFixed(2),
                otherPercentage: otherPercentage.toFixed(2)
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server xatolik yuz berdi');
        }
    },

    async getOrder(req, res) {
        try {
            // paymentMethodOnline qiymatlariga bo'yicha count olish
            const result = await OrdersModel.aggregate([
                {
                    $group: {
                        _id: '$paymentMethodOnline',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        paymentMethodOnline: '$_id',
                        count: 1
                    }
                }
            ]);

            // Umumiy buyurtmalar soni
            const totalOrders = await OrdersModel.countDocuments();

            // Foizlarni hisoblash
            const stats = result.map(item => ({
                paymentMethodOnline: item.paymentMethodOnline,
                percentage: ((item.count / totalOrders) * 100).toFixed(2) // foizni 2 raqamli aniqlik bilan chiqarish
            }));

            // Natijani jo'natish
            res.json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server xatosi');
        }
    }
}