const express = require("express");
const BrandController = require("../Controllers/brand.controller");
const authMiddleware = require("../Middleware/authMiddleware");
const BrandRoute = express.Router();

// POST - CREATE
BrandRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, BrandController.create);

// GET - ALL CATEGORIES
BrandRoute.get("/", BrandController.getAllBrands);

// GET - CATEGORIES
BrandRoute.get("/:bid", BrandController.getBrand);

// PUT - UPDATED
BrandRoute.put("/:bid", authMiddleware.auth, authMiddleware.isAdmin, BrandController.updateBrand);

// DELETE - DELETED
BrandRoute.delete("/:bid", authMiddleware.auth, authMiddleware.isAdmin, BrandController.deleteBrand)
module.exports = BrandRoute;