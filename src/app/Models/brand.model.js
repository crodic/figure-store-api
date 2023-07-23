const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    title: { type: String, required: true, unique: true, index: true }
}, { timestamps: true })

const BrandModel = mongoose.model("brands", BrandSchema);
module.exports = BrandModel;