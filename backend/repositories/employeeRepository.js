import pool from '../config/db.js'
import AppError from '../utils/appError.js';
import bcrypt from 'bcrypt'

import crypto from 'crypto';
import {
    generatePasswordSetupToken,
    hashPasswordSetupToken
} from '../utils/passwordSetupToken.js';


const getAllEmployees = async (
    page,
    limit,
    search,
    department,
    sortBy,
    order
) => {
    const offset = (page - 1) * limit;
    const searchValue = `%${search || ''}%`;
    const departmentValue = department || '';

    const allowedSortFields = {
        id: 'id',
        name: 'name',
        email: 'email',
        department: 'department',
        salary: 'salary',
        joining_date: 'joining_date'
    };

    const sortColumn = allowedSortFields[sortBy] || 'id';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const result = await pool.query(
        `SELECT * FROM employees
         WHERE (
             name ILIKE $1
             OR email ILIKE $1
             OR CAST(id AS TEXT) ILIKE $1
         )
         AND ($2 = '' OR department = $2)
         ORDER BY ${sortColumn} ${sortOrder}
         LIMIT $3::bigint
         OFFSET $4::bigint`,
        [searchValue, departmentValue, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*) AS total
         FROM employees
         WHERE (
             name ILIKE $1
             OR email ILIKE $1
             OR CAST(id AS TEXT) ILIKE $1
         )
         AND ($2 = '' OR department = $2)`,
        [searchValue, departmentValue]
    );

    return {
        employees: result.rows,
        totalEmployees: Number(countResult.rows[0].total)
    };
};

const getEmployeeStatusCounts = async () => {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (
                WHERE LOWER(status) = 'active'
            ) AS active,
            COUNT(*) FILTER (
                WHERE LOWER(status) = 'inactive'
            ) AS inactive
        FROM employees
    `);

    return {
        totalEmployees: Number(result.rows[0].total),
        activeEmployees: Number(result.rows[0].active),
        inactiveEmployees: Number(result.rows[0].inactive)
    };
};


const getEmployeeById = async (id) => {
    const resultById = await pool.query(
        `SELECT * FROM employees
        WHERE id=$1`, [id]
    )

    return resultById.rows[0]
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
    try {
        const resultEmpAdd = await pool.query(
            `INSERT INTO employees
                (name, email, department, salary, phone, joining_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                name,
                email,
                department,
                salary,
                phone,
                joining_date,
                status
            ]
        );

        return resultEmpAdd.rows[0];
    } catch (error) {
        if (error.code === '23505') {
            throw new AppError('Email already exists', 409);
        }

        throw error;
    }
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create the employee record.
        const employeeResult = await client.query(
            `INSERT INTO employees
                (name, email, department, salary, phone, joining_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                name,
                email,
                department,
                salary,
                phone,
                joining_date,
                status
            ]
        );

        const employee = employeeResult.rows[0];

        // 2. Create a linked user account with a random,
        // unusable password until the employee sets one.
        const temporaryPassword = await bcrypt.hash(
            crypto.randomBytes(32).toString('hex'),
            10
        );

        const userResult = await client.query(
            `INSERT INTO users
    (name, email, password, role, employee_id)
 VALUES ($1, $2, $3, $4, $5)
 RETURNING id`,
            [
                name,
    email,
    temporaryPassword,
    'Employee',
    employee.id
            ]
        );

        const userId = userResult.rows[0].id;

        // 3. Generate and store the one-time setup token hash.
        const token = generatePasswordSetupToken();
        const tokenHash = hashPasswordSetupToken(token);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await client.query(
            `INSERT INTO employee_password_setup_tokens
                (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, tokenHash, expiresAt]
        );

        await client.query('COMMIT');

        // Return the token to the service for link generation.
        return {
            employee,
            userId,
            setupToken: token
        };
    } catch (error) {
        await client.query('ROLLBACK');

        if (error.code === '23505') {
            throw new AppError(
                'An employee or user with this email already exists',
                409
            );
        }

        throw error;
    } finally {
        client.release();
    }
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
  const updatedResult = await pool.query(
    `UPDATE employees
     SET name = $1,
         email = $2,
         department = $3,
         salary = $4,
         phone = $5,
         joining_date = $6,
         status = $7
     WHERE id = $8
     RETURNING *`,
    [
      name,
      email,
      department,
      salary,
      phone,
      joining_date,
      status,
      id
    ]
  );

  return updatedResult.rows[0];
};

const deleteEmployee = async (id) => {
    const deletedResult = await pool.query(
        `DELETE FROM employees
        WHERE id = $1
        RETURNING *`,
        [id]
    )
    return deletedResult.rows[0]
}

export default { getAllEmployees,createEmployeeWithUser,getEmployeeStatusCounts, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };