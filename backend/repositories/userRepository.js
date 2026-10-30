import pool from "../config/db.js";
import AppError from "../utils/appError.js";

const createUser = async (name, email, password) => {
    try {
        const result = await pool.query(
            `INSERT INTO users
        (name,email,password)
        VALUES ($1,$2,$3)
        RETURNING id,name,email,role,created_at`,
            [name, email, password]
        )

        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') {
            throw new AppError('Email already exists', 409);
        }

        throw error;
    }
}

const updateUserPassword = async (email, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE email = $2
         RETURNING id, name, email, role, employee_id`,
        [hashedPassword, email]
    );

    return result.rows[0];
};


const updateUserPasswordById = async (userId, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2
         RETURNING id, name, email, role`,
        [hashedPassword, userId]
    );

    return result.rows[0];
};


const getUserByEmail = async (email) => {
    const resultByEmail = await pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email]
    )
    return resultByEmail.rows[0];
}


const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT id, name, email, password, role
         FROM users
         WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
};


export default { createUser, getUserByEmail ,getUserById, updateUserPassword, updateUserPasswordById};