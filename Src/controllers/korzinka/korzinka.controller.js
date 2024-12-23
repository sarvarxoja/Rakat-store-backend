import moment from "moment-timezone";
import { korzinkaModel } from "../../models/korzinka/korzinka.model.js";
import { productsModel } from "../../models/products/products.model.js";

export default {
    async create(req, res) {
        try {
            if (req.admin) {
                return res.status(404).json({ msg: "dont have your orders", status: 404 })
            }

            let checkKorzinka = await korzinkaModel.findOne({ userId: req.user._id })

            if (checkKorzinka) {
                return res.status(400).json({ msg: "already your cart", status: 400 })
            }

            let createdData = await korzinkaModel.create({
                userId: payload.id, createdAt: moment.tz('Asia/Tashkent').toDate()
            })

            res.status(201).json({ createdData, status: 201 })
        } catch (error) {
            console.log(error.message)
        }
    },

    async addProductKarzinka(req, res) {
        try {
            let { products } = req.body;  // Bodydan kirgan mahsulotlar

            if (req.admin) {
                return res.status(404).json({ msg: "dont have your orders", status: 404 })
            }

            // Foydalanuvchi uchun korzinka mavjudligini tekshirish
            const cart = await korzinkaModel.findOne({ userId: req.user._id });

            if (!cart) {
                return res.status(404).json({ msg: 'Cart not found', status: 404 });
            }

            // Har bir mahsulot uchun tekshirish va kerakli o'zgarishlarni qilish
            for (let product of products) {
                // Yangi mahsulotni kartaga qo'shish yoki mavjud bo'lsa miqdorini oshirish
                const existingProduct = cart.products.find(p => p.productId.toString() === product.productId);

                // Mahsulotni narxini olish
                const productDetails = await productsModel.findById(product.productId);

                if (productDetails.stockQuantity < product.quantity) {
                    return res.status(400).json({
                        "status": 400,
                        "error": "Insufficient stock",
                        "requested_quantity": product.quantity,
                        "available_quantity": productDetails.stockQuantity,
                    })
                }

                if (!productDetails) {
                    return res.status(404).json({ msg: `Product with ID ${product.productId} not found`, status: 404 });
                }

                // Mahsulotning chegirmali narxini olish
                const discountedPrice = productDetails.discountedPrice;

                // Mahsulot narxini miqdor bilan ko'paytirish
                const productPrice = discountedPrice * product.quantity;

                if (existingProduct) {
                    // Agar mahsulot mavjud bo'lsa, miqdorini oshirish va narxni yangilash
                    existingProduct.quantity += product.quantity;
                    existingProduct.price = discountedPrice * existingProduct.quantity;
                } else {
                    // Yangi mahsulotni qo'shish
                    cart.products.push({
                        productId: product.productId,
                        quantity: product.quantity,
                        price: productPrice,
                    });
                }
            }

            // O'zgartirishlarni saqlash
            await cart.save();

            // Javob yuborish
            res.status(200).json({ msg: 'Products updated in cart', cart });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Internal server error', error: error.message });
        }
    },

    async getKorzinkaData(req, res) {
        try {
            if (req.admin) {
                return res.status(404).json({ msg: "dont have your orders", status: 404 })
            }
            
            // Korzinka ma'lumotlarini topish
            let carts = await korzinkaModel.find({ userId: req.user._id })
                .populate('products.productId') // Mahsulotni populate qilish
                .sort({ createdAt: -1 }); // Yangi korzinkalarni birinchi qilib chiqarish

            if (!carts || carts.length === 0) {
                return res.status(404).json({ message: "No cart found for this user" });
            }

            // Har bir korzinka uchun umumiy narxni hisoblash
            carts = carts.map(cart => {
                let totalPrice = 0;
                cart.products.forEach(product => {
                    const productData = product.productId; // Mahsulot ma'lumotlari
                    const priceToUse = productData.discount > 0 ? productData.discountedPrice : productData.price;
                    totalPrice += priceToUse * product.quantity;
                });
                cart.totalPrice = totalPrice; // Umumiy narxni qo'shish
                return cart;
            });

            // Javobni yuborish
            res.status(200).json({ carts, status: 200 });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    async removeProduct(req, res) {
        try {
            const { id } = req.params; // This could be the _id of the product in the cart.

            if (req.admin) {
                return res.status(404).json({ msg: "dont have your orders", status: 404 })
            }
            
            // Find the user's cart
            const cart = await korzinkaModel.findOne({ userId: req.user._id });

            if (!cart) {
                return res.status(404).json({ message: "Cart not found" });
            }

            // Find the product in the cart based on the _id field
            const productIndex = cart.products.findIndex(item => item._id.toString() === id);

            if (productIndex === -1) {
                return res.status(404).json({ message: "Product not found in cart" });
            }

            // Get the product details from the cart
            const product = cart.products[productIndex];

            // Calculate the total price by removing the product's price * quantity
            const productTotalPrice = product.price * product.quantity;
            cart.totalPrice -= productTotalPrice;

            // Remove the product from the cart
            cart.products.splice(productIndex, 1);

            // Save the updated cart
            await cart.save();

            res.status(200).json({ message: "Product removed from cart", updatedCart: cart });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}