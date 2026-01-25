const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema cho User
 * Chứa thông tin người dùng, authentication và profile
 */
const UserSchema = new mongoose.Schema({
    // Thông tin đăng nhập
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false // Không trả về password khi query
    },
    
    // Thông tin cá nhân
    fullName: {
        type: String,
        required: [true, 'Họ tên là bắt buộc'],
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ (10 chữ số)']
    },
    dateOfBirth: {
        type: Date
    },
    
    // Địa chỉ
    address: {
        street: String,
        ward: String,
        district: String,
        city: String
    },
    
    // Avatar (URL hoặc base64)
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    
    // Số dư tài khoản (cho vé điện tử)
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Tuyến đường yêu thích (references)
    favoriteRoutes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute'
    }],
    
    // Trạng thái tài khoản
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Ngày tạo và cập nhật
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Hash password trước khi save
UserSchema.pre('save', async function(next) {
    // Chỉ hash nếu password được modified
    if (!this.isModified('password')) {
        return next();
    }
    
    // Hash password với bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method: So sánh password khi đăng nhập
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Tính tuổi từ ngày sinh
UserSchema.methods.getAge = function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Method: Kiểm tra có được miễn phí vé không (>60 tuổi)
UserSchema.methods.isEligibleForFreeTicket = function() {
    const age = this.getAge();
    return age !== null && age > 60;
};

// Method: Cập nhật updatedAt
UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', UserSchema);
