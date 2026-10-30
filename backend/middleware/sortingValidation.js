import { query } from "express-validator";

const sortingValidation = [
    query('sortBy')
    .optional()
    .isIn(['id','name','email','department','salary','joining_date'])
    .withMessage('Invalid sort field'),
    query('order')
    .optional()
    .isIn(['asc','desc'])
    .withMessage('Order must be asc or desc')
];

export default sortingValidation;