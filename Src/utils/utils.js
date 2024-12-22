import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function comparePassword(rawPassword, hash) {
    try {
        return bcrypt.compareSync(rawPassword, hash);
    } catch (error) {
        console.log(error.message);
    }
}

export async function encodePassword(password) {
    try {
        const SALT = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, SALT);
    } catch (error) {
        console.log(error.message);
    }
}

export async function jwtSign(id, version) {
    try {
        const expiresIn = 15 * 60;
        const SECRET_KEY = process.env.SECRET_KEY;
        let jwtData = jwt.sign({ id: id, version: version }, SECRET_KEY, { expiresIn });

        return jwtData;
    } catch (error) {
        console.log(error.message);
    }
}

export async function jwtRefreshSign(id, version) {
    try {
        const expiresIn = 7 * 24 * 60 * 60;
        const REFRESH_SECRET = process.env.REFRESH_SECRET;
        let jwtData = jwt.sign({ id: id, version: version }, REFRESH_SECRET, { expiresIn });

        return jwtData;
    } catch (error) {
        console.log(error.message);
    }
}