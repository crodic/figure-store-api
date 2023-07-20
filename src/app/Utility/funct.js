const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const checkPassword = async (password, hashPassword) => {
    const status = await bcrypt.compare(password, hashPassword);
    return status;
}

const createAccessToken = (uid, role) => {
    const token = jwt.sign({ uid, role }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "30s" });
    return token;
}

const createRefreshToken = (uid) => {
    const token = jwt.sign({ uid }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "15m" });
    return token;
}


module.exports = { checkPassword, createAccessToken, createRefreshToken };