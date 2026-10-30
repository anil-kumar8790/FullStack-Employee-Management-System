
import pool from '../config/db.js';
import {
    generatePasswordSetupToken,
    hashPasswordSetupToken
} from '../utils/passwordSetupToken.js';

const createPasswordSetupToken = async (userId) => {
    const token = generatePasswordSetupToken();
    const tokenHash = hashPasswordSetupToken(token);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
        `INSERT INTO employee_password_setup_tokens
            (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    );

    return token;
};

export default {
    createPasswordSetupToken
};
