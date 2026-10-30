import employeeRepository from '../repositories/employeeRepository.js'

const getAllEmployees = async(page,limit,search,department,sortBy,order)=>{
    return await employeeRepository.getAllEmployees(page,limit,search,department,sortBy,order);
}

const getEmployeeStatusCounts = async () => {
    return await employeeRepository.getEmployeeStatusCounts();
};

const getEmployeeById = async(id)=>{
    const employee = await employeeRepository.getEmployeeById(id);

    if(!employee){
        return null;
    }

    return employee;
}

const createEmployee = async (
    name,
    email,
    department,
    salary,
    phone,
    joining_date,
    status
) => {
    return await employeeRepository.createEmployee(
        name,
        email,
        department,
        salary,
        phone,
        joining_date,
        status
    );
};


const createEmployeeWithUser = async (
    name,
    email,
    department,
    salary,
    phone,
    joining_date,
    status
) => {
    return await employeeRepository.createEmployeeWithUser(
        name,
        email,
        department,
        salary,
        phone,
        joining_date,
        status
    );
};


const updateEmployee = async (
  id,
  name,
  email,
  department,
  salary,
  phone,
  joining_date,
  status
) => {
  return await employeeRepository.updateEmployee(
    id,
    name,
    email,
    department,
    salary,
    phone,
    joining_date,
    status
  );
};

const deleteEmployee = async(id)=>{
    const deletedEmp = await employeeRepository.deleteEmployee(id)

    if(!deletedEmp){
        return null
    }
    return deletedEmp
}

export default {getAllEmployees,getEmployeeStatusCounts,createEmployeeWithUser,getEmployeeById,createEmployee,updateEmployee,deleteEmployee};