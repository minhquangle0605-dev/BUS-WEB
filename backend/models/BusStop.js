const mongoose = require('mongoose');

/**
 * Schema cho điểm dừng xe bus
 */
const BusStopSchema = new mongoose.Schema({
    // Tên điểm dừng
    name: {
        type: String,
        required: [true, 'Tên điểm dừng là bắt buộc'],
        trim: true
    },
    
    // Mã điểm dừng (unique ID)
    stopCode: {
        type: String,
        unique: true,
        trim: true
    },
    
    // Địa chỉ chi tiết
    address: {
        street: String,
        ward: String,
        district: String,
        city: String
    },
    
    // Vị trí GPS
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    
    // Các tuyến đi qua điểm này
    routes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute'
    }],
    
    // Tiện ích tại điểm dừng
    facilities: {
        hasShelter: { type: Boolean, default: false },
        hasBench: { type: Boolean, default: false },
        hasLighting: { type: Boolean, default: false },
        hasTrashBin: { type: Boolean, default: false }
    },
    
    // Thông tin quầy bán vé
    ticketOffice: {
        available: { type: Boolean, default: false },
        openingHours: {
            weekday: String, // "06:00 - 22:00"
            weekend: String
        },
        phoneNumber: String,
        services: [String] // ["Bán vé", "Nạp thẻ", "Tư vấn"]
    },
    
    // Trạng thái
    isActive: {
        type: Boolean,
        default: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index cho geospatial queries
BusStopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BusStop', BusStopSchema);
