const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const { news, token } = req.body

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.news !== news || decoded.userId !== req.user.userId) {
            return res.error(403, "News text or user id does not match token.");
        }
        next();
    } catch (error) {
        next(error)
    }
}