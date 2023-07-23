// Import
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookie = require("cookie-parser");
require("dotenv").config();

// Import file
const Connection = require("./app/Config/db/DBContext");
const UserRouter = require("./app/Routes/user.route");
const { notFound, errorHandler } = require("./app/Middleware/errorHandler");
const ProductRoute = require("./app/Routes/product.route");
const CategoriesRoute = require("./app/Routes/categories.route");
const BlogCategoriesRoute = require("./app/Routes/blogCategories.route");
const BlogRoute = require("./app/Routes/blog.route");

// Config app
const app = express();
const port = process.env.PORT || 1919;

// Config Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));
app.use(cors());
app.use(cookie());

// Connection MongoDB
Connection();

// Routes
app.use("/v1/api/user", UserRouter);
app.use("/v1/api/product", ProductRoute);
app.use("/v1/api/categories", CategoriesRoute);
app.use("/v1/api/blog", BlogCategoriesRoute);
app.use("/v1/api/blogger", BlogRoute);

app.use("*", notFound);
app.use(errorHandler);

// App Start
app.listen(port, () => {
    console.log("Server is running");
})