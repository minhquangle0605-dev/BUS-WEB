const mongoose = require('mongoose');
const dotenv = require('dotenv');
const BusRoute = require('./models/BusRoute');
const BusStop = require('./models/BusStop');

dotenv.config();

/**
 * Script này sẽ tạo dữ liệu mẫu cho database
 * Chạy: node seedData.js
 */

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Dữ liệu mẫu - Một số tuyến bus ở Hà Nội
const sampleBusStops = [
    {
        name: 'Bến xe Mỹ Đình',
        stopCode: 'MD001',
        address: { street: 'Phạm Hùng', district: 'Nam Từ Liêm', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.7803, 21.0278] },
        ticketOffice: {
            available: true,
            openingHours: {
                weekday: '05:00 - 22:00',
                weekend: '05:30 - 21:30'
            },
            phoneNumber: '024-1234-5678',
            services: ['Bán vé', 'Nạp thẻ', 'Tư vấn tuyến đường', 'Hỗ trợ người cao tuổi']
        }
    },
    {
        name: 'Bến xe Giáp Bát',
        stopCode: 'GB001',
        address: { street: 'Giải Phóng', district: 'Hoàng Mai', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8405, 20.9817] },
        ticketOffice: {
            available: true,
            openingHours: {
                weekday: '05:00 - 22:30',
                weekend: '05:30 - 22:00'
            },
            phoneNumber: '024-1234-5679',
            services: ['Bán vé', 'Nạp thẻ', 'Tư vấn tuyến đường']
        }
    },
    {
        name: 'Bến xe Yên Nghĩa',
        stopCode: 'YN001',
        address: { street: 'Quốc lộ 6', district: 'Hà Đông', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.7436, 20.9613] },
        ticketOffice: {
            available: true,
            openingHours: {
                weekday: '05:00 - 21:30',
                weekend: '06:00 - 21:00'
            },
            phoneNumber: '024-1234-5680',
            services: ['Bán vé', 'Nạp thẻ']
        }
    },
    {
        name: 'Bến xe Nước Ngầm',
        stopCode: 'NN001',
        address: { street: 'Giải Phóng', district: 'Hoàng Mai', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8456, 20.9989] },
        ticketOffice: {
            available: true,
            openingHours: {
                weekday: '05:30 - 22:00',
                weekend: '06:00 - 21:30'
            },
            phoneNumber: '024-1234-5681',
            services: ['Bán vé', 'Tư vấn']
        }
    },
    {
        name: 'Hồ Gươm',
        stopCode: 'HG001',
        address: { street: 'Lê Thái Tổ', district: 'Hoàn Kiếm', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8525, 21.0285] },
        ticketOffice: {
            available: false
        }
    },
    {
        name: 'Big C Thăng Long',
        stopCode: 'BC001',
        address: { street: 'Đường Láng', district: 'Đống Đa', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8023, 21.0120] },
        ticketOffice: {
            available: false
        }
    },
    {
        name: 'Ngã Tư Sở',
        stopCode: 'NTS001',
        address: { street: 'Nguyễn Lương Bằng', district: 'Đống Đa', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8268, 21.0089] },
        ticketOffice: {
            available: false
        }
    },
    {
        name: 'ĐH Quốc Gia',
        stopCode: 'DHQG001',
        address: { street: 'Xuân Thủy', district: 'Cầu Giấy', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.7899, 21.0388] },
        ticketOffice: {
            available: false
        }
    },
    {
        name: 'Bệnh viện Bạch Mai',
        stopCode: 'BM001',
        address: { street: 'Giải Phóng', district: 'Đống Đa', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8405, 21.0034] },
        ticketOffice: {
            available: false
        }
    },
    {
        name: 'Bưu điện Hà Nội',
        stopCode: 'BD001',
        address: { street: 'Đinh Tiên Hoàng', district: 'Hoàn Kiếm', city: 'Hà Nội' },
        location: { type: 'Point', coordinates: [105.8575, 21.0245] },
        ticketOffice: {
            available: false
        }
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Xóa dữ liệu cũ
        console.log('🗑️  Xóa dữ liệu cũ...');
        await BusStop.deleteMany({});
        await BusRoute.deleteMany({});

        // Tạo bus stops
        console.log('📍 Tạo điểm dừng...');
        const stops = await BusStop.insertMany(sampleBusStops);
        console.log(`✅ Đã tạo ${stops.length} điểm dừng`);

        // Tạo bus routes
        console.log('🚌 Tạo tuyến xe...');
        
        const routes = [
            {
                routeNumber: '01',
                routeName: 'Bến xe Yên Nghĩa - Bến xe Mỹ Đình',
                description: 'Tuyến chạy từ Hà Đông đến Nam Từ Liêm',
                startPoint: {
                    name: stops[2].name,
                    location: stops[2].location
                },
                endPoint: {
                    name: stops[0].name,
                    location: stops[0].location
                },
                busStops: [stops[2]._id, stops[5]._id, stops[7]._id, stops[0]._id],
                pricing: {
                    regularPrice: 7000,
                    studentPrice: 5000,
                    seniorPrice: 3500
                },
                operatingHours: {
                    weekday: { start: '05:00', end: '22:00', frequency: 15 },
                    weekend: { start: '05:30', end: '21:30', frequency: 20 }
                },
                distance: 18.5,
                estimatedDuration: 50,
                color: '#e74c3c'
            },
            {
                routeNumber: '03',
                routeName: 'Bến xe Mỹ Đình - Bến xe Giáp Bát',
                description: 'Tuyến chạy ngang qua trung tâm Hà Nội',
                startPoint: {
                    name: stops[0].name,
                    location: stops[0].location
                },
                endPoint: {
                    name: stops[1].name,
                    location: stops[1].location
                },
                busStops: [stops[0]._id, stops[7]._id, stops[4]._id, stops[6]._id, stops[8]._id, stops[1]._id],
                pricing: {
                    regularPrice: 7000,
                    studentPrice: 5000,
                    seniorPrice: 3500
                },
                operatingHours: {
                    weekday: { start: '05:00', end: '22:30', frequency: 12 },
                    weekend: { start: '05:30', end: '22:00', frequency: 15 }
                },
                distance: 22.3,
                estimatedDuration: 65,
                color: '#3498db'
            },
            {
                routeNumber: '09',
                routeName: 'Bến xe Giáp Bát - Hồ Gươm',
                description: 'Tuyến từ Giáp Bát vào trung tâm',
                startPoint: {
                    name: stops[1].name,
                    location: stops[1].location
                },
                endPoint: {
                    name: stops[4].name,
                    location: stops[4].location
                },
                busStops: [stops[1]._id, stops[8]._id, stops[9]._id, stops[4]._id],
                pricing: {
                    regularPrice: 7000,
                    studentPrice: 5000,
                    seniorPrice: 3500
                },
                operatingHours: {
                    weekday: { start: '05:00', end: '22:00', frequency: 10 },
                    weekend: { start: '06:00', end: '21:30', frequency: 12 }
                },
                distance: 12.5,
                estimatedDuration: 40,
                color: '#2ecc71'
            },
            {
                routeNumber: '14',
                routeName: 'ĐH Quốc Gia - Hồ Gươm',
                description: 'Tuyến phục vụ sinh viên',
                startPoint: {
                    name: stops[7].name,
                    location: stops[7].location
                },
                endPoint: {
                    name: stops[4].name,
                    location: stops[4].location
                },
                busStops: [stops[7]._id, stops[5]._id, stops[6]._id, stops[4]._id],
                pricing: {
                    regularPrice: 7000,
                    studentPrice: 4000,
                    seniorPrice: 3500
                },
                operatingHours: {
                    weekday: { start: '05:30', end: '21:00', frequency: 8 },
                    weekend: { start: '06:00', end: '20:00', frequency: 15 }
                },
                distance: 10.2,
                estimatedDuration: 35,
                color: '#f39c12'
            },
            {
                routeNumber: '22',
                routeName: 'Bến xe Nước Ngầm - Big C Thăng Long',
                description: 'Tuyến ngang qua khu vực Đống Đa',
                startPoint: {
                    name: stops[3].name,
                    location: stops[3].location
                },
                endPoint: {
                    name: stops[5].name,
                    location: stops[5].location
                },
                busStops: [stops[3]._id, stops[6]._id, stops[5]._id],
                pricing: {
                    regularPrice: 7000,
                    studentPrice: 5000,
                    seniorPrice: 3500
                },
                operatingHours: {
                    weekday: { start: '05:00', end: '22:00', frequency: 15 },
                    weekend: { start: '06:00', end: '21:00', frequency: 20 }
                },
                distance: 8.5,
                estimatedDuration: 25,
                color: '#9b59b6'
            }
        ];

        const createdRoutes = await BusRoute.insertMany(routes);
        console.log(`✅ Đã tạo ${createdRoutes.length} tuyến xe`);

        // Update stops với routes
        for (const route of createdRoutes) {
            for (const stopId of route.busStops) {
                await BusStop.findByIdAndUpdate(
                    stopId,
                    { $push: { routes: route._id } }
                );
            }
        }

        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║  ✅ SEED DATA THÀNH CÔNG!                 ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  📍 Điểm dừng: ${stops.length}                           ║`);
        console.log(`║  🚌 Tuyến xe: ${createdRoutes.length}                            ║`);
        console.log('╚════════════════════════════════════════════╝');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
