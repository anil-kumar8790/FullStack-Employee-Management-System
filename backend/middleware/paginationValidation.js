import { query } from "express-validator";

const paginationValidation = [
    query('page').optional().isInt({min:1}).withMessage('Page must be positive'),
    query('limit').optional().isInt({min:query,max:100}).withMessage('Limit must be between 1 and 100')
]

export default paginationValidation;