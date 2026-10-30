
import emailTransporter from '../config/email.js';

const sendPasswordSetupEmail = async (email, token) => {
    const setupUrl =
        `${process.env.FRONTEND_URL}/set-password?token=${encodeURIComponent(token)}`;

    await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Set up your employee account password',
        text: `Welcome! Please use the following link to set your password. This link expires in 15 minutes: ${setupUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to the Employee Management System</h2>
                <p>Your employee account has been created.</p>
                <p>Click the button below to set your password. This link expires in 15 minutes.</p>
                <p>
                    <a href="${setupUrl}"
                       style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
                        Set Your Password
                    </a>
                </p>
                <p>If you weren't expecting this email, you can ignore it.</p>
            </div>
        `
    });
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your Employee Management System password',
        text: `Use this link to reset your password. This link expires in 15 minutes and can only be used once: ${resetUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password.</p>
                <p>This link expires in 15 minutes and can only be used once.</p>
                <p>
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
                        Reset Password
                    </a>
                </p>
                <p>If you did not request a password reset, you can ignore this email.</p>
            </div>
        `
    });
};

export default {
    sendPasswordSetupEmail,
    sendPasswordResetEmail
};
