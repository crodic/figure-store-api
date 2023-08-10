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

// PUT - UPDATE ADDRESS USER
UserRouter.put("/address", authMiddleware.auth, UserController.updateAddressUser);

//PUT - ADD TO CART
UserRouter.put("/cart", authMiddleware.auth, UserController.addCart);

//PUT - REMOVE TO CART
UserRouter.put("/cart/remove", authMiddleware.auth, UserController.removeProductCart);

//PUT - Alter Password
UserRouter.put("/alter_password", authMiddleware.auth, UserController.alterPassword);

// PUT - DELETE CARD
UserRouter.put("/cart/delete/:uid", authMiddleware.auth, UserController.deleteCartUser);

// PUT - BLOCKED
UserRouter.put("/blocked/:uid", authMiddleware.auth, authMiddleware.isAdmin, UserController.isBlocked);

// PUT - ADMIN USER
UserRouter.put("/:uid", authMiddleware.auth, authMiddleware.isAdmin, UserController.updateUserByAdmin);




module.exports = UserRouter;