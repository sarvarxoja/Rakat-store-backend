export const validateName = (req, res, next) => {
    try {
        let { name } = req.body;
        console.log(req.body)

        if (!name) {
            return res.status(400).json({ message: "Name must not be empty" })
        }

        if (name.length > 20 || name.length < 2) {
            return res.status(400).json({ message: "name must be greater than 2 and less than 20 in length" })
        }

        const regex = /[!@#$%^&*()_]/;

        if (name && regex.test(name)) {
            return res.status(400).json({ message: 'Bad Request: `name` contains invalid characters.' });
        }


        next();
    } catch (error) {
        return res.status(500).json({ message: "Error validating user data", error: error.message });
    }
}