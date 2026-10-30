
import departmentService from '../services/departmentService.js';

const getAllDepartments = async (req, res, next) => {
    try {
        const [departments, totalEmployees] = await Promise.all([
            departmentService.getAllDepartments(),
            departmentService.getTotalEmployeeCount()
        ]);

        return res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: departments,
            totalEmployees
        });
    } catch (error) {
        next(error);
    }
};

const createDepartment = async (req, res, next) => {
    try {
        const { name, description, managerId, status } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required',
                errors: []
            });
        }

        if (
            status !== undefined &&
            !['Active', 'Inactive'].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Status must be Active or Inactive',
                errors: []
            });
        }

        if (
            managerId !== undefined &&
            managerId !== null &&
            (!Number.isInteger(Number(managerId)) || Number(managerId) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Manager ID must be a valid employee ID',
                errors: []
            });
        }

        const department = await departmentService.createDepartment({
            name,
            description,
            managerId,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        next(error);
    }
};

const updateDepartment = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID'
            });
        }

        const { name, description, managerId, status } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        if (
            status !== undefined &&
            !['Active', 'Inactive'].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Status must be Active or Inactive'
            });
        }

        if (
            managerId !== undefined &&
            managerId !== null &&
            (!Number.isInteger(Number(managerId)) || Number(managerId) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Manager ID must be a valid employee ID'
            });
        }

        const department = await departmentService.updateDepartment(id, {
            name,
            description,
            managerId,
            status
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        next(error);
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID.',
      });
    }

    const result = await departmentService.deleteDepartment(Number(id));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    console.error('Delete department error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to delete department.',
    });
  }
};

export default {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
