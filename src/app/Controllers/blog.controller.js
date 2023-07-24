const BlogModel = require("../Models/blog.model");
const asyncHandler = require("express-async-handler");


const BlogController = {
    create: asyncHandler(async (req, res) => {
        const { title, description, category } = req.body;
        if (!title || !description || !category) return res.status(400).json({ success: false, msg: "Missing Input" })
        const newBlog = new BlogModel(req.body);
        const blog = await newBlog.save();
        if (!blog) return res.status(400).json({ success: false, msg: "Create Blog Failed" })
        return res.status(200).json({ success: blog ? true : "false", blog })
    }),
    getBlogs: asyncHandler(async (req, res) => {
        const blogs = await BlogModel.find();
        return res.status(200).json({ success: true, blogs })
    }),
    updateBlog: asyncHandler(async (req, res) => {
        const { blogId } = req.params;
        if (Object.keys(req.body).length === 0) throw new Error("Missing Input");
        const blog = await BlogModel.findByIdAndUpdate(blogId, req.body, { new: true });
        return res.status(200).json({ success: blog ? true : false, blog })
    }),
    likeBlog: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const { blogId } = req.params;
        if (!blogId) return res.status(400).json({ success: false, msg: "Missing Blog ID" })
        const blog = await BlogModel.findById(blogId);
        const alreadyDisLiked = blog?.disLikes?.find(id => id.toString() === uid);
        if (alreadyDisLiked) {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $pull: { disLikes: uid } }, { new: true });
            return res.status(200).json({ success: true, result: response })
        }
        const isLiked = blog?.likes?.find(id => id.toString() === uid);
        if (isLiked) {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $pull: { likes: uid } }, { new: true });
            return res.status(200).json({ success: true, result: response });
        } else {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $push: { likes: uid } }, { new: true })
            return res.status(200).json({ success: true, result: response });
        }
    }),
    disLikeBlog: asyncHandler(async (req, res) => {
        const { uid } = req.token;
        const { blogId } = req.params;
        if (!blogId) return res.status(400).json({ success: false, msg: "Missing Blog ID" })
        const blog = await BlogModel.findById(blogId);
        const alreadyLiked = blog?.likes?.find(id => id.toString() === uid);
        if (alreadyLiked) {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $pull: { likes: uid } }, { new: true });
            return res.status(200).json({ success: true, result: response })
        }
        const isDisLiked = blog?.disLikes?.find(id => id.toString() === uid);
        if (isDisLiked) {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $pull: { disLikes: uid } }, { new: true });
            return res.status(200).json({ success: true, result: response });
        } else {
            const response = await BlogModel.findByIdAndUpdate(blogId, { $push: { disLikes: uid } }, { new: true })
            return res.status(200).json({ success: true, result: response });
        }
    }),
    getBlog: asyncHandler(async (req, res) => {
        const { blogId } = req.params;
        const blog = await BlogModel.findByIdAndUpdate(blogId, { $inc: { view: 1 } }, { new: true }).populate("likes", "firstname lastname").populate("disLikes", "firstname lastname")
        if (!blog) return res.status(404).json({ success: false, msg: "Blog not found" });

        return res.status(200).json({ success: true, blog })
    }),
    deleteBlog: asyncHandler(async (req, res) => {
        const { blogId } = req.params;
        const blog = await BlogModel.findByIdAndDelete(blogId);
        return res.status(200).json({ success: blog ? true : false, blog: blog ? blog : "Some things went wrong !" })
    }),
    uploadImage: asyncHandler(async (req, res) => {
        const { blogId } = req.params;
        if (!req.file) return res.status(400).json({ success: false, msg: "Missing Images" });
        const response = await BlogModel.findByIdAndUpdate(blogId, { images: req.file.path }, { new: true })
        return res.status(200).json({ success: response ? true : false, blog: response ? response : "Can not upload Images Blog" })
    })
}

module.exports = BlogController;