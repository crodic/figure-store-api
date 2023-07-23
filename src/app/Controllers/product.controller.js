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
        // Tách Các Field Đặc biệt ra khỏi query để không xử lý logic các field này
        const excludeFields = ['limit', 'sort', 'page', 'fields']
        excludeFields.forEach(item => delete query[item]);

        // 1. Filter
        // Format lại các operators cho đúng định dạng
        let queryString = JSON.stringify(query)
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, element => `$${element}`)
        const formatQuery = JSON.parse(queryString);


        // Tìm Theo Title nếu có 1 chữ cũng sẽ ra kết quả
        if (query?.title) formatQuery.title = { $regex: query.title, $options: "i" }
        // Nêú ko tách các field đặc biệt thì tại đây formatQuery sẽ tìm theo điều kiện rác => Không trả về bắt cứ gì
        let queryCommand = ProductModel.find(formatQuery).populate("rating.postedBy"); // populate 1 giá trị object trong 1 array dùng [Array].[Object-Key]


        // 2. Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            queryCommand = queryCommand.sort(sortBy);
        }

        // 3.Limit
        if (req.query.fields) {
            const fieldsBy = req.query.fields.split(",").join(" ");
            queryCommand = queryCommand.select(fieldsBy);
        }

        // 4. Pagination
        // limit: Số document trả về
        // page: Số Trang
        // skip: Số Lượng Phần Tử Bỏ Quả
        const page = +req.query.page || 1;
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);


        const runQuery = await queryCommand.exec()
        const counts = await ProductModel.find(formatQuery).countDocuments();

        return res.status(200).json({
            success: true,
            total: counts,
            page: page,
            total_page: Math.ceil(counts / limit),
            products: runQuery,
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
    }),
    ratting: asyncHandler(async (req, res) => {
        const { star, comment, pid } = req.body;
        const { uid } = req.token;
        if (!star || !pid) return res.status(400).json({ success: false, msg: "Missing Input" });
        const ratingProduct = await ProductModel.findById(pid);
        const alreadyRating = ratingProduct?.rating?.find(element => element.postedBy.toString() === uid);
        if (alreadyRating) {
            // $elemMatch: Dùng để kiểm tra xem trong 1 docs có tồn tại phần tử nào match với nó hay ko. VD: {$elemMatch: "Bandai"}
            // Truy vấn vào 1 object trong 1 phần tử Array khi dùng $set là => rating(object).$(Định dạng rating là Array).star
            // Có thể đọc là truy cập vào Array rating -> Đi vào 1 object match với điều kiện update -> Trỏ vào object đó là lấy giá trị star
            await ProductModel.updateOne({ rating: { $elemMatch: alreadyRating } }, { $set: { "rating.$.star": star, "rating.$.comment": comment } }, { new: true })
        } else {
            await ProductModel.findByIdAndUpdate(pid, { $push: { rating: { star, comment, postedBy: uid } } }, { new: true })
        }

        // Sum rating
        const updateProduct = await ProductModel.findById(pid);
        const ratingCount = updateProduct.rating.length;
        const sumRating = updateProduct.rating.reduce((sum, element) => {
            return sum + +element.star;
        }, 0)
        updateProduct.totalRating = Math.round(sumRating * 10 / ratingCount) / 10
        await updateProduct.save();

        return res.status(200).json({ success: true, msg: "Rating Completed", product: updateProduct })
    })
}

module.exports = ProductController;