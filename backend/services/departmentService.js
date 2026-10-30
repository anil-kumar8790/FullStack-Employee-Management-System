import departmentRepository from '../repositories/departmentRepository.js';

const getAllDepartments = async () => {
    return await departmentRepository.getAllDepartments();
};

const getTotalEmployeeCount = async () => {
    return await departmentRepository.getTotalEmployeeCount();
};

const createDepartment = async (departmentData) => {
    const { name, description, managerId, status } = departmentData;

    if (!name || !name.trim()) {
        const error = new Error('Department name is required');
        error.statusCode = 400;
        throw error;
    }

    return await departmentRepository.createDepartment({
        name: name.trim(),
        description: description?.trim() || null,
        managerId: managerId || null,
        status: status || 'Active'
    });
};

const updateDepartment = async (id, departmentData) => {
    const { name, description, managerId, status } = departmentData;

    if (!name || !name.trim()) {
        const error = new Error('Department name is required');
        error.statusCode = 400;
        throw error;
    }

    return await departmentRepository.updateDepartment(id, {
        name: name.trim(),
        description: description?.trim() || null,
        managerId: managerId || null,
        status: status || 'Active'
    });
};

const deleteDepartment = async (id) => {
  return await departmentRepository.deleteDepartment(id);
};

export default {
    getAllDepartments,
    createDepartment,
    getTotalEmployeeCount,
    updateDepartment,
    deleteDepartment
};
