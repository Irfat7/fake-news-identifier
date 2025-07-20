module.exports = (req, res, next) => {
    const { news, token } = req.body

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.news !== news) {
            return res.error(403, "News text does not match token.");
        }
        next();
    } catch (error) {
        next(error)
    }
}