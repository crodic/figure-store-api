const UserModel = require("../Models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { checkPassword, createAccessToken, createRefreshToken, createResetToken, sendMailUser } = require("../Utility/funct");

const UserController = {
    // REGISTER
    register: asyncHandler(async (req, res) => {
        const { email, password, firstname, lastname } = req.body;
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ success: false, msg: "Missing Field" })
        }

        const user = await UserModel.findOne({ email });
        if (user) throw new Error("Email hash existed!");

        const newUser = new UserModel(req.body);
        const result = await newUser.save();
        return res.status(200).json({
            success: result ? true : false,
            msg: newUser ? "Register Successfully" : "Register Failed",
            user: newUser,
        })
    }),
    // LOGIN
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({
            success: false,
            msg: "Missing Field"
        })

        const response = await UserModel.findOne({ email });
        if (!response) throw new Error("Email not Existed");

        let status = await checkPassword(password, response.password);
        if (!status) throw new Error("Password is not Correct");

        const accessToken = createAccessToken(response._id, response.role);
        const refreshToken = createRefreshToken(response._id);

        response.refreshToken = refreshToken;
        const updateRefreshToken = await response.save();
        if (!updateRefreshToken) throw new Error("Saving Token Failed")

        //Lưu cookie
        res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })

        // Loại bỏ Password và Role Khỏi Data trả về, 
        // userData là biến đã được loại bỏ password, role
        const { password: removePassword, role, refreshToken: token, ...userData } = response.toObject();
        return res.status(200).json({
            success: true,
            msg: "Login Successfully",
            user: userData,
            access_token: accessToken,
            refresh_token: refreshToken,
        })
    }),
    // GET USER
    getUser: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const user = await UserModel.findById(uid).select('-refreshToken -password -role');
        if (!user) throw new Error("User is not exist");
        return res.status(200).json({
            success: true,
            msg: "Get User Successfully",
            user: user,
        })
    }),
    // REFRESH TOKEN V1 (only cookie)
    refreshTokenCookie: asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie && !cookie.refreshToken) throw new Error("No Refresh Token in Cookies");
        // Verify Token
        jwt.verify(cookie.refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, decode) => {
            if (err) return res.status(401).json({ success: false, msg: "Refresh Token Invalid" })
            const { uid } = decode;
            const response = await UserModel.findOne({ _id: uid, refreshToken: cookie.refreshToken })

            if (!response) return res.status(404).json({ success: false, msg: "User not found" })

            const newAccessToken = createAccessToken(response._id, response.role);

            return res.status(200).json({ success: true, msg: "Refresh Token Successfully", access_token: newAccessToken })
        })
    }),
    // REFRESH TOKEN v2 (only local or session)
    refreshTokenLocal: asyncHandler(async (req, res) => {
        const token = req.headers['authorization']?.split(" ")[1];
        if (!token) return res.status(400).json({ success: false, msg: "Required Authentication" });

        jwt.verify(token, process.env.REFRESH_TOKEN_KEY, async (err, decode) => {
            if (err) return res.status(401).json({ success: false, msg: "Token Expired" });
            const response = await UserModel.findOne({ _id: decode.uid, refreshToken: token });
            if (!response) return res.status(404).json({ success: false, msg: "User not found" });

            const newAccessToken = createAccessToken(response._id, response.role);
            const newRefreshToken = createRefreshToken(response._id);

            response.refreshToken = newRefreshToken;
            const saveToken = await response.save();
            if (!saveToken) throw new Error("Save Token Failed");

            res.cookie("refreshToken", newRefreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })

            return res.status(200).json({ success: true, msg: "Refresh Token Successfully", access_token: newAccessToken, refresh_token: newRefreshToken });

        })

    }),
    // LOGOUT
    logout: asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie && !cookie.refreshToken) return res.status(400).json({ success: false, msg: "Not Refresh Token in Cookie" });

        // Delete Token in database
        await UserModel.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: undefined });

        // Delete Refresh Token in Cookie
        res.clearCookie("refreshToken", { httpOnly: true, secure: true })
        return res.status(200).json({ success: true, msg: "Logout Successfully" });
    }),
    // RESET PASSWORD
    resetPassword: asyncHandler(async (req, res) => {
        const { email } = req.query;
        if (!email) throw new Error("Missing Email");
        const user = await UserModel.findOne({ email })
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });
        const objectToken = createResetToken();
        user.passwordResetToken = objectToken.resetToken;
        user.passwordResetExpired = objectToken.expiredToken;
        await user.save();

        const html = `Xin vui lòng bấm vào liên kết sau để đổi 
            mật khẩu đăng nhập. liên kết sẽ hết hạn sau 15 phút kể từ lúc nhận được mail này. 
            <a href="${process.env.URL_SERVER}/v1/api/user/reset_password/${objectToken.resetToken}">Click Here</a>`
        const data = {
            email,
            html
        }

        const result = await sendMailUser(data);
        return res.status(200).json({ success: true, result })
    }),
    // CHANGE PASSWORD WITh RESET TOKEN
    changePassword: asyncHandler(async (req, res) => {
        const { password, token } = req.body;
        if (!password || !token) return res.status(400).json({ success: false, msg: "Missing Field" })
        const user = await UserModel.findOne({ passwordResetToken: token, passwordResetExpired: { $gt: Date.now() } })
        if (!user) return res.status(404).json({ success: false, msg: "Invalid Reset Password Token" });
        user.password = password;
        user.passwordChangeAt = Date.now();
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        const result = await user.save();
        return res.status(200).json({
            success: result ? true : false,
            msg: "Update Password Successfully",
        })
    })
}

module.exports = UserController;