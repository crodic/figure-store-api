const UserModel = require("../Models/user.model");
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
        res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true })

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
            const response = await UserModel.findOne({ _id: decode.uid });
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
    // LOGOUT V1 (only cookie)
    logout: asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie.refreshToken) {
            return res.status(400).json({ success: false, msg: "Not Refresh Token in Cookie" });
        }

        // Delete Token in database
        await UserModel.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: null });

        // Delete Refresh Token in Cookie
        res.clearCookie("refreshToken", { httpOnly: true, secure: true })
        return res.status(200).json({ success: true, msg: "Logout Successfully" });
    }),
    logoutLocal: asyncHandler(async (req, res) => {
        const token = req.body.token;
        if (!token) {
            return res.status(400).json({ success: false, msg: "Not Refresh Token" });
        }

        // Delete Token in database
        await UserModel.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
        return res.status(200).json({ success: true, msg: "Logout Successfully" });
    }),
    alterPassword: asyncHandler(async (req, res) => {
        const { password, newPassword } = req.body;
        const { uid } = req.token;
        if (!password || !newPassword) return res.status(400).json({ success: false, msg: "Missing Input" });
        const user = await UserModel.findById(uid);
        if (!user) throw new Error("Not found User");
        const check = await checkPassword(password, user.password);
        if (!check) return res.status(404).json({ success: false, msg: "Password is not found" });
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ success: true, msg: "Change Password Successfully", user })
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
    }),
    getUsers: asyncHandler(async (req, res) => {
        const response = await UserModel.find().select('-refreshToken -password -role');
        return res.status(200).json({
            success: response ? true : false,
            results: response,
        })
    }),
    deleteUser: asyncHandler(async (req, res) => {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, msg: "Missing ID" })
        const response = await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ success: response ? true : false, msg: response ? `User with email ${response.email} is delete` : "User not found" });
    }),
    updateUser: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const { role, refreshToken } = req.body;
        if (!uid) return res.status(403).json({ success: false, msg: "Missing ID USER" });
        if (role || refreshToken) return res.status(403).json({ success: false, msg: "You don't have change role" })
        if (Object.keys(req.body).length === 0) throw new Error("Missing Input"); //Object to Array with key
        const user = await UserModel.findByIdAndUpdate(uid, req.body, { new: true }).select("-password -role -refreshToken");
        return res.status(201).json({ success: user ? true : false, msg: user ? "Update User Completed" : "Somethings went wrong", user: user })
    }),
    updateUserByAdmin: asyncHandler(async (req, res) => {
        const { uid } = req.params;
        if (Object.keys(req.body).length === 0) return res.status(400).json({ success: false, msg: "Missing Input" });
        const user = await UserModel.findByIdAndUpdate(uid, req.body, { new: true }).select("-password -role -refreshToken");
        return res.status(201).json({ success: user ? true : false, msg: user ? "Update User Completed" : "Somethings went wrong" })
    }),
    updateAddressUser: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        if (!req.body.address) return res.status(400).json({ success: false, msg: "Missing Input" });
        const user = await UserModel.findByIdAndUpdate(uid, { address: req.body.address }, { new: true }).select("-password -role -refreshToken");
        return res.status(201).json({ success: user ? true : false, user: user ? user : "Somethings went wrong" })
    }),
    addCart: asyncHandler(async (req, res) => {
        try {
            const { uid } = req.token;
            const { pid, quantity } = req.body;
            if (!pid || !quantity) throw new Error("Missing Input");

            const user = await UserModel.findById(uid).select("cart");
            const matchingProducts = user.cart.filter(el => el.product.toString() === pid);

            if (matchingProducts.length > 0) {
                user.cart = user.cart.filter(product => product.product.toString() !== pid);
                user.cart.push({ product: pid, quantity });
            } else {
                user.cart.push({ product: pid, quantity });
            }

            const response = await user.save();
            return res.status(200).json({ success: true, user: response });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }),
    removeProductCart: asyncHandler(async (req, res) => {
        try {
            const { uid } = req.token;
            const { pid } = req.body;
            if (!pid) {
                throw new Error("Product ID is required");
            }
            const user = await UserModel.findById(uid).select("cart");
            const matchingProducts = user.cart.filter(el => el.product.toString() === pid);

            console.log(user.cart);
            if (matchingProducts.length > 0) {
                const index = user.cart.findIndex(prd => prd.product.toString() === pid);
                if (index === -1) {
                    return res.status(404).json({ success: false, msg: "Not find Product in Cart" })
                }
                user.cart.splice(index, 1);
            }
            const response = await user.save();
            return res.status(200).json({ success: true, user: response });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }),
    isBlocked: asyncHandler(async (req, res) => {
        const { uid } = req.params;
        let { status } = req.body;
        if (!status) status = false;
        await UserModel.findByIdAndUpdate(uid, { isBlocked: status }, { new: true });
        return res.status(200).json({ success: true, msg: `User ${uid} is ${status ? "unblocked" : "blocked"}`, status })
    }),
    deleteCartUser: asyncHandler(async (req, res) => {
        const { uid } = req.params;
        const deleteCart = await UserModel.findByIdAndUpdate(uid, { $set: { cart: [] } }, { new: true })
        return res.status(200).json({ success: deleteCart ? true : false, msg: "Delete Cart Completed", user: deleteCart })
    })
}

module.exports = UserController;