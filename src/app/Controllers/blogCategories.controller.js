const BlogCategoriesModel = require("../Models/blogCategories.model");
const asyncHandler = require("express-async-handler");

const BlogCategoriesController = {
    create: asyncHandler(async (req, res) => {
        const newCategories = new BlogCategoriesModel(req.body);
        await newCategories.save();
        return res.status(200).json({
            success: true,
            blog_categories: newCategories,
        })
    }),
    getCategories: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        const blog_categories = await BlogCategoriesModel.findById(bid).select("title _id");
        if (!blog_categories) return res.status(404).json({ success: false, msg: "Category not found" })
        return res.status(200).json({ success: true, blog_categories })
    }),
    getAllCategories: asyncHandler(async (req, res) => {
        const blog_categories = await BlogCategoriesModel.find().select("title _id");
        return res.status(200).json({ success: true, blog_categories })
    }),
    updateCategories: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        if (!req.body.title) return res.status(400).json({ success: false, msg: "Required Title Attribute Want To Change" })
        const updated = await BlogCategoriesModel.findByIdAndUpdate(bid, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, msg: "Updated Failed" })
        return res.status(200).json({ success: true, blog_categories: updated ? updated : "Update failed", msg: updated ? "Update Successfully" : "Failed" });
    }),
    deleteCategories: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        const updated = await BlogCategoriesModel.findByIdAndDelete(bid);
        if (!updated) return res.status(404).json({ success: false, msg: "Deleted Failed" })
        return res.status(200).json({ success: true, blog_categories: updated ? updated : "Deleted Failed", msg: updated ? "Deleted Successfully" : "Failed" });
    })
}

module.exports = BlogCategoriesController;