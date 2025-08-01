module.exports = (req, res, next) => {
    res.success = (data = {}, status = 200, message = "Success") => {
        return res.status(status).json({
            success: true,
            code: status,
            message,
            data,
        });
    };

    res.error = (status = 500, message = "Something went wrong", error = null) => {
        return res.status(status).json({
            success: false,
            code: status,
            message,
            error,
        });
    };

    next();
};
