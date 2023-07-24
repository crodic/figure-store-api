const CouponModel = require("../Models/coupon.model");
const asyncHandler = require("express-async-handler");


const CouponController = {
    create: asyncHandler(async (req, res) => {
        const { name, discount, expiry } = req.body;
        if (!name || !discount || !expiry) return res.status(400).json({ success: false, msg: "Missing Input" })
        const newCoupon = new CouponModel({
            ...req.body,
            expiry: Date.now() + expiry * 24 * 60 * 60 * 1000
        });
        const coupon = await newCoupon.save();
        if (!coupon) return res.status(400).json({ success: false, msg: "Create Coupon Failed" })
        return res.status(200).json({ success: coupon ? true : "false", coupon })
    }),
    getCoupons: asyncHandler(async (req, res) => {
        const coupons = await CouponModel.find().select("-createdAt -updatedAt");
        return res.status(200).json({ success: true, coupons });
    }),
    getCoupon: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        const coupon = await CouponModel.findById(cid);
        if (!coupon) return res.status(404).json({ success: false, msg: "Coupon not found" });
        return res.status(200).json({ success: coupon ? true : false, coupon });
    }),
    updateCoupon: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        if (Object.keys(req.body).length === 0) throw new Error("Missing Input");
        if (req.body.expiry) req.body.expiry = Date.now() + req.body.expiry * 24 * 60 * 60 * 1000
        const response = await CouponModel.findByIdAndUpdate(cid, req.body, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            msg: response ? "Update Completed" : "Update Failed",
            result: response ? response : "Not Results"
        })
    }),
    deleteCoupon: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        const deleteCoupon = await CouponModel.findByIdAndDelete(cid);
        if (!deleteCoupon) return res.status(404).json({ success: false, msg: "Coupon Not found" });
        return res.status(200).json({ success: deleteCoupon ? true : false, msg: "Delete Coupon Successfully" });
    })
}

module.exports = CouponController;