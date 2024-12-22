export const validateProductCreate = (req, res, next) => {
    try {
        let { name, short_description, description, stock_quantity, price, discount, sale_status, tags, category, color } = req.body;

        if (!name || !short_description || !description || !stock_quantity || !price || !discount || !sale_status  || !category || !color) {
            return res.status(400).json({
                msg: "Information must be entered in full", status: 400
            })
        }

        if (name.length > 50 || name.length < 3) {
            return res.staus(400).json({
                msg: "name must be greater than 3 and less than 50 in length, NON KABOB N1",
                status: 400
            })
        }

        if (color.length > 50 || color.length < 1) {
            return res.staus(400).json({
                msg: "color must be greater than 1 and less than 50 in length",
                status: 400
            })
        }

        if (short_description.length > 500 || short_description.length < 300) {
            return res.status(400).json({ msg: "short_description must be greater than 300 and less than 500 in length" })
        }

        if (description.length > 2000 || description.length < 300) {
            return res.status(400).json({ msg: "description must be greater than 300 and less than 2000 in length" })
        }

        if (typeof stock_quantity !== 'number') {
            return res.status(400).json({ msg: "must be stock_quantity number" })
        }

        if (typeof price !== 'number') {
            return res.status(400).json({ msg: "must be price number" })
        }

        if (typeof discount !== 'number') {
            return res.status(400).json({ msg: "must be discount number" })
        }

        if (typeof sale_status !== 'boolean') {
            return res.status(400).json({ msg: "must be sale_status number" })
        }

        next()
    } catch (error) {
        console.log(error)
    }
}

export const validateProductUpdate = (req, res, next) => {
    try {
        const allowedFields = [
            "name",
            "short_description",
            "description",
            "stock_quantity",
            "sale_status",
            "discount",
            "price",
        ]; // Yangilanadigan maydonlar

        const updates = Object.keys(req.body);

        if (updates.length === 0) {
            return res.status(400).json({
                msg: "No fields provided to update.",
                status: 400,
            });
        }

        const invalidFields = updates.filter(
            (key) => !allowedFields.includes(key)
        );

        if (invalidFields.length) {
            return res.status(400).json({
                msg: `Invalid fields: ${invalidFields.join(", ")}`,
                status: 400,
            });
        }

        // Validatsiyalar
        if (req.body.name) {
            if (req.body.name.length > 50 || req.body.name.length < 3) {
                return res.status(400).json({
                    msg: "name must be between 3 and 50 characters",
                    status: 400,
                });
            }
        }

        if (req.body.short_description) {
            if (
                req.body.short_description.length > 500 ||
                req.body.short_description.length < 50
            ) {
                return res.status(400).json({
                    msg: "short_description must be between 50 and 500 characters",
                    status: 400,
                });
            }
        }

        if (req.body.description) {
            if (req.body.description.length > 2000 || req.body.description.length < 300) {
                return res.status(400).json({
                    msg: "description must be between 300 and 2000 characters",
                    status: 400,
                });
            }
        }

        if (req.body.stock_quantity && typeof req.body.stock_quantity !== 'number') {
            return res.status(400).json({
                msg: "stock_quantity must be a number",
                status: 400,
            });
        }

        if (req.body.discount && typeof req.body.discount !== 'number') {
            return res.status(400).json({
                msg: "discount must be a number",
                status: 400,
            });
        }

        if (req.body.price && typeof req.body.price !== 'number') {
            return res.status(400).json({
                msg: "price must be a number",
                status: 400,
            });
        }

        if (req.body.sale_status && typeof req.body.sale_status !== 'boolean') {
            return res.status(400).json({
                msg: "sale_status must be a boolean",
                status: 400,
            });
        }

        next();
    } catch (error) {
        console.error("Error in validateProductUpdate:", error);
        return res.status(500).json({
            msg: "Internal server error",
        });
    }
};