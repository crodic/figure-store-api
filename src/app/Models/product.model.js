const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Types.ObjectId,
        ref: "brands",
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId, trim: true, ref: "categories"
    },
    quantity: {
        type: Number,
        default: 0,
    },
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array,
    },
    originProduct: {
        type: String,
        enum: ['JP', 'CN']
    },
    rating: [
        {
            star: { type: Number },
            postedBy: { type: mongoose.Types.ObjectId, ref: "users" },
            comment: { type: String }
        }
    ],
    totalRating: { type: Number, default: 0 }
}, { timestamps: true })

const ProductModel = mongoose.model("products", ProductSchema);
module.exports = ProductModel;