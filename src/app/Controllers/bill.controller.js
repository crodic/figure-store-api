const BillModel = require("../Models/bill.model");
const UserModel = require("../Models/user.model");
const CouponModel = require("../Models/coupon.model");
const asyncHandler = require("express-async-handler");

const BillController = {
    create: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const { coupon } = req.body;
        const bill = await UserModel.findById(uid).select("cart address").populate("cart.product", "title price");
        if (!bill) return res.status(404).json({ success: false, msg: "Bill not found" })
        const products = bill.cart?.map(element => ({
            product: element.product._id,
            count: element.quantity,
        }))
        let total = bill.cart?.reduce((sum, element) => element.product.price * element.quantity + sum, 0)
        const createData = { products, total, orderBy: uid };
        if (coupon) {
            const selectCoupon = await CouponModel.findById(coupon);
            if (!selectCoupon) throw new Error("Coupon not found");
            total = Math.round(total * (1 - +selectCoupon?.discount / 100) / 1000) * 1000 || total;
            createData.total = total;
            createData.coupon = coupon
        }
        const newBill = new BillModel(createData)
        await newBill.save();
        return res.status(200).json({ success: bill ? true : false, bill: newBill })
    }),
    updateStatus: asyncHandler(async (req, res) => {
        const { oid } = req.params;
        const { status } = req.body;
        if (!status) throw new Error("Missing Status");
        const response = await BillModel.findByIdAndUpdate(oid, { status }, { new: true })
        return res.status(200).json({ success: response ? true : false, bill: response })
    }),
    getBills: asyncHandler(async (req, res) => {
        const bills = await BillModel.find();
        return res.status(200).json({ success: true, bills })
    }),
    getBill: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const bill = await BillModel.find({ orderBy: uid });
        return res.status(200).json({ success: bill ? true : false, bill })
    }),
    getBillById: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        const bill = await BillModel.findById(bid);
        return res.status(200).json({ success: bill ? true : false, bill });
    })
}

module.exports = BillController;
