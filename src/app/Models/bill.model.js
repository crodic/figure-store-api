const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillSchema = new Schema({
    products: [{
        product: { type: mongoose.Types.ObjectId, ref: "products" },
        count: { type: Number },
        origin: { type: String },
    }],
    status: {
        type: String,
        default: "Processing",
        enum: ["Cancelled", "Processing", "Success"]
    },
    coupon: {
        type: mongoose.Types.ObjectId, ref: "coupons"
    },
    total: Number,
    orderBy: {
        type: mongoose.Types.ObjectId, ref: "users",
    },
})

const BillModel = mongoose.model("bills", BillSchema);

module.exports = BillModel;