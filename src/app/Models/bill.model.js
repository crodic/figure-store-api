const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillSchema = new Schema({
    products: [{
        product: { type: mongoose.Types.ObjectId, ref: "products" },
        count: { type: Number },
    }],
    status: {
        type: String,
        default: "Chờ Xác Nhận",
        enum: ["Đã Bị Huỷ", "Chờ Xác Nhận", "Thành Công", "Đang Giao Hàng"]
    },
    coupon: {
        type: mongoose.Types.ObjectId, ref: "coupons"
    },
    total: Number,
    orderBy: {
        type: mongoose.Types.ObjectId, ref: "users",
    },
}, { timestamps: true })

const BillModel = mongoose.model("bills", BillSchema);

module.exports = BillModel;