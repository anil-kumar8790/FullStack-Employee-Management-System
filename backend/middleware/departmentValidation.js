import {query} from 'express-validator';

const departmentValidation = [
    query('department')
    .optional().
    isIn(['IT','HR','Finance','Development'])
    .withMessage('Invalid department')
]

export default departmentValidation;