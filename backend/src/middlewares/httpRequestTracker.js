const { httpRequestsTotal } = require("../utils/metrics");

module.exports = (req, res, next) => {
    res.once("finish", () => {
        const route = req.route?.path || req.baseUrl || req.path || "unknown";

        httpRequestsTotal.inc({
            route,
            method: req.method,
            status_code: res.statusCode,
        });
    });

    next();
};
