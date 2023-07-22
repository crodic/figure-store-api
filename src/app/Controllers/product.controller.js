const { default: slugify } = require("slugify");
const ProductModel = require("../Models/product.model");
const asyncHandler = require("express-async-handler");

const ProductController = {
    create: asyncHandler(async (req, res) => {
        if (Object.keys(req.body).length === 0) return res.status(400).json({ success: false, msg: "Missing Input" });
        if (req.body && req.body.title) req.body.slug = slugify(req.body.title, "-");
        const newProduct = new ProductModel(req.body);
        const response = await newProduct.save();
        return res.status(200).json({
            success: response ? true : false,
            msg: response ? "Create Product Successfully" : "Error Create Product",
            product: response,
        })
    }),
    getProduct: asyncHandler(async (req, res) => {
        const { pid } = req.params;
        const product = await ProductModel.findById(pid);
        return res.status(200).json({
            success: true,
            product: product
        })
    }),
    getProducts: asyncHandler(async (req, res) => {
        const query = { ...req.query };
        // Tách Các Field Đặc biệt ra khỏi query
        const excludeFields = ['limit', 'sort', 'page', 'fields']
        excludeFields.forEach(item => delete query[item]);

        // 1. Filter
        // Format lại các operators cho đúng định dạng
        let queryString = JSON.stringify(query)
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, element => `$${element}`)
        const formatQuery = JSON.parse(queryString);

        if (query?.title) formatQuery.title = { $regex: query.title, $options: "i" }
        let queryCommand = ProductModel.find(formatQuery);


        // 2. Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            queryCommand = queryCommand.sort(sortBy);
        }

        // 3.Limit


        // 4. Pagination

        const runQuery = await queryCommand.exec()
        const counts = await ProductModel.find(formatQuery).countDocuments();

        return res.status(200).json({
            success: true,
            products: runQuery,
            total: counts
        })
    }),
    deleteProduct: asyncHandler(async (req, res) => {
        const { pid } = req.query;
        const deleteProduct = await ProductModel.findByIdAndDelete(pid);
        return res.status(200).json({
            success: deleteProduct ? true : false,
            msg: deleteProduct ? "Delete Product Completed" : "Delete Product Failed"
        })
    }),
    updateProduct: asyncHandler(async (req, res) => {
        const { pid } = req.params;
        if (Object.keys(req.body).length === 0) return res.status(400).json({ success: false, msg: "Missing Input" })
        if (req.body && req.body.title) {
            req.body.slug = slugify(req.body.title, "-");
        }
        const updateProduct = await ProductModel.findByIdAndUpdate(pid, req.body, { new: true })
        return res.status(200).json({
            success: updateProduct ? true : false,
            result: updateProduct ? updateProduct : "Update Failed"
        })
    })
}

module.exports = ProductController;