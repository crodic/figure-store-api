const express = require("express");
const CategoriesController = require("../Controllers/categories.controller");
const authMiddleware = require("../Middleware/authMiddleware");
const CategoriesRoute = express.Router();

// POST - CREATE
CategoriesRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, CategoriesController.create);

// GET - ALL CATEGORIES
CategoriesRoute.get("/", CategoriesController.getAllCategories);

// GET - CATEGORIES
CategoriesRoute.get("/:cid", CategoriesController.getCategories);

// PUT - UPDATED
CategoriesRoute.put("/:cid", authMiddleware.auth, authMiddleware.isAdmin, CategoriesController.updateCategories);

// DELETE - DELETED
CategoriesRoute.delete("/:cid", authMiddleware.auth, authMiddleware.isAdmin, CategoriesController.deleteCategories)
module.exports = CategoriesRoute;