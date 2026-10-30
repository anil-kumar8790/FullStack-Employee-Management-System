import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('Access token required', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError('Access token required', 401);
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
        }

        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', 401));
        }

        next(error);
    }
};

export default authMiddleware;