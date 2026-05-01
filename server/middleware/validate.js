function validateSearchQuery(req, res, next) {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({
            error: 'query field is required and must be a string'
        });
    }

    if (query.trim().length < 3) {
        return res.status(400).json({
            error: 'query must be at least 3 characters'
        });
    }

    if (query.length > 500) {
        return res.status(400).json({
            error: 'query must be under 500 characters'
        });
    }

    req.body.query = query.trim();
    next();
}

module.exports = { validateSearchQuery };