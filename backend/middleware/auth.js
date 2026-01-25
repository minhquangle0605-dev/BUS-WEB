const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware để bảo vệ routes
 * Kiểm tra JWT token trong header
 */
const protect = async (req, res, next) => {
    let token;

    // Kiểm tra xem có token trong Authorization header không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ token (không lấy password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại'
                });
            }

            // Kiểm tra tài khoản có active không
            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản đã bị khóa'
                });
            }

            next(); // Cho phép request tiếp tục
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    }

    // Không có token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
};

/**
 * Helper function: Tạo JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = { protect, generateToken };
