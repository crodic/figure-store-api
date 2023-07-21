const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const authMiddleware = {
    auth: asyncHandler(async (req, res, next) => {
        const authorization = req.headers['authorization'];
        if (!authorization) return res.status(403).json({ success: false, msg: "Required Authentication" })
        const token = authorization.split(" ")[1];
        if (!token) return res.status(403).json({ success: true, msg: "Token not exist" });
        jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decode) => {
            if (err) return res.status(401).json({ success: false, msg: "Token Expired" })
            req.token = decode;
            next();
        })
    }),
    isAdmin: asyncHandler(async (req, res, next) => {
        const { role } = req.token;
        if (role !== "admin") return res.status(403).json({ success: false, msg: "Required Admin" })
        next();
    })
}

module.exports = authMiddleware;