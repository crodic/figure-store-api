const CategoriesModel = require("../Models/categories.model");
const asyncHandler = require("express-async-handler");

const CategoriesController = {
    create: asyncHandler(async (req, res) => {
        const newCategories = new CategoriesModel(req.body);
        await newCategories.save();
        return res.status(200).json({
            success: true,
            categories: newCategories,
        })
    }),
    getCategories: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        const categories = await CategoriesModel.findById(cid).select("title _id");
        if (!categories) return res.status(404).json({ success: false, msg: "Category not found" })
        return res.status(200).json({ success: true, categories })
    }),
    getAllCategories: asyncHandler(async (req, res) => {
        const categories = await CategoriesModel.find().select("title _id");
        return res.status(200).json({ success: true, categories })
    }),
    updateCategories: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        if (!req.body.title) return res.status(400).json({ success: false, msg: "Required Title Attribute Want To Change" })
        const updated = await CategoriesModel.findByIdAndUpdate(cid, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, msg: "Updated Failed" })
        return res.status(200).json({ success: true, categories: updated ? updated : "Update failed", msg: updated ? "Update Successfully" : "Failed" });
    }),
    deleteCategories: asyncHandler(async (req, res) => {
        const { cid } = req.params;
        const updated = await CategoriesModel.findByIdAndDelete(cid);
        if (!updated) return res.status(404).json({ success: false, msg: "Deleted Failed" })
        return res.status(200).json({ success: true, categories: updated ? updated : "Deleted Failed", msg: updated ? "Delete Successfully" : "Failed" });
    })
}

module.exports = CategoriesController;