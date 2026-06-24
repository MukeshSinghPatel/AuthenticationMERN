const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../config/nodemailer');
const { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } = require('../config/emailTemplate');

exports.authRegister = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: 'Missing Details'
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exist"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        })

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // Sending welcome email
        const mailOtpions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to RozgarHub - Your Perfect Job Match Is Here',
            text: `Welcome to RozgarHub website. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOtpions);
        return res.json({
            success: true,
            message: 'User registered successfully'
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

exports.authLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Incomplete credential"
        })
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid email'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: 'Invalid password'
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({
            success: true,
            message: 'User login successfully'
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

exports.authLogout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.json({
            success: true,
            message: 'User logout successfully'
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Send verification OTP to the User's email
exports.sendVerifyOtp = async (req, res) => {

    try {

        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: 'Account already verified'
            });
        }

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        user.verifyOtp = otp;

        user.verifyOtpExpires = Date.now() + 5 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Account Verification OTP',
            // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: 'Verification OTP sent successfully'
        });

    } catch (error) {

        return res.json({
            success: false,
            message: error.message
        });
    }
};

exports.verifyEmail = async (req, res) => {

    const userId = req.userId;

    const { otp } = req.body;

    if (!otp) {
        return res.json({
            success: false,
            message: 'Missing Details'
        });
    }

    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        if (
            user.verifyOtp === '' ||
            user.verifyOtp !== otp
        ) {
            return res.json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.verifyOtpExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'OTP Expired'
            });
        }

        user.isAccountVerified = true;

        user.verifyOtp = '';
        user.verifyOtpExpires = 0;

        await user.save();

        return res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {

        return res.json({
            success: false,
            message: error.message
        });
    }
};

exports.isAuthenticated = async (req, res) => {
    try {
        return res.json({
            success: true
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// send password reset otp
exports.sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: 'Email is required'
        })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            })
        }
        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        user.resetOtp = otp;

        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };
        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,

            message: 'OTP is send to your email'
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Reset user password

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: 'Email, OTP, and new password are required'
        })
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            })
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: 'OTP expired'
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: 'Password has been reset successfully'
        })

    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}