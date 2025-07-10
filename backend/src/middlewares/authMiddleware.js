const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.token;
    if (!token) return res.error(401, "Authentication required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
};
