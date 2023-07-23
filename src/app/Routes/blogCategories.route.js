const express = require("express");
const BlogCategoriesController = require("../Controllers/blogCategories.controller");
const authMiddleware = require("../Middleware/authMiddleware");
const BlogCategoriesRoute = express.Router();

// POST - CREATE
BlogCategoriesRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, BlogCategoriesController.create);

// GET - ALL CATEGORIES
BlogCategoriesRoute.get("/", BlogCategoriesController.getAllCategories);

// GET - CATEGORIES
BlogCategoriesRoute.get("/:bid", BlogCategoriesController.getCategories);

// PUT - UPDATED
BlogCategoriesRoute.put("/:bid", authMiddleware.auth, authMiddleware.isAdmin, BlogCategoriesController.updateCategories);

// DELETE - DELETED
BlogCategoriesRoute.delete("/:bid", authMiddleware.auth, authMiddleware.isAdmin, BlogCategoriesController.deleteCategories)
module.exports = BlogCategoriesRoute;