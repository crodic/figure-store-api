const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
}, { timestamps: true })

const CategoriesModel = mongoose.model("categories", CategoriesSchema);
module.exports = CategoriesModel;
