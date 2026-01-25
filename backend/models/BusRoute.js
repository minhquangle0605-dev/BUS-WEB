const mongoose = require('mongoose');

/**
 * Schema cho Tuyến xe bus
 * Chứa thông tin về tuyến đường, giá vé, lịch trình
 */
const BusRouteSchema = new mongoose.Schema({
    // Mã tuyến (VD: 01, 02, 03A, ...)
    routeNumber: {
        type: String,
        required: [true, 'Mã tuyến là bắt buộc'],
        unique: true,
        trim: true
    },
    
    // Tên tuyến (VD: "Bến xe Mỹ Đình - Bến xe Giáp Bát")
    routeName: {
        type: String,
        required: [true, 'Tên tuyến là bắt buộc'],
        trim: true
    },
    
    // Mô tả ngắn về tuyến
    description: {
        type: String,
        trim: true
    },
    
    // Điểm đầu
    startPoint: {
        name: {
            type: String,
            required: true
        },
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
        }
    },
    
    // Điểm cuối
    endPoint: {
        name: {
            type: String,
            required: true
        },
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
        }
    },
    
    // Các điểm dừng trên tuyến (references to BusStop)
    busStops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusStop'
    }],
    
    // Giá vé
    pricing: {
        regularPrice: {
            type: Number,
            required: true,
            min: 0
        },
        studentPrice: {
            type: Number,
            min: 0
        },
        seniorPrice: {
            type: Number,
            min: 0
        }
    },
    
    // Thời gian hoạt động
    operatingHours: {
        weekday: {
            start: String, // "05:00"
            end: String,   // "22:00"
            frequency: Number // phút giữa các chuyến
        },
        weekend: {
            start: String,
            end: String,
            frequency: Number
        }
    },
    
    // Khoảng cách tuyến (km)
    distance: {
        type: Number,
        min: 0
    },
    
    // Thời gian ước tính (phút)
    estimatedDuration: {
        type: Number,
        min: 0
    },
    
    // Trạng thái hoạt động
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Màu sắc tuyến (để hiển thị trên map)
    color: {
        type: String,
        default: '#3498db'
    },
    
    // Thống kê
    totalTrips: {
        type: Number,
        default: 0
    },
    favoriteCount: {
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index cho geospatial queries
BusRouteSchema.index({ 'startPoint.location': '2dsphere' });
BusRouteSchema.index({ 'endPoint.location': '2dsphere' });

// Index cho tìm kiếm
BusRouteSchema.index({ routeNumber: 1 });
BusRouteSchema.index({ routeName: 'text' });

module.exports = mongoose.model('BusRoute', BusRouteSchema);
