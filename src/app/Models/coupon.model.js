const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    name: { type: String, required: true, unique: true, index: true },
    discount: { type: Number, required: true },
    expiry: { type: Date, required: true },
}, { timestamps: true })

const CouponModel = mongoose.model("brands", CouponSchema);
module.exports = CouponModel;