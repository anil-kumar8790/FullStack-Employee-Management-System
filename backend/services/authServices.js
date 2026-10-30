import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import pool from '../config/db.js';
import {hashPasswordSetupToken,generatePasswordSetupToken} from '../utils/passwordSetupToken.js'
import crypto from 'crypto';
import emailService from './emailService.js';


const registerUser = async(name,email,password)=>{
    const hashedPassword = await bcrypt.hash(password,10)

    const user = await userRepository.createUser(name,email,hashedPassword);

    return user;
}

const setEmployeePassword = async (email, newPassword) => {
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.role !== 'Employee') {
        throw new AppError('Only employee passwords can be changed here', 403);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await userRepository.updateUserPassword(
        email,
        hashedPassword
    );
};


const completeEmployeePasswordSetup = async (token, newPassword) => {
    const tokenHash = hashPasswordSetupToken(token);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Lock the token row so it cannot be used twice concurrently.
        const tokenResult = await client.query(
            `SELECT id, user_id
             FROM employee_password_setup_tokens
             WHERE token_hash = $1
               AND expires_at > NOW()
               AND used_at IS NULL
             FOR UPDATE`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            throw new AppError(
                'Invalid, expired, or already-used setup link',
                400
            );
        }

        const setupToken = tokenResult.rows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the linked employee's password.
        const userResult = await client.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2
               AND role = 'Employee'
             RETURNING id, email, role`,
            [hashedPassword, setupToken.user_id]
        );

        if (userResult.rows.length === 0) {
            throw new AppError('Employee account not found', 404);
        }

        // Mark the token as used.
        await client.query(
            `UPDATE employee_password_setup_tokens
             SET used_at = NOW()
             WHERE id = $1`,
            [setupToken.id]
        );

        await client.query('COMMIT');

        return userResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


const changePassword = async (userId, currentPassword, newPassword) => {
    const userResult = await userRepository.getUserById(userId);

    if (!userResult) {
        throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userResult.password
    );

    if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    if (currentPassword === newPassword) {
        throw new AppError(
            'New password must be different from current password',
            400
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await userRepository.updateUserPasswordById(
        userId,
        hashedPassword
    );
};


const forgotPassword = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    console.log('[Forgot Password] Looking up user');

    const user = await userRepository.getUserByEmail(normalizedEmail);

    if (!user) {
        console.log('[Forgot Password] Account not found');
        return;
    }

    const token = generatePasswordSetupToken();
    const tokenHash = hashPasswordSetupToken(token);

    console.log('[Forgot Password] Saving reset token');

    await pool.query(
        `UPDATE employee_password_setup_tokens
         SET used_at = NOW()
         WHERE user_id = $1 AND used_at IS NULL`,
        [user.id]
    );

    await pool.query(
        `INSERT INTO employee_password_setup_tokens
         (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [user.id, tokenHash]
    );

    console.log('[Forgot Password] Sending email');

    await emailService.sendPasswordResetEmail(user.email, token);

    console.log('[Forgot Password] Email sending completed');
};




const resetPassword = async (token, newPassword) => {
    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError('Invalid or expired reset link', 400);
    }

    const tokenHash = hashPasswordSetupToken(token);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const tokenResult = await client.query(
            `SELECT id, user_id
             FROM employee_password_setup_tokens
             WHERE token_hash = $1
               AND expires_at > NOW()
               AND used_at IS NULL
             FOR UPDATE`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            throw new AppError(
                'Invalid, expired, or already-used reset link',
                400
            );
        }

        const resetToken = tokenResult.rows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const userResult = await client.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2
             RETURNING id, name, email, role`,
            [hashedPassword, resetToken.user_id]
        );

        if (userResult.rows.length === 0) {
            throw new AppError('User account not found', 404);
        }

        await client.query(
            `UPDATE employee_password_setup_tokens
             SET used_at = NOW()
             WHERE id = $1`,
            [resetToken.id]
        );

        await client.query('COMMIT');

        return userResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};



const loginUser = async(email,password)=>{
    const userByLogin = await userRepository.getUserByEmail(email)

    if(!userByLogin){
        throw new AppError('Invalid email or password',401)
    }

    const isPasswordValid = await bcrypt.compare(password, userByLogin.password);

    if(!isPasswordValid){
        throw new AppError('Invalid email or password',401)
    }

    const token = jwt.sign({
        user : userByLogin.id,
        email : userByLogin.email,
        role : userByLogin.role

    },
    process.env.JWT_SECRET,{
        expiresIn : '1h'
    }
)

    return {user : userByLogin,token:token}
}

const getProfile = async (userId) => {
    const user = await userRepository.getUserById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Never send the password hash to the frontend.
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

export default {registerUser,loginUser,resetPassword,forgotPassword, setEmployeePassword,completeEmployeePasswordSetup, changePassword, getProfile}