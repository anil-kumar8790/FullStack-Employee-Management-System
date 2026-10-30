import { body } from "express-validator";

const employeeValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('salary').isNumeric().withMessage('Salary must be number').custom(value=>value>0).withMessage('Salary must be greater than 0'),
    body('phone').optional().isLength({min:10, max:10}).withMessage('Phone Number must be 10 digits'),
    body('joining_date').optional().isISO8601().withMessage('Joining date must be a valid date'),
    body('status')
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive')
];


export default employeeValidation;