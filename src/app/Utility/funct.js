const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../Config/mail/nodeMailer");

const checkPassword = async (password, hashPassword) => {
    const status = await bcrypt.compare(password, hashPassword);
    return status;
}

const createAccessToken = (uid, role) => {
    const token = jwt.sign({ uid, role }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
    return token;
}

const createRefreshToken = (uid) => {
    const token = jwt.sign({ uid }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "1d" });
    return token;
}

const createResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    return {
        resetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        expiredToken: Date.now() + 15 * 60 * 1000
    };
}

const sendMailUser = (async ({ email, html }) => {
    try {
        const info = await transporter.sendMail({
            from: '"Figure Shop 👻" <no-relply@shopfigure.com>', // => Who Send
            to: email, // => Who Take
            subject: "Đổi Mật Khẩu Tài Khoản Figure Shop ✔", // => Title Mail
            html: html, // => Mail Content
        });
        return info;
    } catch (error) {
        return error;
    }
})

module.exports = { checkPassword, createAccessToken, createRefreshToken, createResetToken, sendMailUser };