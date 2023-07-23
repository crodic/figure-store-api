const express = require("express");
const UserController = require("../Controllers/user.controller");
const authMiddleware = require("../Middleware/authMiddleware");
const UserRouter = express.Router();

// POST - REGISTER
UserRouter.post("/register", UserController.register);

// POST - LOGIN
UserRouter.post("/login", UserController.login);

// GET - USER
UserRouter.get("/", authMiddleware.auth, UserController.getUser);

// POST - REFRESH TOKEN (Take Token in Cookies and return new access Token)
UserRouter.post("/refresh", UserController.refreshTokenCookie);

// POST - REFRESH TOKEN (Take Token in Local on Headers and return new access Token and new Refresh Token);
UserRouter.post("/refresh_v2", UserController.refreshTokenLocal);

// GET - LOGOUT
UserRouter.get("/logout", UserController.logout)

// GET - RESET PASSWORD
UserRouter.get("/forgot_password", UserController.resetPassword);

// PUT - CHANGE PASSWORD
UserRouter.put("/change_password", UserController.changePassword);

// GET - LIST USER
UserRouter.get("/list", authMiddleware.auth, authMiddleware.isAdmin, UserController.getUsers);

// DELETE - USER
UserRouter.delete("/", authMiddleware.auth, authMiddleware.isAdmin, UserController.deleteUser);

// PUT - USER
UserRouter.put("/", authMiddleware.auth, UserController.updateUser);

// PUT - ADMIN USER
UserRouter.put("/:uid", authMiddleware.auth, authMiddleware.isAdmin, UserController.updateUserByAdmin);

module.exports = UserRouter;