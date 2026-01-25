const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, phoneNumber } = req.body;

        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Tạo user mới
        const user = await User.create({
            email,
            password, // Sẽ được hash tự động bởi User model
            fullName,
            phoneNumber,
            balance: 100000 // Tặng 100k khi đăng ký
        });

        // Tạo JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                balance: user.balance,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        // Tìm user (cần select password vì default là không select)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra tài khoản có active không
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Tạo JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                balance: user.balance,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('favoriteRoutes');

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                avatar: user.avatar,
                balance: user.balance,
                favoriteRoutes: user.favoriteRoutes,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const { fullName, phoneNumber, address, avatar } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (address) updateData.address = address;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật profile thành công',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                avatar: user.avatar,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/topup
 * @desc    Nạp tiền vào tài khoản
 * @access  Private
 */
router.post('/topup', protect, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền không hợp lệ'
            });
        }

        const user = await User.findById(req.user.id);
        user.balance += amount;
        await user.save();

        res.json({
            success: true,
            message: `Nạp ${amount.toLocaleString('vi-VN')}đ thành công`,
            balance: user.balance
        });
    } catch (error) {
        console.error('Topup error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
