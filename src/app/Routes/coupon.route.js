const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const CouponController = require("../Controllers/coupon.controller");
const CouponRoute = express.Router();

// POST - CREATE
CouponRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, CouponController.create);

// GET - COUPONS
CouponRoute.get("/", CouponController.getCoupons);

CouponRoute.get("/find_coupon", CouponController.getCouponByName);

// GET - COUPON
CouponRoute.get("/:cid", CouponController.getCoupon);

// PUT - UPDATE
CouponRoute.put("/:cid", authMiddleware.auth, authMiddleware.isAdmin, CouponController.updateCoupon);

// DELETE 
CouponRoute.delete("/:cid", authMiddleware.auth, authMiddleware.isAdmin, CouponController.deleteCoupon);
module.exports = CouponRoute;