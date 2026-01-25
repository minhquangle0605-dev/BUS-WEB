const mongoose = require('mongoose');

/**
 * Schema cho Vé điện tử
 * Tương tự như VNeID - có QR code để quét
 */
const TicketSchema = new mongoose.Schema({
    // Người sở hữu vé
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Tuyến đường
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute',
        required: true
    },
    
    // Mã vé (unique)
    ticketCode: {
        type: String,
        required: true,
        unique: true
    },
    
    // QR Code (base64 string)
    qrCode: {
        type: String,
        required: true
    },
    
    // Loại vé
    ticketType: {
        type: String,
        enum: ['single', 'day-pass', 'week-pass', 'month-pass'],
        default: 'single'
    },
    
    // Loại hành khách
    passengerType: {
        type: String,
        enum: ['regular', 'student', 'senior'],
        default: 'regular'
    },
    
    // Giá vé
    price: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Điểm lên xe
    boardingStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusStop'
    },
    
    // Điểm xuống xe
    alightingStop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusStop'
    },
    
    // Thời gian sử dụng
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    
    // Trạng thái vé
    status: {
        type: String,
        enum: ['active', 'used', 'expired', 'cancelled'],
        default: 'active'
    },
    
    // Thời gian sử dụng vé
    usedAt: {
        type: Date
    },
    
    // Thông tin thanh toán
    paymentMethod: {
        type: String,
        enum: ['balance', 'cash', 'card'],
        default: 'balance'
    },
    
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ ticketCode: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);
