const BrandModel = require("../Models/brand.model");
const asyncHandler = require("express-async-handler");

const BrandController = {
    create: asyncHandler(async (req, res) => {
        const newBrand = new BrandModel(req.body);
        await newBrand.save();
        return res.status(200).json({
            success: true,
            brand: newBrand,
        })
    }),
    getBrand: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        const brand = await BrandModel.findById(bid);
        if (!brand) return res.status(404).json({ success: false, msg: "Brand not found" })
        return res.status(200).json({ success: true, brand })
    }),
    getAllBrands: asyncHandler(async (req, res) => {
        const brands = await BrandModel.find();
        return res.status(200).json({ success: true, brands })
    }),
    updateBrand: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        if (!req.body.title) return res.status(400).json({ success: false, msg: "Required Title Attribute Want To Change" })
        const updated = await BrandModel.findByIdAndUpdate(bid, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, msg: "Updated Failed" })
        return res.status(200).json({ success: true, categories: updated ? updated : "Update failed", msg: updated ? "Update Successfully" : "Failed" });
    }),
    deleteBrand: asyncHandler(async (req, res) => {
        const { bid } = req.params;
        const updated = await BrandModel.findByIdAndDelete(bid);
        if (!updated) return res.status(404).json({ success: false, msg: "Deleted Failed" })
        return res.status(200).json({ success: true, categories: updated ? updated : "Deleted Failed", msg: updated ? "Delete Successfully" : "Failed" });
    })
}

module.exports = BrandController;