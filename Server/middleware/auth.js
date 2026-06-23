const jwt = require('jsonwebtoken');

exports.authMiddleware = async (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized, Login Again'
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};