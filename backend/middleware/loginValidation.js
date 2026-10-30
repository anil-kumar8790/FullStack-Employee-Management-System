import {body} from 'express-validator';

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required').bail().isLength({min:6}).withMessage('Password length must be at least 6 characters')
]

export default loginValidation;