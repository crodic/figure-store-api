const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogCategoriesSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
}, { timestamps: true })

const BlogCategoriesModel = mongoose.model("blogCategories", BlogCategoriesSchema);
module.exports = BlogCategoriesModel;