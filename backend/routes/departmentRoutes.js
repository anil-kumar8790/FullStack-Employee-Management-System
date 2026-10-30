
import express from 'express';
import departmentController from '../controllers/departmentController.js';

const router = express.Router();

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Create a department
router.post('/', departmentController.createDepartment);

// Update a department
router.put('/:id', departmentController.updateDepartment);

// Delete a department
router.delete('/:id', departmentController.deleteDepartment);

export default router;
