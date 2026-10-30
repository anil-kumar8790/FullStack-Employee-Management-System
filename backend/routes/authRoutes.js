import express from 'express';
import authController from '../controllers/authController.js';
import { validationResult } from 'express-validator';
import registerValidation from '../middleware/authValidation.js';
import loginValidation from '../middleware/loginValidation.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();

        return next(error);
    }

    next();
};

router.post('/register',registerValidation,validateRequest,authController.registerUser);

router.post('/login',loginValidation,validateRequest, authController.loginUser);


router.post(
    '/forgot-password',
    authController.forgotPassword
);

router.post(
    '/reset-password',
    authController.resetPassword
);

router.put(
    '/set-employee-password',
    authMiddleware,
    roleMiddleware('Admin'),
    authController.setEmployeePassword
);


router.post(
    '/complete-employee-password-setup',
    authController.completeEmployeePasswordSetup
);


router.put(
    '/change-password',
    authMiddleware,
    authController.changePassword
);

// Get the logged-in user's profile
router.get(
    '/profile',
    authMiddleware,
    authController.getProfile
);


export default router;