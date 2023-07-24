const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    address: [{
        product: { type: mongoose.Types.ObjectId, ref: "product" },
        count: { type: Number },
        typeProduct: { type: String },
    }],
    status: {
        type: String,
        default: "Processing",
        enum: ["Cancelled", "Processing", "Success"]
    },
    payment: {},
    orderBy: {
        type: mongoose.Types.ObjectId, ref: "users",
    },
})

const BillModel = mongoose.model("address", AddressSchema);

module.exports = BillModel;