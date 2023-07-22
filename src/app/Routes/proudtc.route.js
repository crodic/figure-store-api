const express = require("express");
const ProductController = require("../Controllers/product.controller");
const authMiddleware = require("../Middleware/authMiddleware");
const ProductRoute = express.Router();

// POST - CREATE PRODUCT
ProductRoute.post("/", authMiddleware.auth, authMiddleware.isAdmin, ProductController.create);

// GET - Products
ProductRoute.get("/", ProductController.getProducts);

// PUT - Update Product
ProductRoute.put("/:pid", authMiddleware.auth, authMiddleware.isAdmin, ProductController.updateProduct);

// GET - Product
ProductRoute.get("/:pid", ProductController.getProduct);

// DELETE - Product
ProductRoute.delete("/", authMiddleware.auth, authMiddleware.isAdmin, ProductController.deleteProduct);


module.exports = ProductRoute;
