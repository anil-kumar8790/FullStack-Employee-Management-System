import express from 'express'
import employeeController from '../controllers/employeeController.js'
import { validationResult } from 'express-validator';
import employeeValidation from '../middleware/employeeValidation.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import paginationValidation from '../middleware/paginationValidation.js';
import departmentValidation from '../middleware/departmentValidation.js';
import sortingValidation from '../middleware/sortingValidation.js';

const router = express.Router();

const validateRequest = (req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        return next(error)
    }
    next()
}

router.get('/',authMiddleware,paginationValidation,departmentValidation,sortingValidation,validateRequest,employeeController.getAllEmployees);

router.get(
    '/me',
    authMiddleware,
    employeeController.getMyProfile
);

router.get(
    '/stats',
    authMiddleware,
    roleMiddleware('Admin'),
    employeeController.getEmployeeStatusCounts
);

router.get('/:id',authMiddleware,roleMiddleware('Admin','Employee'),employeeController.getEmployeeById)

router.post('/',authMiddleware,roleMiddleware('Admin'),employeeValidation,validateRequest,employeeController.createEmployee)

router.put('/:id',authMiddleware,roleMiddleware('Admin'),employeeValidation,validateRequest,employeeController.updateEmployee)

router.delete('/:id',authMiddleware,roleMiddleware('Admin'),employeeController.deleteEmployee)

export default router;