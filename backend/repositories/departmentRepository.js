
import pool from '../config/db.js';

const getAllDepartments = async () => {
    const result = await pool.query(`
        SELECT
            d.id,
            d.name,
            d.description,
            d.manager_id,
            manager.name AS manager_name,
            d.status,
            d.created_at,
            d.updated_at,
            COUNT(emp.id)::INTEGER AS employee_count
        FROM departments d
        LEFT JOIN employees manager
            ON manager.id = d.manager_id
        LEFT JOIN employees emp
            ON LOWER(TRIM(emp.department)) = LOWER(TRIM(d.name))
        GROUP BY d.id, manager.name
        ORDER BY d.name ASC
    `);

    return result.rows;
};

const getTotalEmployeeCount = async () => {
    const result = await pool.query(`
        SELECT COUNT(*)::INTEGER AS total_employees
        FROM employees
    `);

    return result.rows[0].total_employees;
};

const createDepartment = async ({
    name,
    description,
    managerId,
    status
}) => {
    const result = await pool.query(
        `INSERT INTO departments
            (name, description, manager_id, status)
         VALUES ($1, $2, $3, $4)
         RETURNING
            id,
            name,
            description,
            manager_id,
            status,
            created_at,
            updated_at`,
        [
            name,
            description || null,
            managerId || null,
            status || 'Active'
        ]
    );

    return result.rows[0];
};

const updateDepartment = async (
    id,
    { name, description, managerId, status }
) => {
    const result = await pool.query(
        `UPDATE departments
         SET name = $1,
             description = $2,
             manager_id = $3,
             status = $4,
             updated_at = NOW()
         WHERE id = $5
         RETURNING
             id,
             name,
             description,
             manager_id,
             status,
             created_at,
             updated_at`,
        [
            name,
            description || null,
            managerId || null,
            status,
            id
        ]
    );

    return result.rows[0] || null;
};

const deleteDepartment = async (id) => {
  const query = `
    DELETE FROM departments
    WHERE id = $1
    RETURNING id;
  `;

  const result = await pool.query(query, [id]);

  return result.rowCount > 0;
};

export default {
    getAllDepartments,
    getTotalEmployeeCount,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
