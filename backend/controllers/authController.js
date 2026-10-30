import authServices from "../services/authServices.js";

const registerUser = async (req, res, next) => {
    try {

        const { name, email, password } = req.body;

        const user = await authServices.registerUser(name, email, password);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user

        })
    } catch (error) {
        next(error)
    }
}

const setEmployeePassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const user = await authServices.setEmployeePassword(
            email,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: 'Employee password updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};


const completeEmployeePasswordSetup = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Setup token and new password are required'
            });
        }

        if (typeof token !== 'string' ||
            typeof newPassword !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Token and password must be strings'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const user = await authServices.completeEmployeePasswordSetup(
            token,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: 'Password set successfully. You can now log in.',
            data: user
        });
    } catch (error) {
        next(error);
    }
};



const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            typeof confirmPassword !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Password fields must be strings'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirmation do not match'
            });
        }

        const userId = req.user.user;

        const user = await authServices.changePassword(
            userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};



const forgotPassword = async (req, res, next) => {
    try {
        console.log('1. Forgot password request received');

        const { email } = req.body;

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A valid email address is required'
            });
        }

        console.log('2. Calling forgotPassword service');

        await authServices.forgotPassword(email);

        console.log('3. Service completed; sending response');

        res.on('finish', () => {
            console.log('5. HTTP response finished');
        });

        console.log('4. Sending HTTP response');

        return res.status(200).json({
            success: true,
            message:
                'If an account exists for this email, a password reset link will be sent.'
        });
    } catch (error) {
        console.error('Forgot password controller error:', error);
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (
            typeof token !== 'string' ||
            !token.trim() ||
            typeof newPassword !== 'string' ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        await authServices.resetPassword(token, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });
    } catch (error) {
        next(error);
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authServices.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }

        })
    } catch (error) {
        next(error)
    }
}

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.user;

        const user = await authServices.getProfile(userId);

        return res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export default { registerUser, loginUser,resetPassword,forgotPassword, setEmployeePassword, completeEmployeePasswordSetup, changePassword, getProfile };