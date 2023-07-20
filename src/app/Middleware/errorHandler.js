const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    return res.status(statusCode).json({ success: false, msg: err?.message });
}

module.exports = { notFound, errorHandler };