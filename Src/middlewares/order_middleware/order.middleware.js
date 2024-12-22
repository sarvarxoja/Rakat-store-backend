export const validateOrderData = async (req, res, next) => {
    try {
        const { productId, paid, paymentMethodOnline, productQuantity, location, sellingPrice } = req.body;

        if (!productId || paid || !paymentMethodOnline || !productQuantity || !location) {
            return res.status(400).json({ error: "the information sent is incomplete", })
        }


        if (typeof paid !== 'boolean') {
            return res.status(400).json({ error: 'Invalid paid field value' });
        }

        if (typeof paymentMethodOnline !== 'boolean') {
            return res.status(400).json({ error: 'Invalid paymentMethodOnline field value' });
        }

        if (!productQuantity || typeof productQuantity !== 'number' || productQuantity <= 0) {
            return res.status(400).json({ error: 'Invalid or missing productQuantity' });
        }

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'Invalid location value' });
        }

        if (!sellingPrice || isNaN(Number(sellingPrice))) {
            return res.status(400).json({ error: 'Invalid or missing sellingPrice' });
        }

        const product = await productsModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (productQuantity > product.stockQuantity) {
            return res.status(400).json({
                error: 'Requested quantity exceeds available stock',
                requested_quantity: productQuantity,
                available_quantity: product.stockQuantity,
            });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
