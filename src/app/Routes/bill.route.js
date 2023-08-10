const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const BillController = require("../Controllers/bill.controller");
const BillRoute = express.Router();


// POST - CREATE
BillRoute.post("/", authMiddleware.auth, BillController.create);

// PUT - UPDATE STATUS
BillRoute.put("/status/:oid", authMiddleware.auth, authMiddleware.isAdmin, BillController.updateStatus);

// GET BILLS ADMIN
BillRoute.get("/", authMiddleware.auth, authMiddleware.isAdmin, BillController.getBills);

// GET BILLS user
BillRoute.get("/user", authMiddleware.auth, BillController.getBills);

// GET BILL
BillRoute.get("/:uid", authMiddleware.auth, BillController.getBill);

// GET BILL BY ID
BillRoute.get("/detail/:bid", authMiddleware.auth, BillController.getBillById);
module.exports = BillRoute;