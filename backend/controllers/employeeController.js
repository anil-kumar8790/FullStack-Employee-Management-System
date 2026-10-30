import employeeService from "../services/employeeService.js";
import AppError from "../utils/appError.js";
import pool from "../config/db.js";
import emailService from '../services/emailService.js';

const getAllEmployees = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || '';
        const department = req.query.department || '';
        const sortBy = req.query.sortBy || 'id';
        const order = req.query.order || 'asc';

        const employees = await employeeService.getAllEmployees(page, limit, search, department, sortBy, order);
        const totalPages = Math.ceil(
            employees.totalEmployees / limit
        )
        res.status(200).json({
            success: true,
            message: 'Employees fetched successfully',
            data: employees.employees,

            pagination: {
                page,
                limit,
                search,
                department,
                sortBy,
                order,
                totalEmployees: employees.totalEmployees,
                totalPages
            }
        })
    } catch (error) {
        next(error)
    }
}

const getEmployeeStatusCounts = async (req, res, next) => {
    try {
        const counts = await employeeService.getEmployeeStatusCounts();

        res.status(200).json({
            success: true,
            data: counts
        });
    } catch (error) {
        next(error);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const employee = await employeeService.getEmployeeById(id)

        if (!employee) {
            throw new AppError('Employee Not Found', 404)
        }

        return res.status(200).json({
            success: true,
            message: 'Employee fetched successfully',
            data: employee

        })
    } catch (error) {
        next(error)
    }
}

const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.user;

        const result = await pool.query(
            `SELECT e.*
             FROM users u
             INNER JOIN employees e
                 ON e.id = u.employee_id
             WHERE u.id = $1
               AND u.role = 'Employee'`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new AppError('Employee profile not found', 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Employee profile fetched successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};



const createEmployee = async (req, res, next) => {
    try {
        const {
            name,
            email,
            department,
            salary,
            phone,
            joining_date,
            status
        } = req.body;

        const result = await employeeService.createEmployeeWithUser(
            name,
            email,
            department,
            salary,
            phone,
            joining_date,
            status
        );

        let emailSent = true;

        try {
            await emailService.sendPasswordSetupEmail(
                result.employee.email,
                result.setupToken
            );
        } catch (emailError) {
            emailSent = false;
            console.error('Password setup email failed:', emailError.message);
        }

        return res.status(201).json({
            success: true,
            message: emailSent
                ? 'Employee created successfully. Password setup email sent.'
                : 'Employee created successfully, but the setup email could not be sent.',
            data: result.employee,
            emailSent
        });
    } catch (error) {
        next(error);
    }
};


const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            department,
            salary,
            phone,
            joining_date,
            status
        } = req.body;

        const employee = await employeeService.updateEmployee(
            id,
            name,
            email,
            department,
            salary,
            phone,
            joining_date,
            status
        );

        if (!employee) {
            throw new AppError('Employee not found', 404);
        }

        return res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });

    } catch (error) {
        next(error);
    }
};
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedEmp = await employeeService.deleteEmployee(id)

        if (!deletedEmp) {
            throw new AppError('Employee not found', 404)
        }
        return res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
            data: deletedEmp

        })
    } catch (error) {
        next(error)
    }
}
export default { getAllEmployees, getEmployeeStatusCounts, getMyProfile, getEmployeeById, createEmployee, updateEmployee, deleteEmployee }