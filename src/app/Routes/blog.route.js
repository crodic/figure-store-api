const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const BlogController = require("../Controllers/blog.controller");
const BlogRoute = express.Router();

// POST - CREATE
BlogRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, BlogController.create);

// GET - BLOGS
BlogRoute.get("/", BlogController.getBlogs);

// PUT - LIKE
BlogRoute.put("/like", authMiddleware.auth, BlogController.likeBlog);

// PUT - DISLIKE
BlogRoute.put("/dislike", authMiddleware.auth, BlogController.disLikeBlog);

// PUT - UPDATE
BlogRoute.put("/:blogId", authMiddleware.auth, authMiddleware.isAdmin, BlogController.updateBlog);

module.exports = BlogRoute;
