
import crypto from 'crypto';

// Generate a secure random token for the password setup link
export const generatePasswordSetupToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Store only the SHA-256 hash of the token in the database
export const hashPasswordSetupToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};
