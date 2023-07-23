const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const BlogController = require("../Controllers/blog.controller");
const BlogRoute = express.Router();

// POST - CREATE
BlogRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, BlogController.create);

// GET - BLOGS
BlogRoute.get("/", BlogController.getBlogs);

// DELETE - BLOG
BlogRoute.delete("/:blogId", authMiddleware.auth, authMiddleware.isAdmin, BlogController.deleteBlog);

// PUT - LIKE
BlogRoute.put("/like/:blogId", authMiddleware.auth, BlogController.likeBlog);

// PUT - DISLIKE
BlogRoute.put("/dislike/:blogId", authMiddleware.auth, BlogController.disLikeBlog);

// PUT - UPDATE
BlogRoute.put("/:blogId", authMiddleware.auth, authMiddleware.isAdmin, BlogController.updateBlog);

// GET - DETAIL BLOG
BlogRoute.get("/:blogId", BlogController.getBlog);
module.exports = BlogRoute;
